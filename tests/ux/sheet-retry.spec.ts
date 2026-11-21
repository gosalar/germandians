import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

import { expect, test } from '@playwright/test';

interface TraceEvent {
  op: 'waitLock' | 'releaseLock' | 'getValues' | 'setValues' | 'appendRow' | 'flush';
  lockHeld: boolean;
  row?: number;
  col?: number;
  numRows?: number;
  numCols?: number;
}

interface TextOutput {
  content: string;
  mimeType: string;
  setMimeType(mimeType: string): TextOutput;
  getContent(): string;
  getMimeType(): string;
}

interface SheetRange {
  getValues(): unknown[][];
  setValues(values: unknown[][]): SheetRange;
  setFontWeight(weight: string): SheetRange;
}

/**
 * Mirrors Google Sheets plain-text escaping: a single leading apostrophe marks the cell as literal
 * text and is stripped on storage, while any subsequent apostrophe stays part of the cell value.
 */
function storeSheetCell(value: unknown): unknown {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string' && value.startsWith("'")) return value.slice(1);
  return value;
}

function isNonEmptyCell(value: unknown): boolean {
  return value !== '' && value !== null && value !== undefined;
}

class FakeSheet {
  readonly name: string;
  readonly rows: unknown[][] = [];
  readonly rawAppends: unknown[][] = [];
  frozenRows = 0;
  private readonly onTrace: (event: TraceEvent) => void;
  private readonly isLocked: () => boolean;
  private readonly onAppend: () => void;

  constructor(
    name: string,
    hooks: { onTrace: (event: TraceEvent) => void; isLocked: () => boolean; onAppend: () => void },
  ) {
    this.name = name;
    this.onTrace = hooks.onTrace;
    this.isLocked = hooks.isLocked;
    this.onAppend = hooks.onAppend;
  }

  getLastRow(): number {
    for (let row = this.rows.length - 1; row >= 0; row--) {
      if (this.rows[row].some(isNonEmptyCell)) return row + 1;
    }
    return 0;
  }

  getLastColumn(): number {
    let max = 0;
    for (const row of this.rows) {
      for (let col = row.length - 1; col >= 0; col--) {
        if (isNonEmptyCell(row[col])) {
          if (col + 1 > max) max = col + 1;
          break;
        }
      }
    }
    return max;
  }

  getRange(row: number, col: number, numRows = 1, numCols = 1): SheetRange {
    if (
      !Number.isInteger(row) ||
      !Number.isInteger(col) ||
      !Number.isInteger(numRows) ||
      !Number.isInteger(numCols) ||
      row < 1 ||
      col < 1 ||
      numRows < 1 ||
      numCols < 1
    ) {
      throw new RangeError(`Invalid range (${row}, ${col}, ${numRows}, ${numCols})`);
    }
    const range: SheetRange = {
      getValues: () => {
        this.onTrace({ op: 'getValues', lockHeld: this.isLocked(), row, col, numRows, numCols });
        const result: unknown[][] = [];
        for (let r = 0; r < numRows; r++) {
          const source = this.rows[row - 1 + r] ?? [];
          const out: unknown[] = [];
          for (let c = 0; c < numCols; c++) {
            out.push(source[col - 1 + c] ?? '');
          }
          result.push(out);
        }
        return result;
      },
      setValues: (values: unknown[][]) => {
        this.onTrace({ op: 'setValues', lockHeld: this.isLocked(), row, col, numRows, numCols });
        if (values.length !== numRows) {
          throw new RangeError(`Expected ${numRows} rows, got ${values.length}`);
        }
        for (let r = 0; r < numRows; r++) {
          if (values[r].length !== numCols) {
            throw new RangeError(`Expected ${numCols} columns, got ${values[r].length}`);
          }
          const targetRowIndex = row - 1 + r;
          while (this.rows.length <= targetRowIndex) this.rows.push([]);
          const targetRow = this.rows[targetRowIndex];
          for (let c = 0; c < numCols; c++) {
            const targetColIndex = col - 1 + c;
            while (targetRow.length < targetColIndex) targetRow.push('');
            targetRow[targetColIndex] = storeSheetCell(values[r][c]);
          }
        }
        return range;
      },
      setFontWeight: () => range,
    };
    return range;
  }

  appendRow(values: unknown[]): FakeSheet {
    this.onTrace({ op: 'appendRow', lockHeld: this.isLocked() });
    this.onAppend();
    this.rawAppends.push([...values]);
    this.rows.push(values.map(storeSheetCell));
    return this;
  }

  setFrozenRows(rows: number): void {
    this.frozenRows = rows;
  }

  seedRawRow(values: unknown[]): void {
    this.rows.push(values.map(storeSheetCell));
  }
}

interface AppsScriptContext {
  setUp(): void;
  doGet(): TextOutput;
  doPost(event: { postData: { contents: string } }): TextOutput;
}

type SheetScriptName = 'admissions-sheet.gs' | 'german-lessons-sheet.gs';

function loadSheetScript(scriptFile: SheetScriptName) {
  const spreadsheetId = `fake-sheet-${scriptFile}`;
  const properties = new Map<string, string>();
  const sheets = new Map<string, FakeSheet>();
  const trace: TraceEvent[] = [];
  let lockHeld = false;
  let flushCount = 0;
  let lockError: Error | null = null;
  let onAppendHook: (() => void) | null = null;
  let onFlushHook: (() => void) | null = null;

  const makeSheet = (name: string) =>
    new FakeSheet(name, {
      onTrace: (event) => trace.push(event),
      isLocked: () => lockHeld,
      onAppend: () => {
        onAppendHook?.();
      },
    });

  const spreadsheet = {
    getId: () => spreadsheetId,
    getSheetByName: (name: string) => sheets.get(name) ?? null,
    insertSheet: (name: string) => {
      const created = makeSheet(name);
      sheets.set(name, created);
      return created;
    },
  };

  const SpreadsheetApp = {
    getActiveSpreadsheet: () => spreadsheet,
    openById: (id: string) => {
      if (id !== spreadsheetId) throw new Error(`Unknown spreadsheet id: ${id}`);
      return spreadsheet;
    },
    flush: () => {
      trace.push({ op: 'flush', lockHeld });
      onFlushHook?.();
      flushCount++;
    },
  };

  const PropertiesService = {
    getScriptProperties: () => ({
      getProperty: (key: string) => properties.get(key) ?? null,
      setProperty: (key: string, value: string) => {
        properties.set(key, String(value));
      },
    }),
  };

  const LockService = {
    getScriptLock: () => ({
      waitLock: () => {
        if (lockError) throw lockError;
        if (lockHeld) throw new Error('Lock is already held');
        lockHeld = true;
        trace.push({ op: 'waitLock', lockHeld: true });
      },
      releaseLock: () => {
        if (!lockHeld) throw new Error('releaseLock called without holding lock');
        lockHeld = false;
        trace.push({ op: 'releaseLock', lockHeld: false });
      },
    }),
  };

  const ContentService = {
    MimeType: { JSON: 'application/json' },
    createTextOutput: (content: string): TextOutput => {
      const output: TextOutput = {
        content,
        mimeType: '',
        setMimeType(mimeType: string) {
          output.mimeType = mimeType;
          return output;
        },
        getContent: () => output.content,
        getMimeType: () => output.mimeType,
      };
      return output;
    },
  };

  const scriptPath = fileURLToPath(new URL(`../../scripts/google-sheets/${scriptFile}`, import.meta.url));
  const source = readFileSync(scriptPath, 'utf8');
  const context = vm.createContext({
    SpreadsheetApp,
    PropertiesService,
    LockService,
    ContentService,
  });
  vm.runInContext(source, context, { filename: scriptPath });
  const api = context as unknown as AppsScriptContext;

  const post = (payload: unknown) => {
    const out = api.doPost({ postData: { contents: JSON.stringify(payload) } });
    return JSON.parse(out.getContent()) as { received: boolean; error?: string };
  };

  return {
    setUp: () => api.setUp(),
    doGet: () => JSON.parse(api.doGet().getContent()) as { ready: boolean; form: string },
    post,
    sheet: (tabName: string) => sheets.get(tabName),
    insertSheet: (tabName: string) => spreadsheet.insertSheet(tabName),
    setSpreadsheetProperty: () => properties.set('SPREADSHEET_ID', spreadsheetId),
    trace,
    clearTrace: () => {
      trace.length = 0;
    },
    isLockHeld: () => lockHeld,
    flushCount: () => flushCount,
    setLockError: (error: Error | null) => {
      lockError = error;
    },
    setOnAppend: (hook: (() => void) | null) => {
      onAppendHook = hook;
    },
    setOnFlush: (hook: (() => void) | null) => {
      onFlushHook = hook;
    },
  };
}

const UUID_1 = '123e4567-e89b-42d3-a456-426614174000';
const UUID_2 = '223e4567-e89b-42d3-a456-426614174000';
const CONSENT_AT = '2026-11-20T12:00:00.000Z';
const CONSENT_AT_2 = '2026-11-20T12:05:00.000Z';

const SHEETS: {
  label: string;
  file: SheetScriptName;
  form: string;
  tabName: string;
  legacyHeadings: string[];
  expectedHeadings: string[];
  validPayload: Record<string, unknown>;
  minimalPayload: Record<string, unknown>;
  wrongFormPayload: Record<string, unknown>;
  mutatedPayloads: Record<string, Record<string, unknown>>;
}[] = [
  {
    label: 'admissions',
    file: 'admissions-sheet.gs',
    form: 'profile-review',
    tabName: 'Profile reviews',
    legacyHeadings: ['Received', 'Name', 'WhatsApp', 'Email', 'Summary', 'German lessons', 'Consent given'],
    expectedHeadings: [
      'Received',
      'Name',
      'WhatsApp',
      'Email',
      'Summary',
      'German lessons',
      'Consent given',
      'Submission ID',
    ],
    validPayload: {
      name: 'Test visitor',
      email: 'visitor@example.test',
      whatsapp: '+91 9876543210',
      snapshot: 'German grade 2.3 (7.4 / 10, pass 4)',
      germanLessons: true,
      submissionId: UUID_1,
      consent: true,
      consentAt: CONSENT_AT,
      source: 'germandians-website',
    },
    minimalPayload: {
      name: 'Test visitor',
      whatsapp: '+91 9876543210',
      submissionId: UUID_1,
      consent: true,
      consentAt: CONSENT_AT,
      source: 'germandians-website',
    },
    wrongFormPayload: {
      enquiry: 'german-lessons',
      name: 'Test visitor',
      whatsapp: '+91 9876543210',
      language: 'Test language',
      submissionId: UUID_1,
      consent: true,
      consentAt: CONSENT_AT,
      source: 'germandians-website',
    },
    mutatedPayloads: {
      'changed name': { name: 'Different visitor' },
      'changed WhatsApp': { whatsapp: '+91 9123456789' },
      'omitted email': { email: undefined },
      'changed summary': { snapshot: 'German grade 1.8 (8.5 / 10, pass 4)' },
      'omitted German interest': { germanLessons: undefined },
      'changed consent timestamp': { consentAt: CONSENT_AT_2 },
    },
  },
  {
    label: 'German lessons',
    file: 'german-lessons-sheet.gs',
    form: 'german-lessons',
    tabName: 'German lessons',
    legacyHeadings: [
      'Received',
      'Name',
      'WhatsApp',
      'Email',
      'Language for explanations',
      'What they need German for',
      'German they already have',
      'Consent given',
    ],
    expectedHeadings: [
      'Received',
      'Name',
      'WhatsApp',
      'Email',
      'Language for explanations',
      'What they need German for',
      'German they already have',
      'Consent given',
      'Submission ID',
    ],
    validPayload: {
      enquiry: 'german-lessons',
      name: 'Test visitor',
      email: 'visitor@example.test',
      whatsapp: '+91 9876543210',
      language: 'Test language',
      purpose: 'University',
      experience: 'None yet',
      submissionId: UUID_1,
      consent: true,
      consentAt: CONSENT_AT,
      source: 'germandians-website',
    },
    minimalPayload: {
      enquiry: 'german-lessons',
      name: 'Test visitor',
      whatsapp: '+91 9876543210',
      language: 'Test language',
      submissionId: UUID_1,
      consent: true,
      consentAt: CONSENT_AT,
      source: 'germandians-website',
    },
    wrongFormPayload: {
      name: 'Test visitor',
      whatsapp: '+91 9876543210',
      submissionId: UUID_1,
      consent: true,
      consentAt: CONSENT_AT,
      source: 'germandians-website',
    },
    mutatedPayloads: {
      'changed name': { name: 'Different visitor' },
      'changed WhatsApp': { whatsapp: '+91 9123456789' },
      'changed language': { language: 'Another language' },
      'omitted purpose': { purpose: undefined },
      'changed experience': { experience: 'A few words' },
      'changed consent timestamp': { consentAt: CONSENT_AT_2 },
    },
  },
];

for (const spec of SHEETS) {
  test.describe(`${spec.label} Apps Script contract`, () => {
    test('deduplicates identical retries under the lock, preserves separate IDs, and keeps cross-form checks', () => {
      const app = loadSheetScript(spec.file);
      app.setUp();
      expect(app.doGet()).toEqual({ ready: true, form: spec.form });
      const tab = app.sheet(spec.tabName)!;
      expect(tab.rows[0]).toEqual(spec.expectedHeadings);

      // First send appends one row and flushes while holding the lock.
      app.clearTrace();
      expect(app.post(spec.validPayload)).toEqual({ received: true });
      expect(tab.rows.length - 1).toBe(1);
      expect(app.flushCount()).toBe(1);
      expect(app.isLockHeld()).toBe(false);

      const firstOps = app.trace.map((event) => event.op);
      expect(firstOps[0]).toBe('waitLock');
      expect(firstOps[firstOps.length - 1]).toBe('releaseLock');
      expect(firstOps.indexOf('appendRow')).toBeLessThan(firstOps.indexOf('flush'));
      for (const event of app.trace) {
        if (event.op !== 'waitLock' && event.op !== 'releaseLock') {
          expect(event.lockHeld).toBe(true);
        }
      }

      // Simulated lost response after append: retrying the exact same payload acknowledges without appending.
      app.clearTrace();
      expect(app.post({ ...spec.validPayload, submissionId: UUID_1.toUpperCase() })).toEqual({ received: true });
      expect(tab.rows.length - 1).toBe(1);
      expect(app.flushCount()).toBe(1);
      expect(app.isLockHeld()).toBe(false);
      expect(app.trace.some((event) => event.op === 'appendRow')).toBe(false);
      for (const event of app.trace) {
        if (event.op !== 'waitLock' && event.op !== 'releaseLock') {
          expect(event.lockHeld).toBe(true);
        }
      }

      // A second ID with the exact same contact details saves a separate row (shared numbers allowed).
      expect(app.post({ ...spec.validPayload, submissionId: UUID_2 })).toEqual({ received: true });
      expect(tab.rows.length - 1).toBe(2);
      expect(app.flushCount()).toBe(2);

      // A request meant for the other sheet is still turned away.
      const wrongForm = app.post(spec.wrongFormPayload);
      expect(wrongForm.received).toBe(false);
      expect(tab.rows.length - 1).toBe(2);
    });

    test('rejects a reused submissionId with materially different fields without modifying or leaking the stored row', () => {
      const app = loadSheetScript(spec.file);
      app.setUp();
      expect(app.post(spec.validPayload)).toEqual({ received: true });
      const tab = app.sheet(spec.tabName)!;
      const storedRowSnapshot = structuredClone(tab.rows[1]);

      for (const [caseName, patch] of Object.entries(spec.mutatedPayloads)) {
        const candidate: Record<string, unknown> = { ...spec.validPayload, ...patch };
        for (const [key, value] of Object.entries(candidate)) {
          if (value === undefined) delete candidate[key];
        }
        const reply = app.post(candidate);
        expect(reply.received, caseName).toBe(false);
        expect(reply.error, caseName).toBeTruthy();
        expect(JSON.stringify(reply), caseName).not.toContain('Test visitor');
        expect(JSON.stringify(reply), caseName).not.toContain('visitor@example.test');
        expect(JSON.stringify(reply), caseName).not.toContain('+91 9876543210');
        expect(tab.rows.length - 1, caseName).toBe(1);
        expect(tab.rows[1], caseName).toEqual(storedRowSnapshot);
        expect(app.isLockHeld(), caseName).toBe(false);
      }
    });

    test('matches optional blanks consistently and rejects malformed submission IDs', () => {
      const app = loadSheetScript(spec.file);
      app.setUp();
      expect(app.post(spec.minimalPayload)).toEqual({ received: true });
      expect(app.post({ ...spec.minimalPayload, email: '' })).toEqual({ received: true });
      const tab = app.sheet(spec.tabName)!;
      expect(tab.rows.length - 1).toBe(1);

      const badIds: unknown[] = [
        null,
        12345,
        true,
        {},
        [],
        '',
        '   ',
        'not-a-uuid',
        '123e4567e89b42d3a456426614174000',
        `${UUID_1}-extra`,
        ` ${UUID_1}`,
        `'${UUID_1}`,
        'zzzzzzzz-zzzz-4zzz-8zzz-zzzzzzzzzzzz',
      ];
      for (const bad of badIds) {
        const reply = app.post({ ...spec.minimalPayload, submissionId: bad });
        expect(reply.received).toBe(false);
        expect(reply.error).toContain('submissionId');
      }
      expect(tab.rows.length - 1).toBe(1);
    });

    test('supports older clients without submissionId, blank historic IDs, reordered/extra columns, and empty sheets', () => {
      // 1. Existing sheet with reordered columns, extra admin columns, and a blank historic row ID.
      const reordered = loadSheetScript(spec.file);
      reordered.setSpreadsheetProperty();
      const customSheet = reordered.insertSheet(spec.tabName);
      const customHeadings = ['Status', 'Submission ID', ...spec.legacyHeadings.slice().reverse(), 'Mentor notes'];
      customSheet.seedRawRow(customHeadings);
      customSheet.seedRawRow(
        customHeadings.map((heading) => {
          if (heading === 'Status') return "'Reviewed";
          if (heading === 'Name') return "'Historic visitor";
          if (heading === 'WhatsApp') return "'+91 9000000000";
          if (heading === 'Language for explanations') return "'Historic language";
          return '';
        }),
      );

      // Sending a payload with a UUID ignores the blank historic row and appends into the reordered columns.
      expect(reordered.post(spec.validPayload)).toEqual({ received: true });
      expect(customSheet.rows.length - 1).toBe(2);
      const idIndex = customHeadings.indexOf('Submission ID');
      expect(customSheet.rows[1][idIndex]).toBe('');
      expect(customSheet.rows[2][idIndex]).toBe(UUID_1);

      // Admin updates their own custom column; retry still matches and does not append a duplicate.
      customSheet.rows[2][0] = 'Contacted';
      expect(reordered.post(spec.validPayload)).toEqual({ received: true });
      expect(customSheet.rows.length - 1).toBe(2);
      expect(customSheet.rows[2][0]).toBe('Contacted');

      // 2. Upgraded existing sheet missing the Submission ID heading + older client omitting submissionId.
      const upgraded = loadSheetScript(spec.file);
      upgraded.setSpreadsheetProperty();
      const legacySheet = upgraded.insertSheet(spec.tabName);
      legacySheet.seedRawRow(spec.legacyHeadings);
      legacySheet.seedRawRow(
        spec.legacyHeadings.map((heading) => (heading === 'Name' ? "'Earlier visitor" : '')),
      );

      const legacyPayload = { ...spec.validPayload };
      delete legacyPayload.submissionId;
      expect(upgraded.post(legacyPayload)).toEqual({ received: true });
      expect(upgraded.post(legacyPayload)).toEqual({ received: true });
      expect(legacySheet.rows[0]).toEqual(spec.expectedHeadings);
      expect(legacySheet.rows.length - 1).toBe(3);

      // 3. Brand-new empty tab (0 rows, 0 cols) never triggers an invalid search range.
      const empty = loadSheetScript(spec.file);
      empty.setSpreadsheetProperty();
      empty.insertSheet(spec.tabName);
      expect(empty.post(spec.validPayload)).toEqual({ received: true });
      expect(empty.post(spec.validPayload)).toEqual({ received: true });
      expect(empty.sheet(spec.tabName)!.rows.length - 1).toBe(1);
    });

    test('escapes user-supplied text and UUIDs with leading apostrophes and still matches on retry', () => {
      const app = loadSheetScript(spec.file);
      app.setUp();
      const trickyPayload: Record<string, unknown> = {
        ...spec.validPayload,
        name: "'O'Brien =1+1",
        whatsapp: '+91 9876543210',
        ...(spec.form === 'profile-review'
          ? { snapshot: '=SUM(A1:A2)' }
          : { purpose: '=HYPERLINK("https://example.test")', experience: "'A1 notes" }),
      };

      expect(app.post(trickyPayload)).toEqual({ received: true });
      const tab = app.sheet(spec.tabName)!;
      const headings = tab.rows[0].map(String);
      const rawWritten = tab.rawAppends[0];
      expect(rawWritten[headings.indexOf('Name')]).toBe("''O'Brien =1+1");
      expect(rawWritten[headings.indexOf('WhatsApp')]).toBe("'+91 9876543210");
      expect(rawWritten[headings.indexOf('Submission ID')]).toBe(`'${UUID_1}`);
      if (spec.form === 'profile-review') {
        expect(rawWritten[headings.indexOf('Summary')]).toBe("'=SUM(A1:A2)");
      } else {
        expect(rawWritten[headings.indexOf('What they need German for')]).toBe("'=HYPERLINK(\"https://example.test\")");
        expect(rawWritten[headings.indexOf('German they already have')]).toBe("''A1 notes");
      }

      // Stored cells (after Sheets strips the single escape apostrophe) match on retry.
      expect(tab.rows[1][headings.indexOf('Name')]).toBe("'O'Brien =1+1");
      expect(tab.rows[1][headings.indexOf('Submission ID')]).toBe(UUID_1);
      expect(app.post(trickyPayload)).toEqual({ received: true });
      expect(tab.rows.length - 1).toBe(1);

      // Dropping the visitor's own leading apostrophe is treated as a different payload, not a match.
      expect(app.post({ ...trickyPayload, name: "O'Brien =1+1" }).received).toBe(false);
      expect(tab.rows.length - 1).toBe(1);
    });

    test('handles lock acquisition and write/flush failures through the error contract and releases locks', () => {
      const app = loadSheetScript(spec.file);
      app.setUp();

      app.setLockError(new Error('Lock timeout'));
      expect(app.post(spec.validPayload)).toEqual({ received: false, error: 'The row could not be saved.' });
      expect(app.isLockHeld()).toBe(false);

      app.setLockError(null);
      app.setOnAppend(() => {
        throw new Error('Sheet quota error');
      });
      expect(app.post(spec.validPayload)).toEqual({ received: false, error: 'The row could not be saved.' });
      expect(app.isLockHeld()).toBe(false);
      expect(app.sheet(spec.tabName)!.rows.length - 1).toBe(0);

      // Flush fails after append (simulated lost response after the row reached the sheet); retry recovers.
      app.setOnAppend(null);
      app.setOnFlush(() => {
        throw new Error('Transient flush interruption');
      });
      expect(app.post(spec.validPayload)).toEqual({ received: false, error: 'The row could not be saved.' });
      expect(app.isLockHeld()).toBe(false);
      expect(app.sheet(spec.tabName)!.rows.length - 1).toBe(1);

      app.setOnFlush(null);
      expect(app.post(spec.validPayload)).toEqual({ received: true });
      expect(app.sheet(spec.tabName)!.rows.length - 1).toBe(1);
    });
  });
}
