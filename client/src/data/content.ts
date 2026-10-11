export interface Service {
  title: string;
  description: string;
  icon: 'map' | 'spray' | 'inspect' | 'camera' | 'estate' | 'rescue';
}

export interface Course {
  title: string;
  duration: string;
  mode: string;
  description: string;
  level: string;
}

export const SERVICES: Service[] = [
  {
    title: 'Aerial Survey & Mapping',
    description:
      'High-resolution drone surveys producing 2D maps and 3D models for construction, mining and land records.',
    icon: 'map',
  },
  {
    title: 'Agricultural Crop Spraying',
    description:
      'Precision spraying drones that cut chemical and water usage while covering large farms in hours.',
    icon: 'spray',
  },
  {
    title: 'Industrial Inspection',
    description:
      'Close-range inspection of solar plants, wind turbines, power lines and chimneys — no scaffolding needed.',
    icon: 'inspect',
  },
  {
    title: 'Event & Wedding Cinematography',
    description:
      'Cinematic aerial shots that give events and weddings a film-quality perspective from the sky.',
    icon: 'camera',
  },
  {
    title: 'Real Estate Showcases',
    description:
      'Aerial property tours and site progress videos that help builders and agents sell faster.',
    icon: 'estate',
  },
  {
    title: 'Emergency & Disaster Support',
    description:
      'Rapid aerial assessment for floods, fires and search operations to guide response teams.',
    icon: 'rescue',
  },
];

export const COURSES: Course[] = [
  {
    title: 'Certified Drone Pilot Training',
    duration: '5 days',
    mode: 'Classroom + Field flying',
    level: 'Beginner',
    description:
      'Complete pilot training covering regulations, safety, flight maneuvers and certification preparation.',
  },
  {
    title: 'Advanced Aerial Cinematography',
    duration: '3 days',
    mode: 'Hands-on field training',
    level: 'Intermediate',
    description:
      'Master cinematic drone shots, camera settings, flight paths and aerial storytelling techniques.',
  },
  {
    title: 'Drone Survey & Mapping Masterclass',
    duration: '4 days',
    mode: 'Classroom + Field + Lab',
    level: 'Intermediate',
    description:
      'Photogrammetry workflow end-to-end: mission planning, data capture and map processing software.',
  },
  {
    title: 'Agri Drone Operations',
    duration: '2 days',
    mode: 'Field training',
    level: 'Beginner',
    description:
      'Operate spraying drones safely: calibration, chemical handling, field planning and maintenance.',
  },
];

export const INTEREST_OPTIONS = [
  'Aerial Survey & Mapping',
  'Agricultural Crop Spraying',
  'Industrial Inspection',
  'Event Cinematography',
  'Certified Drone Pilot Training',
  'Survey & Mapping Masterclass',
  'Other',
];

export const CONTACT = {
  email: 'support@dronetv.in',
  phone: '+91 90123 45678',
  hours: 'Monday – Saturday, 10:00 AM – 6:00 PM IST',
  note: 'Demo contact details for the assessment build.',
};
