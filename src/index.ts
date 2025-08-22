/**
 * LLM Chat Application Template
 *
 * A simple chat application using Cloudflare Workers AI.
 * This template demonstrates how to implement an LLM-powered chat interface with
 * streaming responses using Server-Sent Events (SSE) and multiple model support.
 *
 * @license MIT
 */
import { Env, ChatMessage, ModelConfig, ChatRequest, SavedPrompt, MCPServer, FileSaveRequest } from "./types";

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

    if (url.pathname === "/api/prompts") {
      // Handle CRUD operations for saved prompts
      if (request.method === "GET") {
        return handleGetPrompts(env);
      }
      if (request.method === "POST") {
        return handleCreatePrompt(request, env);
      }
      if (request.method === "PUT") {
        return handleUpdatePrompt(request, env);
      }
      if (request.method === "DELETE") {
        return handleDeletePrompt(request, env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/mcp-servers") {
      // Handle CRUD operations for MCP servers
      if (request.method === "GET") {
        return handleGetMCPServers(env);
      }
      if (request.method === "POST") {
        return handleCreateMCPServer(request, env);
      }
      if (request.method === "PUT") {
        return handleUpdateMCPServer(request, env);
      }
      if (request.method === "DELETE") {
        return handleDeleteMCPServer(request, env);
      }
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/api/save-file") {
      // Handle file save requests
      if (request.method === "POST") {
        return handleSaveFile(request, env);
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

/**
 * Handles GET requests for saved prompts
 */
async function handleGetPrompts(env: Env): Promise<Response> {
  try {
    const { keys } = await env.CHAT_STORE.list({ prefix: "prompt:" });
    const prompts: SavedPrompt[] = [];

    for (const key of keys) {
      const promptData = await env.CHAT_STORE.get(key.name, "json");
      if (promptData) {
        prompts.push(promptData as SavedPrompt);
      }
    }

    return new Response(JSON.stringify({ prompts }), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch prompts" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

/**
 * Handles POST requests to create a new saved prompt
 */
async function handleCreatePrompt(request: Request, env: Env): Promise<Response> {
  try {
    const { name, content, tags } = await request.json() as { name: string; content: string; tags: string[] };
    
    if (!name || !content) {
      return new Response(JSON.stringify({ error: "Name and content are required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const prompt: SavedPrompt = {
      id: crypto.randomUUID(),
      name,
      content,
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await env.CHAT_STORE.put(`prompt:${prompt.id}`, JSON.stringify(prompt));

    return new Response(JSON.stringify({ prompt }), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return new Response(JSON.stringify({ error: "Failed to create prompt" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

/**
 * Handles PUT requests to update a saved prompt
 */
async function handleUpdatePrompt(request: Request, env: Env): Promise<Response> {
  try {
    const { id, name, content, tags } = await request.json() as { id: string; name?: string; content?: string; tags?: string[] };
    
    if (!id) {
      return new Response(JSON.stringify({ error: "Prompt ID is required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const existingPrompt = await env.CHAT_STORE.get(`prompt:${id}`, "json") as SavedPrompt | null;
    if (!existingPrompt) {
      return new Response(JSON.stringify({ error: "Prompt not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    const updatedPrompt: SavedPrompt = {
      ...existingPrompt,
      name: name ?? existingPrompt.name,
      content: content ?? existingPrompt.content,
      tags: tags ?? existingPrompt.tags,
      updatedAt: new Date().toISOString(),
    };

    await env.CHAT_STORE.put(`prompt:${id}`, JSON.stringify(updatedPrompt));

    return new Response(JSON.stringify({ prompt: updatedPrompt }), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating prompt:", error);
    return new Response(JSON.stringify({ error: "Failed to update prompt" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

/**
 * Handles DELETE requests to remove a saved prompt
 */
async function handleDeletePrompt(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return new Response(JSON.stringify({ error: "Prompt ID is required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const existingPrompt = await env.CHAT_STORE.get(`prompt:${id}`, "json");
    if (!existingPrompt) {
      return new Response(JSON.stringify({ error: "Prompt not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    await env.CHAT_STORE.delete(`prompt:${id}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return new Response(JSON.stringify({ error: "Failed to delete prompt" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

/**
 * Handles GET requests for MCP servers
 */
async function handleGetMCPServers(env: Env): Promise<Response> {
  try {
    const { keys } = await env.CHAT_STORE.list({ prefix: "mcp:" });
    const servers: MCPServer[] = [];

    for (const key of keys) {
      const serverData = await env.CHAT_STORE.get(key.name, "json");
      if (serverData) {
        servers.push(serverData as MCPServer);
      }
    }

    return new Response(JSON.stringify({ servers }), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching MCP servers:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch MCP servers" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

/**
 * Handles POST requests to create a new MCP server
 */
async function handleCreateMCPServer(request: Request, env: Env): Promise<Response> {
  try {
    const { name, command, cwd, env: serverEnv, args, enabled, description } = await request.json() as {
      name: string;
      command: string[];
      cwd?: string;
      env?: Record<string, string>;
      args?: Record<string, any>;
      enabled: boolean;
      description?: string;
    };
    
    if (!name || !command || !Array.isArray(command) || command.length === 0) {
      return new Response(JSON.stringify({ error: "Name and command array are required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const server: MCPServer = {
      id: crypto.randomUUID(),
      name,
      command,
      cwd,
      env: serverEnv,
      args,
      enabled: enabled ?? true,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await env.CHAT_STORE.put(`mcp:${server.id}`, JSON.stringify(server));

    return new Response(JSON.stringify({ server }), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating MCP server:", error);
    return new Response(JSON.stringify({ error: "Failed to create MCP server" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

/**
 * Handles PUT requests to update an MCP server
 */
async function handleUpdateMCPServer(request: Request, env: Env): Promise<Response> {
  try {
    const { id, name, command, cwd, env: serverEnv, args, enabled, description } = await request.json() as {
      id: string;
      name?: string;
      command?: string[];
      cwd?: string;
      env?: Record<string, string>;
      args?: Record<string, any>;
      enabled?: boolean;
      description?: string;
    };
    
    if (!id) {
      return new Response(JSON.stringify({ error: "Server ID is required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const existingServer = await env.CHAT_STORE.get(`mcp:${id}`, "json") as MCPServer | null;
    if (!existingServer) {
      return new Response(JSON.stringify({ error: "MCP server not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    const updatedServer: MCPServer = {
      ...existingServer,
      name: name ?? existingServer.name,
      command: command ?? existingServer.command,
      cwd: cwd ?? existingServer.cwd,
      env: serverEnv ?? existingServer.env,
      args: args ?? existingServer.args,
      enabled: enabled ?? existingServer.enabled,
      description: description ?? existingServer.description,
      updatedAt: new Date().toISOString(),
    };

    await env.CHAT_STORE.put(`mcp:${id}`, JSON.stringify(updatedServer));

    return new Response(JSON.stringify({ server: updatedServer }), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating MCP server:", error);
    return new Response(JSON.stringify({ error: "Failed to update MCP server" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

/**
 * Handles DELETE requests to remove an MCP server
 */
async function handleDeleteMCPServer(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return new Response(JSON.stringify({ error: "Server ID is required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const existingServer = await env.CHAT_STORE.get(`mcp:${id}`, "json");
    if (!existingServer) {
      return new Response(JSON.stringify({ error: "MCP server not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    await env.CHAT_STORE.delete(`mcp:${id}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting MCP server:", error);
    return new Response(JSON.stringify({ error: "Failed to delete MCP server" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

/**
 * Handles POST requests to save files locally
 */
async function handleSaveFile(request: Request, env: Env): Promise<Response> {
  try {
    const { filename, content, contentType } = await request.json() as FileSaveRequest;
    
    if (!filename || !content) {
      return new Response(JSON.stringify({ error: "Filename and content are required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Generate file download response
    const headers = new Headers({
      'Content-Type': contentType || 'text/plain',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': new TextEncoder().encode(content).length.toString(),
    });

    return new Response(content, { headers });
  } catch (error) {
    console.error("Error saving file:", error);
    return new Response(JSON.stringify({ error: "Failed to save file" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}