export interface Testimonial {
  name: string;
  college: string;
  trip: string;
  quote: string;
  photo: string;
}

/** Not admin-managed — edit this file to change what appears on the home page. */
export const testimonials: Testimonial[] = [
  {
    name: 'Ananya Rathore',
    college: 'IIT Roorkee, 2nd year',
    trip: 'Kasol & Kheerganga',
    quote:
      'I signed up alone at 11 PM the night the form closed. By the second morning I was sharing a tent flap with four people I now travel with every semester. The captain actually knew the trail — we never once stood around wondering where to go.',
    photo:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80',
  },
  {
    name: 'Rohit Menon',
    college: 'IIT Roorkee, 4th year',
    trip: 'Chopta & Chandrashila',
    quote:
      'Summit morning was minus four and I had packed like an idiot. Someone from the crew handed me a spare fleece before I could even ask. That is the part the price list does not tell you about.',
    photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80',
  },
  {
    name: 'Sneha Kulkarni',
    college: 'COER Roorkee, 3rd year',
    trip: 'Rishikesh Rafting Weekend',
    quote:
      'Left campus Friday at four, was back Sunday night with assignments still submitted on time. Cannot swim, still did the whole 16 km and the cliff jump. The guides did not let anyone feel stupid about being scared.',
    photo:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80',
  },
  {
    name: 'Aditya Verma',
    college: 'IIT Roorkee, 1st year',
    trip: 'Jibhi & Jalori Pass',
    quote:
      'My parents wanted a number to call and an itinerary before they said yes. Got both the same evening. That is genuinely why I was allowed to go.',
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80',
  },
  {
    name: 'Meher Singh',
    college: 'IIT Roorkee, 3rd year',
    trip: 'Manali & Sissu',
    quote:
      'Six days, and two of them had nothing planned on purpose. Every other trip I have been on tries to fill every hour. Sitting in an Old Manali café doing nothing was the best part of the week.',
    photo:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=3&w=256&h=256&q=80',
  },
];
