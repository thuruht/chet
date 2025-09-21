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
        if (!this.state.messages || this.state.messages.length === 0) {
          return new Response(JSON.stringify({ messages: [] }), {
            status: 404,
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

          const response = await this.env.AI.run(modelConfig.id as any, aiParams, { returnRawResponse: true });

          const originalBody = response?.body;
          if (!originalBody) {
            return response;
          }

          const [tee1, tee2] = originalBody.tee();
          let fullResponse = '';
          const reader = tee1.getReader();
          const decoder = new TextDecoder();

          const streamReadPromise = (async () => {
            let buffer = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              for (const line of lines) {
                if (line.trim() === '') continue;
                try {
                  const chunk = JSON.parse(line);
                  if (chunk.response) {
                    fullResponse += chunk.response;
                  }
                } catch (e) {
                  console.error('Failed to parse stream chunk:', e);
                }
              }
            }
            if (buffer.trim() !== '') {
              try {
                const chunk = JSON.parse(buffer);
                if (chunk.response) {
                  fullResponse += chunk.response;
                }
              } catch (e) {
                console.error('Failed to parse final stream chunk:', e);
              }
            }
            const assistantMessage: ChatMessage = { role: 'assistant', content: fullResponse };
            this.setState({ messages: [...messages, assistantMessage] });
          })();

          const headers = new Headers(response.headers);
          headers.set('Content-Type', 'application/x-ndjson');
          return new Response(tee2, { status: response.status, headers });
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
