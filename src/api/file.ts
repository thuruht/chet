import { Hono } from 'hono';
import type { Env, FileSaveRequest } from '../lib/types.js';

// Create a router for file save endpoint
const fileRouter = new Hono<{ Bindings: Env }>();

/**
 * POST /api/save-file - Save a file (returns download response)
 */
fileRouter.post('/save-file', async (c) => {
  try {
    const { filename, content, contentType } = await c.req.json() as FileSaveRequest;
    
    if (!filename || !content) {
      return c.json({ error: "Filename and content are required" }, 400);
    }

    // Generate file download response
    const headers = new Headers({
      'Content-Type': contentType || 'text/plain',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': new TextEncoder().encode(content).length.toString(),
    });

    return new Response(content, { headers });
  } catch (error) {
    console.error("Error saving file:", error);
    return c.json({ error: "Failed to save file" }, 500);
  }
});

export { fileRouter };