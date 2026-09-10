import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { hashRegistrationToken } from "@/lib/registration/token";
import { GuestRegistrationForm } from "@/components/hospitality/GuestRegistrationForm";
import {
  getBestSupportedLocale,
  isSupportedLocale,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RegistrationResolution = {
  status: "valid" | "expired" | "completed" | "invalid";
  guest_first_name: string | null;
  guest_last_initial: string | null;
  property_name: string | null;
  arrival_date: string | null;
  departure_date: string | null;
  expires_at: string | null;
  preferred_language: string | null;
};

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};

const COPY = {
  en: {
    title: "Guest registration",
    greeting: "Welcome, {name}",
    registrationReady: "Registration ready",
    readyMessage: "Review your stay details and complete your registration below.",
    arrival: "Arrival",
    departure: "Departure",
    expired: "This registration link has expired. Please contact the front desk for a new link.",
    completed: "Registration has already been completed for this link.",
    invalid: "This registration link is invalid or no longer available.",
    languages: "Language",
    details: "Your information",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    consent: "I confirm that the information above is accurate and I consent to submit this registration electronically.",
    signature: "Electronic signature",
    signatureHelp: "Type your full legal name. This will be stored with the submission timestamp.",
    submit: "Complete registration",
    submitting: "Submitting…",
    success: "Registration complete. The front desk has received your information.",
    error: "Registration could not be completed. Please ask the front desk for help.",
  },
  es: {
    title: "Registro de huésped",
    greeting: "Bienvenido, {name}",
    registrationReady: "Registro listo",
    readyMessage: "Revise los detalles de su estancia y complete su registro a continuación.",
    arrival: "Llegada",
    departure: "Salida",
    expired: "Este enlace de registro ha caducado. Contacte con recepción para obtener uno nuevo.",
    completed: "El registro ya se completó con este enlace.",
    invalid: "Este enlace de registro no es válido o ya no está disponible.",
    languages: "Idioma",
    details: "Su información",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo electrónico",
    phone: "Teléfono",
    address: "Dirección",
    consent: "Confirmo que la información anterior es correcta y doy mi consentimiento para enviar este registro electrónicamente.",
    signature: "Firma electrónica",
    signatureHelp: "Escriba su nombre legal completo. Se guardará con la fecha y hora del envío.",
    submit: "Completar registro",
    submitting: "Enviando…",
    success: "Registro completado. La recepción ha recibido su información.",
    error: "No se pudo completar el registro. Solicite ayuda en recepción.",
  },
  ar: {
    title: "تسجيل النزيل",
    greeting: "مرحبًا، {name}",
    registrationReady: "التسجيل جاهز",
    readyMessage: "راجع تفاصيل إقامتك وأكمل التسجيل أدناه.",
    arrival: "الوصول",
    departure: "المغادرة",
    expired: "انتهت صلاحية رابط التسجيل. يرجى التواصل مع مكتب الاستقبال للحصول على رابط جديد.",
    completed: "تم إكمال التسجيل باستخدام هذا الرابط.",
    invalid: "رابط التسجيل هذا غير صالح أو لم يعد متاحًا.",
    languages: "اللغة",
    details: "معلوماتك",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    address: "العنوان",
    consent: "أؤكد أن المعلومات أعلاه صحيحة وأوافق على إرسال هذا التسجيل إلكترونيًا.",
    signature: "التوقيع الإلكتروني",
    signatureHelp: "اكتب اسمك القانوني الكامل. سيتم حفظه مع وقت إرسال التسجيل.",
    submit: "إكمال التسجيل",
    submitting: "جارٍ الإرسال…",
    success: "اكتمل التسجيل. استلم مكتب الاستقبال معلوماتك.",
    error: "تعذر إكمال التسجيل. يرجى طلب المساعدة من مكتب الاستقبال.",
  },
  vi: {
    title: "Đăng ký khách lưu trú",
    greeting: "Chào mừng, {name}",
    registrationReady: "Đã sẵn sàng đăng ký",
    readyMessage: "Vui lòng xem lại thông tin lưu trú và hoàn tất đăng ký bên dưới.",
    arrival: "Ngày đến",
    departure: "Ngày rời đi",
    expired: "Liên kết đăng ký này đã hết hạn. Vui lòng liên hệ quầy lễ tân để nhận liên kết mới.",
    completed: "Đăng ký đã được hoàn tất bằng liên kết này.",
    invalid: "Liên kết đăng ký này không hợp lệ hoặc không còn khả dụng.",
    languages: "Ngôn ngữ",
    details: "Thông tin của bạn",
    firstName: "Tên",
    lastName: "Họ",
    email: "Email",
    phone: "Số điện thoại",
    address: "Địa chỉ",
    consent: "Tôi xác nhận thông tin trên là chính xác và đồng ý gửi đăng ký này bằng phương thức điện tử.",
    signature: "Chữ ký điện tử",
    signatureHelp: "Nhập đầy đủ họ tên pháp lý của bạn. Thông tin này sẽ được lưu cùng thời gian gửi.",
    submit: "Hoàn tất đăng ký",
    submitting: "Đang gửi…",
    success: "Đăng ký đã hoàn tất. Lễ tân đã nhận được thông tin của bạn.",
    error: "Không thể hoàn tất đăng ký. Vui lòng yêu cầu lễ tân hỗ trợ.",
  },
} satisfies Record<SupportedLocale, Record<string, string>>;

function isRegistrationToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(value);
}

/**
 * First name plus last initial. The abbreviating period is a Latin
 * convention, so Arabic omits it. Returns the empty string when there is no
 * name, which the greeting template tolerates.
 */
function formatGuestName(
  firstName: string | null,
  lastInitial: string | null,
  locale: SupportedLocale,
): string {
  const first = firstName?.trim() ?? "";
  const initial = lastInitial?.trim() ?? "";
  if (!first) return "";
  if (!initial) return first;
  return locale === "ar" ? `${first} ${initial}` : `${first} ${initial}.`;
}

function formatDate(value: string | null, locale: SupportedLocale): string {
  if (!value) return "";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/**
 * Locked precedence: ?lang= -> reservation override -> guest preference ->
 * Accept-Language -> en.
 *
 * The middle two arrive collapsed as one value from the resolver, which
 * coalesces reservations.preferred_language_override over
 * guests.preferred_language. Accept-Language sits below stored preference
 * because a guest's recorded language is a stronger signal than the phone
 * they happen to be holding; it sits above the hardcoded default because a
 * browser hint beats guessing English.
 *
 * Every candidate is validated against LOCALES, so an unsupported value
 * (including anything the database returns) falls through rather than
 * rendering a locale that has no copy.
 */
function selectLocale(
  value: string | string[] | undefined,
  preferredLanguage: string | null,
  acceptLanguage: string | null,
): SupportedLocale {
  const explicit = Array.isArray(value) ? value[0] : value;
  if (isSupportedLocale(explicit)) return explicit.toLowerCase() as SupportedLocale;

  const stored = preferredLanguage?.trim().toLowerCase().split("-")[0];
  if (isSupportedLocale(stored)) return stored as SupportedLocale;

  return getBestSupportedLocale(acceptLanguage);
}

export default async function RegistrationPage({ params, searchParams }: PageProps) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  const requestHeaders = await headers();

  let resolution: RegistrationResolution = {
    status: "invalid",
    guest_first_name: null,
    guest_last_initial: null,
    property_name: null,
    arrival_date: null,
    departure_date: null,
    expires_at: null,
    preferred_language: null,
  };

  if (isRegistrationToken(token)) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("resolve_registration_link", {
      p_token_hash: hashRegistrationToken(token),
    });
    const result = Array.isArray(data) ? data[0] : data;
    if (result && typeof result === "object" && "status" in result) {
      resolution = result as RegistrationResolution;
    }
  }

  // Resolution comes first: the guest's stored language is one of the locale
  // candidates, so the token has to be resolved before the page can decide
  // which language to render in.
  const locale = selectLocale(
    query.lang,
    resolution.preferred_language,
    requestHeaders.get("accept-language"),
  );
  const direction = SUPPORTED_LOCALES.find((item) => item.code === locale)?.direction ?? "ltr";
  const copy = COPY[locale];

  return (
    <div lang={locale} dir={direction} className="min-h-screen bg-charcoal-50 text-charcoal-900">
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-6 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between border-b border-charcoal-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">CUE</p>
            <p className="mt-1 text-sm text-charcoal-500">{copy.title}</p>
          </div>
          <nav aria-label={copy.languages} className="flex gap-1 text-xs font-semibold">
            {SUPPORTED_LOCALES.map(({ code }) => (
              <a
                key={code}
                href={`?lang=${code}`}
                className={`rounded-md px-2 py-1.5 ${locale === code ? "bg-charcoal-900 text-white" : "text-charcoal-500 hover:bg-gold-50 hover:text-charcoal-900"}`}
              >
                {code.toUpperCase()}
              </a>
            ))}
          </nav>
        </header>

        <section className="flex flex-1 flex-col justify-center py-12">
          {resolution.status === "valid" ? (
            <div className="border border-gold-200 bg-white p-6 shadow-card sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-700">{copy.registrationReady}</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-charcoal-900 sm:text-4xl">
                {copy.greeting.replace("{name}", formatGuestName(resolution.guest_first_name, resolution.guest_last_initial, locale))}
              </h1>
              <p className="mt-3 text-lg text-charcoal-600">{resolution.property_name}</p>
              <p className="mt-6 text-charcoal-600">{copy.readyMessage}</p>
              <dl className="mt-8 grid gap-4 border-t border-charcoal-100 pt-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-charcoal-500">{copy.arrival}</dt>
                  <dd className="mt-1 font-medium text-charcoal-900">{formatDate(resolution.arrival_date, locale)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-charcoal-500">{copy.departure}</dt>
                  <dd className="mt-1 font-medium text-charcoal-900">{formatDate(resolution.departure_date, locale)}</dd>
                </div>
              </dl>

              <GuestRegistrationForm
                token={token}
                locale={locale}
                copy={{
                  details: copy.details,
                  firstName: copy.firstName,
                  lastName: copy.lastName,
                  email: copy.email,
                  phone: copy.phone,
                  address: copy.address,
                  consent: copy.consent,
                  signature: copy.signature,
                  signatureHelp: copy.signatureHelp,
                  submit: copy.submit,
                  submitting: copy.submitting,
                  success: copy.success,
                  error: copy.error,
                }}
                // Only the given name is pre-filled. Surname and contact details
                // are typed by the guest: the resolver no longer returns them,
                // because anyone holding a forwarded link would otherwise read
                // the guest's home address, email and phone just by opening it.
                initial={{
                  firstName: resolution.guest_first_name ?? "",
                  lastName: "",
                  email: "",
                  phone: "",
                  address: "",
                }}
              />
            </div>
          ) : (
            <div className="border border-charcoal-100 bg-white p-6 shadow-card sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-700">{copy.title}</p>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-charcoal-900 sm:text-3xl">
                {copy[resolution.status]}
              </h1>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
