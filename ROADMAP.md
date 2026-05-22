# C.H.E.T. Development Roadmap

## Phase 1: Core Agentic Upgrades (Completed)
- [x] Integrate Vercel AI SDK for advanced stream handling
- [x] Implement Long-Term Memory (RAG) via Cloudflare Vectorize
- [x] Add basic `webSearch` capability via Codemode
- [x] Support multiple models (Llama 3.3, Llama 3.1, Gemma, Mistral, etc.)
- [x] Add visual indicators for mid-conversation model switching

## Phase 2: Frontend Redesign
- [ ] Implement a sleek, retro-futuristic UI theme
- [ ] Improve responsiveness and chat readability
- [ ] Add quirky, cyber/terminal aesthetic elements

## Phase 3: Identity & Monetization
- [ ] **Authentication**: Implement user accounts (via Clerk, Auth0, or Cloudflare Access).
- [ ] **Age Verification**: Require birthday during account creation to enforce an 18+ policy for uncensored interactions.
- [ ] **PayPal Integration**: Implement PayPal REST API/SDK for payment processing.
- [ ] **Tiered Access**:
  - *Free Tier*: Basic models, strict rate limits, standard system prompts.
  - *Paid Tier*: Advanced models, high usage limits.
  - *API Keys*: Issue custom API keys for developers to access the C.H.E.T. backend programmatically.

## Phase 4: Liberal Content & Uncensored Access
- [ ] Update System Prompts for verified 18+ users to be highly permissive.
- [ ] Investigate BYOK (Bring Your Own Key) or integrating with uncensored model providers (e.g., OpenRouter, TogetherAI) to bypass default model safety filters when requested by verified users.

## Phase 5: Mobile Applications
- [ ] Develop a native Android App using Kotlin and Jetpack Compose (see `ANDROID_APP_PROMPT.md`).
- [ ] Develop an iOS App (or use React Native/Flutter for cross-platform).

## Phase 6: Advanced Tooling
- [ ] Wire up dynamic external MCP Servers stored in Cloudflare KV via `@modelcontextprotocol/sdk`.
- [ ] Multi-Agent Workflows: Split tasks between specialized Durable Objects (Coder, Researcher, Manager).
