import { Hono } from 'hono';
import type { Env, MCPServer } from '../lib/types.js';

// Create a router for MCP servers endpoints
const mcpServersRouter = new Hono<{ Bindings: Env }>();

/**
 * GET /api/mcp-servers - Get all saved MCP servers
 */
mcpServersRouter.get('/', async (c) => {
  try {
    const { keys } = await c.env.CHET_KV.list({ prefix: "mcpserver:" });
    const servers: MCPServer[] = [];

    for (const key of keys) {
      const serverData = await c.env.CHET_KV.get(key.name, "json");
      if (serverData) {
        servers.push(serverData as MCPServer);
      }
    }

    return c.json({ servers });
  } catch (error) {
    console.error("Error fetching MCP servers:", error);
    return c.json({ error: "Failed to fetch MCP servers" }, 500);
  }
});

/**
 * POST /api/mcp-servers - Create a new MCP server
 */
mcpServersRouter.post('/', async (c) => {
  try {
    const { name, url, apiKey } = await c.req.json() as { name: string; url: string; apiKey?: string };
    
    if (!name || !url) {
      return c.json({ error: "Name and URL are required" }, 400);
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return c.json({ error: "Invalid URL format" }, 400);
    }

    const server: MCPServer = {
      id: crypto.randomUUID(),
      name,
      url: url.endsWith('/') ? url : `${url}/`, // Ensure URL ends with a slash
      apiKey: apiKey || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await c.env.CHET_KV.put(`mcpserver:${server.id}`, JSON.stringify(server));

    return c.json({ server });
  } catch (error) {
    console.error("Error creating MCP server:", error);
    return c.json({ error: "Failed to create MCP server" }, 500);
  }
});

/**
 * PUT /api/mcp-servers - Update an existing MCP server
 */
mcpServersRouter.put('/', async (c) => {
  try {
    const { id, name, url, apiKey } = await c.req.json() as { id: string; name?: string; url?: string; apiKey?: string };
    
    if (!id) {
      return c.json({ error: "Server ID is required" }, 400);
    }

    const existingServer = await c.env.CHET_KV.get(`mcpserver:${id}`, "json") as MCPServer | null;
    if (!existingServer) {
      return c.json({ error: "MCP server not found" }, 404);
    }

    // Validate URL format if provided
    if (url) {
      try {
        new URL(url);
      } catch {
        return c.json({ error: "Invalid URL format" }, 400);
      }
    }

    const updatedServer: MCPServer = {
      ...existingServer,
      name: name ?? existingServer.name,
      url: url ? (url.endsWith('/') ? url : `${url}/`) : existingServer.url,
      apiKey: apiKey !== undefined ? apiKey : existingServer.apiKey,
      updatedAt: new Date().toISOString(),
    };

    await c.env.CHET_KV.put(`mcpserver:${id}`, JSON.stringify(updatedServer));

    return c.json({ server: updatedServer });
  } catch (error) {
    console.error("Error updating MCP server:", error);
    return c.json({ error: "Failed to update MCP server" }, 500);
  }
});

/**
 * DELETE /api/mcp-servers - Delete a MCP server
 */
mcpServersRouter.delete('/', async (c) => {
  try {
    const id = c.req.query('id');
    
    if (!id) {
      return c.json({ error: "Server ID is required" }, 400);
    }

    const existingServer = await c.env.CHET_KV.get(`mcpserver:${id}`, "json");
    if (!existingServer) {
      return c.json({ error: "MCP server not found" }, 404);
    }

    await c.env.CHET_KV.delete(`mcpserver:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting MCP server:", error);
    return c.json({ error: "Failed to delete MCP server" }, 500);
  }
});

export { mcpServersRouter };