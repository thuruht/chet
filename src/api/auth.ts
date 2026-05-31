import { Hono } from "hono";
import { Env } from "../lib/types.js";

export const authRouter = new Hono<{ Bindings: Env }>();

// Simple generic crypto function to create a random string
const generateToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
};

authRouter.post("/login", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: "Valid email is required" }, 400);
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in D1
    await c.env.DB.prepare(
      "INSERT INTO auth_tokens (token, email, expires_at) VALUES (?, ?, ?)",
    )
      .bind(token, email, expiresAt.toISOString())
      .run();

    // In a real environment, we'd use c.env.SEND_EMAIL.
    // For local dev/stubbing, we'll just log it.
    const loginUrl = `${new URL(c.req.url).origin}/api/auth/verify?token=${token}`;

    // Attempt to send email if binding exists and is a SendEmailBinding
    try {
      if (c.env.SEND_EMAIL) {
        // Create a simple email. Cloudflare's email sending beta uses a specific format.
        // Note: the sender MUST be configured in the CF dashboard.
        const message = {
          from: { email: "chet@distorted.work", name: "C.H.E.T." },
          to: [{ email: email }],
          subject: "Your C.H.E.T. Login Link",
          content: [
            {
              type: "text/plain",
              value: `Click this link to log in: ${loginUrl}`,
            },
          ],
        };

        // Assuming it's the standard send_email binding structure
        await c.env.SEND_EMAIL.send(message);
        // For now just output to console to avoid crashing local dev
        console.log(`[Email Stub] To: ${email}, Link: ${loginUrl}`);
      } else {
        console.log(`[Email Stub] To: ${email}, Link: ${loginUrl}`);
      }
    } catch (e) {
      console.warn("Failed to send email, falling back to log", e);
      console.log(`[Email Stub] To: ${email}, Link: ${loginUrl}`);
    }

    return c.json({
      message: "If the email is valid, a login link has been sent.",
    });
  } catch (error) {
    console.error("Login error:", error, error.stack || error.message || error);
    return c.json({ error: "Failed to process login request" }, 500);
  }
});

authRouter.get("/verify", async (c) => {
  const token = c.req.query("token");
  if (!token) {
    return c.text("Token is required", 400);
  }

  try {
    // Check token
    const tokenRecord = await c.env.DB.prepare(
      "SELECT email, expires_at, used FROM auth_tokens WHERE token = ?",
    )
      .bind(token)
      .first();

    if (!tokenRecord) {
      return c.text("Invalid token", 400);
    }

    if (tokenRecord.used) {
      return c.text("Token already used", 400);
    }

    if (new Date(tokenRecord.expires_at as string) < new Date()) {
      return c.text("Token expired", 400);
    }

    const email = tokenRecord.email as string;

    // Mark token as used
    await c.env.DB.prepare("UPDATE auth_tokens SET used = 1 WHERE token = ?")
      .bind(token)
      .run();

    // Upsert User
    const userId = crypto.randomUUID();
    await c.env.DB.prepare(
      `INSERT INTO users (id, email) VALUES (?, ?)
       ON CONFLICT(email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP`,
    )
      .bind(userId, email)
      .run();

    // Get user ID
    const userRecord = await c.env.DB.prepare(
      "SELECT id FROM users WHERE email = ?",
    )
      .bind(email)
      .first();

    const dbUserId = userRecord?.id as string;

    // Create session
    const sessionId = crypto.randomUUID();
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await c.env.DB.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    )
      .bind(sessionId, dbUserId, sessionExpiresAt.toISOString())
      .run();

    // Set cookie and redirect to app
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": `chet_session=${sessionId}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Strict`,
      },
    });
  } catch (error) {
    console.error("Verify error:", error);
    return c.text("Verification failed", 500);
  }
});

authRouter.post("/logout", async (c) => {
  // Try to get session from cookie
  const cookieHeader = c.req.header("Cookie");
  let sessionId = null;
  if (cookieHeader) {
    const match = cookieHeader.match(/chet_session=([^;]+)/);
    if (match) sessionId = match[1];
  }

  if (sessionId) {
    await c.env.DB.prepare("DELETE FROM sessions WHERE id = ?")
      .bind(sessionId)
      .run();
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `chet_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`,
    },
  });
});

import { Context, Next } from "hono";

export const requireAuth = async (c: Context, next: Next) => {
  const cookieHeader = c.req.header("Cookie");
  let sessionId = null;
  if (cookieHeader) {
    const match = cookieHeader.match(/chet_session=([^;]+)/);
    if (match) sessionId = match[1];
  }

  // Also check auth header as fallback for API clients
  if (!sessionId) {
    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      sessionId = authHeader.substring(7);
    }
  }

  if (!sessionId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const session = await c.env.DB.prepare(
      "SELECT user_id, expires_at FROM sessions WHERE id = ?",
    )
      .bind(sessionId)
      .first();

    if (!session || new Date(session.expires_at as string) < new Date()) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Add user info to context
    c.set("userId", session.user_id);
    c.set("sessionId", sessionId);
    await next();
  } catch (error) {
    console.error("Auth middleware error:", error, error.stack || error.message || error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
