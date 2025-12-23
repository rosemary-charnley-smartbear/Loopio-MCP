# Loopio MCP Server - Quick Start Guide

## What is This?

This is a Model Context Protocol (MCP) server that provides programmatic access to the Loopio Library Entries API via STDIO transport. It's designed to integrate with VS Code and GitHub Copilot, allowing AI-powered access to your Loopio library.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure in VS Code

Edit `.vscode/mcp.json` and add your Loopio OAuth token:

```json
{
  "mcpServers": {
    "loopio": {
      "command": "node",
      "args": ["--loader", "ts-node/esm", "src/index.ts"],
      "cwd": "C:\\Users\\rosemary.charnley\\Documents\\Loopio-MCP",
      "env": {
        "LOOPIO_ACCESS_TOKEN": "your_oauth_token_here"
      }
    }
  }
}
```

### 3. Reload VS Code
Press `Ctrl+Shift+P` and run "Developer: Reload Window"

### 4. Test with GitHub Copilot

Try asking Copilot:
- "List library entries from Loopio"
- "Get library entry 1744"
- "Search Loopio for security entries"

## Available Tools

| Tool | Description |
|------|-------------|
| `listLibraryEntries` | List and search library entries |
| `getLibraryEntry` | Get a specific entry by ID |
| `createLibraryEntry` | Create a new entry |
| `updateLibraryEntry` | Update an entry (JSON Patch) |
| `deleteLibraryEntry` | Delete an entry |
| `getLibraryEntryAttachments` | Get entry attachments |
| `getLibraryEntryHistory` | Get entry change history |
| `getLibraryEntryHistoryItem` | Get specific history item |
| `bulkCreateLibraryEntries` | Create multiple entries |

## OAuth Setup

To get an access token:

1. Go to your Loopio instance settings
2. Create an OAuth application
3. Request these scopes:
   - `library:read`
   - `library:write`
   - `library:delete`
4. Complete OAuth flow to get the access token

## Project Structure

```
Loopio-MCP/
├── .vscode/
│   └── mcp.json           # MCP configuration
├── src/
│   ├── index.ts           # Main STDIO server
│   ├── loopio-client.ts   # API client
│   └── types.ts           # TypeScript types
├── package.json
└── README.md
```

## Development

### Run in Dev Mode
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Run Built Version
```bash
npm start
```

## Troubleshooting

**Server not showing in VS Code:**
- Verify `.vscode/mcp.json` has correct token
- Reload VS Code window
- Check Output panel for errors

**"Access token not set":**
- Update `LOOPIO_ACCESS_TOKEN` in `.vscode/mcp.json`

**Connection errors:**
- Verify token is valid and not expired
- Check you have required OAuth scopes

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [EXAMPLES.md](EXAMPLES.md) for usage examples
- Review the OpenAPI spec in `loopio-api.yaml`

## Support

For Loopio API documentation: https://support.loopio.com/
For MCP protocol: https://modelcontextprotocol.io/
