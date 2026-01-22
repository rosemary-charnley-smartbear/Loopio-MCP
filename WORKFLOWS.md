# Loopio MCP Server (STDIO)

This is a Model Context Protocol (MCP) server that provides comprehensive programmatic access to the Loopio Public API v2 via STDIO transport. It exposes **51 tools** covering library entries, projects, compliance sets, custom fields, participants, sections, templates, and file management. It's designed to integrate with VS Code and GitHub Copilot, enabling AI-powered access to your entire Loopio workspace - from content library management to project collaboration and workflow automation.


## Workflows

1. *Self Serve Answer Bank*: Sales Representative self serving on RFP related questions. 
2. *Project Automation*: First pass on answering project questions leveraging the library. 
3. *Library Refinement*: Long term library refinement and management.

## Prompts

**Library Refinement**

Using the tool listLibraryEntries with a pageSize of 100 and filter of lastUpdatedDate on or before 2023-12-31T23:59:59Z start on the last page of the library and delete all entries with a usage of 0 in batches of 20. Continue backwards iterating over each page one at time deleting entries meeting the criteria of usage being 0.


Search the library for any entry containg "AWS" or "Amazon Web Services" use pageSize 200. Update all entries to have the tag "AWS"


