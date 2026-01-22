# Loopio MCP Server (STDIO) - Sales Representative Edition

This is a Model Context Protocol (MCP) server that provides read-only access to the Loopio Public API v2 via STDIO transport. It exposes **26 tools** covering library entries, projects, compliance sets, custom fields, participants, sections, and file viewing - designed specifically for sales representatives. It integrates with VS Code and GitHub Copilot, enabling AI-powered read access to your Loopio workspace.

## Features

This MCP server provides **26 read-only tools** for Loopio API access:

### Customer Tools (2)
- **getCustomerActiveLanguages** - Get all languages in use in a customer's library entries
- **getCustomer** - Get customer ID and GUID

### Library Entry Tools (5)
- **listLibraryEntries** - List and search library entries with advanced filtering
- **getLibraryEntry** - Get a specific library entry by ID
- **getLibraryEntryAttachments** - Get attachments for a library entry
- **getLibraryEntryHistory** - Get the history of changes to a library entry
- **getLibraryEntryHistoryItem** - Get a specific history item

### Stacks & Files (2)
- **listStacks** - List available stacks (library structure)
- **showFile** - Get file information

### Projects (5)
- **listProjects** - List projects with filters
- **getProject** - Get a specific project by ID
- **getProjectSummary** - Get project summary
- **getProjectSummaryList** - Get list of project summaries
- **listProjectSourceDocuments** - List source documents for a project

### Project Compliance Sets (2)
- **getProjectComplianceSets** - List compliance sets for a project
- **getProjectComplianceSet** - Get a specific compliance set

### Project Participants (1)
- **getProjectParticipants** - Get project participants

### Custom Project Fields (3)
- **listCustomProjectFields** - List custom project fields
- **getCustomProjectField** - Get a specific custom field
- **getCustomProjectFieldValuesForProject** - Get custom field values for a project

### Project Entries (2)
- **listProjectEntries** - List entries in a project
- **getProjectEntry** - Get a specific project entry

### Project Sections (2)
- **listProjectSections** - List sections in a project
- **getProjectSection** - Get a specific section

### Project SubSections (2)
- **listProjectSubSections** - List subsections
- **getProjectSubSection** - Get a specific subsection

### Resources
- **loopio://libraryEntry/{id}** - Access individual library entries as resources

### Prompts
- **searchLibraryEntries** - Search library entries with natural language queries

## Key Features

- **Read-Only Access**: All operations are read-only (GET requests), ensuring data safety
- **Sales Representative Focused**: Tailored for sales team members who need to view and search content
- **Customer Information**: Access customer details and active languages
- **Library Management**: Search, browse, and view library entries with full history
- **Project Visibility**: View projects, summaries, and all associated data
- **Custom Fields**: Access custom project field definitions and values

## Installation and Setup

### Prerequisites
- **Node.js** (version >= 18.0.0)
- **npm** (comes with Node.js)
- **Loopio OAuth 2.0 Client Credentials** (client_id and client_secret)

### Environment Variables
The server uses the following environment variables from a `.env.sales-representative` file:

```bash
LOOPIO_CLIENT_ID=your_client_id_here        # Required
LOOPIO_CLIENT_SECRET=your_client_secret_here # Required
```

Create a `.env.sales-representative` file in the project root with your OAuth client credentials. The server will automatically:
- Fetch an access token on startup using these credentials
- Refresh the token every 59 minutes to maintain authentication

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
  "servers": {
    "loopio": {
      "command": "node",
      "args": ["--loader", "ts-node/esm", "src/index.ts"],
      "cwd": "C:\\Users\\<user>\\Documents\\GitHub\\Loopio-MCP"
    }
  }
}
```

Credentials are loaded from the `.env.sales-representative` file in the project root.

After installation:
1. Create a `.env.sales-representative` file with your OAuth client credentials (see Environment Variables section)
2. Reload VS Code (Ctrl+Shift+P → "Developer: Reload Window")
3. The Loopio MCP server will automatically fetch and refresh OAuth tokens every 59 minutes
4. The server will be available to GitHub Copilot

## API Authentication

This server uses OAuth 2.0 client credentials flow to automatically fetch and refresh access tokens.

### Automatic Token Management:
- **On Startup**: Fetches initial access token using client credentials
- **Auto-Refresh**: Automatically refreshes the token every 59 minutes
- **No Manual Token Updates**: You never need to manually update access tokens

### Get OAuth Client Credentials:

1. Register an OAuth application in your Loopio instance
2. Request the following scopes: `crm:read customProjectField:read file:read library:read project:read project.participant:read`
3. Obtain your `client_id` and `client_secret`
4. Add these credentials to your `.env.sales-representative` file

The server will handle all token fetching and refreshing automatically using this OAuth 2.0 flow:

```bash
curl --location 'https://api.loopio.com/oauth2/access_token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'scope=crm:read customProjectField:read file:read library:read project:read project.participant:read' \
--data-urlencode 'client_id=<client_id>' \
--data-urlencode 'client_secret=<client_secret>'
```

## Usage Examples

Once configured in VS Code, you can use the server through GitHub Copilot:

- "List the latest library entries from Loopio"
- "Get library entry 1744 from Loopio"
- "Create a new library entry about our pricing"
- "Search Loopio for security-related entries"
- "List all projects in Loopio"
- "Create a new project for an RFP"
- "Show me the project sections"

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
- Documentation: See attached `loopio-apis-scoped-SALES-REPRESENTATIVE.yaml` for full API specification

## Troubleshooting

### Server Not Appearing in VS Code
1. Verify `.vscode/mcp.json` has the correct path and token
2. Reload VS Code window
3. Check VS Code output panel for MCP errors

### "Client credentials not found" Error
Ensure `.env.sales-representative` file exists in the project root with `LOOPIO_CLIENT_ID` and `LOOPIO_CLIENT_SECRET` set.

### Connection Errors
- Verify your client credentials are correct in `.env.sales-representative`
- Check that the Loopio API base URL is correct
- Ensure your OAuth application has the required scopes
- Token refresh happens automatically every 59 minutes - no manual intervention needed

### Tool Errors
- Check the Loopio API documentation for required parameters
- Verify stack IDs, category IDs exist in your Loopio instance
- Ensure your access token has the necessary permissions

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