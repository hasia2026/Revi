import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary:
      "bg-charcoal-900 text-white hover:bg-charcoal-800 active:bg-charcoal-700",
    secondary:
      "bg-charcoal-50 text-charcoal-800 border border-charcoal-200 hover:bg-charcoal-100 active:bg-charcoal-200",
    ghost:
      "text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900 active:bg-charcoal-100",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    gold:
      "gold-gradient text-white shadow-gold-glow hover:opacity-90 active:opacity-80",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 h-7",
    md: "text-sm px-4 py-2 h-9",
    lg: "text-base px-6 py-3 h-11",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
