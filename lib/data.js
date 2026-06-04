import {
  CreditCard,
  FileText,
  QrCode,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

export const features = [
  {
    icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
    title: "Register in Minutes",
    description:
      "Sign up online or through MediPadi. You get a unique membership ID and QR code immediately after registration.",
  },
  {
    icon: <CreditCard className="h-6 w-6 text-emerald-400" />,
    title: "Affordable Monthly Plans",
    description:
      "Starting from ₦1,200/month. Pay and activate the same day — no hidden fees, no paperwork.",
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
    initials: "FK",
    name: "Fatima K.",
    role: "Member, Gwagwa",
    quote:
      "I got malaria last month and was treated the same day at no extra cost. MediPadi is the best thing that has happened to my family's health.",
  },
  {
    initials: "CN",
    name: "Chukwudi N.",
    role: "Member, Zuba",
    quote:
      "Registration was quick and I received my membership ID immediately. When I needed care, it was as simple as showing my phone.",
  },
];

export const creditBenefits = [
  "Coverage begins after a <strong class='text-emerald-400'>7-day waiting period</strong> from your activation date",
  "Each illness episode is covered up to a <strong class='text-emerald-400'>₦5,000 claim cap</strong> per visit",
  "One <strong class='text-emerald-400'>claim per calendar month</strong> per member",
  "Only treatments at <strong class='text-emerald-400'>certified MediPadi partner clinics</strong> are covered — no OTC purchases",
];
