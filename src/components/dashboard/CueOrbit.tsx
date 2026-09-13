import Link from "next/link";
import {
  COMPANY_COMPASS,
  PILLARS,
  type PillarKey,
} from "@/lib/cu3/pillars";

type OrbitKey = Exclude<PillarKey, "innovation-lab">;

type OrbitPillar = {
  key: OrbitKey;
  nodeClass: string;
  glowClass: string;
};

const orbitPillars: OrbitPillar[] = [
  {
    key: "capture",
    nodeClass: "lg:left-1/2 lg:top-3 lg:-translate-x-1/2",
    glowClass:
      "border-cue-blue-400/80 shadow-[0_0_38px_rgba(59,130,246,0.38)]",
  },
  {
    key: "understand",
    nodeClass: "lg:right-[13%] lg:top-[34%]",
    glowClass:
      "border-cue-purple-400/80 shadow-[0_0_38px_rgba(139,92,246,0.4)]",
  },
  {
    key: "enhance",
    nodeClass: "lg:right-[19%] lg:bottom-4",
    glowClass:
      "border-fuchsia-400/80 shadow-[0_0_38px_rgba(217,70,239,0.38)]",
  },
  {
    key: "execute",
    nodeClass: "lg:left-[19%] lg:bottom-4",
    glowClass:
      "border-cue-orange-400/80 shadow-[0_0_38px_rgba(249,115,22,0.38)]",
  },
  {
    key: "expand",
    nodeClass: "lg:left-[13%] lg:top-[34%]",
    glowClass:
      "border-cyan-400/80 shadow-[0_0_38px_rgba(34,211,238,0.34)]",
  },
];

export function CueOrbit() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-cue-blue-500/20 bg-[#07101f] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,54,180,0.16),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(249,115,22,0.10),transparent_35%),radial-gradient(circle_at_12%_20%,rgba(59,130,246,0.12),transparent_32%)]" />

      <div className="relative z-10 flex items-start justify-between gap-6 px-6 pb-2 pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cue-blue-400">
            CUE Orbit
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            All parts of your business, working together.
          </h2>
        </div>

        <div className="hidden rounded-full border border-cue-blue-400/30 bg-cue-blue-500/10 px-4 py-2 text-xs font-medium text-cue-blue-300 sm:inline-flex">
          One connected operating system
        </div>
      </div>

      <div className="relative z-10 px-4 pb-5">
        <div className="relative mx-auto min-h-[430px] max-w-5xl">
          <svg
            viewBox="0 0 1000 430"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
          >
            <defs>
              <linearGradient id="orbitLine" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.55" />
                <stop offset="48%" stopColor="#8B5CF6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0.5" />
              </linearGradient>
              <radialGradient id="centerGlow">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx="500" cy="225" r="192" fill="none" stroke="url(#orbitLine)" strokeWidth="1.2" opacity="0.48" />
            <circle cx="500" cy="225" r="142" fill="none" stroke="#7C3AED" strokeWidth="1" opacity="0.26" />
            <circle cx="500" cy="225" r="104" fill="url(#centerGlow)" opacity="0.8" />

            <line x1="500" y1="225" x2="500" y2="65" stroke="#3B82F6" strokeWidth="1.5" opacity="0.48" />
            <line x1="500" y1="225" x2="748" y2="165" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.42" />
            <line x1="500" y1="225" x2="690" y2="355" stroke="#D946EF" strokeWidth="1.5" opacity="0.42" />
            <line x1="500" y1="225" x2="310" y2="355" stroke="#F97316" strokeWidth="1.5" opacity="0.42" />
            <line x1="500" y1="225" x2="252" y2="165" stroke="#22D3EE" strokeWidth="1.5" opacity="0.42" />

            <circle cx="500" cy="65" r="4" fill="#60A5FA" />
            <circle cx="748" cy="165" r="4" fill="#A78BFA" />
            <circle cx="690" cy="355" r="4" fill="#E879F9" />
            <circle cx="310" cy="355" r="4" fill="#FB923C" />
            <circle cx="252" cy="165" r="4" fill="#67E8F9" />
          </svg>

          <Link
            href="/company-compass"
            className="relative z-20 mx-auto mb-5 flex h-44 w-44 flex-col items-center justify-center rounded-full border border-cue-purple-400/60 bg-[#091426] text-center shadow-[0_0_55px_rgba(139,92,246,0.28)] transition hover:border-cue-purple-300 lg:absolute lg:left-1/2 lg:top-[52%] lg:mb-0 lg:-translate-x-1/2 lg:-translate-y-1/2"
          >
            <div className="absolute -inset-4 rounded-full border border-cue-blue-400/20" />
            <div className="absolute -inset-8 rounded-full border border-cue-purple-400/10" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl cue-gradient shadow-cue-glow">
              <COMPANY_COMPASS.icon className="h-6 w-6 text-white" />
            </div>
            <p className="relative mt-3 text-base font-semibold leading-tight text-white">
              Company
              <br />
              Compass
            </p>
            <p className="relative mt-1 max-w-28 text-[10px] leading-4 text-charcoal-300">
              Your business.
              <br />
              Your intelligence.
            </p>
          </Link>

          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:block lg:h-[430px]">
            {orbitPillars.map((item) => {
              const pillar = PILLARS[item.key];
              const Icon = pillar.icon;

              return (
                <div key={item.key}>
                  <Link
                    href={`/${pillar.key}`}
                    className={`group relative z-20 mx-auto flex h-28 w-28 flex-col items-center justify-center rounded-full border bg-[#081321]/95 text-center transition hover:scale-[1.03] sm:h-32 sm:w-32 lg:absolute ${item.nodeClass} ${item.glowClass}`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                    <p className="mt-2 text-sm font-semibold text-white">
                      {pillar.label}
                    </p>
                    <p className="mt-0.5 hidden max-w-24 text-[10px] leading-4 text-charcoal-300 sm:block">
                      {pillar.description.split(" — ")[0]}
                    </p>
                  </Link>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
