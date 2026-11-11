import { CONTACT, INTAKE_SEATS, INTAKE_STATUSES, SECTIONS, hashLink, type IntakeStatus } from '@/utils/constants';
import { toFormEndpoint, toWhatsAppNumber } from './contactSettings';

/**
 * Editable site settings. These were the design's "props" panel; here they
 * come from `config/.env*` (see `config/.env.example`). Defaults match the design.
 */
const env = import.meta.env;

const text = (value: string | undefined) => String(value ?? '').trim();

const toIntakeStatus = (value: string): IntakeStatus =>
  (INTAKE_STATUSES as readonly string[]).includes(value) ? (value as IntakeStatus) : 'Not confirmed';

const toSeats = (value: string) => {
  const n = Number(value);
  return value !== '' && Number.isFinite(n) ? Math.max(0, Math.min(INTAKE_SEATS, Math.round(n))) : INTAKE_SEATS;
};

const whatsappDigits = toWhatsAppNumber(env.VITE_WHATSAPP_NUMBER);
const intakeSeason = text(env.VITE_INTAKE_SEASON) === 'Winter' ? 'Winter' : 'Summer';
const intakeYear = /^[1-9]\d{3}$/.test(text(env.VITE_INTAKE_YEAR)) ? text(env.VITE_INTAKE_YEAR) : '2027';

export const privacyConfig = {
  names: text(env.VITE_PRIVACY_NAMES),
  address: text(env.VITE_PRIVACY_ADDRESS),
  formService: text(env.VITE_PRIVACY_FORM_SERVICE),
  hostingProvider: text(env.VITE_PRIVACY_HOSTING_PROVIDER),
  retention: text(env.VITE_PRIVACY_RETENTION),
  authority: text(env.VITE_PRIVACY_AUTHORITY),
  showPlaceholders: env.DEV || env.MODE === 'visual',
} as const;

export const siteConfig = {
  formEndpoint: toFormEndpoint(env.VITE_FORM_ENDPOINT),
  feeAfterAdmission: text(env.VITE_FEE_AFTER_ADMISSION),
  intakeStatus: toIntakeStatus(text(env.VITE_INTAKE_STATUS)),
  intake: `${intakeSeason} ${intakeYear}`,
  showSeatCount: text(env.VITE_SHOW_SEAT_COUNT) === 'true',
  seatsLeft: toSeats(text(env.VITE_SEATS_LEFT)),
} as const;

/** WhatsApp link, or a jump to the form when no number is configured. */
export const whatsapp = whatsappDigits
  ? {
      href: `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(CONTACT.whatsappGreeting)}`,
      target: '_blank',
      label: `+${whatsappDigits}`,
      channelName: 'WhatsApp',
      actionLabel: 'WhatsApp us',
    }
  : { href: hashLink(SECTIONS.contactForm), target: '_self', label: 'Use the form', channelName: 'Profile review', actionLabel: 'Open review form' };
