import { Agent } from 'agents';
import type { Env, ChatRequest } from './types.js';
import { MODELS, SYSTEM_PROMPT } from './config.js';

/**
 * ChetAgent is an Agent that handles chat interactions.
 */
export class ChetAgent extends Agent<Env> {
  /**
   * Handles incoming HTTP requests to the agent.
   * @param request The incoming request.
   * @returns A streaming response with the AI's chat completion.
   */
  async onRequest(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const body = await request.json<ChatRequest>();

      const {
        messages = [],
        model = 'llama-3.3-70b',
        maxTokens,
        temperature,
        topP,
        topK,
        seed,
        repetitionPenalty,
        frequencyPenalty,
        presencePenalty,
        useJsonMode,
        tools,
        responseFormat,
      } = body;

      if (!Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: 'Invalid request: messages must be an array' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      const modelConfig = MODELS[model];
      if (!modelConfig) {
        return new Response(JSON.stringify({ error: `Invalid model specified: ${String(model)}` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }

      if (!messages.some((msg) => msg.role === "system")) {
        messages.unshift({ role: "system", content: SYSTEM_PROMPT });
      }

      const aiParams: any = {
        messages,
        stream: true,
        max_tokens: Math.min(
          maxTokens ?? modelConfig.maxTokensDefault,
          modelConfig.maxTokensMax
        ),
      };

      if (temperature !== undefined) aiParams.temperature = Math.max(modelConfig.temperatureMin, Math.min(temperature, modelConfig.temperatureMax));
      if (topP !== undefined) aiParams.top_p = Math.max(modelConfig.topPMin, Math.min(topP, modelConfig.topPMax));
      if (topK !== undefined) aiParams.top_k = Math.max(modelConfig.topKMin, Math.min(topK, modelConfig.topKMax));
      if (seed !== undefined) aiParams.seed = Math.max(1, Math.min(seed, 9999999999));
      if (repetitionPenalty !== undefined) aiParams.repetition_penalty = Math.max(0, Math.min(repetitionPenalty, 2));
      if (frequencyPenalty !== undefined) aiParams.frequency_penalty = Math.max(-2, Math.min(frequencyPenalty, 2));
      if (presencePenalty !== undefined) aiParams.presence_penalty = Math.max(-2, Math.min(presencePenalty, 2));
      if (useJsonMode && modelConfig.supportsJsonMode) aiParams.response_format = responseFormat || { type: "json_object" };
      if (tools && tools.length > 0 && modelConfig.supportsTools) aiParams.tools = tools;

      const response = await this.env.AI.run(
        modelConfig.id as any,
        aiParams,
        { returnRawResponse: true }
      );

      const originalBody = response?.body;
      if (!originalBody) {
        return response;
      }

      const reader = originalBody.getReader();
      const stream = new ReadableStream({
        async pull(controller) {
          try {
            const { done, value } = await reader.read();
            if (done) {
              const meta = JSON.stringify({ meta: { modelKey: model, modelId: modelConfig.id, params: {
                maxTokens: aiParams.max_tokens,
                temperature: aiParams.temperature,
                top_p: aiParams.top_p,
                top_k: aiParams.top_k,
              } } }) + "\n";
              controller.enqueue(new TextEncoder().encode(meta));
              controller.close();
              return;
            }
            controller.enqueue(value);
          } catch (err) {
            controller.error(err);
          }
        },
        cancel() {
          try { reader.cancel(); } catch (e) {}
        }
      });

      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'application/x-ndjson');
      return new Response(stream, { status: response.status, headers });

    } catch (error) {
      console.error("Error in ChetAgent:", error);
      const detail = error && (error as any).message ? (error as any).message : String(error);
      return new Response(JSON.stringify({ error: "Failed to process request", detail }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }
}
