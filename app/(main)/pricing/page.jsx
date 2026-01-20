import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Shield, Check } from 'lucide-react';
import { PricingTable } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Pricing from '@/components/pricing';
import { createPaymentSession } from '@/lib/payments';

function PaymentButton({ amount, currency }) {
  const handlePayment = async () => {
    try {
      const session = await createPaymentSession(
        amount,
        currency,
        'https://example.com/success',
        'https://example.com/cancel',
      );

      window.location.href = session.url;
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
    >
      Pay Now
    </button>
  );
}

export default async function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="flex justify-start mb-2">
        <Link
          href="/"
          className="flex items-center text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="max-w-full mx-auto mb-12 text-center">
        <Badge
          variant="outline"
          className="bg-emerald-900/30 border-emerald-700/30 px-4 py-1 text-emerald-400 text-sm font-medium mb-4"
        >
          Affordable Healthcare
        </Badge>

        <h1 className="text-4xl md:text-5xl font-bold gradient-title mb-4">
          Simple, Transparent Pricing
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect consultation package that fits your healthcare
          needs with no hidden fees or long-term commitments
        </p>
      </div>

      {/* Pricing Table Section */}
      {/* <Pricing /> */}

      {/* Payment Button Section */}
      <div className="max-w-md mx-auto mb-12">
        <PaymentButton amount={5000} currency="usd" />
      </div>

      {/* FAQ Section - Optional */}
      <div className="max-w-3xl mx-auto mt-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Questions? We're Here to Help
        </h2>
        <p className="text-muted-foreground mb-4">
          Contact our support team at support@medipadi.com
        </p>
      </div>
    </div>
  );
}
