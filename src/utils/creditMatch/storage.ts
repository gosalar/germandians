import type {
  CourseAreaAllocation,
  CourseEntry,
  CreditMatchWorksheet,
  ProgrammeContext,
  SubjectAreaEntry,
} from './types.ts';

/**
 * Browser-only worksheet persistence. Every read, write and removal is wrapped in try/catch because
 * storage can be unavailable, blocked or full. Nothing stored here ever leaves the browser.
 */
export const STORAGE_KEY = 'germandians:credit-match';

export const CREDIT_INPUT_LENGTHS = { text: 500, link: 1000, credits: 40 } as const;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isBoundedString = (value: unknown, max: number = CREDIT_INPUT_LENGTHS.text): value is string =>
  typeof value === 'string' && value.length <= max;

const isId = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 80;

function validContext(value: unknown): value is ProgrammeContext {
  return (
    isObject(value) &&
    isBoundedString(value.university) &&
    isBoundedString(value.programme) &&
    isBoundedString(value.programmeUrl, CREDIT_INPUT_LENGTHS.link)
  );
}

function validArea(value: unknown): value is SubjectAreaEntry {
  return (
    isObject(value) &&
    isId(value.id) &&
    isBoundedString(value.name) &&
    isBoundedString(value.requiredCredits, CREDIT_INPUT_LENGTHS.credits)
  );
}

function validAllocation(value: unknown, validAreaIds: ReadonlySet<string>): value is CourseAreaAllocation {
  return (
    isObject(value) &&
    isId(value.areaId) &&
    validAreaIds.has(value.areaId) &&
    isBoundedString(value.credits, CREDIT_INPUT_LENGTHS.credits)
  );
}

function validCourse(value: unknown, validAreaIds: ReadonlySet<string>): value is CourseEntry {
  if (
    !isObject(value) ||
    !isId(value.id) ||
    !isBoundedString(value.title) ||
    !isBoundedString(value.credits, CREDIT_INPUT_LENGTHS.credits) ||
    !isBoundedString(value.moduleRef, CREDIT_INPUT_LENGTHS.link) ||
    !Array.isArray(value.allocations)
  ) {
    return false;
  }

  const seenAreas = new Set<string>();
  for (const item of value.allocations) {
    if (!validAllocation(item, validAreaIds) || seenAreas.has(item.areaId)) {
      return false;
    }
    seenAreas.add(item.areaId);
  }
  return true;
}

export function validWorksheet(value: unknown): value is CreditMatchWorksheet {
  if (
    !isObject(value) ||
    value.version !== 1 ||
    !validContext(value.context) ||
    !Array.isArray(value.areas) ||
    !Array.isArray(value.courses)
  ) {
    return false;
  }

  const areaIds = new Set<string>();
  for (const area of value.areas) {
    if (!validArea(area) || areaIds.has(area.id)) {
      return false;
    }
    areaIds.add(area.id);
  }

  const courseIds = new Set<string>();
  for (const course of value.courses) {
    if (!validCourse(course, areaIds) || courseIds.has(course.id)) {
      return false;
    }
    courseIds.add(course.id);
  }

  return true;
}

export function readWorksheet(): { worksheet: CreditMatchWorksheet | null; failed: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { worksheet: null, failed: false };

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    if (!validWorksheet(parsed)) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        return { worksheet: null, failed: true };
      }
      return { worksheet: null, failed: false };
    }

    return { worksheet: parsed, failed: false };
  } catch {
    return { worksheet: null, failed: true };
  }
}

export function writeWorksheet(worksheet: CreditMatchWorksheet): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(worksheet));
    return true;
  } catch {
    return false;
  }
}

export function clearWorksheet(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
