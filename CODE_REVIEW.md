# C.H.E.T. Code Review & Action Plan

This document outlines the findings of a code review for the C.H.E.T. application. For each identified issue, a detailed explanation and an actionable code diff are provided to apply the fixes.

---

## Actionable LLM Prompt

You are an expert software engineer. Your goal is to improve the C.H.E.T. codebase.

First, apply the specific changes outlined below to fix the identified issues. For each issue, I will provide the file path and a diff in the Git merge format. Apply these changes exactly as described.

After applying the fixes, your task is to proactively improve the codebase. Specifically:
1.  **Consult Documentation:** Review the official Cloudflare Workers documentation for any APIs or features related to "MCP servers." Look for best practices, new features, or alternative implementations that could enhance the existing `mcp-servers.ts` API and its corresponding frontend management components.
2.  **Expand and Improve:** Based on your research and a general assessment of the code, identify areas for improvement. You are encouraged to expand upon the provided code, refactor for clarity, add missing features (like input validation), or improve performance.

Implement these improvements, providing clear commit messages for your changes.

---

## 1. Conflicting Wrangler Configuration

-   **Issue:** The project contains both `wrangler.toml` and `wrangler.jsonc`, leading to potential configuration conflicts.
-   **Fix:** Remove the redundant `wrangler.jsonc` file to establish `wrangler.toml` as the single source of truth.

**Action:**
Delete the file `wrangler.jsonc`.

---

## 2. Typo in HTML Header

-   **File:** `public/index.html`
-   **Issue:** The main heading in the HTML has a typo.
-   **Fix:** Correct "CHAET" to "C.H.E.T.".

**Apply this diff:**
```diff
<<<<<<< SEARCH
    <header>
      <h1>CHAET - C.H.E.T.</h1>
      <p>Chat Helper for <small>(almost)</small> Every Task</p>
    </header>
=======
    <header>
      <h1>C.H.E.T.</h1>
      <p>Chat Helper for <small>(almost)</small> Every Task</p>
    </header>
>>>>>>> REPLACE
```

---

## 3. Duplicated SYSTEM_PROMPT

-   **Files:** `src/lib/config.ts`, `src/lib/chet-agent.ts`
-   **Issue:** The `SYSTEM_PROMPT` is defined in both the main config and the agent file, violating the DRY principle.
-   **Fix:** Remove the local definition in `ChetAgent` and import it from `config.ts`. Also, use the `AGENT_CONFIGS` to set the initial state, which addresses the "Unused AGENT_CONFIGS" issue.

**Apply this diff to `src/lib/chet-agent.ts`:**
```diff
<<<<<<< SEARCH
import { Agent } from 'agents';
import type { Env, ChetAgentState, ChatMessage } from './types.js';
import { MODELS } from './config.js';

const SYSTEM_PROMPT =
  'You are C.H.E.T. (Chat Helper for (almost) Every Task), a helpful and friendly AI assistant. You are designed to assist with a wide variety of tasks and provide concise, accurate, and helpful responses. Always identify yourself as C.H.E.T. when introducing yourself or when asked about your identity.';

/**
 * ChetAgent is an Agent that handles chat interactions.
 */
export class ChetAgent extends Agent<Env, ChetAgentState> {
  // Set the initial state for new agent instances
  initialState: ChetAgentState = {
    messages: [{ role: 'system', content: SYSTEM_PROMPT }],
  };

  async onRequest(request: Request): Promise<Response> {
=======
import { Agent } from 'agents';
import type { Env, ChetAgentState, ChatMessage } from './types.js';
import { AGENT_CONFIGS, MODELS } from './config.js';

/**
 * ChetAgent is an Agent that handles chat interactions.
 */
export class ChetAgent extends Agent<Env, ChetAgentState> {
  // Set the initial state for new agent instances
  initialState: ChetAgentState = {
    messages: [{ role: 'system', content: AGENT_CONFIGS.DEFAULT.systemPrompt }],
  };

  async onRequest(request: Request): Promise<Response> {
>>>>>>> REPLACE
```

---

## 4. Hardcoded Default Model Name

-   **File:** `src/lib/chet-agent.ts`
-   **Issue:** The default model (`llama-3.3-70b`) is hardcoded in the `onRequest` method.
-   **Fix:** Use the default model defined in `AGENT_CONFIGS` from `config.ts`.

**Apply this diff to `src/lib/chet-agent.ts`:**
```diff
<<<<<<< SEARCH
      case 'POST': {
        try {
          const body = await request.json<{ content: string; model?: string; [key: string]: any }>();
          const { content, model = 'llama-3.3-70b', ...params } = body;

          if (!content) {
=======
      case 'POST': {
        try {
          const body = await request.json<{ content: string; model?: string; [key: string]: any }>();
          const { content, model = AGENT_CONFIGS.DEFAULT.model, ...params } = body;

          if (!content) {
>>>>>>> REPLACE
```

---

## 5. Inconsistent API Endpoint for File Saves

-   **File:** `src/app.ts`
-   **Issue:** The `fileRouter` is mounted at `/api`, making its endpoint `/api/save-file`, which is inconsistent with other routes like `/api/models`.
-   **Fix:** Mount the router at `/api/file` to create a more consistent path `/api/file/save-file`.

**Apply this diff to `src/app.ts`:**
```diff
<<<<<<< SEARCH
app.route('/api/prompts', promptsRouter);
app.route('/api/mcp-servers', mcpServersRouter);
app.route('/api', fileRouter);

// Route static assets
app.get('*', async (c) => {
=======
app.route('/api/prompts', promptsRouter);
app.route('/api/mcp-servers', mcpServersRouter);
app.route('/api/file', fileRouter);

// Route static assets
app.get('*', async (c) => {
>>>>>>> REPLACE
```

---

## 6. Incorrect Documentation in README

-   **File:** `README.md`
-   **Issue:** The project structure in the README lists a non-existent file, `src/lib/agent-manager.ts`.
-   **Fix:** Correct the filename to `src/lib/chet-agent.ts`.

**Apply this diff to `README.md`:**
```diff
<<<<<<< SEARCH
│   │   ├── config.ts   # Configuration
│   │   └── agent-manager.ts # Agent management
│   │
│   ├── middleware/     # Hono middleware
=======
│   │   ├── config.ts   # Configuration
│   │   └── chet-agent.ts # Agent management
│   │
│   ├── middleware/     # Hono middleware
>>>>>>> REPLACE
```

---

## 7. Inefficient Prompt Fetching and API Design

-   **Files:** `src/api/prompts.ts`, `public/js/main.js`
-   **Issue:** The frontend fetches all prompts to display one, and the API uses inconsistent methods for identifying resources (query params vs. body).
-   **Fix:** Refactor the prompts API to use RESTful path parameters (`/api/prompts/:id`). Update the frontend to use these new, more efficient endpoints.

**7.1. Apply this diff to `src/api/prompts.ts`:**
```diff
<<<<<<< SEARCH
/**
 * PUT /api/prompts - Update an existing prompt
 */
promptsRouter.put('/', async (c) => {
  try {
    const { id, name, content, tags } = await c.req.json() as { id: string; name?: string; content?: string; tags?: string[] };

    if (!id) {
      return c.json({ error: "Prompt ID is required" }, 400);
    }

    const existingPrompt = await c.env.CHET_KV.get(`prompt:${id}`, "json") as SavedPrompt | null;
=======
/**
 * GET /api/prompts/:id - Get a single saved prompt
 */
promptsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const promptData = await c.env.CHET_KV.get(`prompt:${id}`, "json");

    if (!promptData) {
      return c.json({ error: "Prompt not found" }, 404);
    }

    return c.json(promptData);
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return c.json({ error: "Failed to fetch prompt" }, 500);
  }
});

/**
 * PUT /api/prompts/:id - Update an existing prompt
 */
promptsRouter.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { name, content, tags } = await c.req.json() as { name?: string; content?: string; tags?: string[] };

    const existingPrompt = await c.env.CHET_KV.get(`prompt:${id}`, "json") as SavedPrompt | null;
>>>>>>> REPLACE
```

**7.2. Apply a second diff to `src/api/prompts.ts`:**
```diff
<<<<<<< SEARCH
/**
 * DELETE /api/prompts - Delete a prompt
 */
promptsRouter.delete('/', async (c) => {
  try {
    const id = c.req.query('id');

    if (!id) {
      return c.json({ error: "Prompt ID is required" }, 400);
    }
=======
/**
 * DELETE /api/prompts/:id - Delete a prompt
 */
promptsRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
>>>>>>> REPLACE
```

**7.3. Apply this diff to `public/js/main.js`:**
```diff
<<<<<<< SEARCH
  usePrompt(promptId) {
    // Implementation for using a saved prompt
    const userInput = document.getElementById('user-input');
    if (userInput) {
      // This would fetch the prompt and populate the input
      fetch(`/api/prompts?id=${promptId}`)
        .then(response => response.json())
        .then(prompts => {
          const prompt = prompts.find(p => p.id === promptId);
          if (prompt) {
            userInput.value = prompt.content;
            userInput.focus();
            showToast('Prompt loaded', 'success');
          }
        })
        .catch(error => ErrorHandler.handle(error, 'Use Prompt'));
    }
  }
=======
  async usePrompt(promptId) {
    const userInput = document.getElementById('user-input');
    if (!userInput) return;

    try {
      const response = await fetch(`/api/prompts/${promptId}`);
      if (!response.ok) {
        throw new Error('Prompt not found');
      }
      const prompt = await response.json();
      userInput.value = prompt.content;
      userInput.focus();
      showToast('Prompt loaded', 'success');
    } catch (error) {
      ErrorHandler.handle(error, 'Use Prompt');
    }
  }
>>>>>>> REPLACE
```

**7.4. Apply a final diff to `public/js/main.js`:**
```diff
<<<<<<< SEARCH
  async deletePrompt(promptId, promptName) {
    if (!confirm(`Are you sure you want to delete the prompt "${promptName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/prompts?id=${promptId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
=======
  async deletePrompt(promptId, promptName) {
    if (!confirm(`Are you sure you want to delete the prompt "${promptName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
>>>>>>> REPLACE
```
