import { motion, useScroll, useTransform } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Img } from '@/components/ui/primitives';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { sizes } from '@/lib/image';
import { api, queryKeys } from '@/lib/api';
import { formatDateRange, formatPrice } from '@/lib/format';

const HERO_IMAGE = '/cover-bg.png';

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const upcoming = useQuery({
    queryKey: queryKeys.trips({ status: 'upcoming' }),
    queryFn: () => api.listTrips({ status: 'upcoming' }),
  });
  const trips = upcoming.data ?? [];
  
  const [currentTripIndex, setCurrentTripIndex] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState('Kedarnath');
  const [personCount, setPersonCount] = useState(2);
  const basePricePerPerson = 5499;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const scrim = useTransform(scrollYProgress, [0, 1], [0.42, 0.7]);

  const nextTrip = () => {
    setCurrentTripIndex((prev) => (prev + 1) % trips.length);
  };

  const prevTrip = () => {
    setCurrentTripIndex((prev) => (prev - 1 + trips.length) % trips.length);
  };

  const activeTrip = trips[currentTripIndex] ?? trips[0];

  return (
    <div className="w-full snap-y snap-mandatory overflow-y-auto h-screen">
      
      {/* 1. SLIDE 1: HERO */}
      <section ref={ref} className="relative h-[100svh] min-h-[560px] w-full snap-start overflow-hidden">
        <motion.div className="absolute inset-0 -bottom-[18%] scale-105" style={reduced ? undefined : { y }}>
          <Img
            src={HERO_IMAGE}
            alt="A group of students on a Himalayan ridge at first light"
            sizes={sizes.full}
            priority
            className="h-full w-full object-cover blur-[2px]"
          />
        </motion.div>

        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-pitch/55 via-pitch/25 to-pitch/80"
          style={reduced ? undefined : { opacity: scrim }}
        />
        <div className="grain absolute inset-0" />

        <div className="relative flex h-full flex-col justify-end pb-14 sm:pb-20">
          <div className="shell edge">
            <div className="space-y-4">
              <h1 className="font-sans text-5xl font-bold tracking-wider text-amber-400 md:text-7xl">
  EXPLORE
</h1>

<h2 className="font-sans text-5xl font-bold tracking-wider text-white md:text-7xl">
  NEW DESTINATIONS
</h2>

<p className="pb-6 font-sans text-5xl font-bold tracking-wider text-blue-300 md:text-7xl">
  WITH EXPEDIVA
</p>

              <Link to="/about"
                className="inline-block rounded-full border border-white/40 bg-black/40 backdrop-blur-sm px-8 py-3 text-sm font-medium tracking-widest uppercase text-white transition-all duration-300 hover:bg-white hover:text-black"
              >
                LEARN MORE ABOUT US
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SLIDE 2: ABOUT US */}
      <section
  id="about"
  className="relative flex min-h-screen w-full snap-start items-center overflow-hidden px-5 pb-10 pt-28 md:px-10"
>
  <div
    className="absolute inset-0 scale-105 bg-cover bg-center blur-[3px]"
    style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
  />
  <div className="absolute inset-0 bg-[#18211d]/55" />

  <div className="relative z-10 mx-auto w-full max-w-[1200px]">
    <h2 className="mb-7 pl-2 font-serif text-4xl tracking-wide text-white md:pl-14 md:text-5xl">
      ABOUT US
    </h2>
    <div className="mb-8 ml-2 h-[5px] w-52 rounded-full bg-white md:ml-14 md:w-56" />

    <div className="grid gap-8 rounded-[26px] bg-[#e8bd78] px-7 py-8 text-[#463b30] shadow-xl md:grid-cols-[1.2fr_0.72fr_1fr] md:gap-x-3 md:px-12 md:py-8">
      <div className="row-span-2 flex flex-col justify-start space-y-4 pt-2 text-xl leading-[1.85] md:pt-3 md:text-[20px]">
        <p>
          Expediva is a travel-based startup founded by students of IIT Roorkee,
          mainly targeting the student community.
        </p>
        <p>
          Our main target is to explore and let people explore new places with
          us.
        </p>
        <p>
          We focus on creating budget-friendly travel experiences without
          compromising on quality or enjoyment.
        </p>
      </div>

      <div className="flex flex-col items-center justify-start">
        <img
          src="/sarthak.PNG"
          alt="Sarthak, founder of Expediva"
          className="h-44 w-48 rounded-[48%] object-cover"
        />
        <p className="mt-2 text-center font-serif text-sm leading-5">
          SARTHAK (IIT R)
          <br />
          FOUNDER EXPEDIVA
        </p>
      </div>

      <blockquote className="self-center px-2 text-sm leading-[1.8] md:-ml-8">
        <span
          aria-hidden="true"
          className="mr-1 align-[-0.2em] font-serif text-5xl leading-none"
        >
          “
        </span>
        Expediva is built around one belief: students deserve the best
        experiences, without the biggest price tag. We put our passion into
        every journey, creating trips that are memorable, meaningful, and made
        to be experienced.”
      </blockquote>

      <blockquote className="self-center px-2 text-center text-sm leading-[1.8] md:-mr-6">
        <span
          aria-hidden="true"
          className="mr-1 align-[-0.2em] font-serif text-5xl leading-none"
        >
          “
        </span>
        We believe travel should be about more than just the destination—it’s
        about the experience. Through Expediva, we put in the work to create
        meaningful journeys that students can enjoy without letting cost hold
        them back.”
      </blockquote>

      <div className="flex flex-col items-center justify-start">
        <img
          src="/rakesh.PNG"
          alt="Rakesh, founder of Expediva"
          className="h-44 w-48 rounded-[48%] object-cover"
        />
        <p className="mt-2 text-center font-serif text-sm leading-5">
          RAKESH (IIT R)
          <br />
          FOUNDER EXPEDIVA
        </p>
      </div>
    </div>
  </div>
</section>

      {/* 3. SLIDE 3: OUR TEAM */}
      <section
  id="team"
  className="relative flex min-h-screen w-full snap-start flex-col items-center justify-center overflow-hidden bg-pitch px-5 py-24 text-white"
>
  <div
    className="absolute inset-0 scale-105 bg-cover bg-center blur-[2px] brightness-50 opacity-70"
    style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
  />
  <div className="absolute inset-0 bg-black/40" />

  <div className="relative z-10 mx-auto w-full max-w-6xl">
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
  className="order-1 h-auto max-h-[480px] w-full rounded-2xl object-contain md:order-2"
/>
    </motion.div>
  </div>
</section>

      {/* 4. SLIDE 4: UPCOMING TRIPS (Dynamic from Admin Panel) */}
      <section id="trips" className="relative h-screen w-full snap-start flex flex-col justify-center items-center overflow-hidden text-white bg-pitch">
        <div className="absolute inset-0 bg-cover bg-center blur-[2px] scale-105 opacity-70 brightness-50" style={{ backgroundImage: `url('${HERO_IMAGE}')` }} />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <h2 className="text-3xl md:text-5xl font-serif tracking-widest text-white uppercase underline underline-offset-8 decoration-white/60">Upcoming Trips</h2>
          </motion.div>

          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-black/50 p-6 shadow-2xl backdrop-blur-md md:p-8">
            {upcoming.isPending ? (
              <p className="py-16 text-center text-white/80">Loading upcoming trips…</p>
            ) : upcoming.isError ? (
              <p className="py-16 text-center text-white/80">Upcoming trips could not be loaded. Please try again shortly.</p>
            ) : !activeTrip ? (
              <p className="py-16 text-center text-white/80">New trips are being planned. Check back soon.</p>
            ) : (
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${activeTrip.heroImage || HERO_IMAGE}')` }} />
              <div className="absolute inset-0 bg-black/50" />
              
              <div className="relative z-10 text-center space-y-3">
                <h3 className="text-3xl md:text-4xl font-bold tracking-wider text-white">{activeTrip.title}</h3>
                <p className="text-lg font-medium text-amber-300 md:text-xl">{formatDateRange(activeTrip.startDate, activeTrip.endDate)} · {activeTrip.durationDays}D/{Math.max(0, activeTrip.durationDays - 1)}N</p>
                <p className="text-xl font-semibold text-white md:text-2xl">{formatPrice(activeTrip.price)}</p>
                <Link to={`/trips/${activeTrip.slug}`} className="mt-2 inline-block rounded-full bg-white px-6 py-2 text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-amber-400">
                  View Details
                </Link>
              </div>

              {trips.length > 1 ? (
                <>
                  <button onClick={prevTrip} aria-label="Previous trip" className="absolute left-4 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-white hover:text-black">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={nextTrip} aria-label="Next trip" className="absolute right-4 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-white hover:text-black">
                    <ChevronRight size={24} />
                  </button>
                </>
              ) : null}
            </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. SLIDE 5: CUSTOMIZE TRIPS */}
      <section id="customize" className="relative h-screen w-full snap-start flex flex-col justify-center items-center overflow-hidden text-white bg-pitch">
        <div className="absolute inset-0 bg-cover bg-center blur-[2px] scale-105 opacity-70 brightness-50" style={{ backgroundImage: `url('${HERO_IMAGE}')` }} />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <h2 className="text-3xl md:text-5xl font-serif tracking-widest text-white uppercase underline underline-offset-8 decoration-white/60">Customize Your Trip</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-black/40 backdrop-blur-md border border-white/20 p-6 text-left space-y-3">
              <label className="block text-sm font-semibold uppercase tracking-wider text-amber-300">1. Select Destination</label>
              <select 
                value={selectedPlace} 
                onChange={(e) => setSelectedPlace(e.target.value)}
                className="w-full bg-black/60 border border-white/30 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
              >
                {trips.map((trip, idx) => (
                  <option key={idx} value={trip.title}>{trip.title}</option>
                ))}
              </select>
            </div>

            <div className="rounded-3xl bg-black/40 backdrop-blur-md border border-white/20 p-6 text-left space-y-3">
              <label className="block text-sm font-semibold uppercase tracking-wider text-amber-300">2. Number of Persons</label>
              <input 
                type="number" 
                min="1" 
                max="20" 
                value={personCount} 
                onChange={(e) => setPersonCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-black/60 border border-white/30 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="rounded-3xl bg-black/40 backdrop-blur-md border border-white/20 p-6 text-left space-y-3 flex flex-col justify-between">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider text-amber-300">3. Estimated Amount</label>
                <div className="text-2xl md:text-3xl font-bold text-white mt-2">
                  Rs. {basePricePerPerson * personCount}/-
                </div>
              </div>
              <button className="w-full rounded-full bg-amber-400 text-black py-3 font-bold uppercase tracking-wider hover:bg-white transition-colors">
                Book Customized Trip
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
