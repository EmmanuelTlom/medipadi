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

import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { User } from '@prisma/client';
import { format } from 'date-fns';
import { fundWallet } from '@/actions/payout';
import { getUser } from '@/lib/requests/users';
import { getWalletTransactions } from '@/lib/requests/wallet-transactions';
import { invalidateCache } from 'alova';
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';
import { usePagination } from 'alova/client';
import { useState } from 'react';

export function AgentWalletFunding({ user }: { user: User }) {
  const [amount, setAmount] = useState('');
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

  const { loading, fn: submitFunding } = useFetch(fundWallet);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await submitFunding(user.id, parseFloat(amount));
      toast.success(`Successfully funded wallet with $${amount}`);
      setAmount('');
      invalidateCache(getUser()());
      refreshTransactions();
    } catch (error) {
      toast.error('Failed to fund wallet: ' + error.message);
    }
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
            ${walletBalance.toFixed(2)}{' '}
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
            <DollarSign className="h-5 w-5 mr-2 text-emerald-400" />
            Fund Your Wallet
          </CardTitle>
          <CardDescription>
            Add funds to your wallet to register members and pay subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-10"
                  step="0.01"
                  min="1"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum deposit: $1.00
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <Label>Quick Amounts</Label>
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 250, 500].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    onClick={() => setAmount(value.toString())}
                    disabled={loading}
                    className="border-emerald-900/30"
                  >
                    ${value}
                  </Button>
                ))}
              </div>
            </div>

            {loading && <BarLoader width="100%" color="#10b981" />}

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={loading || !amount}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : 'Fund Wallet'}
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
                        {isPositive ? '+' : ''}$
                        {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Balance: ${transaction.balanceAfter.toFixed(2)}
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
