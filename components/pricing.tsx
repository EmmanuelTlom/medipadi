'use client';

import { Card, CardContent } from './ui/card';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Check } from 'lucide-react';
import { SubscriptionPlan, User } from '@prisma/client';
import { alova } from '@/lib/alova';
import { toast } from 'sonner';
import { useForm, useRequest } from 'alova/client';
import { Spinner } from './ui/spinner';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

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
    () =>
      alova.Get<{ message: string }>('/api/subscription/subscribe', {
        params: {
          plan: params.get('plan'),
          reference: params.get('reference'),
        },
      }),
    {
      immediate:
        params.get('subscription') === 'success' &&
        !!params.get('plan') &&
        !!params.get('reference'),
      initialData: {},
    },
  ).onSuccess(() => {
    router.replace(`member?new-plan=${params.get('plan')}`, { scroll: true });
  });

  const {
    form,
    send,
    loading: initializing,
    updateForm,
    onSuccess,
    onError,
  } = useForm(
    (fm) =>
      alova.Post('/api/subscription/subscribe', fm, {
        transform: (data: { data: { authorization_url: string } }) => data.data,
      }),
    {
      initialForm: {
        amount: 0,
        email: '',
        metadata: {} as Record<string, any>,
        callback_url: '',
      },
    },
  );

  onError(({ error }) => {
    console.error('Payment initialization error:', error);
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

    const baseUrl = `${window.location.origin}/${window.location.pathname}`;

    updateForm({
      email: user.email,
      amount: plan.price, // Convert to kobo
      metadata: {
        planId: plan.id,
        planSlug: plan.slug,
        userId: user.id,
      },
      callback_url: `${baseUrl}?subscription=success&plan=${plan.slug}`,
    });

    send();
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="border-emerald-900/30 shadow-lg bg-gradient-to-b from-emerald-950/30 to-transparent animate-pulse"
          >
            <CardContent className="p-8">
              <div className="h-8 bg-emerald-900/30 rounded mb-4" />
              <div className="h-12 bg-emerald-900/30 rounded mb-4" />
              <div className="h-6 bg-emerald-900/30 rounded mb-6" />
              <div className="space-y-3">
                <div className="h-4 bg-emerald-900/30 rounded" />
                <div className="h-4 bg-emerald-900/30 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`border-emerald-900/30 shadow-lg bg-gradient-to-b from-emerald-950/30 to-transparent ${
            plan.slug === 'yearly' ? 'border-emerald-600' : ''
          }`}
        >
          <CardContent className="p-8 h-full flex flex-col justify-between">
            <div>
              {plan.slug === 'yearly' && (
                <Badge className="bg-emerald-600 text-white mb-4">
                  Best Value
                </Badge>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-emerald-400">
                  ₦{plan.price.toLocaleString()}
                </span>
                <span className="text-muted-foreground ml-2">
                  / {plan.duration} {plan.duration === 1 ? 'month' : 'months'}
                </span>
              </div>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-white">
                    {plan.credits} consultation credits
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-white">
                    Valid for {plan.duration}{' '}
                    {plan.duration === 1 ? 'month' : 'months'}
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Access to all specialists</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-white">24/7 video consultations</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 flex items-end">
              {user?.planId === plan.id ? (
                <Button disabled className="w-full bg-emerald-600 text-white">
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubscribe(plan)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  {(initializing || verifying) &&
                  [form.metadata.planSlug, slug].includes(plan.slug) ? (
                    <Spinner key={plan.id} />
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Pricing;
