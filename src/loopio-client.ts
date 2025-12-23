// Loopio API Client
import fetch from "node-fetch";
import type {
  LoopioConfig,
  LibraryEntry,
  PaginatedResponse,
  CreateLibraryEntryRequest,
  JsonPatchOperation,
  File,
  LibraryEntryHistory,
  LibrarySearchOptions,
  Stack,
  Project,
  CreateProjectRequest,
  ProjectSummary,
  ComplianceSet,
  ComplianceOption,
  ParticipantReference,
  ProjectTemplate,
  CustomProjectField,
  CreateCustomProjectFieldRequest,
  ProjectEntry,
  CreateProjectEntryRequest,
  Section,
  SubSection,
  CreateSectionRequest,
  CreateSubSectionRequest,
} from "./types.js";

export class LoopioApiClient {
  private config: LoopioConfig;

  constructor(config: LoopioConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const url = `${this.config.apiBaseUrl}${endpoint}`;
    const headers = {
      "Authorization": `Bearer ${this.config.accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Loopio API request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  // Library Entries endpoints
  async listLibraryEntries(params: {
    page?: number;
    pageSize?: number;
    filter?: LibrarySearchOptions;
  }): Promise<PaginatedResponse<LibraryEntry>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params.filter)
      queryParams.append("filter", JSON.stringify(params.filter));

    const query = queryParams.toString();
    return this.request<PaginatedResponse<LibraryEntry>>(
      `/libraryEntries${query ? `?${query}` : ""}`
    );
  }

  async getLibraryEntry(
    libraryEntryId: number,
    inline?: string[]
  ): Promise<LibraryEntry> {
    const queryParams = new URLSearchParams();
    if (inline && inline.length > 0) {
      inline.forEach((item) => queryParams.append("inline[]", item));
    }

    const query = queryParams.toString();
    return this.request<LibraryEntry>(
      `/libraryEntries/${libraryEntryId}${query ? `?${query}` : ""}`
    );
  }

  async createLibraryEntry(
    entry: CreateLibraryEntryRequest
  ): Promise<LibraryEntry> {
    return this.request<LibraryEntry>("/libraryEntries", {
      method: "POST",
      body: entry,
    });
  }

  async updateLibraryEntry(
    libraryEntryId: number,
    operations: JsonPatchOperation[]
  ): Promise<LibraryEntry> {
    return this.request<LibraryEntry>(`/libraryEntries/${libraryEntryId}`, {
      method: "PATCH",
      body: operations,
      headers: {
        "Content-Type": "application/json-patch+json",
      },
    });
  }

  async deleteLibraryEntry(libraryEntryId: number): Promise<void> {
    return this.request<void>(`/libraryEntries/${libraryEntryId}`, {
      method: "DELETE",
    });
  }

  async getLibraryEntryAttachments(
    libraryEntryId: number
  ): Promise<PaginatedResponse<File>> {
    return this.request<PaginatedResponse<File>>(
      `/libraryEntries/${libraryEntryId}/attachments`
    );
  }

  async getLibraryEntryHistories(
    libraryEntryId: number,
    params: { page?: number; pageSize?: number }
  ): Promise<PaginatedResponse<LibraryEntryHistory>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());

    const query = queryParams.toString();
    return this.request<PaginatedResponse<LibraryEntryHistory>>(
      `/libraryEntryHistories/${libraryEntryId}${query ? `?${query}` : ""}`
    );
  }

  async getLibraryEntryHistory(
    libraryEntryId: number,
    historyId: number
  ): Promise<LibraryEntryHistory> {
    return this.request<LibraryEntryHistory>(
      `/libraryEntryHistories/${libraryEntryId}/${historyId}`
    );
  }

  async bulkCreateLibraryEntries(
    entries: CreateLibraryEntryRequest[]
  ): Promise<{ taskId: string }> {
    return this.request<{ taskId: string }>("/libraryEntries/bulk", {
      method: "POST",
      body: { entries },
    });
  }

  // Stacks endpoints
  async listStacks(fields?: string): Promise<Stack[]> {
    const queryParams = new URLSearchParams();
    if (fields) queryParams.append("fields", fields);
    
    const query = queryParams.toString();
    return this.request<Stack[]>(`/stacks${query ? `?${query}` : ""}`);
  }

  // Files endpoints
  async showFile(fileId: number): Promise<File> {
    return this.request<File>(`/files/${fileId}`);
  }

  async deleteFile(fileId: number): Promise<void> {
    return this.request<void>(`/files/${fileId}`, {
      method: "DELETE",
    });
  }

  // Projects endpoints
  async listProjects(params: {
    page?: number;
    pageSize?: number;
    rfxTypes?: string[];
    owners?: number[];
  }): Promise<PaginatedResponse<Project>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize) queryParams.append("pageSize", params.pageSize.toString());
    if (params.rfxTypes && params.rfxTypes.length > 0) {
      params.rfxTypes.forEach(type => queryParams.append("rfxTypes", type));
    }
    if (params.owners && params.owners.length > 0) {
      params.owners.forEach(owner => queryParams.append("owners", owner.toString()));
    }

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Project>>(`/projects${query ? `?${query}` : ""}`);
  }

  async getProject(projectId: number, fields?: string): Promise<Project> {
    const queryParams = new URLSearchParams();
    if (fields) queryParams.append("fields", fields);
    
    const query = queryParams.toString();
    return this.request<Project>(`/projects/${projectId}${query ? `?${query}` : ""}`);
  }

  async createProject(project: CreateProjectRequest): Promise<Project> {
    return this.request<Project>("/projects", {
      method: "POST",
      body: project,
    });
  }

  async updateProject(projectId: number, updates: { status: string }): Promise<Project> {
    return this.request<Project>(`/projects/${projectId}`, {
      method: "PUT",
      body: updates,
    });
  }

  async deleteProject(projectId: number): Promise<void> {
    return this.request<void>(`/projects/${projectId}`, {
      method: "DELETE",
    });
  }

  async getProjectSummary(projectId: number): Promise<ProjectSummary> {
    return this.request<ProjectSummary>(`/projects/${projectId}/summary`);
  }

  async getProjectSummaryList(lastUpdatedDateGt: string): Promise<ProjectSummary[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("lastUpdatedDateGt", lastUpdatedDateGt);
    
    return this.request<ProjectSummary[]>(`/projects/summary?${queryParams.toString()}`);
  }

  // Project Compliance Sets endpoints
  async getProjectComplianceSets(projectId: number): Promise<ComplianceSet[]> {
    return this.request<ComplianceSet[]>(`/projects/${projectId}/complianceSets`);
  }

  async getProjectComplianceSet(projectId: number, complianceSetId: number): Promise<ComplianceSet> {
    return this.request<ComplianceSet>(`/projects/${projectId}/complianceSets/${complianceSetId}`);
  }

  async createComplianceSet(
    projectId: number,
    data: { label: string; shortName: string; options: ComplianceOption[] }
  ): Promise<ComplianceSet> {
    return this.request<ComplianceSet>(`/projects/${projectId}/complianceSets`, {
      method: "POST",
      body: data,
    });
  }

  async updateProjectComplianceSet(
    projectId: number,
    complianceSetId: number,
    data: { label: string; shortName: string; options: ComplianceOption[] }
  ): Promise<ComplianceSet> {
    return this.request<ComplianceSet>(
      `/projects/${projectId}/complianceSets/${complianceSetId}`,
      {
        method: "PUT",
        body: data,
      }
    );
  }

  async deleteProjectComplianceSet(projectId: number, complianceSetId: number): Promise<void> {
    return this.request<void>(`/projects/${projectId}/complianceSets/${complianceSetId}`, {
      method: "DELETE",
    });
  }

  // Project Participants endpoints
  async getProjectParticipants(projectId: number): Promise<ParticipantReference[]> {
    return this.request<ParticipantReference[]>(`/projects/${projectId}/participants`);
  }

  async updateProjectParticipants(
    projectId: number,
    participants: ParticipantReference[]
  ): Promise<ParticipantReference[]> {
    return this.request<ParticipantReference[]>(`/projects/${projectId}/participants`, {
      method: "PUT",
      body: participants,
    });
  }

  // Project Source Documents endpoints
  async listProjectSourceDocuments(projectId: number): Promise<File[]> {
    return this.request<File[]>(`/projects/${projectId}/sourceDocuments`);
  }

  async addProjectSourceDocument(projectId: number, formData: FormData): Promise<File> {
    const url = `${this.config.apiBaseUrl}/projects/${projectId}/sourceDocuments`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload source document: ${response.status} - ${errorText}`);
    }

    return response.json() as Promise<File>;
  }

  // Custom Project Fields endpoints
  async getCustomProjectFieldValuesForProject(
    projectId: number
  ): Promise<Record<string, string | null>> {
    return this.request<Record<string, string | null>>(
      `/projects/${projectId}/customProjectFields`
    );
  }

  async setCustomProjectFieldValuesForProject(
    projectId: number,
    values: Record<string, string>
  ): Promise<Record<string, string | null>> {
    return this.request<Record<string, string | null>>(
      `/projects/${projectId}/customProjectFields`,
      {
        method: "PATCH",
        body: values,
      }
    );
  }

  async listCustomProjectFields(source?: string): Promise<CustomProjectField[]> {
    const queryParams = new URLSearchParams();
    if (source) queryParams.append("source", source);
    
    const query = queryParams.toString();
    return this.request<CustomProjectField[]>(`/customProjectFields${query ? `?${query}` : ""}`);
  }

  async getCustomProjectField(id: number): Promise<CustomProjectField> {
    return this.request<CustomProjectField>(`/customProjectFields/${id}`);
  }

  async createCustomProjectField(
    field: CreateCustomProjectFieldRequest
  ): Promise<CustomProjectField> {
    return this.request<CustomProjectField>("/customProjectFields", {
      method: "POST",
      body: field,
    });
  }

  async updateCustomProjectField(
    id: number,
    operations: JsonPatchOperation[]
  ): Promise<CustomProjectField> {
    return this.request<CustomProjectField>(`/customProjectFields/${id}`, {
      method: "PATCH",
      body: operations,
      headers: {
        "Content-Type": "application/json-patch+json",
      },
    });
  }

  async deleteCustomProjectField(id: number): Promise<void> {
    return this.request<void>(`/customProjectFields/${id}`, {
      method: "DELETE",
    });
  }

  // Project Templates endpoints
  async listProjectTemplates(params: {
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<ProjectTemplate>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize) queryParams.append("pageSize", params.pageSize.toString());

    const query = queryParams.toString();
    return this.request<PaginatedResponse<ProjectTemplate>>(
      `/projectTemplates${query ? `?${query}` : ""}`
    );
  }

  async createProjectFromTemplate(
    projectTemplateId: number,
    projectData: CreateProjectRequest
  ): Promise<{ taskId: string; projectId: number }> {
    return this.request<{ taskId: string; projectId: number }>(
      `/projectTemplates/${projectTemplateId}/projects`,
      {
        method: "POST",
        body: projectData,
      }
    );
  }

  // Project Entries endpoints
  async listProjectEntries(params: {
    projectId: number;
    sectionId?: number;
    subSectionId?: number;
    inline?: string[];
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<ProjectEntry>> {
    const queryParams = new URLSearchParams();
    queryParams.append("projectId", params.projectId.toString());
    if (params.sectionId) queryParams.append("sectionId", params.sectionId.toString());
    if (params.subSectionId) queryParams.append("subSectionId", params.subSectionId.toString());
    if (params.inline && params.inline.length > 0) {
      params.inline.forEach(item => queryParams.append("inline[]", item));
    }
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize) queryParams.append("pageSize", params.pageSize.toString());

    return this.request<PaginatedResponse<ProjectEntry>>(
      `/projectEntries?${queryParams.toString()}`
    );
  }

  async getProjectEntry(projectEntryId: number, inline?: string[]): Promise<ProjectEntry> {
    const queryParams = new URLSearchParams();
    if (inline && inline.length > 0) {
      inline.forEach(item => queryParams.append("inline[]", item));
    }

    const query = queryParams.toString();
    return this.request<ProjectEntry>(
      `/projectEntries/${projectEntryId}${query ? `?${query}` : ""}`
    );
  }

  async createProjectEntry(entry: CreateProjectEntryRequest): Promise<ProjectEntry> {
    return this.request<ProjectEntry>("/projectEntries", {
      method: "POST",
      body: entry,
    });
  }

  async updateProjectEntry(
    projectEntryId: number,
    updates: Partial<CreateProjectEntryRequest>
  ): Promise<ProjectEntry> {
    return this.request<ProjectEntry>(`/projectEntries/${projectEntryId}`, {
      method: "PUT",
      body: updates,
    });
  }

  async deleteProjectEntry(projectEntryId: number): Promise<void> {
    return this.request<void>(`/projectEntries/${projectEntryId}`, {
      method: "DELETE",
    });
  }

  // Sections endpoints
  async listProjectSections(params: {
    projectId: number;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<Section>> {
    const queryParams = new URLSearchParams();
    queryParams.append("projectId", params.projectId.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize) queryParams.append("pageSize", params.pageSize.toString());

    return this.request<PaginatedResponse<Section>>(
      `/sections?${queryParams.toString()}`
    );
  }

  async getProjectSection(sectionId: number): Promise<Section> {
    return this.request<Section>(`/sections/${sectionId}`);
  }

  async createProjectSection(section: CreateSectionRequest): Promise<Section> {
    return this.request<Section>("/sections", {
      method: "POST",
      body: section,
    });
  }

  async updateProjectSection(sectionId: number, updates: Partial<CreateSectionRequest>): Promise<Section> {
    return this.request<Section>(`/sections/${sectionId}`, {
      method: "PUT",
      body: updates,
    });
  }

  async deleteProjectSection(sectionId: number): Promise<void> {
    return this.request<void>(`/sections/${sectionId}`, {
      method: "DELETE",
    });
  }

  // SubSections endpoints
  async listProjectSubSections(params: {
    projectId: number;
    sectionId?: number;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<SubSection>> {
    const queryParams = new URLSearchParams();
    queryParams.append("projectId", params.projectId.toString());
    if (params.sectionId) queryParams.append("sectionId", params.sectionId.toString());
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize) queryParams.append("pageSize", params.pageSize.toString());

    return this.request<PaginatedResponse<SubSection>>(
      `/subSections?${queryParams.toString()}`
    );
  }

  async getProjectSubSection(subSectionId: number): Promise<SubSection> {
    return this.request<SubSection>(`/subSections/${subSectionId}`);
  }

  async createProjectSubSection(subSection: CreateSubSectionRequest): Promise<SubSection> {
    return this.request<SubSection>("/subSections", {
      method: "POST",
      body: subSection,
    });
  }

  async updateProjectSubSection(
    subSectionId: number,
    updates: Partial<CreateSubSectionRequest>
  ): Promise<SubSection> {
    return this.request<SubSection>(`/subSections/${subSectionId}`, {
      method: "PUT",
      body: updates,
    });
  }

  async deleteProjectSubSection(subSectionId: number): Promise<void> {
    return this.request<void>(`/subSections/${subSectionId}`, {
      method: "DELETE",
    });
  }
}
