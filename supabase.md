### Supabase Setup

This document provides guidance on setting up and connecting to Supabase for this project.

### Supabase Connection

**IMPORTANT**: Never store connection strings or API keys in your codebase or commit them to version control!

Connection strings and API keys should be stored as environment variables:

1. For local development, use a `.env.local` file (which should be in your `.gitignore`)
2. For production, use the Vercel environment variables panel or your hosting provider's secure environment variable system

### Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Local Development

For local development with the MCP tools, use the command pattern below, replacing placeholders with your actual credentials (but don't save them in this file):

```
npx -y @modelcontextprotocol/server-postgres postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

### Vercel Commands

For Vercel integration with MCP tools:

```
npx vercel-mcp VERCEL_API_KEY=[YOUR_VERCEL_API_KEY]
```

Remember that your API keys should be treated as sensitive credentials and never shared or committed to public repositories.
