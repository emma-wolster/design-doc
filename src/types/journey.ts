export type ModuleStatus = 'draft' | 'inReview' | 'final';

export interface Module {
  id: string;                 // from DOCX "Module ID" (required)
  title: string;              // from DOCX "Module title" (required)
  shortDescription: string;   // from DOCX "Short description" (required)
  duration?: string;          // from DOCX "Approx. duration" (optional)
  status: ModuleStatus;       // from DOCX "Status" (required, normalised)
  topic?: string;             // from DOCX "Topic" (optional)

  // UI-only fields (assigned client-side)
  colorToken?: string;        // e.g. 'teal', 'purple', 'yellow'
  order?: number;             // visual ordering index, if needed
}

export interface Objective {
  id: string;           // generated (e.g. uuid)
  moduleId: string;     // joins back to Module.id (required)
  text: string;         // from DOCX "Objective text" (required)
  bloomType?: string;   // from DOCX "Bloom / type" (optional)
  contentType?: string; // from DOCX "Content type" (optional)
  sourceLink: string;   // from DOCX "Source link" (required)

  // UI-only fields
  order?: number;       // ordering within a module
}

export interface ParseResult {
  modules: Module[];
  objectives: Objective[];
  warnings?: string[];  // non-fatal issues (e.g. dropped orphan objectives)
  courseName?: string;  // derived from the Topic column or first module title
}

export interface JourneyLayoutState {
  moduleOrder: string[];                   // ordered list of Module.id
  objectiveOrderByModule: Record<string, string[]>; // Module.id -> ordered Objective.id[]
}

export type SelectedItem =
  | { type: 'module'; moduleId: string }
  | { type: 'objective'; objectiveId: string }
  | null;

export interface JourneyFilters {
  topicIds: string[];   // selected topics; you can just use strings
  moduleIds: string[];  // selected module IDs
  showOnlyMatches: boolean;
}
