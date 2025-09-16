import { Ai } from 'cloudflare:workers';

// Define the environment for type safety
interface Env {
  ASSETS: Fetcher;
  AI: Ai;
  CHET_KV: KVNamespace;
}

// Define the structure of a chat message
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Define the expected structure of an incoming request to the /chat endpoint
interface ChatRequest {
  session: string;
  model: string;
  message: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    try {
      // API Route for chat interactions
      if (url.pathname === '/chat') {
        // Handle GET request to fetch session history
        if (request.method === 'GET') {
          const session = url.searchParams.get('session');
          if (!session) {
            return new Response('Session parameter is required', { status: 400 });
          }
          const history = await env.CHET_KV.get<ChatMessage[]>(`session_${session}`, 'json');
          return new Response(JSON.stringify(history || []), {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Handle POST request for a new message
        if (request.method === 'POST') {
          const body: ChatRequest = await request.json();

          if (!body.session || !body.model || !body.message) {
            return new Response('Missing required fields: session, model, message', { status: 400 });
          }

          const sessionKey = `session_${body.session}`;

          // Retrieve existing conversation history from KV
          const storedHistory = await env.CHET_KV.get<ChatMessage[]>(sessionKey, 'json');
          const history: ChatMessage[] = storedHistory || [];

          // Add the new user message to the history
          history.push({ role: 'user', content: body.message });

          const messages: ChatMessage[] = [
            { role: 'system', content: 'You are C.H.E.T., a helpful assistant for technical users. Be concise and clear.' },
            ...history,
          ];

          // Call the selected AI model
          const aiResponse = await env.AI.run(body.model, { messages });
          const assistantResponse = aiResponse.response || "Sorry, I couldn't generate a response.";

          // Add AI's response to history
          history.push({ role: 'assistant', content: assistantResponse });

          // Store the updated history back in KV, fire-and-forget
          ctx.waitUntil(env.CHET_KV.put(sessionKey, JSON.stringify(history)));

          return new Response(assistantResponse);
        }

        return new Response('Method not allowed', { status: 405 });
      }

      // Serve the frontend for all other requests
      return env.ASSETS.fetch(request);

    } catch (e: any) {
      console.error(e.stack);
      return new Response(`An internal error occurred: ${e.message}`, { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
