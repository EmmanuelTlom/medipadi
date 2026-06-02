'use client';

import { useEffect, useState } from 'react';
import { Banknote, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getNigerianBanks, verifyBankAccount, saveProviderBankDetails } from '@/actions/provider';

interface Props {
  existing: {
    accountNumber: string;
    accountName: string | null;
    bankName: string | null;
    recipientReady: boolean;
  } | null;
}

export function BankDetails({ existing }: Props) {
  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [accountNumber, setAccountNumber] = useState(existing?.accountNumber ?? '');
  const [bankCode, setBankCode] = useState('');
  const [bankName, setBankName] = useState(existing?.bankName ?? '');
  const [verifiedName, setVerifiedName] = useState(existing?.accountName ?? '');
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(!existing);

  useEffect(() => {
    getNigerianBanks()
      .then(setBanks)
      .catch(() => toast.error('Could not load bank list'))
      .finally(() => setLoadingBanks(false));
  }, []);

  const handleVerify = async () => {
    if (!accountNumber || !bankCode) {
      toast.error('Enter account number and select a bank first');
      return;
    }
    setVerifying(true);
    setVerifiedName('');
    try {
      const { accountName } = await verifyBankAccount(accountNumber, bankCode);
      setVerifiedName(accountName);
      toast.success(`Account verified: ${accountName}`);
    } catch (err) {
      toast.error((err as Error).message || 'Could not verify account');
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    if (!accountNumber || !bankCode || !verifiedName) {
      toast.error('Verify your account before saving');
      return;
    }
    setSaving(true);
    try {
      await saveProviderBankDetails({
        accountNumber,
        accountName: verifiedName,
        bankCode,
        bankName,
      });
      toast.success('Bank details saved — payouts will be sent here automatically');
      setEditing(false);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to save bank details');
    } finally {
      setSaving(false);
    }
  };

  if (!editing && existing) {
    return (
      <Card className="border-emerald-900/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Banknote className="h-4 w-4 text-emerald-400" />
              Payout Account
            </CardTitle>
            <div className="flex items-center gap-2">
              {existing.recipientReady && (
                <Badge variant="outline" className="bg-emerald-900/20 border-emerald-900/30 text-emerald-400 text-xs flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Paystack Verified
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Account Number</p>
              <p className="text-white font-mono font-medium mt-0.5">{existing.accountNumber}</p>
            </div>
            <div className="bg-muted/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Bank</p>
              <p className="text-white font-medium mt-0.5">{existing.bankName ?? '—'}</p>
            </div>
            <div className="col-span-2 bg-muted/10 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Account Name</p>
              <p className="text-white font-medium mt-0.5">{existing.accountName ?? '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-900/20 bg-amber-950/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <Banknote className="h-4 w-4 text-amber-400" />
          {existing ? 'Update Payout Account' : 'Set Up Payout Account'}
        </CardTitle>
        <CardDescription>
          Your Nigerian bank account where approved claim payments will be sent automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bank selector */}
        <div className="space-y-1.5">
          <Label>Bank</Label>
          <select
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring text-white"
            value={bankCode}
            onChange={e => {
              setBankCode(e.target.value);
              const found = banks.find(b => b.code === e.target.value);
              setBankName(found?.name ?? '');
              setVerifiedName('');
            }}
            disabled={loadingBanks || saving}
          >
            <option value="">{loadingBanks ? 'Loading banks…' : 'Select your bank'}</option>
            {banks.map(b => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Account number */}
        <div className="space-y-1.5">
          <Label>Account Number</Label>
          <div className="flex gap-2">
            <Input
              placeholder="0123456789"
              value={accountNumber}
              maxLength={10}
              onChange={e => { setAccountNumber(e.target.value); setVerifiedName(''); }}
              disabled={saving}
              className="font-mono"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleVerify}
              disabled={verifying || !accountNumber || !bankCode || saving}
              className="shrink-0"
            >
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
            </Button>
          </div>
        </div>

        {/* Verified name */}
        {verifiedName && (
          <div className="flex items-center gap-2 bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Verified Account Name</p>
              <p className="text-emerald-400 font-medium text-sm">{verifiedName}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {existing && (
            <Button variant="outline" onClick={() => setEditing(false)} disabled={saving} className="flex-1">
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !verifiedName}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : 'Save Account'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
