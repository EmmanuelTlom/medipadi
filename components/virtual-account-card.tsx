'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getVirtualAccount,
  requestVirtualAccount,
} from '@/actions/virtual-account';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function VirtualAccountCard() {
  const [account, setAccount] = useState<{
    accountNumber: string;
    bankName: string;
    accountName: string;
    customerCode: string | null;
    createdAt?: Date | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadExistingAccount();
  }, []);

  const loadExistingAccount = async () => {
    try {
      setFetching(true);
      const result = await getVirtualAccount();

      if (result.success && result.hasAccount && result.data) {
        setAccount(result.data);
      }
    } catch (error) {
      console.error('Failed to load virtual account:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleRequestAccount = async () => {
    try {
      setLoading(true);
      const result = await requestVirtualAccount();

      if (result.success && result.data) {
        setAccount(result.data);

        if (result.alreadyExists) {
          toast.success('Virtual account already exists');
        } else {
          toast.success('Virtual account created successfully!');
        }
      }
    } catch (error) {
      console.error('Failed to request virtual account:', error);
      toast.error(
        (error as Error).message || 'Failed to create virtual account',
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (fetching) {
    return (
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle>Virtual Account</CardTitle>
          <CardDescription>Loading your virtual account...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle>Request Virtual Account</CardTitle>
          <CardDescription>
            Get a dedicated bank account for easy payments. Payments to this
            account will automatically fill your credit balance or subscribe you
            to a plan if the amount matches a subscription price.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleRequestAccount}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Creating Account...
              </>
            ) : (
              'Request Virtual Account'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-900/20">
      <CardHeader>
        <CardTitle>Your Virtual Account</CardTitle>
        <CardDescription>
          Make payments to this account to fund your wallet or subscribe to a
          plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Bank Name
              </p>
              <p className="text-lg font-semibold">{account.bankName}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(account.bankName, 'Bank name')}
            >
              Copy
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Account Number
              </p>
              <p className="text-2xl font-bold tracking-wider">
                {account.accountNumber}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                copyToClipboard(account.accountNumber, 'Account number')
              }
            >
              Copy
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Account Name
              </p>
              <p className="text-lg font-semibold">{account.accountName}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                copyToClipboard(account.accountName, 'Account name')
              }
            >
              Copy
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-muted p-4">
          <h4 className="font-semibold mb-2">How it works:</h4>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Transfer any amount to this account</li>
            <li>
              If the amount matches a subscription plan price exactly, you'll be
              auto-subscribed
            </li>
            <li>
              Otherwise, the credit equivalent of the amount will be added to
              your wallet
            </li>
            <li>All transactions are processed instantly</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
