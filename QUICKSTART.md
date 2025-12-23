# Loopio MCP Server - Quick Start Guide

## What is This?

This is a Model Context Protocol (MCP) server that provides comprehensive programmatic access to the Loopio Public API v2 via STDIO transport. It exposes **51 tools** covering library entries, projects, compliance sets, custom fields, participants, sections, templates, and file management. It's designed to integrate with VS Code and GitHub Copilot, enabling AI-powered access to your entire Loopio workspace - from content library management to project collaboration and workflow automation.

## Quick Start

### PreRequisite
Get API Token:

curl --location 'https://api.loopio.com/oauth2/access_token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=client_credentials' \
--data-urlencode 'scope=file:read file:delete library:read library:write library:delete project:read project:write project:delete project.participant:read project.participant:write' \
--data-urlencode 'client_id=<client_id>' \
--data-urlencode 'client_secret=<client_secret>'

### 1. Installation Steps
Navigate to the project directory:
   ```bash
   cd Loopio-MCP
   ```

Install dependencies:
   ```bash
   npm install
   ```

Build the project:
   ```bash
   npm run build
   ```

### 2. Configure in VS Code

Edit `.vscode/mcp.json` and add your Loopio OAuth token:

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

### 3. Reload VS Code
Press `Ctrl+Shift+P` and run "Developer: Reload Window"

### 4. Test with GitHub Copilot

Try asking Copilot:
- "List library entries from Loopio"
- "Get library entry 1744"
- "Search Loopio for security entries"
- "List all projects in Loopio"
- "Create a new project for an RFP"
- "Show me the project sections"

## Available Tools

All 51 tools available in the Loopio MCP server:

### Library Entry Tools (9)
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

### Stacks & Files (3)
| Tool | Description |
|------|-------------|
| `listStacks` | List available stacks (library structure) |
| `showFile` | Get file information |
| `deleteFile` | Delete a file |

### Projects (8)
| Tool | Description |
|------|-------------|
| `listProjects` | List projects with filters |
| `getProject` | Get a specific project by ID |
| `createProject` | Create a new project |
| `updateProject` | Update project status |
| `deleteProject` | Delete a project |
| `getProjectSummary` | Get project summary |
| `getProjectSummaryList` | Get list of project summaries |
| `listProjectSourceDocuments` | List source documents for a project |

### Project Compliance Sets (5)
| Tool | Description |
|------|-------------|
| `getProjectComplianceSets` | List compliance sets for a project |
| `getProjectComplianceSet` | Get a specific compliance set |
| `createComplianceSet` | Create a new compliance set |
| `updateProjectComplianceSet` | Update a compliance set |
| `deleteProjectComplianceSet` | Delete a compliance set |

### Project Participants (2)
| Tool | Description |
|------|-------------|
| `getProjectParticipants` | Get project participants |
| `updateProjectParticipants` | Update project participants |

### Custom Project Fields (7)
| Tool | Description |
|------|-------------|
| `listCustomProjectFields` | List custom project fields |
| `getCustomProjectField` | Get a specific custom field |
| `createCustomProjectField` | Create a new custom field |
| `updateCustomProjectField` | Update a custom field |
| `deleteCustomProjectField` | Delete a custom field |
| `getCustomProjectFieldValuesForProject` | Get custom field values for a project |
| `setCustomProjectFieldValuesForProject` | Set custom field values for a project |

### Project Templates (2)
| Tool | Description |
|------|-------------|
| `listProjectTemplates` | List available project templates |
| `createProjectFromTemplate` | Create project from template |

### Project Entries (5)
| Tool | Description |
|------|-------------|
| `listProjectEntries` | List entries in a project |
| `getProjectEntry` | Get a specific project entry |
| `createProjectEntry` | Create a new project entry |
| `updateProjectEntry` | Update a project entry |
| `deleteProjectEntry` | Delete a project entry |

### Project Sections (5)
| Tool | Description |
|------|-------------|
| `listProjectSections` | List sections in a project |
| `getProjectSection` | Get a specific section |
| `createProjectSection` | Create a new section |
| `updateProjectSection` | Update a section |
| `deleteProjectSection` | Delete a section |

### Project SubSections (5)
| Tool | Description |
|------|-------------|
| `listProjectSubSections` | List subsections |
| `getProjectSubSection` | Get a specific subsection |
| `createProjectSubSection` | Create a new subsection |
| `updateProjectSubSection` | Update a subsection |
| `deleteProjectSubSection` | Delete a subsection |

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
- Review the OpenAPI spec in [loopio-apis-scoped-mcp.yaml](OAS\loopio-apis-scoped-mcp.yaml)

## Support

For Loopio API documentation: https://loopio.stoplight.io/
For MCP protocol: https://modelcontextprotocol.io/
