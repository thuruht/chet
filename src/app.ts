import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { getAgentByName } from 'agents';
import { errorHandler, debugLogger } from './middleware/error-handler.js';
import { modelsRouter } from './api/models.js';
import { promptsRouter } from './api/prompts.js';
import { mcpServersRouter } from './api/mcp-servers.js';
import { fileRouter } from './api/file.js';
import type { Env } from './lib/types.js';
import { ChetAgent } from './lib/chet-agent.js';

// Create the main app
const app = new Hono<{ Bindings: Env }>();

// Apply middleware
app.use('*', cors());
app.use('*', logger());

// Apply error handling
errorHandler(app);

// Only enable debug logging in development
if (process.env.NODE_ENV !== 'production') {
  debugLogger(app);
}

// Mount API routes
app.route('/api/models', modelsRouter);
app.post('/api/chat', async (c) => {
  try {
    const agent = getAgentByName<Env, ChetAgent>(c.env.ChetAgent, 'default-agent');
    return agent.fetch(c.req.raw);
  } catch (error) {
    console.error("Error fetching from agent:", error);
    return c.json({ error: "Failed to fetch from agent" }, 500);
  }
});
app.route('/api/prompts', promptsRouter);
app.route('/api/mcp-servers', mcpServersRouter);
app.route('/api', fileRouter);

// Route static assets
app.get('*', async (c) => {
  const { pathname } = new URL(c.req.url);

  // Only handle static assets for non-API paths
  if (pathname.startsWith('/api/')) {
    // Finalize context for API paths to avoid context errors
    return await c.notFound();
  }

  // Handle static assets with the ASSETS binding
  return c.env.ASSETS.fetch(c.req.raw);
});

// Not found handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Export the default handler for the worker
export default app;