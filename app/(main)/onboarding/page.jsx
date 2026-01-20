'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Stethoscope, User, UserCheck, Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SPECIALTIES } from '@/lib/specialities';
import { Textarea } from '@/components/ui/textarea';
import { doctorFormSchema } from '@/lib/schema';
import { fundWallet } from '@/actions/payout';
import { setUserRole } from '@/actions/onboarding';
import useFetch from '@/hooks/use-fetch';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

export default function OnboardingPage() {
  const [step, setStep] = useState('choose-role');
  const router = useRouter();

  // Custom hook for user role server action
  const { loading, data, fn: submitUserRole } = useFetch(setUserRole);

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      specialty: '',
      experience: undefined,
      credentialUrl: '',
      description: '',
    },
  });

  // Watch specialty value for controlled select component
  const specialtyValue = watch('specialty');

  // Handle patient role selection
  const handlePatientSelection = async () => {
    if (loading) return;

    const formData = new FormData();
    formData.append('role', 'PATIENT');

    await submitUserRole(formData);
  };

  // Handle agent role selection
  const handleAgentSelection = async () => {
    if (loading) return;

    const formData = new FormData();
    formData.append('role', 'AGENT');

    await submitUserRole(formData);
  };

  // Handle provider role selection
  const handleProviderSelection = async () => {
    if (loading) return;

    const formData = new FormData();
    formData.append('role', 'PROVIDER');

    await submitUserRole(formData);
  };

  useEffect(() => {
    if (data && data?.success) {
      router.push(data.redirect);
    }
  }, [data]);

  // Added missing onDoctorSubmit function
  const onDoctorSubmit = async (data) => {
    if (loading) return;

    const formData = new FormData();
    formData.append('role', 'DOCTOR');
    formData.append('specialty', data.specialty);
    formData.append('experience', data.experience.toString());
    formData.append('credentialUrl', data.credentialUrl);
    formData.append('description', data.description);

    await submitUserRole(formData);
  };

  // Role selection screen
  if (step === 'choose-role') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="border-emerald-900/20 hover:border-emerald-700/40 cursor-pointer transition-all"
          onClick={() => !loading && handlePatientSelection()}
        >
          <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
            <div className="p-4 bg-emerald-900/20 rounded-full mb-4">
              <User className="h-8 w-8 text-emerald-400" />
            </div>
            <CardTitle className="text-xl font-semibold text-white mb-2">
              Join as a Patient
            </CardTitle>
            <CardDescription className="mb-4">
              Book appointments, consult with doctors, and manage your
              healthcare journey
            </CardDescription>
            <Button
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue as Patient'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card
          className="border-emerald-900/20 hover:border-emerald-700/40 cursor-pointer transition-all"
          onClick={() => !loading && setStep('doctor-form')}
        >
          <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
            <div className="p-4 bg-emerald-900/20 rounded-full mb-4">
              <Stethoscope className="h-8 w-8 text-emerald-400" />
            </div>
            <CardTitle className="text-xl font-semibold text-white mb-2">
              Join as a Doctor
            </CardTitle>
            <CardDescription className="mb-4">
              Create your professional profile, set your availability, and
              provide consultations
            </CardDescription>
            <Button
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              Continue as Doctor
            </Button>
          </CardContent>
        </Card>

        <Card
          className="border-emerald-900/20 hover:border-emerald-700/40 cursor-pointer transition-all"
          onClick={() => !loading && handleAgentSelection()}
        >
          <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
            <div className="p-4 bg-emerald-900/20 rounded-full mb-4">
              <UserCheck className="h-8 w-8 text-emerald-400" />
            </div>
            <CardTitle className="text-xl font-semibold text-white mb-2">
              Join as an Agent
            </CardTitle>
            <CardDescription className="mb-4">
              Help members register, fund wallets, and manage subscriptions
            </CardDescription>
            <Button
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue as Agent'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card
          className="border-emerald-900/20 hover:border-emerald-700/40 cursor-pointer transition-all"
          onClick={() => !loading && handleProviderSelection()}
        >
          <CardContent className="pt-6 pb-6 flex flex-col items-center text-center">
            <div className="p-4 bg-emerald-900/20 rounded-full mb-4">
              <Building2 className="h-8 w-8 text-emerald-400" />
            </div>
            <CardTitle className="text-xl font-semibold text-white mb-2">
              Join as a Provider
            </CardTitle>
            <CardDescription className="mb-4">
              Verify members, submit claims, and provide healthcare services
            </CardDescription>
            <Button
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue as Provider'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Doctor registration form
  if (step === 'doctor-form') {
    return (
      <Card className="border-emerald-900/20">
        <CardContent className="pt-6">
          <div className="mb-6">
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Complete Your Doctor Profile
            </CardTitle>
            <CardDescription>
              Please provide your professional details for verification
            </CardDescription>
          </div>

          <form onSubmit={handleSubmit(onDoctorSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="specialty">Medical Specialty</Label>
              <Select
                value={specialtyValue}
                onValueChange={(value) => setValue('specialty', value)}
              >
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="Select your specialty" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((spec) => (
                    <SelectItem
                      key={spec.name}
                      value={spec.name}
                      className="flex items-center gap-2"
                    >
                      <span className="text-emerald-400">{spec.icon}</span>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.specialty && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {errors.specialty.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                placeholder="e.g. 5"
                {...register('experience', { valueAsNumber: true })}
              />
              {errors.experience && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentialUrl">Link to Credential Document</Label>
              <Input
                id="credentialUrl"
                type="url"
                placeholder="https://example.com/my-medical-degree.pdf"
                {...register('credentialUrl')}
              />
              {errors.credentialUrl && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {errors.credentialUrl.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Please provide a link to your medical degree or certification
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description of Your Services</Label>
              <Textarea
                id="description"
                placeholder="Describe your expertise, services, and approach to patient care..."
                rows="4"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm font-medium text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('choose-role')}
                className="border-emerald-900/30"
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Verification'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Add wallet funding form for agents
  function WalletFundingForm() {
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage('');

      try {
        const agentId = 'agent-id-placeholder'; // Replace with actual agent ID
        await fundWallet(agentId, amount);
        setMessage('Wallet funded successfully!');
      } catch (error) {
        setMessage('Failed to fund wallet: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount to Fund
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="block w-full p-2 border border-gray-300 rounded-md"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Fund Wallet'}
        </button>
        {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
      </form>
    );
  }
}
