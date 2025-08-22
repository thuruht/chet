# PHREAK_KV Setup Instructions

## Step 1: Create KV Namespace in Cloudflare Dashboard

1. Go to your Cloudflare dashboard
2. Navigate to **Workers & Pages** → **KV**
3. Click **"Create a namespace"**
4. Name it: `PHREAK_KV`
5. Copy the **Namespace ID** that gets generated

## Step 2: Update wrangler.jsonc

Replace the placeholder IDs in your `wrangler.jsonc` file:

```jsonc
"kv_namespaces": [
  {
    "binding": "PHREAK_KV",
    "id": "replace-with-your-phreak-kv-namespace-id",
    "preview_id": "replace-with-your-phreak-kv-preview-id"
  }
],
```

### To get both IDs:

**Production ID:**
- This is the main namespace ID from step 1

**Preview ID (for development):**
- In the KV dashboard, look for a "Preview" or "Development" namespace
- Or create another namespace called `PHREAK_KV_PREVIEW`
- Use that ID as the `preview_id`

## Step 3: Deploy

After updating the IDs, your deployment should work:

```bash
npm run deploy
```

## Example Configuration

Your final `wrangler.jsonc` should look like this:

```jsonc
"kv_namespaces": [
  {
    "binding": "PHREAK_KV",
    "id": "abc123def456ghi789",
    "preview_id": "xyz789uvw456rst123"
  }
],
```

## What's Changed

✅ **Binding renamed**: `CHAT_STORE` → `PHREAK_KV`  
✅ **All backend code updated** to use the new binding  
✅ **Types updated** to reflect the new KV binding name  

Once you update the namespace IDs, your prompts and MCP server management features will work perfectly!