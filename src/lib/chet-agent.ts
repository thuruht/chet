import { Agent } from 'agents';
import type { Env, ChetAgentState, ChatMessage } from './types.js';
import { MODELS } from './config.js';

const SYSTEM_PROMPT =
  'You are C.H.E.T. (Chat Helper for (almost) Every Task), a helpful and friendly AI assistant. You are designed to assist with a wide variety of tasks and provide concise, accurate, and helpful responses. Always identify yourself as C.H.E.T. when introducing yourself or when asked about your identity.';

/**
 * ChetAgent is an Agent that handles chat interactions.
 */
export class ChetAgent extends Agent<Env, ChetAgentState> {
  // Set the initial state for new agent instances
  initialState: ChetAgentState = {
    messages: [{ role: 'system', content: SYSTEM_PROMPT }],
  };

  async onRequest(request: Request): Promise<Response> {
    switch (request.method) {
      case 'GET': {
        // Return messages, excluding the system prompt
        const history = this.state.messages?.slice(1) || [];
        return new Response(JSON.stringify({ messages: history }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      case 'POST': {
        try {
          const body = await request.json<{ content: string; model?: string; [key: string]: any }>();
          const { content, model = 'llama-3.3-70b', ...params } = body;

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

          const aiParams: any = {
            messages,
            stream: true,
            max_tokens: Math.min(params.maxTokens ?? modelConfig.maxTokensDefault, modelConfig.maxTokensMax),
            ...params,
          };

          const aiResponse = await this.env.AI.run(modelConfig.id as any, aiParams);

          const { readable, writable } = new TransformStream();
          const writer = writable.getWriter();
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();
          let fullResponse = '';

          const pump = async () => {
            const reader = aiResponse.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  break;
                }
                const chunk = decoder.decode(value, { stream: true });
                for (const line of chunk.split('\n')) {
                  if (line.trim().startsWith('data: ')) {
                    const json = line.trim().substring(5).trim();
                    if (json) {
                      try {
                        const parsed = JSON.parse(json);
                        if (parsed.response) {
                          fullResponse += parsed.response;
                          writer.write(encoder.encode(JSON.stringify({ response: parsed.response }) + '\n'));
                        }
                      } catch (e) {
                        console.error('Failed to parse SSE chunk:', e, 'Chunk:', json);
                      }
                    }
                  }
                }
              }
            } catch (e) {
              console.error('Error while reading AI stream:', e);
              writer.write(encoder.encode(JSON.stringify({ error: 'Error processing AI stream' }) + '\n'));
            } finally {
              writer.close();
              const assistantMessage: ChatMessage = { role: 'assistant', content: fullResponse };
              this.setState({ messages: [...messages, assistantMessage] });
            }
          };

          pump();

          return new Response(readable, {
            headers: { 'Content-Type': 'application/x-ndjson' },
          });

        } catch (error) {
          console.error('Error in ChetAgent POST:', error);
          const detail = error && (error as any).message ? (error as any).message : String(error);
          return new Response(JSON.stringify({ error: 'Failed to process request', detail }), {
            status: 500,
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