import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const sections = [
  {
    title: '1. Who We Are',
    content: [
      'MediPadi is a prepaid health support plan operated by Medisure Care Services Ltd., registered in Nigeria. Our pilot operations are based in Kuje, Abuja, with plans to expand across the Federal Capital Territory and nationwide.',
      'References to "MediPadi", "we", "us", or "our" in this policy refer to Medisure Care Services Ltd. and the MediPadi platform.',
    ],
  },
  {
    title: '2. Information We Collect',
    content: [
      'When you register as a member or agent, we collect the following personal information:',
    ],
    list: [
      'Full name and date of birth',
      'Phone number and home address',
      'Plan type and payment records',
      'Names and details of covered family members (for family plans)',
      'Identity verification information where required',
    ],
    contentAfter: [
      'When you use our services at a partner clinic or pharmacy, we also collect:',
    ],
    listAfter: [
      'Diagnosis and treatment records submitted by partner providers',
      'Claim dates, illness type, and treatment cost',
      'Provider settlement and audit records',
    ],
  },
  {
    title: '3. How We Use Your Information',
    content: [
      'We use your personal data strictly to provide and improve the MediPadi health support service. Specifically, we use it to:',
    ],
    list: [
      'Register and activate your membership',
      'Verify your eligibility when you visit a partner provider',
      'Process and settle claims with partner clinics and pharmacies',
      'Communicate plan updates, renewals, and service changes to you',
      'Monitor and audit provider activity to prevent fraud or overbilling',
      'Improve our operations based on anonymised usage data',
      'Comply with legal obligations under Nigerian law',
    ],
    contentAfter: [
      'We do not use your data for targeted advertising. We do not sell your data to third parties.',
    ],
  },
  {
    title: '4. How We Share Your Information',
    content: [
      'We share your information only where necessary to deliver the service:',
    ],
    list: [
      'Partner clinics and pharmacies — to verify your membership and process treatment claims',
      'MediPadi agents — only the information needed to confirm your registration status',
      'Payment processors — to handle subscription payments securely',
      'Regulatory or legal authorities — where required by Nigerian law or court order',
    ],
    contentAfter: [
      'We do not share your medical records or personal data with any commercial third party for marketing or research purposes without your explicit consent.',
    ],
  },
  {
    title: '5. Data Retention',
    content: [
      'We retain your personal and claims data for a minimum of 3 years from the date of your last active plan period. This is required for financial audit purposes and to handle any disputes relating to claims or payments.',
      'After this period, data is securely deleted or anonymised unless a longer retention period is required by law.',
    ],
  },
  {
    title: '6. Data Security',
    content: [
      'We take reasonable technical and organisational steps to protect your personal data against unauthorised access, loss, or misuse. These measures include:',
    ],
    list: [
      'Secure, encrypted storage of member records',
      'Access controls limiting data visibility to authorised staff only',
      'Weekly audits of provider claim submissions',
      'Complaint and breach resolution channels',
    ],
    contentAfter: [
      'While we take these precautions seriously, no digital system is completely immune to security risks. If you suspect any unauthorised use of your data, please contact us immediately.',
    ],
  },
  {
    title: '7. Your Rights',
    content: [
      'As a MediPadi member, you have the right to:',
    ],
    list: [
      'Request a copy of the personal data we hold about you',
      'Request corrections to any inaccurate or outdated information',
      'Request deletion of your data, subject to our legal retention obligations',
      'Withdraw consent for optional data uses at any time',
      'Lodge a complaint with us or with the relevant Nigerian data protection authority',
    ],
    contentAfter: [
      'To exercise any of these rights, please contact us using the details in Section 10 below.',
    ],
  },
  {
    title: '8. Children and Family Members',
    content: [
      'MediPadi family plans may cover minors. Where a plan covers individuals under the age of 18, the primary account holder (adult registrant) is responsible for providing accurate information and consenting to this policy on their behalf.',
      'We do not knowingly collect data from minors independently.',
    ],
  },
  {
    title: '9. Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time as our services evolve. When we make significant changes, we will notify registered members via SMS or our platform. The date at the bottom of this page reflects when the policy was last updated.',
      'Continued use of MediPadi services after an update constitutes acceptance of the revised policy.',
    ],
  },
  {
    title: '10. Contact Us',
    content: [
      'If you have any questions, concerns, or requests relating to your personal data or this Privacy Policy, please contact us:',
    ],
    list: [
      'Company: Medisure Care Services Ltd.',
      'Product: MediPadi',
      'Location: Kuje, Abuja, Nigeria',
      'Email: privacy@medipadi.com',
    ],
    contentAfter: [
      'We aim to respond to all data-related enquiries within 5 working days.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background min-h-screen">

      {/* Header */}
      <section className="py-20 border-b border-emerald-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <Badge
              variant="outline"
              className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium"
            >
              Legal
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              This policy explains how Medisure Care Services Ltd. (operating as <strong className="text-white">MediPadi</strong>) 
              collects, uses, stores, and protects your personal information when you use our health support plan.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: <span className="text-emerald-400 font-medium">January 2025</span>
            </p>
          </div>
        </div>
      </section>

      {/* Intro summary card */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-emerald-900/10 border-emerald-700/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Our Commitment to You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    'We do not sell your personal data to any third party.',
                    'We do not use your data for advertising purposes.',
                    'Your medical and claims information is shared only with your treating provider.',
                    'You can request access to or deletion of your data at any time.',
                    'We collect only what is necessary to deliver the MediPadi service.',
                  ].map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 bg-emerald-900/20 p-1 rounded-full flex-shrink-0">
                        <svg className="h-3 w-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-muted-foreground text-sm">{point}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {sections.map((section, index) => (
              <Card key={index} className="bg-card border-emerald-900/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg font-semibold">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.content.map((para, i) => (
                    <p key={i} className="text-muted-foreground text-sm leading-relaxed">
                      {para}
                    </p>
                  ))}

                  {section.list && (
                    <ul className="space-y-2 pl-1">
                      {section.list.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-1 bg-emerald-900/20 p-1 rounded-full flex-shrink-0">
                            <svg className="h-3 w-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.contentAfter?.map((para, i) => (
                    <p key={i} className="text-muted-foreground text-sm leading-relaxed">
                      {para}
                    </p>
                  ))}

                  {section.listAfter && (
                    <ul className="space-y-2 pl-1">
                      {section.listAfter.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-1 bg-emerald-900/20 p-1 rounded-full flex-shrink-0">
                            <svg className="h-3 w-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Back to home */}
            <div className="pt-4 text-center">
              <Button asChild variant="outline" className="border-emerald-700/30 hover:bg-muted/80">
                <Link href="/">← Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}