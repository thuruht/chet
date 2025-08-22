/**
 * Type definitions for the LLM chat application.
 */

export interface Env {
  /**
   * Binding for the Workers AI API.
   */
  AI: Ai;

  /**
   * Binding for static assets.
   */
  ASSETS: { fetch: (request: Request) => Promise<Response> };

  /**
   * KV namespace for storing prompts, MCP servers, and other data.
   */
  CHET_KV: KVNamespace;
}

/**
 * Represents a chat message.
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

/**
 * Available models configuration
 */
export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  maxTokensDefault: number;
  maxTokensMax: number;
  temperatureDefault: number;
  temperatureMin: number;
  temperatureMax: number;
  topPDefault: number;
  topPMin: number;
  topPMax: number;
  topKDefault: number;
  topKMin: number;
  topKMax: number;
  supportsTools?: boolean;
  supportsJsonMode?: boolean;
}

/**
 * Chat request interface with model parameters
 */
export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  seed?: number;
  repetitionPenalty?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  useJsonMode?: boolean;
  tools?: any[];
  responseFormat?: {
    type: string;
    json_schema?: any;
  };
}

/**
 * Saved prompt interface
 */
export interface SavedPrompt {
  id: string;
  name: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * MCP server configuration
 */
export interface MCPServer {
  id: string;
  name: string;
  command: string[];
  cwd?: string;
  env?: Record<string, string>;
  args?: Record<string, any>;
  enabled: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * File save request
 */
export interface FileSaveRequest {
  filename: string;
  content: string;
  contentType: string;
}
