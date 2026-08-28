export const SUPPORTED_LOCALES = [
  { code: "en", name: "English", direction: "ltr" },
  { code: "es", name: "Español", direction: "ltr" },
  { code: "ar", name: "العربية", direction: "rtl" },
  { code: "vi", name: "Tiếng Việt", direction: "ltr" },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]["code"];

export const DEFAULT_LOCALE: SupportedLocale = "en";

const supportedLocaleCodes = new Set<string>(
  SUPPORTED_LOCALES.map(({ code }) => code),
);

export function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return value != null && supportedLocaleCodes.has(value.toLowerCase());
}

export function getBestSupportedLocale(acceptLanguage: string | null | undefined): SupportedLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const candidates = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [language, ...parameters] = part.trim().toLowerCase().split(";");
      const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
      const weight = quality ? Number.parseFloat(quality.trim().slice(2)) : 1;
      return { language, weight: Number.isFinite(weight) ? weight : 0, index };
    })
    .filter(({ language, weight }) => language && language !== "*" && weight > 0)
    .sort((left, right) => right.weight - left.weight || left.index - right.index);

  for (const { language } of candidates) {
    const baseLanguage = language.split("-")[0];
    if (isSupportedLocale(baseLanguage)) return baseLanguage;
  }

  return DEFAULT_LOCALE;
}