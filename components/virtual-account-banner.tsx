'use client';

import { Copy, Check, Landmark } from 'lucide-react';
import { useState } from 'react';
import { Money } from '@toneflix/money';

interface VirtualAccountBannerProps {
  accountNumber: string;
  bankName: string | null;
  accountName: string | null;
  walletBalance: number;
}

export default function VirtualAccountBanner({
  accountNumber,
  bankName,
  accountName,
  walletBalance,
}: VirtualAccountBannerProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-emerald-700/30 bg-emerald-900/20 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      <div className="flex items-center gap-2 shrink-0">
        <Landmark className="h-4 w-4 text-emerald-400" />
        <span className="text-xs text-muted-foreground">{bankName ?? 'Virtual Account'}</span>
      </div>

      <button
        onClick={copy}
        className="flex items-center gap-2 group cursor-pointer"
        title="Copy account number"
      >
        <span className="text-2xl font-bold tracking-widest text-white group-hover:text-emerald-300 transition-colors font-mono">
          {accountNumber}
        </span>
        {copied ? (
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 shrink-0 transition-colors" />
        )}
      </button>

      {accountName && (
        <span className="text-xs text-muted-foreground sm:ml-auto truncate">{accountName}</span>
      )}

      {walletBalance > 0 && (
        <span className="text-sm font-semibold text-emerald-400 shrink-0">
          {Money.format(walletBalance)} wallet
        </span>
      )}
    </div>
  );
}
