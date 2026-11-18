export interface ProgrammeContext {
  university: string;
  programme: string;
  programmeUrl: string;
}

export interface SubjectAreaEntry {
  id: string;
  name: string;
  requiredCredits: string;
}

export interface CourseAreaAllocation {
  areaId: string;
  /** Optional credit share string. Blank uses an automatic share of the course's remaining credits. */
  credits: string;
}

export interface CourseEntry {
  id: string;
  title: string;
  credits: string;
  moduleRef: string;
  allocations: CourseAreaAllocation[];
}

export interface CreditMatchWorksheet {
  version: 1;
  context: ProgrammeContext;
  areas: SubjectAreaEntry[];
  courses: CourseEntry[];
}

export interface ResolvedAllocation {
  areaId: string;
  areaName: string;
  credits: number;
  automaticShare: number;
  explicit: boolean;
  invalidInput: boolean;
}

export interface CourseSummary {
  course: CourseEntry;
  parsedCredits: number | null;
  invalidCredits: boolean;
  resolvedAllocations: ResolvedAllocation[];
  allocatedTotal: number;
  mappedCredits: number;
  mappingNeedsCorrection: boolean;
  exceedsCourseCredits: boolean;
  hasInvalidAllocation: boolean;
}

export interface AreaMappedCourse {
  courseId: string;
  title: string;
  transcriptCredits: number | null;
  mappedCredits: number;
  moduleRef: string;
  isPartialOrSplit: boolean;
}

export interface AreaSummary {
  area: SubjectAreaEntry;
  parsedRequiredCredits: number | null;
  invalidRequiredCredits: boolean;
  mappedCredits: number;
  mappedCourses: AreaMappedCourse[];
}

export interface WorksheetSummary {
  areas: AreaSummary[];
  courses: CourseSummary[];
  unmappedAreas: AreaSummary[];
  unmappedCourses: CourseSummary[];
  totalTranscriptCredits: number;
  totalMappedCredits: number;
}

export interface CsvCopy {
  worksheetHeading: readonly [string, string];
  noteHeading: string;
  noteBody: string;
  universityHeading: string;
  programmeHeading: string;
  programmeUrlHeading: string;
  areaTableHeaders: readonly [string, string, string, string];
  courseTableHeaders: readonly [string, string, string, string, string];
  unmappedAreaCell: string;
  unmappedCourseArea: string;
  needsCorrection: string;
  mappedCourseItem: (title: string, credits: string) => string;
}
