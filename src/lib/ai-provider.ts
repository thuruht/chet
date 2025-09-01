/**
 * AI Provider abstraction for Cloudflare Workers AI and custom/community providers.
 * Easily extendable for future providers.
 */
import type { Env, ChatRequest } from './types.js';
import { MODELS } from './config.js';

export interface AIProvider {
  run(modelKey: string, params: ChatRequest, env: Env): Promise<Response>;
}

/**
 * Default provider using Workers AI Gateway
 */
export class WorkersAIProvider implements AIProvider {
  async run(modelKey: string, params: ChatRequest, env: Env): Promise<Response> {
    const modelConfig = MODELS[modelKey];
    if (!modelConfig) throw new Error(`Model ${modelKey} not found`);
    // Map ChatRequest to Workers AI params
    const aiParams: any = {
      messages: params.messages,
      max_tokens: Math.min(params.maxTokens ?? modelConfig.maxTokensDefault, modelConfig.maxTokensMax),
      temperature: params.temperature ?? modelConfig.temperatureDefault,
      top_p: params.topP ?? modelConfig.topPDefault,
      top_k: params.topK ?? modelConfig.topKDefault,
      seed: params.seed,
      repetition_penalty: params.repetitionPenalty,
      frequency_penalty: params.frequencyPenalty,
      presence_penalty: params.presencePenalty,
      response_format: params.responseFormat,
      tools: params.tools,
    };
    // Remove undefined values
    Object.keys(aiParams).forEach(k => aiParams[k] === undefined && delete aiParams[k]);
    return await env.AI.run(modelConfig.id as any, aiParams, { returnRawResponse: true });
  }
}

// Future: Add more providers here

export const defaultAIProvider = new WorkersAIProvider();
