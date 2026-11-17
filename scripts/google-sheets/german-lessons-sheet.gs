/**
 * Germandians: the German lessons sheet's web app.
 *
 * It writes each German lessons enquiry sent from the form on the Learn German page into this
 * spreadsheet, one row per enquiry, and answers { "received": true } only once the row is saved. The
 * website shows "Received" only after that answer. A "Teach me German" tick on the profile-review form
 * goes to the admissions sheet, not here.
 *
 * Setup, once, in the German lessons spreadsheet (README, "Google Sheets"):
 *  1. Extensions → Apps Script. Replace the code in the editor with this file and save.
 *  2. Choose setUp in the function list next to Run, press Run and allow access. A "German lessons"
 *     tab with its column headings appears in the spreadsheet.
 *  3. Deploy → New deployment → Select type: Web app. Execute as: Me. Who has access: Anyone. Deploy.
 *  4. Copy the web app URL (it ends in /exec) into ENQUIRY_ENDPOINTS.germanLessons in
 *     src/utils/constants.ts.
 *
 * After changing this code, publish it under the same URL: Deploy → Manage deployments → Edit →
 * Version: New version → Deploy. A new deployment would get a new URL.
 */

const FORM = 'german-lessons';
const TAB_NAME = 'German lessons';

/** The columns this script fills: each heading, and how its value is read from the enquiry. */
const COLUMNS = [
  ['Received', () => new Date()],
  ['Name', (enquiry) => enquiry.name],
  ['WhatsApp', (enquiry) => enquiry.whatsapp],
  ['Email', (enquiry) => enquiry.email],
  ['Language for explanations', (enquiry) => enquiry.language],
  ['What they need German for', (enquiry) => enquiry.purpose],
  ['German they already have', (enquiry) => enquiry.experience],
  ['Consent given', (enquiry) => enquiry.consentAt],
];

/** The text fields a German lessons enquiry may carry, and the longest each may be. */
const TEXT_LIMITS = { name: 500, whatsapp: 500, email: 500, language: 500, purpose: 5000, experience: 5000, consentAt: 100 };
const REQUIRED = ['name', 'whatsapp', 'language'];

/** Why this request is not a German lessons enquiry from the website, or '' when it is one. */
function problemWith(enquiry) {
  if (enquiry.enquiry !== FORM) return 'This is not a German lessons enquiry. Check the web app URLs in ENQUIRY_ENDPOINTS.';
  return '';
}

// Everything below is the same in both sheets' scripts.

const SPREADSHEET_ID = 'SPREADSHEET_ID';

/** Run once from the editor: remembers this spreadsheet and adds the tab with its headings. */
function setUp() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty(SPREADSHEET_ID, spreadsheet.getId());
  tab(spreadsheet);
}

/** Opening the web app URL shows whether it is set up. A Google sign-in page instead means access isn't "Anyone". */
function doGet() {
  return reply({ ready: Boolean(PropertiesService.getScriptProperties().getProperty(SPREADSHEET_ID)), form: FORM });
}

function doPost(event) {
  let enquiry;
  try {
    enquiry = JSON.parse(event.postData.contents);
  } catch (error) {
    return reply({ received: false, error: 'The request was not JSON.' });
  }
  const problem = checkEnquiry(enquiry);
  if (problem) return reply({ received: false, error: problem });

  const id = PropertiesService.getScriptProperties().getProperty(SPREADSHEET_ID);
  if (!id) return reply({ received: false, error: 'Run setUp in the Apps Script editor first.' });

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = tab(SpreadsheetApp.openById(id));
    const values = Object.fromEntries(COLUMNS.map(([heading, read]) => [heading, cell(read(enquiry))]));
    const headings = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
    sheet.appendRow(headings.map((heading) => (heading in values ? values[heading] : '')));
    SpreadsheetApp.flush();
  } catch (error) {
    return reply({ received: false, error: 'The row could not be saved.' });
  } finally {
    lock.releaseLock();
  }
  return reply({ received: true });
}

/** Checks what every enquiry from the website carries, that it is this sheet's form, then its fields. */
function checkEnquiry(enquiry) {
  if (!enquiry || typeof enquiry !== 'object' || Array.isArray(enquiry)) return 'The request was not an enquiry.';
  if (enquiry.source !== 'germandians-website') return 'The request did not come from the website.';
  if (enquiry.consent !== true) return 'The request has no consent.';
  const formProblem = problemWith(enquiry);
  if (formProblem) return formProblem;
  for (const [field, limit] of Object.entries(TEXT_LIMITS)) {
    const value = enquiry[field];
    if (value === undefined) continue;
    if (typeof value !== 'string' || value.length > limit) return `${field} must be text of at most ${limit} characters.`;
  }
  for (const field of REQUIRED) {
    if (typeof enquiry[field] !== 'string' || !enquiry[field].trim()) return `${field} is missing.`;
  }
  return '';
}

/**
 * The form's tab. It is added with its headings when missing, and a heading that has gone missing is
 * added at the end of the first row, so a row never loses a value. Columns can be moved or added freely.
 */
function tab(spreadsheet) {
  const sheet = spreadsheet.getSheetByName(TAB_NAME) || spreadsheet.insertSheet(TAB_NAME);
  const width = sheet.getLastColumn();
  const headings = width ? sheet.getRange(1, 1, 1, width).getValues()[0].map(String) : [];
  const missing = COLUMNS.map(([heading]) => heading).filter((heading) => !headings.includes(heading));
  if (missing.length) {
    sheet.getRange(1, headings.length + 1, 1, missing.length).setValues([missing]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Text is stored exactly as typed: the leading apostrophe stops Sheets reading it as a formula, number or date. */
function cell(value) {
  if (value instanceof Date) return value;
  if (value === undefined || value === null || value === '') return '';
  return `'${String(value)}`;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
