# C.H.E.T. Code Review

This document outlines the findings of a code review for the C.H.E.T. application. It includes identified issues, explanations, and suggested fixes.

## Issues Identified

### 1. Conflicting Wrangler Configuration

**Files:**
- `wrangler.toml`
- `wrangler.jsonc`

**Issue:**
The project contains both `wrangler.toml` and `wrangler.jsonc` files. This can lead to confusion and inconsistent configurations. The `wrangler.toml` file appears to be more up-to-date, containing `build` and `durable_objects` sections that are missing from `wrangler.jsonc`. However, there are discrepancies between the two files, such as the `main` entry point (`dist/index.js` vs. `src/index.ts`).

**Recommendation:**
Consolidate the configuration into a single `wrangler.toml` file and delete `wrangler.jsonc` to avoid ambiguity.

### 2. Typo in HTML Header

**File:**
- `public/index.html` (Line 12)

**Issue:**
There is a typo in the `<h1>` tag: `<h1>CHAET - C.H.E.T.</h1>`.

**Recommendation:**
Correct the typo to `<h1>C.H.E.T.</h1>`.

### 3. Inefficient Prompt Fetching in Frontend

**File:**
- `public/js/main.js` (Line 160)

**Issue:**
The `usePrompt` function fetches all prompts from the `/api/prompts` endpoint and then filters them on the client-side to find the selected prompt. This is inefficient, especially if the number of saved prompts grows.

**Recommendation:**
Modify the `/api/prompts` endpoint to support fetching a single prompt by its ID (e.g., `/api/prompts/:id`). Update the `usePrompt` function to use this new endpoint.

### 4. Missing `agent-manager.ts` file

**File:**
- `README.md` (line 78)

**Issue:**
The `README.md` file mentions the `agent-manager.ts` file, but it does not exist in the `src/lib/` directory.

**Recommendation:**
Update the `README.md` file to remove the reference to the missing `agent-manager.ts` file.

### 5. Duplicated `SYSTEM_PROMPT`

**Files:**
- `src/lib/config.ts` (Line 101)
- `src/lib/chet-agent.ts` (Line 5)

**Issue:**
The `SYSTEM_PROMPT` constant is defined in both `src/lib/config.ts` and `src/lib/chet-agent.ts`. This is a violation of the DRY (Don't Repeat Yourself) principle and can lead to inconsistencies if one is updated and the other is not.

**Recommendation:**
Remove the `SYSTEM_PROMPT` constant from `src/lib/chet-agent.ts` and import it from `src/lib/config.ts` instead.

### 6. Lack of Input Validation in `ChetAgent`

**File:**
- `src/lib/chet-agent.ts` (Line 48)

**Issue:**
The `ChetAgent`'s `onRequest` method performs some basic validation for the `content` field, but it does not validate the other parameters in the request body (e.g., `maxTokens`, `temperature`). This could lead to unexpected behavior or errors if invalid values are provided.

**Recommendation:**
Implement more robust input validation for all parameters using a library like `zod` or by adding manual checks.

### 7. Missing Error Handling for `getAgentByName`

**File:**
- `src/app.ts` (Line 31)

**Issue:**
The `getAgentByName` function is called without a `try...catch` block. If this function throws an error, it will not be caught by the application's error handling middleware, potentially crashing the worker.

**Recommendation:**
Wrap the `getAgentByName` call in a `try...catch` block to handle any potential errors gracefully.

### 8. Hardcoded Model Name in `ChetAgent`

**File:**
- `src/lib/chet-agent.ts` (Line 40)

**Issue:**
The `ChetAgent` uses a hardcoded default model (`llama-3.3-70b`). This should be configurable and ideally sourced from the `AGENT_CONFIGS` in `src/lib/config.ts`.

**Recommendation:**
Update the `ChetAgent` to use the model specified in the `AGENT_CONFIGS` for the "DEFAULT" agent.

### 9. Unused `AGENT_CONFIGS`

**File:**
- `src/lib/config.ts` (Line 105)

**Issue:**
The `AGENT_CONFIGS` object is defined in `src/lib/config.ts` but does not appear to be used anywhere in the application.

**Recommendation:**
Integrate the `AGENT_CONFIGS` into the `ChetAgent` and the chat API to allow for different agent personas and configurations.

### 10. Inconsistent API Endpoint for File Saves

**File:**
- `src/app.ts` (Line 42)

**Issue:**
The `fileRouter` is mounted at `/api`, but the endpoint it defines is `/save-file`. This means the actual endpoint is `/api/save-file`. This is inconsistent with the other API routers, which are mounted with more specific paths (e.g., `/api/models`).

**Recommendation:**
Mount the `fileRouter` at `/api/file` to be consistent with the other routers. The endpoint would then be `/api/file/save`.

## Actionable LLM Prompt

The following prompt can be used to instruct an LLM to apply the suggested fixes:

"You are an expert software engineer. Please apply the following changes to the C.H.E.T. codebase to fix the identified issues. For each issue, I will provide the file path, the issue description, and the corrected code. Apply the changes exactly as described."
