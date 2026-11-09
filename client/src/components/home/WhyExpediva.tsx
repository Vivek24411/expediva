import { GraduationCap, MapPin, Receipt, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Reveal, RevealChild, RevealGroup } from '@/components/motion/Reveal';
import { Eyebrow } from '@/components/ui/primitives';
import { trustPoints } from '@/config/site';
import { ordinal } from '@/lib/format';

/** Explicit map — a namespace import would pull every Lucide icon into the bundle. */
const TRUST_ICONS: Record<string, LucideIcon> = {
  GraduationCap,
  MapPin,
  ShieldCheck,
  Receipt,
};

/** "Why Expediva" — shown as part of the About Us section. Edit the points in config/site.ts. */
export function WhyExpediva() {
  return (
    <div className="grid gap-12 rounded-3xl border border-white/20 bg-black/40 p-7 backdrop-blur-md md:p-12 lg:grid-cols-[0.85fr_1.15fr]">
      <Reveal>
        <Eyebrow className="text-white/60">Why Expediva</Eyebrow>
        <h2 className="mt-4 max-w-md font-display text-display-sm tracking-tight text-white">
          Built for the way students actually travel.
        </h2>
      </Reveal>

      <RevealGroup className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
        {trustPoints.map((point, i) => {
          const Icon = TRUST_ICONS[point.icon] ?? MapPin;

          return (
            <RevealChild key={point.title}>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-xs text-amber-300">{ordinal(i)}</span>
                <Icon size={17} strokeWidth={1.4} className="text-white/75" />
              </div>
              <h3 className="mt-4 font-display text-xl leading-tight tracking-tight text-white">
                {point.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{point.body}</p>
            </RevealChild>
          );
        })}
      </RevealGroup>
    </div>
  );
}
