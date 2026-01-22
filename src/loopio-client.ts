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

  // Customer endpoints
  async getCustomerActiveLanguages(customerId: number): Promise<string[]> {
    return this.request<string[]>(`/customers/${customerId}/activeLanguages`);
  }

  async getCustomer(customerId: number): Promise<{ id: number; guid: string }> {
    return this.request<{ id: number; guid: string }>(`/customers/${customerId}`);
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

  // Project Participants endpoints
  async getProjectParticipants(projectId: number): Promise<ParticipantReference[]> {
    return this.request<ParticipantReference[]>(`/projects/${projectId}/participants`);
  }

  // Project Source Documents endpoints
  async listProjectSourceDocuments(projectId: number): Promise<File[]> {
    return this.request<File[]>(`/projects/${projectId}/sourceDocuments`);
  }

  // Custom Project Fields endpoints
  async getCustomProjectFieldValuesForProject(
    projectId: number
  ): Promise<Record<string, string | null>> {
    return this.request<Record<string, string | null>>(
      `/projects/${projectId}/customProjectFields`
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
}
