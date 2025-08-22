/**
 * LLM Chat Application Template
 *
 * A simple chat application using Cloudflare Workers AI.
 * This template demonstrates how to implement an LLM-powered chat interface with
 * streaming responses using Server-Sent Events (SSE) and multiple model support.
 *
 * @license MIT
 */
import { Env, ChatMessage, ModelConfig, ChatRequest } from "./types";

// Available models configuration
const MODELS: Record<string, ModelConfig> = {
  // Current default model
  "llama-3.3-70b": {
    id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    name: "Llama 3.3 70B (Fast)",
    description: "High-performance general purpose model",
    contextWindow: 131072,
    maxTokensDefault: 1024,
    maxTokensMax: 4096,
    temperatureDefault: 0.6,
    temperatureMin: 0,
    temperatureMax: 5,
    topPDefault: 0.9,
    topPMin: 0,
    topPMax: 2,
    topKDefault: 40,
    topKMin: 1,
    topKMax: 50,
    supportsTools: true,
    supportsJsonMode: true,
  },
  // Coding specialist models
  "qwen2.5-coder-32b": {
    id: "@cf/qwen/qwen2.5-coder-32b-instruct",
    name: "Qwen2.5 Coder 32B",
    description: "Advanced coding and technical tasks specialist",
    contextWindow: 32768,
    maxTokensDefault: 512,
    maxTokensMax: 2048,
    temperatureDefault: 0.6,
    temperatureMin: 0,
    temperatureMax: 5,
    topPDefault: 0.9,
    topPMin: 0,
    topPMax: 2,
    topKDefault: 40,
    topKMin: 1,
    topKMax: 50,
    supportsTools: true,
    supportsJsonMode: true,
  },
  "deepseek-coder-6.7b": {
    id: "@hf/thebloke/deepseek-coder-6.7b-instruct-awq",
    name: "DeepSeek Coder 6.7B",
    description: "Code generation and programming assistance",
    contextWindow: 4096,
    maxTokensDefault: 256,
    maxTokensMax: 1024,
    temperatureDefault: 0.6,
    temperatureMin: 0,
    temperatureMax: 5,
    topPDefault: 0.9,
    topPMin: 0.001,
    topPMax: 1,
    topKDefault: 40,
    topKMin: 1,
    topKMax: 50,
    supportsTools: true,
    supportsJsonMode: true,
  },
  "hermes-2-pro-7b": {
    id: "@hf/nousresearch/hermes-2-pro-mistral-7b",
    name: "Hermes 2 Pro 7B",
    description: "Function calling and structured output specialist",
    contextWindow: 24000,
    maxTokensDefault: 256,
    maxTokensMax: 1024,
    temperatureDefault: 0.6,
    temperatureMin: 0,
    temperatureMax: 5,
    topPDefault: 0.9,
    topPMin: 0.001,
    topPMax: 1,
    topKDefault: 40,
    topKMin: 1,
    topKMax: 50,
    supportsTools: true,
    supportsJsonMode: true,
  },
};

// Default system prompt
const SYSTEM_PROMPT =
  "You are a helpful, friendly assistant. Provide concise and accurate responses.";

export default {
  /**
   * Main request handler for the Worker
   */
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // Handle static assets (frontend)
    if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
      return env.ASSETS.fetch(request);
    }

    // API Routes
    if (url.pathname === "/api/models") {
      // Handle GET requests for available models
      if (request.method === "GET") {
        return handleModelsRequest();
      }
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/chat") {
      // Handle POST requests for chat
      if (request.method === "POST") {
        return handleChatRequest(request, env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    // Handle 404 for unmatched routes
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;

/**
 * Handles models API requests
 */
function handleModelsRequest(): Response {
  const modelsData = Object.entries(MODELS).map(([key, config]) => ({
    key,
    ...config,
  }));
  
  return new Response(JSON.stringify(modelsData), {
    headers: { "content-type": "application/json" },
  });
}

/**
 * Handles chat API requests
 */
async function handleChatRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  try {
    // Parse JSON request body
    const body = (await request.json()) as ChatRequest;
    const { 
      messages = [], 
      model = "llama-3.3-70b",
      maxTokens,
      temperature,
      topP,
      topK,
      seed,
      repetitionPenalty,
      frequencyPenalty,
      presencePenalty,
    } = body;

    // Get model configuration
    const modelConfig = MODELS[model];
    if (!modelConfig) {
      return new Response(
        JSON.stringify({ error: "Invalid model specified" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
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

    const response = await env.AI.run(
      modelConfig.id,
      aiParams,
      {
        returnRawResponse: true,
        // Uncomment to use AI Gateway
        // gateway: {
        //   id: "YOUR_GATEWAY_ID", // Replace with your AI Gateway ID
        //   skipCache: false,      // Set to true to bypass cache
        //   cacheTtl: 3600,        // Cache time-to-live in seconds
        // },
      },
    );

    // Return streaming response
    return response;
  } catch (error) {
    console.error("Error processing chat request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
