/**
 * Rule-based chatbot engine (no AI/LLM).
 * - Keyword/regex intent matching with a simple scoring system.
 * - A guided multi-step enquiry flow with per-field validation.
 * - Session-only conversation history (kept in the component).
 */

export interface ChatMessage {
  id: number;
  from: 'user' | 'bot';
  text: string;
  chips?: string[];
}

export type FlowStep =
  | 'idle'
  | 'ask_name'
  | 'ask_email'
  | 'ask_phone'
  | 'ask_usertype'
  | 'ask_interest'
  | 'ask_message'
  | 'confirm';

export interface FlowData {
  name: string;
  email: string;
  phone: string;
  userType: string;
  interest: string;
  message: string;
}

export interface FlowState {
  step: FlowStep;
  data: FlowData;
}

export const emptyFlow = (): FlowState => ({
  step: 'idle',
  data: { name: '', email: '', phone: '', userType: '', interest: '', message: '' },
});

export const QUICK_REPLIES = ['Our services', 'Courses', 'Contact us', 'Submit an enquiry'];

// ---------- validation helpers ----------

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function normalizePhone(v: string): string {
  let d = v.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
}

export function isValidPhone(v: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizePhone(v));
}

// ---------- intent matching ----------

type IntentId =
  | 'greeting'
  | 'services'
  | 'courses'
  | 'contact'
  | 'register'
  | 'interested_service'
  | 'student'
  | 'human'
  | 'enquiry'
  | 'pricing'
  | 'location'
  | 'thanks'
  | 'bye';

interface Intent {
  id: IntentId;
  patterns: RegExp[];
  reply: string;
  chips?: string[];
}

const INTENTS: Intent[] = [
  {
    id: 'greeting',
    patterns: [/\b(hi+|hello|hey|namaste)\b/, /good (morning|afternoon|evening)/],
    reply:
      "Hello! I'm the DroneTV assistant. I can tell you about our drone services and training courses, or help you submit an enquiry. What would you like to know?",
    chips: QUICK_REPLIES,
  },
  {
    id: 'services',
    patterns: [/\bservices?\b/, /what.*(do|does).*offer/, /what.*provide/],
    reply:
      'We offer 6 professional drone services:\n• Aerial Survey & Mapping — land surveys, construction site mapping\n• Agricultural Crop Spraying — precision spraying for farms\n• Industrial Inspection — solar plants, power lines, towers\n• Event & Wedding Cinematography — aerial photo & video\n• Real Estate Showcases — stunning property fly-throughs\n• Emergency & Disaster Support — rapid aerial assessment\n\nWhich one interests you? I can also get you a free quote.',
    chips: ['I am interested in a service', 'Courses', 'Submit an enquiry'],
  },
  {
    id: 'courses',
    patterns: [/\bcourses?\b/, /\btraining\b/, /\blearn\b/, /\bpilot\b/, /certif/, /\bavailable\b/],
    reply:
      'We run 4 training programmes:\n• Certified Drone Pilot Training — 5 days, beginner to licensed pilot\n• Advanced Aerial Cinematography — 3 days, for photo/video creators\n• Drone Survey & Mapping Masterclass — 4 days, for engineers & surveyors\n• Agri Drone Operations — 2 days, for farm owners & agripreneurs\n\nAll courses include hands-on flying practice. Want me to help you register?',
    chips: ['How can I register?', 'Submit an enquiry', 'Our services'],
  },
  {
    id: 'contact',
    patterns: [/\bcontact\b/, /how.*(contact|reach)/, /\bphone\b/, /\bemail\b/, /\bnumber\b/, /\breach\b/, /\bcall\b/],
    reply:
      'You can reach us at support@dronetv.in or +91 90123 45678 (Monday–Saturday, 10 AM–6 PM IST). Or just submit an enquiry right here and our team will call you back!',
    chips: ['Submit an enquiry', 'I want to speak with someone'],
  },
  {
    id: 'register',
    patterns: [/\bregister\b/, /\benroll\b/, /\badmission\b/, /\bjoin\b/, /sign ?up/, /how.*(join|enroll)/],
    reply:
      'Registering takes 2 minutes:\n1. Submit an enquiry with your details\n2. Pick the course you want\n3. Our team calls you back to confirm your seat and share fee details\n\nShall we start your registration now?',
    chips: ['Submit an enquiry', 'Courses'],
  },
  {
    id: 'interested_service',
    patterns: [/interest.*service/, /want.*service/, /need.*service/, /book.*service/, /quote/],
    reply:
      'Great choice! Tell me which service you need — Aerial Survey, Crop Spraying, Industrial Inspection, Cinematography, or something else — and I\'ll get our team to call you back with a free quote.',
    chips: ['Submit an enquiry', 'Our services'],
  },
  {
    id: 'student',
    patterns: [/\bstudent\b/, /i'm a student/, /i am a student/, /\bcollege\b/, /\bstudy\b/, /\bfresher\b/],
    reply:
      'Welcome, future pilot! Most students pick one of these two:\n• Certified Drone Pilot Training (5 days) — the full licence path\n• Drone Survey & Mapping Masterclass (4 days) — great for engineering students\n\nWant me to help you register? It only takes 2 minutes.',
    chips: ['How can I register?', 'Courses', 'Submit an enquiry'],
  },
  {
    id: 'human',
    patterns: [/speak.*(human|person|someone|agent)/, /talk.*someone/, /call me/, /\bhuman\b/, /customer.*(care|support)/],
    reply:
      'Of course! The fastest way: submit an enquiry and write "call me" in the message — a team member will call you back during working hours (Mon–Sat, 10 AM–6 PM IST). Or reach us directly at +91 90123 45678.',
    chips: ['Submit an enquiry', 'Contact us'],
  },
  {
    id: 'enquiry',
    patterns: [/\benquir/, /\bsubmit\b/, /\bapply\b/, /\blead\b/],
    reply: "Sure, let's do it! What's your full name?",
    chips: [],
  },
  {
    id: 'pricing',
    patterns: [/\bprice\b/, /\bcost\b/, /\bfee\b/, /\bcharge\b/, /how much/],
    reply:
      'Pricing depends on the service and project size. Submit an enquiry with what you need and our team will share an exact quote — it is free to ask!',
    chips: ['Submit an enquiry', 'Our services'],
  },
  {
    id: 'location',
    patterns: [/\bwhere\b/, /\blocation\b/, /\bcity\b/, /\baddress\b/],
    reply:
      'We operate across India, with training centers in major cities. Tell us your city in the enquiry message and we will guide you to the nearest option.',
    chips: ['Submit an enquiry', 'Contact us'],
  },
  {
    id: 'thanks',
    patterns: [/\bthank\b/, /\bthanks\b/, /shukriya/],
    reply: "You're welcome! Anything else I can help with?",
    chips: QUICK_REPLIES,
  },
  {
    id: 'bye',
    patterns: [/\bbye\b/, /\bgoodbye\b/, /see you/],
    reply: 'Goodbye! Feel free to come back anytime you have questions about DroneTV.',
  },
];

const FALLBACK_REPLY =
  "I didn't quite get that. I can help with our services, training courses, contact details, registration, or submitting an enquiry — which one would you like?";

export function matchIntent(text: string): Intent | null {
  const t = text.toLowerCase();
  let best: Intent | null = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    let score = 0;
    for (const p of intent.patterns) if (p.test(t)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return bestScore > 0 ? best : null;
}

export function getFallback(): { text: string; chips: string[] } {
  return { text: FALLBACK_REPLY, chips: QUICK_REPLIES };
}

export function getGreeting(): { text: string; chips: string[] } {
  return {
    text: "Hi! I'm the DroneTV assistant. Ask me about our drone services, training courses — or I can help you submit an enquiry.",
    chips: QUICK_REPLIES,
  };
}

// ---------- guided enquiry flow ----------

export interface FlowResult {
  botTexts: string[];
  chips?: string[];
  next: FlowState;
  submit?: boolean;
  cancelled?: boolean;
}

const CANCEL_WORDS = /^(cancel|stop|quit|exit)$/i;

export function handleFlowInput(text: string, flow: FlowState): FlowResult {
  const t = text.trim();

  if (CANCEL_WORDS.test(t)) {
    return {
      botTexts: ['No problem — enquiry cancelled. Anything else I can help with?'],
      chips: QUICK_REPLIES,
      next: emptyFlow(),
      cancelled: true,
    };
  }

  const data = { ...flow.data };

  switch (flow.step) {
    case 'ask_name': {
      if (t.length < 2) {
        return { botTexts: ['Please enter your full name (at least 2 characters).'], next: flow };
      }
      data.name = t;
      return {
        botTexts: [`Thanks ${t}! What's your email address?`],
        next: { step: 'ask_email', data },
      };
    }
    case 'ask_email': {
      if (!isValidEmail(t)) {
        return { botTexts: ['That email doesn\'t look right. Please enter a valid email address.'], next: flow };
      }
      data.email = t.trim().toLowerCase();
      return {
        botTexts: ['Got it. And your 10-digit mobile number?'],
        next: { step: 'ask_phone', data },
      };
    }
    case 'ask_phone': {
      if (!isValidPhone(t)) {
        return { botTexts: ['Please enter a valid 10-digit Indian mobile number.'], next: flow };
      }
      data.phone = normalizePhone(t);
      return {
        botTexts: ['Are you a Student, a Customer, or Other?'],
        chips: ['Student', 'Customer', 'Other'],
        next: { step: 'ask_usertype', data },
      };
    }
    case 'ask_usertype': {
      const norm = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
      if (!['Student', 'Customer', 'Other'].includes(norm)) {
        return {
          botTexts: ['Please pick one: Student, Customer, or Other.'],
          chips: ['Student', 'Customer', 'Other'],
          next: flow,
        };
      }
      data.userType = norm;
      return {
        botTexts: ['Which service or course are you interested in?'],
        chips: ['Pilot Training', 'Survey & Mapping', 'Crop Spraying', 'Industrial Inspection', 'Other'],
        next: { step: 'ask_interest', data },
      };
    }
    case 'ask_interest': {
      if (t.length < 2) {
        return { botTexts: ['Please tell me which service or course interests you.'], next: flow };
      }
      data.interest = t;
      return {
        botTexts: ['Almost done! Please type your message (at least 10 characters).'],
        next: { step: 'ask_message', data },
      };
    }
    case 'ask_message': {
      if (t.length < 10) {
        return { botTexts: ['Your message is a bit short — please write at least 10 characters.'], next: flow };
      }
      data.message = t;
      const next: FlowState = { step: 'confirm', data };
      return {
        botTexts: [
          `Here's your enquiry:\n• Name: ${data.name}\n• Email: ${data.email}\n• Phone: ${data.phone}\n• Type: ${data.userType}\n• Interest: ${data.interest}\n• Message: ${data.message}\n\nShall I submit it?`,
        ],
        chips: ['Yes, submit', 'Start over'],
        next,
      };
    }
    case 'confirm': {
      if (/^yes|submit|confirm|ok/i.test(t)) {
        return { botTexts: [], next: { step: 'idle', data }, submit: true };
      }
      return {
        botTexts: ["Let's start over. What's your full name? (or type 'cancel' to stop)"],
        next: { step: 'ask_name', data: emptyFlow().data },
      };
    }
    default:
      return { botTexts: [FALLBACK_REPLY], chips: QUICK_REPLIES, next: emptyFlow() };
  }
}

export function startEnquiryFlow(): { botTexts: string[]; next: FlowState } {
  return {
    botTexts: ["Great, let's submit your enquiry! What's your full name? (type 'cancel' anytime to stop)"],
    next: { step: 'ask_name', data: emptyFlow().data },
  };
}
