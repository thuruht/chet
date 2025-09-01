import type { Env } from './types.js';
import { AGENT_CONFIGS, MODELS } from './config.js';

/**
 * Creates and configures an agent instance
 */
export async function createChetAgent(
  env: Env,
  configName: keyof typeof AGENT_CONFIGS = 'DEFAULT',
  customSystemPrompt?: string
) {
  const config = AGENT_CONFIGS[configName];
  const modelConfig = MODELS[config.model];
  if (!modelConfig) {
    throw new Error(`Model ${config.model} not found in configuration`);
  }
  const systemPrompt = customSystemPrompt || config.systemPrompt;
  // Use provider abstraction for model calls
  const { defaultAIProvider } = await import('./ai-provider.js');
  const agent = {
    model: modelConfig.id as string,
    systemPrompt,
    async createChat() {
      return {
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          } as import('./types.js').ChatMessage
        ],
        async sendMessage(content: string) {
          const messages = [
            ...this.messages,
            { role: 'user', content } as import('./types.js').ChatMessage
          ];
          try {
            const params = {
              messages,
              model: config.model,
              stream: true,
            };
            const response = await defaultAIProvider.run(config.model, params, env);
            this.messages.push(
              { role: 'user', content } as import('./types.js').ChatMessage,
              { role: 'assistant', content: '' } as import('./types.js').ChatMessage
            );
            return response;
          } catch (error) {
            console.error('Error calling AI provider:', error);
            throw error;
          }
        }
      };
    }
  };
  return agent;
}

/**
 * Manage agent instances
 */
export class AgentManager {
  private agents: Map<string, any> = new Map();
  private env: Env;
  
  constructor(env: Env) {
    this.env = env;
  }
  
  /**
   * Get or create an agent
   */
  async getAgent(
    agentId: string = 'default',
    configName: keyof typeof AGENT_CONFIGS = 'DEFAULT',
    customSystemPrompt?: string
  ) {
    if (!this.agents.has(agentId)) {
      const agent = await createChetAgent(this.env, configName, customSystemPrompt);
      this.agents.set(agentId, agent);
    }
    
    return this.agents.get(agentId)!;
  }
  
  /**
   * Create a new chat session with a specific agent
   */
  async createChat(
    agentId: string = 'default',
    configName: keyof typeof AGENT_CONFIGS = 'DEFAULT',
    customSystemPrompt?: string
  ) {
    const agent = await this.getAgent(agentId, configName, customSystemPrompt);
    return agent.createChat();
  }
}