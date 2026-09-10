"use client";

import { useState, useTransition } from "react";
import type { SupportedLocale } from "@/lib/i18n/locales";
import { submitGuestRegistration } from "@/lib/registration/guest-actions";

type Copy = {
  details: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  consent: string;
  signature: string;
  signatureHelp: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
};

type Props = {
  token: string;
  locale: SupportedLocale;
  copy: Copy;
  initial: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
};

export function GuestRegistrationForm({ token, locale, copy, initial }: Props) {
  const [form, setForm] = useState(initial);
  const [consent, setConsent] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function setField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await submitGuestRegistration(token, {
        ...form,
        locale,
        consent,
        signatureName,
      });

      if (!result.ok) {
        setError(result.error || copy.error);
        return;
      }

      setComplete(true);
    });
  }

  if (complete) {
    return (
      <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
        <p className="font-semibold">{copy.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 border-t border-charcoal-100 pt-8">
      <h2 className="text-lg font-semibold text-charcoal-900">{copy.details}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.firstName} value={form.firstName} onChange={(value) => setField("firstName", value)} required />
        <Field label={copy.lastName} value={form.lastName} onChange={(value) => setField("lastName", value)} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.email} value={form.email} onChange={(value) => setField("email", value)} type="email" />
        <Field label={copy.phone} value={form.phone} onChange={(value) => setField("phone", value)} type="tel" />
      </div>

      <Field label={copy.address} value={form.address} onChange={(value) => setField("address", value)} />

      <label className="flex items-start gap-3 rounded-lg border border-charcoal-200 bg-charcoal-50 p-4 text-sm text-charcoal-700">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-4 w-4"
          required
        />
        <span>{copy.consent}</span>
      </label>

      <div>
        <label className="block text-sm font-medium text-charcoal-800" htmlFor="signature-name">
          {copy.signature}
        </label>
        <input
          id="signature-name"
          value={signatureName}
          onChange={(event) => setSignatureName(event.target.value)}
          autoComplete="name"
          required
          className="mt-1 w-full rounded-lg border border-charcoal-200 bg-white px-3 py-2.5 text-charcoal-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
        />
        <p className="mt-1.5 text-xs text-charcoal-500">{copy.signatureHelp}</p>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !consent || !signatureName.trim() || !form.firstName.trim() || !form.lastName.trim()}
        className="w-full rounded-lg bg-charcoal-900 px-4 py-3 font-semibold text-white transition hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal-800">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="mt-1 w-full rounded-lg border border-charcoal-200 bg-white px-3 py-2.5 text-charcoal-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
      />
    </div>
  );
}
