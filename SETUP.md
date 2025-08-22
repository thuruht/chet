# Setup Guide for New Features

## Prerequisites
- Existing Cloudflare Workers project with AI binding
- Access to Cloudflare dashboard for KV namespace creation

## 1. Create KV Namespace

### Using Cloudflare Dashboard:
1. Go to your Cloudflare dashboard
2. Navigate to "Workers & Pages" → "KV"
3. Click "Create a namespace"
4. Name it something like "chat-store"
5. Note down the namespace ID

### Using Wrangler CLI:
```bash
wrangler kv:namespace create "CHAT_STORE"
wrangler kv:namespace create "CHAT_STORE" --preview
```

## 2. Update Configuration

Update your `wrangler.jsonc` file:
```jsonc
{
  // ... existing configuration
  "kv_namespaces": [
    {
      "binding": "CHAT_STORE",
      "id": "your-production-namespace-id",
      "preview_id": "your-preview-namespace-id"
    }
  ]
}
```

Replace the placeholder IDs with the actual namespace IDs from step 1.

## 3. Deploy

```bash
wrangler deploy
```

## 4. Test the Features

### Test Prompt Management:
1. Open your deployed application
2. Click "+ Add Prompt" in the sidebar
3. Create a test prompt
4. Verify you can use, edit, and delete it

### Test MCP Server Configuration:
1. Click "+ Add Server" in the MCP Servers section
2. Add a test server configuration:
   ```json
   Command: ["node", "server.js"]
   ```
3. Verify the server appears in the list and can be edited

### Test File Saving:
1. Send a message to the AI
2. Click "Save Response" on the AI's reply
3. Verify the file downloads automatically

## Troubleshooting

### KV Namespace Issues:
- Ensure the namespace IDs in `wrangler.jsonc` match your actual KV namespaces
- Check that the binding name is exactly "CHAT_STORE"
- Verify your Cloudflare account has KV enabled

### JSON Validation Errors:
- MCP server commands must be valid JSON arrays: `["command", "arg1", "arg2"]`
- Environment variables must be valid JSON objects: `{"KEY": "value"}`
- Leave fields empty if you don't need them

### File Saving Issues:
- Ensure your browser allows downloads from the domain
- Check that the response content doesn't contain invalid characters
- Modern browsers should handle the download automatically

## Development vs Production

During development with `wrangler dev`, the preview KV namespace will be used. In production, the main namespace ID will be used. This allows you to test without affecting production data.