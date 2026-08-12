import { cn } from "@/lib/utils";
import type { OverviewCard } from "@/lib/cu3/module-framework";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };
const TREND_COLOR = { up: "text-emerald-600", down: "text-red-500", flat: "text-charcoal-400" };

export function ModuleOverview({ cards }: { cards: OverviewCard[] }) {
  if (cards.length === 0) return null;

  return (
    <section className={cn(
      "grid grid-cols-2 gap-3",
      cards.length >= 5 ? "md:grid-cols-5" : cards.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"
    )}>
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trend ? TREND_ICON[card.trend.direction] : null;
        return (
          <div key={card.label} className="bg-white border border-charcoal-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-charcoal-500">{card.label}</p>
              <Icon className="h-4 w-4 text-gold-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-charcoal-900">{card.value}</p>
            {card.trend && TrendIcon && (
              <p className={cn("mt-1 text-xs flex items-center gap-1", TREND_COLOR[card.trend.direction])}>
                <TrendIcon className="h-3 w-3" /> {card.trend.label}
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}
