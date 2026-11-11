import { spawn } from 'node:child_process';

// Separate, sequential builds keep local settings and Pages artifacts out of UX tests.
for (const variant of ['endpoint', 'email']) {
  await new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', 'build'], {
      shell: process.platform === 'win32',
      stdio: 'inherit',
      env: {
        ...process.env,
        VISUAL_BUILD: '',
        UX_BUILD: variant,
        SITE_BASE_PATH: '/',
        VITE_FORM_ENDPOINT: variant === 'endpoint' ? 'https://enquiries.example.test/profile' : '',
        VITE_WHATSAPP_NUMBER: variant === 'endpoint' ? '4915123456789' : '',
        VITE_PRIVACY_NAMES: '',
        VITE_PRIVACY_ADDRESS: '',
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
