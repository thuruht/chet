import { Hono } from "hono";
import { Env } from "../lib/types.js";

export const ragRouter = new Hono<{ Bindings: Env }>();

ragRouter.post("/index", async (c) => {
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const { filename, content } = await c.req.json();
    if (!filename || !content)
      return c.json({ error: "Filename and content required" }, 400);

    // 1. Save document metadata
    const docId = crypto.randomUUID();
    await c.env.DB.prepare(
      "INSERT INTO documents (id, user_id, filename, content_type, size) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(docId, userId, filename, "text/plain", content.length)
      .run();

    // 2. Generate Embeddings using Workers AI
    const model = "@cf/baai/bge-base-en-v1.5";
    // Split content into chunks
    const chunks = content.match(/[\s\S]{1,1000}/g) || [content];

    // In a real scenario, map over chunks and vectorize
    const { data } = await c.env.AI.run(model, { text: chunks });

    // 3. Insert into Vectorize Index
    if (c.env.VECTORIZE_INDEX) {
      const vectors = chunks.map((chunk: string, i: number) => ({
        id: `${docId}-${i}`,
        values: data[i] || data[0], // fallback if data is flat
        namespace: userId,
        metadata: { docId, filename, chunkIndex: i, text: chunk },
      }));
      await c.env.VECTORIZE_INDEX.upsert(vectors);
    }

    return c.json({ success: true, docId, chunks: chunks.length });
  } catch (error) {
    console.error("RAG index error:", error);
    return c.json({ error: "Failed to index document" }, 500);
  }
});

ragRouter.post("/search", async (c) => {
  const userId = c.get("userId");
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const { query } = await c.req.json();
    if (!query) return c.json({ error: "Query required" }, 400);

    const model = "@cf/baai/bge-base-en-v1.5";
    const { data } = await c.env.AI.run(model, { text: [query] });

    if (c.env.VECTORIZE_INDEX && data[0]) {
      const results = await c.env.VECTORIZE_INDEX.query(data[0], {
        topK: 5,
        namespace: userId,
        returnValues: true,
        returnMetadata: true,
      });
      return c.json({ results: results.matches });
    }

    return c.json({ results: [] });
  } catch (error) {
    console.error("RAG search error:", error);
    return c.json({ error: "Failed to search" }, 500);
  }
});
