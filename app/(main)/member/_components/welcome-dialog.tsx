'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  PartyPopper,
  CreditCard,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Fullsscreen from '@/components/ui/fullscreen';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  credits: number;
  duration: number;
  isActive: boolean;
}

export function WelcomeDialog() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const newPlanSlug = searchParams.get('new-plan');

    if (newPlanSlug) {
      fetchPlanDetails(newPlanSlug);
    }
  }, [searchParams]);

  const fetchPlanDetails = async (slug: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subscription-plans/${slug}`);
      const { data: plan } = await response.json();

      if (plan) {
        setPlan(plan);
        setOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch plan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Remove the query parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('new-plan');
    router.replace(url.pathname);
  };

  if (loading)
    return (
      <Fullsscreen>
        <div className="w-[300px] space-y-2">
          <Progress value={undefined} className="animate-indeterminate" />
          <p className="text-center text-sm text-muted-foreground">
            Please Wait...
          </p>
        </div>
      </Fullsscreen>
    );
  if (!plan) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] border-emerald-900/30">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                <PartyPopper className="h-16 w-16 text-emerald-400 relative" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Welcome to {plan.name}!
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Your subscription has been successfully activated
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Plan Highlights */}
            <div className="bg-gradient-to-br from-emerald-950/50 to-emerald-900/20 border border-emerald-900/30 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-2xl font-bold text-white">{plan.name}</p>
                </div>
                <Badge className="bg-emerald-600">Active</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-900/30">
                <div className="space-y-1">
                  <div className="flex items-center text-emerald-400">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <p className="text-sm font-medium">Credits</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {plan.credits}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-emerald-400">
                    <Calendar className="h-4 w-4 mr-2" />
                    <p className="text-sm font-medium">Duration</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {plan.duration} {plan.duration === 1 ? 'month' : 'months'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center text-emerald-400">
                <Sparkles className="h-4 w-4 mr-2" />
                <p className="font-semibold">What's Included</p>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    {plan.credits} video consultation credits
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Access to all verified specialists
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    24/7 appointment booking
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Secure medical records storage
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Digital membership ID and QR code
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handleClose}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full border-emerald-900/30"
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
