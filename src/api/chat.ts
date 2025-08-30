import { Hono } from 'hono';
import { AgentManager } from '../lib/agent-manager.js';
import { MODELS, SYSTEM_PROMPT } from '../lib/config.js';
import { parseRequestBody } from '../utils/request-parser.js';
import type { Env, ChatRequest } from '../lib/types.js';

// Create a router for chat endpoints
const chatRouter = new Hono<{ Bindings: Env }>();

/**
 * POST /api/chat - Process chat requests
 */
chatRouter.post('/', async (c) => {
  try {
    const { body, debugInfo } = await parseRequestBody(c.req.raw);
    
    // Debug mode - return parsing diagnostics
    if (c.req.header('x-debug') === '1') {
      return c.json({ 
        ok: true, 
        parsed: body, 
        debug: debugInfo, 
        bindings: {
          hasAI: !!(c.env && c.env.AI),
          hasKV: !!(c.env && c.env.CHET_KV),
          hasASSETS: !!(c.env && c.env.ASSETS),
        }
      });
    }
    
    if (!body) {
      return c.json({ error: 'Invalid request: could not parse body' }, 400);
    }
    
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
    } = body as ChatRequest;
    
    // Basic validation: messages should be an array
    if (!Array.isArray(messages)) {
      console.error('Invalid chat request: messages is not an array', { messages });
      return c.json({ error: 'Invalid request: messages must be an array' }, 400);
    }
    
    // Get model configuration
    const modelConfig = MODELS[model];
    if (!modelConfig) {
      console.error('Invalid model specified in chat request:', model);
      return c.json({ error: `Invalid model specified: ${String(model)}` }, 400);
    }
    
    // Add system prompt if not present
    if (!messages.some((msg) => msg.role === "system")) {
      messages.unshift({ role: "system", content: SYSTEM_PROMPT });
    }
    
    // Build AI request parameters with validation
    const aiParams: any = {
      messages,
      max_tokens: Math.min(
        maxTokens ?? modelConfig.maxTokensDefault, 
        modelConfig.maxTokensMax
      ),
    };
    
    // Add optional parameters with validation
    if (temperature !== undefined) {
      aiParams.temperature = Math.max(
        modelConfig.temperatureMin,
        Math.min(temperature, modelConfig.temperatureMax)
      );
    }
    
    if (topP !== undefined) {
      aiParams.top_p = Math.max(
        modelConfig.topPMin,
        Math.min(topP, modelConfig.topPMax)
      );
    }
    
    if (topK !== undefined) {
      aiParams.top_k = Math.max(
        modelConfig.topKMin,
        Math.min(topK, modelConfig.topKMax)
      );
    }
    
    if (seed !== undefined) {
      aiParams.seed = Math.max(1, Math.min(seed, 9999999999));
    }
    
    if (repetitionPenalty !== undefined) {
      aiParams.repetition_penalty = Math.max(0, Math.min(repetitionPenalty, 2));
    }
    
    if (frequencyPenalty !== undefined) {
      aiParams.frequency_penalty = Math.max(-2, Math.min(frequencyPenalty, 2));
    }
    
    if (presencePenalty !== undefined) {
      aiParams.presence_penalty = Math.max(-2, Math.min(presencePenalty, 2));
    }
    
    // Add JSON mode support if requested and supported
    if (useJsonMode && modelConfig.supportsJsonMode) {
      aiParams.response_format = responseFormat || { type: "json_object" };
    }
    
    // Add tools support if provided and supported
    if (tools && tools.length > 0 && modelConfig.supportsTools) {
      aiParams.tools = tools;
    }
    
    // Use direct AI binding for now, will replace with agents later
    const response = await c.env.AI.run(
      // modelConfig.id may be a string; cast to any to satisfy generated typings for Ai.run
      modelConfig.id as any,
      aiParams,
      {
        returnRawResponse: true,
      },
    );
    
    // Wrap the original streaming response so we can append a final metadata JSON line
    try {
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
              // When original stream ends, enqueue a final metadata JSON line
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
        cancel(reason) {
          try { reader.cancel(); } catch (e) {}
        }
      });
      
      // Copy headers from original response
      const headers = new Headers(response.headers);
      return new Response(stream, { status: response.status, headers });
    } catch (err) {
      console.error('Error wrapping AI response stream for metadata:', err);
      return response;
    }
  } catch (error) {
    console.error("Error processing chat request:", error);
    const detail = error && (error as any).message ? (error as any).message : String(error);
    const stack = error && (error as any).stack ? String((error as any).stack).split('\n').slice(0,5).join('\n') : undefined;
    const payload: any = { error: "Failed to process request", detail };
    if (stack) payload.stack = stack;
    return c.json(payload, 500);
  }
});

export { chatRouter };