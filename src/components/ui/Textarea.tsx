import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-charcoal-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "w-full rounded-lg border border-charcoal-200 bg-white px-3.5 py-2.5 text-sm text-charcoal-900",
          "placeholder:text-charcoal-400 resize-none",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-charcoal-50",
          error && "border-red-400 focus:ring-red-400",
          className
        )}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-charcoal-400">{hint}</p>}
    </div>
  );
}
