/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INTAKE_SEASON?: string;
  readonly VITE_INTAKE_YEAR?: string;
  /** Registered responsible business identity. */
  readonly VITE_PRIVACY_NAMES?: string;
  readonly VITE_PRIVACY_ADDRESS?: string;
  readonly VITE_PRIVACY_FORM_SERVICE?: string;
  readonly VITE_PRIVACY_HOSTING_PROVIDER?: string;
  readonly VITE_PRIVACY_RETENTION?: string;
  readonly VITE_PRIVACY_AUTHORITY?: string;
  /** Public HTTPS endpoint: requires 2xx JSON { received: true }; invalid values use email. */
  readonly VITE_FORM_ENDPOINT?: string;
  /** International number, 10–15 digits after formatting removal; invalid values open the form. */
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_FEE_AFTER_ADMISSION?: string;
  readonly VITE_INTAKE_STATUS?: string;
  readonly VITE_SHOW_SEAT_COUNT?: string;
  readonly VITE_SEATS_LEFT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
