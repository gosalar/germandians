import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { PUBLIC_PAGES } from '../src/utils/publicPages.ts';

// Run after changing the stable preview labels. Local fonts only; no remote assets.
const font = async path => (await readFile(`node_modules/${path}`)).toString('base64');
const archivo = await font('@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2');
const hanken = await font('@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2');
const browser = await chromium.launch({ channel: process.env.CI ? undefined : 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await mkdir('public/social', { recursive: true });
for (const entry of PUBLIC_PAGES) {
  await page.setContent(`<style>
    @font-face{font-family:Archivo;src:url(data:font/woff2;base64,${archivo});font-weight:400 900;font-stretch:62% 125%}
    @font-face{font-family:Hanken;src:url(data:font/woff2;base64,${hanken});font-weight:400 900}
    *{box-sizing:border-box}body{margin:0;background:#f7f5ef;color:#10182e;padding:62px 72px;font-family:Hanken}
    .brand{font:850 46px Archivo;letter-spacing:-2px}.line{width:72px;height:7px;background:#f5c400;margin-top:14px}
    h1{font:900 96px/.98 Archivo;font-stretch:80%;letter-spacing:-3px;word-spacing:.14em;max-width:950px;margin:74px 0 25px}
    p{font-size:32px;margin:0;color:#333c56}.band{position:absolute;bottom:0;left:0;right:0;height:20px;background:linear-gradient(90deg,#10182e 0 33.33%,#c4261b 33.33% 66.66%,#f5c400 66.66%)}
  </style><div class="brand">Germandians</div><div class="line"></div><h1>${entry.imageTitle}</h1><p>${entry.imageSubtitle}</p><div class="band"></div>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/${entry.image}` });
}
await browser.close();
