import { ArrowRight, Stethoscope, ShieldCheck, Users, HeartPulse } from 'lucide-react';
import FaqAccordion from '@/components/faq-accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { creditBenefits, features, testimonials } from '@/lib/data';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import Pricing from '@/components/pricing';
import { getCurrentUser } from '@/actions/onboarding';

const coveredIllnesses = [
  { icon: '🦟', name: 'Malaria', desc: 'Uncomplicated malaria diagnosis & treatment' },
  { icon: '🌡️', name: 'Flu & Fever', desc: 'Fever management and flu care' },
  { icon: '💊', name: 'Minor Infections', desc: 'Bacterial and minor infection treatment' },
  { icon: '🩹', name: 'Basic First Aid', desc: 'Wound care and basic emergency aid' },
  { icon: '🩺', name: 'BP & Sugar Checks', desc: 'Blood pressure and glucose monitoring' },
  { icon: '💉', name: 'Injections', desc: 'Covered within your claim cap' },
];

const planRules = [
  '14-day waiting period after registration',
  'Treatment must be diagnosed & documented at a partner clinic',
  'No coverage for pre-existing illnesses at registration',
  'Injections are included within the claim cap; excess cost is paid by member',
  'Self-medication and OTC purchases are not reimbursed',
  'No substitution of members mid-cycle',
];

const growthPhases = [
  {
    phase: 'Phase 1',
    title: 'Kuje & Surrounding Villages',
    desc: 'Pilot launch — test technology, onboard providers, recruit agents, and learn.',
    icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
    active: true,
  },
  {
    phase: 'Phase 2',
    title: 'Abuja Expansion',
    desc: 'Scale with refined SOPs and social proof gathered from the pilot.',
    icon: <Users className="h-5 w-5 text-emerald-400" />,
    active: false,
  },
  {
    phase: 'Phase 3',
    title: 'National Scale',
    desc: 'Nationwide partnerships, tiered pricing, and premium plan options.',
    icon: <HeartPulse className="h-5 w-5 text-emerald-400" />,
    active: false,
  },
];

const pilotTimeline = [
  {
    phase: 'Provider Setup',
    timeframe: 'Week 1–2',
    actions: 'Secure 3–4 providers, negotiate package pricing, sign contracts, train on tech.',
  },
  {
    phase: 'Agent Recruitment',
    timeframe: 'Week 3',
    actions: 'Recruit & train 20–30 agents, prepare branding & marketing materials.',
  },
  {
    phase: 'Soft Launch',
    timeframe: 'Month 1',
    actions: 'Target 300–500 members, test claims & tech system, monitor provider compliance.',
  },
  {
    phase: 'Aggressive Enrollment',
    timeframe: 'Month 2–3',
    actions: 'Expand marketing, reach 2,000–3,000 members, monitor claims, adjust operations.',
  },
];

const faqs = [
  {
    question: 'Is MediPadi the same as health insurance or an HMO?',
    answer:
      'No. MediPadi is a prepaid health support plan — not insurance or an HMO. It is designed to reduce out-of-pocket costs for the most common outpatient illnesses affecting grassroots families. There are no insurance premiums, no brokers, and no complex claims process.',
  },
  {
    question: 'Why is there a 14-day waiting period after I register?',
    answer:
      'The 14-day waiting period ensures the plan remains financially sustainable and fair for all members. It prevents individuals from registering only when they are already sick, which would make the plan unviable for everyone else.',
  },
  {
    question: 'What happens if my treatment costs more than ₦5,000?',
    answer:
      'The claim cap is ₦5,000 per illness episode. Any treatment cost that exceeds this cap is paid directly by the member at the point of care. MediPadi covers up to the cap and no more.',
  },
  {
    question: 'Can I visit any clinic or pharmacy?',
    answer:
      'No. Treatment must be received at an approved MediPadi partner clinic or pharmacy. Only diagnosed and documented treatments at certified providers are covered. A list of partner providers will be shared with you upon registration.',
  },
  {
    question: 'Are self-medication or over-the-counter drug purchases covered?',
    answer:
      'No. Self-medication and OTC purchases are not reimbursed under any plan. Coverage requires a diagnosis and documentation by a qualified healthcare provider at a partner facility.',
  },
  {
    question: 'Can I add or swap family members on my plan mid-cycle?',
    answer:
      'No. Member substitution is not allowed mid-cycle. The names registered at the start of the plan period are the only individuals covered for that cycle.',
  },
  {
    question: 'How do providers get paid?',
    answer:
      'MediPadi settles all partner providers every Friday via weekly payments. Pricing per illness is fixed and negotiated upfront, so there are no billing disputes or delayed payments.',
  },
  {
    question: 'How do I become a MediPadi Community Agent?',
    answer:
      'Reach out to us to express interest. Agents earn ₦500 per Individual registration, ₦1,500 per Family 4, and ₦2,000 per Family 5–7. You will receive training and all marketing materials needed to educate and onboard members in your community.',
  },
  {
    question: 'What is the minimum commitment to join?',
    answer:
      'All plans require a minimum of 3 months upfront payment to activate. This means ₦3,600 for Individual, ₦12,000 for Family 4, and ₦18,000 for Family 5–7. Renewal is monthly after the initial period.',
  },
  {
    question: 'Are pre-existing conditions covered?',
    answer:
      'No. Pre-existing illnesses at the time of registration are not covered. MediPadi is designed for new, acute outpatient episodes — not management of chronic or pre-existing conditions.',
  },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge
                variant="outline"
                className="bg-emerald-900/30 border-emerald-700/30 px-4 py-2 text-emerald-400 text-sm font-medium"
              >
                Healthcare made simple
              </Badge>
              <h1 className="text-3xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Get your medical needs <br />
                <span className="text-italic">met</span>
                <span className="gradient-title"> anytime, anywhere.</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-md">
                Book appointments, consult via video, and manage your healthcare
                journey all in one secure platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Link href="/onboarding">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-emerald-700/30 hover:bg-muted/80"
                >
                  <Link href="/doctors">Find Doctors</Link>
                </Button>
              </div>
            </div>

            <div className="relative h-[400px] lg:h-[500px] rounded-xl overflow-hidden">
              <Image
                src="/banner3.jpg"
                alt="Doctor consultation"
                fill
                priority
                className="object-cover md:pt-14 rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section — NEW */}
      <section className="py-16 bg-emerald-900/10 border-y border-emerald-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge
              variant="outline"
              className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium"
            >
              Our Vision
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Affordable health support for grassroots communities
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              MediPadi is a <span className="text-emerald-400 font-medium">prepaid health support plan</span> — not insurance or an HMO.
              Starting in Kuje and surrounding villages, our mission is to provide structured, reliable outpatient
              care for everyday families. <em className="text-white/70">"Small small support when sickness shows."</em>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our platform makes healthcare accessible with just a few clicks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-card border-emerald-900/20 hover:border-emerald-800/40 transition-all duration-300"
              >
                <CardHeader className="pb-2">
                  <div className="bg-emerald-900/20 p-3 rounded-lg w-fit mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Covered Illnesses & Services — NEW */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium mb-4"
            >
              Coverage
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Covered Illnesses &amp; Services
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              MediPadi covers the most common outpatient conditions that affect grassroots families every day.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {coveredIllnesses.map((item, index) => (
              <Card
                key={index}
                className="bg-card border-emerald-900/20 hover:border-emerald-800/40 transition-all duration-300"
              >
                <CardContent className="pt-6 flex items-start gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Plan Rules */}
          <Card className="bg-muted/20 border-emerald-900/30 max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-emerald-400" />
                Plan Rules &amp; Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {planRules.map((rule, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-1 bg-emerald-900/20 p-1 rounded-full">
                      <svg
                        className="h-4 w-4 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-muted-foreground text-sm">{rule}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section with green medical styling */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium mb-4"
            >
              Affordable Healthcare
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Consultation Packages
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose the perfect consultation package that fits your healthcare
              needs
            </p>
          </div>

          <div className="mx-auto">
            {/* Clerk Pricing Table */}
            <Pricing user={user} />

            {/* Description */}
            <Card className="mt-12 bg-muted/20 border-emerald-900/30">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2 text-emerald-400" />
                  How Our Credit System Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {creditBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-3 mt-1 bg-emerald-900/20 p-1 rounded-full">
                        <svg
                          className="h-4 w-4 text-emerald-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </div>
                      <p
                        className="text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: benefit }}
                      />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials with green medical accents */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium mb-4"
            >
              Success Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Hear from patients and doctors who use our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-emerald-900/20 hover:border-emerald-800/40 transition-all"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-900/20 flex items-center justify-center mr-4">
                      <span className="text-emerald-400 font-bold">
                        {testimonial.initials}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    &quot;{testimonial.quote}&quot;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Roadmap — NEW */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium mb-4"
            >
              Growth Roadmap
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Where We&apos;re Headed
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              MediPadi starts local and grows with trust, data, and community proof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {growthPhases.map((phase, index) => (
              <Card
                key={index}
                className={`bg-card transition-all duration-300 ${
                  phase.active
                    ? 'border-emerald-600/60 shadow-emerald-900/20 shadow-lg'
                    : 'border-emerald-900/20 opacity-70'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                      {phase.phase}
                    </span>
                    {phase.active && (
                      <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-700/30 px-2 py-0.5 rounded-full">
                        Active Now
                      </span>
                    )}
                  </div>
                  <div className="bg-emerald-900/20 p-3 rounded-lg w-fit mb-2">
                    {phase.icon}
                  </div>
                  <CardTitle className="text-lg font-semibold text-white">
                    {phase.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{phase.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pilot Rollout Timeline — NEW */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium mb-4"
            >
              Pilot Rollout
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              60–90 Day Launch Plan
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A structured, phased rollout starting in Kuje — built to test, learn, and scale responsibly.
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-emerald-900/40 hidden sm:block" />

            <div className="space-y-6">
              {pilotTimeline.map((item, index) => (
                <div key={index} className="flex gap-6 items-start">
                  {/* Step dot */}
                  <div className="relative z-10 flex-shrink-0 w-9 h-9 rounded-full bg-emerald-900/40 border border-emerald-700/40 flex items-center justify-center hidden sm:flex">
                    <span className="text-emerald-400 text-xs font-bold">{index + 1}</span>
                  </div>
                  <Card className="flex-1 bg-card border-emerald-900/20 hover:border-emerald-800/40 transition-all duration-300">
                    <CardContent className="pt-5 pb-5">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-white">{item.phase}</span>
                        <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-700/30 px-2 py-0.5 rounded-full">
                          {item.timeframe}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.actions}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section — NEW */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium mb-4"
            >
              Got Questions?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to know about MediPadi before you register.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <FaqAccordion faqs={faqs} />
          </div>
        </div>
      </section>

      {/* CTA Section with green medical styling */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-emerald-900/30 to-emerald-950/20 border-emerald-800/20">
            <CardContent className="p-8 md:p-12 lg:p-16 relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to take control of your healthcare?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Join thousands of users who have simplified their healthcare
                  journey with our platform. Get started today and experience
                  healthcare the way it should be.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Link href="/sign-up">Sign Up Now</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-emerald-700/30 hover:bg-muted/80"
                  >
                    <Link href="#pricing">View Pricing</Link>
                  </Button>
                </div>
              </div>

              {/* Decorative healthcare elements */}
              <div className="absolute right-0 top-0 w-[300px] h-[300px] bg-emerald-800/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute left-0 bottom-0 w-[200px] h-[200px] bg-emerald-700/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}