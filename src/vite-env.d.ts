/// <reference types="vite/client" />

interface ImportMetaEnv {
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
