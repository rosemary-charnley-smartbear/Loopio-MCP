# Loopio MCP Server (STDIO)

This is a Model Context Protocol (MCP) server that provides comprehensive programmatic access to the Loopio Public API v2 via STDIO transport. It exposes **51 tools** covering library entries, projects, compliance sets, custom fields, participants, sections, templates, and file management. It's designed to integrate with VS Code and GitHub Copilot, enabling AI-powered access to your entire Loopio workspace - from content library management to project collaboration and workflow automation.

## Features

This MCP server provides **51 tools** for comprehensive Loopio API access:

### Library Entry Tools (9)
- **listLibraryEntries** - List and search library entries with advanced filtering
- **getLibraryEntry** - Get a specific library entry by ID
- **createLibraryEntry** - Create new library entries
- **updateLibraryEntry** - Update library entries using JSON Patch operations
- **deleteLibraryEntry** - Delete library entries
- **getLibraryEntryAttachments** - Get attachments for a library entry
- **getLibraryEntryHistory** - Get the history of changes to a library entry
- **getLibraryEntryHistoryItem** - Get a specific history item
- **bulkCreateLibraryEntries** - Create multiple library entries at once

### Stacks & Files (3)
- **listStacks** - List available stacks (library structure)
- **showFile** - Get file information
- **deleteFile** - Delete a file

### Projects (8)
- **listProjects** - List projects with filters
- **getProject** - Get a specific project by ID
- **createProject** - Create a new project
- **updateProject** - Update project status
- **deleteProject** - Delete a project
- **getProjectSummary** - Get project summary
- **getProjectSummaryList** - Get list of project summaries
- **listProjectSourceDocuments** - List source documents for a project

### Project Compliance Sets (5)
- **getProjectComplianceSets** - List compliance sets for a project
- **getProjectComplianceSet** - Get a specific compliance set
- **createComplianceSet** - Create a new compliance set
- **updateProjectComplianceSet** - Update a compliance set
- **deleteProjectComplianceSet** - Delete a compliance set

### Project Participants (2)
- **getProjectParticipants** - Get project participants
- **updateProjectParticipants** - Update project participants

### Custom Project Fields (7)
- **listCustomProjectFields** - List custom project fields
- **getCustomProjectField** - Get a specific custom field
- **createCustomProjectField** - Create a new custom field
- **updateCustomProjectField** - Update a custom field
- **deleteCustomProjectField** - Delete a custom field
- **getCustomProjectFieldValuesForProject** - Get custom field values for a project
- **setCustomProjectFieldValuesForProject** - Set custom field values for a project

### Project Templates (2)
- **listProjectTemplates** - List available project templates
- **createProjectFromTemplate** - Create project from template

### Project Entries (5)
- **listProjectEntries** - List entries in a project
- **getProjectEntry** - Get a specific project entry
- **createProjectEntry** - Create a new project entry
- **updateProjectEntry** - Update a project entry
- **deleteProjectEntry** - Delete a project entry

### Project Sections (5)
- **listProjectSections** - List sections in a project
- **getProjectSection** - Get a specific section
- **createProjectSection** - Create a new section
- **updateProjectSection** - Update a section
- **deleteProjectSection** - Delete a section

### Project SubSections (5)
- **listProjectSubSections** - List subsections
- **getProjectSubSection** - Get a specific subsection
- **createProjectSubSection** - Create a new subsection
- **updateProjectSubSection** - Update a subsection
- **deleteProjectSubSection** - Delete a subsection

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
  "servers": {
    "loopio": {
      "command": "node",
      "args": ["--loader", "ts-node/esm", "src/index.ts"],
      "cwd": "C:\\Users\\<user>\\Documents\\GitHub\\Loopio-MCP",
      "env": {
        "LOOPIO_ACCESS_TOKEN": "<your_oauth_token_here>"
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

### Get API Token:

```bash
curl --location 'https://api.loopio.com/oauth2/access_token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'scope=file:read file:delete library:read library:write library:delete project:read project:write project:delete project.participant:read project.participant:write' \
--data-urlencode 'client_id=<client_id>' \
--data-urlencode 'client_secret=<client_secret>'
```

### Setup Steps:

1. Register an OAuth application in your Loopio instance
2. Request the following scopes:
   - `file:read`, `file:delete`
   - `library:read`, `library:write`, `library:delete`
   - `project:read`, `project:write`, `project:delete`
   - `project.participant:read`, `project.participant:write`
3. Complete the OAuth flow to obtain an access token
4. Set the token in `.vscode/mcp.json`

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