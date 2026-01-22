import { config } from "dotenv";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { LoopioApiClient } from "./loopio-client.js";
import type { LoopioConfig } from "./types.js";

// Load environment variables from .env.rfp file
config({ path: ".env.rfp" });

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

server.tool(
  "listLibraryEntries",
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
  "createLibraryEntry",
  {
    questions: z.array(z.object({ text: z.string().describe("Question text") })).min(1).describe("Array of questions for this entry"),
    answerText: z.string().nullable().describe("Answer text (can be null if using compliance answers)"),
    stackId: z.number().describe("Stack ID for the library location"),
    categoryId: z.number().optional().describe("Category ID (optional)"),
    subCategoryId: z.number().optional().describe("SubCategory ID (optional)"),
    languageCode: z.string().optional().describe("Language code (default: 'en')"),
    tags: z.array(z.string()).optional().describe("Array of tag strings")
  },
  async ({ questions, answerText, stackId, categoryId, subCategoryId, languageCode, tags }) => {
    const entry = await loopioClient.createLibraryEntry({
      questions,
      answer: { text: answerText },
      location: {
        stack: { id: stackId },
        ...(categoryId && { category: { id: categoryId } }),
        ...(subCategoryId && { subCategory: { id: subCategoryId } })
      },
      languageCode,
      tags
    });
    return {
      content: [{ type: "text", text: `Successfully created library entry with ID: ${entry.id}\n\n${JSON.stringify(entry, null, 2)}` }]
    };
  }
);

server.tool(
  "updateLibraryEntry",
  {
    libraryEntryId: z.number().describe("Library Entry ID to update"),
    operations: z.array(z.object({
      op: z.enum(["add", "remove", "replace", "move", "copy", "test"]).describe("JSON Patch operation"),
      path: z.string().describe("JSON path to the field (e.g., '/answer/text', '/tags')"),
      value: z.any().optional().describe("Value for the operation"),
      from: z.string().optional().describe("Source path for move/copy operations")
    })).describe("Array of JSON Patch operations")
  },
  async ({ libraryEntryId, operations }) => {
    const entry = await loopioClient.updateLibraryEntry(libraryEntryId, operations);
    return {
      content: [{ type: "text", text: `Successfully updated library entry ${libraryEntryId}\n\n${JSON.stringify(entry, null, 2)}` }]
    };
  }
);

server.tool(
  "deleteLibraryEntry",
  { libraryEntryId: z.number().describe("Library Entry ID to delete") },
  async ({ libraryEntryId }) => {
    await loopioClient.deleteLibraryEntry(libraryEntryId);
    return {
      content: [{ type: "text", text: `Successfully deleted library entry ${libraryEntryId}` }]
    };
  }
);

server.tool(
  "getLibraryEntryAttachments",
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

server.tool(
  "bulkCreateLibraryEntries",
  {
    entries: z.array(z.object({
      questions: z.array(z.object({ text: z.string() })).min(1),
      answerText: z.string(),
      stackId: z.number(),
      categoryId: z.number().optional(),
      subCategoryId: z.number().optional(),
      languageCode: z.string().optional(),
      tags: z.array(z.string()).optional()
    })).describe("Array of library entries to create")
  },
  async ({ entries }) => {
    const formattedEntries = entries.map(entry => ({
      questions: entry.questions,
      answer: { text: entry.answerText },
      location: {
        stack: { id: entry.stackId },
        ...(entry.categoryId && { category: { id: entry.categoryId } }),
        ...(entry.subCategoryId && { subCategory: { id: entry.subCategoryId } })
      },
      languageCode: entry.languageCode,
      tags: entry.tags
    }));
    const result = await loopioClient.bulkCreateLibraryEntries(formattedEntries);
    return {
      content: [{ type: "text", text: `Bulk create task accepted. Task ID: ${result.taskId}` }]
    };
  }
);

// ====================
// STACKS TOOLS
// ====================

server.tool(
  "listStacks",
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
  { fileId: z.number().describe("File ID") },
  async ({ fileId }) => {
    const file = await loopioClient.showFile(fileId);
    return {
      content: [{ type: "text", text: JSON.stringify(file, null, 2) }]
    };
  }
);

server.tool(
  "deleteFile",
  { fileId: z.number().describe("File ID to delete") },
  async ({ fileId }) => {
    await loopioClient.deleteFile(fileId);
    return {
      content: [{ type: "text", text: `Successfully deleted file ${fileId}` }]
    };
  }
);

// ====================
// PROJECTS TOOLS
// ====================

server.tool(
  "listProjects",
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
  "createProject",
  {
    name: z.string().describe("Project name"),
    projectType: z.enum(["RFP", "RFI", "DDQ", "SQ", "PP", "OTHER"]).describe("Project type"),
    companyName: z.string().describe("Company name"),
    dueDate: z.string().describe("Due date (ISO 8601 format)"),
    description: z.string().optional().describe("Project description"),
    ownerId: z.number().optional().describe("Owner user ID"),
    customProjectFieldValues: z.record(z.string()).optional().describe("Custom field values"),
    mergeVariableValues: z.record(z.string()).optional().describe("Merge variable values")
  },
  async ({ name, projectType, companyName, dueDate, description, ownerId, customProjectFieldValues, mergeVariableValues }) => {
    const project = await loopioClient.createProject({
      name,
      projectType,
      companyName,
      dueDate,
      description: description || null,
      ...(ownerId && { owner: { id: ownerId } }),
      customProjectFieldValues,
      mergeVariableValues
    });
    return {
      content: [{ type: "text", text: `Successfully created project with ID: ${project.id}\n\n${JSON.stringify(project, null, 2)}` }]
    };
  }
);

server.tool(
  "updateProject",
  {
    projectId: z.number().describe("Project ID"),
    status: z.string().describe("New project status")
  },
  async ({ projectId, status }) => {
    const project = await loopioClient.updateProject(projectId, { status });
    return {
      content: [{ type: "text", text: `Successfully updated project ${projectId}\n\n${JSON.stringify(project, null, 2)}` }]
    };
  }
);

server.tool(
  "deleteProject",
  { projectId: z.number().describe("Project ID to delete") },
  async ({ projectId }) => {
    await loopioClient.deleteProject(projectId);
    return {
      content: [{ type: "text", text: `Successfully deleted project ${projectId}` }]
    };
  }
);

server.tool(
  "getProjectSummary",
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

server.tool(
  "createComplianceSet",
  {
    projectId: z.number().describe("Project ID"),
    label: z.string().describe("Compliance set label"),
    shortName: z.string().describe("Short name (min 1 character)"),
    options: z.array(z.object({ label: z.string() })).describe("Compliance options")
  },
  async ({ projectId, label, shortName, options }) => {
    const set = await loopioClient.createComplianceSet(projectId, { label, shortName, options });
    return {
      content: [{ type: "text", text: `Successfully created compliance set\n\n${JSON.stringify(set, null, 2)}` }]
    };
  }
);

server.tool(
  "updateProjectComplianceSet",
  {
    projectId: z.number().describe("Project ID"),
    complianceSetId: z.number().describe("Compliance Set ID"),
    label: z.string().describe("Compliance set label"),
    shortName: z.string().describe("Short name"),
    options: z.array(z.object({ label: z.string() })).describe("Compliance options")
  },
  async ({ projectId, complianceSetId, label, shortName, options }) => {
    const set = await loopioClient.updateProjectComplianceSet(projectId, complianceSetId, { label, shortName, options });
    return {
      content: [{ type: "text", text: `Successfully updated compliance set\n\n${JSON.stringify(set, null, 2)}` }]
    };
  }
);

server.tool(
  "deleteProjectComplianceSet",
  {
    projectId: z.number().describe("Project ID"),
    complianceSetId: z.number().describe("Compliance Set ID to delete")
  },
  async ({ projectId, complianceSetId }) => {
    await loopioClient.deleteProjectComplianceSet(projectId, complianceSetId);
    return {
      content: [{ type: "text", text: `Successfully deleted compliance set ${complianceSetId}` }]
    };
  }
);

// ====================
// PROJECT PARTICIPANTS TOOLS
// ====================

server.tool(
  "getProjectParticipants",
  { projectId: z.number().describe("Project ID") },
  async ({ projectId }) => {
    const participants = await loopioClient.getProjectParticipants(projectId);
    return {
      content: [{ type: "text", text: JSON.stringify(participants, null, 2) }]
    };
  }
);

server.tool(
  "updateProjectParticipants",
  {
    projectId: z.number().describe("Project ID"),
    participants: z.array(z.object({
      type: z.enum(["USER", "TEAM"]).describe("Participant type"),
      id: z.number().describe("User or Team ID"),
      role: z.enum(["ADMIN", "CONTRIBUTOR", "REVIEWER"]).describe("Participant role")
    })).describe("Array of participants")
  },
  async ({ projectId, participants }) => {
    const result = await loopioClient.updateProjectParticipants(projectId, participants);
    return {
      content: [{ type: "text", text: `Successfully updated participants\n\n${JSON.stringify(result, null, 2)}` }]
    };
  }
);

// ====================
// PROJECT SOURCE DOCUMENTS TOOLS
// ====================

server.tool(
  "listProjectSourceDocuments",
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
  { projectId: z.number().describe("Project ID") },
  async ({ projectId }) => {
    const values = await loopioClient.getCustomProjectFieldValuesForProject(projectId);
    return {
      content: [{ type: "text", text: JSON.stringify(values, null, 2) }]
    };
  }
);

server.tool(
  "setCustomProjectFieldValuesForProject",
  {
    projectId: z.number().describe("Project ID"),
    values: z.record(z.string()).describe("Custom field values (key-value pairs)")
  },
  async ({ projectId, values }) => {
    const result = await loopioClient.setCustomProjectFieldValuesForProject(projectId, values);
    return {
      content: [{ type: "text", text: `Successfully updated custom field values\n\n${JSON.stringify(result, null, 2)}` }]
    };
  }
);

server.tool(
  "listCustomProjectFields",
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
  { id: z.number().describe("Custom Project Field ID") },
  async ({ id }) => {
    const field = await loopioClient.getCustomProjectField(id);
    return {
      content: [{ type: "text", text: JSON.stringify(field, null, 2) }]
    };
  }
);

server.tool(
  "createCustomProjectField",
  {
    name: z.string().max(40).describe("Field name"),
    instructions: z.string().max(40).optional().describe("Instructions for filling out the field"),
    isRequired: z.boolean().optional().describe("Whether field is required"),
    fieldType: z.enum(["SHORT_TEXT", "DROPDOWN"]).optional().describe("Field type"),
    dropdownValues: z.array(z.string()).optional().describe("Dropdown values (required if fieldType is DROPDOWN)")
  },
  async ({ name, instructions, isRequired, fieldType, dropdownValues }) => {
    const field = await loopioClient.createCustomProjectField({
      name,
      instructions,
      isRequired,
      fieldType,
      dropdownValues
    });
    return {
      content: [{ type: "text", text: `Successfully created custom project field\n\n${JSON.stringify(field, null, 2)}` }]
    };
  }
);

server.tool(
  "updateCustomProjectField",
  {
    id: z.number().describe("Custom Project Field ID"),
    operations: z.array(z.object({
      op: z.enum(["add", "remove", "replace", "move", "copy", "test"]).describe("JSON Patch operation"),
      path: z.string().describe("JSON path to the field"),
      value: z.any().optional().describe("Value for the operation"),
      from: z.string().optional().describe("Source path for move/copy operations")
    })).describe("Array of JSON Patch operations")
  },
  async ({ id, operations }) => {
    const field = await loopioClient.updateCustomProjectField(id, operations);
    return {
      content: [{ type: "text", text: `Successfully updated custom project field\n\n${JSON.stringify(field, null, 2)}` }]
    };
  }
);

server.tool(
  "deleteCustomProjectField",
  { id: z.number().describe("Custom Project Field ID to delete") },
  async ({ id }) => {
    await loopioClient.deleteCustomProjectField(id);
    return {
      content: [{ type: "text", text: `Successfully deleted custom project field ${id}` }]
    };
  }
);

// ====================
// PROJECT TEMPLATES TOOLS
// ====================

server.tool(
  "listProjectTemplates",
  {
    page: z.number().optional().describe("Page number"),
    pageSize: z.number().optional().describe("Items per page")
  },
  async ({ page, pageSize }) => {
    const result = await loopioClient.listProjectTemplates({ page, pageSize });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "createProjectFromTemplate",
  {
    projectTemplateId: z.number().describe("Project Template ID"),
    name: z.string().describe("Project name"),
    projectType: z.enum(["RFP", "RFI", "DDQ", "SQ", "PP", "OTHER"]).describe("Project type"),
    companyName: z.string().describe("Company name"),
    dueDate: z.string().describe("Due date (ISO 8601 format)"),
    description: z.string().optional().describe("Project description"),
    ownerId: z.number().optional().describe("Owner user ID")
  },
  async ({ projectTemplateId, name, projectType, companyName, dueDate, description, ownerId }) => {
    const result = await loopioClient.createProjectFromTemplate(projectTemplateId, {
      name,
      projectType,
      companyName,
      dueDate,
      description: description || null,
      ...(ownerId && { owner: { id: ownerId } })
    });
    return {
      content: [{ type: "text", text: `Project creation task accepted. Task ID: ${result.taskId}, Project ID: ${result.projectId}` }]
    };
  }
);

// ====================
// PROJECT ENTRIES TOOLS
// ====================

server.tool(
  "listProjectEntries",
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

server.tool(
  "createProjectEntry",
  {
    projectId: z.number().describe("Project ID"),
    sectionId: z.number().optional().describe("Section ID (provide either sectionId or subSectionId)"),
    subSectionId: z.number().optional().describe("SubSection ID (provide either sectionId or subSectionId)"),
    question: z.string().describe("Entry question text"),
    answerText: z.string().nullable().optional().describe("Answer text")
  },
  async ({ projectId, sectionId, subSectionId, question, answerText }) => {
    const entry = await loopioClient.createProjectEntry({
      projectId,
      sectionId,
      subSectionId,
      question,
      answer: answerText !== undefined ? { text: answerText } : undefined
    });
    return {
      content: [{ type: "text", text: `Successfully created project entry\n\n${JSON.stringify(entry, null, 2)}` }]
    };
  }
);

server.tool(
  "updateProjectEntry",
  {
    projectEntryId: z.number().describe("Project Entry ID"),
    question: z.string().optional().describe("Updated question text"),
    answerText: z.string().nullable().optional().describe("Updated answer text")
  },
  async ({ projectEntryId, question, answerText }) => {
    const updates: any = {};
    if (question !== undefined) updates.question = question;
    if (answerText !== undefined) updates.answer = { text: answerText };
    
    const entry = await loopioClient.updateProjectEntry(projectEntryId, updates);
    return {
      content: [{ type: "text", text: `Successfully updated project entry\n\n${JSON.stringify(entry, null, 2)}` }]
    };
  }
);

server.tool(
  "deleteProjectEntry",
  { projectEntryId: z.number().describe("Project Entry ID to delete") },
  async ({ projectEntryId }) => {
    await loopioClient.deleteProjectEntry(projectEntryId);
    return {
      content: [{ type: "text", text: `Successfully deleted project entry ${projectEntryId}` }]
    };
  }
);

// ====================
// SECTIONS TOOLS
// ====================

server.tool(
  "listProjectSections",
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
  { sectionId: z.number().describe("Section ID") },
  async ({ sectionId }) => {
    const section = await loopioClient.getProjectSection(sectionId);
    return {
      content: [{ type: "text", text: JSON.stringify(section, null, 2) }]
    };
  }
);

server.tool(
  "createProjectSection",
  {
    projectId: z.number().describe("Project ID"),
    name: z.string().describe("Section name"),
    position: z.number().optional().describe("Section position")
  },
  async ({ projectId, name, position }) => {
    const section = await loopioClient.createProjectSection({ projectId, name, position });
    return {
      content: [{ type: "text", text: `Successfully created section\n\n${JSON.stringify(section, null, 2)}` }]
    };
  }
);

server.tool(
  "updateProjectSection",
  {
    sectionId: z.number().describe("Section ID"),
    name: z.string().optional().describe("Updated section name"),
    position: z.number().optional().describe("Updated section position")
  },
  async ({ sectionId, name, position }) => {
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (position !== undefined) updates.position = position;
    
    const section = await loopioClient.updateProjectSection(sectionId, updates);
    return {
      content: [{ type: "text", text: `Successfully updated section\n\n${JSON.stringify(section, null, 2)}` }]
    };
  }
);

server.tool(
  "deleteProjectSection",
  { sectionId: z.number().describe("Section ID to delete") },
  async ({ sectionId }) => {
    await loopioClient.deleteProjectSection(sectionId);
    return {
      content: [{ type: "text", text: `Successfully deleted section ${sectionId}` }]
    };
  }
);

// ====================
// SUBSECTIONS TOOLS
// ====================

server.tool(
  "listProjectSubSections",
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
  { subSectionId: z.number().describe("SubSection ID") },
  async ({ subSectionId }) => {
    const subSection = await loopioClient.getProjectSubSection(subSectionId);
    return {
      content: [{ type: "text", text: JSON.stringify(subSection, null, 2) }]
    };
  }
);

server.tool(
  "createProjectSubSection",
  {
    projectId: z.number().describe("Project ID"),
    sectionId: z.number().describe("Section ID"),
    name: z.string().describe("SubSection name"),
    position: z.number().optional().describe("SubSection position")
  },
  async ({ projectId, sectionId, name, position }) => {
    const subSection = await loopioClient.createProjectSubSection({ projectId, sectionId, name, position });
    return {
      content: [{ type: "text", text: `Successfully created subsection\n\n${JSON.stringify(subSection, null, 2)}` }]
    };
  }
);

server.tool(
  "updateProjectSubSection",
  {
    subSectionId: z.number().describe("SubSection ID"),
    name: z.string().optional().describe("Updated subsection name"),
    position: z.number().optional().describe("Updated subsection position")
  },
  async ({ subSectionId, name, position }) => {
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (position !== undefined) updates.position = position;
    
    const subSection = await loopioClient.updateProjectSubSection(subSectionId, updates);
    return {
      content: [{ type: "text", text: `Successfully updated subsection\n\n${JSON.stringify(subSection, null, 2)}` }]
    };
  }
);

server.tool(
  "deleteProjectSubSection",
  { subSectionId: z.number().describe("SubSection ID to delete") },
  async ({ subSectionId }) => {
    await loopioClient.deleteProjectSubSection(subSectionId);
    return {
      content: [{ type: "text", text: `Successfully deleted subsection ${subSectionId}` }]
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
    console.error("ERROR: LOOPIO_CLIENT_ID and LOOPIO_CLIENT_SECRET must be set in .env.rfp file!");
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
