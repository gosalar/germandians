import type {
  AreaMappedCourse,
  AreaSummary,
  CourseEntry,
  CourseSummary,
  CreditMatchWorksheet,
  ProgrammeContext,
  ResolvedAllocation,
  SubjectAreaEntry,
  WorksheetSummary,
} from './types.ts';

export const EMPTY_WORKSHEET: CreditMatchWorksheet = {
  version: 1,
  context: {
    university: '',
    programme: '',
    programmeUrl: '',
  },
  areas: [],
  courses: [],
};

const CREDIT_SCALE = 1_000_000;
const toCreditUnits = (value: number): number => Math.round(value * CREDIT_SCALE);

/**
 * Parses a decimal credit input without converting or scaling it.
 * Accepts plain digits with up to six significant decimal places.
 */
export function parseCreditNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/^\d+(?:\.\d{1,6}0*)?$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10_000) return null;
  return parsed;
}

export function formatCredits(value: number): string {
  return value.toFixed(6).replace(/\.?0+$/, '');
}

/** Allows only http:// or https:// links so module references stay safe when rendered as anchors. */
export function safeExternalUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!/^https?:\/\/[^/\\]/i.test(trimmed) || /[\s\p{Cc}\\]/u.test(trimmed)) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function isWorksheetEmpty(worksheet: CreditMatchWorksheet): boolean {
  return (
    worksheet.areas.length === 0 &&
    worksheet.courses.length === 0 &&
    worksheet.context.university.trim() === '' &&
    worksheet.context.programme.trim() === '' &&
    worksheet.context.programmeUrl.trim() === ''
  );
}

export function createEntryId(prefix: 'area' | 'course', existingIds: readonly string[]): string {
  const used = new Set(existingIds);
  let counter = existingIds.length + 1;
  while (used.has(`${prefix}-${counter}`)) {
    counter += 1;
  }
  return `${prefix}-${counter}`;
}

export function summariseWorksheet(worksheet: CreditMatchWorksheet): WorksheetSummary {
  const areaById = new Map<string, SubjectAreaEntry>();
  for (const area of worksheet.areas) {
    areaById.set(area.id, area);
  }

  const mappedByArea = new Map<string, AreaMappedCourse[]>();
  for (const area of worksheet.areas) {
    mappedByArea.set(area.id, []);
  }

  let transcriptUnits = 0;
  let mappedUnits = 0;

  const courses: CourseSummary[] = worksheet.courses.map((course) => {
    const trimmedCredits = course.credits.trim();
    const parsedCredits = parseCreditNumber(course.credits);
    const invalidCredits = trimmedCredits !== '' && (parsedCredits === null || parsedCredits <= 0);
    const courseUnits = toCreditUnits(parsedCredits ?? 0);
    transcriptUnits += courseUnits;

    const validAllocations = course.allocations.filter((allocation) => areaById.has(allocation.areaId));

    let explicitUnits = 0;
    let blankCount = 0;
    let hasInvalidAllocation = false;

    const inspected = validAllocations.map((allocation) => {
      const rawShare = allocation.credits.trim();
      if (rawShare === '') {
        blankCount += 1;
        return { allocation, explicit: false, parsed: null as number | null, invalid: false };
      }
      const parsedShare = parseCreditNumber(rawShare);
      if (parsedShare === null) {
        hasInvalidAllocation = true;
        return { allocation, explicit: true, parsed: null as number | null, invalid: true };
      }
      explicitUnits += toCreditUnits(parsedShare);
      return { allocation, explicit: true, parsed: parsedShare, invalid: false };
    });

    const remainingUnits = Math.max(0, courseUnits - explicitUnits);
    // Keep standard splits at hundredth precision and preserve finer entered fractions.
    let splitUnit = CREDIT_SCALE / 100;
    while (remainingUnits % splitUnit !== 0) splitUnit /= 10;
    const splitUnits = remainingUnits / splitUnit;
    const baseShareUnits = blankCount > 0 ? Math.floor(splitUnits / blankCount) : 0;
    const extraShareUnits = blankCount > 0 ? splitUnits % blankCount : 0;
    const allocatedUnits = explicitUnits + (blankCount > 0 ? remainingUnits : 0);
    const exceedsCourseCredits = courseUnits > 0 && allocatedUnits > courseUnits;
    const mappingNeedsCorrection = validAllocations.length > 0 &&
      (courseUnits === 0 || exceedsCourseCredits || hasInvalidAllocation);

    let blankIndex = 0;

    const resolvedAllocations: ResolvedAllocation[] = inspected.map((item) => {
      const area = areaById.get(item.allocation.areaId)!;
      let automaticShare = 0;
      if (!item.explicit) {
        const share = baseShareUnits + (blankIndex < extraShareUnits ? 1 : 0);
        blankIndex += 1;
        automaticShare = (share * splitUnit) / CREDIT_SCALE;
      }

      const credits = item.explicit ? (item.parsed ?? 0) : automaticShare;

      return {
        areaId: area.id,
        areaName: area.name,
        credits,
        automaticShare,
        explicit: item.explicit,
        invalidInput: item.invalid,
      };
    });

    const countedUnits = mappingNeedsCorrection ? 0 : allocatedUnits;
    mappedUnits += countedUnits;

    for (const resolved of resolvedAllocations) {
      if (mappingNeedsCorrection || resolved.credits === 0) continue;
      mappedByArea.get(resolved.areaId)?.push({
        courseId: course.id,
        title: course.title,
        transcriptCredits: parsedCredits,
        mappedCredits: resolved.credits,
        moduleRef: course.moduleRef,
        isPartialOrSplit: toCreditUnits(resolved.credits) !== courseUnits,
      });
    }

    return {
      course,
      parsedCredits,
      invalidCredits,
      resolvedAllocations,
      allocatedTotal: allocatedUnits / CREDIT_SCALE,
      mappedCredits: countedUnits / CREDIT_SCALE,
      mappingNeedsCorrection,
      exceedsCourseCredits,
      hasInvalidAllocation,
    };
  });

  const areas: AreaSummary[] = worksheet.areas.map((area) => {
    const trimmedRequired = area.requiredCredits.trim();
    const parsedRequiredCredits = parseCreditNumber(area.requiredCredits);
    const invalidRequiredCredits =
      trimmedRequired !== '' && (parsedRequiredCredits === null || parsedRequiredCredits <= 0);
    const mappedCourses = mappedByArea.get(area.id) ?? [];
    const mappedCredits =
      mappedCourses.reduce((sum, item) => sum + toCreditUnits(item.mappedCredits), 0) / CREDIT_SCALE;

    return {
      area,
      parsedRequiredCredits,
      invalidRequiredCredits,
      mappedCredits,
      mappedCourses,
    };
  });

  const unmappedAreas = areas.filter((item) => item.mappedCredits === 0);
  const unmappedCourses = courses.filter((item) => item.mappedCredits === 0);

  return {
    areas,
    courses,
    unmappedAreas,
    unmappedCourses,
    totalTranscriptCredits: transcriptUnits / CREDIT_SCALE,
    totalMappedCredits: mappedUnits / CREDIT_SCALE,
  };
}

export function setContextField(
  worksheet: CreditMatchWorksheet,
  field: keyof ProgrammeContext,
  value: string,
): CreditMatchWorksheet {
  return {
    ...worksheet,
    context: {
      ...worksheet.context,
      [field]: value,
    },
  };
}

export function addSubjectArea(
  worksheet: CreditMatchWorksheet,
  name: string,
  requiredCredits: string,
): CreditMatchWorksheet {
  const id = createEntryId(
    'area',
    worksheet.areas.map((area) => area.id),
  );
  return {
    ...worksheet,
    areas: [
      ...worksheet.areas,
      {
        id,
        name: name.trim(),
        requiredCredits: requiredCredits.trim(),
      },
    ],
  };
}

export function updateSubjectArea(
  worksheet: CreditMatchWorksheet,
  areaId: string,
  patch: Partial<Pick<SubjectAreaEntry, 'name' | 'requiredCredits'>>,
): CreditMatchWorksheet {
  return {
    ...worksheet,
    areas: worksheet.areas.map((area) => (area.id === areaId ? { ...area, ...patch } : area)),
  };
}

export function removeSubjectArea(
  worksheet: CreditMatchWorksheet,
  areaId: string,
): CreditMatchWorksheet {
  return {
    ...worksheet,
    areas: worksheet.areas.filter((area) => area.id !== areaId),
    courses: worksheet.courses.map((course) => ({
      ...course,
      allocations: course.allocations.filter((allocation) => allocation.areaId !== areaId),
    })),
  };
}

export function addCourse(
  worksheet: CreditMatchWorksheet,
  draft: {
    title: string;
    credits: string;
    moduleRef: string;
    areaIds: readonly string[];
  },
): CreditMatchWorksheet {
  const validAreaIds = new Set(worksheet.areas.map((area) => area.id));
  const seen = new Set<string>();
  const allocations = draft.areaIds
    .filter((areaId) => {
      if (!validAreaIds.has(areaId) || seen.has(areaId)) return false;
      seen.add(areaId);
      return true;
    })
    .map((areaId) => ({ areaId, credits: '' }));

  const id = createEntryId(
    'course',
    worksheet.courses.map((course) => course.id),
  );

  return {
    ...worksheet,
    courses: [
      ...worksheet.courses,
      {
        id,
        title: draft.title.trim(),
        credits: draft.credits.trim(),
        moduleRef: draft.moduleRef.trim(),
        allocations,
      },
    ],
  };
}

export function updateCourseField(
  worksheet: CreditMatchWorksheet,
  courseId: string,
  field: keyof Pick<CourseEntry, 'title' | 'credits' | 'moduleRef'>,
  value: string,
): CreditMatchWorksheet {
  return {
    ...worksheet,
    courses: worksheet.courses.map((course) =>
      course.id === courseId ? { ...course, [field]: value } : course,
    ),
  };
}

export function toggleCourseArea(
  worksheet: CreditMatchWorksheet,
  courseId: string,
  areaId: string,
): CreditMatchWorksheet {
  if (!worksheet.areas.some((area) => area.id === areaId)) return worksheet;

  return {
    ...worksheet,
    courses: worksheet.courses.map((course) => {
      if (course.id !== courseId) return course;
      const exists = course.allocations.some((allocation) => allocation.areaId === areaId);
      const nextAllocations = exists
        ? course.allocations.filter((allocation) => allocation.areaId !== areaId)
        : [...course.allocations, { areaId, credits: '' }];
      return {
        ...course,
        allocations: nextAllocations,
      };
    }),
  };
}

export function setCourseAreaCredits(
  worksheet: CreditMatchWorksheet,
  courseId: string,
  areaId: string,
  credits: string,
): CreditMatchWorksheet {
  return {
    ...worksheet,
    courses: worksheet.courses.map((course) => {
      if (course.id !== courseId) return course;
      return {
        ...course,
        allocations: course.allocations.map((allocation) =>
          allocation.areaId === areaId ? { ...allocation, credits } : allocation,
        ),
      };
    }),
  };
}

export function removeCourse(worksheet: CreditMatchWorksheet, courseId: string): CreditMatchWorksheet {
  return {
    ...worksheet,
    courses: worksheet.courses.filter((course) => course.id !== courseId),
  };
}
