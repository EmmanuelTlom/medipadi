'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <Card
          key={index}
          className={`bg-card border transition-all duration-200 ${
            openIndex === index
              ? 'border-emerald-700/40'
              : 'border-emerald-900/20 hover:border-emerald-800/40'
          }`}
        >
          <CardContent className="p-0">
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={openIndex === index}
            >
              <span className="text-white font-medium text-sm md:text-base leading-snug">
                {faq.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-emerald-400 flex-shrink-0 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openIndex === index && (
              <div className="px-6 pb-5">
                <div className="border-t border-emerald-900/20 pt-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}