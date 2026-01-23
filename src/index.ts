import { config } from "dotenv";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { LoopioApiClient } from "./loopio-client.js";
import type { LoopioConfig } from "./types.js";

// Load environment variables from .env.sales-representative file
config({ path: ".env.sales-representative" });

// Configure Loopio API client
const loopioConfig: LoopioConfig = {
  apiBaseUrl: process.env.LOOPIO_API_BASE_URL || "https://api.loopio.com/data/v2",
  clientId: process.env.LOOPIO_CLIENT_ID || "",
  clientSecret: process.env.LOOPIO_CLIENT_SECRET || "",
};

const loopioClient = new LoopioApiClient(loopioConfig);

const server = new McpServer({
  name: "Loopio Library Entries",
  version: "1.0.0"
});

// ====================
// RESOURCES
// ====================

server.resource(
  "libraryEntry",
  new ResourceTemplate("loopio://libraryEntry/{id}", { list: undefined }),
  async (uri, { id }) => {
    const entryId = parseInt(id as string, 10);
    const entry = await loopioClient.getLibraryEntry(entryId);
    return {
      contents: [{
        uri: uri.href,
        text: JSON.stringify(entry, null, 2),
        mimeType: "application/json"
      }]
    };
  }
);

// ====================
// TOOLS
// ====================

// ====================
// CUSTOMER TOOLS
// ====================

server.tool(
  "getCustomerActiveLanguages",
  "Get all the languages in use in a customer's collection of library entries",
  { customerId: z.number().describe("Customer ID") },
  async ({ customerId }) => {
    const languages = await loopioClient.getCustomerActiveLanguages(customerId);
    return {
      content: [{ type: "text", text: JSON.stringify(languages, null, 2) }]
    };
  }
);

server.tool(
  "getCustomer",
  "Get the id and guid for a given Customer",
  { customerId: z.number().describe("Customer ID") },
  async ({ customerId }) => {
    const customer = await loopioClient.getCustomer(customerId);
    return {
      content: [{ type: "text", text: JSON.stringify(customer, null, 2) }]
    };
  }
);

// ====================
// LIBRARY ENTRIES TOOLS
// ====================

server.tool(
  "listLibraryEntries",
  "List Library Entries you can interact with",
  {
    page: z.number().optional().describe("Page number (default: 1)"),
    pageSize: z.number().min(1).max(200).optional().describe("Number of items per page (default: 10, max: 200)"),
    filter: z.object({
      searchQuery: z.string().optional().describe("Search query text"),
      language: z.string().optional().describe("Language code (e.g., 'en')"),
      lastUpdatedDate: z.object({
        gte: z.string().optional().describe("Greater than or equal to date (ISO 8601)"),
        lte: z.string().optional().describe("Less than or equal to date (ISO 8601)")
      }).optional(),
      hasAttachment: z.boolean().optional().describe("Filter entries with attachments"),
      searchInQuestions: z.boolean().optional().describe("Search within questions"),
      searchInAnswers: z.boolean().optional().describe("Search within answers"),
      searchInTags: z.boolean().optional().describe("Search within tags")
    }).optional().describe("Filter options for library entries")
  },
  async ({ page, pageSize, filter }) => {
    const result = await loopioClient.listLibraryEntries({ page, pageSize, filter });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "getLibraryEntry",
  "Get a Library Entry",
  {
    libraryEntryId: z.number().describe("Library Entry ID"),
    inlineMergeVariables: z.boolean().optional().describe("Substitute merge variable placeholders")
  },
  async ({ libraryEntryId, inlineMergeVariables }) => {
    const inline = inlineMergeVariables ? ["@mergeVariables"] : undefined;
    const entry = await loopioClient.getLibraryEntry(libraryEntryId, inline);
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }]
    };
  }
);

server.tool(
  "getLibraryEntryAttachments",
  "Get Library Entry's Attachments",
  { libraryEntryId: z.number().describe("Library Entry ID") },
  async ({ libraryEntryId }) => {
    const attachments = await loopioClient.getLibraryEntryAttachments(libraryEntryId);
    return {
      content: [{ type: "text", text: JSON.stringify(attachments, null, 2) }]
    };
  }
);

server.tool(
  "getLibraryEntryHistory",
  "Get history of a Library Entry",
  {
    libraryEntryId: z.number().describe("Library Entry ID"),
    page: z.number().optional().describe("Page number"),
    pageSize: z.number().optional().describe("Items per page")
  },
  async ({ libraryEntryId, page, pageSize }) => {
    const history = await loopioClient.getLibraryEntryHistories(libraryEntryId, { page, pageSize });
    return {
      content: [{ type: "text", text: JSON.stringify(history, null, 2) }]
    };
  }
);

server.tool(
  "getLibraryEntryHistoryItem",
  "Get a specific history item of a Library Entry",
  {
    libraryEntryId: z.number().describe("Library Entry ID"),
    historyId: z.number().describe("History Item ID")
  },
  async ({ libraryEntryId, historyId }) => {
    const historyItem = await loopioClient.getLibraryEntryHistory(libraryEntryId, historyId);
    return {
      content: [{ type: "text", text: JSON.stringify(historyItem, null, 2) }]
    };
  }
);

// ====================
// STACKS TOOLS
// ====================

server.tool(
  "listStacks",
  "List accessible stacks; View full Library structure",
  {
    fields: z.string().optional().describe("Fields to include (e.g., '@wide' for full structure)")
  },
  async ({ fields }) => {
    const stacks = await loopioClient.listStacks(fields);
    return {
      content: [{ type: "text", text: JSON.stringify(stacks, null, 2) }]
    };
  }
);

// ====================
// FILES TOOLS
// ====================

server.tool(
  "showFile",
  "Show information about a file",
  { fileId: z.number().describe("File ID") },
  async ({ fileId }) => {
    const file = await loopioClient.showFile(fileId);
    return {
      content: [{ type: "text", text: JSON.stringify(file, null, 2) }]
    };
  }
);

// ====================
// PROJECTS TOOLS
// ====================

server.tool(
  "listProjects",
  "List projects you can interact with",
  {
    page: z.number().optional().describe("Page number"),
    pageSize: z.number().optional().describe("Items per page"),
    rfxTypes: z.array(z.string()).optional().describe("Filter by project types (RFP, RFI, DDQ, SQ, PP, OTHER)"),
    owners: z.array(z.number()).optional().describe("Filter by owner IDs")
  },
  async ({ page, pageSize, rfxTypes, owners }) => {
    const result = await loopioClient.listProjects({ page, pageSize, rfxTypes, owners });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "getProject",
  "Get a Project's data",
  {
    projectId: z.number().describe("Project ID"),
    fields: z.string().optional().describe("Fields to include in response")
  },
  async ({ projectId, fields }) => {
    const project = await loopioClient.getProject(projectId, fields);
    return {
      content: [{ type: "text", text: JSON.stringify(project, null, 2) }]
    };
  }
);

server.tool(
  "getProjectSummary",
  "Get the status summary of a Project",
  { projectId: z.number().describe("Project ID") },
  async ({ projectId }) => {
    const summary = await loopioClient.getProjectSummary(projectId);
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }]
    };
  }
);

server.tool(
  "getProjectSummaryList",
  "Get the status summary list of Projects filtered by date last synced",
  { lastUpdatedDateGt: z.string().describe("Get projects updated after this date (ISO 8601)") },
  async ({ lastUpdatedDateGt }) => {
    const summaries = await loopioClient.getProjectSummaryList(lastUpdatedDateGt);
    return {
      content: [{ type: "text", text: JSON.stringify(summaries, null, 2) }]
    };
  }
);

// ====================
// PROJECT COMPLIANCE SETS (ANSWER SETS) TOOLS
// ====================

server.tool(
  "getProjectComplianceSets",
  "Get the Compliance Sets for a Project (Note: Compliance Sets are also referred to as Answer Sets)",
  { projectId: z.number().describe("Project ID") },
  async ({ projectId }) => {
    const sets = await loopioClient.getProjectComplianceSets(projectId);
    return {
      content: [{ type: "text", text: JSON.stringify(sets, null, 2) }]
    };
  }
);

server.tool(
  "getProjectComplianceSet",
  "Get a Compliance Set for a Project (Note: Compliance Sets are also referred to as Answer Sets)",
  {
    projectId: z.number().describe("Project ID"),
    complianceSetId: z.number().describe("Compliance Set ID")
  },
  async ({ projectId, complianceSetId }) => {
    const set = await loopioClient.getProjectComplianceSet(projectId, complianceSetId);
    return {
      content: [{ type: "text", text: JSON.stringify(set, null, 2) }]
    };
  }
);

// ====================
// PROJECT PARTICIPANTS TOOLS
// ====================

server.tool(
  "getProjectParticipants",
  "Get the participants for a Project",
  { projectId: z.number().describe("Project ID") },
  async ({ projectId }) => {
    const participants = await loopioClient.getProjectParticipants(projectId);
    return {
      content: [{ type: "text", text: JSON.stringify(participants, null, 2) }]
    };
  }
);

// ====================
// PROJECT SOURCE DOCUMENTS TOOLS
// ====================

server.tool(
  "listProjectSourceDocuments",
  "View basic information on a Project's source files",
  { projectId: z.number().describe("Project ID") },
  async ({ projectId }) => {
    const documents = await loopioClient.listProjectSourceDocuments(projectId);
    return {
      content: [{ type: "text", text: JSON.stringify(documents, null, 2) }]
    };
  }
);

// ====================
// CUSTOM PROJECT FIELDS TOOLS
// ====================

server.tool(
  "getCustomProjectFieldValuesForProject",
  "Get Custom Project Field values for a given Project",
  { projectId: z.number().describe("Project ID") },
  async ({ projectId }) => {
    const values = await loopioClient.getCustomProjectFieldValuesForProject(projectId);
    return {
      content: [{ type: "text", text: JSON.stringify(values, null, 2) }]
    };
  }
);

// ====================
// CUSTOM PROJECT FIELDS TOOLS
// ====================

server.tool(
  "listCustomProjectFields",
  "List defined Custom Project Fields",
  { source: z.string().optional().describe("Filter by source (project, salesforce, msDynamics)") },
  async ({ source }) => {
    const fields = await loopioClient.listCustomProjectFields(source);
    return {
      content: [{ type: "text", text: JSON.stringify(fields, null, 2) }]
    };
  }
);

server.tool(
  "getCustomProjectField",
  "Get a Custom Project Field",
  { id: z.number().describe("Custom Project Field ID") },
  async ({ id }) => {
    const field = await loopioClient.getCustomProjectField(id);
    return {
      content: [{ type: "text", text: JSON.stringify(field, null, 2) }]
    };
  }
);

// ====================
// PROJECT ENTRIES TOOLS
// ====================

server.tool(
  "listProjectEntries",
  "List your Project Entries",
  {
    projectId: z.number().describe("Project ID"),
    sectionId: z.number().optional().describe("Filter by section ID"),
    subSectionId: z.number().optional().describe("Filter by subsection ID"),
    inline: z.array(z.string()).optional().describe("Inline options"),
    page: z.number().optional().describe("Page number"),
    pageSize: z.number().optional().describe("Items per page")
  },
  async ({ projectId, sectionId, subSectionId, inline, page, pageSize }) => {
    const result = await loopioClient.listProjectEntries({
      projectId,
      sectionId,
      subSectionId,
      inline,
      page,
      pageSize
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "getProjectEntry",
  "Retrieve a specific Project Entry",
  {
    projectEntryId: z.number().describe("Project Entry ID"),
    inline: z.array(z.string()).optional().describe("Inline options")
  },
  async ({ projectEntryId, inline }) => {
    const entry = await loopioClient.getProjectEntry(projectEntryId, inline);
    return {
      content: [{ type: "text", text: JSON.stringify(entry, null, 2) }]
    };
  }
);

// ====================
// SECTIONS TOOLS
// ====================

server.tool(
  "listProjectSections",
  "List your Project sections",
  {
    projectId: z.number().describe("Project ID"),
    page: z.number().optional().describe("Page number"),
    pageSize: z.number().optional().describe("Items per page")
  },
  async ({ projectId, page, pageSize }) => {
    const result = await loopioClient.listProjectSections({ projectId, page, pageSize });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "getProjectSection",
  "Retrieve a specific Project section",
  { sectionId: z.number().describe("Section ID") },
  async ({ sectionId }) => {
    const section = await loopioClient.getProjectSection(sectionId);
    return {
      content: [{ type: "text", text: JSON.stringify(section, null, 2) }]
    };
  }
);

// ====================
// SUBSECTIONS TOOLS
// ====================

server.tool(
  "listProjectSubSections",
  "List your Project subSections",
  {
    projectId: z.number().describe("Project ID"),
    sectionId: z.number().optional().describe("Filter by section ID"),
    page: z.number().optional().describe("Page number"),
    pageSize: z.number().optional().describe("Items per page")
  },
  async ({ projectId, sectionId, page, pageSize }) => {
    const result = await loopioClient.listProjectSubSections({ projectId, sectionId, page, pageSize });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "getProjectSubSection",
  "Retrieve a specific Project subSection",
  { subSectionId: z.number().describe("SubSection ID") },
  async ({ subSectionId }) => {
    const subSection = await loopioClient.getProjectSubSection(subSectionId);
    return {
      content: [{ type: "text", text: JSON.stringify(subSection, null, 2) }]
    };
  }
);

// ====================
// PROMPTS
// ====================

server.prompt(
  "searchLibraryEntries",
  { query: z.string().describe("Search query for library entries") },
  ({ query }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Please search the Loopio library for entries related to: "${query}". Use the listLibraryEntries tool with appropriate filters.`
      }
    }]
  })
);

// ====================
// START STDIO SERVER
// ====================

async function main() {
  // Validate required environment variables
  if (!loopioConfig.clientId || !loopioConfig.clientSecret) {
    console.error("ERROR: LOOPIO_CLIENT_ID and LOOPIO_CLIENT_SECRET must be set in .env.sales-representative file!");
    process.exit(1);
  }

  // Fetch initial access token
  console.error("[Loopio] Fetching initial access token...");
  await loopioClient.fetchAccessToken();

  // Start automatic token refresh (every 59 minutes)
  loopioClient.startTokenRefresh();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log to stderr (stdout is for MCP protocol)
  console.error("Loopio MCP Server (STDIO mode) started");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
