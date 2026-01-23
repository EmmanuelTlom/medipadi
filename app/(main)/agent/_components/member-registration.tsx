'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, Phone, User, UserPlus } from 'lucide-react';
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
import { RegistrationSuccessDialog } from './registration-success-dialog';
import { ValidationException } from '@/lib/Exceptions/ValidationException';
import { alova } from '@/lib/alova';
import { getUser } from '@/lib/requests/users';
import { toast } from 'sonner';
import { Money } from '@/lib/money';

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
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Fetch subscription plans on mount
  useEffect(() => {
    fetch('/api/subscription-plans')
      .then((res) => res.json())
      .then((data) => {
        setSubscriptionPlans(data.data || []);
        setLoadingPlans(false);
      })
      .catch((err) => {
        console.error('Failed to fetch subscription plans:', err);
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
        planType: 'monthly',
        subscriptionCost: 0,
      },
    },
  );

  onError(({ error }) => {
    setError(error);
    toast.error(error.message);
  });

  onSuccess(({ data }) => {
    toast.success(
      `Successfully registered ${formData.firstName} ${formData.lastName}!`,
    );

    // Show success dialog instead of reloading
    setSuccessData(data.data);
    send();
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phoneNumber
    ) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Get selected plan cost
    const selectedPlan = subscriptionPlans.find(
      (p) => p.slug === formData.planType,
    );
    if (!selectedPlan) {
      toast.error('Invalid subscription plan selected');
      return;
    }

    const subscriptionCost = selectedPlan.price;
    const walletBalance = user.walletBalance || 0;

    if (walletBalance < subscriptionCost) {
      toast.error(
        `Insufficient wallet balance. Required: ${Money.format(subscriptionCost)}, Available: ${Money.format(walletBalance)}`,
      );
      return;
    }

    setFormData({
      subscriptionCost,
    });

    await registerMember();
  };

  const selectedPlan = subscriptionPlans.find(
    (p) => p.slug === formData.planType,
  );
  const selectedPlanCost = selectedPlan?.price || 0;
  const walletBalance = user.walletBalance || 0;
  const hasSufficientFunds = walletBalance >= selectedPlanCost;

  return (
    <div className="space-y-6">
      {/* Registration Form Card */}
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-emerald-400" />
            Register New Member
          </CardTitle>
          <CardDescription>
            Register a new patient and pay for their subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <FieldError errors={error.errors?.firstName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <FieldError errors={error.errors?.lastName} />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              <FieldError errors={error.errors?.email} />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              <FieldError errors={error.errors?.phoneNumber} />
            </div>

            {/* Plan Selection */}
            <div className="space-y-2">
              <Label htmlFor="planType">Subscription Plan</Label>
              <Select
                value={formData.planType}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, planType: value })
                }
                disabled={loading || loadingPlans}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      loadingPlans ? 'Loading plans...' : 'Select a plan'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.slug}>
                      <div className="flex items-center justify-between w-full">
                        <span>{plan.name}</span>
                        <span className="ml-4 text-emerald-400">
                          {Money.format(plan.price)}/
                          {plan.duration === 1 ? 'month' : 'year'}
                          {` (${plan.credits} credits)`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={error.errors?.planType} />
            </div>

            {/* Cost Summary */}
            <Card className="bg-emerald-950/20 border-emerald-900/30">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subscription Cost:</span>
                    <span className="font-semibold">
                      {Money.format(selectedPlanCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Your Wallet Balance:</span>
                    <span
                      className={`font-semibold ${hasSufficientFunds ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {Money.format(walletBalance)}
                    </span>
                  </div>
                  {selectedPlan && (
                    <div className="flex justify-between text-sm">
                      <span>Credits Included:</span>
                      <span className="font-semibold text-emerald-400">
                        {selectedPlan.credits} credits
                      </span>
                    </div>
                  )}
                  <div className="border-t border-emerald-900/30 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Balance After Registration:</span>
                      <span
                        className={
                          hasSufficientFunds
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }
                      >
                        {Money.format(walletBalance - selectedPlanCost)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!hasSufficientFunds && (
              <div className="bg-red-950/20 border border-red-900/30 rounded-md p-3">
                <p className="text-sm text-red-400">
                  Insufficient wallet balance. Please fund your wallet first.
                </p>
              </div>
            )}

            {loading && <BarLoader width="100%" color="#10b981" />}

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={loading || !hasSufficientFunds}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {loading
                ? 'Registering...'
                : `Register Member (${Money.format(selectedPlanCost)})`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-900/20 bg-blue-950/10">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-blue-400">Important Notes:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>The subscription cost will be deducted from your wallet</li>
              <li>Member will receive login credentials via email</li>
              <li>
                Member will have immediate access to all platform features
              </li>
              <li>You'll earn commission on this registration</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <RegistrationSuccessDialog
        open={!!successData}
        onOpenChange={(open: any) => {
          if (!open) {
            setSuccessData(null);
          }
        }}
        memberData={successData}
      />
    </div>
  );
}
