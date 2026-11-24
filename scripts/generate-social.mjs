import { chromium } from '@playwright/test';
import { mkdir, readFile, stat } from 'node:fs/promises';
import { PUBLIC_PAGES } from '../src/utils/publicPages.ts';

// Run after changing the stable preview labels. Local assets only; no remote requests.
const MAX_PNG_BYTES = 250 * 1024;
const LATIN_RANGE =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT_RANGE =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

const b64 = async (path) => (await readFile(path)).toString('base64');
const font = (path) => b64(`node_modules/${path}`);

const [
  archivoLatin,
  archivoLatinExt,
  hankenLatin,
  hankenLatinExt,
  barlow600Latin,
  barlow600Ext,
  barlow700Latin,
  barlow700Ext,
  barlow800Latin,
  barlow800Ext,
  badgeWebp,
] = await Promise.all([
  font('@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'),
  font('@fontsource-variable/archivo/files/archivo-latin-ext-wdth-normal.woff2'),
  font('@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2'),
  font('@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-ext-wght-normal.woff2'),
  font('@fontsource/barlow-semi-condensed/files/barlow-semi-condensed-latin-600-normal.woff2'),
  font('@fontsource/barlow-semi-condensed/files/barlow-semi-condensed-latin-ext-600-normal.woff2'),
  font('@fontsource/barlow-semi-condensed/files/barlow-semi-condensed-latin-700-normal.woff2'),
  font('@fontsource/barlow-semi-condensed/files/barlow-semi-condensed-latin-ext-700-normal.woff2'),
  font('@fontsource/barlow-semi-condensed/files/barlow-semi-condensed-latin-800-normal.woff2'),
  font('@fontsource/barlow-semi-condensed/files/barlow-semi-condensed-latin-ext-800-normal.woff2'),
  b64('src/assets/images/flag-badge.webp'),
]);

const esc = (text) =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const CHECK_SVG = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10.5L8.2 14.5L16 6" stroke="#1d7a3d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const ARROW_DOWN_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v14M6 13l6 6 6-6" stroke="#10182e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const ARROW_RIGHT_SVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" stroke="#10182e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const CHAKRA_SVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="#10182e" stroke-width="2"/><circle cx="12" cy="12" r="2.2" fill="#10182e"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" stroke="#10182e" stroke-width="1.3"/></svg>`;

const DMAT_MATRIX_SVG = `<svg width="100%" viewBox="0 0 264 168" fill="none" aria-hidden="true">
  <rect x="6" y="4" width="76" height="48" rx="8" fill="#fffdf4" stroke="#10182e" stroke-width="2.5"/>
  <rect x="94" y="4" width="76" height="48" rx="8" fill="#fffdf4" stroke="#10182e" stroke-width="2.5"/>
  <rect x="182" y="4" width="76" height="48" rx="8" fill="#fffdf4" stroke="#10182e" stroke-width="2.5"/>
  <rect x="6" y="60" width="76" height="48" rx="8" fill="#fffdf4" stroke="#10182e" stroke-width="2.5"/>
  <rect x="94" y="60" width="76" height="48" rx="8" fill="#fffdf4" stroke="#10182e" stroke-width="2.5"/>
  <rect x="182" y="60" width="76" height="48" rx="8" fill="#fffdf4" stroke="#10182e" stroke-width="2.5"/>
  <rect x="6" y="116" width="76" height="48" rx="8" fill="#fffdf4" stroke="#10182e" stroke-width="2.5"/>
  <rect x="94" y="116" width="76" height="48" rx="8" fill="#fffdf4" stroke="#10182e" stroke-width="2.5"/>
  <rect x="182" y="116" width="76" height="48" rx="8" fill="#f5c400" stroke="#10182e" stroke-width="2.5"/>
  <circle cx="44" cy="28" r="11" fill="#10182e"/>
  <polygon points="132,16 144,40 120,40" fill="#c4261b"/>
  <rect x="209" y="17" width="22" height="22" rx="3" fill="#10182e"/>
  <rect x="33" y="73" width="22" height="22" rx="3" fill="#c4261b"/>
  <circle cx="132" cy="84" r="11" fill="#10182e"/>
  <polygon points="220,72 232,96 208,96" fill="#10182e"/>
  <polygon points="44,128 56,152 32,152" fill="#10182e"/>
  <rect x="121" y="129" width="22" height="22" rx="3" fill="#10182e"/>
  <text x="220" y="150" text-anchor="middle" font-family="Archivo" font-weight="900" font-size="30" fill="#10182e">?</text>
</svg>`;

const TONE_STYLES = {
  yellow: { stickerBg: '#f5c400', stickerInk: '#10182e', shadow: '#f5c400', headerBg: '#f5c400', headerInk: '#10182e' },
  cream: { stickerBg: '#fffdf4', stickerInk: '#10182e', shadow: '#f5c400', headerBg: '#efebe2', headerInk: '#10182e' },
  mint: { stickerBg: '#e1f0e4', stickerInk: '#17692f', shadow: '#1d7a3d', headerBg: '#e1f0e4', headerInk: '#17692f' },
  red: { stickerBg: '#c4261b', stickerInk: '#ffffff', shadow: '#c4261b', headerBg: '#c4261b', headerInk: '#ffffff' },
};

const cardHead = (title, note, tone) => `
  <div class="card-head" style="background:${tone.headerBg};color:${tone.headerInk}">
    <div class="card-head-title">${esc(title)}</div>
    <div class="card-head-note">${esc(note)}</div>
  </div>`;

const checkRows = (items) =>
  `<ul class="check-list">${items
    .map(
      (item) => `<li>
        <span class="check-box">${CHECK_SVG}</span>
        <span class="check-text">${esc(item)}</span>
      </li>`,
    )
    .join('')}</ul>`;

const stamp = (title, note, colour = '#1d7a3d') => `
  <div class="stamp-wrap">
    <div class="stamp" style="color:${colour};border-color:${colour}">
      <div class="stamp-title">${esc(title)}</div>
      <div class="stamp-note">${esc(note)}</div>
    </div>
  </div>`;

function buildRightCard(entry, tone) {
  switch (entry.key) {
    case 'home':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Mentoring pathway', 'India to Germany', tone)}
        <div class="card-body">
          <div class="ribbon">
            <span class="rib-blk"></span>
            <span class="rib-red"></span>
            <span class="rib-gld"></span>
            <span class="rib-saf"></span>
            <span class="rib-wht">${CHAKRA_SVG}</span>
            <span class="rib-grn"></span>
          </div>
          ${checkRows(['Profile & shortlist', 'SOP & applications', 'Visa & blocked account', 'Housing & arrival'])}
          ${stamp('SCHRITT FÜR SCHRITT', 'Step by step', '#1d7a3d')}
        </div>
      </div>`;

    case 'check':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Modified Bavarian formula', 'Grade scale converter', tone)}
        <div class="card-body">
          <div class="input-trio">
            <div class="mini-field"><span>Maximum</span><strong>Scale</strong></div>
            <div class="mini-field"><span>Minimum pass</span><strong>Threshold</strong></div>
            <div class="mini-field accent"><span>Your mark</span><strong>CGPA / %</strong></div>
          </div>
          <div class="flow-arrow">${ARROW_DOWN_SVG}</div>
          <div class="scale-box">
            <div class="scale-label">German grade scale</div>
            <div class="scale-bar">
              <span class="seg-a">Very good</span>
              <span class="seg-b">Good</span>
              <span class="seg-c">Satisfactory</span>
              <span class="seg-d">Pass</span>
            </div>
          </div>
          ${stamp('FORMULA ONLY', 'Not an eligibility check', '#10182e')}
        </div>
      </div>`;

    case 'requirements':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Laufzettel', 'Next steps slip', tone)}
        <div class="card-body">
          ${checkRows(['Degree & subject credits', 'APS & dMAT requirements', 'Language & documents', 'Applying, costs & visa'])}
          ${stamp('FÜR DICH', 'For you', '#c4261b')}
        </div>
      </div>`;

    case 'dmat':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('dMAT Übersicht', 'Test overview', tone)}
        <div class="card-body">
          <div class="module-block">
            <div class="module-tag">Module 1</div>
            <div class="module-name">Core Module</div>
            <div class="module-sub">Three puzzle subtests</div>
          </div>
          <div class="module-block">
            <div class="module-tag red">Module 2</div>
            <div class="module-name">General Academic Module</div>
            <div class="module-sub">Reading passages in English</div>
          </div>
          <div class="pill-row">
            <span class="mini-pill">Registration</span>
            <span class="mini-pill">Test day</span>
            <span class="mini-pill">Results</span>
          </div>
        </div>
      </div>`;

    case 'dmatPractice':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Practice workspace', 'Independent prep', tone)}
        <div class="card-body">
          <div class="matrix-frame">${DMAT_MATRIX_SVG}</div>
          <div class="pill-row">
            <span class="mini-pill solid">Full mock</span>
            <span class="mini-pill">One section</span>
            <span class="mini-pill">Untimed</span>
          </div>
        </div>
      </div>`;

    case 'about':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Erfahrungsnachweis', 'Lived experience record', tone)}
        <div class="card-body">
          ${checkRows(['Zulassung · admission', 'Sperrkonto · blocked account', 'Anmeldung · city registration'])}
          ${stamp('SELBST ERLEBT', 'First-hand', '#1d7a3d')}
        </div>
      </div>`;

    case 'community':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Community spaces', 'Open conversation', tone)}
        <div class="card-body">
          <div class="bubble-stack">
            <div class="speech-bubble yellow"><strong>Hallo · Hello</strong><span>Ask about studying in Germany</span></div>
            <div class="speech-bubble navy"><strong>Instagram &amp; WhatsApp</strong><span>Student updates and Q&amp;A</span></div>
            <div class="speech-bubble paper"><strong>Open to all</strong><span>Separate from paid mentoring</span></div>
          </div>
        </div>
      </div>`;

    case 'learnGerman':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Wortkarte', 'Word card', tone)}
        <div class="card-body">
          <div class="word-card">
            <div class="word-de">der Mietvertrag</div>
            <div class="word-en">the rental contract</div>
          </div>
          <div class="word-card">
            <div class="word-de">die Anmeldung</div>
            <div class="word-en">city registration</div>
          </div>
          <div class="card-note-box">Explanations in your native language</div>
        </div>
      </div>`;

    case 'budget':
      return `<div class="card receipt-card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Study budget worksheet', 'EUR & INR planner', tone)}
        <div class="card-body">
          <div class="currency-row">
            <span class="curr-badge">€ EUR</span>
            <span class="curr-arrow">${ARROW_RIGHT_SVG}</span>
            <span class="curr-badge gold">₹ INR</span>
          </div>
          <div class="receipt-rows">
            <div class="receipt-row"><span>Monthly living costs</span><strong>Your rate</strong></div>
            <div class="receipt-row"><span>Semester contribution</span><strong>Planned</strong></div>
            <div class="receipt-row"><span>One-off setup costs</span><strong>Listed</strong></div>
          </div>
          <div class="receipt-rule"></div>
          <div class="receipt-foot">Saved in your browser only</div>
        </div>
      </div>`;

    case 'sopPlanner':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Five-part SOP outline', 'Structured draft guide', tone)}
        <div class="card-body">
          ${checkRows(['Academic thread', 'Programme fit & modules', 'Projects & context', 'Goals & stock-phrase check'])}
          ${stamp('YOUR OWN WORDS', 'Browser-only draft', '#10182e')}
        </div>
      </div>`;

    case 'germanWords':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Wörterbuch', 'Student glossary', tone)}
        <div class="card-body">
          <div class="word-card compact">
            <div class="word-de">die Immatrikulation</div>
            <div class="word-en">university enrolment</div>
          </div>
          <div class="word-card compact">
            <div class="word-de">das Sperrkonto</div>
            <div class="word-en">blocked bank account</div>
          </div>
          <div class="word-card compact">
            <div class="word-de">der Semesterbeitrag</div>
            <div class="word-en">semester fee</div>
          </div>
        </div>
      </div>`;

    case 'applicationPlan':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Programme tracker', 'Dates & documents', tone)}
        <div class="card-body">
          <div class="plan-row">
            <div><strong>Programme shortlist</strong><span>Application route</span></div>
            <span class="route-tag">Direct</span>
          </div>
          <div class="plan-row">
            <div><strong>Preliminary review</strong><span>Document check</span></div>
            <span class="route-tag gold">uni-assist VPD</span>
          </div>
          <div class="pill-row">
            <span class="mini-pill">Dates</span>
            <span class="mini-pill">Checklist</span>
            <span class="mini-pill">Export</span>
          </div>
        </div>
      </div>`;

    case 'creditMatch':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Modulabgleich', 'Credit matching worksheet', tone)}
        <div class="card-body">
          <div class="map-box">
            <div class="map-col">
              <div class="map-title">Your transcript</div>
              <div class="map-chip">Completed courses</div>
              <div class="map-chip">Subject credits</div>
            </div>
            <div class="map-mid">${ARROW_RIGHT_SVG}</div>
            <div class="map-col">
              <div class="map-title">Programme rules</div>
              <div class="map-chip gold">Required areas</div>
              <div class="map-chip gold">Export / print</div>
            </div>
          </div>
          <div class="card-note-box">The university programme assesses your credits</div>
        </div>
      </div>`;

    case 'arrival':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Ankunft', 'Arrival checklist', tone)}
        <div class="card-body">
          ${checkRows(['Landlord confirmation', 'Anmeldung · city registration', 'Enrolment & bank account', 'Residence permit & work rules'])}
          ${stamp('OFFICIAL LINKS', 'Saved in browser', '#1d7a3d')}
        </div>
      </div>`;

    case 'parents':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Guide for families', 'Plain answers', tone)}
        <div class="card-body">
          ${checkRows(['Public university & visa costs', 'How a blocked account works', 'What mentors help with', 'Written quote & data privacy'])}
        </div>
      </div>`;

    case 'choosingHelp':
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Ask any adviser', 'Checklist before paying', tone)}
        <div class="card-body">
          ${checkRows(['Who writes the SOP?', 'When is the service fee due?', 'Who controls portal logins?', 'Is everything in a written quote?'])}
        </div>
      </div>`;

    case 'privacy':
    default:
      return `<div class="card" style="box-shadow:10px 10px 0 ${tone.shadow}">
        ${cardHead('Privacy commitments', 'Plain summary', tone)}
        <div class="card-body">
          ${checkRows(['No analytics or tracking', 'Browser-only study tools', 'Explicit enquiry consent', 'Ask or delete anytime'])}
        </div>
      </div>`;
  }
}

function renderCardHtml(entry) {
  const tone = TONE_STYLES[entry.imageTone];
  const titleSize = entry.imageTitle.length > 18 ? 68 : 80;
  const rightCard = buildRightCard(entry, tone);
  const highlights = entry.imageHighlights
    .map(
      (item) => `<span class="hl-pill"><span class="hl-dot"></span><span>${esc(item)}</span></span>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @font-face{font-family:Archivo;src:url(data:font/woff2;base64,${archivoLatin}) format('woff2-variations');font-weight:400 900;font-stretch:62% 125%;unicode-range:${LATIN_RANGE}}
  @font-face{font-family:Archivo;src:url(data:font/woff2;base64,${archivoLatinExt}) format('woff2-variations');font-weight:400 900;font-stretch:62% 125%;unicode-range:${LATIN_EXT_RANGE}}
  @font-face{font-family:Hanken;src:url(data:font/woff2;base64,${hankenLatin}) format('woff2-variations');font-weight:400 900;unicode-range:${LATIN_RANGE}}
  @font-face{font-family:Hanken;src:url(data:font/woff2;base64,${hankenLatinExt}) format('woff2-variations');font-weight:400 900;unicode-range:${LATIN_EXT_RANGE}}
  @font-face{font-family:Barlow;src:url(data:font/woff2;base64,${barlow600Latin}) format('woff2');font-weight:600;unicode-range:${LATIN_RANGE}}
  @font-face{font-family:Barlow;src:url(data:font/woff2;base64,${barlow600Ext}) format('woff2');font-weight:600;unicode-range:${LATIN_EXT_RANGE}}
  @font-face{font-family:Barlow;src:url(data:font/woff2;base64,${barlow700Latin}) format('woff2');font-weight:700;unicode-range:${LATIN_RANGE}}
  @font-face{font-family:Barlow;src:url(data:font/woff2;base64,${barlow700Ext}) format('woff2');font-weight:700;unicode-range:${LATIN_EXT_RANGE}}
  @font-face{font-family:Barlow;src:url(data:font/woff2;base64,${barlow800Latin}) format('woff2');font-weight:800;unicode-range:${LATIN_RANGE}}
  @font-face{font-family:Barlow;src:url(data:font/woff2;base64,${barlow800Ext}) format('woff2');font-weight:800;unicode-range:${LATIN_EXT_RANGE}}
  *{box-sizing:border-box}
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;background-color:#10182e;color:#fffdf4;font-family:Hanken,sans-serif}
  body{
    position:relative;
    background-image:radial-gradient(rgba(255,255,255,0.085) 1.5px, transparent 1.5px);
    background-size:24px 24px;
  }
  .canvas{
    position:relative;
    width:1200px;
    height:612px;
    padding:46px 60px;
    display:grid;
    grid-template-columns:626px minmax(0,1fr);
    gap:42px;
    align-items:center;
  }
  .left{display:flex;flex-direction:column;align-items:flex-start;min-width:0}
  .brand-row{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  .badge{width:46px;height:46px;border-radius:50%;border:2.5px solid #fffdf4;object-fit:cover;flex:none}
  .brand{font:900 34px/1 Archivo,sans-serif;letter-spacing:-0.025em;color:#fffdf4}
  .kicker{
    margin-left:6px;
    padding:7px 15px;
    border:2.5px solid #10182e;
    border-radius:999px;
    font:800 17px/1.1 Barlow,sans-serif;
    letter-spacing:0.03em;
    text-transform:uppercase;
    transform:rotate(-2deg);
    box-shadow:4px 4px 0 #050913;
  }
  .rule{width:76px;height:7px;border-radius:3px;background:#f5c400;margin:26px 0 22px}
  h1{
    margin:0;
    font-family:Archivo,sans-serif;
    font-weight:900;
    font-stretch:80%;
    font-size:${titleSize}px;
    line-height:0.95;
    letter-spacing:-0.025em;
    word-spacing:0.12em;
    color:#ffffff;
    max-width:620px;
  }
  .subtitle{
    margin:20px 0 0;
    font:500 28px/1.3 Hanken,sans-serif;
    color:#e3e6ee;
    max-width:590px;
  }
  .highlights{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
  .hl-pill{
    display:inline-flex;
    align-items:center;
    gap:10px;
    padding:10px 16px;
    border:1.5px solid #32406b;
    border-radius:10px;
    background:#1c2643;
    font:700 18px/1.1 Barlow,sans-serif;
    color:#fffdf4;
  }
  .hl-dot{width:9px;height:9px;border-radius:2px;background:#f5c400;flex:none}
  .right{display:flex;align-items:center;justify-content:center;min-width:0}
  .card{
    width:406px;
    background:#fbfaf5;
    color:#10182e;
    border:3px solid #10182e;
    border-radius:18px;
    overflow:hidden;
    transform:rotate(1.6deg);
  }
  .card-head{
    padding:15px 22px;
    border-bottom:2.5px solid #10182e;
    display:flex;
    align-items:baseline;
    justify-content:space-between;
    gap:10px;
  }
  .card-head-title{font:900 23px/1.1 Archivo,sans-serif;font-stretch:84%;letter-spacing:-0.01em;word-spacing:0.1em}
  .card-head-note{font:700 15px/1.1 Barlow,sans-serif;opacity:0.9;white-space:nowrap}
  .card-body{padding:20px 22px 22px;display:flex;flex-direction:column;gap:14px}
  .ribbon{display:grid;grid-template-columns:repeat(6,1fr);height:32px;border:2px solid #10182e;border-radius:8px;overflow:hidden}
  .rib-blk{background:#121212}.rib-red{background:#c4261b}.rib-gld{background:#f5c400}
  .rib-saf{background:#ef8a21}.rib-wht{background:#fffdf4;display:grid;place-items:center}.rib-grn{background:#1d7a3d}
  .check-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:11px}
  .check-list li{display:flex;align-items:center;gap:12px;padding-bottom:9px;border-bottom:1px solid #e2ddd0}
  .check-list li:last-child{padding-bottom:0;border-bottom:0}
  .check-box{width:26px;height:26px;border-radius:6px;background:#ffffff;border:2px solid #10182e;display:grid;place-items:center;flex:none}
  .check-text{font:700 19px/1.2 Barlow,sans-serif;color:#10182e}
  .stamp-wrap{display:flex;justify-content:flex-end;padding-top:2px}
  .stamp{border:3px solid #1d7a3d;border-radius:8px;padding:7px 14px;text-align:center;transform:rotate(-5deg);background:#fffef8}
  .stamp-title{font:900 17px/1 Archivo,sans-serif;letter-spacing:0.04em}
  .stamp-note{margin-top:3px;font:700 13px/1 Barlow,sans-serif}
  .input-trio{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .mini-field{padding:10px 9px;background:#ffffff;border:2px solid #10182e;border-radius:8px;display:flex;flex-direction:column;gap:4px}
  .mini-field.accent{background:#fde98a}
  .mini-field span{font:600 12px/1.1 Barlow,sans-serif;color:#3b4460}
  .mini-field strong{font:800 16px/1.1 Barlow,sans-serif;color:#10182e}
  .flow-arrow{display:flex;justify-content:center;margin:-4px 0}
  .scale-box{padding:12px 14px;background:#ffffff;border:2px solid #10182e;border-radius:10px;display:flex;flex-direction:column;gap:8px}
  .scale-label{font:700 14px/1 Barlow,sans-serif;color:#3b4460}
  .scale-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;text-align:center;font:700 12px/1.2 Barlow,sans-serif}
  .scale-bar span{padding:7px 4px;border-radius:5px;border:1.5px solid #10182e}
  .seg-a{background:#e1f0e4;color:#17692f}.seg-b{background:#fff6cc;color:#10182e}
  .seg-c{background:#efebe2;color:#10182e}.seg-d{background:#fdeedb;color:#8f4700}
  .module-block{padding:13px 15px;background:#ffffff;border:2px solid #10182e;border-radius:10px;display:flex;flex-direction:column;gap:3px}
  .module-tag{align-self:flex-start;padding:2px 9px;border-radius:999px;background:#f5c400;color:#10182e;font:800 12px/1.2 Barlow,sans-serif;text-transform:uppercase}
  .module-tag.red{background:#c4261b;color:#ffffff}
  .module-name{font:900 21px/1.15 Archivo,sans-serif;margin-top:3px}
  .module-sub{font:500 15px/1.25 Hanken,sans-serif;color:#333c56}
  .pill-row{display:flex;flex-wrap:wrap;gap:8px}
  .mini-pill{padding:7px 12px;border:2px solid #10182e;border-radius:999px;background:#ffffff;font:700 15px/1 Barlow,sans-serif;color:#10182e}
  .mini-pill.solid{background:#f5c400}
  .matrix-frame{padding:8px;background:#efebe2;border:2px solid #10182e;border-radius:12px}
  .bubble-stack{display:flex;flex-direction:column;gap:12px}
  .speech-bubble{padding:12px 16px;border:2px solid #10182e;border-radius:14px;display:flex;flex-direction:column;gap:3px;box-shadow:4px 4px 0 #10182e}
  .speech-bubble.yellow{background:#f5c400;color:#10182e}
  .speech-bubble.navy{background:#10182e;color:#fffdf4}
  .speech-bubble.paper{background:#ffffff;color:#10182e}
  .speech-bubble strong{font:900 19px/1.15 Archivo,sans-serif}
  .speech-bubble span{font:600 15px/1.2 Barlow,sans-serif;opacity:0.92}
  .word-card{padding:14px 16px;background:#ffffff;border:2px solid #10182e;border-radius:12px;box-shadow:4px 4px 0 #10182e;display:flex;flex-direction:column;gap:4px}
  .word-card.compact{padding:11px 14px}
  .word-de{font:900 22px/1.15 Archivo,sans-serif;color:#10182e}
  .word-en{font:600 16px/1.2 Hanken,sans-serif;color:#333c56}
  .card-note-box{padding:10px 14px;border:2px dashed #10182e;border-radius:10px;background:#fff6cc;font:700 16px/1.25 Barlow,sans-serif;text-align:center}
  .currency-row{display:flex;align-items:center;justify-content:center;gap:14px}
  .curr-badge{padding:9px 18px;border:2px solid #10182e;border-radius:10px;background:#ffffff;font:900 22px/1 Archivo,sans-serif}
  .curr-badge.gold{background:#f5c400}
  .curr-arrow{display:flex;align-items:center}
  .receipt-rows{display:flex;flex-direction:column;gap:9px;margin-top:4px}
  .receipt-row{display:flex;justify-content:space-between;align-items:baseline;font:600 17px/1.2 Barlow,sans-serif}
  .receipt-row strong{font-weight:800}
  .receipt-rule{border-top:2px dashed #10182e;margin:2px 0}
  .receipt-foot{text-align:center;font:700 16px/1.2 Barlow,sans-serif;color:#333c56}
  .plan-row{padding:12px 14px;background:#ffffff;border:2px solid #10182e;border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:10px}
  .plan-row strong{display:block;font:800 18px/1.15 Barlow,sans-serif}
  .plan-row span{display:block;font:500 14px/1.2 Hanken,sans-serif;color:#3b4460}
  .route-tag{padding:5px 10px;border:2px solid #10182e;border-radius:999px;background:#e1f0e4;color:#17692f;font:800 13px/1 Barlow,sans-serif;white-space:nowrap}
  .route-tag.gold{background:#f5c400;color:#10182e}
  .map-box{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center}
  .map-col{display:flex;flex-direction:column;gap:8px}
  .map-title{font:800 14px/1.1 Barlow,sans-serif;text-transform:uppercase;color:#3b4460}
  .map-chip{padding:9px 10px;border:2px solid #10182e;border-radius:8px;background:#ffffff;font:700 15px/1.2 Barlow,sans-serif}
  .map-chip.gold{background:#fde98a}
  .map-mid{display:flex;align-items:center;justify-content:center;padding-top:18px}
  .band{
    position:absolute;
    bottom:0;left:0;right:0;
    height:18px;
    display:grid;
    grid-template-columns:repeat(6,1fr);
  }
</style>
</head>
<body>
  <div class="canvas">
    <div class="left">
      <div class="brand-row">
        <img class="badge" src="data:image/webp;base64,${badgeWebp}" alt="" />
        <div class="brand">Germandians</div>
        <div class="kicker" style="background:${tone.stickerBg};color:${tone.stickerInk}">${esc(entry.imageKicker)}</div>
      </div>
      <div class="rule"></div>
      <h1>${esc(entry.imageTitle)}</h1>
      <p class="subtitle">${esc(entry.imageSubtitle)}</p>
      <div class="highlights">${highlights}</div>
    </div>
    <div class="right">${rightCard}</div>
  </div>
  <div class="band">
    <div style="background:#121212"></div>
    <div style="background:#c4261b"></div>
    <div style="background:#f5c400"></div>
    <div style="background:#ef8a21"></div>
    <div style="background:#fffdf4"></div>
    <div style="background:#1d7a3d"></div>
  </div>
</body>
</html>`;
}

const browser = await chromium.launch({ channel: process.env.CI ? undefined : 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await mkdir('public/social', { recursive: true });

try {
  for (const entry of PUBLIC_PAGES) {
    await page.setContent(renderCardHtml(entry));
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
    }));
    if (overflow.scrollWidth > 1200 || overflow.scrollHeight > 630) {
      throw new Error(`Card overflow for ${entry.key}: ${overflow.scrollWidth}x${overflow.scrollHeight}`);
    }
    const outPath = `public/${entry.image}`;
    await page.screenshot({ path: outPath });
    const { size } = await stat(outPath);
    if (size > MAX_PNG_BYTES) {
      throw new Error(`${outPath} is ${size} bytes (limit ${MAX_PNG_BYTES} bytes)`);
    }
    console.log(`${outPath}: ${size} bytes`);
  }
} finally {
  await browser.close();
}
