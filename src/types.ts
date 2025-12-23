// Loopio API Types - Generated from OpenAPI Specification

export interface LoopioConfig {
  apiBaseUrl: string;
  accessToken: string;
}

export interface ReferenceLabel {
  id: number;
  name: string;
}

export interface Language {
  id: number;
  name: string;
  languageCode: string;
  shortLanguageCode: string;
}

export interface Question {
  id: number;
  text: string;
  complianceOption?: {
    id: number;
    text: string;
  } | null;
}

export interface Footnote {
  id: number;
  text: string;
}

export interface Answer {
  text: string | null;
  footnotes?: Footnote[];
}

export interface InlineImage {
  id: number;
  url: string;
}

export interface LibraryEntryOwner {
  id: number;
  name: string;
  initials: string;
}

export interface LibraryEntry {
  id: number;
  questions: Question[];
  answer: Answer;
  alertText?: string | null;
  languageCode: string;
  creator: ReferenceLabel;
  lastUpdatedBy: ReferenceLabel;
  lastReviewedBy?: ReferenceLabel | null;
  libraryEntryOwner?: LibraryEntryOwner | null;
  createdDate: string;
  lastUpdatedDate: string;
  lastReviewedDate?: string | null;
  attachmentCount: number;
  status: "REVIEW" | "APPROVED";
  tags: string[];
  inlineImages?: InlineImage[];
  scores?: {
    time: number;
    usage: number;
    freshness: number;
  };
  location?: {
    stack?: any;
    category?: any;
    subCategory?: any;
  };
}

export interface LibraryLocation {
  stackID: number;
  categoryID?: number | null;
  subCategoryID?: number | null;
}

export interface DateTimeRangeFilter {
  eq?: string;
  gt?: string;
  gte?: string;
  lt?: string;
  lte?: string;
}

export interface LibrarySearchOptions {
  lastUpdatedDate?: DateTimeRangeFilter;
  language?: string;
  locations?: LibraryLocation[];
  searchQuery?: string;
  synonyms?: boolean;
  exactPhrase?: boolean;
  hasAttachment?: boolean;
  searchInQuestions?: boolean;
  searchInAnswers?: boolean;
  searchInTags?: boolean;
}

export interface File {
  id: number;
  filename: string;
  fileExtension: string;
  status: "AVAILABLE" | "UPLOADING" | "DELETED";
  size: number;
  creator: ReferenceLabel;
  createdDate: string;
  guid: string;
  url: string;
  lastUpdatedDate: string;
}

export interface LibraryEntryHistory {
  id: number;
  previousHistoryId?: number | null;
  user: string;
  createdDate: string;
  type: "REVIEW_UPDATE" | "UPDATE" | "CREATE" | "RESTORE";
  description: string;
  libraryEntry: LibraryEntry;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface ErrorResponse {
  name: string;
  message: string;
  debugId: string;
}

export interface CreateLibraryEntryRequest {
  questions: Array<{ text: string }>;
  answer: {
    text: string | null;
  };
  languageCode?: string;
  location: {
    stack: { id: number };
    category?: { id: number };
    subCategory?: { id: number };
  };
  tags?: string[];
}

export interface JsonPatchOperation {
  op: "add" | "remove" | "replace" | "move" | "copy" | "test";
  path: string;
  value?: any;
  from?: string;
}

// Stack, Category, SubCategory types
export interface SubCategory {
  id: number;
  stackID: number;
  categoryID: number;
  name: string;
}

export interface Category {
  id: number;
  stackID: number;
  name: string;
  subCategories?: SubCategory[];
}

export interface Stack {
  id: number;
  name: string;
  categories?: Category[];
}

// Project types
export type ProjectType = "RFP" | "RFI" | "DDQ" | "SQ" | "PP" | "OTHER";
export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED" | "DELETED";

export interface Project {
  id: number;
  name: string;
  projectType: ProjectType;
  status: ProjectStatus;
  companyName: string;
  createdDate: string;
  dueDate: string;
  owner: ReferenceLabel;
  creator: ReferenceLabel;
  description?: string;
}

export interface CreateProjectRequest {
  name: string;
  projectType: ProjectType;
  companyName: string;
  dueDate: string;
  description?: string | null;
  owner?: { id: number };
  customProjectFieldValues?: Record<string, string | null>;
  mergeVariableValues?: Record<string, string | null>;
}

export interface ProjectSummary {
  id: number;
  name: string;
  status: ProjectStatus;
  companyName: string;
  dueDate: string;
  completedDate?: string | null;
  owner: ReferenceLabel;
  description?: string;
  projectType: ProjectType;
  isComplete: boolean;
  questions: {
    unassigned: number;
    assigned: number;
    inProgress: number;
    complete: number;
    total: number;
  };
  workdays: {
    total: number;
    remaining: number;
    elapsed: number;
  };
}

// Compliance Set (Answer Set) types
export interface ComplianceOption {
  label: string;
}

export interface ComplianceSet {
  id: number;
  project: ReferenceLabel;
  label: string;
  shortName: string;
  options: ComplianceOption[];
}

// Participant types
export type ParticipantType = "USER" | "TEAM";
export type ParticipantRole = "ADMIN" | "CONTRIBUTOR" | "REVIEWER";

export interface ParticipantReference {
  type: ParticipantType;
  id: number;
  role: ParticipantRole;
}

// Project Template types
export interface ProjectTemplate {
  id: number;
  name: string;
  description?: string;
}

// Custom Project Field types
export type CustomProjectFieldSource = "project" | "salesforce" | "msDynamics";
export type CustomProjectFieldType = "SHORT_TEXT" | "DROPDOWN";

export interface CustomProjectField {
  id: number;
  name: string;
  source: CustomProjectFieldSource;
  isRequired: boolean;
  fieldType: CustomProjectFieldType;
  instructions?: string;
  dropdownValues?: string[];
  salesforceField?: string;
  msDynamicsField?: string;
}

export interface CreateCustomProjectFieldRequest {
  name: string;
  instructions?: string;
  isRequired?: boolean;
  fieldType?: CustomProjectFieldType;
  dropdownValues?: string[];
}

// Project Entry types
export interface EntryComplianceAnswer {
  complianceSetId: number;
  complianceOptionId: number;
}

export interface ProjectEntry {
  id: number;
  project: ReferenceLabel;
  question: string | null;
  answer: Answer;
  complianceAnswers?: EntryComplianceAnswer[];
}

export interface CreateProjectEntryRequest {
  projectId: number;
  sectionId?: number;
  subSectionId?: number;
  question: string;
  answer?: { text: string | null };
}

// Section and SubSection types
export interface Section {
  id: number;
  project: ReferenceLabel;
  name: string;
  position: number;
}

export interface SubSection {
  id: number;
  project: ReferenceLabel;
  section: ReferenceLabel;
  name: string;
  position: number;
}

export interface CreateSectionRequest {
  projectId: number;
  name: string;
  position?: number;
}

export interface CreateSubSectionRequest {
  projectId: number;
  sectionId: number;
  name: string;
  position?: number;
}
