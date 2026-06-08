'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, MapPin, Phone, User, UserPlus } from 'lucide-react';
import { PhotoCapture } from '@/components/photo-capture';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useForm, useRequest } from 'alova/client';

import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as Member } from '@prisma/client';
import { Money } from '@toneflix/money';
import { RegistrationSuccessDialog } from './registration-success-dialog';
import { ValidationException } from '@/lib/Exceptions/ValidationException';
import { alova } from '@/lib/alova';
import { getUser } from '@/lib/requests/users';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  credits: number;
  duration: number;
}


export function MemberRegistration({
  user,
}: {
  user: { walletBalance: number };
}) {
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState<
    ValidationException<typeof formData> | undefined
  >(new ValidationException(''));
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    fetch('/api/subscription-plans')
      .then((res) => res.json())
      .then((data) => {
        setSubscriptionPlans(data.data || []);
        setLoadingPlans(false);
      })
      .catch(() => {
        toast.error('Failed to load subscription plans');
        setLoadingPlans(false);
      });
  }, []);

  const { send } = useRequest(getUser(), {
    initialData: { data: user },
    immediate: false,
  }).onSuccess(({ data }) => Object.assign(user, data.data));

  const {
    loading,
    send: registerMember,
    form: formData,
    onError,
    onSuccess,
    updateForm: setFormData,
  } = useForm(
    (form) =>
      alova.Post<{ data: Member }>('/api/agent/register-member', form, {
        name: 'register-member',
      }),
    {
      resetAfterSubmiting: true,
      initialForm: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        location: '',
        planType: 'monthly',
        subscriptionCost: 0,
        profilePhotoUrl: '',
      },
    },
  );

  onError(({ error }) => {
    setError(error);
    toast.error(error.message);
  });

  onSuccess(({ data }: { data: any }) => {
    const member = data.member;
    toast.success(`Successfully registered ${member.firstName} ${member.lastName}!`);
    setSuccessData(member);
    setPhotoUrl('');
    send();
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const selectedPlan = subscriptionPlans.find((p) => p.slug === formData.planType);
    if (!selectedPlan) {
      toast.error('Invalid subscription plan selected');
      return;
    }

    const subscriptionCost = selectedPlan.price;
    if ((user.walletBalance || 0) < subscriptionCost) {
      toast.error(`Insufficient wallet balance. Required: ${Money.format(subscriptionCost)}, Available: ${Money.format(user.walletBalance || 0)}`);
      return;
    }

    setFormData({ subscriptionCost, profilePhotoUrl: photoUrl });
    await registerMember();
  };

  const selectedPlan = subscriptionPlans.find((p) => p.slug === formData.planType);
  const selectedPlanCost = selectedPlan?.price || 0;
  const walletBalance = user.walletBalance || 0;
  const hasSufficientFunds = walletBalance >= selectedPlanCost;

  return (
    <div className="space-y-6">
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-emerald-400" />
            Register New Member
          </CardTitle>
          <CardDescription>Register a new patient and pay for their subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="firstName" name="firstName" placeholder="John" value={formData.firstName} onChange={handleInputChange} className="pl-10" disabled={loading} />
                </div>
                <FieldError errors={error?.errors?.firstName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleInputChange} className="pl-10" disabled={loading} />
                </div>
                <FieldError errors={error?.errors?.lastName} />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="john.doe@example.com" value={formData.email} onChange={handleInputChange} className="pl-10" disabled={loading} />
              </div>
              <FieldError errors={error?.errors?.email} />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+2348012345678" value={formData.phoneNumber} onChange={handleInputChange} className="pl-10" disabled={loading} />
              </div>
              <FieldError errors={error?.errors?.phoneNumber} />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-muted-foreground text-xs">(used in membership ID)</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="location" name="location" placeholder="e.g. Kuje, Gwagwa, Zuba" value={formData.location} onChange={handleInputChange} className="pl-10" disabled={loading} />
              </div>
              <p className="text-xs text-muted-foreground">Creates an ID like <span className="font-mono text-emerald-400">MED-KUJ001</span></p>
            </div>

            {/* Member Photo */}
            <div className="space-y-2">
              <Label>
                Member Photo <span className="text-muted-foreground text-xs">(recommended for identity verification)</span>
              </Label>
              <PhotoCapture value={photoUrl} onChange={setPhotoUrl} />
            </div>

            {/* Plan */}
            <div className="space-y-2">
              <Label htmlFor="planType">Subscription Plan</Label>
              <Select
                value={formData.planType}
                onValueChange={(value) => setFormData({ ...formData, planType: value })}
                disabled={loading || loadingPlans}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingPlans ? 'Loading plans...' : 'Select a plan'} />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.slug}>
                      <div className="flex items-center justify-between w-full">
                        <span>{plan.name}</span>
                        <span className="ml-4 text-emerald-400">
                          {Money.format(plan.price)}/{plan.duration === 1 ? 'month' : `${plan.duration}mo`}
                          {` (${plan.credits} credits)`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={error?.errors?.planType} />
            </div>

            {/* Cost Summary */}
            <Card className="bg-emerald-950/20 border-emerald-900/30">
              <CardContent className="pt-5 pb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subscription Cost:</span>
                    <span className="font-semibold">{Money.format(selectedPlanCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your Wallet Balance:</span>
                    <span className={`font-semibold ${hasSufficientFunds ? 'text-emerald-400' : 'text-red-400'}`}>
                      {Money.format(walletBalance)}
                    </span>
                  </div>
                  {selectedPlan && (
                    <div className="flex justify-between">
                      <span>Credits Included:</span>
                      <span className="font-semibold text-emerald-400">{selectedPlan.credits} credits</span>
                    </div>
                  )}
                  <div className="border-t border-emerald-900/30 pt-2 mt-2 flex justify-between font-bold">
                    <span>Balance After Registration:</span>
                    <span className={hasSufficientFunds ? 'text-emerald-400' : 'text-red-400'}>
                      {Money.format(walletBalance - selectedPlanCost)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!hasSufficientFunds && (
              <div className="bg-red-950/20 border border-red-900/30 rounded-md p-3">
                <p className="text-sm text-red-400">Insufficient wallet balance. Please fund your wallet first.</p>
              </div>
            )}

            {loading && <BarLoader width="100%" color="#10b981" />}

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading || !hasSufficientFunds}>
              <UserPlus className="h-4 w-4 mr-2" />
              {loading ? 'Registering...' : `Register Member (${Money.format(selectedPlanCost)})`}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-blue-900/20 bg-blue-950/10">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-blue-400">Important Notes:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>The subscription cost will be deducted from your wallet</li>
              <li>Member will receive login credentials via email</li>
              <li>Member will have immediate access to the platform</li>
              <li>Member must wait <strong className="text-white">7 days</strong> after subscription before claims are active</li>
              <li>Each member is entitled to <strong className="text-white">1 claim per calendar month</strong></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <RegistrationSuccessDialog
        open={!!successData}
        onOpenChange={(open: any) => { if (!open) setSuccessData(null); }}
        memberData={successData}
      />
    </div>
  );
}
