/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public HTTPS origin, without a path, for canonical, sharing and sitemap URLs; default https://gosalar.github.io. */
  readonly VITE_SITE_ORIGIN?: string;
  /** Summer (default) or Winter; winter is displayed as an academic year. */
  readonly VITE_INTAKE_SEASON?: string;
  /** Four-digit starting year, 1000–9999; default 2027. */
  readonly VITE_INTAKE_YEAR?: string;
  /** Registered business name; shown in the privacy note and the footer. */
  readonly VITE_PRIVACY_NAMES?: string;
  /** Business postal address; shown with the name in both places. */
  readonly VITE_PRIVACY_ADDRESS?: string;
  readonly VITE_PRIVACY_HOSTING_PROVIDER?: string;
  readonly VITE_PRIVACY_RETENTION?: string;
  readonly VITE_PRIVACY_AUTHORITY?: string;
  /** International number, 10–15 digits after formatting removal; invalid values open the form. */
  readonly VITE_WHATSAPP_NUMBER?: string;
  /** WhatsApp community invitation (chat.whatsapp.com or whatsapp.com/channel/); invalid values show no join link. */
  readonly VITE_WHATSAPP_COMMUNITY_URL?: string;
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

/**
 * The UX suite's stand-ins for ENQUIRY_ENDPOINTS, set in vite.config.ts for its builds only
 * (tests/ux/build.mjs). Null in every other build, which sends to the endpoints in constants.ts.
 */
declare const __UX_ENQUIRY_ENDPOINTS__: { readonly profileReview: string; readonly germanLessons: string } | null;
