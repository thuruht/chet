import { Agent } from "agents";
import type { Env, ChetAgentState, ChatMessage } from "./types.js";
import { AGENT_CONFIGS, MODELS } from "./config.js";

/**
 * ChetAgent is an Agent that handles chat interactions.
 */
export class ChetAgentV2 extends Agent<Env, ChetAgentState> {
  // Set the initial state for new agent instances
  initialState: ChetAgentState = {
    messages: [{ role: "system", content: AGENT_CONFIGS.DEFAULT.systemPrompt }],
  };

  async onRequest(request: Request): Promise<Response> {
    switch (request.method) {
      case "GET": {
        if (!this.state.messages || this.state.messages.length <= 1) {
          return new Response(JSON.stringify({ messages: [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify(this.state), {
          headers: { "Content-Type": "application/json" },
        });
      }

      case "POST": {
        try {
          const body = await request.json<{
            content: string;
            model?: string;
            [key: string]: any;
          }>();
          const {
            content,
            model = AGENT_CONFIGS.DEFAULT.model,
            ...params
          } = body;

          if (!content) {
            return new Response(
              JSON.stringify({ error: "Invalid request: content is required" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          const userMessage: ChatMessage = { role: "user", content };
          const messages = [...this.state.messages, userMessage];

          // Inject user context from D1 into the system prompt
          const userId = request.headers.get("x-user-id");
          if (userId) {
            try {
              const memory = await this.env.DB.prepare(
                "SELECT preferences, context FROM user_memory WHERE user_id = ?",
              )
                .bind(userId)
                .first();

              if (memory) {
                const prefs = JSON.parse(
                  (memory.preferences as string) || "{}",
                );
                const ctx = (memory.context as string) || "";

                // Update the system prompt to include memory
                const sysMsg = messages.find((m) => m.role === "system");
                if (sysMsg) {
                  sysMsg.content += `\n\nUser Preferences: ${JSON.stringify(prefs)}\nUser Context: ${ctx}`;
                }
              }
            } catch (e) {
              console.error("Error fetching user memory:", e);
            }
          }

          this.setState({ messages });

          const modelConfig = MODELS[model];
          if (!modelConfig) {
            return new Response(
              JSON.stringify({
                error: `Invalid model specified: ${String(model)}`,
              }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              },
            );
          }

          const aiParams: any = {
            messages,
            stream: true,
            max_tokens: Math.min(
              params.maxTokens ?? modelConfig.maxTokensDefault,
              modelConfig.maxTokensMax,
            ),
            ...params,
          };

          const aiResponse = await this.env.AI.run(
            modelConfig.id as any,
            aiParams,
          );

          if (!(aiResponse instanceof ReadableStream)) {
            // Unlikely if stream: true, but just in case
            const assistantMessage: ChatMessage = {
              role: "assistant",
              content: (aiResponse as any).response || "",
            };
            this.setState({ messages: [...messages, assistantMessage] });
            return new Response(JSON.stringify(aiResponse), {
              headers: { "Content-Type": "application/json" },
            });
          }

          const { readable, writable } = new TransformStream();
          const writer = writable.getWriter();
          const decoder = new TextDecoder();
          let fullResponse = "";

          const pump = async () => {
            const reader = aiResponse.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  const assistantMessage: ChatMessage = {
                    role: "assistant",
                    content: fullResponse,
                  };
                  this.setState({ messages: [...messages, assistantMessage] });
                  writer.close();
                  break;
                }

                // Write the raw bytes directly to the output stream
                await writer.write(value);

                // Extract text for state saving
                const chunk = decoder.decode(value, { stream: true });
                for (const line of chunk.split("\n")) {
                  if (
                    line.trim().startsWith("data: ") &&
                    line.trim() !== "data: [DONE]"
                  ) {
                    const jsonStr = line.trim().substring(6);
                    try {
                      const parsed = JSON.parse(jsonStr);
                      if (parsed.response) {
                        fullResponse += parsed.response;
                      }
                    } catch (e) {
                      // Ignore parsing errors for partial lines
                    }
                  }
                }
              }
            } catch (err) {
              console.error("Stream pump error:", err);
              writer.abort(err);
            }
          };

          pump();

          return new Response(readable, {
            headers: { "Content-Type": "text/event-stream" },
          });
        } catch (error: any) {
          console.error("Error in ChetAgent POST:", error);

          let status = 500;
          let detail = error?.message || String(error);

          // Check for Cloudflare specific error properties
          if (error?.status || error?.statusCode) {
            status = error.status || error.statusCode;
          }
          if (error?.details) {
            detail += ` - ${JSON.stringify(error.details)}`;
          }

          return new Response(
            JSON.stringify({
              error: "Failed to process request",
              detail,
              isAiError: !!error?.statusCode,
            }),
            {
              status,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }

      case "DELETE": {
        this.setState(this.initialState);
        return new Response(null, { status: 204 });
      }

      default:
        return new Response("Method Not Allowed", { status: 405 });
    }
  }
}
