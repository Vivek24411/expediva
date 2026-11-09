import { motion } from 'framer-motion';
import type { MouseEvent } from 'react';
import { useLenis } from '@/components/motion/SmoothScroll';
import { scrollToSection } from '@/lib/scrollToSection';
import { WhyExpediva } from './WhyExpediva';

/** Hero, About Us and Our Team — the first three screens of the homepage. */
export function Hero() {
  const lenis = useLenis();

  const goToAbout = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.history.replaceState(null, '', '/#about');
    scrollToSection('about', lenis);
  };

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative h-[100svh] min-h-[560px] w-full">
        <div className="relative flex h-full flex-col justify-end pb-14 sm:pb-20">
          <div className="shell edge">
            <div className="space-y-4">
              {/* text-4xl on phones: at text-5xl "DESTINATIONS" is wider than a 390px screen. */}
              <h1 className="font-sans text-4xl font-bold tracking-wider text-amber-400 sm:text-5xl md:text-7xl">
                EXPLORE
              </h1>
              <p className="font-sans text-4xl font-bold tracking-wider text-white sm:text-5xl md:text-7xl">
                NEW DESTINATIONS
              </p>
              <p className="pb-6 font-sans text-4xl font-bold tracking-wider text-blue-300 sm:text-5xl md:text-7xl">
                WITH EXPEDIVA
              </p>

              <a
                href="/#about"
                onClick={goToAbout}
                className="inline-block rounded-full border border-white/40 bg-black/40 px-8 py-3 text-sm font-medium uppercase tracking-widest text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black"
              >
                Learn more about us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- about us */}
      <section
        id="about"
        className="relative flex min-h-[100svh] w-full scroll-mt-[68px] items-center px-5 py-24 md:px-10"
      >
        <div className="relative mx-auto w-full max-w-[1200px]">
          <h2 className="mb-7 pl-2 font-serif text-4xl tracking-wide text-white md:pl-14 md:text-5xl">
            ABOUT US
          </h2>
          <div className="mb-8 ml-2 h-[5px] w-52 rounded-full bg-white md:ml-14 md:w-56" />

          <div className="grid gap-8 rounded-[26px] bg-[#e8bd78] px-7 py-8 text-[#463b30] shadow-xl md:grid-cols-[1.2fr_0.72fr_1fr] md:gap-x-3 md:px-12 md:py-8">
            <div className="row-span-2 flex flex-col justify-start space-y-4 pt-2 text-xl leading-[1.85] md:pt-3 md:text-[20px]">
              <p>
                Expediva is a travel-based startup founded by students of IIT Roorkee, mainly
                targeting the student community.
              </p>
              <p>Our main target is to explore and let people explore new places with us.</p>
              <p>
                We focus on creating budget-friendly travel experiences without compromising on
                quality or enjoyment.
              </p>
            </div>

            <div className="flex flex-col items-center justify-start">
              <img
                src="/sarthak.PNG"
                alt="Sarthak, founder of Expediva"
                loading="lazy"
                className="h-44 w-48 rounded-[48%] object-cover"
              />
              <p className="mt-2 text-center font-serif text-sm leading-5">
                SARTHAK (IIT R)
                <br />
                FOUNDER EXPEDIVA
              </p>
            </div>

            <blockquote className="self-center px-2 text-sm leading-[1.8] md:-ml-8">
              <span aria-hidden="true" className="mr-1 align-[-0.2em] font-serif text-5xl leading-none">
                “
              </span>
              Expediva is built around one belief: students deserve the best experiences, without
              the biggest price tag. We put our passion into every journey, creating trips that are
              memorable, meaningful, and made to be experienced.”
            </blockquote>

            <blockquote className="self-center px-2 text-center text-sm leading-[1.8] md:-mr-6">
              <span aria-hidden="true" className="mr-1 align-[-0.2em] font-serif text-5xl leading-none">
                “
              </span>
              We believe travel should be about more than just the destination—it’s about the
              experience. Through Expediva, we put in the work to create meaningful journeys that
              students can enjoy without letting cost hold them back.”
            </blockquote>

            <div className="flex flex-col items-center justify-start">
              <img
                src="/rakesh.PNG"
                alt="Rakesh, founder of Expediva"
                loading="lazy"
                className="h-44 w-48 rounded-[48%] object-cover"
              />
              <p className="mt-2 text-center font-serif text-sm leading-5">
                RAKESH (IIT R)
                <br />
                FOUNDER EXPEDIVA
              </p>
            </div>
          </div>

          {/* Why Expediva is part of About Us. */}
          <div className="mt-10 text-white">
            <WhyExpediva />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- our team */}
      <section
        id="team"
        className="relative flex w-full scroll-mt-[68px] flex-col items-center justify-center px-5 py-20 text-white lg:py-28"
      >
        <div className="relative mx-auto w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="font-serif text-4xl uppercase tracking-widest text-white underline decoration-white/60 underline-offset-8 md:text-5xl">
              Our Team
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid items-center gap-8 rounded-3xl border border-white/20 bg-black/40 p-6 shadow-2xl backdrop-blur-md md:grid-cols-[1.15fr_0.85fr] md:gap-10 md:p-10"
          >
            <p className="order-2 whitespace-pre-line text-base leading-8 text-white/90 md:order-1 md:text-lg md:leading-9">
              {`Some journeys begin with a destination. Ours began with a dream.
A dream to make the mountains a little closer, the unfamiliar a little less daunting, and every journey worth remembering.

We are a collective of explorers, creators, and students from IIT Roorkee, brought together by our love for travel and the belief that the best stories are found somewhere beyond the familiar.

From planning the route to chasing the perfect sunrise, we put our heart into every journey we create. Because Expediva isn't just about the places we take you to — it's about the stories we create, the friendships we make, and what you bring back with you.

Meet the people behind your next adventure.`}
            </p>

            <img
              src="/team.jpg"
              alt="The Expediva team"
              loading="lazy"
              className="order-1 h-auto max-h-[480px] w-full rounded-2xl object-contain md:order-2"
            />
          </motion.div>
        </div>
      </section>
    </>
  );
}
