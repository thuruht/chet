import { z } from 'zod';

import { Agent } from 'agents';
import type { Env, ChetAgentState, ChatMessage, MCPServer } from './types.js';
import { AGENT_CONFIGS, MODELS } from './config.js';
import { createWorkersAI } from 'workers-ai-provider';
import { streamText, convertToModelMessages } from 'ai';
// Polyfill toDataStreamResponse if it is not exported

import { createCodeTool } from '@cloudflare/codemode/ai';
import { DynamicWorkerExecutor } from '@cloudflare/codemode';

/**
 * ChetAgent is an Agent that handles chat interactions.
 */
export class ChetAgentV2 extends Agent<Env, ChetAgentState> {
  // Set the initial state for new agent instances
  initialState: ChetAgentState = {
    messages: [{ role: 'system', content: AGENT_CONFIGS.DEFAULT.systemPrompt }],
  };

  async onRequest(request: Request): Promise<Response> {
    switch (request.method) {
      case 'GET': {
        if (!this.state.messages || this.state.messages.length <= 1) {
          return new Response(JSON.stringify({ messages: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify(this.state), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      case 'POST': {
        try {
          const body = await request.json<{ content: string; model?: string; [key: string]: any }>();
          const { content, model = AGENT_CONFIGS.DEFAULT.model, ...params } = body;

          if (!content) {
            return new Response(JSON.stringify({ error: 'Invalid request: content is required' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          const userMessage: ChatMessage = { role: 'user', content };
          const messages = [...this.state.messages, userMessage];
          this.setState({ messages });

          const modelConfig = MODELS[model];
          if (!modelConfig) {
            return new Response(JSON.stringify({ error: `Invalid model specified: ${String(model)}` }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          // Create the workers AI provider bound to the current env AI
          const workersai = createWorkersAI({ binding: this.env.AI });

          // Initialize executor for tools if they exist
          let tools: Record<string, any> = {};

          if (this.env.LOADER) {
             const executor = new DynamicWorkerExecutor({
               loader: this.env.LOADER as any,
             });

             // Fetch all MCP Servers from KV and construct their tools
             const { keys } = await this.env.CHET_KV.list({ prefix: "mcpserver:" });

             const mcpTools: Record<string, any> = {};

             for (const key of keys) {
                const serverData = await this.env.CHET_KV.get(key.name, "json") as MCPServer | null;
                if (serverData && serverData.url) {
                    // Create a generic fetch tool for each MCP server
                    // In a production app, this would use openApiMcpServer or full SSE connection
                    const safeName = serverData.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                    mcpTools[`mcp_${safeName}`] = {
                       description: `Access tools from MCP Server: ${serverData.name}`,
                       inputSchema: z.object({ endpoint: z.string().optional(), body: z.any().optional() }),
                       execute: async ({ endpoint = '', body }: any) => {
                          try {
                            const targetUrl = new URL(endpoint, serverData.url).toString();
                            const r = await fetch(targetUrl, {
                               method: body ? 'POST' : 'GET',
                               headers: {
                                  'Content-Type': 'application/json',
                                  ...(serverData.apiKey ? { 'Authorization': `Bearer ${serverData.apiKey}` } : {})
                               },
                               body: body ? JSON.stringify(body) : undefined
                            });
                            return { status: r.status, data: await r.text() };
                          } catch (e: any) {
                            return { error: e.message };
                          }
                       }
                    };
                }
             }

             // We will create a general CodeMode tool with built-in sandbox capabilities
             const codemode = createCodeTool({
               tools: {
                  ...mcpTools,
                  // A tool to fetch URLs
                  // A simple web search tool (using DuckDuckGo HTML as a mock/proxy or standard fetch if we had an API key)
                  webSearch: {
                    description: "Search the web for current information",
                    inputSchema: z.object({ query: z.string() }),
                    execute: async ({ query }: { query: string }) => {
                       try {
                         // Mocking a search API for demonstration without API keys
                         // In a real agentic app, you'd integrate Tavily, Bing, or Serper here.
                         const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
                         const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
                         const text = await r.text();
                         // Extremely basic extraction of snippet texts
                         const snippets = text.match(/<a class="result__snippet[^>]*>(.*?)<\/a>/g);
                         if (snippets) {
                            return { results: snippets.map(s => s.replace(/<[^>]+>/g, '')).slice(0, 5) };
                         }
                         return { results: ["No clear results found, try a different query."] };
                       } catch (e: any) {
                         return { error: e.message };
                       }
                    }
                  },
                  fetchUrl: {
                    description: "Fetch contents of a URL",
                    inputSchema: z.object({ url: z.string() }),
                    execute: async ({ url }: { url: string }) => {
                       try {
                         const r = await fetch(url);
                         return { status: r.status, text: (await r.text()).slice(0, 5000) };
                       } catch (e: any) {
                         return { error: e.message };
                       }
                    }
                  }
               },
               executor,
             });

             tools = { codemode };
          }


          // --- Long-Term Memory (RAG) ---
          // Generate embedding for the user message
          let contextToAdd = "";
          try {
            if (this.env.VECTORIZE) {
               const embeddingResponse = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [content] });
               const embedding = (embeddingResponse as any).data[0];

               // Search Vectorize
               const matches = await this.env.VECTORIZE.query(embedding, { topK: 3 });

               if (matches && matches.matches && matches.matches.length > 0) {
                 // Retrieve the actual text from KV (or metadata)
                 // For this example, assuming text is stored in KV
                 let relevantTexts = [];
                 for (const match of matches.matches) {
                   const pastMsg = await this.env.CHET_KV.get(`memory:${match.id}`);
                   if (pastMsg) relevantTexts.push(pastMsg);
                 }
                 if (relevantTexts.length > 0) {
                    contextToAdd = `\n\nRelevant past context:\n${relevantTexts.join('\n')}`;
                 }
               }

               // Store the new message in background
               this.ctx.waitUntil((async () => {
                 const id = crypto.randomUUID();
                 await this.env.CHET_KV.put(`memory:${id}`, content);
                 await this.env.VECTORIZE.upsert([{ id, values: embedding }]);
               })());
            }
          } catch(e) {
            console.warn("RAG Memory error:", e);
          }

          let finalSystemPrompt = messages[0].role === 'system' ? messages[0].content : undefined;
          if (finalSystemPrompt && contextToAdd) {
             finalSystemPrompt += contextToAdd;
          } else if (contextToAdd) {
             finalSystemPrompt = contextToAdd;
          }
          // --- End Long-Term Memory ---

          const maxTokens = Math.min(params.maxTokens ?? modelConfig.maxTokensDefault, modelConfig.maxTokensMax);

          // Vercel AI SDK streamText returns standard web standard streams
          const result = streamText({
            model: workersai(modelConfig.id),
            system: finalSystemPrompt,
            messages: messages.filter((m: any) => m.role !== 'system').map((m: any) => ({ role: m.role, content: m.content })),


            tools: Object.keys(tools).length > 0 ? tools : undefined,
            onFinish: async ({ text, toolCalls, toolResults, finishReason, usage }) => {
              const assistantMessage: ChatMessage = { role: 'assistant', content: text };
              this.setState({ messages: [...messages, assistantMessage] });
            }
          });

          return result.toTextStreamResponse();

        } catch (error: any) {
          console.error('Error in ChetAgent POST:', error);

          let status = 500;
          let detail = error?.message || String(error);

          // Check for Cloudflare specific error properties
          if (error?.status || error?.statusCode) {
             status = error.status || error.statusCode;
          }
          if (error?.details) {
             detail += ` - ${JSON.stringify(error.details)}`;
          }

          return new Response(JSON.stringify({
            error: 'Failed to process request',
            detail,
            isAiError: !!error?.statusCode
          }), {
            status,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      case 'DELETE': {
        this.setState(this.initialState);
        return new Response(null, { status: 204 });
      }

      default:
        return new Response('Method Not Allowed', { status: 405 });
    }
  }
}
