import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const imgSizes = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <div className={cn("rounded-full overflow-hidden flex-shrink-0", sizes[size], className)}>
        <Image
          src={src}
          alt={name || "Avatar"}
          width={imgSizes[size]}
          height={imgSizes[size]}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex-shrink-0 flex items-center justify-center font-semibold",
        "bg-charcoal-800 text-gold-400",
        sizes[size],
        className
      )}
    >
      {name ? getInitials(name) : "?"}
    </div>
  );
}
