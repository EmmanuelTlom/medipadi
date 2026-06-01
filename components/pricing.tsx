'use client';

import { Card, CardContent } from './ui/card';
import { SubscriptionPlan, User } from '@prisma/client';
import { initializePayment, verifyPayment } from '@/lib/requests/payments';
import { useForm, useRequest } from 'alova/client';
import { useState } from 'react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Check, Wallet } from 'lucide-react';
import { Spinner } from './ui/spinner';
import { alova } from '@/lib/alova';
import { subscribeWithWallet } from '@/actions/wallet';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

const Pricing = ({ user = {} as User }: { user: User }) => {
  const params = useSearchParams();
  const slug = params.get('plan');
  const router = useRouter();

  const { data: plans, loading } = useRequest(
    () =>
      alova.Get('/api/subscription-plans', {
        transform: (data: { data: SubscriptionPlan[] }) => data.data,
      }),
    {
      immediate: true,
      initialData: [],
    },
  );

  const { loading: verifying } = useRequest(
    verifyPayment({
      type: 'subscription',
      plan: params.get('plan'),
      reference: params.get('reference'),
    }),
    {
      immediate:
        params.get('subscription') === 'success' &&
        !!params.get('plan') &&
        !!params.get('reference'),
      initialData: {},
    },
  )
    .onSuccess(() => {
      router.replace(`member?new-plan=${params.get('plan')}`, { scroll: true });
    })
    .onError(({ error }) => {
      toast.error(
        error.message || 'Failed to verify payment. Please contact support.',
      );
    });

  const [walletLoading, setWalletLoading] = useState<string | null>(null);

  const handleWalletSubscribe = async (plan: SubscriptionPlan) => {
    if (!user?.id) { window.location.href = '/sign-in'; return; }
    setWalletLoading(plan.id);
    try {
      const result = await subscribeWithWallet(plan.id);
      toast.success(`Subscribed to ${result.planName}!`);
      router.push(`/member?new-plan=${result.planSlug}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setWalletLoading(null);
    }
  };

  const {
    form,
    send,
    loading: initializing,
    updateForm,
    onSuccess,
    onError,
  } = useForm(initializePayment(), {
    initialForm: {
      amount: 0,
      email: '',
      metadata: {} as Record<string, any>,
      callback_url: '',
    },
  });

  onError(({ error }) => {
    toast.error('Failed to initialize payment. Please try again.');
  });

  onSuccess(({ data }) => {
    window.location.href = data.authorization_url;
  });

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user || !user.id) {
      window.location.href = '/sign-in';
      return;
    }

    const baseUrl = `${window.location.origin}${window.location.pathname}`;

    updateForm({
      email: user.email,
      amount: plan.price,
      metadata: {
        type: 'SUBSCRIPTION',
        planId: plan.id,
        userId: user.id,
        planSlug: plan.slug,
      },
      callback_url: `${baseUrl}?subscription=success&plan=${plan.slug}`,
    });

    send();
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="border-emerald-900/30 animate-pulse"
          >
            <CardContent className="p-8 space-y-4">
              <div className="h-6 bg-emerald-900/30 rounded w-1/2" />
              <div className="h-10 bg-emerald-900/30 rounded w-2/3" />
              <div className="h-4 bg-emerald-900/30 rounded" />
              <div className="space-y-2 pt-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-4 bg-emerald-900/30 rounded w-5/6" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No plans available. Please check back soon.
      </p>
    );
  }

  // Determine the "best value" plan: longest duration, then highest price
  const bestPlan = [...plans].sort(
    (a, b) => b.duration - a.duration || b.price - a.price,
  )[0];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {plans.map((plan) => {
        const isBest = plan.id === bestPlan?.id && plans.length > 1;
        const isCurrentPlan = user?.planId === plan.id;
        const isProcessing =
          (initializing || verifying) &&
          [form.metadata?.planSlug, slug].includes(plan.slug);

        // Per-month price for multi-month plans
        const perMonth =
          plan.duration > 1
            ? `₦${Math.round(plan.price / plan.duration).toLocaleString()}/mo`
            : null;

        return (
          <Card
            key={plan.id}
            className={`relative flex flex-col border-2 transition-all duration-200 ${
              isBest
                ? 'border-emerald-500 shadow-emerald-900/30 shadow-xl scale-[1.02]'
                : 'border-emerald-900/30 hover:border-emerald-700/50'
            }`}
          >
            {isBest && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge className="bg-emerald-500 text-white px-4 py-0.5 text-xs font-semibold shadow-md">
                  Best Value
                </Badge>
              </div>
            )}

            <CardContent className="p-7 flex flex-col flex-1">
              {/* Header */}
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-1">
                  {plan.duration === 1
                    ? 'Monthly'
                    : plan.duration === 3
                      ? 'Quarterly'
                      : plan.duration === 6
                        ? 'Semi-Annual'
                        : 'Annual'}
                </p>
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              </div>

              {/* Price */}
              <div className="mb-5">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    ₦{plan.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-sm mb-1">
                    /{plan.duration === 1 ? 'month' : `${plan.duration} months`}
                  </span>
                </div>
                {perMonth && (
                  <p className="text-sm text-emerald-400 font-medium mt-0.5">
                    {perMonth} — save vs monthly
                  </p>
                )}
                {plan.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {plan.description}
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-7 flex-1">
                {[
                  `${plan.credits} outpatient visit credits`,
                  `Coverage for ${plan.duration} ${plan.duration === 1 ? 'month' : 'months'}`,
                  'Up to ₦5,000 claim cap per episode',
                  'Access to all certified partner clinics',
                  'Digital membership QR card',
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground leading-snug">
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isCurrentPlan ? (
                <Button
                  disabled
                  className="w-full bg-emerald-900/40 text-emerald-400 border border-emerald-700/30 cursor-default"
                >
                  Current Plan
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={initializing || verifying || !!walletLoading}
                    className={`w-full font-semibold ${
                      isBest
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isProcessing ? <Spinner /> : `Pay with Card`}
                  </Button>

                  {(user?.walletBalance ?? 0) >= plan.price && (
                    <Button
                      onClick={() => handleWalletSubscribe(plan)}
                      disabled={!!walletLoading || initializing || verifying}
                      variant="outline"
                      className="w-full border-teal-700/40 text-teal-300 hover:bg-teal-900/20 hover:text-teal-200"
                    >
                      {walletLoading === plan.id ? (
                        <Spinner />
                      ) : (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Pay with Wallet (₦{(user?.walletBalance ?? 0).toLocaleString()} available)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Pricing;
