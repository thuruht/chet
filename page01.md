<page>
---
title: Agents · Cloudflare Agents docs
description: The Agents SDK enables you to build and deploy AI-powered agents
  that can autonomously perform tasks, communicate with clients in real time,
  call AI models, persist state, schedule tasks, run asynchronous workflows,
  browse the web, query data from your database, support human-in-the-loop
  interactions, and a lot more.
lastUpdated: 2025-03-18T12:13:40.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/agents/
  md: https://developers.cloudflare.com/agents/index.md
---

The Agents SDK enables you to build and deploy AI-powered agents that can autonomously perform tasks, communicate with clients in real time, call AI models, persist state, schedule tasks, run asynchronous workflows, browse the web, query data from your database, support human-in-the-loop interactions, and [a lot more](https://developers.cloudflare.com/agents/api-reference/).

### Ship your first Agent

To use the Agent starter template and create your first Agent with the Agents SDK:

```sh
# install it
npm create cloudflare@latest agents-starter -- --template=cloudflare/agents-starter
# and deploy it
npx wrangler@latest deploy
```

Head to the guide on [building a chat agent](https://developers.cloudflare.com/agents/getting-started/build-a-chat-agent) to learn how the starter project is built and how to use it as a foundation for your own agents.

If you're already building on [Workers](https://developers.cloudflare.com/workers/), you can install the `agents` package directly into an existing project:

```sh
npm i agents
```

And then define your first Agent by creating a class that extends the `Agent` class:

* JavaScript

  ```js
  import { Agent, AgentNamespace } from "agents";


  export class MyAgent extends Agent {
    // Define methods on the Agent:
    // https://developers.cloudflare.com/agents/api-reference/agents-api/
    //
    // Every Agent has built in state via this.setState and this.sql
    // Built-in scheduling via this.schedule
    // Agents support WebSockets, HTTP requests, state synchronization and
    // can run for seconds, minutes or hours: as long as the tasks need.
  }
  ```

* TypeScript

  ```ts
  import { Agent, AgentNamespace } from 'agents';


  export class MyAgent extends Agent {
    // Define methods on the Agent:
    // https://developers.cloudflare.com/agents/api-reference/agents-api/
    //
    // Every Agent has built in state via this.setState and this.sql
    // Built-in scheduling via this.schedule
    // Agents support WebSockets, HTTP requests, state synchronization and
    // can run for seconds, minutes or hours: as long as the tasks need.
  }
  ```

Dive into the [Agent SDK reference](https://developers.cloudflare.com/agents/api-reference/agents-api/) to learn more about how to use the Agents SDK package and defining an `Agent`.

### Why build agents on Cloudflare?

We built the Agents SDK with a few things in mind:

* **Batteries (state) included**: Agents come with [built-in state management](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/), with the ability to automatically sync state between an Agent and clients, trigger events on state changes, and read+write to each Agent's SQL database.
* **Communicative**: You can connect to an Agent via [WebSockets](https://developers.cloudflare.com/agents/api-reference/websockets/) and stream updates back to client in real-time. Handle a long-running response from a reasoning model, the results of an [asynchronous workflow](https://developers.cloudflare.com/agents/api-reference/run-workflows/), or build a chat app that builds on the `useAgent` hook included in the Agents SDK.
* **Extensible**: Agents are code. Use the [AI models](https://developers.cloudflare.com/agents/api-reference/using-ai-models/) you want, bring-your-own headless browser service, pull data from your database hosted in another cloud, add your own methods to your Agent and call them.

Agents built with Agents SDK can be deployed directly to Cloudflare and run on top of [Durable Objects](https://developers.cloudflare.com/durable-objects/) — which you can think of as stateful micro-servers that can scale to tens of millions — and are able to run wherever they need to. Run your Agents close to a user for low-latency interactivity, close to your data for throughput, and/or anywhere in between.

***

### Build on the Cloudflare Platform

**[Workers](https://developers.cloudflare.com/workers/)**

Build serverless applications and deploy instantly across the globe for exceptional performance, reliability, and scale.

**[AI Gateway](https://developers.cloudflare.com/ai-gateway/)**

Observe and control your AI applications with caching, rate limiting, request retries, model fallback, and more.

**[Vectorize](https://developers.cloudflare.com/vectorize/)**

Build full-stack AI applications with Vectorize, Cloudflare’s vector database. Adding Vectorize enables you to perform tasks such as semantic search, recommendations, anomaly detection or can be used to provide context and memory to an LLM.

**[Workers AI](https://developers.cloudflare.com/workers-ai/)**

Run machine learning models, powered by serverless GPUs, on Cloudflare's global network.

**[Workflows](https://developers.cloudflare.com/workflows/)**

Build stateful agents that guarantee executions, including automatic retries, persistent state that runs for minutes, hours, days, or weeks.

</page>

<page>
---
title: 404 - Page Not Found · Cloudflare Agents docs
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/agents/404/
  md: https://developers.cloudflare.com/agents/404/index.md
---

# 404

Check the URL, try using our [search](https://developers.cloudflare.com/search/) or try our LLM-friendly [llms.txt directory](https://developers.cloudflare.com/llms.txt).

</page>

<page>
---
title: API Reference · Cloudflare Agents docs
description: "Learn more about what Agents can do, the Agent class, and the APIs
  that Agents expose:"
lastUpdated: 2025-03-18T12:13:40.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/agents/api-reference/
  md: https://developers.cloudflare.com/agents/api-reference/index.md
---

Learn more about what Agents can do, the `Agent` class, and the APIs that Agents expose:

* [Agents API](https://developers.cloudflare.com/agents/api-reference/agents-api/)
* [Calling Agents](https://developers.cloudflare.com/agents/api-reference/calling-agents/)
* [Using AI Models](https://developers.cloudflare.com/agents/api-reference/using-ai-models/)
* [Schedule tasks](https://developers.cloudflare.com/agents/api-reference/schedule-tasks/)
* [Run Workflows](https://developers.cloudflare.com/agents/api-reference/run-workflows/)
* [Store and sync state](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/)
* [Browse the web](https://developers.cloudflare.com/agents/api-reference/browse-the-web/)
* [HTTP and Server-Sent Events](https://developers.cloudflare.com/agents/api-reference/http-sse/)
* [Retrieval Augmented Generation](https://developers.cloudflare.com/agents/api-reference/rag/)
* [Using WebSockets](https://developers.cloudflare.com/agents/api-reference/websockets/)
* [Configuration](https://developers.cloudflare.com/agents/api-reference/configuration/)

</page>

<page>
---
title: Concepts · Cloudflare Agents docs
lastUpdated: 2025-02-25T13:55:21.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/agents/concepts/
  md: https://developers.cloudflare.com/agents/concepts/index.md
---

* [Agents](https://developers.cloudflare.com/agents/concepts/what-are-agents/)
* [Workflows](https://developers.cloudflare.com/agents/concepts/workflows/)
* [Tools](https://developers.cloudflare.com/agents/concepts/tools/)
* [Human in the Loop](https://developers.cloudflare.com/agents/concepts/human-in-the-loop/)
* [Calling LLMs](https://developers.cloudflare.com/agents/concepts/calling-llms/)

</page>

<page>
---
title: Getting started · Cloudflare Agents docs
lastUpdated: 2025-02-25T13:55:21.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/agents/getting-started/
  md: https://developers.cloudflare.com/agents/getting-started/index.md
---

* [Build a Chat Agent](https://github.com/cloudflare/agents-starter)
* [Testing your Agents](https://developers.cloudflare.com/agents/getting-started/testing-your-agent/)
* [Prompt an AI model](https://developers.cloudflare.com/workers/get-started/prompting/)

</page>

<page>
---
title: Guides · Cloudflare Agents docs
lastUpdated: 2025-02-25T13:55:21.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/agents/guides/
  md: https://developers.cloudflare.com/agents/guides/index.md
---

* [Build a Human-in-the-loop Agent](https://github.com/cloudflare/agents/tree/main/guides/human-in-the-loop)
* [Implement Effective Agent Patterns](https://github.com/cloudflare/agents/tree/main/guides/anthropic-patterns)
* [Build a Remote MCP server](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)
* [Test a Remote MCP Server](https://developers.cloudflare.com/agents/guides/test-remote-mcp-server/)
* [Build a Remote MCP Client](https://github.com/cloudflare/ai/tree/main/demos/mcp-client)

</page>

<page>
---
title: Model Context Protocol (MCP) · Cloudflare Agents docs
description: You can build and deploy Model Context Protocol (MCP) servers on Cloudflare.
lastUpdated: 2025-05-01T13:39:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/agents/model-context-protocol/
  md: https://developers.cloudflare.com/agents/model-context-protocol/index.md
---

You can build and deploy [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers on Cloudflare.

## What is the Model Context Protocol (MCP)?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard that connects AI systems with external applications. Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect your devices to various accessories, MCP provides a standardized way to connect AI agents to different services.

### MCP Terminology

* **MCP Hosts**: AI assistants (like [Claude](http://claude.ai) or [Cursor](http://cursor.com)), AI agents, or applications that need to access external capabilities.
* **MCP Clients**: Clients embedded within the MCP hosts that connect to MCP servers and invoke tools. Each MCP client instance has a single connection to an MCP server.
* **MCP Servers**: Applications that expose [tools](https://developers.cloudflare.com/agents/model-context-protocol/tools/), [prompts](https://modelcontextprotocol.io/docs/concepts/prompts), and [resources](https://modelcontextprotocol.io/docs/concepts/resources) that MCP clients can use.

### Remote vs. local MCP connections

The MCP standard supports two modes of operation:

* **Remote MCP connections**: MCP clients connect to MCP servers over the Internet, establishing a [long-lived connection using HTTP and Server-Sent Events (SSE)](https://developers.cloudflare.com/agents/model-context-protocol/transport/), and authorizing the MCP client access to resources on the user's account using [OAuth](https://developers.cloudflare.com/agents/model-context-protocol/authorization/).
* **Local MCP connections**: MCP clients connect to MCP servers on the same machine, using [stdio](https://spec.modelcontextprotocol.io/specification/draft/basic/transports/#stdio) as a local transport method.

### Best Practices

* **Tool design**: Do not treat your MCP server as a wrapper around your full API schema. Instead, build tools that are optimized for specific user goals and reliable outcomes. Fewer, well-designed tools often outperform many granular ones, especially for agents with small context windows or tight latency budgets.
* **Scoped permissions**: Deploying several focused MCP servers, each with narrowly scoped permissions, reduces the risk of over-privileged access and makes it easier to manage and audit what each server is allowed to do.
* **Tool descriptions**: Detailed parameter descriptions help agents understand how to use your tools correctly — including what values are expected, how they affect behavior, and any important constraints. This reduces errors and improves reliability.
* **Evaluation tests**: Use evaluation tests ('evals') to measure the agent’s ability to use your tools correctly. Run these after any updates to your server or tool descriptions to catch regressions early and track improvements over time.

### Get Started

Go to the [Getting Started](https://developers.cloudflare.com/agents/guides/remote-mcp-server/) guide to learn how to build and deploy your first remote MCP server to Cloudflare.

</page>

<page>
---
title: Platform · Cloudflare Agents docs
lastUpdated: 2025-03-18T12:13:40.000Z
chatbotDeprioritize: true
source_url:
  html: https://developers.cloudflare.com/agents/platform/
  md: https://developers.cloudflare.com/agents/platform/index.md
---

* [Limits](https://developers.cloudflare.com/agents/platform/limits/)
* [Prompt Engineering](https://developers.cloudflare.com/workers/get-started/prompting/)
* [prompt.txt](https://developers.cloudflare.com/workers/prompt.txt)

</page>

<page>
---
title: Agents API · Cloudflare Agents docs
description: This page provides an overview of the Agent SDK API, including the
  Agent class, methods and properties built-in to the Agents SDK.
lastUpdated: 2025-06-26T18:43:59.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/agents/api-reference/agents-api/
  md: https://developers.cloudflare.com/agents/api-reference/agents-api/index.md
---

This page provides an overview of the Agent SDK API, including the `Agent` class, methods and properties built-in to the Agents SDK.

The Agents SDK exposes two main APIs:

* The server-side `Agent` class. An Agent encapsulates all of the logic for an Agent, including how clients can connect to it, how it stores state, the methods it exposes, how to call AI models, and any error handling.
* The client-side `AgentClient` class, which allows you to connect to an Agent instance from a client-side application. The client APIs also include React hooks, including `useAgent` and `useAgentChat`, and allow you to automatically synchronize state between each unique Agent (running server-side) and your client applications.

Note

Agents require [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/), see [Configuration](https://developers.cloudflare.com/agents/getting-started/testing-your-agent/#add-the-agent-configuration) to learn how to add the required bindings to your project.

You can also find more specific usage examples for each API in the [Agents API Reference](https://developers.cloudflare.com/agents/api-reference/).

* JavaScript

  ```js
  import { Agent } from "agents";


  class MyAgent extends Agent {
    // Define methods on the Agent
  }


  export default MyAgent;
  ```

* TypeScript

  ```ts
  import { Agent } from "agents";


  class MyAgent extends Agent {
    // Define methods on the Agent
  }


  export default MyAgent;
  ```

An Agent can have many (millions of) instances: each instance is a separate micro-server that runs independently of the others. This allows Agents to scale horizontally: an Agent can be associated with a single user, or many thousands of users, depending on the agent you're building.

Instances of an Agent are addressed by a unique identifier: that identifier (ID) can be the user ID, an email address, GitHub username, a flight ticket number, an invoice ID, or any other identifier that helps to uniquely identify the instance and for whom it is acting on behalf of.

Note

An instance of an Agent is globally unique: given the same name (or ID), you will always get the same instance of an agent.

This allows you to avoid synchronizing state across requests: if an Agent instance represents a specific user, team, channel or other entity, you can use the Agent instance to store state for that entity. No need to set up a centralized session store.

If the client disconnects, you can always route the client back to the exact same Agent and pick up where they left off.

### Agent class API

Writing an Agent requires you to define a class that extends the `Agent` class from the Agents SDK package. An Agent encapsulates all of the logic for an Agent, including how clients can connect to it, how it stores state, the methods it exposes, and any error handling.

You can also define your own methods on an Agent: it's technically valid to publish an Agent only has your own methods exposed, and create/get Agents directly from a Worker.

Your own methods can access the Agent's environment variables and bindings on `this.env`, state on `this.setState`, and call other methods on the Agent via `this.yourMethodName`.

* JavaScript

  ```js
  import { Agent } from "agents";


  // Pass the Env as a TypeScript type argument
  // Any services connected to your Agent or Worker as Bindings
  // are then available on this.env.<BINDING_NAME>


  // The core class for creating Agents that can maintain state, orchestrate
  // complex AI workflows, schedule tasks, and interact with users and other
  // Agents.
  class MyAgent extends Agent {
    // Optional initial state definition
    initialState = {
      counter: 0,
      messages: [],
      lastUpdated: null,
    };


    // Called when a new Agent instance starts or wakes from hibernation
    async onStart() {
      console.log("Agent started with state:", this.state);
    }


    // Handle HTTP requests coming to this Agent instance
    // Returns a Response object
    async onRequest(request) {
      return new Response("Hello from Agent!");
    }


    // Called when a WebSocket connection is established
    // Access the original request via ctx.request for auth etc.
    async onConnect(connection, ctx) {
      // Connections are automatically accepted by the SDK.
      // You can also explicitly close a connection here with connection.close()
      // Access the Request on ctx.request to inspect headers, cookies and the URL
    }


    // Called for each message received on a WebSocket connection
    // Message can be string, ArrayBuffer, or ArrayBufferView
    async onMessage(connection, message) {
      // Handle incoming messages
      connection.send("Received your message");
    }


    // Handle WebSocket connection errors
    async onError(connection, error) {
      console.error(`Connection error:`, error);
    }


    // Handle WebSocket connection close events
    async onClose(connection, code, reason, wasClean) {
      console.log(`Connection closed: ${code} - ${reason}`);
    }


    // Called when the Agent's state is updated from any source
    // source can be "server" or a client Connection
    onStateUpdate(state, source) {
      console.log("State updated:", state, "Source:", source);
    }


    // You can define your own custom methods to be called by requests,
    // WebSocket messages, or scheduled tasks
    async customProcessingMethod(data) {
      // Process data, update state, schedule tasks, etc.
      this.setState({ ...this.state, lastUpdated: new Date() });
    }
  }
  ```

* TypeScript

  ```ts
  import { Agent } from "agents";


  interface Env {
    // Define environment variables & bindings here
  }


  // Pass the Env as a TypeScript type argument
  // Any services connected to your Agent or Worker as Bindings
  // are then available on this.env.<BINDING_NAME>


  // The core class for creating Agents that can maintain state, orchestrate
  // complex AI workflows, schedule tasks, and interact with users and other
  // Agents.
  class MyAgent extends Agent<Env, State> {
    // Optional initial state definition
    initialState = {
      counter: 0,
      messages: [],
      lastUpdated: null
    };


    // Called when a new Agent instance starts or wakes from hibernation
    async onStart() {
      console.log('Agent started with state:', this.state);
    }


    // Handle HTTP requests coming to this Agent instance
    // Returns a Response object
    async onRequest(request: Request): Promise<Response> {
      return new Response("Hello from Agent!");
    }


    // Called when a WebSocket connection is established
    // Access the original request via ctx.request for auth etc.
    async onConnect(connection: Connection, ctx: ConnectionContext) {
      // Connections are automatically accepted by the SDK.
      // You can also explicitly close a connection here with connection.close()
      // Access the Request on ctx.request to inspect headers, cookies and the URL
    }


    // Called for each message received on a WebSocket connection
    // Message can be string, ArrayBuffer, or ArrayBufferView
    async onMessage(connection: Connection, message: WSMessage) {
      // Handle incoming messages
      connection.send("Received your message");
    }


    // Handle WebSocket connection errors
    async onError(connection: Connection, error: unknown): Promise<void> {
      console.error(`Connection error:`, error);
    }


    // Handle WebSocket connection close events
    async onClose(connection: Connection, code: number, reason: string, wasClean: boolean): Promise<void> {
      console.log(`Connection closed: ${code} - ${reason}`);
    }


    // Called when the Agent's state is updated from any source
    // source can be "server" or a client Connection
    onStateUpdate(state: State, source: "server" | Connection) {
      console.log("State updated:", state, "Source:", source);
    }


    // You can define your own custom methods to be called by requests,
    // WebSocket messages, or scheduled tasks
    async customProcessingMethod(data: any) {
      // Process data, update state, schedule tasks, etc.
      this.setState({ ...this.state, lastUpdated: new Date() });
    }
  }
  ```

- JavaScript

  ```js
  // Basic Agent implementation with custom methods
  import { Agent } from "agents";


  class MyAgent extends Agent {
    initialState = {
      counter: 0,
      lastUpdated: null,
    };


    async onRequest(request) {
      if (request.method === "POST") {
        await this.incrementCounter();
        return new Response(JSON.stringify(this.state), {
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(this.state), {
        headers: { "Content-Type": "application/json" },
      });
    }


    async incrementCounter() {
      this.setState({
        counter: this.state.counter + 1,
        lastUpdated: new Date(),
      });
    }
  }
  ```

- TypeScript

  ```ts
  // Basic Agent implementation with custom methods
  import { Agent } from "agents";


  interface MyState {
    counter: number;
    lastUpdated: Date | null;
  }


  class MyAgent extends Agent<Env, MyState> {
    initialState = {
      counter: 0,
      lastUpdated: null
    };


    async onRequest(request: Request) {
      if (request.method === "POST") {
        await this.incrementCounter();
        return new Response(JSON.stringify(this.state), {
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify(this.state), {
        headers: { "Content-Type": "application/json" }
      });
    }


    async incrementCounter() {
      this.setState({
        counter: this.state.counter + 1,
        lastUpdated: new Date()
      });
    }
  }
  ```

### WebSocket API

The WebSocket API allows you to accept and manage WebSocket connections made to an Agent.

#### Connection

Represents a WebSocket connection to an Agent.

```ts
// WebSocket connection interface
interface Connection<State = unknown> {
  // Unique ID for this connection
  id: string;


  // Client-specific state attached to this connection
  state: State;


  // Update the connection's state
  setState(state: State): void;


  // Accept an incoming WebSocket connection
  accept(): void;


  // Close the WebSocket connection with optional code and reason
  close(code?: number, reason?: string): void;


  // Send a message to the client
  // Can be string, ArrayBuffer, or ArrayBufferView
  send(message: string | ArrayBuffer | ArrayBufferView): void;
}
```

* JavaScript

  ```js
  // Example of handling WebSocket messages
  export class YourAgent extends Agent {
    async onMessage(connection, message) {
      if (typeof message === "string") {
        try {
          // Parse JSON message
          const data = JSON.parse(message);


          if (data.type === "update") {
            // Update connection-specific state
            connection.setState({ ...connection.state, lastActive: Date.now() });


            // Update global Agent state
            this.setState({
              ...this.state,
              connections: this.state.connections + 1,
            });


            // Send response back to this client only
            connection.send(
              JSON.stringify({
                type: "updated",
                status: "success",
              }),
            );
          }
        } catch (e) {
          connection.send(JSON.stringify({ error: "Invalid message format" }));
        }
      }
    }
  }
  ```

* TypeScript

  ```ts
  // Example of handling WebSocket messages
  export class YourAgent extends Agent {
    async onMessage(connection: Connection, message: WSMessage) {
      if (typeof message === 'string') {
        try {
          // Parse JSON message
          const data = JSON.parse(message);


          if (data.type === 'update') {
            // Update connection-specific state
            connection.setState({ ...connection.state, lastActive: Date.now() });


            // Update global Agent state
            this.setState({
              ...this.state,
              connections: this.state.connections + 1
            });


            // Send response back to this client only
            connection.send(JSON.stringify({
              type: 'updated',
              status: 'success'
            }));
          }
        } catch (e) {
          connection.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      }
    }
  }
  ```

#### WSMessage

Types of messages that can be received from a WebSocket.

```ts
// Types of messages that can be received from WebSockets
type WSMessage = string | ArrayBuffer | ArrayBufferView;
```

#### ConnectionContext

Context information for a WebSocket connection.

```ts
// Context available during WebSocket connection
interface ConnectionContext {
  // The original HTTP request that initiated the WebSocket connection
  request: Request;
}
```

### State synchronization API

Note

To learn more about how to manage state within an Agent, refer to the documentation on [managing and syncing state](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/).

#### State

Methods and types for managing Agent state.

```ts
// State management in the Agent class
class Agent<Env, State = unknown> {
  // Initial state that will be set if no state exists yet
  initialState: State = {} as unknown as State;


  // Current state of the Agent, persisted across restarts
  get state(): State;


  // Update the Agent's state
  // Persists to storage and notifies all connected clients
  setState(state: State): void;


  // Called when state is updated from any source
  // Override to react to state changes
  onStateUpdate(state: State, source: "server" | Connection): void;
}
```

* JavaScript

  ```js
  // Example of state management in an Agent


  // Inside your Agent class
  export class YourAgent extends Agent {
    async addMessage(sender, text) {
      // Update state with new message
      this.setState({
        ...this.state,
        messages: [
          ...this.state.messages,
          { sender, text, timestamp: Date.now() },
        ].slice(-this.state.settings.maxHistoryLength), // Maintain max history
      });


      // The onStateUpdate method will automatically be called
      // and all connected clients will receive the update
    }


    // Override onStateUpdate to add custom behavior when state changes
    onStateUpdate(state, source) {
      console.log(
        `State updated by ${source === "server" ? "server" : "client"}`,
      );


      // You could trigger additional actions based on state changes
      if (state.messages.length > 0) {
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage.text.includes("@everyone")) {
          this.notifyAllParticipants(lastMessage);
        }
      }
    }
  }
  ```

* TypeScript

  ```ts
  // Example of state management in an Agent
  interface ChatState {
    messages: Array<{ sender: string; text: string; timestamp: number }>;
    participants: string[];
    settings: {
      allowAnonymous: boolean;
      maxHistoryLength: number;
    };
  }


  interface Env {
    // Your bindings and environment variables
  }


  // Inside your Agent class
  export class YourAgent extends Agent<Env, ChatState> {
    async addMessage(sender: string, text: string) {
      // Update state with new message
      this.setState({
        ...this.state,
        messages: [
          ...this.state.messages,
          { sender, text, timestamp: Date.now() }
        ].slice(-this.state.settings.maxHistoryLength) // Maintain max history
      });


      // The onStateUpdate method will automatically be called
      // and all connected clients will receive the update
    }


    // Override onStateUpdate to add custom behavior when state changes
    onStateUpdate(state: ChatState, source: "server" | Connection) {
      console.log(`State updated by ${source === "server" ? "server" : "client"}`);


      // You could trigger additional actions based on state changes
      if (state.messages.length > 0) {
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage.text.includes('@everyone')) {
          this.notifyAllParticipants(lastMessage);
        }
      }
    }
  }
  ```

### Scheduling API

#### Scheduling tasks

Schedule tasks to run at a specified time in the future.

```ts
// Scheduling API for running tasks in the future
class Agent<Env, State = unknown> {
  // Schedule a task to run in the future
  // when: seconds from now, specific Date, or cron expression
  // callback: method name on the Agent to call
  // payload: data to pass to the callback
  // Returns a Schedule object with the task ID
  async schedule<T = any>(
    when: Date | string | number,
    callback: keyof this,
    payload?: T
  ): Promise<Schedule<T>>;


  // Get a scheduled task by ID
  // Returns undefined if the task doesn't exist
  async getSchedule<T = any>(id: string): Promise<Schedule<T> | undefined>;


  // Get all scheduled tasks matching the criteria
  // Returns an array of Schedule objects
  getSchedules<T = any>(criteria?: {
    description?: string;
    id?: string;
    type?: "scheduled" | "delayed" | "cron";
    timeRange?: { start?: Date; end?: Date };
  }): Schedule<T>[];


  // Cancel a scheduled task by ID
  // Returns true if the task was cancelled, false otherwise
  async cancelSchedule(id: string): Promise<boolean>;
}
```

* JavaScript

  ```js
  // Example of scheduling in an Agent


  export class YourAgent extends Agent {
    // Schedule a one-time reminder in 2 hours
    async scheduleReminder(userId, message) {
      const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);


      const schedule = await this.schedule(twoHoursFromNow, "sendReminder", {
        userId,
        message,
        channel: "email",
      });


      console.log(`Scheduled reminder with ID: ${schedule.id}`);
      return schedule.id;
    }


    // Schedule a recurring daily task using cron
    async scheduleDailyReport() {
      // Run at 08:00 AM every day
      const schedule = await this.schedule(
        "0 8 * * *", // Cron expression: minute hour day month weekday
        "generateDailyReport",
        { reportType: "daily-summary" },
      );


      console.log(`Scheduled daily report with ID: ${schedule.id}`);
      return schedule.id;
    }


    // Method that will be called when the scheduled task runs
    async sendReminder(data) {
      console.log(`Sending reminder to ${data.userId}: ${data.message}`);
      // Add code to send the actual notification
    }
  }
  ```

* TypeScript

  ```ts
  // Example of scheduling in an Agent
  interface ReminderData {
    userId: string;
    message: string;
    channel: string;
  }


  export class YourAgent extends Agent {
    // Schedule a one-time reminder in 2 hours
    async scheduleReminder(userId: string, message: string) {
      const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);


      const schedule = await this.schedule<ReminderData>(
        twoHoursFromNow,
        'sendReminder',
        { userId, message, channel: 'email' }
      );


      console.log(`Scheduled reminder with ID: ${schedule.id}`);
      return schedule.id;
    }


    // Schedule a recurring daily task using cron
    async scheduleDailyReport() {
      // Run at 08:00 AM every day
      const schedule = await this.schedule(
        '0 8 * * *',  // Cron expression: minute hour day month weekday
        'generateDailyReport',
        { reportType: 'daily-summary' }
      );


      console.log(`Scheduled daily report with ID: ${schedule.id}`);
      return schedule.id;
    }


    // Method that will be called when the scheduled task runs
    async sendReminder(data: ReminderData) {
      console.log(`Sending reminder to ${data.userId}: ${data.message}`);
      // Add code to send the actual notification
    }
  }
  ```

#### Schedule object

Represents a scheduled task.

```ts
// Represents a scheduled task
type Schedule<T = any> = {
  // Unique identifier for the schedule
  id: string;
  // Name of the method to be called
  callback: string;
  // Data to be passed to the callback
  payload: T;
} & (
  | {
      // One-time execution at a specific time
      type: "scheduled";
      // Timestamp when the task should execute
      time: number;
    }
  | {
      // Delayed execution after a certain time
      type: "delayed";
      // Timestamp when the task should execute
      time: number;
      // Number of seconds to delay execution
      delayInSeconds: number;
    }
  | {
      // Recurring execution based on cron expression
      type: "cron";
      // Timestamp for the next execution
      time: number;
      // Cron expression defining the schedule
      cron: string;
    }
);
```

* JavaScript

  ```js
  export class YourAgent extends Agent {
    // Example of managing scheduled tasks
    async viewAndManageSchedules() {
      // Get all scheduled tasks
      const allSchedules = this.getSchedules();
      console.log(`Total scheduled tasks: ${allSchedules.length}`);


      // Get tasks scheduled for a specific time range
      const upcomingSchedules = this.getSchedules({
        timeRange: {
          start: new Date(),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
        },
      });


      // Get a specific task by ID
      const taskId = "task-123";
      const specificTask = await this.getSchedule(taskId);


      if (specificTask) {
        console.log(
          `Found task: ${specificTask.callback} at ${new Date(specificTask.time)}`,
        );


        // Cancel a scheduled task
        const cancelled = await this.cancelSchedule(taskId);
        console.log(`Task cancelled: ${cancelled}`);
      }
    }
  }
  ```

* TypeScript

  ```ts
  export class YourAgent extends Agent {
    // Example of managing scheduled tasks
    async viewAndManageSchedules() {
      // Get all scheduled tasks
      const allSchedules = this.getSchedules();
      console.log(`Total scheduled tasks: ${allSchedules.length}`);


      // Get tasks scheduled for a specific time range
      const upcomingSchedules = this.getSchedules({
        timeRange: {
          start: new Date(),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
        }
      });


      // Get a specific task by ID
      const taskId = "task-123";
      const specificTask = await this.getSchedule(taskId);


      if (specificTask) {
        console.log(`Found task: ${specificTask.callback} at ${new Date(specificTask.time)}`);


        // Cancel a scheduled task
        const cancelled = await this.cancelSchedule(taskId);
        console.log(`Task cancelled: ${cancelled}`);
      }
    }
  }
  ```

### SQL API

Each Agent instance has an embedded SQLite database that can be accessed using the `this.sql` method within any method on your `Agent` class.

#### SQL queries

Execute SQL queries against the Agent's built-in SQLite database using the `this.sql` method within any method on your `Agent` class.

```ts
// SQL query API for the Agent's embedded database
class Agent<Env, State = unknown> {
  // Execute a SQL query with tagged template literals
  // Returns an array of rows matching the query
  sql<T = Record<string, string | number | boolean | null>>(
    strings: TemplateStringsArray,
    ...values: (string | number | boolean | null)[]
  ): T[];
}
```

* JavaScript

  ```js
  // Example of using SQL in an Agent


  export class YourAgent extends Agent {
    async setupDatabase() {
      // Create a table if it doesn't exist
      this.sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          created_at INTEGER
        )
      `;
    }


    async createUser(id, name, email) {
      // Insert a new user
      this.sql`
        INSERT INTO users (id, name, email, created_at)
        VALUES (${id}, ${name}, ${email}, ${Date.now()})
      `;
    }


    async getUserById(id) {
      // Query a user by ID
      const users = this.sql`
        SELECT * FROM users WHERE id = ${id}
      `;


      return users.length ? users[0] : null;
    }


    async searchUsers(term) {
      // Search users with a wildcard
      return this.sql`
        SELECT * FROM users
        WHERE name LIKE ${"%" + term + "%"} OR email LIKE ${"%" + term + "%"}
        ORDER BY created_at DESC
      `;
    }
  }
  ```

* TypeScript

  ```ts
  // Example of using SQL in an Agent
  interface User {
    id: string;
    name: string;
    email: string;
    created_at: number;
  }


  export class YourAgent extends Agent {
    async setupDatabase() {
      // Create a table if it doesn't exist
      this.sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          created_at INTEGER
        )
      `;
    }


    async createUser(id: string, name: string, email: string) {
      // Insert a new user
      this.sql`
        INSERT INTO users (id, name, email, created_at)
        VALUES (${id}, ${name}, ${email}, ${Date.now()})
      `;
    }


    async getUserById(id: string): Promise<User | null> {
      // Query a user by ID
      const users = this.sql<User>`
        SELECT * FROM users WHERE id = ${id}
      `;


      return users.length ? users[0] : null;
    }


    async searchUsers(term: string): Promise<User[]> {
      // Search users with a wildcard
      return this.sql<User>`
        SELECT * FROM users
        WHERE name LIKE ${'%' + term + '%'} OR email LIKE ${'%' + term + '%'}
        ORDER BY created_at DESC
      `;
    }
  }
  ```

Note

Visit the [state management API documentation](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/) within the Agents SDK, including the native `state` APIs and the built-in `this.sql` API for storing and querying data within your Agents.

### Client API

The Agents SDK provides a set of client APIs for interacting with Agents from client-side JavaScript code, including:

* React hooks, including `useAgent` and `useAgentChat`, for connecting to Agents from client applications.
* Client-side [state syncing](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/) that allows you to subscribe to state updates between the Agent and any connected client(s) when calling `this.setState` within your Agent's code.
* The ability to call remote methods (Remote Procedure Calls; RPC) on the Agent from client-side JavaScript code using the `@callable` method decorator.

#### AgentClient

Client for connecting to an Agent from the browser.

```ts
import { AgentClient } from "agents/client";


// Options for creating an AgentClient
type AgentClientOptions = Omit<PartySocketOptions, "party" | "room"> & {
  // Name of the agent to connect to (class name in kebab-case)
  agent: string;
  // Name of the specific Agent instance (optional, defaults to "default")
  name?: string;
  // Other WebSocket options like host, protocol, etc.
};


// WebSocket client for connecting to an Agent
class AgentClient extends PartySocket {
  static fetch(opts: PartyFetchOptions): Promise<Response>;
  constructor(opts: AgentClientOptions);
}
```

* JavaScript

  ```js
  // Example of using AgentClient in the browser
  import { AgentClient } from "agents/client";


  // Connect to an Agent instance
  const client = new AgentClient({
    agent: "chat-agent", // Name of your Agent class in kebab-case
    name: "support-room-123", // Specific instance name
    host: window.location.host, // Using same host
  });


  client.onopen = () => {
    console.log("Connected to agent");
    // Send an initial message
    client.send(JSON.stringify({ type: "join", user: "user123" }));
  };


  client.onmessage = (event) => {
    // Handle incoming messages
    const data = JSON.parse(event.data);
    console.log("Received:", data);


    if (data.type === "state_update") {
      // Update local UI with new state
      updateUI(data.state);
    }
  };


  client.onclose = () => console.log("Disconnected from agent");


  // Send messages to the Agent
  function sendMessage(text) {
    client.send(
      JSON.stringify({
        type: "message",
        text,
        timestamp: Date.now(),
      }),
    );
  }
  ```

* TypeScript

  ```ts
  // Example of using AgentClient in the browser
  import { AgentClient } from "agents/client";


  // Connect to an Agent instance
  const client = new AgentClient({
    agent: "chat-agent", // Name of your Agent class in kebab-case
    name: "support-room-123", // Specific instance name
    host: window.location.host, // Using same host
  });


  client.onopen = () => {
    console.log("Connected to agent");
    // Send an initial message
    client.send(JSON.stringify({ type: "join", user: "user123" }));
  };


  client.onmessage = (event) => {
    // Handle incoming messages
    const data = JSON.parse(event.data);
    console.log("Received:", data);


    if (data.type === "state_update") {
      // Update local UI with new state
      updateUI(data.state);
    }
  };


  client.onclose = () => console.log("Disconnected from agent");


  // Send messages to the Agent
  function sendMessage(text) {
    client.send(JSON.stringify({
      type: "message",
      text,
      timestamp: Date.now()
    }));
  }
  ```

#### agentFetch

Make an HTTP request to an Agent.

```ts
import { agentFetch } from "agents/client";


// Options for the agentFetch function
type AgentClientFetchOptions = Omit<PartyFetchOptions, "party" | "room"> & {
  // Name of the agent to connect to
  agent: string;
  // Name of the specific Agent instance (optional)
  name?: string;
};


// Make an HTTP request to an Agent
function agentFetch(
  opts: AgentClientFetchOptions,
  init?: RequestInit
): Promise<Response>;
```

* JavaScript

  ```js
  // Example of using agentFetch in the browser
  import { agentFetch } from "agents/client";


  // Function to get data from an Agent
  async function fetchAgentData() {
    try {
      const response = await agentFetch(
        {
          agent: "task-manager",
          name: "user-123-tasks",
        },
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );


      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }


      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch from agent:", error);
    }
  }
  ```

* TypeScript

  ```ts
  // Example of using agentFetch in the browser
  import { agentFetch } from "agents/client";


  // Function to get data from an Agent
  async function fetchAgentData() {
    try {
      const response = await agentFetch(
        {
          agent: "task-manager",
          name: "user-123-tasks"
        },
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${userToken}`
          }
        }
      );


      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }


      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch from agent:", error);
    }
  }
  ```

### React API

The Agents SDK provides a React API for simplifying connection and routing to Agents from front-end frameworks, including React Router (Remix), Next.js, and Astro.

#### useAgent

React hook for connecting to an Agent.

```ts
import { useAgent } from "agents/react";


// Options for the useAgent hook
type UseAgentOptions<State = unknown> = Omit<
  Parameters<typeof usePartySocket>[0],
  "party" | "room"
> & {
  // Name of the agent to connect to
  agent: string;
  // Name of the specific Agent instance (optional)
  name?: string;
  // Called when the Agent's state is updated
  onStateUpdate?: (state: State, source: "server" | "client") => void;
};


// React hook for connecting to an Agent
// Returns a WebSocket connection with setState method
function useAgent<State = unknown>(
  options: UseAgentOptions<State>
): PartySocket & {
  // Update the Agent's state
  setState: (state: State) => void
};
```

### Chat Agent

The Agents SDK exposes an `AIChatAgent` class that extends the `Agent` class and exposes an `onChatMessage` method that simplifies building interactive chat agents.

You can combine this with the `useAgentChat` React hook from the `agents/ai-react` package to manage chat state and messages between a user and your Agent(s).

#### AIChatAgent

Extension of the `Agent` class with built-in chat capabilities.

```ts
import { AIChatAgent } from "agents/ai-chat-agent";
import { Message, StreamTextOnFinishCallback, ToolSet } from "ai";


// Base class for chat-specific agents
class AIChatAgent<Env = unknown, State = unknown> extends Agent<Env, State> {
  // Array of chat messages for the current conversation
  messages: Message[];


  // Handle incoming chat messages and generate a response
  // onFinish is called when the response is complete
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>
  ): Promise<Response | undefined>;


  // Persist messages within the Agent's local storage.
  async saveMessages(messages: Message[]): Promise<void>;
}
```

* JavaScript

  ```js
  // Example of extending AIChatAgent
  import { AIChatAgent } from "agents/ai-chat-agent";
  import { Message } from "ai";


  class CustomerSupportAgent extends AIChatAgent {
    // Override the onChatMessage method to customize behavior
    async onChatMessage(onFinish) {
      // Access the AI models using environment bindings
      const { openai } = this.env.AI;


      // Get the current conversation history
      const chatHistory = this.messages;


      // Generate a system prompt based on knowledge base
      const systemPrompt = await this.generateSystemPrompt();


      // Generate a response stream
      const stream = await openai.chat({
        model: "gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, ...chatHistory],
        stream: true,
      });


      // Return the streaming response
      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream" },
      });
    }


    // Helper method to generate a system prompt
    async generateSystemPrompt() {
      // Query knowledge base or use static prompt
      return `You are a helpful customer support agent.
              Respond to customer inquiries based on the following guidelines:
              - Be friendly and professional
              - If you don't know an answer, say so
              - Current company policies: ...`;
    }
  }
  ```

* TypeScript

  ```ts
  // Example of extending AIChatAgent
  import { AIChatAgent } from "agents/ai-chat-agent";
  import { Message } from "ai";


  interface Env {
    AI: any; // Your AI binding
  }


  class CustomerSupportAgent extends AIChatAgent<Env> {
    // Override the onChatMessage method to customize behavior
    async onChatMessage(onFinish) {
      // Access the AI models using environment bindings
      const { openai } = this.env.AI;


      // Get the current conversation history
      const chatHistory = this.messages;


      // Generate a system prompt based on knowledge base
      const systemPrompt = await this.generateSystemPrompt();


      // Generate a response stream
      const stream = await openai.chat({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory
        ],
        stream: true
      });


      // Return the streaming response
      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream" }
      });
    }


    // Helper method to generate a system prompt
    async generateSystemPrompt() {
      // Query knowledge base or use static prompt
      return `You are a helpful customer support agent.
              Respond to customer inquiries based on the following guidelines:
              - Be friendly and professional
              - If you don't know an answer, say so
              - Current company policies: ...`;
    }
  }
  ```

### Chat Agent React API

#### useAgentChat

React hook for building AI chat interfaces using an Agent.

```ts
import { useAgentChat } from "agents/ai-react";
import { useAgent } from "agents/react";
import type { Message } from "ai";


// Options for the useAgentChat hook
type UseAgentChatOptions = Omit<
  Parameters<typeof useChat>[0] & {
    // Agent connection from useAgent
    agent: ReturnType<typeof useAgent>;
  },
  "fetch"
>;


// React hook for building AI chat interfaces using an Agent
function useAgentChat(options: UseAgentChatOptions): {
  // Current chat messages
  messages: Message[];
  // Set messages and synchronize with the Agent
  setMessages: (messages: Message[]) => void;
  // Clear chat history on both client and Agent
  clearHistory: () => void;
  // Append a new message to the conversation
  append: (message: Message, chatRequestOptions?: any) => Promise<string | null | undefined>;
  // Reload the last user message
  reload: (chatRequestOptions?: any) => Promise<string | null | undefined>;
  // Stop the AI response generation
  stop: () => void;
  // Current input text
  input: string;
  // Set the input text
  setInput: React.Dispatch<React.SetStateAction<string>>;
  // Handle input changes
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  // Submit the current input
  handleSubmit: (event?: { preventDefault?: () => void }, chatRequestOptions?: any) => void;
  // Additional metadata
  metadata?: Object;
  // Whether a response is currently being generated
  isLoading: boolean;
  // Current status of the chat
  status: "submitted" | "streaming" | "ready" | "error";
  // Tool data from the AI response
  data?: any[];
  // Set tool data
  setData: (data: any[] | undefined | ((data: any[] | undefined) => any[] | undefined)) => void;
  // Unique ID for the chat
  id: string;
  // Add a tool result for a specific tool call
  addToolResult: ({ toolCallId, result }: { toolCallId: string; result: any }) => void;
  // Current error if any
  error: Error | undefined;
};
```

* JavaScript

  ```js
  // Example of using useAgentChat in a React component
  import { useAgentChat } from "agents/ai-react";
  import { useAgent } from "agents/react";
  import { useState } from "react";


  function ChatInterface() {
    // Connect to the chat agent
    const agentConnection = useAgent({
      agent: "customer-support",
      name: "session-12345",
    });


    // Use the useAgentChat hook with the agent connection
    const {
      messages,
      input,
      handleInputChange,
      handleSubmit,
      isLoading,
      error,
      clearHistory,
    } = useAgentChat({
      agent: agentConnection,
      initialMessages: [
        { role: "system", content: "You're chatting with our AI assistant." },
        { role: "assistant", content: "Hello! How can I help you today?" },
      ],
    });


    return (
      <div className="chat-container">
        <div className="message-history">
          {messages.map((message, i) => (
            <div key={i} className={`message ${message.role}`}>
              {message.role === "user" ? "👤" : "🤖"} {message.content}
            </div>
          ))}


          {isLoading && <div className="loading">AI is typing...</div>}
          {error && <div className="error">Error: {error.message}</div>}
        </div>


        <form onSubmit={handleSubmit} className="message-input">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </button>
          <button type="button" onClick={clearHistory}>
            Clear Chat
          </button>
        </form>
      </div>
    );
  }
  ```

* TypeScript

  ```ts
  // Example of using useAgentChat in a React component
  import { useAgentChat } from "agents/ai-react";
  import { useAgent } from "agents/react";
  import { useState } from "react";


  function ChatInterface() {
    // Connect to the chat agent
    const agentConnection = useAgent({
      agent: "customer-support",
      name: "session-12345"
    });


    // Use the useAgentChat hook with the agent connection
    const {
      messages,
      input,
      handleInputChange,
      handleSubmit,
      isLoading,
      error,
      clearHistory
    } = useAgentChat({
      agent: agentConnection,
      initialMessages: [
        { role: "system", content: "You're chatting with our AI assistant." },
        { role: "assistant", content: "Hello! How can I help you today?" }
      ]
    });


    return (
      <div className="chat-container">
        <div className="message-history">
          {messages.map((message, i) => (
            <div key={i} className={`message ${message.role}`}>
              {message.role === 'user' ? '👤' : '🤖'} {message.content}
            </div>
          ))}


          {isLoading && <div className="loading">AI is typing...</div>}
          {error && <div className="error">Error: {error.message}</div>}
        </div>


        <form onSubmit={handleSubmit} className="message-input">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </button>
          <button type="button" onClick={clearHistory}>
            Clear Chat
          </button>
        </form>
      </div>
    );
  }
  ```

### Next steps

* [Build a chat Agent](https://developers.cloudflare.com/agents/getting-started/build-a-chat-agent/) using the Agents SDK and deploy it to Workers.
* Learn more [using WebSockets](https://developers.cloudflare.com/agents/api-reference/websockets/) to build interactive Agents and stream data back from your Agent.
* [Orchestrate asynchronous workflows](https://developers.cloudflare.com/agents/api-reference/run-workflows) from your Agent by combining the Agents SDK and [Workflows](https://developers.cloudflare.com/workflows).

</page>

<page>
---
title: Browse the web · Cloudflare Agents docs
description: Agents can browse the web using the Browser Rendering API or your
  preferred headless browser service.
lastUpdated: 2025-05-16T16:37:37.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/agents/api-reference/browse-the-web/
  md: https://developers.cloudflare.com/agents/api-reference/browse-the-web/index.md
---

Agents can browse the web using the [Browser Rendering](https://developers.cloudflare.com/browser-rendering/) API or your preferred headless browser service.

### Browser Rendering API

The [Browser Rendering](https://developers.cloudflare.com/browser-rendering/) allows you to spin up headless browser instances, render web pages, and interact with websites through your Agent.

You can define a method that uses Puppeteer to pull the content of a web page, parse the DOM, and extract relevant information by calling the OpenAI model:

* JavaScript

  ```js
  export class MyAgent extends Agent {
    async browse(browserInstance, urls) {
      let responses = [];
      for (const url of urls) {
        const browser = await puppeteer.launch(browserInstance);
        const page = await browser.newPage();
        await page.goto(url);


        await page.waitForSelector("body");
        const bodyContent = await page.$eval(
          "body",
          (element) => element.innerHTML,
        );
        const client = new OpenAI({
          apiKey: this.env.OPENAI_API_KEY,
        });


        let resp = await client.chat.completions.create({
          model: this.env.MODEL,
          messages: [
            {
              role: "user",
              content: `Return a JSON object with the product names, prices and URLs with the following format: { "name": "Product Name", "price": "Price", "url": "URL" } from the website content below. <content>${bodyContent}</content>`,
            },
          ],
          response_format: {
            type: "json_object",
          },
        });


        responses.push(resp);
        await browser.close();
      }


      return responses;
    }
  }
  ```

* TypeScript

  ```ts
  interface Env {
    BROWSER: Fetcher;
  }


  export class MyAgent extends Agent<Env> {
    async browse(browserInstance: Fetcher, urls: string[]) {
      let responses = [];
      for (const url of urls) {
        const browser = await puppeteer.launch(browserInstance);
        const page = await browser.newPage();
        await page.goto(url);


        await page.waitForSelector("body");
        const bodyContent = await page.$eval(
          "body",
          (element) => element.innerHTML,
        );
        const client = new OpenAI({
          apiKey: this.env.OPENAI_API_KEY,
        });


        let resp = await client.chat.completions.create({
          model: this.env.MODEL,
          messages: [
            {
              role: "user",
              content: `Return a JSON object with the product names, prices and URLs with the following format: { "name": "Product Name", "price": "Price", "url": "URL" } from the website content below. <content>${bodyContent}</content>`,
            },
          ],
          response_format: {
            type: "json_object",
          },
        });


        responses.push(resp);
        await browser.close();
      }


      return responses;
    }
  }
  ```

You'll also need to add install the `@cloudflare/puppeteer` package and add the following to the wrangler configuration of your Agent:

* npm

  ```sh
  npm i -D @cloudflare/puppeteer
  ```

* yarn

  ```sh
  yarn add -D @cloudflare/puppeteer
  ```

* pnpm

  ```sh
  pnpm add -D @cloudflare/puppeteer
  ```

- wrangler.jsonc

  ```jsonc
  {
    // ...
    "browser": {
      "binding": "MYBROWSER",
    },
    // ...
  }
  ```

- wrangler.toml

  ```toml
  [browser]
  binding = "MYBROWSER"
  ```

### Browserbase

You can also use [Browserbase](https://docs.browserbase.com/integrations/cloudflare/typescript) by using the Browserbase API directly from within your Agent.

Once you have your [Browserbase API key](https://docs.browserbase.com/integrations/cloudflare/typescript), you can add it to your Agent by creating a [secret](https://developers.cloudflare.com/workers/configuration/secrets/):

```sh
cd your-agent-project-folder
npx wrangler@latest secret put BROWSERBASE_API_KEY
```

```sh
Enter a secret value: ******
Creating the secret for the Worker "agents-example"
Success! Uploaded secret BROWSERBASE_API_KEY
```

Install the `@cloudflare/puppeteer` package and use it from within your Agent to call the Browserbase API:

* npm

  ```sh
  npm i @cloudflare/puppeteer
  ```

* yarn

  ```sh
  yarn add @cloudflare/puppeteer
  ```

* pnpm

  ```sh
  pnpm add @cloudflare/puppeteer
  ```

- JavaScript

  ```js
  export class MyAgent extends Agent {
    constructor(env) {
      super(env);
    }
  }
  ```

- TypeScript

  ```ts
  interface Env {
    BROWSERBASE_API_KEY: string;
  }


  export class MyAgent extends Agent<Env> {
    constructor(env: Env) {
      super(env);
    }
  }
  ```

</page>

<page>
---
title: Calling Agents · Cloudflare Agents docs
description: Learn how to call your Agents from Workers, including how to create
  Agents on-the-fly, address them, and route requests to specific instances of
  an Agent.
lastUpdated: 2025-04-08T14:52:06.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/agents/api-reference/calling-agents/
  md: https://developers.cloudflare.com/agents/api-reference/calling-agents/index.md
---

Learn how to call your Agents from Workers, including how to create Agents on-the-fly, address them, and route requests to specific instances of an Agent.

### Calling your Agent

Agents are created on-the-fly and can serve multiple requests concurrently. Each Agent instance is isolated from other instances, can maintain its own state, and has a unique address.

Note

An instance of an Agent is globally unique: given the same name (or ID), you will always get the same instance of an agent.

This allows you to avoid synchronizing state across requests: if an Agent instance represents a specific user, team, channel or other entity, you can use the Agent instance to store state for that entity. No need to set up a centralized session store.

If the client disconnects, you can always route the client back to the exact same Agent and pick up where they left off.

You can create and run an instance of an Agent directly from a Worker using either:

* The `routeAgentRequest` helper: this will automatically map requests to an individual Agent based on the `/agents/:agent/:name` URL pattern. The value of `:agent` will be the name of your Agent class converted to `kebab-case`, and the value of `:name` will be the name of the Agent instance you want to create or retrieve.
* `getAgentByName`, which will create a new Agent instance if none exists by that name, or retrieve a handle to an existing instance.

See the usage patterns in the following example:

* JavaScript

  ```js
  import {
    Agent,
    AgentNamespace,
    getAgentByName,
    routeAgentRequest,
  } from "agents";


  export default {
    async fetch(request, env, ctx) {
      // Routed addressing
      // Automatically routes HTTP requests and/or WebSocket connections to /agents/:agent/:name
      // Best for: connecting React apps directly to Agents using useAgent from agents/react
      return (
        (await routeAgentRequest(request, env)) ||
        Response.json({ msg: "no agent here" }, { status: 404 })
      );


      // Named addressing
      // Best for: convenience method for creating or retrieving an agent by name/ID.
      // Bringing your own routing, middleware and/or plugging into an existing
      // application or framework.
      let namedAgent = getAgentByName(env.MyAgent, "my-unique-agent-id");
      // Pass the incoming request straight to your Agent
      let namedResp = (await namedAgent).fetch(request);
      return namedResp;
    },
  };


  export class MyAgent extends Agent {
    // Your Agent implementation goes here
  }
  ```

* TypeScript

  ```ts
  import { Agent, AgentNamespace, getAgentByName, routeAgentRequest } from 'agents';


  interface Env {
    // Define your Agent on the environment here
    // Passing your Agent class as a TypeScript type parameter allows you to call
    // methods defined on your Agent.
    MyAgent: AgentNamespace<MyAgent>;
  }


  export default {
    async fetch(request, env, ctx): Promise<Response> {
      // Routed addressing
      // Automatically routes HTTP requests and/or WebSocket connections to /agents/:agent/:name
      // Best for: connecting React apps directly to Agents using useAgent from agents/react
      return (await routeAgentRequest(request, env)) || Response.json({ msg: 'no agent here' }, { status: 404 });


      // Named addressing
      // Best for: convenience method for creating or retrieving an agent by name/ID.
      // Bringing your own routing, middleware and/or plugging into an existing
      // application or framework.
      let namedAgent = getAgentByName<Env, MyAgent>(env.MyAgent, 'my-unique-agent-id');
      // Pass the incoming request straight to your Agent
      let namedResp = (await namedAgent).fetch(request);
      return namedResp
    },
  } satisfies ExportedHandler<Env>;


  export class MyAgent extends Agent<Env> {
    // Your Agent implementation goes here
  }
  ```

Calling other Agents

You can also call other Agents from within an Agent and build multi-Agent systems.

Calling other Agents uses the same APIs as calling into an Agent directly.

### Calling methods on Agents

When using `getAgentByName`, you can pass both requests (including WebSocket) connections and call methods defined directly on the Agent itself using the native [JavaScript RPC](https://developers.cloudflare.com/workers/runtime-apis/rpc/) (JSRPC) API.

For example, once you have a handle (or "stub") to an unique instance of your Agent, you can call methods on it:

* JavaScript

  ```js
  import { Agent, AgentNamespace, getAgentByName } from "agents";


  export default {
    async fetch(request, env, ctx) {
      let namedAgent = getAgentByName(env.MyAgent, "my-unique-agent-id");
      // Call methods directly on the Agent, and pass native JavaScript objects
      let chatResponse = namedAgent.chat("Hello!");
      // No need to serialize/deserialize it from a HTTP request or WebSocket
      // message and back again
      let agentState = getState(); // agentState is of type UserHistory
      return namedResp;
    },
  };


  export class MyAgent extends Agent {
    // Your Agent implementation goes here
    async chat(prompt) {
      // call your favorite LLM
      return "result";
    }


    async getState() {
      // Return the Agent's state directly
      return this.state;
    }


    // Other methods as you see fit!
  }
  ```

* TypeScript

  ```ts
  import { Agent, AgentNamespace, getAgentByName } from 'agents';


  interface Env {
    // Define your Agent on the environment here
    // Passing your Agent class as a TypeScript type parameter allows you to call
    // methods defined on your Agent.
    MyAgent: AgentNamespace<MyAgent>;
  }


  interface UserHistory {
    history: string[];
    lastUpdated: Date;
  }


  export default {
    async fetch(request, env, ctx): Promise<Response> {
      let namedAgent = getAgentByName<Env, MyAgent>(env.MyAgent, 'my-unique-agent-id');
      // Call methods directly on the Agent, and pass native JavaScript objects
      let chatResponse = namedAgent.chat('Hello!');
      // No need to serialize/deserialize it from a HTTP request or WebSocket
      // message and back again
      let agentState = getState() // agentState is of type UserHistory
      return namedResp
    },
  } satisfies ExportedHandler<Env>;


  export class MyAgent extends Agent<Env, UserHistory> {
    // Your Agent implementation goes here
    async chat(prompt: string) {
      // call your favorite LLM
      return "result"
    }


    async getState() {
      // Return the Agent's state directly
      return this.state;
    }


    // Other methods as you see fit!
  }
  ```

When using TypeScript, ensure you pass your Agent class as a TypeScript type parameter to the AgentNamespace type so that types are correctly inferred:

```ts
interface Env {
  // Passing your Agent class as a TypeScript type parameter allows you to call
  // methods defined on your Agent.
  MyAgent: AgentNamespace<CodeReviewAgent>;
}


export class CodeReviewAgent extends Agent<Env, AgentState> {
  // Agent methods here
}
```

### Naming your Agents

When creating names for your Agents, think about what the Agent represents. A unique user? A team or company? A room or channel for collaboration?

A consistent approach to naming allows you to:

* direct incoming requests directly to the right Agent
* deterministically route new requests back to that Agent, no matter where the client is in the world.
* avoid having to rely on centralized session storage or external services for state management, since each Agent instance can maintain its own state.

For a given Agent definition (or 'namespace' in the code below), there can be millions (or tens of millions) of instances of that Agent, each handling their own requests, making calls to LLMs, and maintaining their own state.

For example, you might have an Agent for every user using your new AI-based code editor. In that case, you'd want to create Agents based on the user ID from your system, which would then allow that Agent to handle all requests for that user.

It also ensures that [state within the Agent](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/), including chat history, language preferences, model configuration and other context can associated specifically with that user, making it easier to manage state.

The example below shows how to create a unique agent Agent for each `userId` in a request:

* JavaScript

  ```js
  import {
    Agent,
    AgentNamespace,
    getAgentByName,
    routeAgentRequest,
  } from "agents";


  export default {
    async fetch(request, env, ctx) {
      let userId = new URL(request.url).searchParams.get("userId") || "anonymous";
      // Use an identifier that allows you to route to requests, WebSockets or call methods on the Agent
      // You can also put authentication logic here - e.g. to only create or retrieve Agents for known users.
      let namedAgent = getAgentByName(env.MyAgent, "my-unique-agent-id");
      return (await namedAgent).fetch(request);
    },
  };


  export class MyAgent extends Agent {
    // You can access the name of the agent via this.name in any method within
    // the Agent
    async onStartup() {
      console.log(`agent ${this.name} ready!`);
    }
  }
  ```

* TypeScript

  ```ts
  import { Agent, AgentNamespace, getAgentByName, routeAgentRequest } from 'agents';


  interface Env {
    MyAgent: AgentNamespace<MyAgent>;
  }


  export default {
    async fetch(request, env, ctx): Promise<Response> {
      let userId = new URL(request.url).searchParams.get('userId') || 'anonymous';
      // Use an identifier that allows you to route to requests, WebSockets or call methods on the Agent
      // You can also put authentication logic here - e.g. to only create or retrieve Agents for known users.
      let namedAgent = getAgentByName<Env, MyAgent>(env.MyAgent, 'my-unique-agent-id');
      return (await namedAgent).fetch(request);
    },
  } satisfies ExportedHandler<Env>;


  export class MyAgent extends Agent<Env> {
    // You can access the name of the agent via this.name in any method within
    // the Agent
    async onStartup() { console.log(`agent ${this.name} ready!`)}
  }
  ```

Replace `userId` with `teamName`, `channel`, `companyName` as fits your Agents goals - and/or configure authentication to ensure Agents are only created for known, authenticated users.

### Authenticating Agents

When building and deploying Agents using the Agents SDK, you will often want to authenticate clients before passing requests to an Agent in order to restrict who the Agent will call, authorize specific users for specific Agents, and/or to limit who can access administrative or debug APIs exposed by an Agent.

As best practices:

* Handle authentication in your Workers code, before you invoke your Agent.
* Use the built-in hooks when using the `routeAgentRequest` helper - `onBeforeConnect` and `onBeforeRequest`
* Use your preferred router (such as Hono) and authentication middleware or provider to apply custom authentication schemes before calling an Agent using other methods.

The `routeAgentRequest` helper documented earlier in this guide exposes two useful hooks (`onBeforeConnect`, `onBeforeRequest`) that allow you to apply custom logic before creating or retrieving an Agent:

* JavaScript

  ```js
  import { Agent, AgentNamespace, routeAgentRequest } from "agents";


  export default {
    async fetch(request, env, ctx) {
      // Use the onBeforeConnect and onBeforeRequest hooks to authenticate clients
      // or run logic before handling a HTTP request or WebSocket.
      return (
        (await routeAgentRequest(request, env, {
          // Run logic before a WebSocket client connects
          onBeforeConnect: (request) => {
            // Your code/auth code here
            // You can return a Response here - e.g. a HTTP 403 Not Authorized -
            // which will stop further request processing and will NOT invoke the
            // Agent.
            // return Response.json({"error": "not authorized"}, { status: 403 })
          },
          // Run logic before a HTTP client clients
          onBeforeRequest: (request) => {
            // Your code/auth code here
            // Returning nothing will result in the call to the Agent continuing
          },
          // Prepend a prefix for how your Agents are named here
          prefix: "name-prefix-here",
        })) || Response.json({ msg: "no agent here" }, { status: 404 })
      );
    },
  };
  ```

* TypeScript

  ```ts
  import { Agent, AgentNamespace, routeAgentRequest } from 'agents';


  interface Env {
    MyAgent: AgentNamespace<MyAgent>;
  }


  export default {
    async fetch(request, env, ctx): Promise<Response> {
      // Use the onBeforeConnect and onBeforeRequest hooks to authenticate clients
      // or run logic before handling a HTTP request or WebSocket.
      return (
        (await routeAgentRequest(request, env, {
          // Run logic before a WebSocket client connects
          onBeforeConnect: (request) => {
            // Your code/auth code here
            // You can return a Response here - e.g. a HTTP 403 Not Authorized -
            // which will stop further request processing and will NOT invoke the
            // Agent.
            // return Response.json({"error": "not authorized"}, { status: 403 })
          },
          // Run logic before a HTTP client clients
          onBeforeRequest: (request) => {
            // Your code/auth code here
            // Returning nothing will result in the call to the Agent continuing
          },
          // Prepend a prefix for how your Agents are named here
          prefix: 'name-prefix-here',
        })) || Response.json({ msg: 'no agent here' }, { status: 404 })
      );


    },
  } satisfies ExportedHandler<Env>;
  ```

If you are using `getAgentByName` or the underlying Durable Objects routing API, you should authenticate incoming requests or WebSocket connections before calling `getAgentByName`.

For example, if you are using [Hono](https://hono.dev/), you can authenticate in the middleware before calling an Agent and passing a request (or a WebSocket connection) to it:

* JavaScript

  ```js
  import { Agent, AgentNamespace, getAgentByName } from "agents";
  import { Hono } from "hono";


  const app = new Hono();


  app.use("/code-review/*", async (c, next) => {
    // Perform auth here
    // e.g. validate a Bearer token, a JWT, use your preferred auth library
    // return Response.json({ msg: 'unauthorized' }, { status: 401 });
    await next(); // continue on if valid
  });


  app.get("/code-review/:id", async (c) => {
    const id = c.req.param("teamId");
    if (!id) return Response.json({ msg: "missing id" }, { status: 400 });


    // Call the Agent, creating it with the name/identifier from the ":id" segment
    // of our URL
    const agent = await getAgentByName(c.env.MyAgent, id);


    // Pass the request to our Agent instance
    return await agent.fetch(c.req.raw);
  });
  ```

* TypeScript

  ```ts
  import { Agent, AgentNamespace, getAgentByName } from 'agents';
  import { Hono } from 'hono';


  const app = new Hono<{ Bindings: Env }>();


  app.use('/code-review/*', async (c, next) => {
    // Perform auth here
    // e.g. validate a Bearer token, a JWT, use your preferred auth library
    // return Response.json({ msg: 'unauthorized' }, { status: 401 });
    await next(); // continue on if valid
  });


  app.get('/code-review/:id', async (c) => {
    const id = c.req.param('teamId');
    if (!id) return Response.json({ msg: 'missing id' }, { status: 400 });


    // Call the Agent, creating it with the name/identifier from the ":id" segment
    // of our URL
    const agent = await getAgentByName<Env, MyAgent>(c.env.MyAgent, id);


    // Pass the request to our Agent instance
    return await agent.fetch(c.req.raw);
  });
  ```

This ensures we only create Agents for authenticated users, and allows you to validate whether Agent names conform to your preferred naming scheme before instances are created.

### Next steps

* Review the [API documentation](https://developers.cloudflare.com/agents/api-reference/agents-api/) for the Agents class to learn how to define
* [Build a chat Agent](https://developers.cloudflare.com/agents/getting-started/build-a-chat-agent/) using the Agents SDK and deploy it to Workers.
* Learn more [using WebSockets](https://developers.cloudflare.com/agents/api-reference/websockets/) to build interactive Agents and stream data back from your Agent.
* [Orchestrate asynchronous workflows](https://developers.cloudflare.com/agents/api-reference/run-workflows) from your Agent by combining the Agents SDK and [Workflows](https://developers.cloudflare.com/workflows).

</page>

<page>
---
title: Configuration · Cloudflare Agents docs
description: An Agent is configured like any other Cloudflare Workers project,
  and uses a wrangler configuration file to define where your code is and what
  services (bindings) it will use.
lastUpdated: 2025-03-18T12:13:40.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/agents/api-reference/configuration/
  md: https://developers.cloudflare.com/agents/api-reference/configuration/index.md
---

An Agent is configured like any other Cloudflare Workers project, and uses [a wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/) file to define where your code is and what services (bindings) it will use.

### Project structure

The typical file structure for an Agent project created from `npm create cloudflare@latest agents-starter -- --template cloudflare/agents-starter` follows:

```sh
.
|-- package-lock.json
|-- package.json
|-- public
|   `-- index.html
|-- src
|   `-- index.ts // your Agent definition
|-- test
|   |-- index.spec.ts // your tests
|   `-- tsconfig.json
|-- tsconfig.json
|-- vitest.config.mts
|-- worker-configuration.d.ts
`-- wrangler.jsonc // your Workers & Agent configuration
```

### Example configuration

Below is a minimal `wrangler.jsonc` file that defines the configuration for an Agent, including the entry point, `durable_object` namespace, and code `migrations`:

* wrangler.jsonc

  ```jsonc
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "name": "agents-example",
    "main": "src/index.ts",
    "compatibility_date": "2025-02-23",
    "compatibility_flags": ["nodejs_compat"],
    "durable_objects": {
      "bindings": [
        {
          // Required:
          "name": "MyAgent", // How your Agent is called from your Worker
          "class_name": "MyAgent", // Must match the class name of the Agent in your code
          // Optional: set this if the Agent is defined in another Worker script
          "script_name": "the-other-worker"
        },
      ],
    },
    "migrations": [
      {
        "tag": "v1",
        // Mandatory for the Agent to store state
        "new_sqlite_classes": ["MyAgent"],
      },
    ],
    "observability": {
      "enabled": true,
    },
  }
  ```

* wrangler.toml

  ```toml
  "$schema" = "node_modules/wrangler/config-schema.json"
  name = "agents-example"
  main = "src/index.ts"
  compatibility_date = "2025-02-23"
  compatibility_flags = [ "nodejs_compat" ]


  [[durable_objects.bindings]]
  name = "MyAgent"
  class_name = "MyAgent"
  script_name = "the-other-worker"


  [[migrations]]
  tag = "v1"
  new_sqlite_classes = [ "MyAgent" ]


  [observability]
  enabled = true
  ```

The configuration includes:

* A `main` field that points to the entry point of your Agent, which is typically a TypeScript (or JavaScript) file.
* A `durable_objects` field that defines the [Durable Object namespace](https://developers.cloudflare.com/durable-objects/reference/glossary/) that your Agents will run within.
* A `migrations` field that defines the code migrations that your Agent will use. This field is mandatory and must contain at least one migration. The `new_sqlite_classes` field is mandatory for the Agent to store state.

Agents must define these fields in their `wrangler.jsonc` (or `wrangler.toml`) config file.

</page>

<page>
---
title: HTTP and Server-Sent Events · Cloudflare Agents docs
description: The Agents SDK allows you to handle HTTP requests and has native
  support for Server-Sent Events (SSE). This allows you build applications that
  can push data to clients and avoid buffering.
lastUpdated: 2025-03-18T12:13:40.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/agents/api-reference/http-sse/
  md: https://developers.cloudflare.com/agents/api-reference/http-sse/index.md
---

The Agents SDK allows you to handle HTTP requests and has native support for [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) (SSE). This allows you build applications that can push data to clients and avoid buffering.

### Handling HTTP requests

Agents can handle HTTP requests using the `onRequest` method, which is called whenever an HTTP request is received by the Agent instance. The method takes a `Request` object as a parameter and returns a `Response` object.

* JavaScript

  ```js
  class MyAgent extends Agent {
    // Handle HTTP requests coming to this Agent instance
    // Returns a Response object
    async onRequest(request) {
      return new Response("Hello from Agent!");
    }


    async callAIModel(prompt) {
      // Implement AI model call here
    }
  }
  ```

* TypeScript

  ```ts
  class MyAgent extends Agent<Env, State> {
    // Handle HTTP requests coming to this Agent instance
    // Returns a Response object
    async onRequest(request: Request) {
      return new Response("Hello from Agent!");
    }


    async callAIModel(prompt: string) {
      // Implement AI model call here
    }
  }
  ```

Review the [Agents API reference](https://developers.cloudflare.com/agents/api-reference/agents-api/) to learn more about the `Agent` class and its methods.

### Implementing Server-Sent Events

The Agents SDK support Server-Sent Events directly: you can use SSE to stream data back to the client over a long running connection. This avoids buffering large responses, which can both make your Agent feel slow, and forces you to buffer the entire response in memory.

When an Agent is deployed to Cloudflare Workers, there is no effective limit on the total time it takes to stream the response back: large AI model responses that take several minutes to reason and then respond will not be prematurely terminated.

Note that this does not mean the client can't potentially disconnect during the streaming process: you can account for this by either [writing to the Agent's stateful storage](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/) and/or [using WebSockets](https://developers.cloudflare.com/agents/api-reference/websockets/). Because you can always [route to the same Agent](https://developers.cloudflare.com/agents/api-reference/calling-agents/), you do not need to use a centralized session store to pick back up where you left off when a client disconnects.

The following example uses the AI SDK to generate text and stream it back to the client. It will automatically stream the response back to the client as the model generates it:

* JavaScript

  ```js
  import {
    Agent,
    AgentNamespace,
    getAgentByName,
    routeAgentRequest,
  } from "agents";
  import { streamText } from "ai";
  import { createOpenAI, openai } from "@ai-sdk/openai";


  export class MyAgent extends Agent {
    async onRequest(request) {
      // Test it via:
      // curl -d '{"prompt": "Write me a Cloudflare Worker"}' <url>
      let data = await request.json();
      let stream = await this.callAIModel(data.prompt);
      // This uses Server-Sent Events (SSE)
      return stream.toTextStreamResponse({
        headers: {
          "Content-Type": "text/x-unknown",
          "content-encoding": "identity",
          "transfer-encoding": "chunked",
        },
      });
    }


    async callAIModel(prompt) {
      const openai = createOpenAI({
        apiKey: this.env.OPENAI_API_KEY,
      });


      return streamText({
        model: openai("gpt-4o"),
        prompt: prompt,
      });
    }
  }


  export default {
    async fetch(request, env) {
      let agentId = new URL(request.url).searchParams.get("agent-id") || "";
      const agent = await getAgentByName(env.MyAgent, agentId);
      return agent.fetch(request);
    },
  };
  ```

* TypeScript

  ```ts
  import { Agent, AgentNamespace, getAgentByName, routeAgentRequest } from 'agents';
  import { streamText } from 'ai';
  import { createOpenAI, openai } from '@ai-sdk/openai';


  interface Env {
    MyAgent: AgentNamespace<MyAgent>;
    OPENAI_API_KEY: string;
  }


  export class MyAgent extends Agent<Env> {
    async onRequest(request: Request) {
      // Test it via:
      // curl -d '{"prompt": "Write me a Cloudflare Worker"}' <url>
      let data = await request.json<{ prompt: string }>();
      let stream = await this.callAIModel(data.prompt);
      // This uses Server-Sent Events (SSE)
      return stream.toTextStreamResponse({
        headers: {
          'Content-Type': 'text/x-unknown',
          'content-encoding': 'identity',
          'transfer-encoding': 'chunked',
        },
      });
    }


    async callAIModel(prompt: string) {
      const openai = createOpenAI({
        apiKey: this.env.OPENAI_API_KEY,
      });


      return streamText({
        model: openai('gpt-4o'),
        prompt: prompt,
      });
    }
  }


  export default {
    async fetch(request: Request, env: Env) {
      let agentId = new URL(request.url).searchParams.get('agent-id') || '';
      const agent = await getAgentByName<Env, MyAgent>(env.MyAgent, agentId);
      return agent.fetch(request);
    },
  };
  ```

### WebSockets vs. Server-Sent Events

Both WebSockets and Server-Sent Events (SSE) enable real-time communication between clients and Agents. Agents built on the Agents SDK can expose both WebSocket and SSE endpoints directly.

* WebSockets provide full-duplex communication, allowing data to flow in both directions simultaneously. SSE only supports server-to-client communication, requiring additional HTTP requests if the client needs to send data back.
* WebSockets establish a single persistent connection that stays open for the duration of the session. SSE, being built on HTTP, may experience more overhead due to reconnection attempts and header transmission with each reconnection, especially when there is a lot of client-server communication.
* While SSE works well for simple streaming scenarios, WebSockets are better suited for applications requiring minutes or hours of connection time, as they maintain a more stable connection with built-in ping/pong mechanisms to keep connections alive.
* WebSockets use their own protocol (ws\:// or wss\://), separating them from HTTP after the initial handshake. This separation allows WebSockets to better handle binary data transmission and implement custom subprotocols for specialized use cases.

If you're unsure of which is better for your use-case, we recommend WebSockets. The [WebSockets API documentation](https://developers.cloudflare.com/agents/api-reference/websockets/) provides detailed information on how to use WebSockets with the Agents SDK.

### Next steps

* Review the [API documentation](https://developers.cloudflare.com/agents/api-reference/agents-api/) for the Agents class to learn how to define them.
* [Build a chat Agent](https://developers.cloudflare.com/agents/getting-started/build-a-chat-agent/) using the Agents SDK and deploy it to Workers.
* Learn more [using WebSockets](https://developers.cloudflare.com/agents/api-reference/websockets/) to build interactive Agents and stream data back from your Agent.
* [Orchestrate asynchronous workflows](https://developers.cloudflare.com/agents/api-reference/run-workflows) from your Agent by combining the Agents SDK and [Workflows](https://developers.cloudflare.com/workflows).

</page>

<page>
---
title: Retrieval Augmented Generation · Cloudflare Agents docs
description: Agents can use Retrieval Augmented Generation (RAG) to retrieve
  relevant information and use it augment calls to AI models. Store a user's
  chat history to use as context for future conversations, summarize documents
  to bootstrap an Agent's knowledge base, and/or use data from your Agent's web
  browsing tasks to enhance your Agent's capabilities.
lastUpdated: 2025-05-14T14:20:47.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/agents/api-reference/rag/
  md: https://developers.cloudflare.com/agents/api-reference/rag/index.md
---

Agents can use Retrieval Augmented Generation (RAG) to retrieve relevant information and use it augment [calls to AI models](https://developers.cloudflare.com/agents/api-reference/using-ai-models/). Store a user's chat history to use as context for future conversations, summarize documents to bootstrap an Agent's knowledge base, and/or use data from your Agent's [web browsing](https://developers.cloudflare.com/agents/api-reference/browse-the-web/) tasks to enhance your Agent's capabilities.

You can use the Agent's own [SQL database](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state) as the source of truth for your data and store embeddings in [Vectorize](https://developers.cloudflare.com/vectorize/) (or any other vector-enabled database) to allow your Agent to retrieve relevant information.

### Vector search

Note

If you're brand-new to vector databases and Vectorize, visit the [Vectorize tutorial](https://developers.cloudflare.com/vectorize/get-started/intro/) to learn the basics, including how to create an index, insert data, and generate embeddings.

You can query a vector index (or indexes) from any method on your Agent: any Vectorize index you attach is available on `this.env` within your Agent. If you've [associated metadata](https://developers.cloudflare.com/vectorize/best-practices/insert-vectors/#metadata) with your vectors that maps back to data stored in your Agent, you can then look up the data directly within your Agent using `this.sql`.

Here's an example of how to give an Agent retrieval capabilities:

* JavaScript

  ```js
  import { Agent } from "agents";


  export class RAGAgent extends Agent {
    // Other methods on our Agent
    // ...
    //
    async queryKnowledge(userQuery) {
      // Turn a query into an embedding
      const queryVector = await this.env.AI.run("@cf/baai/bge-base-en-v1.5", {
        text: [userQuery],
      });


      // Retrieve results from our vector index
      let searchResults = await this.env.VECTOR_DB.query(queryVector.data[0], {
        topK: 10,
        returnMetadata: "all",
      });


      let knowledge = [];
      for (const match of searchResults.matches) {
        console.log(match.metadata);
        knowledge.push(match.metadata);
      }


      // Use the metadata to re-associate the vector search results
      // with data in our Agent's SQL database
      let results = this
        .sql`SELECT * FROM knowledge WHERE id IN (${knowledge.map((k) => k.id)})`;


      // Return them
      return results;
    }
  }
  ```

* TypeScript

  ```ts
  import { Agent } from "agents";


  interface Env {
    AI: Ai;
    VECTOR_DB: Vectorize;
  }


  export class RAGAgent extends Agent<Env> {
    // Other methods on our Agent
    // ...
    //
    async queryKnowledge(userQuery: string) {
      // Turn a query into an embedding
      const queryVector = await this.env.AI.run('@cf/baai/bge-base-en-v1.5', {
        text: [userQuery],
      });


      // Retrieve results from our vector index
      let searchResults = await this.env.VECTOR_DB.query(queryVector.data[0], {
        topK: 10,
        returnMetadata: 'all',
      });


      let knowledge = [];
      for (const match of searchResults.matches) {
        console.log(match.metadata);
        knowledge.push(match.metadata);
      }


      // Use the metadata to re-associate the vector search results
      // with data in our Agent's SQL database
      let results = this.sql`SELECT * FROM knowledge WHERE id IN (${knowledge.map((k) => k.id)})`;


      // Return them
      return results;
    }
  }
  ```

You'll also need to connect your Agent to your vector indexes:

* wrangler.jsonc

  ```jsonc
  {
    // ...
    "vectorize": [
      {
        "binding": "VECTOR_DB",
        "index_name": "your-vectorize-index-name"
      }
    ]
    // ...
  }
  ```

* wrangler.toml

  ```toml
  [[vectorize]]
  binding = "VECTOR_DB"
  index_name = "your-vectorize-index-name"
  ```

If you have multiple indexes you want to make available, you can provide an array of `vectorize` bindings.

#### Next steps

* Learn more on how to [combine Vectorize and Workers AI](https://developers.cloudflare.com/vectorize/get-started/embeddings/)
* Review the [Vectorize query API](https://developers.cloudflare.com/vectorize/reference/client-api/)
* Use [metadata filtering](https://developers.cloudflare.com/vectorize/reference/metadata-filtering/) to add context to your results

</page>

<page>
---
title: Run Workflows · Cloudflare Agents docs
description: Agents can trigger asynchronous Workflows, allowing your Agent to
  run complex, multi-step tasks in the background. This can include
  post-processing files that a user has uploaded, updating the embeddings in a
  vector database, and/or managing long-running user-lifecycle email or SMS
  notification workflows.
lastUpdated: 2025-05-14T14:20:47.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/agents/api-reference/run-workflows/
  md: https://developers.cloudflare.com/agents/api-reference/run-workflows/index.md
---

Agents can trigger asynchronous [Workflows](https://developers.cloudflare.com/workflows/), allowing your Agent to run complex, multi-step tasks in the background. This can include post-processing files that a user has uploaded, updating the embeddings in a [vector database](https://developers.cloudflare.com/vectorize/), and/or managing long-running user-lifecycle email or SMS notification workflows.

Because an Agent is just like a Worker script, it can create Workflows defined in the same project (script) as the Agent *or* in a different project.

Agents vs. Workflows

Agents and Workflows have some similarities: they can both run tasks asynchronously. For straightforward tasks that are linear or need to run to completion, a Workflow can be ideal: steps can be retried, they can be cancelled, and can act on events.

Agents do not have to run to completion: they can loop, branch and run forever, and they can also interact directly with users (over HTTP or WebSockets). An Agent can be used to trigger multiple Workflows as it runs, and can thus be used to co-ordinate and manage Workflows to achieve its goals.

## Trigger a Workflow

An Agent can trigger one or more Workflows from within any method, whether from an incoming HTTP request, a WebSocket connection, on a delay or schedule, and/or from any other action the Agent takes.

Triggering a Workflow from an Agent is no different from [triggering a Workflow from a Worker script](https://developers.cloudflare.com/workflows/build/trigger-workflows/):

* JavaScript

  ```js
  export class MyAgent extends Agent {
    async onRequest(request) {
      let userId = request.headers.get("user-id");
      // Trigger a schedule that runs a Workflow
      // Pass it a payload
      let { taskId } = await this.schedule(300, "runWorkflow", {
        id: userId,
        flight: "DL264",
        date: "2025-02-23",
      });
    }


    async runWorkflow(data) {
      let instance = await env.MY_WORKFLOW.create({
        id: data.id,
        params: data,
      });


      // Schedule another task that checks the Workflow status every 5 minutes...
      await this.schedule("*/5 * * * *", "checkWorkflowStatus", {
        id: instance.id,
      });
    }
  }


  export class MyWorkflow extends WorkflowEntrypoint {
    async run(event, step) {
      // Your Workflow code here
    }
  }
  ```

* TypeScript

  ```ts
  interface Env {
    MY_WORKFLOW: Workflow;
    MyAgent: AgentNamespace<MyAgent>;
  }


  export class MyAgent extends Agent<Env> {
    async onRequest(request: Request) {
      let userId = request.headers.get("user-id");
      // Trigger a schedule that runs a Workflow
      // Pass it a payload
      let { taskId } = await this.schedule(300, "runWorkflow", { id: userId, flight: "DL264", date: "2025-02-23" });
    }


    async runWorkflow(data) {
      let instance = await env.MY_WORKFLOW.create({
        id: data.id,
        params: data,
      })


      // Schedule another task that checks the Workflow status every 5 minutes...
      await this.schedule("*/5 * * * *", "checkWorkflowStatus", { id: instance.id });
    }
  }


  export class MyWorkflow extends WorkflowEntrypoint<Env> {
    async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
      // Your Workflow code here
    }
  }
  ```

You'll also need to make sure your Agent [has a binding to your Workflow](https://developers.cloudflare.com/workflows/build/trigger-workflows/#workers-api-bindings) so that it can call it:

* wrangler.jsonc

  ```jsonc
  {
    // ...
    // Create a binding between your Agent and your Workflow
    "workflows": [
      {
        // Required:
        "name": "EMAIL_WORKFLOW",
        "class_name": "MyWorkflow",
        // Optional: set the script_name field if your Workflow is defined in a
        // different project from your Agent
        "script_name": "email-workflows"
      }
     ],
    // ...
  }
  ```

* wrangler.toml

  ```toml
  [[workflows]]
  name = "EMAIL_WORKFLOW"
  class_name = "MyWorkflow"
  script_name = "email-workflows"
  ```

## Trigger a Workflow from another project

You can also call a Workflow that is defined in a different Workers script from your Agent by setting the `script_name` property in the `workflows` binding of your Agent:

* wrangler.jsonc

  ```jsonc
  {
      // Required:
      "name": "EMAIL_WORKFLOW",
      "class_name": "MyWorkflow",
      // Optional: set the script_name field if your Workflow is defined in a
      // different project from your Agent
      "script_name": "email-workflows"
  }
  ```

* wrangler.toml

  ```toml
  name = "EMAIL_WORKFLOW"
  class_name = "MyWorkflow"
  script_name = "email-workflows"
  ```

Refer to the [cross-script calls](https://developers.cloudflare.com/workflows/build/workers-api/#cross-script-calls) section of the Workflows documentation for more examples.

</page>

<page>
---
title: Schedule tasks · Cloudflare Agents docs
description: An Agent can schedule tasks to be run in the future by calling
  this.schedule(when, callback, data), where when can be a delay, a Date, or a
  cron string; callback the function name to call, and data is an object of data
  to pass to the function.
lastUpdated: 2025-04-06T14:39:24.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/agents/api-reference/schedule-tasks/
  md: https://developers.cloudflare.com/agents/api-reference/schedule-tasks/index.md
---

An Agent can schedule tasks to be run in the future by calling `this.schedule(when, callback, data)`, where `when` can be a delay, a `Date`, or a cron string; `callback` the function name to call, and `data` is an object of data to pass to the function.

Scheduled tasks can do anything a request or message from a user can: make requests, query databases, send emails, read+write state: scheduled tasks can invoke any regular method on your Agent.

### Scheduling tasks

You can call `this.schedule` within any method on an Agent, and schedule tens-of-thousands of tasks per individual Agent:

* JavaScript

  ```js
  import { Agent } from "agents";


  export class SchedulingAgent extends Agent {
    async onRequest(request) {
      // Handle an incoming request
      // Schedule a task 5 minutes from now
      // Calls the "checkFlights" method
      let { taskId } = await this.schedule(600, "checkFlights", {
        flight: "DL264",
        date: "2025-02-23",
      });
      return Response.json({ taskId });
    }


    async checkFlights(data) {
      // Invoked when our scheduled task runs
      // We can also call this.schedule here to schedule another task
    }
  }
  ```

* TypeScript

  ```ts
  import { Agent } from "agents"


  export class SchedulingAgent extends Agent {
    async onRequest(request) {
      // Handle an incoming request
      // Schedule a task 5 minutes from now
      // Calls the "checkFlights" method
      let { taskId } = await this.schedule(600, "checkFlights", { flight: "DL264", date: "2025-02-23" });
      return Response.json({ taskId });
    }


    async checkFlights(data) {
      // Invoked when our scheduled task runs
      // We can also call this.schedule here to schedule another task
    }
  }
  ```

Warning

Tasks that set a callback for a method that does not exist will throw an exception: ensure that the method named in the `callback` argument of `this.schedule` exists on your `Agent` class.

You can schedule tasks in multiple ways:

* JavaScript

  ```js
  // schedule a task to run in 10 seconds
  let task = await this.schedule(10, "someTask", { message: "hello" });


  // schedule a task to run at a specific date
  let task = await this.schedule(new Date("2025-01-01"), "someTask", {});


  // schedule a task to run every 10 seconds
  let { id } = await this.schedule("*/10 * * * *", "someTask", {
    message: "hello",
  });


  // schedule a task to run every 10 seconds, but only on Mondays
  let task = await this.schedule("0 0 * * 1", "someTask", { message: "hello" });


  // cancel a scheduled task
  this.cancelSchedule(task.id);
  ```

* TypeScript

  ```ts
  // schedule a task to run in 10 seconds
  let task = await this.schedule(10, "someTask", { message: "hello" });


  // schedule a task to run at a specific date
  let task = await this.schedule(new Date("2025-01-01"), "someTask", {});


  // schedule a task to run every 10 seconds
  let { id } = await this.schedule("*/10 * * * *", "someTask", { message: "hello" });


  // schedule a task to run every 10 seconds, but only on Mondays
  let task = await this.schedule("0 0 * * 1", "someTask", { message: "hello" });


  // cancel a scheduled task
  this.cancelSchedule(task.id);
  ```

Calling `await this.schedule` returns a `Schedule`, which includes the task's randomly generated `id`. You can use this `id` to retrieve or cancel the task in the future. It also provides a `type` property that indicates the type of schedule, for example, one of `"scheduled" | "delayed" | "cron"`.

Maximum scheduled tasks

Each task is mapped to a row in the Agent's underlying [SQLite database](https://developers.cloudflare.com/durable-objects/api/storage-api/), which means that each task can be up to 2 MB in size. The maximum number of tasks must be `(task_size * tasks) + all_other_state < maximum_database_size` (currently 1GB per Agent).

### Managing scheduled tasks

You can get, cancel and filter across scheduled tasks within an Agent using the scheduling API:

* JavaScript

  ```js
  // Get a specific schedule by ID
  // Returns undefined if the task does not exist
  let task = await this.getSchedule(task.id);


  // Get all scheduled tasks
  // Returns an array of Schedule objects
  let tasks = this.getSchedules();


  // Cancel a task by its ID
  // Returns true if the task was cancelled, false if it did not exist
  await this.cancelSchedule(task.id);


  // Filter for specific tasks
  // e.g. all tasks starting in the next hour
  let tasks = this.getSchedules({
    timeRange: {
      start: new Date(Date.now()),
      end: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  ```

* TypeScript

  ```ts
  // Get a specific schedule by ID
  // Returns undefined if the task does not exist
  let task = await this.getSchedule(task.id)


  // Get all scheduled tasks
  // Returns an array of Schedule objects
  let tasks = this.getSchedules();


  // Cancel a task by its ID
  // Returns true if the task was cancelled, false if it did not exist
  await this.cancelSchedule(task.id);


  // Filter for specific tasks
  // e.g. all tasks starting in the next hour
  let tasks = this.getSchedules({
    timeRange: {
      start: new Date(Date.now()),
      end: new Date(Date.now() + 60 * 60 * 1000),
    }
  });
  ```

</page>

<page>
---
title: Store and sync state · Cloudflare Agents docs
description: Every Agent has built-in state management capabilities, including
  built-in storage and synchronization between the Agent and frontend
  applications.
lastUpdated: 2025-06-19T13:27:22.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/
  md: https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/index.md
---
