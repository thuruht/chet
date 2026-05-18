with open('src/lib/config.ts', 'r') as f:
    content = f.read()

new_models = """
  "llama-3.1-8b": {
    id: "@cf/meta/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B",
    description: "Fast, efficient general purpose model",
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
  "gemma-7b": {
    id: "@cf/google/gemma-7b-it",
    name: "Gemma 7B",
    description: "Capable general purpose model by Google",
    contextWindow: 8192,
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
    supportsTools: false,
    supportsJsonMode: false,
  },
  "mistral-7b": {
    id: "@cf/mistral/mistral-7b-instruct-v0.2",
    name: "Mistral 7B Instruct v0.2",
    description: "Highly capable instruction tuned model",
    contextWindow: 32768,
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
    supportsTools: false,
    supportsJsonMode: false,
  },
"""

content = content.replace("export const MODELS: Record<string, ModelConfig> = {", "export const MODELS: Record<string, ModelConfig> = {" + new_models)

with open('src/lib/config.ts', 'w') as f:
    f.write(content)

with open('src/api/models.ts', 'r') as f:
    content = f.read()

new_examples = """
    "llama-3.1-8b": {
      prompts: [
        "Explain quantum computing to a 10-year-old",
        "Write a short story about time travel",
        "Analyze the economic impacts of renewable energy",
        "Compare and contrast different machine learning algorithms"
      ]
    },
    "gemma-7b": {
      prompts: [
        "What are the benefits of functional programming?",
        "Write a poem about the ocean",
        "Give me a summary of World War II",
        "Explain how a neural network works"
      ]
    },
    "mistral-7b": {
      prompts: [
        "Write a guide on how to bake a chocolate cake",
        "Explain the theory of relativity",
        "Generate a creative writing prompt",
        "Translate this English text to French"
      ]
    },
"""

content = content.replace("  const examples = {", "  const examples = {\n" + new_examples)

with open('src/api/models.ts', 'w') as f:
    f.write(content)
