# Android App Generation Prompt

*Copy and paste the following prompt into Google Gemini, Android Studio's Gemini integration, or another capable coding agent to bootstrap the native Android app for C.H.E.T.*

---

I want to build a native Android chat application using Kotlin and Jetpack Compose. This app will act as the mobile frontend for my existing AI backend called "C.H.E.T." (Chat Helper for (almost) Every Task).

My backend is a highly capable, agentic AI hosted on Cloudflare Workers. It exposes the following REST APIs:

### 1. Get Available Models
- **Endpoint**: `GET https://chet.distorted.work/api/models`
- **Response**: A JSON array of model objects. Each object has `key`, `name`, `description`, `maxTokensMax`, `temperatureMin`, `temperatureMax`, etc.

### 2. Chat Completion (Server-Sent Events / SSE)
- **Endpoint**: `POST https://chet.distorted.work/api/chat`
- **Headers Required**:
  - `Content-Type: application/json`
  - `x-session-id: <a_unique_string_per_conversation>`
- **Body Example**:
  ```json
  {
    "content": "user's message",
    "model": "llama-3.3-70b",
    "temperature": 0.6,
    "maxTokens": 1024
  }
  ```
- **Response**: A streaming Server-Sent Events (SSE) stream of type `text/event-stream`.
  - The chunks will look like: `data: {"response":" the text chunk"}\n\n`.
  - Or error chunks.
  - The stream ends with standard connection closure.

### 3. Fetch Chat History
- **Endpoint**: `GET https://chet.distorted.work/api/chat`
- **Headers Required**: `x-session-id: <the_same_session_id>`
- **Response**: A JSON object containing a `messages` array, where each message has a `role` ("user", "assistant", or "system") and `content` (the message text).

### App UI/UX Requirements:
1. **Design Theme**: A sleek, retro-futuristic style. Use a dark mode by default with neon accents (e.g., cyan/magenta or amber/green terminal colors), but keep it highly readable and usable.
2. **Top Bar**: A dropdown or collapsible header to select the AI model, populated by the `/api/models` endpoint.
3. **Chat Interface**:
   - A `LazyColumn` to display messages.
   - User messages should align right (styled differently, perhaps a darker neon outline).
   - Assistant messages should align left.
   - Support for basic Markdown rendering in assistant messages is highly desired.
4. **Input Area**: A text field at the bottom with a send button. Disable the button while streaming.
5. **Real-time Streaming**: When the user sends a message, immediately append it to the UI, then make the `POST /api/chat` request. Use an SSE library (like `okhttp-sse`) to read the chunks and dynamically append text to the latest Assistant message in real-time.
6. **Session Management**: Generate a random UUID on first app launch and save it in `SharedPreferences` or `DataStore` to use as the `x-session-id` header so the conversation persists.
7. **History Loading**: On app launch, call `GET /api/chat` with the session ID to load past messages.

### Task:
Please generate the complete Kotlin code for this app. Follow modern Android architectural patterns (MVVM).
1. Provide the necessary Gradle dependencies (Retrofit, OkHttp SSE, Coroutines, Compose, ViewModel, DataStore).
2. Write the Data/Network layer (API interface, repository, SSE parsing).
3. Write the ViewModel to manage state, history, and streaming.
4. Write the Jetpack Compose UI (Top Bar, Chat List, Input, Markdown support).

Please implement this step-by-step.
