'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, FileText, Search } from 'lucide-react';

import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';
import { useState } from 'react';

export function ClaimSubmission({ user }) {
  const [formData, setFormData] = useState({
    membershipId: '',
    amount: '',
    description: '',
    serviceDate: new Date().toISOString().split('T')[0],
  });
  const [verifiedMember, setVerifiedMember] = useState(null);

  const { loading: verifyingMember, fn: verifyMember } = useFetch(
    async (membershipId) => {
      const response = await fetch(
        `/api/provider/verify-member?membershipId=${membershipId}`,
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify member');
      }
      return response.json();
    },
  );

  const { loading: submittingClaim, fn: submitClaimFn } = useFetch(
    async (memberId, amount, description, serviceDate) => {
      const response = await fetch('/api/provider/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, amount, description, serviceDate }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit claim');
      }
      return response.json();
    },
  );

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVerifyMember = async () => {
    if (!formData.membershipId) {
      toast.error('Please enter a membership ID');
      return;
    }

    try {
      const member = await verifyMember(formData.membershipId);
      setVerifiedMember(member);
      toast.success(`Member verified: ${member.firstName} ${member.lastName}`);
    } catch (error) {
      setVerifiedMember(null);
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!verifiedMember) {
      toast.error('Please verify the member first');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid claim amount');
      return;
    }

    if (!formData.description) {
      toast.error('Please provide a claim description');
      return;
    }

    try {
      await submitClaimFn(
        verifiedMember.id,
        parseFloat(formData.amount),
        formData.description,
        formData.serviceDate,
      );

      toast.success('Claim submitted successfully!');

      // Reset form
      setFormData({
        membershipId: '',
        amount: '',
        description: '',
        serviceDate: new Date().toISOString().split('T')[0],
      });
      setVerifiedMember(null);
    } catch (error) {
      toast.error(error.message || 'Failed to submit claim');
    }
  };

  const loading = verifyingMember || submittingClaim;

  return (
    <div className="space-y-6">
      {/* Claim Submission Form */}
      <Card className="border-blue-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-400" />
            Submit New Claim
          </CardTitle>
          <CardDescription>
            Submit a claim for services provided to a member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Member Verification */}
            <div className="space-y-2">
              <Label htmlFor="membershipId">Member ID</Label>
              <div className="flex gap-2">
                <Input
                  id="membershipId"
                  name="membershipId"
                  type="text"
                  placeholder="MED1234567890"
                  value={formData.membershipId}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleVerifyMember}
                  disabled={loading || !formData.membershipId}
                  variant="outline"
                  className="border-blue-900/30"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the member's ID or scan their QR code
              </p>
            </div>

            {/* Verified Member Info */}
            {verifiedMember && (
              <Card className="bg-blue-950/20 border-blue-900/30">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Member Name:
                      </span>
                      <span className="text-sm font-semibold">
                        {verifiedMember.firstName} {verifiedMember.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Member ID:
                      </span>
                      <span className="text-sm font-mono">
                        {verifiedMember.membershipId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status:
                      </span>
                      <span
                        className={`text-sm font-semibold ${verifiedMember.isActive ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {verifiedMember.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {!verifiedMember.isActive && (
                      <div className="bg-red-950/20 border border-red-900/30 rounded-md p-2 mt-2">
                        <p className="text-xs text-red-400">
                          Warning: Member subscription has expired. Claims may
                          not be processed.
                        </p>
                      </div>
                    )}
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
                disabled={loading}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Claim Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Claim Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  disabled={loading || !verifiedMember}
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
                disabled={loading || !verifiedMember}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Provide detailed information about the medical services rendered
              </p>
            </div>

            {loading && <BarLoader width="100%" color="#3b82f6" />}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading || !verifiedMember}
            >
              <FileText className="h-4 w-4 mr-2" />
              {submittingClaim ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-yellow-900/20 bg-yellow-950/10">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-yellow-400">Claims Process:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>All claims are subject to admin review and approval</li>
              <li>Processing typically takes 2-3 business days</li>
              <li>You'll be notified once your claim is processed</li>
              <li>Approved claims will be paid to your registered account</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
