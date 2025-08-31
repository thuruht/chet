import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler, debugLogger } from './middleware/error-handler.js';
import { modelsRouter } from './api/models.js';
import { chatRouter } from './api/chat.js';
import { promptsRouter } from './api/prompts.js';
import { mcpServersRouter } from './api/mcp-servers.js';
import { fileRouter } from './api/file.js';
import type { Env } from './lib/types.js';

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

// Route static assets
app.get('*', async (c) => {
  const { pathname } = new URL(c.req.url);
  
  // Only handle static assets for non-API paths
  if (pathname.startsWith('/api/')) {
    // Do nothing: let Hono route matching handle API routes
    return;
  }
  
  // Handle static assets with the ASSETS binding
  return c.env.ASSETS.fetch(c.req.raw);
});

// Mount API routes
app.route('/api/models', modelsRouter);
app.route('/api/chat', chatRouter);
app.route('/api/prompts', promptsRouter);
app.route('/api/mcp-servers', mcpServersRouter);
app.route('/api', fileRouter);

// Not found handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Export the default handler for the worker
export default app;