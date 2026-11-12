/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Summer (default) or Winter; winter is displayed as an academic year. */
  readonly VITE_INTAKE_SEASON?: string;
  /** Four-digit starting year, 1000–9999; default 2027. */
  readonly VITE_INTAKE_YEAR?: string;
  /** Registered business name; shown in the privacy note and the footer. */
  readonly VITE_PRIVACY_NAMES?: string;
  /** Business postal address; shown with the name in both places. */
  readonly VITE_PRIVACY_ADDRESS?: string;
  readonly VITE_PRIVACY_FORM_SERVICE?: string;
  readonly VITE_PRIVACY_HOSTING_PROVIDER?: string;
  readonly VITE_PRIVACY_RETENTION?: string;
  readonly VITE_PRIVACY_AUTHORITY?: string;
  /** Public HTTPS endpoint: requires 2xx JSON { received: true }; invalid values use email. */
  readonly VITE_FORM_ENDPOINT?: string;
  /** International number, 10–15 digits after formatting removal; invalid values open the form. */
  readonly VITE_WHATSAPP_NUMBER?: string;
  /** Advertised fee; quote confirms payment timing and exceptions. */
  readonly VITE_FEE_AFTER_ADMISSION?: string;
  readonly VITE_INTAKE_STATUS?: string;
  readonly VITE_SHOW_SEAT_COUNT?: string;
  readonly VITE_SEATS_LEFT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Four-digit year the site was built in, set in vite.config.ts. */
declare const __BUILD_YEAR__: string;
