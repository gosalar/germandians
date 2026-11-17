/**
 * The web apps the UX suite's endpoint build sends enquiries to, in place of ENQUIRY_ENDPOINTS. They are
 * shaped like real Apps Script URLs so the build accepts them, but neither deployment exists, and every
 * spec that sends a form intercepts them. The email build gets none.
 */
export const UX_ENDPOINTS = {
  profileReview: 'https://script.google.com/macros/s/germandians-ux-test-profile-review/exec',
  germanLessons: 'https://script.google.com/macros/s/germandians-ux-test-german-lessons/exec',
} as const;
