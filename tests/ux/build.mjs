import { spawn } from 'node:child_process';

import { UX_ENDPOINTS } from './endpoints.ts';

// Separate, sequential builds keep local settings and Pages artifacts out of UX tests.
for (const variant of ['endpoint', 'email']) {
  await new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', 'build'], {
      shell: process.platform === 'win32',
      stdio: 'inherit',
      env: {
        ...process.env,
        UX_BUILD: variant,
        SITE_BASE_PATH: '/',
        VITE_SITE_ORIGIN: variant === 'endpoint' ? 'https://germandians.example.test' : 'invalid-origin',
        VITE_INTAKE_SEASON: variant === 'endpoint' ? 'Winter' : 'Summer',
        VITE_INTAKE_YEAR: '2027',
        VITE_FEE_AFTER_ADMISSION: variant === 'endpoint' ? 'Test quote' : '',
        VITE_INTAKE_STATUS: 'Not confirmed',
        VITE_SHOW_SEAT_COUNT: 'false',
        VITE_SEATS_LEFT: '',
        // Read by vite.config.ts in UX builds only: fictitious web apps, or none, never the real sheets.
        UX_ENQUIRY_ENDPOINTS: JSON.stringify(variant === 'endpoint' ? UX_ENDPOINTS : {}),
        VITE_WHATSAPP_NUMBER: variant === 'endpoint' ? '4915123456789' : '',
        // Fictitious invitation; tests read the link and never open it.
        VITE_WHATSAPP_COMMUNITY_URL: variant === 'endpoint' ? 'https://chat.whatsapp.com/GermandiansTestInvite' : '',
        // Fictitious privacy details: the endpoint variant exercises all configured clauses; email stays empty for fallback.
        VITE_PRIVACY_NAMES: variant === 'endpoint' ? 'Test Operator Example' : '',
        VITE_PRIVACY_ADDRESS: variant === 'endpoint' ? 'Test Street 1, 00000 Testville' : '',
        VITE_PRIVACY_HOSTING_PROVIDER: variant === 'endpoint' ? 'Test Hosting Provider Example' : '',
        VITE_PRIVACY_RETENTION: variant === 'endpoint' ? '30 test days' : '',
        VITE_PRIVACY_AUTHORITY: variant === 'endpoint' ? 'Test Data Protection Authority' : '',
      },
    });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`UX ${variant} build exited ${code}`)));
  });
}
