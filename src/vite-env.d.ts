/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INTAKE_SEASON?: string;
  readonly VITE_INTAKE_YEAR?: string;
  readonly VITE_PRIVACY_NAMES?: string;
  readonly VITE_PRIVACY_ADDRESS?: string;
  readonly VITE_PRIVACY_FORM_SERVICE?: string;
  readonly VITE_PRIVACY_HOSTING_PROVIDER?: string;
  readonly VITE_PRIVACY_RETENTION?: string;
  readonly VITE_PRIVACY_AUTHORITY?: string;
  readonly VITE_FORM_ENDPOINT?: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_FEE_AFTER_ADMISSION?: string;
  readonly VITE_INTAKE_STATUS?: string;
  readonly VITE_SHOW_SEAT_COUNT?: string;
  readonly VITE_SEATS_LEFT?: string;
  readonly VITE_ALLOW_REPAINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
