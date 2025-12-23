# Loopio MCP Server (STDIO)

A Model Context Protocol (MCP) server that provides access to the Loopio Library Entries API via STDIO transport. This server exposes Loopio's library management capabilities through MCP tools, resources, and prompts for use with VS Code and other MCP clients.

## Features

### Tools
- **listLibraryEntries** - List and search library entries with advanced filtering
- **getLibraryEntry** - Get a specific library entry by ID
- **createLibraryEntry** - Create new library entries
- **updateLibraryEntry** - Update library entries using JSON Patch operations
- **deleteLibraryEntry** - Delete library entries
- **getLibraryEntryAttachments** - Get attachments for a library entry
- **getLibraryEntryHistory** - Get the history of changes to a library entry
- **getLibraryEntryHistoryItem** - Get a specific history item
- **bulkCreateLibraryEntries** - Create multiple library entries at once

### Resources
- **loopio://libraryEntry/{id}** - Access individual library entries as resources

### Prompts
- **searchLibraryEntries** - Search library entries with natural language queries

## Installation and Setup

### Prerequisites
- **Node.js** (version >= 18.0.0)
- **npm** (comes with Node.js)
- **Loopio API Access Token** (OAuth 2.0)

### Environment Variables
The server uses the following environment variable:

```bash
LOOPIO_ACCESS_TOKEN=your_oauth_token_here  # Required
```

Set this in your VS Code MCP configuration (`.vscode/mcp.json`) or system environment.

### Installation Steps
1. Navigate to the project directory:
   ```bash
   cd Loopio-MCP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## VS Code Integration

The server is configured for VS Code MCP integration in [.vscode/mcp.json](.vscode/mcp.json):

```json
{
  "mcpServers": {
    "loopio": {
      "command": "node",
      "args": ["--loader", "ts-node/esm", "src/index.ts"],
      "cwd": "C:\\Users\\rosemary.charnley\\Documents\\Loopio-MCP",
      "env": {
        "LOOPIO_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

After installation:
1. Update your access token in `.vscode/mcp.json`
2. Reload VS Code (Ctrl+Shift+P → "Developer: Reload Window")
3. The Loopio MCP server will be available to GitHub Copilot

## API Authentication

This server requires a Loopio OAuth 2.0 access token. To obtain one:

1. Register an OAuth application in your Loopio instance
2. Request the following scopes:
   - `library:read` - View library entries
   - `library:write` - Create and update library entries
   - `library:delete` - Delete library entries
3. Complete the OAuth flow to obtain an access token
4. Set the token in `.vscode/mcp.json`

## Usage Examples

Once configured in VS Code, you can use the server through GitHub Copilot:

- "List the latest library entries from Loopio"
- "Get library entry 1744 from Loopio"
- "Create a new library entry about our pricing"
- "Search Loopio for security-related entries"

## Project Structure

```
Loopio-MCP/
├── .vscode/
│   └── mcp.json           # VS Code MCP configuration
├── src/
│   ├── index.ts           # Main MCP server (STDIO mode)
│   ├── loopio-client.ts   # Loopio API client wrapper
│   └── types.ts           # TypeScript type definitions
├── dist/                  # Compiled JavaScript (after build)
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## Development

### Run in Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Production Build
```bash
npm start
```

## API Reference

Based on the Loopio Public API v2 OpenAPI Specification:
- Base URL: `https://api.loopio.com/data/v2`
- Authentication: OAuth 2.0 Bearer Token
- Documentation: See attached `loopio-api.yaml` for full API specification

## Troubleshooting

### Server Not Appearing in VS Code
1. Verify `.vscode/mcp.json` has the correct path and token
2. Reload VS Code window
3. Check VS Code output panel for MCP errors

### "LOOPIO_ACCESS_TOKEN not set" Warning
Update the token in `.vscode/mcp.json` with your valid OAuth token.

### Connection Errors
- Verify your access token is valid and not expired
- Check that the Loopio API base URL is correct
- Ensure you have the required OAuth scopes

### Tool Errors
- Check the Loopio API documentation for required parameters
- Verify stack IDs, category IDs exist in your Loopio instance
- Ensure your access token has the necessary permissions

## License

MIT
  "id": 1
}
```

* method: Specifies the tool or resource to invoke (e.g., tool/echo).
* params: Contains the parameters required by the tool or resource.
* id: A unique identifier for the request

The server will respond with a JSON-RPC 2.0-compliant response:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [ {"type":"text","text":"Tool echo: Hello, MCP!"} ]
  },
  "id": 1
}
```

#### Using cURL to Send Requests
You can use cURL to send requests to the MCP server. Here is an example command:

```bash
curl -X POST http://localhost:4000/mcp \
-H "Content-Type: application/json" \
-H "Accept: application/json, text/event-stream" \
-d '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "echo",
    "arguments": {
      "message": "Hello, MCP!"
    }
  },
  "id": 1
}'
```

## Server customization

### Port
If you want to run the MCP server on a different port, you can set the `MCP_SERVER_PORT` environment variable before starting the server. For example:
```
export MCP_SERVER_PORT=4002
```

### API url
By default, MCP Server is using first server url defined in the OpenAPI Specification (OAS) file.
In order to customize API URL for the MCP server, please set the `MCP_API_URL` environment variable:
```
export MCP_API_URL=<desired_url>
```

### MCP server methods
If you need to modify the MCP server methods, you can do so in the `src/index.ts` file. 
The methods are generated based on the OpenAPI Specification (OAS) file, and you can adjust them as needed.

## Troubleshooting
If the project is not running as expected:  
1. Ensure all dependencies are installed by running `npm install`
2. Verify that you are using Node.js version 18 or higher: `node -v`
3. Check for errors in the terminal output when running `npm run dev`
4. Ensure the port (default: 4000) is not already in use by another application.
5. Verify custom environment variables:
   ```bash
   echo $MCP_SERVER_PORT
   echo $MCP_API_URL
   ```
6. If the issue persists, review the code in `src/index.ts` for potential misconfigurations or errors.