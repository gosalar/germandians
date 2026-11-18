export const APPLICATION_ROUTES = ['direct', 'uni-assist', 'vpd'] as const;
export type ApplicationRoute = (typeof APPLICATION_ROUTES)[number];

export const DOCUMENT_STATUSES = ['missing', 'ready'] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export interface PlanDateEntry {
  id: string;
  date: string;
  label: string;
}

export interface PlanDocumentItem {
  id: string;
  label: string;
  status: DocumentStatus;
}

export interface PlannedProgramme {
  id: string;
  name: string;
  university: string;
  url: string;
  route: ApplicationRoute;
  dates: PlanDateEntry[];
  documents: PlanDocumentItem[];
}

export interface ApplicationPlanState {
  version: 1;
  programmes: PlannedProgramme[];
}
