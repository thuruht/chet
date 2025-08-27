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
  "You are C.H.E.T. (Chat Helper for (almost) Every Task), a helpful and friendly AI assistant. You are designed to assist with a wide variety of tasks and provide concise, accurate, and helpful responses. Always identify yourself as C.H.E.T. when introducing yourself or when asked about your identity.";

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
    // Decide how to read the body depending on Content-Type and proxy mangling.
    // The request body can only be consumed once, so clone the request and
    // attempt to parse FormData from the clone first. This makes parsing
    // robust even if proxies strip or mangle the Content-Type header.
    const contentType = (request.headers.get('content-type') || '').toLowerCase();
    const requestClone = request.clone();
    let rawBody: string | null = null;
    let parsedForm: FormData | null = null;

    try {
      // Try to parse form data from the cloned request regardless of Content-Type.
      parsedForm = await requestClone.formData();
      const fval = parsedForm.get('payloadB64') || parsedForm.get('payload_b64') || parsedForm.get('payload');
      if (fval) {
        rawBody = typeof fval === 'string' ? (fval as string) : String(fval);
      } else {
        const parts: string[] = [];
        for (const entry of parsedForm.entries()) {
          const k = String(entry[0]);
          const v = entry[1];
          parts.push(`${k}=${String(v).slice(0,200)}`);
        }
        rawBody = parts.join('&');
      }
    } catch (e) {
      // clone.formData() failed (not form data) or clone body couldn't be parsed as form; fall back
      // to reading the original request as text. This keeps the original request body unread
      // until now so we can confidently inspect it.
      rawBody = await request.text();
    }

    // decode helper
    const b64decode = (s: string) => {
      try {
        // Normalize base64url to standard base64: replace -_ back to +/ and pad with '='
        let str = s.replace(/-/g, '+').replace(/_/g, '/');
        const pad = str.length % 4;
        if (pad === 2) str += '==';
        else if (pad === 3) str += '=';
        else if (pad !== 0) {
          // pad == 1 is invalid base64 length; fall through and let decoder throw
        }
        if (typeof atob === 'function') return atob(str);
        // @ts-ignore - Node Buffer may not be present in Worker runtime, but in local tests it's fine
        if (typeof Buffer !== 'undefined') return Buffer.from(str, 'base64').toString('utf8');
        throw new Error('No base64 decode available');
      } catch (e) {
        throw e;
      }
    };

    // Try to repair common mangling where proxies remove quotes/braces. This is best-effort.
    const tryRepairMangledJson = (text: string) => {
      const attempts: string[] = [];
      // Raw as-is
      attempts.push(text);

      // Try URL-decoding (some proxies percent-encode)
      try { attempts.push(decodeURIComponent(text)); } catch (_) {}

      // Replace unquoted keys like: key: with "key":
      try {
        let s = text;
        // Quote keys (after { or ,)
        s = s.replace(/([\{,\[]\s*)([a-zA-Z_][a-zA-Z0-9_\-]*)\s*:/g, '$1"$2":');
        // Quote bareword values (value without quotes, not starting with { [ number true false null)
        s = s.replace(/:\s*([a-zA-Z_\-\/\. ]+)([,\}\]])/g, ':"$1"$2');
        attempts.push(s);
      } catch (_) {}

      // As a last resort, try to wrap simple role:value pairs into objects
      try {
        let s2 = text;
        s2 = s2.replace(/role:([a-zA-Z_\-]+)/g, '"role":"$1"');
        s2 = s2.replace(/content:([^,\}\]]+)/g, '"content":"$1"');
        attempts.push(s2);
      } catch (_) {}

      return attempts;
    };

    // If X-Debug is set return diagnostic info showing attempts
    const debugInfo: any = { attempts: [] };

    // 2.5) capture attempts for repair heuristics when encoded header present
    const recordAttempt = (label: string, value: string) => {
      try { debugInfo.attempts.push({ label, snippet: value && value.length > 200 ? value.slice(0,200) : value }); } catch (_) {}
    };

  let body: ChatRequest | null = null;

    // 1) If we successfully parsed FormData from the clone, try to extract payloadB64
    try {
      if (parsedForm) {
        try {
          const form = parsedForm;
          const fval = form.get('payloadB64') || form.get('payload_b64') || form.get('payload');
          if (fval) {
            const candidate = typeof fval === 'string' ? fval : (fval as any).toString();
            const decoded = b64decode(candidate);
            recordAttempt('form_payload_decoded', decoded);
            try { body = JSON.parse(decoded) as ChatRequest; } catch (e) {
              const repairs = tryRepairMangledJson(decoded || '');
              for (let i = 0; i < repairs.length; i++) {
                const attempt = repairs[i];
                recordAttempt(`form_payload_repair_${i}`, attempt);
                try { body = JSON.parse(attempt) as ChatRequest; break; } catch (_) { body = null; }
              }
            }
          }
        } catch (_) {
          // ignore and continue
        }
      }
    } catch (e) {
      // ignore form parsing exceptions and continue
    }

    // 2) If not parsed yet, try encoded payload detection (header or presence in raw body)
    if (!body) {
      // Quick attempt: if rawBody looks like urlencoded form (contains '='), try URLSearchParams
      try {
        if (rawBody && /[=&]/.test(rawBody)) {
          const usp = new URLSearchParams(rawBody);
          const candidate = usp.get('payloadB64') || usp.get('payload_b64') || usp.get('payload');
          if (candidate) {
            const dec = b64decode(candidate);
            recordAttempt('urlencoded_raw_payload_decoded', dec);
            try { body = JSON.parse(dec) as ChatRequest; }
            catch (e) {
              const repairs = tryRepairMangledJson(dec || '');
              for (let i = 0; i < repairs.length; i++) {
                const attempt = repairs[i];
                recordAttempt(`urlencoded_raw_repair_${i}`, attempt);
                try { body = JSON.parse(attempt) as ChatRequest; break; } catch (_) { body = null; }
              }
            }
          }
        }
      } catch (_) {}
      const isEncodedHeader = request.headers.get('x-encoded-payload') === '1';
      if (isEncodedHeader) {
        // treat rawBody as raw base64 string if content-type is text/plain
        try {
          const decoded = b64decode(rawBody.trim());
          recordAttempt('decoded_base64', decoded);
          try {
            body = JSON.parse(decoded) as ChatRequest;
          } catch (e) {
            // Try repair heuristics on the decoded string
            const repairs = tryRepairMangledJson(decoded || '');
            for (let i = 0; i < repairs.length; i++) {
              const attempt = repairs[i];
              recordAttempt(`decoded_repair_${i}`, attempt);
              try { body = JSON.parse(attempt) as ChatRequest; break; } catch (_) { body = null; }
            }
          }
        } catch (e) {
          // if that failed, try extracting payloadB64 field or regex
          try {
            const parsedOuter = JSON.parse(rawBody);
            if (parsedOuter && parsedOuter.payloadB64) {
              const dec = b64decode(parsedOuter.payloadB64);
              recordAttempt('outer_payloadB64_decoded', dec);
              try {
                body = JSON.parse(dec) as ChatRequest;
              } catch (_) {
                const repairs = tryRepairMangledJson(dec || '');
                for (let i = 0; i < repairs.length; i++) {
                  const attempt = repairs[i];
                  recordAttempt(`outer_payload_repair_${i}`, attempt);
                  try { body = JSON.parse(attempt) as ChatRequest; break; } catch (_) { body = null; }
                }
              }
            }
          } catch (_) {
            const regex = /payloadB64\s*[:=]\s*(?:"([A-Za-z0-9+_\-/=]+)"|([A-Za-z0-9+_\-/=]+))/i;
            const m = (rawBody || '').match(regex);
            const candidate = m ? (m[1] || m[2]) : null;
            if (candidate) {
              try {
                const dec2 = b64decode(candidate);
                recordAttempt('regex_candidate_decoded', dec2);
                try { body = JSON.parse(dec2) as ChatRequest; } catch (_) {
                  const repairs = tryRepairMangledJson(dec2 || '');
                  for (let i = 0; i < repairs.length; i++) {
                    const attempt = repairs[i];
                    recordAttempt(`regex_decoded_repair_${i}`, attempt);
                    try { body = JSON.parse(attempt) as ChatRequest; break; } catch (_) { body = null; }
                  }
                }
              } catch (_) { }
            }
            if (!body) {
              const m2 = (rawBody || '').match(/([A-Za-z0-9+_\-/=]{40,})/);
              if (m2) {
                try {
                  const dec3 = b64decode(m2[1]);
                  recordAttempt('loose_b64_decoded', dec3);
                  try { body = JSON.parse(dec3) as ChatRequest; } catch (_) {
                    const repairs = tryRepairMangledJson(dec3 || '');
                    for (let i = 0; i < repairs.length; i++) {
                      const attempt = repairs[i];
                      recordAttempt(`loose_b64_repair_${i}`, attempt);
                      try { body = JSON.parse(attempt) as ChatRequest; break; } catch (_) { body = null; }
                    }
                  }
                } catch (_) {}
              }
            }
          }
        }
      } else {
        const looksLikeEncodedInBody = /payloadB64\s*[:=]/i.test(rawBody || '') || /[A-Za-z0-9+/=]{40,}/.test(rawBody || '');
        if (looksLikeEncodedInBody) {
          try {
            try {
              const parsedOuter = JSON.parse(rawBody);
              if (parsedOuter && parsedOuter.payloadB64) {
                body = JSON.parse(b64decode(parsedOuter.payloadB64)) as ChatRequest;
              }
            } catch (_) {
              const regex = /payloadB64\s*[:=]\s*(?:"([A-Za-z0-9+_\-/=]+)"|([A-Za-z0-9+_\-/=]+))/i;
              const m = (rawBody || '').match(regex);
              const candidate = m ? (m[1] || m[2]) : null;
              if (candidate) {
                try { body = JSON.parse(b64decode(candidate)) as ChatRequest; } catch (_) { }
              }
              if (!body) {
                const m2 = (rawBody || '').match(/([A-Za-z0-9+_\-/=]{40,})/);
                if (m2) {
                  try { body = JSON.parse(b64decode(m2[1])) as ChatRequest; } catch (_) { }
                }
              }
            }
          } catch (_) {
            const regex = /payloadB64\s*[:=]\s*(?:"([A-Za-z0-9+/=]+)"|([A-Za-z0-9+/=]+))/i;
            const m = (rawBody || '').match(regex);
            const candidate = m ? (m[1] || m[2]) : null;
            if (candidate) {
              try { body = JSON.parse(b64decode(candidate)) as ChatRequest; } catch (_) { }
            }
            if (!body) {
              const m2 = (rawBody || '').match(/([A-Za-z0-9+/=]{40,})/);
              if (m2) {
                try { body = JSON.parse(b64decode(m2[1])) as ChatRequest; } catch (_) { }
              }
            }
          }
        }
      }
    }

    // 3) If still not parsed, try direct JSON parse (most common path)
    if (!body) {
      try {
        recordAttempt('raw', rawBody || '');
        body = rawBody ? (JSON.parse(rawBody) as ChatRequest) : ({ messages: [] } as ChatRequest);
      } catch (parseErr) {
        // Attempt repair heuristics
        const repairs = tryRepairMangledJson(rawBody || '');
        for (let i = 0; i < repairs.length; i++) {
          const attempt = repairs[i];
          recordAttempt(`repair_${i}`, attempt);
          try { body = JSON.parse(attempt) as ChatRequest; break; } catch (_) { body = null; }
        }

        if (!body) {
          console.error('Failed to parse JSON body for /api/chat. Raw body:', rawBody);
          const payloadSnippet = rawBody ? rawBody.slice(0, 200) : '';
          const resp = { error: 'Invalid JSON', detail: payloadSnippet, rawPreview: payloadSnippet, debug: debugInfo };
          return new Response(JSON.stringify(resp), { status: 400, headers: { 'content-type': 'application/json' } });
        }
      }
    }

    if (request.headers.get('x-debug') === '1') {
      return new Response(JSON.stringify({ ok: true, rawBody: rawBody || null, parsed: body, debug: debugInfo, bindings: {
        hasAI: !!(env && (env as any).AI),
        hasKV: !!(env && (env as any).CHET_KV),
        hasASSETS: !!(env && (env as any).ASSETS),
      }}), { headers: { 'content-type': 'application/json' } });
    }

    // now we have a parsed body
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
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages must be an array' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    // Get model configuration
    const modelConfig = MODELS[model];
    if (!modelConfig) {
      console.error('Invalid model specified in chat request:', model);
      return new Response(
        JSON.stringify({ error: `Invalid model specified: ${String(model)}` }),
        { status: 400, headers: { 'content-type': 'application/json' } }
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
    return new Response(JSON.stringify(payload), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

/**
 * Handles GET requests for saved prompts
 */
async function handleGetPrompts(env: Env): Promise<Response> {
  try {
    const { keys } = await env.CHET_KV.list({ prefix: "prompt:" });
    const prompts: SavedPrompt[] = [];

    for (const key of keys) {
      const promptData = await env.CHET_KV.get(key.name, "json");
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

    await env.CHET_KV.put(`prompt:${prompt.id}`, JSON.stringify(prompt));

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

    const existingPrompt = await env.CHET_KV.get(`prompt:${id}`, "json") as SavedPrompt | null;
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

    await env.CHET_KV.put(`prompt:${id}`, JSON.stringify(updatedPrompt));

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

    const existingPrompt = await env.CHET_KV.get(`prompt:${id}`, "json");
    if (!existingPrompt) {
      return new Response(JSON.stringify({ error: "Prompt not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    await env.CHET_KV.delete(`prompt:${id}`);

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
    const { keys } = await env.CHET_KV.list({ prefix: "mcp:" });
    const servers: MCPServer[] = [];

    for (const key of keys) {
      const serverData = await env.CHET_KV.get(key.name, "json");
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

    await env.CHET_KV.put(`mcp:${server.id}`, JSON.stringify(server));

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

    const existingServer = await env.CHET_KV.get(`mcp:${id}`, "json") as MCPServer | null;
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

    await env.CHET_KV.put(`mcp:${id}`, JSON.stringify(updatedServer));

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

    const existingServer = await env.CHET_KV.get(`mcp:${id}`, "json");
    if (!existingServer) {
      return new Response(JSON.stringify({ error: "MCP server not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    await env.CHET_KV.delete(`mcp:${id}`);

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