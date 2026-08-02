/**
 * Seeds the admin account and five realistic trips.
 *   npm run seed          → wipes the trips collection and reinserts
 *   npm run seed -- --keep → keeps existing trips, only upserts the admin
 */
import { connectDatabase, disconnectDatabase } from './config/db';
import { env } from './config/env';
import { AdminModel, hashPassword } from './models/Admin';
import { TripModel } from './models/Trip';
import type { TripCategory, TripDifficulty, TripStatus } from '../../shared/types';

/** Days from today, so seeded trips never go stale. */
function inDays(days: number): Date {
  const d = new Date();
  d.setHours(6, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

const PICKUP = 'IIT Roorkee Main Gate';

interface SeedTrip {
  slug: string;
  title: string;
  destination: string;
  category: TripCategory;
  heroImage: string;
  gallery: string[];
  startDate: Date;
  endDate: Date;
  durationDays: number;
  price: number;
  originalPrice?: number;
  seatsTotal: number;
  seatsLeft: number;
  difficulty: TripDifficulty;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  thingsToCarry: string[];
  itinerary: Array<{ day: number; title: string; description: string }>;
  faqs: Array<{ q: string; a: string }>;
  pickupPoint: string;
  formLink: string;
  enrollmentOpen: boolean;
  enrollmentDeadline: Date;
  status: TripStatus;
}

const COMMON_INCLUSIONS = [
  'Return travel from IIT Roorkee in a private tempo traveller',
  'All stays on triple/quad sharing basis',
  'Daily breakfast and dinner',
  'Experienced trip captain from Expediva',
  'All permits and entry fees',
  'First-aid kit and oxygen support where required',
];

const COMMON_EXCLUSIONS = [
  'Lunch and personal snacks',
  'Any personal expenses or shopping',
  'Adventure activities not listed in inclusions',
  'Anything not mentioned under inclusions',
  'Costs arising from delays beyond our control (weather, roadblocks)',
];

const COMMON_CARRY = [
  'Valid college ID and one government photo ID',
  'Backpack (40–50L) plus a small day pack',
  'Warm layers — fleece and a windproof jacket',
  'Trekking or sports shoes with good grip',
  'Reusable water bottle (2L)',
  'Personal medication and toiletries',
  'Power bank — charging points are limited',
];

const COMMON_FAQS = [
  {
    q: 'Who travels on an Expediva trip?',
    a: 'Almost everyone on board is a college student between 17 and 24, mostly from IIT Roorkee and nearby campuses. Groups stay between 15 and 25 people so it never feels like a tour bus.',
  },
  {
    q: 'How do I pay?',
    a: 'Payment happens inside the Google Form linked on this page. You will find the payment QR there along with a field to upload your payment screenshot.',
  },
  {
    q: 'Can I get a refund if I cancel?',
    a: 'Cancellations more than 10 days before departure get a 75% refund. Between 10 and 5 days it is 50%. Under 5 days we cannot refund, since stays and transport are already locked in.',
  },
  {
    q: 'Is it safe for solo travellers and girls?',
    a: 'Yes. Every trip has a trip captain travelling with the group, stays are pre-verified, and rooms are allotted same-gender by default. Most people join solo and leave with a group.',
  },
];

const trips: SeedTrip[] = [
  {
    slug: 'kasol-kheerganga-trek',
    title: 'Kasol & Kheerganga Trek',
    destination: 'Kasol, Himachal Pradesh',
    category: 'trek',
    heroImage:
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1600&q=80',
    ],
    startDate: inDays(24),
    endDate: inDays(27),
    durationDays: 4,
    price: 5200,
    originalPrice: 6500,
    seatsTotal: 24,
    seatsLeft: 6,
    difficulty: 'moderate',
    highlights: [
      'Overnight camping beside the Kheerganga hot springs at 9,700 ft',
      'Riverside cafés and Israeli food along the Parvati river in Kasol',
      'Sunrise over the Parvati valley from the campsite',
      'Bonfire and music night with the whole group',
      'Walk through Chalal village and the pine forest trail',
    ],
    inclusions: COMMON_INCLUSIONS,
    exclusions: COMMON_EXCLUSIONS,
    thingsToCarry: COMMON_CARRY,
    itinerary: [
      {
        day: 1,
        title: 'Roorkee → Kasol (overnight journey)',
        description:
          'Board the tempo traveller at IIT Roorkee Main Gate by 8:00 PM. Overnight drive through Chandigarh and Bhuntar with tea breaks along the way.',
      },
      {
        day: 2,
        title: 'Arrive Kasol, explore Chalal',
        description:
          'Reach Kasol by morning, check into the riverside stay and freshen up. Afternoon walk to Chalal village across the river, evening free at the Parvati riverside cafés.',
      },
      {
        day: 3,
        title: 'Barshaini → Kheerganga trek & camping',
        description:
          'Short drive to Barshaini, then a 12 km trek to Kheerganga through waterfalls and pine forest. Soak in the hot springs at the top, dinner and bonfire at the campsite.',
      },
      {
        day: 4,
        title: 'Descend and return to Roorkee',
        description:
          'Sunrise at the campsite, breakfast and descent to Barshaini. Drive back with a lunch halt; expected arrival in Roorkee by early morning the next day.',
      },
    ],
    faqs: [
      ...COMMON_FAQS,
      {
        q: 'How hard is the Kheerganga trek?',
        a: 'It is a 12 km gradual climb that takes 4–5 hours at a relaxed pace. If you can walk the campus loop twice without stopping, you will be fine. Our captain keeps the group together.',
      },
    ],
    pickupPoint: PICKUP,
    formLink: 'https://forms.gle/expediva-kasol-kheerganga',
    enrollmentOpen: true,
    enrollmentDeadline: inDays(18),
    status: 'filling-fast',
  },

  {
    slug: 'rishikesh-rafting-weekend',
    title: 'Rishikesh Rafting Weekend',
    destination: 'Rishikesh, Uttarakhand',
    category: 'weekend',
    heroImage:
      'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=2000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1516132006923-6cf348e5dee2?auto=format&fit=crop&w=1600&q=80',
    ],
    startDate: inDays(11),
    endDate: inDays(13),
    durationDays: 3,
    price: 3500,
    seatsTotal: 30,
    seatsLeft: 19,
    difficulty: 'easy',
    highlights: [
      '16 km white-water rafting stretch from Shivpuri to Ram Jhula',
      'Riverside camping on a Ganga beach with a bonfire',
      'Cliff jumping and body surfing at the calm stretches',
      'Ganga Aarti at Parmarth Niketan',
      'Only three hours from campus — leave Friday evening, back Sunday night',
    ],
    inclusions: [
      'Return travel from IIT Roorkee',
      'Two nights riverside camp stay on twin/triple sharing',
      '16 km rafting with certified guides and full safety gear',
      'All meals from Friday dinner to Sunday breakfast',
      'Bonfire and evening music',
    ],
    exclusions: COMMON_EXCLUSIONS,
    thingsToCarry: [
      'Valid college ID and one government photo ID',
      'Quick-dry clothes and a change of clothes for rafting',
      'Slippers or sandals with a back strap',
      'Sunscreen and sunglasses with a strap',
      'Towel and toiletries',
      'Waterproof pouch for your phone',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Roorkee → Rishikesh, camp check-in',
        description:
          'Depart campus at 4:00 PM Friday, reach the riverside camp by evening. Tent allotment, dinner and bonfire under the stars.',
      },
      {
        day: 2,
        title: 'Rafting day + Ganga Aarti',
        description:
          'Breakfast, safety briefing and the 16 km rafting stretch with cliff jumping en route. Evening at the Parmarth Niketan Ganga Aarti, back to camp for dinner.',
      },
      {
        day: 3,
        title: 'Beach morning and return',
        description:
          'Slow morning by the river, breakfast and camp checkout. Depart after lunch and reach Roorkee by Sunday evening.',
      },
    ],
    faqs: [
      ...COMMON_FAQS,
      {
        q: 'I cannot swim. Can I still raft?',
        a: 'Yes. Life jackets, helmets and a certified guide in every raft are mandatory, and the guides are trained for rescue. Non-swimmers do this stretch every weekend.',
      },
    ],
    pickupPoint: PICKUP,
    formLink: 'https://forms.gle/expediva-rishikesh-rafting',
    enrollmentOpen: true,
    enrollmentDeadline: inDays(7),
    status: 'upcoming',
  },

  {
    slug: 'chopta-tungnath-chandrashila',
    title: 'Chopta, Tungnath & Chandrashila',
    destination: 'Chopta, Uttarakhand',
    category: 'trek',
    heroImage:
      'https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=2000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1600&q=80',
    ],
    startDate: inDays(38),
    endDate: inDays(41),
    durationDays: 4,
    price: 4800,
    originalPrice: 5800,
    seatsTotal: 20,
    seatsLeft: 4,
    difficulty: 'moderate',
    highlights: [
      'Sunrise from Chandrashila summit at 13,123 ft',
      'Tungnath — the highest Shiva temple in the world',
      'Panorama of Nanda Devi, Trishul and Chaukhamba',
      'Meadow camping in the Chopta bugyals',
      'Deoria Tal reflection lake on the way back',
    ],
    inclusions: COMMON_INCLUSIONS,
    exclusions: COMMON_EXCLUSIONS,
    thingsToCarry: [
      ...COMMON_CARRY,
      'Thermals — summit mornings drop below freezing',
      'Sunglasses and sunscreen for snow glare',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Roorkee → Chopta',
        description:
          'Early departure from campus, drive via Rishikesh, Devprayag and Ukhimath. Reach Chopta by evening, check into wooden huts and settle in.',
      },
      {
        day: 2,
        title: 'Tungnath & Chandrashila summit',
        description:
          'Pre-dawn start for the 5 km climb to Tungnath temple, then the final push to Chandrashila for the Himalayan panorama. Descend by afternoon, rest at the camp.',
      },
      {
        day: 3,
        title: 'Deoria Tal day hike',
        description:
          'Drive to Sari village and hike 2.5 km to Deoria Tal, where Chaukhamba reflects on the water. Return to Chopta for a bonfire night.',
      },
      {
        day: 4,
        title: 'Return to Roorkee',
        description:
          'Breakfast and checkout, scenic drive back with a lunch break at Devprayag. Arrive in Roorkee late evening.',
      },
    ],
    faqs: [
      ...COMMON_FAQS,
      {
        q: 'Will there be snow?',
        a: 'Between December and March the summit stretch is usually snow-covered and we carry microspikes for the group. Outside those months expect open meadow trails.',
      },
    ],
    pickupPoint: PICKUP,
    formLink: 'https://forms.gle/expediva-chopta-tungnath',
    enrollmentOpen: true,
    enrollmentDeadline: inDays(30),
    status: 'filling-fast',
  },

  {
    slug: 'manali-sissu-atal-tunnel',
    title: 'Manali & Sissu via Atal Tunnel',
    destination: 'Manali, Himachal Pradesh',
    category: 'long-tour',
    heroImage:
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
    ],
    startDate: inDays(52),
    endDate: inDays(57),
    durationDays: 6,
    price: 8900,
    originalPrice: 10500,
    seatsTotal: 26,
    seatsLeft: 26,
    difficulty: 'easy',
    highlights: [
      'Cross the 9.02 km Atal Tunnel into the Lahaul valley',
      'Sissu waterfall and the Chandra river frozen plains',
      'Solang valley adventure day — paragliding and zorbing',
      'Old Manali cafés and a night out on Mall Road',
      'Hadimba temple and the deodar forest walk',
      'Two full days with nothing scheduled, on purpose',
    ],
    inclusions: [
      ...COMMON_INCLUSIONS,
      'One day trip to Solang valley with transport',
      'Sissu and Atal Tunnel day excursion',
    ],
    exclusions: [
      ...COMMON_EXCLUSIONS,
      'Paragliding, skiing and ropeway tickets at Solang (₹1,500–₹3,000 on the spot)',
    ],
    thingsToCarry: COMMON_CARRY,
    itinerary: [
      {
        day: 1,
        title: 'Roorkee → Manali (overnight)',
        description:
          'Depart campus at 7:00 PM. Overnight drive via Chandigarh and Mandi with dinner and tea stops.',
      },
      {
        day: 2,
        title: 'Arrive Manali, Old Manali evening',
        description:
          'Check into the stay by noon and rest. Afternoon at Hadimba temple and the deodar forest, evening free in Old Manali.',
      },
      {
        day: 3,
        title: 'Atal Tunnel → Sissu',
        description:
          'Drive through the Atal Tunnel into Lahaul. Sissu waterfall, the Chandra riverbed and lunch at a local dhaba before heading back.',
      },
      {
        day: 4,
        title: 'Solang valley adventure day',
        description:
          'Full day at Solang. Paragliding, zorbing and the ropeway are available on the spot, or take the day slow at the meadow.',
      },
      {
        day: 5,
        title: 'Free day in Manali',
        description:
          'No fixed plan. Café hopping in Old Manali, Vashisht hot springs, Mall Road shopping or a day of doing absolutely nothing.',
      },
      {
        day: 6,
        title: 'Return to Roorkee',
        description:
          'Checkout after breakfast and begin the drive back. Expected arrival in Roorkee by early morning the next day.',
      },
    ],
    faqs: [
      ...COMMON_FAQS,
      {
        q: 'Is the Atal Tunnel always open?',
        a: 'It stays open year-round, but heavy snowfall in Lahaul can close the road past Sissu at short notice. If that happens we swap in Solang and Kullu instead — no extra cost.',
      },
    ],
    pickupPoint: PICKUP,
    formLink: 'https://forms.gle/expediva-manali-sissu',
    enrollmentOpen: true,
    enrollmentDeadline: inDays(42),
    status: 'upcoming',
  },

  {
    slug: 'jibhi-jalori-pass',
    title: 'Jibhi & Jalori Pass',
    destination: 'Jibhi, Himachal Pradesh',
    category: 'weekend',
    heroImage:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1600&q=80',
    ],
    startDate: inDays(-26),
    endDate: inDays(-22),
    durationDays: 5,
    price: 6400,
    seatsTotal: 22,
    seatsLeft: 0,
    difficulty: 'easy',
    highlights: [
      'Wooden cottages beside the Jibhi stream',
      'Serolsar Lake trek from Jalori Pass through moss forest',
      'Jibhi waterfall and the Mini Thailand pools',
      'Chehni Kothi — a 1,500-year-old timber tower',
      'Sunset from the Raghupur Fort ridge',
    ],
    inclusions: COMMON_INCLUSIONS,
    exclusions: COMMON_EXCLUSIONS,
    thingsToCarry: COMMON_CARRY,
    itinerary: [
      {
        day: 1,
        title: 'Roorkee → Jibhi (overnight)',
        description: 'Evening departure from campus, overnight drive via Chandigarh and Aut tunnel.',
      },
      {
        day: 2,
        title: 'Arrive Jibhi, waterfall walk',
        description:
          'Check into riverside cottages, rest through the morning. Afternoon walk to Jibhi waterfall and the Mini Thailand pools.',
      },
      {
        day: 3,
        title: 'Jalori Pass & Serolsar Lake',
        description:
          'Drive up to Jalori Pass at 10,800 ft and trek 5 km through moss-covered oak forest to Serolsar Lake. Evening back at the cottages.',
      },
      {
        day: 4,
        title: 'Chehni Kothi & Raghupur Fort',
        description:
          'Morning hike to the Chehni Kothi tower in Shringa Rishi village, sunset from the Raghupur Fort ridge.',
      },
      {
        day: 5,
        title: 'Return to Roorkee',
        description: 'Slow breakfast, checkout by 10 AM and the drive back to campus.',
      },
    ],
    faqs: COMMON_FAQS,
    pickupPoint: PICKUP,
    formLink: 'https://forms.gle/expediva-jibhi-jalori',
    enrollmentOpen: false,
    enrollmentDeadline: inDays(-32),
    status: 'completed',
  },
];

async function seed() {
  const keepTrips = process.argv.includes('--keep');

  await connectDatabase();

  // --- admin -------------------------------------------------------------
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);

  await AdminModel.findOneAndUpdate(
    { email: env.ADMIN_EMAIL },
    { email: env.ADMIN_EMAIL, passwordHash, name: env.ADMIN_NAME },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log(`[seed] admin ready → ${env.ADMIN_EMAIL}`);

  // --- trips -------------------------------------------------------------
  if (keepTrips) {
    console.log('[seed] --keep passed, leaving existing trips untouched');
  } else {
    const { deletedCount } = await TripModel.deleteMany({});
    console.log(`[seed] removed ${deletedCount} existing trip(s)`);

    const created = await TripModel.insertMany(trips);
    console.log(`[seed] inserted ${created.length} trips:`);
    for (const t of created) {
      console.log(`       · ${t.title} — ₹${t.price.toLocaleString('en-IN')} (${t.status})`);
    }
  }

  await disconnectDatabase();
  console.log('\n[seed] done.');
}

seed().catch(async (err) => {
  console.error('[seed] failed:', err);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
