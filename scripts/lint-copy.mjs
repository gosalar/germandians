import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

const VALID_RULES = new Set([
  'american-spelling',
  'exclamation',
  'guarantee',
  'hype',
  'dmat-terms',
]);

// Technical JSX attributes whose string values are DOM/SVG/Mantine tokens rather than visitor prose.
const NON_PROSE_JSX_ATTRS = new Set([
  'align',
  'aria-atomic',
  'aria-controls',
  'aria-current',
  'aria-describedby',
  'aria-haspopup',
  'aria-hidden',
  'aria-labelledby',
  'aria-live',
  'as',
  'autoComplete',
  'bg',
  'c',
  'charSet',
  'className',
  'color',
  'component',
  'crossOrigin',
  'cx',
  'cy',
  'd',
  'decoding',
  'dominantBaseline',
  'fetchPriority',
  'fill',
  'focusable',
  'forceColorScheme',
  'gap',
  'height',
  'href',
  'htmlFor',
  'id',
  'inputMode',
  'justify',
  'lang',
  'loading',
  'mode',
  'name',
  'pattern',
  'points',
  'preserveAspectRatio',
  'r',
  'rel',
  'role',
  'rx',
  'ry',
  'scope',
  'size',
  'src',
  'stroke',
  'strokeLinecap',
  'strokeLinejoin',
  'strokeWidth',
  'style',
  'ta',
  'target',
  'textAnchor',
  'to',
  'transform',
  'type',
  'variant',
  'viewBox',
  'width',
  'x',
  'xmlns',
  'y',
]);

// Note on "enroll": in standard British English, present tense and noun use a single "l" ("enrol",
// "enrols", "enrolment", "enrolments"), while inflected "-ed"/"-ing" double the stressed final "l"
// ("enrolled", "enrolling"), matching existing British usage in topics/visa-enrolment.ts and deadlines.ts.
const AMERICAN_WORDS_RE =
  /\b(?:programs?|organizations?|organizational|organiz(?:e|es|ed|ing|ers?)|personaliz(?:e|es|ed|ing|ation)|centers?|centered|centering|colors?|colored|coloring|colorful|colorless|enrolls?|enrollments?|analyz(?:e|es|ed|ing|ers?)|catalogs?|cataloged|cataloging)\b/gi;

const LICENSE_RE = /\blicenses?\b/gi;
const EXCLAMATION_RE = /!/g;
const GUARANTEE_RE = /\b(?:guarantees?|guaranteed|guaranteeing)\b/gi;
const HYPE_RE =
  /\b(?:seamless(?:ly|ness)?|world-class|cutting-edge|unlock(?:s|ed|ing)?|effortless(?:ly|ness)?|revolutionar(?:y|ies))\b/gi;

const DMAT_AI_TOKEN_RE = /\bAI\b/g;
const DMAT_PROHIBITED_RE = /\b(?:artificial\s+intelligence|generated)\b/gi;

const URL_RE = /(?:(?:https?:\/\/|mailto:|www\.)[^\s"'<>)\]]+)/gi;

function parseArgs(argv) {
  let root = repoRoot;
  let allowPath = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root' && argv[i + 1]) {
      root = resolve(argv[++i]);
    } else if (argv[i] === '--allow' && argv[i + 1]) {
      allowPath = resolve(argv[++i]);
    } else {
      throw new Error(`Unknown or incomplete argument: ${argv[i]}`);
    }
  }
  if (!allowPath) {
    const candidate = join(root, 'scripts', 'lint-copy.allow.json');
    allowPath = existsSync(candidate) ? candidate : null;
  }
  return { root, allowPath };
}

function loadAllowlist(allowPath) {
  if (!allowPath) return [];
  const raw = JSON.parse(readFileSync(allowPath, 'utf8'));
  if (!Array.isArray(raw)) {
    throw new Error(`${allowPath}: expected a JSON array of allowlist entries`);
  }
  for (const [index, entry] of raw.entries()) {
    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof entry.file !== 'string' ||
      !entry.file.trim() ||
      typeof entry.rule !== 'string' ||
      !VALID_RULES.has(entry.rule) ||
      typeof entry.text !== 'string' ||
      !entry.text.length ||
      typeof entry.reason !== 'string' ||
      !entry.reason.trim()
    ) {
      throw new Error(
        `${allowPath}[${index}]: each entry requires non-empty "file", valid "rule", "text", and "reason"`,
      );
    }
  }
  return raw;
}

function walkFiles(dir, root, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkFiles(full, root, out);
    } else {
      out.push(relative(root, full).replaceAll('\\', '/'));
    }
  }
  return out;
}

function isGeneralCopyFile(relPath) {
  if (relPath.endsWith('.d.ts')) return false;
  if (relPath === 'src/utils/constants.ts') return true;
  if (/^src\/(?:.+\/)?data\.tsx?$/.test(relPath)) return true;
  if (/^src\/pages\/Requirements\/Guide\/topics\/[^/]+\.ts$/.test(relPath)) return true;
  if (/^src\/pages\/(?:.+\/)?index\.tsx$/.test(relPath)) return true;
  return false;
}

function isDmatFile(relPath) {
  if (relPath.endsWith('.d.ts')) return false;
  if (!/\.(?:ts|tsx|json)$/.test(relPath)) return false;
  return (
    relPath.startsWith('src/pages/Dmat/') ||
    relPath.startsWith('src/pages/DmatPractice/') ||
    relPath.startsWith('src/utils/dmat/')
  );
}

function maskUrls(text) {
  return text.replace(URL_RE, (url) => url.replace(/[^\n]/g, ' '));
}

function normalizeWithMap(raw) {
  const rawToNorm = new Int32Array(raw.length + 1);
  let norm = '';
  let inSpace = true;
  for (let i = 0; i < raw.length; i++) {
    rawToNorm[i] = norm.length;
    if (/\s/.test(raw[i])) {
      if (!inSpace) {
        norm += ' ';
        inSpace = true;
      }
    } else {
      norm += raw[i];
      inSpace = false;
    }
  }
  if (norm.endsWith(' ')) {
    norm = norm.slice(0, -1);
  }
  rawToNorm[raw.length] = norm.length;
  return {
    normText: norm,
    toNormSpan(rawStart, rawEnd) {
      const start = Math.min(rawToNorm[rawStart], norm.length);
      const end = Math.min(rawToNorm[rawEnd], norm.length);
      return [start, Math.max(start, end)];
    },
  };
}

// British English uses "licence" / "licences" for the noun and "license" / "licenses" / "licensed"
// for the verb. Flag "license" / "licenses" unless clearly governed as a verb.
function isBritishLicenseVerb(text, index, word) {
  const before = text.slice(0, index);
  const after = text.slice(index + word.length);
  const lower = word.toLowerCase();

  if (/^\s+(?:fees?|numbers?|holders?|terms|agreements?|plates?|keys?|types?)\b/i.test(after)) {
    return false;
  }
  if (lower === 'license') {
    if (/\bto\s+(?:not\s+|\w+ly\s+)?$/i.test(before)) return true;
    if (
      /\b(?:can|cannot|can['’]t|could|couldn['’]t|may|might|must|mustn['’]t|shall|should|shouldn['’]t|will|won['’]t|would|wouldn['’]t|do|does|did|don['’]t|doesn['’]t|didn['’]t)\s+(?:not\s+|also\s+|only\s+|\w+ly\s+)?$/i.test(
        before,
      )
    ) {
      return true;
    }
    if (/\b(?:i|you|we|they)\s+(?:also\s+|only\s+|\w+ly\s+)?$/i.test(before)) return true;
    return false;
  }
  return /\b(?:he|she|it|who|that)\s+(?:also\s+|only\s+|\w+ly\s+)?$/i.test(before);
}

function getPropertyNameText(nameNode) {
  if (ts.isIdentifier(nameNode) || ts.isStringLiteral(nameNode) || ts.isNumericLiteral(nameNode)) {
    return nameNode.text;
  }
  return null;
}

function extractProseNodes(relPath, sourceText) {
  const scriptKind = relPath.endsWith('.tsx')
    ? ts.ScriptKind.TSX
    : relPath.endsWith('.json')
      ? ts.ScriptKind.JSON
      : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(relPath, sourceText, ts.ScriptTarget.Latest, true, scriptKind);
  const nodes = [];

  function visit(node) {
    if (
      ts.isImportDeclaration(node) ||
      ts.isExportDeclaration(node) ||
      ts.isImportTypeNode(node) ||
      ts.isExternalModuleReference(node) ||
      ts.isTypeNode(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isInterfaceDeclaration(node)
    ) {
      return;
    }

    if (ts.isCallExpression(node)) {
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword) return;
      if (ts.isPropertyAccessExpression(node.expression)) {
        const method = node.expression.name.text;
        if (
          method === 'scrollIntoView' ||
          method === 'querySelector' ||
          method === 'querySelectorAll' ||
          method === 'closest' ||
          method === 'matches' ||
          method === 'getAttribute'
        ) {
          visit(node.expression);
          return;
        }
        if ((method === 'addEventListener' || method === 'removeEventListener') && node.arguments.length > 0) {
          visit(node.expression);
          for (let i = 1; i < node.arguments.length; i++) visit(node.arguments[i]);
          return;
        }
      }
    }

    if (ts.isJsxAttribute(node)) {
      const attrName = node.name.getText(sf);
      if (
        NON_PROSE_JSX_ATTRS.has(attrName) ||
        (attrName.startsWith('data-') && attrName !== 'data-screen-label')
      ) {
        return;
      }
    }

    if (ts.isPropertyAssignment(node)) {
      const propName = getPropertyNameText(node.name);
      // Skip raw inline SVG markup in generated dMAT bank JSON while keeping caption and alt text.
      if (propName === 'svg' && relPath.endsWith('.json')) {
        return;
      }
      visit(node.initializer);
      return;
    }

    if (ts.isElementAccessExpression(node)) {
      visit(node.expression);
      return;
    }

    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node) ||
      ts.isJsxText(node)
    ) {
      if (ts.isJsxText(node) && node.text.trim() === '') return;
      const basePos = ts.isJsxText(node) ? node.getFullStart() : node.getStart(sf);
      const startLine = sf.getLineAndCharacterOfPosition(basePos).line + 1;
      const endLine = sf.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
      nodes.push({ text: node.text, startLine, endLine });
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sf);
  return nodes;
}

function lineForIndex(rawText, rawIndex, startLine, endLine) {
  if (startLine === endLine) return startLine;
  let newlines = 0;
  for (let i = 0; i < rawIndex && i < rawText.length; i++) {
    if (rawText[i] === '\n') newlines++;
  }
  return Math.min(startLine + newlines, endLine);
}

function formatSnippet(normText, normStart, normEnd) {
  const maxLen = 140;
  if (normText.length <= maxLen) return normText;
  const matchLen = normEnd - normStart;
  const pad = Math.max(20, Math.floor((maxLen - matchLen) / 2));
  let start = Math.max(0, normStart - pad);
  let end = Math.min(normText.length, normEnd + pad);
  if (start > 0) {
    const space = normText.indexOf(' ', start);
    if (space !== -1 && space < normStart) start = space + 1;
  }
  if (end < normText.length) {
    const space = normText.lastIndexOf(' ', end);
    if (space !== -1 && space > normEnd) end = space;
  }
  return `${start > 0 ? '…' : ''}${normText.slice(start, end)}${end < normText.length ? '…' : ''}`;
}

function collectMatches(regex, text, filterFn = null) {
  const hits = [];
  regex.lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (!filterFn || filterFn(text, match.index, match[0])) {
      hits.push({ index: match.index, end: match.index + match[0].length, token: match[0] });
    }
  }
  return hits;
}

function scanFile(relPath, fullPath, checkGeneral, checkDmat) {
  const sourceText = readFileSync(fullPath, 'utf8');
  const proseNodes = extractProseNodes(relPath, sourceText);
  const findings = [];

  for (const { text: rawText, startLine, endLine } of proseNodes) {
    const masked = maskUrls(rawText);
    const { normText, toNormSpan } = normalizeWithMap(rawText);
    if (!normText) continue;

    const pushHits = (rule, hits) => {
      for (const hit of hits) {
        const [normStart, normEnd] = toNormSpan(hit.index, hit.end);
        findings.push({
          file: relPath,
          line: lineForIndex(rawText, hit.index, startLine, endLine),
          rule,
          normText,
          normStart,
          normEnd,
          display: formatSnippet(normText, normStart, normEnd),
        });
      }
    };

    if (checkGeneral) {
      const americanHits = [
        ...collectMatches(AMERICAN_WORDS_RE, masked),
        ...collectMatches(LICENSE_RE, masked, (text, idx, word) => !isBritishLicenseVerb(text, idx, word)),
      ].sort((a, b) => a.index - b.index);
      pushHits('american-spelling', americanHits);
      pushHits('exclamation', collectMatches(EXCLAMATION_RE, masked));
      pushHits('guarantee', collectMatches(GUARANTEE_RE, masked));
      pushHits('hype', collectMatches(HYPE_RE, masked));
    }

    if (checkDmat) {
      const dmatHits = [
        ...collectMatches(DMAT_AI_TOKEN_RE, masked),
        ...collectMatches(DMAT_PROHIBITED_RE, masked),
      ].sort((a, b) => a.index - b.index);
      pushHits('dmat-terms', dmatHits);
    }
  }

  return findings;
}

function isAllowed(finding, allowlist) {
  for (const entry of allowlist) {
    if (entry.file !== finding.file || entry.rule !== finding.rule) continue;
    // Short snippets (such as single-character badge marks or short greetings) must match the whole
    // normalized string so they cannot accidentally mask a longer sentence in the same file.
    if (entry.exact === true || entry.text.length < 12) {
      if (finding.normText === entry.text) return true;
      continue;
    }
    let searchFrom = 0;
    while (searchFrom <= finding.normText.length - entry.text.length) {
      const idx = finding.normText.indexOf(entry.text, searchFrom);
      if (idx === -1) break;
      const subEnd = idx + entry.text.length;
      if (idx <= finding.normStart && finding.normEnd <= subEnd) {
        return true;
      }
      searchFrom = idx + 1;
    }
  }
  return false;
}

const { root, allowPath } = parseArgs(process.argv.slice(2));
const allowlist = loadAllowlist(allowPath);
const allSrcFiles = walkFiles(join(root, 'src'), root).sort();

const unallowed = [];
for (const relPath of allSrcFiles) {
  const checkGeneral = isGeneralCopyFile(relPath);
  const checkDmat = isDmatFile(relPath);
  if (!checkGeneral && !checkDmat) continue;
  const findings = scanFile(relPath, join(root, relPath), checkGeneral, checkDmat);
  for (const finding of findings) {
    if (!isAllowed(finding, allowlist)) {
      unallowed.push(finding);
    }
  }
}

if (unallowed.length > 0) {
  const printed = new Set();
  for (const finding of unallowed) {
    const line = `${finding.file}:${finding.line} ${finding.rule} ${finding.display}`;
    if (!printed.has(line)) {
      printed.add(line);
      console.log(line);
    }
  }
  process.exitCode = 1;
}
