'use client';

import {
  Banknote, CheckCircle, ChevronLeft, ChevronRight,
  Clock, FileText, Loader2, XCircle,
} from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAdminClaims } from '@/lib/requests/claims';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClaimStatus } from '@prisma/client';
import { Label } from '@/components/ui/label';
import { Money } from '@toneflix/money';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';
import { usePagination } from 'alova/client';
import { useState } from 'react';

/* ─── Shared helpers ─────────────────────────────────────────── */

const statusCfg = {
  PENDING:  { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30',   icon: <Clock className="h-3 w-3" />,        cardBorder: 'border-amber-900/20 bg-amber-950/5' },
  APPROVED: { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: <CheckCircle className="h-3 w-3" />, cardBorder: 'border-emerald-900/10' },
  REJECTED: { cls: 'bg-red-500/10 text-red-400 border-red-500/30',         icon: <XCircle className="h-3 w-3" />,       cardBorder: 'border-red-900/10' },
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

/* ─── Single-tab claim list ──────────────────────────────────── */

function ClaimList({
  status,
  onProcess,
  processingId,
}: {
  status: ClaimStatus;
  onProcess: (claimId: string, status: ClaimStatus, notes: string) => Promise<void>;
  processingId: string | null;
}) {
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    loading, data: claims, page, pageCount, isLastPage, update,
  } = usePagination(getAdminClaims(status), {
    immediate: true,
    initialPageSize: 10,
    initialData: { data: [], meta: { totalCount: 0 } },
    total: (r: any) => r.meta.totalCount,
  });

  const isPending = status === 'PENDING';
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

  if (claims.length === 0) {
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
        <div
          key={claim.id}
          className={`rounded-xl border p-4 transition-all ${
            processingId === claim.id ? 'border-emerald-500/40 bg-emerald-950/10' : borderClass
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">#{claim.id.substring(0, 8)}</span>
                  <StatusBadge status={claim.status} />
                </div>
                <span className="text-xs text-muted-foreground hidden md:block">{fmt(claim.createdAt)}</span>
              </div>
              {claim.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">{claim.description}</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {[
                  { label: 'Provider', value: `${claim.provider?.firstName ?? ''} ${claim.provider?.lastName ?? ''}`.trim() || '—' },
                  { label: 'Member',   value: `${claim.member?.firstName ?? ''} ${claim.member?.lastName ?? ''}`.trim() || '—' },
                  { label: 'Amount',   value: Money.format(claim.amount), highlight: true },
                  { label: 'Service Date', value: fmt(claim.serviceDate || claim.createdAt) },
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

            {/* Actions — only for pending */}
            {isPending && (
              <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                {/* Review dialog */}
                <Dialog
                  open={dialogOpen && selectedClaim?.id === claim.id}
                  onOpenChange={(o) => { setDialogOpen(o); if (!o) { setSelectedClaim(null); setAdminNotes(''); } }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-muted/30 text-xs"
                      onClick={() => { setSelectedClaim(claim); setDialogOpen(true); }}
                      disabled={processingId !== null}
                    >
                      Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Review Claim #{claim.id.substring(0, 8)}</DialogTitle>
                      <DialogDescription>Add notes and approve or reject</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                          { label: 'Provider', value: `${claim.provider?.firstName} ${claim.provider?.lastName}` },
                          { label: 'Member',   value: `${claim.member?.firstName} ${claim.member?.lastName}` },
                          { label: 'Amount',   value: Money.format(claim.amount) },
                          { label: 'Service Date', value: fmt(claim.serviceDate || claim.createdAt) },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-muted/10 rounded-lg p-3">
                            <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
                            <p className="text-white font-medium">{value}</p>
                          </div>
                        ))}
                        {claim.description && (
                          <div className="col-span-2 bg-muted/10 rounded-lg p-3">
                            <p className="text-muted-foreground text-xs mb-0.5">Description</p>
                            <p className="text-white text-sm">{claim.description}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Admin Notes <span className="text-muted-foreground">(optional)</span></Label>
                        <Textarea placeholder="Add a note…" value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} className="resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <Button onClick={() => onProcess(claim.id, 'REJECTED', adminNotes)}
                          disabled={processingId === claim.id}
                          variant="outline" className="border-red-900/30 text-red-400 hover:bg-red-950/20">
                          {processingId === claim.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}Reject
                        </Button>
                        <Button onClick={() => onProcess(claim.id, 'APPROVED', adminNotes)}
                          disabled={processingId === claim.id}
                          className="bg-emerald-600 hover:bg-emerald-700">
                          {processingId === claim.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}Approve
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Quick actions */}
                <Button onClick={() => onProcess(claim.id, 'REJECTED', '')}
                  disabled={processingId !== null} variant="outline" size="sm"
                  className="border-red-900/30 text-red-400 hover:bg-red-950/20 text-xs">
                  {processingId === claim.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                  <span className="ml-1 hidden sm:inline">Reject</span>
                </Button>
                <Button onClick={() => onProcess(claim.id, 'APPROVED', '')}
                  disabled={processingId !== null} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                  {processingId === claim.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                  <span className="ml-1 hidden sm:inline">Approve</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
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

export function ClaimsManagement() {
  const [processingClaimId, setProcessingClaimId] = useState<string | null>(null);
  const [meta, setMeta] = useState({ pending: 0, approved: 0, rejected: 0, pendingAmount: 0, approvedAmount: 0 });

  // Load summary stats from the PENDING fetch (it always returns global counts)
  usePagination(getAdminClaims('PENDING'), {
    immediate: true,
    initialPageSize: 1,
    initialData: { data: [], meta: { totalCount: 0 } },
    total: (r: any) => r.meta.totalCount,
  }).onSuccess(({ data }: any) => {
    setMeta({
      pending: data.pending ?? 0,
      approved: data.approved ?? 0,
      rejected: data.rejected ?? 0,
      pendingAmount: data.pendingAmount ?? 0,
      approvedAmount: data.approvedAmount ?? 0,
    });
  });

  const { fn: processClaimFn } = useFetch(
    async (claimId: string, status: ClaimStatus, notes: string) => {
      const res = await fetch('/api/admin/process-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, status, adminNotes: notes }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      return res.json();
    },
  );

  const handleProcess = async (claimId: string, status: ClaimStatus, notes: string) => {
    setProcessingClaimId(claimId);
    try {
      await processClaimFn(claimId, status, notes);
      toast.success(`Claim ${status === 'APPROVED' ? 'approved' : 'rejected'}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setProcessingClaimId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending', value: meta.pending, sub: Money.format(meta.pendingAmount), color: 'amber', icon: <Clock className="h-4 w-4" /> },
          { label: 'Approved', value: meta.approved, sub: Money.format(meta.approvedAmount) + ' paid', color: 'emerald', icon: <CheckCircle className="h-4 w-4" /> },
          { label: 'Rejected', value: meta.rejected, sub: `${meta.pending + meta.approved + meta.rejected} total`, color: 'red', icon: <XCircle className="h-4 w-4" /> },
          { label: 'Approval Rate', value: `${meta.approved + meta.rejected > 0 ? Math.round((meta.approved / (meta.approved + meta.rejected)) * 100) : 0}%`, sub: 'of processed', color: 'blue', icon: <Banknote className="h-4 w-4" /> },
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

      {/* Tabbed claim lists */}
      <Card className="border-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" /> Claims
          </CardTitle>
          <CardDescription>Review, approve or reject provider claims</CardDescription>
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
            <TabsContent value="PENDING"  className="mt-0"><ClaimList status="PENDING"  onProcess={handleProcess} processingId={processingClaimId} /></TabsContent>
            <TabsContent value="APPROVED" className="mt-0"><ClaimList status="APPROVED" onProcess={handleProcess} processingId={processingClaimId} /></TabsContent>
            <TabsContent value="REJECTED" className="mt-0"><ClaimList status="REJECTED" onProcess={handleProcess} processingId={processingClaimId} /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
