import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Trip } from '@shared/types';
import { whatsappLink } from '@/config/site';
import { formatPrice } from '@/lib/format';

/** Shown in the estimate only when there are no trips to price from. */
const FALLBACK_PRICE_PER_PERSON = 5499;

export function CustomizeTrip({ trips, isPending }: { trips: Trip[]; isPending: boolean }) {
  // Empty = "use the first upcoming trip" until the visitor picks one.
  const [selectedSlug, setSelectedSlug] = useState('');
  const [personCount, setPersonCount] = useState(2);

  const selectedTrip = trips.find((trip) => trip.slug === selectedSlug) ?? trips[0];
  const pricePerPerson = selectedTrip?.price ?? FALLBACK_PRICE_PER_PERSON;
  const estimate = pricePerPerson * personCount;
  const people = `${personCount} ${personCount === 1 ? 'person' : 'people'}`;
  const bookingMessage = selectedTrip
    ? `Hi Expediva! I'd like a customised version of "${selectedTrip.title}" for ${people} (estimate ${formatPrice(estimate)}).`
    : `Hi Expediva! I'd like to plan a customised trip for ${people}.`;

  return (
    <section id="customize" className="relative w-full scroll-mt-[68px] py-20 text-white lg:py-28">
      <div className="shell edge">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="font-serif text-3xl uppercase tracking-widest text-white underline decoration-white/60 underline-offset-8 md:text-5xl">
            Customize Your Trip
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-3 rounded-3xl border border-white/20 bg-black/40 p-6 text-left backdrop-blur-md">
            <label
              htmlFor="customize-trip"
              className="block text-sm font-semibold uppercase tracking-wider text-amber-300"
            >
              1. Select Destination
            </label>
            <select
              id="customize-trip"
              value={selectedTrip?.slug ?? ''}
              onChange={(e) => setSelectedSlug(e.target.value)}
              disabled={trips.length === 0}
              className="w-full rounded-xl border border-white/30 bg-black/60 p-3 text-white focus:border-amber-400 focus:outline-none"
            >
              {trips.length === 0 ? (
                <option value="">{isPending ? 'Loading trips…' : 'No upcoming trips yet'}</option>
              ) : (
                trips.map((trip) => (
                  <option key={trip.slug} value={trip.slug}>
                    {trip.title}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-3 rounded-3xl border border-white/20 bg-black/40 p-6 text-left backdrop-blur-md">
            <label
              htmlFor="customize-people"
              className="block text-sm font-semibold uppercase tracking-wider text-amber-300"
            >
              2. Number of Persons
            </label>
            <input
              id="customize-people"
              type="number"
              min="1"
              max="20"
              value={personCount}
              onChange={(e) => setPersonCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full rounded-xl border border-white/30 bg-black/60 p-3 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col justify-between space-y-3 rounded-3xl border border-white/20 bg-black/40 p-6 text-left backdrop-blur-md">
            <div>
              <p className="block text-sm font-semibold uppercase tracking-wider text-amber-300">
                3. Estimated Amount
              </p>
              <div className="mt-2 text-2xl font-bold text-white md:text-3xl">{formatPrice(estimate)}</div>
              <p className="mt-1 text-xs text-white/60">{formatPrice(pricePerPerson)} per person</p>
            </div>
            <a
              href={whatsappLink(bookingMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-full bg-amber-400 py-3 text-center font-bold uppercase tracking-wider text-black transition-colors hover:bg-white"
            >
              Book Customized Trip
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
