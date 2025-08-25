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

    if (url.pathname === "/api/examples") {
      // Handle GET requests for model capability examples
      if (request.method === "GET") {
        return handleExamplesRequest();
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
 * Handles examples API requests
 */
function handleExamplesRequest(): Response {
  const examples = {
    "qwen2.5-coder-32b": {
      prompts: [
        "Write a Python function to calculate the factorial of a number using recursion",
        "Explain the difference between let, const, and var in JavaScript",
        "Create a SQL query to find the top 5 customers by total order value",
        "Debug this code and explain what's wrong: for i in range(10) print(i)"
      ],
      jsonMode: {
        prompt: "Extract key information from this text as JSON",
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            occupation: { type: "string" },
            skills: { type: "array", items: { type: "string" } }
          }
        }
      }
    },
    "deepseek-coder-6.7b": {
      prompts: [
        "Complete this function: def fibonacci(n):",
        "What's wrong with this loop? while True: print('hello')",
        "Convert this Python code to JavaScript: [x**2 for x in range(10)]",
        "Explain what this regex does: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      ]
    },
    "hermes-2-pro-7b": {
      prompts: [
        "Help me plan a trip to Japan with a $3000 budget",
        "Create a structured response about the solar system",
        "Analyze this data and provide insights in JSON format",
        "What are the main features of blockchain technology?"
      ],
      functionCalling: {
        example: "I need to check the weather and set a reminder",
        tools: [
          {
            type: "function",
            function: {
              name: "get_weather",
              description: "Get current weather for a location",
              parameters: {
                type: "object",
                properties: {
                  location: { type: "string", description: "City name" }
                }
              }
            }
          }
        ]
      }
    },
    "llama-3.3-70b": {
      prompts: [
        "Explain quantum computing to a 10-year-old",
        "Write a short story about time travel",
        "Analyze the economic impacts of renewable energy",
        "Compare and contrast different machine learning algorithms"
      ]
    }
  };

  return new Response(JSON.stringify(examples), {
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
      useJsonMode,
      tools,
      responseFormat,
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

    // Add JSON mode support if requested and supported
    if (useJsonMode && modelConfig.supportsJsonMode) {
      aiParams.response_format = responseFormat || { type: "json_object" };
    }

    // Add tools support if provided and supported
    if (tools && tools.length > 0 && modelConfig.supportsTools) {
      aiParams.tools = tools;
    }

    const response = await env.AI.run(
      // cast to any because generated Ai.run typings expect a keyof AiModels in some setups
      modelConfig.id as any,
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