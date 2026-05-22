# Development Guide for C.H.E.T.

This document serves as an overview of the architecture and development guidelines for the C.H.E.T. agentic application.

## Architecture Overview

C.H.E.T. is built entirely on the **Cloudflare Developer Platform**:
- **Backend Framework**: Hono (`src/app.ts`) for routing and API endpoints.
- **Agent Orchestration**: Cloudflare Agents SDK (`src/lib/chet-agent.ts`) running on Durable Objects. This ensures each conversation session (identified by `x-session-id`) is routed to a persistent, stateful micro-server.
- **AI Core**: Vercel AI SDK (`ai` package) with the `@cloudflare/workers-ai` provider (`workers-ai-provider`), replacing raw fetch calls for easier tool calling and streaming.
- **Frontend**: Vanilla HTML/CSS/JS served statically from the `/public` directory.

## Key Features Implementation

### 1. Long-Term Memory (RAG)
We use **Cloudflare Vectorize** alongside **Workers KV**.
When a user sends a message, `chet-agent.ts` automatically generates an embedding using the `@cf/baai/bge-base-en-v1.5` model. This embedding is searched against the `chet-memory` Vectorize index. The top K matching past messages are retrieved from KV and injected directly into the `System Prompt` for that specific turn, giving the AI long-term contextual awareness.

### 2. Codemode & Web Search
We utilize the `@cloudflare/codemode` package to give the LLM agentic tool-calling capabilities. Currently, a `fetchUrl` and `webSearch` tool are injected into the agent's context. When the model determines it needs current information, it outputs a tool call which the execution sandbox intercepts, runs the search (via DuckDuckGo proxy or similar), and returns the results to the model to synthesize a final answer.

### 3. Model Context Protocol (MCP)
C.H.E.T. supports saving MCP servers to KV. To connect these tools to the AI:
1. The backend fetches the URLs and API keys of the servers.
2. It uses the MCP client to fetch available tools.
3. These tools are passed via `codemode` to the Vercel AI `streamText` function.
*Note: Full dynamic MCP connectivity across arbitrary network boundaries is an ongoing development.*

## Future Implementation Details

### Authentication & Tiered Access
When implementing Phase 3 from `ROADMAP.md`:
- **Auth0 / Clerk**: Intercept the request in a Hono middleware inside `src/app.ts`. Verify the JWT.
- Extract the user's ID and use it as (or link it to) the `x-session-id` for the Durable Object.
- Verify the user's tier by querying D1 or KV. Attach the user's tier to the request context.
- Inside `ChetAgentV2`, apply rate limits (using Cloudflare Rate Limiting) or restrict model choices based on the tier.

### PayPal Integration
Create a new Hono route (e.g., `/api/webhooks/paypal`). Validate the webhook signature using the PayPal Node SDK. Upon `PAYMENT.SALE.COMPLETED` or `BILLING.SUBSCRIPTION.CREATED`, update the user's tier in the database.

## Local Development
1. **Install dependencies**: `npm install`
2. **Type Generation**: `npm run cf-typegen`
3. **Run locally**: `npm run dev`
*(Note: Local development still hits your remote Cloudflare AI models, which incurs usage).*
