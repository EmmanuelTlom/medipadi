export const metadata = {
  title: 'Affordable Health Plans in Nigeria',
  description:
    'MediPadi by MediSure offers prepaid health plans covering malaria, fever, minor infections and basic first aid. Get quality healthcare in Nigeria from ₦500/month. Pilot in Kuje, Abuja.',
  alternates: { canonical: 'https://medisure.africa/' },
  openGraph: {
    title: 'MediPadi – Affordable Health Plans in Nigeria | MediSure',
    description:
      'Prepaid health plans for malaria, fever, infections and more. Quality healthcare for every Nigerian.',
    url: 'https://medisure.africa/',
  },
};

import { ArrowRight, Stethoscope, ShieldCheck, Target, Eye, AlertTriangle } from 'lucide-react';
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
  '7-day waiting period after registration before claims are active',
  'Treatment must be diagnosed & documented at a partner clinic',
  'No coverage for pre-existing illnesses at registration',
  'Injections are included within the claim cap; excess cost is paid by member',
  'Self-medication and OTC purchases are not reimbursed',
  'No substitution of members mid-cycle',
  'One claim per calendar month per member',
];


const faqs = [
  {
    question: 'Is MediPadi the same as health insurance or an HMO?',
    answer:
      'No. MediPadi is a prepaid health support plan — not insurance or an HMO. It is designed to reduce out-of-pocket costs for the most common outpatient illnesses affecting grassroots families. There are no insurance premiums, no brokers, and no complex claims process.',
  },
  {
    question: 'Why is there a 7-day waiting period after I register?',
    answer:
      'The 7-day waiting period ensures the plan remains financially sustainable and fair for all members. It prevents individuals from registering only when they are already sick, which would make the plan unviable for everyone else.',
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
    question: 'Are pre-existing conditions covered?',
    answer:
      'No. Pre-existing illnesses at the time of registration are not covered. MediPadi is designed for new, acute outpatient episodes — not management of chronic or pre-existing conditions.',
  },
];

const dashboardByRole: Partial<Record<string, string>> = {
  PATIENT: '/member',
  DOCTOR: '/doctor',
  AGENT: '/agent',
  PROVIDER: '/provider',
  ADMIN: '/admin',
  UNASSIGNED: '/onboarding',
};

export default async function Home() {
  const user = await getCurrentUser();
  const dashboardPath = user ? (dashboardByRole[user.role] ?? '/onboarding') : null;

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-7">
              <Badge
                variant="outline"
                className="bg-emerald-900/30 border-emerald-700/30 px-4 py-2 text-emerald-400 text-sm font-medium"
              >
                Prepaid health support · Starting in Kuje
              </Badge>
              <h1 className="text-3xl max-w-[600px] md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Healthcare coverage{' '}
                <span className="gradient-title">your community can afford.</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
                MediPadi is a prepaid health support plan — not insurance. Pay
                as little as ₦1,200/month and get covered for malaria, flu,
                infections, and more at certified partner clinics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {dashboardPath ? (
                  <Button
                    asChild
                    size="lg"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Link href={dashboardPath}>
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    size="lg"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Link href="/onboarding">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
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

            <div className="relative h-[340px] lg:h-[460px] rounded-2xl overflow-hidden">
              <Image
                src="/banner3.jpg"
                alt="Healthcare for communities"
                fill
                priority
                className="object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-emerald-900/20 bg-emerald-900/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 divide-x divide-emerald-900/20">
            {[
              { value: '₦1,200/mo', label: 'Starting plan price' },
              { value: '< 5 mins', label: 'To register' },
              { value: '₦5,000', label: 'Claim cap per month' },
            ].map((item) => (
              <div key={item.label} className="py-6 px-4 text-center">
                <p className="text-xl md:text-2xl font-bold text-emerald-400">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-emerald-900/10 border-b border-emerald-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="outline" className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium">
              Who We Are
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-card border-emerald-900/20">
              <CardContent className="pt-6 space-y-3">
                <div className="bg-emerald-900/20 p-3 rounded-lg w-fit">
                  <Eye className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A Nigeria where every grassroots family — regardless of income — can access quality outpatient healthcare without
                  fear of unexpected bills. <em className="text-white/70">"Small small support when sickness shows."</em>
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-emerald-900/20">
              <CardContent className="pt-6 space-y-3">
                <div className="bg-emerald-900/20 p-3 rounded-lg w-fit">
                  <Target className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To provide structured, reliable prepaid health support for common outpatient illnesses — starting in Kuje — through
                  a network of certified providers, community agents, and technology that makes coverage simple and transparent.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Malaria danger + why subscribe */}
      <section className="py-20 bg-red-950/5 border-y border-red-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="bg-red-900/20 border-red-700/30 px-4 py-1 text-red-400 text-sm font-medium mb-4">
              The Real Cost of Doing Nothing
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Malaria Kills — and It&apos;s Expensive Too
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Malaria is the leading cause of outpatient visits in Nigeria. Without a plan, one episode can wipe out a family&apos;s weekly earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {[
              {
                stat: '#1 Killer',
                label: 'Malaria is the leading cause of death in children under 5 in Nigeria',
                color: 'red',
              },
              {
                stat: '₦5,000–₦15,000',
                label: 'Average cost of a single malaria treatment episode out-of-pocket',
                color: 'amber',
              },
              {
                stat: '97 Million',
                label: 'Nigerians exposed to malaria risk annually — mostly in communities like yours',
                color: 'orange',
              },
            ].map(({ stat, label, color }) => (
              <Card key={stat} className={`border-${color}-900/20 bg-${color}-950/5`}>
                <CardContent className="pt-6 text-center space-y-2">
                  <AlertTriangle className={`h-8 w-8 text-${color}-400 mx-auto`} />
                  <p className={`text-2xl font-bold text-${color}-400`}>{stat}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-emerald-900/20 to-teal-900/10 border-emerald-800/20 max-w-3xl mx-auto">
            <CardContent className="pt-6 pb-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Why subscribing to MediPadi makes sense</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  'Pay as little as ₦1,200/month — less than a single malaria treatment episode',
                  'No paperwork or insurance jargon — present your ID, get treated, go home',
                  'Covers malaria, flu, fever, minor infections, BP & sugar checks, injections',
                  'Fixed claim cap of ₦5,000 per episode — you know exactly what you\'re getting',
                  'Partner clinics are pre-screened and close to your community',
                  'Your family is protected before illness strikes — not after',
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 bg-emerald-900/30 p-1 rounded-full shrink-0">
                      <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium mb-4"
            >
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple. Affordable. Built for you.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From registration to treatment, every step is designed to be fast,
              clear, and accessible.
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium mb-4"
            >
              Membership Plans
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Pay once, get covered for 1 or 3 months. All plans include access
              to certified partner clinics and zero-paperwork claims.
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
                  What You Need to Know Before You Subscribe
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

      {/* FAQ Section */}
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
                  {dashboardPath ? (
                    <Button
                      asChild
                      size="lg"
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Link href={dashboardPath}>
                        Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      size="lg"
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Link href="/sign-up">Sign Up Now</Link>
                    </Button>
                  )}
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