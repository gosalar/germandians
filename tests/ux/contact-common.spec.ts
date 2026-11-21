import { expect, test } from '@playwright/test';

import { PUBLIC_PAGES } from '../../src/utils/publicPages.ts';

// A direct load reports the path with or without a trailing slash, depending on the host.
for (const path of ['/check', '/check/', '/requirements', '/requirements/']) {
  test(`header contact links stay on the page when ${path} is loaded directly`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    const nav = page.locator('nav').first();
    const review = nav.getByRole('link', { name: 'Get my profile reviewed', exact: true });
    await expect(review).toHaveAttribute('href', '#contact-form');
    await expect(nav.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', '#contact');
    // Sections that only Home has still lead there.
    await expect(nav.getByRole('link', { name: 'Fees', exact: true })).toHaveAttribute('href', '/#fees');
    await review.click();
    await expect(page.locator('#contact-form')).toBeInViewport();
    expect(new URL(page.url()).pathname).toBe(path);
  });
}

for (const path of ['/', '/check', '/requirements']) for (const width of [390, 1440]) {
  test(`contact destinations and visibility ${path} at ${width}`, async ({ page }, testInfo) => {
    const configured = testInfo.project.name === 'endpoint';
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
    const actionBar = page.locator('a').filter({ hasText: configured ? /^WhatsApp us$/ : /^Open review form$/ });
    await expect(page.locator('#contact').getByRole('link', { name: /Instagram/ })).toHaveAttribute('href', 'https://instagram.com/germandians');
    if (configured) {
      const links = page.locator('a[href^="https://wa.me/"]');
      expect(await links.count()).toBe(2);
      for (const link of await links.all()) {
        const url = new URL((await link.getAttribute('href'))!);
        expect(url.pathname).toBe('/4915123456789');
        expect(url.searchParams.get('text')).toBe("Hi Germandians, I'd like a profile review.");
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', 'noopener');
      }
    } else {
      await expect(page.getByRole('link', { name: /WhatsApp/ })).toHaveCount(0);
      await expect(page.locator('#contact').getByRole('link', { name: /Profile review/ })).toHaveAttribute('href', '#contact-form');
    }
    if (width === 390) {
      if (path === '/') {
        await expect(actionBar).not.toBeVisible();
        await page.locator('#journey').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
      } else if (path === '/requirements') {
        // Like Home, the bar waits while the opening's buttons are on screen.
        await expect(actionBar).not.toBeVisible();
        await page.locator('#guide').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
      } else {
        await page.locator('#check-score').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
      }
      await expect(actionBar).toBeVisible();
      await page.locator('nav').getByRole('button', { name: 'Menu', exact: true }).click();
      await expect(actionBar).not.toBeVisible();
      await page.locator('nav').getByRole('button', { name: 'Close', exact: true }).click();
      if (!configured) {
        await actionBar.click();
        await expect(page.locator('#contact-form')).toBeInViewport();
      }
    }
    await page.locator('#f-name').focus();
    await page.locator('#f-name').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(actionBar).not.toBeVisible();
    await page.locator('footer').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(actionBar).not.toBeVisible();
  });
}

for (const path of [...PUBLIC_PAGES.map((page) => page.path), '/not-a-real-page']) {
  test(`no console errors or hydration warnings ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && !message.text().includes('404 (Not Found)')) errors.push(message.text());
      if (/hydrat/i.test(message.text())) errors.push(message.text());
    });
    await page.goto(path);
    await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
    expect(errors).toEqual([]);
  });
}

test('the footer and privacy note name the business only when it is configured', async ({ page }, testInfo) => {
  const operator = 'Test Operator Example, Test Street 1, 00000 Testville';
  for (const path of ['/', '/check', '/requirements']) {
    await page.goto(path);
    const footer = page.locator('footer');
    // The year is fixed when the site is built; the suite builds it moments before it runs.
    await expect(footer).toContainText(`© ${new Date().getFullYear()} Germandians`);
    if (testInfo.project.name === 'endpoint') {
      await expect(footer.getByTestId('business-operator')).toHaveText(`Operated by ${operator}`);
    } else {
      await expect(footer.getByTestId('business-operator')).toHaveCount(0);
      await expect(footer).not.toContainText('Operated by');
    }
  }
  await page.goto('/privacy');
  if (testInfo.project.name === 'endpoint') {
    await expect(page.locator('main')).toContainText(`Germandians is operated by ${operator}.`);
  } else {
    await expect(page.locator('main')).not.toContainText('operated by');
  }
});

test('production privacy text follows configuration and transport without placeholders or broken punctuation', async ({ page }, testInfo) => {
  const configured = testInfo.project.name === 'endpoint';
  await page.goto('/privacy');
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
  const main = page.getByRole('main');
  const section = (name: string) =>
    main.locator('section').filter({ has: page.getByRole('heading', { level: 2, name, exact: true }) });

  await expect(main).not.toContainText(/\[|\]|,\s*\.|\s+\.|\bwithin\s+of\b|\bfor example\s*\./);
  await expect(main).toContainText('any email address you choose to provide');
  await expect(main).toContainText('Unanswered questions are omitted');
  await expect(main).toContainText(/Last updated \d{1,2} \w+ \d{4}/);

  const responsible = section('Who is responsible');
  await expect(responsible.getByRole('link', { name: 'thegermandians@gmail.com' })).toHaveAttribute(
    'href',
    'mailto:thegermandians@gmail.com',
  );
  if (configured) {
    await expect(responsible.locator('p').first()).toHaveText(
      'Germandians is operated by Test Operator Example, Test Street 1, 00000 Testville.',
    );
  } else {
    await expect(responsible.locator('p')).toHaveCount(1);
    await expect(responsible).not.toContainText(/operated by|Postal address|Test Operator Example|Test Street 1/i);
  }

  const collect = section('What we collect');
  await expect(collect).toContainText(
    'To coordinate open tabs, the page stores a small browser-local sync record with no note text, and keeps a temporary recovery copy in your browser while a multi-tab edit conflict is unresolved.',
  );
  await expect(collect).toContainText(
    'Choosing “Clear my entries” removes your outline and any recovery copy from your browser.',
  );
  if (configured) {
    await expect(collect).toContainText(
      'When a form sends to our Google Sheets, it also sends a random technical submission ID stored alongside your enquiry so a retry does not create a duplicate row.',
    );
  } else {
    await expect(collect).not.toContainText(/submission ID|Google Sheets/i);
  }

  const handlers = section('Who else handles it');
  if (configured) {
    await expect(handlers).toContainText('Google receives the forms you send on this site and keeps them in our Google Sheets.');
    await expect(handlers).not.toContainText('opens an email draft');
    await expect(handlers).toContainText(
      'Test Hosting Provider Example hosts this site and keeps short technical logs, such as IP addresses and access times, to keep it running.',
    );
  } else {
    await expect(handlers).toContainText('The form opens an email draft addressed to us. Nothing is sent until you press send in your email app');
    await expect(handlers).not.toContainText(/Google Sheets|hosts this site|Test Hosting Provider Example/i);
  }

  const retention = section('How long we keep it');
  if (configured) {
    await expect(retention.locator('p')).toHaveText(
      "If we don't end up working together, we delete your details within 30 test days of your last message. If we do, we keep them for as long as we're helping you, plus any period the law requires.",
    );
  } else {
    await expect(retention.locator('p')).toHaveText(
      "We keep the details you send us for as long as we're helping you, plus any period the law requires.",
    );
    await expect(retention).not.toContainText('30 test days');
  }

  const rights = section('Your rights');
  if (configured) {
    await expect(rights.locator('p').last()).toHaveText(
      'You can also complain to a data protection authority, for example Test Data Protection Authority.',
    );
  } else {
    await expect(rights.locator('p').last()).toHaveText(
      'You can also complain to a data protection authority.',
    );
    await expect(rights).not.toContainText(/for example|Test Data Protection Authority/i);
  }
});

test('the community page offers a WhatsApp join link only when an invitation is configured', async ({ page }, testInfo) => {
  await page.goto('/community');
  const main = page.getByRole('main');
  for (const link of await main.locator('a[target="_blank"]').all()) await expect(link).toHaveAttribute('rel', 'noopener');
  await expect(main.getByRole('link', { name: 'Follow @germandians on Instagram' })).toHaveAttribute('href', 'https://instagram.com/germandians');
  if (testInfo.project.name === 'endpoint') {
    const join = main.getByRole('link', { name: 'Join the WhatsApp community' });
    await expect(join).toHaveAttribute('href', 'https://chat.whatsapp.com/GermandiansTestInvite');
    await expect(join).toHaveAttribute('target', '_blank');
  } else {
    await expect(main.locator('a[href*="chat.whatsapp.com"], a[href*="whatsapp.com/channel"]')).toHaveCount(0);
    await expect(main).not.toContainText(/join the whatsapp/i);
    await expect(main.getByRole('link', { name: 'Ask about the WhatsApp community on Instagram' })).toHaveAttribute('href', 'https://instagram.com/germandians');
  }
});
