'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  checkPendingPayments,
  getVirtualAccount,
  requestVirtualAccount,
} from '@/actions/virtual-account';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Copy, Landmark, Wallet, RefreshCw } from 'lucide-react';
import { Money } from '@toneflix/money';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

interface VirtualAccountCardProps {
  userPhone?: string | null;
  walletBalance?: number | null;
}

export default function VirtualAccountCard({ userPhone, walletBalance }: VirtualAccountCardProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [account, setAccount] = useState<{
    accountNumber: string;
    bankName: string;
    accountName: string;
    customerCode: string | null;
    createdAt?: Date | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [phone, setPhone] = useState(userPhone || '');

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
      // Pass phone only if it differs from the saved one (i.e. user just typed it in)
      const phoneToSend = !userPhone && phone.trim() ? phone.trim() : undefined;
      const result = await requestVirtualAccount(phoneToSend);

      if (result.success && result.data) {
        setAccount(result.data);
        toast.success(
          result.alreadyExists
            ? 'Virtual account loaded'
            : 'Virtual account created successfully!'
        );
      }
    } catch (error) {
      const message = (error as Error).message;
      toast.error(message.replace('Failed to request virtual account: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
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

  if (account) {
    return (
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Landmark className="h-5 w-5 text-emerald-400" />
            Your Virtual Account
          </CardTitle>
          <CardDescription>
            Transfer to this account to fund your wallet or subscribe to a plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet balance */}
          <div className="flex items-center justify-between bg-emerald-900/10 rounded-lg p-3 border border-emerald-700/20">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Wallet Balance</p>
                <p className="text-lg font-bold text-emerald-400">
                  {Money.format(walletBalance ?? 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-white"
                disabled={refreshing}
                onClick={async () => {
                  setRefreshing(true);
                  try {
                    const result = await checkPendingPayments();
                    if (result.processed > 0) {
                      toast.success(result.message);
                    } else {
                      toast.info(result.message);
                    }
                  } catch (err) {
                    toast.error((err as Error).message || 'Could not check payments');
                  } finally {
                    router.refresh();
                    setTimeout(() => setRefreshing(false), 1200);
                  }
                }}
                title="Check for new payments"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              {(walletBalance ?? 0) > 0 && (
                <Link href="/pricing">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                    Use to Subscribe
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {[
            { label: 'Bank Name', value: account.bankName },
            { label: 'Account Number', value: account.accountNumber, large: true },
            { label: 'Account Name', value: account.accountName },
          ].map(({ label, value, large }) => (
            <div key={label} className="flex items-center justify-between bg-muted/10 rounded-lg p-3 border border-emerald-900/10">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`font-semibold truncate ${large ? 'text-2xl tracking-wider text-white' : 'text-white'}`}>
                  {value}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 ml-2"
                onClick={() => copyToClipboard(value, label)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="rounded-lg bg-muted/10 border border-emerald-900/10 p-4 space-y-1.5">
            <p className="font-medium text-white text-xs uppercase tracking-wide">How it works</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Transfer any amount to this account number</li>
              <li>• If the amount matches a plan price exactly, you'll be auto-subscribed</li>
              <li>• Any other amount is added to your <span className="text-emerald-400 font-medium">wallet balance</span></li>
              <li>• Use your wallet balance directly on the <Link href="/pricing" className="text-emerald-400 underline-offset-2 hover:underline">pricing page</Link> to subscribe</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No account yet — check if phone is missing
  const hasPhone = !!userPhone || !!phone.trim();

  return (
    <Card className="border-emerald-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Landmark className="h-5 w-5 text-emerald-400" />
          Virtual Bank Account
        </CardTitle>
        <CardDescription>
          Get a dedicated account number for easy plan payments — transfers auto-activate your subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!userPhone && (
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1.5 text-amber-400 text-sm">
              <Phone className="h-3.5 w-3.5" />
              Phone number required
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g. 08012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="border-amber-900/30 focus:border-amber-600/60"
            />
            <p className="text-xs text-muted-foreground">
              Paystack requires a phone number to create your dedicated account.
              This will also be saved to your profile.
            </p>
          </div>
        )}

        <Button
          onClick={handleRequestAccount}
          disabled={loading || (!hasPhone)}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Creating Account...
            </>
          ) : (
            'Create Virtual Account'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
