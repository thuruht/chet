# C.H.E.T. - Chat Helper for (almost) Every Task

A modern, modular chat application powered by Cloudflare Workers AI and the Agents SDK. This application provides a robust, production-ready foundation for building AI-powered chat applications with a clean architecture.

## Features

- 💬 Simple and responsive chat interface with sidebar navigation
- ⚡ Server-Sent Events (SSE) for streaming responses
- 🧠 Powered by Cloudflare Workers AI and Agents SDK
- 🛠️ Built with TypeScript, Hono, and modern best practices
- 📱 Mobile-friendly design with responsive sidebar
- 🔄 Maintains chat history on the client
- 📦 KV storage for saved prompts and MCP server configurations
- 🔎 Built-in observability logging and error handling
- 🔒 Proxy-safe API communication
- 🧩 Modular architecture for easy extension

## Architecture

C.H.E.T. is built with a modern, modular architecture:

- **Frontend**: Clean, responsive HTML/CSS/JS UI
- **Backend**: Hono router with modular API endpoints
- **State Management**: Cloudflare KV for persistence
- **Agent System**: Cloudflare Agents SDK for LLM orchestration
- **Type Safety**: TypeScript with opaque-ts for typed bindings

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- A Cloudflare account with Workers AI access and KV storage

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/chet.git
   cd chet
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Generate Worker type definitions:
   ```bash
   npm run cf-typegen
   ```

### Development

Start a local development server:

```bash
npm run dev
```

This will start a local server at http://localhost:8787.

Note: Using Workers AI accesses your Cloudflare account even during local development, which will incur usage charges.

### Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

### Monitor

View real-time logs associated with your deployed Worker:

```bash
npx wrangler tail
```

## Project Structure

```
/
├── public/             # Static assets
│   ├── index.html      # Chat UI HTML
│   ├── styles.css      # CSS styles
│   ├── chat.js         # Main chat logic
│   └── js/             # JS modules
│       ├── model-manager.js      # Model parameter handling
│       ├── chat-manager.js       # Chat UI handling
│       ├── ui-utils.js           # UI utilities
│       ├── main.js               # App orchestration
│       └── stream-parser.js      # Streaming parser
│
├── src/                # Backend source code
│   ├── app.ts          # Hono app setup
│   ├── index.ts        # Worker entry point
│   ├── api/            # API route handlers
│   │   ├── models.ts   # Models API
│   │   ├── chat.ts     # Chat API
│   │   ├── prompts.ts  # Prompts API
│   │   ├── mcp-servers.ts # MCP servers API
│   │   └── file.ts     # File save API
│   │
│   ├── lib/            # Core libraries
│   │   ├── types.ts    # TypeScript type definitions
│   │   ├── config.ts   # Configuration
│   │   └── agent-manager.ts # Agent management
│   │
│   ├── middleware/     # Hono middleware
│   │   └── error-handler.ts # Error handling
│   │
│   └── utils/          # Utilities
│       └── request-parser.ts # Request parsing
│
├── test/               # Test files
│   └── stream-parser.test.js # Streaming parser tests
│
├── wrangler.toml       # Cloudflare Worker configuration
├── vite.config.ts      # Vite bundler configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # Documentation
```

## Customization

### Adding New Models

To add new AI models, update the `MODELS` object in `src/lib/config.ts`. You can find available models in the [Cloudflare Workers AI documentation](https://developers.cloudflare.com/workers-ai/models/).

### Creating New API Routes

The application uses Hono for routing. To add a new API endpoint:

1. Create a new file in `src/api/` directory
2. Create a new Hono router and define your routes
3. Export the router and import it in `src/app.ts`
4. Mount the router at the desired path

### Modifying the System Prompt

The default system prompt can be changed by updating the `SYSTEM_PROMPT` constant in `src/lib/config.ts`.

### Using the Agents SDK

The application includes integration with Cloudflare's Agents SDK for advanced LLM orchestration. To use agents:

1. Update the agent configurations in `src/lib/config.ts`
2. Use the `AgentManager` class from `src/lib/agent-manager.ts`

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Hono Documentation](https://hono.dev/)
- [Cloudflare Agents SDK](https://github.com/cloudflare/agents)
- [opaque-ts Documentation](https://github.com/cloudflare/opaque-ts)
