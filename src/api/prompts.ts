import { Hono } from 'hono';
import type { Env, SavedPrompt } from '../lib/types.js';

// Create a router for prompts endpoints
const promptsRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /api/prompts - Get all saved prompts
 */
promptsRouter.get('/', async (c) => {
  try {
    const { keys } = await c.env.CHET_KV.list({ prefix: "prompt:" });
    const prompts: SavedPrompt[] = [];

    for (const key of keys) {
      const promptData = await c.env.CHET_KV.get(key.name, "json");
      if (promptData) {
        prompts.push(promptData as SavedPrompt);
      }
    }

    return c.json({ prompts });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return c.json({ error: "Failed to fetch prompts" }, 500);
  }
});

/**
 * POST /api/prompts - Create a new prompt
 */
promptsRouter.post('/', async (c) => {
  try {
    const { name, content, tags } = await c.req.json() as { name: string; content: string; tags: string[] };
    
    if (!name || !content) {
      return c.json({ error: "Name and content are required" }, 400);
    }

    const prompt: SavedPrompt = {
      id: crypto.randomUUID(),
      name,
      content,
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await c.env.CHET_KV.put(`prompt:${prompt.id}`, JSON.stringify(prompt));

    return c.json({ prompt });
  } catch (error) {
    console.error("Error creating prompt:", error);
    return c.json({ error: "Failed to create prompt" }, 500);
  }
});

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
    if (!existingPrompt) {
      return c.json({ error: "Prompt not found" }, 404);
    }

    const updatedPrompt: SavedPrompt = {
      ...existingPrompt,
      name: name ?? existingPrompt.name,
      content: content ?? existingPrompt.content,
      tags: tags ?? existingPrompt.tags,
      updatedAt: new Date().toISOString(),
    };

    await c.env.CHET_KV.put(`prompt:${id}`, JSON.stringify(updatedPrompt));

    return c.json({ prompt: updatedPrompt });
  } catch (error) {
    console.error("Error updating prompt:", error);
    return c.json({ error: "Failed to update prompt" }, 500);
  }
});

/**
 * DELETE /api/prompts - Delete a prompt
 */
promptsRouter.delete('/', async (c) => {
  try {
    const id = c.req.query('id');
    
    if (!id) {
      return c.json({ error: "Prompt ID is required" }, 400);
    }

    const existingPrompt = await c.env.CHET_KV.get(`prompt:${id}`, "json");
    if (!existingPrompt) {
      return c.json({ error: "Prompt not found" }, 404);
    }

    await c.env.CHET_KV.delete(`prompt:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return c.json({ error: "Failed to delete prompt" }, 500);
  }
});

export { promptsRouter };