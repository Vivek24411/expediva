import { ArrowUpRight, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { Reveal } from '@/components/motion/Reveal';
import { Eyebrow } from '@/components/ui/primitives';
import { mailtoLink, site, telLink, whatsappLink } from '@/config/site';

const CHANNELS = [
  {
    icon: Phone,
    label: 'Call us',
    value: site.contact.phone,
    href: telLink(),
    note: 'Fastest between 10 AM and 9 PM.',
    external: false,
  },
  {
    icon: Mail,
    label: 'Email',
    value: site.contact.email,
    href: mailtoLink(),
    note: 'For anything that needs a paper trail.',
    external: false,
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: `@${site.social.instagram}`,
    href: site.social.instagramUrl,
    note: 'New departures go up here first.',
    external: true,
  },
] as const;

export default function Contact() {
  return (
    <>
      <Seo
        title="Contact"
        description={`Talk to the Expediva team — call ${site.contact.phone}, message us on WhatsApp, or email ${site.contact.email}.`}
      />

      <section className="bg-ivory pb-20 pt-[112px] lg:pb-28 lg:pt-[150px]">
        <div className="shell edge">
          <Eyebrow>Say hello</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-display-md tracking-tight text-ink">
            Ask us anything before you book.
          </h1>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-ink-soft">
            Parents asking for an itinerary? Not sure a trek suits your fitness? Message us. A real
            student answers, usually within a few hours.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------- WhatsApp CTA */}
      <section className="bg-pitch py-16 lg:py-20">
        <div className="shell edge flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <Eyebrow className="text-paper/55">Quickest way</Eyebrow>
            <p className="mt-4 max-w-lg font-display text-[clamp(1.6rem,4vw,2.4rem)] leading-tight tracking-tight text-paper">
              WhatsApp us. We answer there faster than anywhere else.
            </p>
          </div>

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-3 bg-[#1FAF54] px-9 py-4 text-sm font-medium tracking-wide text-white transition-opacity duration-300 hover:opacity-90"
          >
            Open WhatsApp
            <ArrowUpRight
              size={16}
              strokeWidth={1.6}
              className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </section>

      {/* ---------------------------------------------------------- channels */}
      <section className="bg-ivory py-20 lg:py-28">
        <div className="shell edge">
          <div className="grid gap-x-10 gap-y-12 border-t border-hairline pt-12 sm:grid-cols-2 lg:grid-cols-3">
            {CHANNELS.map((channel, i) => {
              const Icon = channel.icon;

              return (
                <Reveal key={channel.label} delay={i * 0.07}>
                  <a
                    href={channel.href}
                    {...(channel.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="group block"
                  >
                    <Icon size={18} strokeWidth={1.4} className="text-ember" />
                    <p className="eyebrow mt-5">{channel.label}</p>
                    <p className="mt-3 inline-flex items-center gap-2 font-display text-xl leading-tight tracking-tight text-ink">
                      <span className="link-underline">{channel.value}</span>
                      {channel.external ? (
                        <ArrowUpRight
                          size={15}
                          strokeWidth={1.5}
                          className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      ) : null}
                    </p>
                    <p className="mt-3 text-sm text-ink-muted">{channel.note}</p>
                  </a>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-20 border-t border-hairline pt-12">
              <MapPin size={18} strokeWidth={1.4} className="text-ember" />
              <p className="eyebrow mt-5">Where we are</p>
              <p className="mt-3 font-display text-xl leading-tight tracking-tight text-ink">
                {site.contact.address}
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
                Every trip departs from {site.defaultPickup}. Exact reporting time is confirmed on
                WhatsApp two days before you leave.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
