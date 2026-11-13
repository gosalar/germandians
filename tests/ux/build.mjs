import { spawn } from 'node:child_process';

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
        VITE_FORM_ENDPOINT: variant === 'endpoint' ? 'https://enquiries.example.test/profile' : '',
        VITE_WHATSAPP_NUMBER: variant === 'endpoint' ? '4915123456789' : '',
        // Fictitious identity: the endpoint variant shows the footer and privacy note with it set.
        VITE_PRIVACY_NAMES: variant === 'endpoint' ? 'Test Operator Example' : '',
        VITE_PRIVACY_ADDRESS: variant === 'endpoint' ? 'Test Street 1, 00000 Testville' : '',
        VITE_PRIVACY_HOSTING_PROVIDER: '',
        VITE_PRIVACY_RETENTION: '',
        VITE_PRIVACY_AUTHORITY: '',
        VITE_PRIVACY_FORM_SERVICE: variant === 'endpoint' ? 'Test enquiry receiver' : '',
      },
    });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`UX ${variant} build exited ${code}`)));
  });
}
