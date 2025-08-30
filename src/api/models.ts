import { Hono } from 'hono';
import { MODELS } from '../lib/config.js';
import type { Env } from '../lib/types.js';

// Create a router for models endpoints
const modelsRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /api/models - Get available models
 */
modelsRouter.get('/', (c) => {
  const modelsData = Object.entries(MODELS).map(([key, config]) => ({
    key,
    ...config,
  }));
  
  return c.json(modelsData);
});

/**
 * GET /api/examples - Get example prompts for models
 */
modelsRouter.get('/examples', (c) => {
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

  return c.json(examples);
});

export { modelsRouter };