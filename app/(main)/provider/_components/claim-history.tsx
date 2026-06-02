'use client';

import {
  Banknote, CheckCircle, ChevronLeft, ChevronRight,
  Clock, FileText, XCircle,
} from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProviderClaims } from '@/lib/requests/claims';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClaimStatus, User } from '@prisma/client';
import { Money } from '@toneflix/money';
import { Skeleton } from '@/components/ui/skeleton';
import { usePagination } from 'alova/client';
import { useState } from 'react';

/* ─── Helpers ────────────────────────────────────────────────── */

const statusCfg = {
  PENDING:  { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30',     icon: <Clock className="h-3 w-3" />,        cardBorder: 'border-amber-900/20 bg-amber-950/5' },
  APPROVED: { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: <CheckCircle className="h-3 w-3" />, cardBorder: 'border-emerald-900/10' },
  REJECTED: { cls: 'bg-red-500/10 text-red-400 border-red-500/30',           icon: <XCircle className="h-3 w-3" />,       cardBorder: 'border-red-900/10' },
};

function StatusBadge({ status }: { status: ClaimStatus }) {
  const { cls, icon } = statusCfg[status] ?? statusCfg.PENDING;
  return (
    <Badge variant="outline" className={`${cls} flex items-center gap-1 text-xs`}>
      {icon}<span className="capitalize">{status.toLowerCase()}</span>
    </Badge>
  );
}

const fmt = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

/* ─── Per-tab list ───────────────────────────────────────────── */

function ClaimList({ userId, status }: { userId: string; status: ClaimStatus }) {
  const { loading, data: claims, page, pageCount, isLastPage, update } = usePagination(
    getProviderClaims(userId, status),
    {
      immediate: true,
      initialPageSize: 15,
      initialData: { data: [], meta: { totalCount: 0 } },
      total: (r: any) => r.meta.totalCount,
    },
  );

  const borderClass = statusCfg[status].cardBorder;

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-muted/10 p-4 space-y-3">
            <div className="flex justify-between"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-5 w-20" /></div>
            <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, j) => <Skeleton key={j} className="h-10" />)}</div>
          </div>
        ))}
      </div>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <div className="text-center py-14">
        <div className="mx-auto w-14 h-14 rounded-full bg-muted/10 flex items-center justify-center mb-3">
          <FileText className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <p className="text-muted-foreground text-sm">No {status.toLowerCase()} claims</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {claims.map((claim: any) => (
        <div key={claim.id} className={`rounded-xl border p-4 ${borderClass}`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">#{claim.id.substring(0, 8)}</span>
                <StatusBadge status={claim.status} />
              </div>
              <span className="text-xs text-muted-foreground">{fmt(claim.createdAt)}</span>
            </div>

            {claim.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">{claim.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {[
                { label: 'Member',       value: `${claim.member?.firstName ?? ''} ${claim.member?.lastName ?? ''}`.trim() || '—' },
                { label: 'Amount',       value: Money.format(claim.amount), highlight: true },
                { label: 'Service Date', value: fmt(claim.serviceDate || claim.createdAt) },
                { label: 'Submitted',    value: fmt(claim.createdAt) },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="bg-muted/10 rounded-lg p-2.5">
                  <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                  <p className={`font-medium truncate text-sm ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
                </div>
              ))}
            </div>

            {claim.adminNotes && (
              <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg px-3 py-2 text-xs text-blue-300">
                <span className="font-medium text-blue-400">Admin note:</span> {claim.adminNotes}
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between pt-4 border-t border-muted/20">
        <p className="text-sm text-muted-foreground">Page {page || 1} of {pageCount || 1}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => update({ page: page - 1 })} disabled={loading || page === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => update({ page: page + 1 })} disabled={loading || isLastPage}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

export function ClaimHistory({ user }: { user: User }) {
  const [meta, setMeta] = useState({ pending: 0, approved: 0, rejected: 0, approvedAmount: 0 });

  usePagination(getProviderClaims(user.id), {
    immediate: true,
    initialPageSize: 1,
    initialData: { data: [], meta: { totalCount: 0 } },
    total: (r: any) => r.meta.totalCount,
  }).onSuccess(({ data }: any) => {
    setMeta({
      pending: data.pending ?? 0,
      approved: data.approved ?? 0,
      rejected: data.rejected ?? 0,
      approvedAmount: data.approvedAmount ?? 0,
    });
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Claims',    value: meta.pending + meta.approved + meta.rejected, sub: 'all time',               color: 'blue',    icon: <FileText className="h-4 w-4" /> },
          { label: 'Pending',         value: meta.pending,                                 sub: 'awaiting review',        color: 'amber',   icon: <Clock className="h-4 w-4" /> },
          { label: 'Approved',        value: meta.approved,                                sub: Money.format(meta.approvedAmount), color: 'emerald', icon: <CheckCircle className="h-4 w-4" /> },
          { label: 'Rejected',        value: meta.rejected,                                sub: 'not payable',            color: 'red',     icon: <XCircle className="h-4 w-4" /> },
        ].map(({ label, value, sub, color, icon }) => (
          <Card key={label} className={`border-${color}-900/20 bg-${color}-950/5`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-2xl font-bold text-${color}-400 mt-0.5`}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
                <span className={`text-${color}-400`}>{icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabbed list */}
      <Card className="border-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" /> Claim History
          </CardTitle>
          <CardDescription>All your submitted claims and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="PENDING">
            <TabsList className="mb-4 h-auto p-1 bg-muted/20 border border-muted/30 rounded-lg w-full sm:w-auto flex">
              {([
                { value: 'PENDING',  label: 'Pending',  count: meta.pending,  color: 'data-[state=active]:text-amber-400' },
                { value: 'APPROVED', label: 'Approved', count: meta.approved, color: 'data-[state=active]:text-emerald-400' },
                { value: 'REJECTED', label: 'Rejected', count: meta.rejected, color: 'data-[state=active]:text-red-400' },
              ] as const).map(({ value, label, count, color }) => (
                <TabsTrigger key={value} value={value}
                  className={`flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 text-sm rounded-md ${color}`}>
                  {label}
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">{count}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="PENDING"  className="mt-0"><ClaimList userId={user.id} status="PENDING" /></TabsContent>
            <TabsContent value="APPROVED" className="mt-0"><ClaimList userId={user.id} status="APPROVED" /></TabsContent>
            <TabsContent value="REJECTED" className="mt-0"><ClaimList userId={user.id} status="REJECTED" /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
