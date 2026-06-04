'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, Banknote, CheckCircle, FileText, Search, ShieldAlert, User } from 'lucide-react';
import { useForm, useRequest } from 'alova/client';

import { Badge } from '@/components/ui/badge';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Money } from '@toneflix/money';
import { Textarea } from '@/components/ui/textarea';
import { alova } from '@/lib/alova';
import { toast } from 'sonner';

interface VerifiedMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  membershipId: string;
  subscriptionEnd: string | null;
  profilePhotoUrl: string | null;
  planName: string | null;
  planSlug: string | null;
  isActive: boolean;
  canClaim: boolean;
  claimBlockReason: string | null;
}

export function ClaimSubmission({ user }) {
  const {
    data,
    loading: verifying,
    send: verifyMember,
    update,
  } = useRequest(
    (membershipId: string) =>
      alova.Get<VerifiedMember>('/api/provider/verify-member', { params: { membershipId } }),
    { immediate: false },
  )
    .onSuccess(({ data }) => {
      toast.success(`Member verified: ${data.firstName} ${data.lastName}`);
    })
    .onError(({ error }) => {
      update({ data: undefined });
      toast.error(error.message || 'Failed to verify member');
    });

  const {
    form: formData,
    loading: submitting,
    send: submitClaimFn,
    onError,
    onSuccess,
    updateForm: setFormData,
  } = useForm(
    (form) =>
      alova.Post('/api/provider/submit-claim', form, { name: 'submit-claim' }),
    {
      resetAfterSubmiting: true,
      initialForm: {
        memberId: data ? data.id : '',
        amount: 0,
        description: '',
        serviceDate: new Date().toISOString().split('T')[0],
      },
    },
  );

  onSuccess(() => {
    toast.success('Claim submitted successfully!');
    update({ data: undefined });
  });

  onError(({ error }) => {
    toast.error(error.message || 'Failed to submit claim');
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ [e.target.name]: e.target.value });
  };

  const handleVerifyMember = async () => {
    if (!formData.memberId) {
      toast.error('Please enter a membership ID');
      return;
    }
    await verifyMember(formData.memberId);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data) { toast.error('Please verify the member first'); return; }
    if (!data.canClaim) { toast.error(data.claimBlockReason || 'Member cannot claim at this time'); return; }
    if (!formData.amount || formData.amount <= 0) { toast.error('Please enter a valid claim amount'); return; }
    if (!formData.description) { toast.error('Please provide a claim description'); return; }

    await submitClaimFn();
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-400" />
            Submit New Claim
          </CardTitle>
          <CardDescription>Submit a claim for services provided to a member</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Member ID lookup */}
            <div className="space-y-2">
              <Label htmlFor="memberId">Member ID</Label>
              <div className="flex gap-2">
                <Input
                  id="memberId"
                  name="memberId"
                  placeholder="MED-KUJ001"
                  value={formData.memberId}
                  onChange={handleInputChange}
                  disabled={submitting || verifying}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleVerifyMember}
                  disabled={submitting || verifying || !formData.memberId}
                  variant="outline"
                  className="border-blue-900/30"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Enter the member's ID or scan their QR code</p>
            </div>

            {/* Verified member info */}
            {data && (
              <Card className={`${data.canClaim ? 'bg-blue-950/20 border-blue-900/30' : 'bg-amber-950/10 border-amber-900/30'}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex gap-4">
                    {/* Photo */}
                    {data.profilePhotoUrl && (
                      <div className="shrink-0">
                        <img
                          src={data.profilePhotoUrl}
                          alt="Member"
                          className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-700/40"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-2 text-sm">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-semibold text-white text-base">
                          {data.firstName} {data.lastName}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={data.isActive ? 'bg-emerald-900/20 border-emerald-700/30 text-emerald-400' : 'bg-red-900/20 border-red-700/30 text-red-400'}>
                            {data.isActive ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                            {data.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {data.canClaim ? (
                            <Badge variant="outline" className="bg-emerald-900/20 border-emerald-700/30 text-emerald-400 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" /> Can Claim
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-900/20 border-amber-700/30 text-amber-400 text-xs">
                              <ShieldAlert className="h-3 w-3 mr-1" /> Blocked
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <span className="text-muted-foreground">Member ID:</span>
                        <span className="font-mono text-white">{data.membershipId}</span>

                        {data.planName && (
                          <>
                            <span className="text-muted-foreground">Subscription:</span>
                            <span className="text-emerald-400 font-medium">{data.planName}</span>
                          </>
                        )}

                        {data.subscriptionEnd && (
                          <>
                            <span className="text-muted-foreground">Expires:</span>
                            <span className="text-white">
                              {new Date(data.subscriptionEnd).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </>
                        )}
                      </div>

                      {!data.canClaim && data.claimBlockReason && (
                        <div className="bg-amber-950/20 border border-amber-900/30 rounded-md p-2 mt-1 flex items-start gap-2">
                          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-300">{data.claimBlockReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Date */}
            <div className="space-y-2">
              <Label htmlFor="serviceDate">Service Date</Label>
              <Input
                id="serviceDate"
                name="serviceDate"
                type="date"
                value={formData.serviceDate}
                onChange={handleInputChange}
                disabled={submitting || verifying}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Claim Amount ({Money.currencyCode()})</Label>
              <div className="relative">
                <div className="absolute left-3 flex items-center h-full w-4 text-muted-foreground">
                  {Money.currencySymbol()}
                </div>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="pl-10"
                  step="0.01"
                  min="0"
                  disabled={submitting || verifying || !data?.canClaim}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Service Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the services provided..."
                value={formData.description}
                onChange={handleInputChange}
                disabled={submitting || verifying || !data?.canClaim}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Provide detailed information about the medical services rendered</p>
            </div>

            {(submitting || verifying) && <BarLoader width="100%" color="#3b82f6" />}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={submitting || verifying || !data || !data.canClaim}
            >
              <FileText className="h-4 w-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-yellow-900/20 bg-yellow-950/10">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-yellow-400">Claims Process:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>All claims are subject to admin review and approval</li>
              <li>Processing typically takes 2–3 business days</li>
              <li>Each member is limited to <strong className="text-white">1 claim per calendar month</strong></li>
              <li>Claims are blocked for <strong className="text-white">7 days</strong> after a new subscription</li>
              <li>Approved claims will be paid to your registered bank account</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
