/**
 * Canonical industry list. These strings are stored verbatim in
 * businesses.industry and are matched exactly elsewhere (e.g. Hospitality
 * navigation visibility in Sidebar.tsx).
 *
 * Do not edit an existing string without migrating stored values first —
 * a rename silently orphans every business already set to the old value.
 */
export const INDUSTRIES = [
  "Salon & Beauty",
  "Spa & Wellness",
  "Fitness & Gym",
  "Home Services",
  "Cleaning Services",
  "Auto Repair",
  "Pet Services",
  "Tutoring & Education",
  "Photography",
  "Events & Catering",
  "Hospitality (Hotels)",
  "Other",
] as const;

export const HOSPITALITY_INDUSTRY = "Hospitality (Hotels)";
