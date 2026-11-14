import { expect, test, type Page } from '@playwright/test';

const CHARGES = 'Additional charges may apply.';
const CERTIFICATE = 'We do not provide a certificate for these lessons.';

async function ready(page: Page) {
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
}

test('home sections lead to the about, community and German pages', async ({ page }) => {
  const visits = [
    { section: '#story', link: 'More about us', path: '/about', heading: 'About us' },
    { section: '#community', link: 'Explore the community', path: '/community', heading: 'Our community' },
    { section: '#learn-german', link: 'How German lessons work', path: '/learn-german', heading: 'Learn German' },
  ];
  for (const visit of visits) {
    await page.goto('/');
    await ready(page);
    await page.locator(visit.section).getByRole('link', { name: visit.link, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${visit.path}/?$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(visit.heading);
    await expect(page.getByRole('main')).toHaveCount(1);
  }
});

for (const path of ['/about', '/community', '/learn-german']) for (const suffix of ['', '/']) {
  test(`${path}${suffix} loads directly, and its contact actions open the form on Home`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${path}${suffix}`);
    await ready(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('#top')).toHaveCount(1);
    const nav = page.locator('nav').first();
    // This page has no form, so the header's contact links route to Home's.
    await expect(nav.getByRole('link', { name: 'Get my profile reviewed', exact: true })).toHaveAttribute('href', '/#contact-form');
    await expect(nav.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', '/#contact');
    await page.getByRole('main').getByRole('link', { name: 'Get my profile reviewed', exact: true }).first().click();
    await expect(page).toHaveURL(/\/#contact-form$/);
    await expect(page.locator('#contact-form')).toBeInViewport();
  });
}

test('the About group opens by pointer and keyboard and closes on Escape, outside clicks and navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/check');
  await ready(page);
  const trigger = page.locator('nav').getByRole('button', { name: 'About', exact: true });
  const panel = page.locator(`#${await trigger.getAttribute('aria-controls')}`);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel.getByRole('link')).toHaveText(['About us', 'Community']);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(panel).toBeVisible();
  await page.getByRole('heading', { level: 1 }).click();
  await expect(panel).toBeHidden();

  // Tabbing past the group closes it.
  await trigger.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await expect(panel.getByRole('link', { name: 'About us' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(panel).toBeHidden();

  await trigger.click();
  await panel.getByRole('link', { name: 'Community' }).click();
  await expect(page).toHaveURL(/\/community\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our community');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');

  // A page change the group's own links didn't make (here, Back) closes it too.
  await trigger.click();
  await expect(panel).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/check\/?$/);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();
});

test('the phone menu lists the group under its label and closes after navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await ready(page);
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  const menu = page.locator('#mobile-menu');
  await expect(menu.getByRole('group', { name: 'About' }).getByRole('link')).toHaveText(['About us', 'Community']);
  await menu.getByRole('link', { name: 'Learn German', exact: true }).click();
  await expect(page).toHaveURL(/\/learn-german\/?$/);
  await expect(menu).toHaveCount(0);
});

test('German lessons have their own form, with the terms beside it, sent as a lessons enquiry', async ({ page }) => {
  await page.goto('/');
  const intro = page.locator('#learn-german');
  for (const terms of [CHARGES, CERTIFICATE]) await expect(intro.getByText(terms, { exact: true })).toBeVisible();
  await expect(intro.getByRole('link', { name: 'How German lessons work' })).toHaveAttribute('href', '/learn-german');

  let count = 0;
  let payload: Record<string, unknown> = {};
  await page.route('https://enquiries.example.test/profile', async (route) => {
    count++;
    payload = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"received":true}' });
  });
  await page.goto('/learn-german');
  await ready(page);
  const main = page.getByRole('main');
  const form = page.locator('#german-lessons-form');
  for (const terms of [CHARGES, CERTIFICATE]) await expect(form).toContainText(terms);

  // Required answers are checked in order, and focus moves to the first one missing.
  const send = form.getByRole('button', { name: 'Send my enquiry', exact: true });
  await send.click();
  await expect(page.locator('#g-name')).toBeFocused();
  await page.locator('#g-name').fill('Test visitor');
  await page.locator('#g-wa').fill('+91 9876543210');
  await send.click();
  await expect(page.locator('#g-language')).toBeFocused();
  await page.locator('#g-language').fill('Test language');
  await page.locator('#g-purpose').fill('University');
  await send.click();
  await expect(page.locator('#g-consent')).toBeFocused();
  await page.locator('#g-consent').check();
  await send.click();
  await expect(form.getByRole('status')).toContainText('Received. An admin will message you on WhatsApp.');
  expect(count).toBe(1);
  expect(payload).toMatchObject({
    enquiry: 'german-lessons',
    name: 'Test visitor',
    whatsapp: '+91 9876543210',
    language: 'Test language',
    purpose: 'University',
    consent: true,
    source: 'germandians-website',
  });
  for (const blank of ['email', 'experience', 'snapshot']) expect(payload).not.toHaveProperty(blank);

  // The word cards turn over, and turn back.
  const word = main.getByRole('button', { name: /Mensa/ });
  await expect(word).toHaveAttribute('aria-pressed', 'false');
  await word.click();
  await expect(word).toHaveAttribute('aria-pressed', 'true');
  await word.click();
  await expect(word).toHaveAttribute('aria-pressed', 'false');
  // Language enquiries are not routed to the admissions form or WhatsApp.
  await expect(main.locator('#contact-form')).toHaveCount(0);
  await expect(main.locator('a[href*="wa.me"], a[href*="whatsapp"]')).toHaveCount(0);
  await expect(main).not.toContainText(/\b(A1|B2|C1|Goethe|telc|free lessons?)\b/i);
});

test('About portraits open a profile sheet that closes by Escape, its button and the backdrop', async ({ page }) => {
  await page.goto('/about');
  await ready(page);
  await expect(page.getByRole('main')).not.toContainText(/lorem|coming soon|placeholder|test profile/i);
  const team = page.getByRole('heading', { level: 2, name: 'Meet the team' });
  const portraits = page.locator('li[id^="team-"] > button');
  if (!(await team.count())) {
    await expect(portraits).toHaveCount(0);
    return;
  }
  await expect(team).not.toHaveText(/\d/);

  const portrait = portraits.first();
  const name = (await portrait.getAttribute('aria-label'))!.replace('Open the profile of ', '');
  expect(name).toMatch(/\S/);
  const dialog = page.getByRole('dialog', { name });
  const close = dialog.getByRole('button', { name: /Schließen/ });

  await portrait.click();
  await expect(dialog).toBeVisible();
  await expect(close).toBeFocused();
  // A stand-in says what it is; a real profile describes its photo by name.
  const standIn = (await page.locator('li[id^="team-"]').first().getAttribute('data-stand-in')) !== null;
  await expect(dialog.getByRole('img')).toHaveAccessibleName(standIn ? /^Stand-in portrait: a \w+/ : /\S/);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(portrait).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await close.click();
  await expect(dialog).toBeHidden();
  await expect(portrait).toBeFocused();

  await portrait.click();
  await page.mouse.click(4, 4);
  await expect(dialog).toBeHidden();
});
