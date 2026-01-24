'use client';

import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  Wallet,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { initializePayment, verifyPayment } from '@/lib/requests/payments';
import { useForm, usePagination, useRequest } from 'alova/client';
import { useRouter, useSearchParams } from 'next/navigation';

import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Money } from '@toneflix/money';
import { Spinner } from '@/components/ui/spinner';
import { User } from '@prisma/client';
import { format } from 'date-fns';
import { getWalletTransactions } from '@/lib/requests/wallet-transactions';
import { toast } from 'sonner';
import { useState } from 'react';

export function AgentWalletFunding({ user }: { user: User }) {
  const params = useSearchParams();
  const router = useRouter();

  const [walletBalance, setWalletBalance] = useState(user.walletBalance || 0);

  const {
    data: transactions,
    loading: loadingTransactions,
    refresh: refreshTransactions,
  } = usePagination(getWalletTransactions(), {
    initialData: { data: [] },
    immediate: true,
    initialPageSize: 10,
  }).onSuccess(({ data }) => {
    Object.assign(user, { walletBalance: data.balance || 0 });
    setWalletBalance(data.balance || 0);
  });

  const { loading: verifying } = useRequest(
    verifyPayment<{ agent: User }>({
      type: 'wallet',
      reference: params.get('reference'),
    }),
    {
      immediate:
        params.get('funding') === 'success' && !!params.get('reference'),
      initialData: {},
    },
  )
    .onSuccess(({ data }) => {
      toast.success(data.message || 'Wallet funded successfully!');
      refreshTransactions();
    })
    .onError(({ error }) => {
      toast.error(
        error.message || 'Failed to verify payment. Please contact support.',
      );
    })
    .onComplete(() => {
      const url = new URL(window.location.href);
      ['type', 'funding', 'reference', 'trx'].forEach((param) =>
        url.searchParams.delete(param),
      );
      router.replace(url.pathname);
    });

  const { send, form, loading, updateForm, onSuccess, onError } = useForm(
    initializePayment(),
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.amount || form.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const baseUrl = `${window.location.origin}/${window.location.pathname}`;

    updateForm({
      email: user.email,
      amount: form.amount,
      metadata: {
        type: 'wallet',
        agentId: user.id,
      },
      callback_url: `${baseUrl}?funding=success&type=wallet`,
    });

    send();
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <Wallet className="h-5 w-5 mr-2 text-emerald-400" />
            Wallet Balance
          </CardTitle>
          <CardDescription>Your current wallet balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-emerald-400 flex items-center gap-2">
            {Money.format(walletBalance)}{' '}
            {loadingTransactions && <Spinner className="size-8" />}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Available for member registrations and subscriptions
          </p>
        </CardContent>
      </Card>

      {/* Fund Wallet Card */}
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <div className="h-full flex items-center w-5 mr-2 text-emerald-400">
              {Money.currencySymbol()}
            </div>
            Fund Your Wallet
          </CardTitle>
          <CardDescription>
            Add funds to your wallet to register members and pay subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({Money.currencyCode()})</Label>
              <div className="relative">
                <div className="absolute left-3 flex items-center h-full w-4 text-muted-foreground">
                  {Money.currencySymbol()}
                </div>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e: any) =>
                    updateForm({ amount: parseFloat(e.target.value) })
                  }
                  className="pl-10"
                  step="0.01"
                  min="1"
                  disabled={loading || verifying}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum deposit: {Money.format(1)}
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <Label>Quick Amounts</Label>
              <div className="grid grid-cols-4 gap-2">
                {[1000, 2500, 5000, 10000].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    onClick={() => updateForm({ amount: value })}
                    disabled={loading || verifying}
                    className="border-emerald-900/30"
                  >
                    {Money.whole(value)}
                  </Button>
                ))}
              </div>
            </div>

            {(loading || verifying) && (
              <BarLoader width="100%" color="#10b981" />
            )}

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={loading || verifying || !form.amount}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loading || verifying ? <Spinner /> : 'Fund Wallet'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Payment will be processed securely through Stripe
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Recent Transactions
          </CardTitle>
          <CardDescription>Your wallet transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTransactions ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted/20 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isPositive = transaction.amount > 0;
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-muted/10 rounded-lg border border-emerald-900/20 hover:border-emerald-700/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          isPositive ? 'bg-emerald-900/20' : 'bg-red-900/20'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {transaction.description ||
                            transaction.type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(
                            new Date(transaction.createdAt),
                            'MMM d, yyyy h:mm a',
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {Money.format(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Balance: {Money.format(transaction.balanceAfter)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
