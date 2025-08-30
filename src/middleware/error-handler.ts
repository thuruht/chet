import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Env } from '../lib/types.js';

/**
 * Error handling middleware for Hono
 */
export function errorHandler(app: Hono<{ Bindings: Env }>) {
  app.onError((err, c) => {
    console.error('Error in request handler:', err);
    
    if (err instanceof HTTPException) {
      return err.getResponse();
    }
    
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    const detail = err.detail || (err.stack ? String(err.stack).split('\n').slice(0, 5).join('\n') : undefined);
    
    const payload: any = { error: message };
    if (detail) payload.detail = detail;
    if (process.env.NODE_ENV !== 'production' && err.stack) {
      payload.stack = err.stack;
    }
    
    return c.json(payload, status);
  });
  
  return app;
}

/**
 * Debug middleware for logging requests
 */
export function debugLogger(app: Hono<{ Bindings: Env }>) {
  app.use('*', async (c, next) => {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;
    
    console.log(`[${new Date().toISOString()}] ${method} ${path} - Started`);
    
    await next();
    
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${method} ${path} - Completed in ${duration}ms`);
  });
  
  return app;
}