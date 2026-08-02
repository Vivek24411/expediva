/**
 * Single source of truth for everything site-wide.
 * Nothing here should be duplicated inside a component.
 */

export const site = {
  name: 'Expediva',
  tagline: 'Student trips, properly planned.',
  description:
    'Expediva plans treks, weekend getaways and long tours for college students. Student pricing, verified stays, and a trip captain on every departure.',

  /** Used for canonical URLs, OG tags and JSON-LD. Set VITE_SITE_URL in production. */
  url: import.meta.env.VITE_SITE_URL ?? 'https://expediva.in',

  founded: 2024,
  basedAt: 'IIT Roorkee',

  contact: {
    phone: '+91 98765 43210',
    /** Digits only, country code included — used to build wa.me links. */
    whatsapp: '919876543210',
    email: 'hello@expediva.in',
    address: 'IIT Roorkee, Roorkee, Uttarakhand 247667',
  },

  social: {
    instagram: 'expediva.trips',
    instagramUrl: 'https://instagram.com/expediva.trips',
  },

  /** Prefilled WhatsApp opener. */
  whatsappMessage: 'Hi Expediva! I have a question about an upcoming trip.',

  defaultPickup: 'IIT Roorkee Main Gate',
} as const;

export function whatsappLink(message: string = site.whatsappMessage): string {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function telLink(): string {
  return `tel:${site.contact.phone.replace(/\s/g, '')}`;
}

export function mailtoLink(subject = 'Question about an Expediva trip'): string {
  return `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}`;
}

/** The trust strip on the home page. Icon names map to lucide-react. */
export const trustPoints = [
  {
    icon: 'GraduationCap',
    title: 'Student-run, student-priced',
    body: 'Built by students who got tired of paying tourist rates. Every trip is costed to what a hostel budget can actually take.',
  },
  {
    icon: 'MapPin',
    title: 'Departs from campus',
    body: 'Pickup at IIT Roorkee Main Gate. No pre-dawn scramble to Delhi or Haridwar to catch a bus you booked separately.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Never a solo gamble',
    body: 'A trip captain travels with every group. Stays are visited before we list them, and rooms are allotted same-gender by default.',
  },
  {
    icon: 'Receipt',
    title: 'One price, written down',
    body: 'What you pay covers travel, stay and food as listed. Exclusions are on the trip page in plain language, not in a footnote.',
  },
] as const;

/** General FAQs for the home page accordion (trip-specific FAQs live on the trip). */
export const generalFaqs = [
  {
    q: 'Who can join an Expediva trip?',
    a: 'Any college student. Most of the group is from IIT Roorkee and nearby campuses, and everyone is usually between 17 and 24. Bring a valid college ID — we check it at pickup.',
  },
  {
    q: 'How do I book a seat?',
    a: 'Open the trip you want and hit Enroll Now. That opens a Google Form where you fill in your details and pay. Your seat is confirmed once we verify the payment screenshot, usually within a day.',
  },
  {
    q: 'Where do I pay?',
    a: 'Inside the Google Form. The payment QR and the screenshot upload field are both in there — there is no payment step on this website.',
  },
  {
    q: 'What if I am going alone and do not know anyone?',
    a: 'That is how most people join. Groups are 15 to 25 people, the trip captain handles introductions on day one, and rooms are shared. Nobody stays a stranger past the first evening.',
  },
  {
    q: 'What is the cancellation policy?',
    a: 'More than 10 days before departure gets you a 75% refund, 10 to 5 days gets 50%. Under 5 days we cannot refund because stays and transport are already paid for.',
  },
  {
    q: 'What happens if the weather turns bad?',
    a: 'Safety decides the itinerary, not the brochure. If a pass is closed or a trail is unsafe, the captain swaps in an alternative at no extra cost. We do not push a group into bad conditions to keep a schedule.',
  },
] as const;

export const navLinks = [
  { label: 'Trips', to: '/trips' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
] as const;
