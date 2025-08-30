import { ModelConfig } from './types';

// Available models configuration
export const MODELS: Record<string, ModelConfig> = {
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
export const SYSTEM_PROMPT =
  "You are C.H.E.T. (Chat Helper for (almost) Every Task), a helpful and friendly AI assistant. You are designed to assist with a wide variety of tasks and provide concise, accurate, and helpful responses. Always identify yourself as C.H.E.T. when introducing yourself or when asked about your identity.";

/**
 * Agent configurations
 */
export const AGENT_CONFIGS = {
  DEFAULT: {
    name: "CHET",
    description: "Chat Helper for (almost) Every Task",
    model: "llama-3.3-70b",
    systemPrompt: SYSTEM_PROMPT,
  },
  CODER: {
    name: "CHET Coder",
    description: "Specialized coding and technical tasks assistant",
    model: "qwen2.5-coder-32b",
    systemPrompt: `${SYSTEM_PROMPT}\n\nYou specialize in coding, technical questions, and development assistance. When asked about code, you provide well-structured, best-practice implementations with clear explanations.`,
  },
};