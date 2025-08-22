# New Features Added

## Prompt Management
- **Add Prompts**: Create and save reusable prompts with names, tags, and descriptions
- **Edit Prompts**: Modify existing saved prompts
- **Use Prompts**: Click to automatically populate the chat input with saved prompts
- **Delete Prompts**: Remove unwanted prompts

### API Endpoints:
- `GET /api/prompts` - Retrieve all saved prompts
- `POST /api/prompts` - Create a new prompt
- `PUT /api/prompts` - Update an existing prompt
- `DELETE /api/prompts?id=<id>` - Delete a prompt

## MCP (Model Context Protocol) Server Management
- **Add MCP Servers**: Configure MCP servers with command arrays, working directories, environment variables
- **Edit Servers**: Modify server configurations
- **Enable/Disable**: Toggle server status
- **Delete Servers**: Remove server configurations

### API Endpoints:
- `GET /api/mcp-servers` - Retrieve all MCP server configurations
- `POST /api/mcp-servers` - Create a new MCP server config
- `PUT /api/mcp-servers` - Update an existing MCP server config
- `DELETE /api/mcp-servers?id=<id>` - Delete an MCP server config

## File Saving
- **Save Responses**: Click a "Save Response" button on any assistant message to download it as a text file
- **Automatic Naming**: Files are automatically named with timestamps

### API Endpoint:
- `POST /api/save-file` - Save content as a downloadable file

## Frontend Updates
- **New Sidebar Sections**: Added "Saved Prompts" and "MCP Servers" sections to the sidebar
- **Modal Dialogs**: Clean modal interfaces for adding/editing prompts and MCP servers
- **Interactive Lists**: Click-to-use, edit, and delete functionality for all items
- **Save Buttons**: Added to all assistant messages for easy response saving

## Backend Changes
- **New Types**: Added `SavedPrompt`, `MCPServer`, and `FileSaveRequest` interfaces
- **KV Storage**: Added Cloudflare KV binding for persistent storage
- **Data Validation**: Input validation and error handling for all new endpoints
- **JSON Parsing**: Proper handling of JSON configuration for MCP servers

## Configuration Updates
- **wrangler.jsonc**: Added KV namespace binding for data persistence
- **Environment**: Extended `Env` interface to include `CHAT_STORE` KV namespace

## Usage Instructions

### Setting up KV Storage:
1. Create a KV namespace in Cloudflare dashboard
2. Update the `kv_namespaces` section in `wrangler.jsonc` with your actual namespace IDs
3. Deploy the application

### Using Prompts:
1. Click "+ Add Prompt" in the sidebar
2. Enter a name, prompt content, and optional tags
3. Click "Save"
4. Use saved prompts by clicking "Use" next to any prompt

### Configuring MCP Servers:
1. Click "+ Add Server" in the MCP Servers section
2. Enter server name and command as a JSON array (e.g., `["node", "server.js"]`)
3. Optionally configure working directory, environment variables, and arguments
4. Enable/disable servers as needed

### Saving Chat Responses:
1. Click the "Save Response" button on any assistant message
2. The file will automatically download with a timestamped filename

All data is stored persistently using Cloudflare KV, so your prompts and MCP configurations will persist across sessions.