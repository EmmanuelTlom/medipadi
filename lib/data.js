import {
  CreditCard,
  FileText,
  QrCode,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

export const features = [
  {
    icon: <Users className="h-6 w-6 text-emerald-400" />,
    title: "Register in Minutes",
    description:
      "Sign up online or through a MediPadi community agent near you. You get a unique membership ID and QR code immediately.",
  },
  {
    icon: <CreditCard className="h-6 w-6 text-emerald-400" />,
    title: "Affordable Monthly Plans",
    description:
      "Individual from ₦1,200/month. Family of 4 from ₦4,000/month. Family of 5–7 from ₦6,000/month. Pay and activate the same day.",
  },
  {
    icon: <QrCode className="h-6 w-6 text-emerald-400" />,
    title: "Digital Membership Card",
    description:
      "Your QR code and membership ID live on your phone. Show it at any certified MediPadi clinic for instant identity verification.",
  },
  {
    icon: <Stethoscope className="h-6 w-6 text-emerald-400" />,
    title: "Get Treated at Partner Clinics",
    description:
      "Malaria, flu, infections, BP checks, basic first aid — covered at any MediPadi-certified clinic near you. No out-of-pocket surprises.",
  },
  {
    icon: <FileText className="h-6 w-6 text-emerald-400" />,
    title: "Zero Paperwork for Members",
    description:
      "The clinic submits your claim directly through the platform. No receipts to keep, no forms to fill. Just get better.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
    title: "Community Agent Network",
    description:
      "Trained agents in your neighbourhood help you register, renew, and get answers. Healthcare support that speaks your language.",
  },
];

export const testimonials = [
  {
    initials: "AO",
    name: "Amaka O.",
    role: "Member, Kuje",
    quote:
      "Before MediPadi, I would wait until I was very sick before going to the clinic because of the cost. Now I just show my QR code and get treated right away.",
  },
  {
    initials: "IM",
    name: "Ibrahim M.",
    role: "Community Agent",
    quote:
      "I have registered over 50 families in my area. The platform is simple and my members can always check their status by themselves.",
  },
  {
    initials: "BA",
    name: "Nurse Blessing A.",
    role: "Partner Clinic",
    quote:
      "Verification is instant — we scan the QR code, confirm coverage, and start treatment. Claims are settled every Friday. No delays.",
  },
];

export const creditBenefits = [
  "Coverage begins after a <strong class='text-emerald-400'>14-day waiting period</strong> from your activation date",
  "Each illness episode is covered up to a <strong class='text-emerald-400'>₦5,000 claim cap</strong> per visit",
  "A minimum of <strong class='text-emerald-400'>3 months upfront payment</strong> is required to activate any plan",
  "Only treatments at <strong class='text-emerald-400'>certified MediPadi partner clinics</strong> are covered — no OTC purchases",
];
