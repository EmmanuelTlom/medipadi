'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  FileText,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getPendingClaims, getProcessedClaims } from '@/lib/requests/claims';

import { Badge } from '@/components/ui/badge';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { ClaimStatus } from '@prisma/client';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';
import { usePagination } from 'alova/client';
import { useState } from 'react';

export function ClaimsManagement() {
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [meta, setMeta] = useState({ pending: 0, processed: 0 });

  const {
    loading,
    data: pendingClaims,
    page,
    update,
    pageCount,
    isLastPage,
    refresh: refreshPendingClaims,
  } = usePagination(getPendingClaims(), {
    immediate: true,
    initialPageSize: 10,
    initialData: {
      data: [],
      pending: 0,
      processed: 0,
      meta: { totalCount: 0 },
    },
    total: (e) => e.meta.totalCount,
  }).onSuccess(({ data }) => {
    setMeta({
      pending: data.pending,
      processed: data.processed,
    });
  });

  const {
    page: processedPage,
    pageCount: processedPageCount,
    isLastPage: isLastProcessedPage,
    loading: loadingProcessed,
    data: processedClaims,
    update: updateProcessedPage,
    refresh: refreshProcessedClaims,
  } = usePagination(getProcessedClaims(), {
    immediate: true,
    initialPageSize: 10,
    initialData: {
      data: [],
      meta: { totalCount: 0 },
    },
  });

  const { loading: processing, fn: processClaimFn } = useFetch(
    async (claimId: string, status: ClaimStatus, adminNotes: string) => {
      const response = await fetch('/api/admin/process-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, status, adminNotes }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process claim');
      }
      return response.json();
    },
  );

  const handleProcessClaim = async (claimId: string, status: ClaimStatus) => {
    try {
      await processClaimFn(claimId, status, adminNotes);
      toast.success(`Claim ${status?.toLowerCase()} successfully`);
      setDialogOpen(false);
      setAdminNotes('');
      setSelectedClaim(null);
      // Refresh claims list
      await refreshPendingClaims();
      await refreshProcessedClaims();
    } catch (error) {
      toast.error(error.message || 'Failed to process claim');
    }
  };

  const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'bg-yellow-950/20 text-yellow-400 border-yellow-900/30',
      APPROVED: 'bg-green-950/20 text-green-400 border-green-900/30',
      REJECTED: 'bg-red-950/20 text-red-400 border-red-900/30',
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Claims</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {meta.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Pending Amount
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  ${meta.pending}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Claims</p>
                <p className="text-2xl font-bold text-white">
                  {meta.pending + meta.processed || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Claims */}
      <Card className="border-yellow-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-400" />
            Pending Claims
          </CardTitle>
          <CardDescription>
            Review and process pending provider claims
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-yellow-950/5 border-yellow-900/20">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !loading && meta.pending === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No pending claims</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingClaims.map((claim) => (
                <Card
                  key={claim.id}
                  className="bg-yellow-950/5 border-yellow-900/20"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-white">
                              Claim #{claim.id.substring(0, 8)}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {claim.description || 'No description'}
                            </p>
                          </div>
                          {getStatusBadge(claim.status)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Provider</p>
                            <p className="font-medium text-white">
                              {claim.provider?.firstName}{' '}
                              {claim.provider?.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Member</p>
                            <p className="font-medium text-white">
                              {claim.member?.firstName} {claim.member?.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-semibold text-emerald-400">
                              ${claim.amount.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Service Date
                            </p>
                            <p className="font-medium text-white">
                              {formatDate(claim.serviceDate || claim.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Dialog
                          open={dialogOpen && selectedClaim?.id === claim.id}
                          onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) {
                              setSelectedClaim(null);
                              setAdminNotes('');
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClaim(claim);
                                setDialogOpen(true);
                              }}
                              className="border-blue-900/30"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Review Claim</DialogTitle>
                              <DialogDescription>
                                Review claim details and approve or reject
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                              {/* Claim Details */}
                              <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-muted-foreground">
                                      Claim ID:
                                    </p>
                                    <p className="font-mono">
                                      {claim.id.substring(0, 12)}...
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">
                                      Amount:
                                    </p>
                                    <p className="font-semibold text-emerald-400">
                                      ${claim.amount.toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">
                                      Provider:
                                    </p>
                                    <p>
                                      {claim.provider?.firstName}{' '}
                                      {claim.provider?.lastName}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">
                                      Member:
                                    </p>
                                    <p>
                                      {claim.member?.firstName}{' '}
                                      {claim.member?.lastName}
                                    </p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-muted-foreground">
                                      Description:
                                    </p>
                                    <p>
                                      {claim.description || 'No description'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Admin Notes */}
                              <div className="space-y-2">
                                <Label htmlFor="adminNotes">
                                  Admin Notes (Optional)
                                </Label>
                                <Textarea
                                  id="adminNotes"
                                  placeholder="Add notes about this decision..."
                                  value={adminNotes}
                                  onChange={(e) =>
                                    setAdminNotes(e.target.value)
                                  }
                                  rows={3}
                                />
                              </div>

                              {processing && (
                                <BarLoader width="100%" color="#10b981" />
                              )}

                              {/* Action Buttons */}
                              <div className="grid grid-cols-2 gap-3">
                                <Button
                                  onClick={() =>
                                    handleProcessClaim(claim.id, 'REJECTED')
                                  }
                                  disabled={processing}
                                  variant="outline"
                                  className="border-red-900/30 text-red-400 hover:bg-red-950/20"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleProcessClaim(claim.id, 'APPROVED')
                                  }
                                  disabled={processing}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          onClick={() =>
                            handleProcessClaim(claim.id, 'REJECTED')
                          }
                          disabled={processing}
                          variant="outline"
                          size="sm"
                          className="border-red-900/30 text-red-400"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          onClick={() =>
                            handleProcessClaim(claim.id, 'APPROVED')
                          }
                          disabled={processing}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {page || 1} of {pageCount || 1}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => update({ page: page - 1 })}
                    disabled={loading || page === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => update({ page: page + 1 })}
                    disabled={loading || isLastPage}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Claims History */}
      <Card className="border-blue-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Processed Claims History
          </CardTitle>
          <CardDescription>
            Recently approved or rejected claims
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingProcessed ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-muted/5 border-muted/10">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-1/4" />
                      <Skeleton className="h-6 w-20" />
                      <div className="flex-1" />
                    </div>
                    <Skeleton className="h-3 w-full mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !loadingProcessed && meta.processed === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No processed claims yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {processedClaims.map((claim) => (
                <Card key={claim.id} className="bg-muted/5 border-muted/10">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-white text-sm">
                            Claim #{claim.id.substring(0, 8)}
                          </h4>
                          {getStatusBadge(claim.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {claim.member?.firstName} {claim.member?.lastName} • $
                          {claim.amount.toFixed(2)} •
                          {formatDate(claim.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {processedPage || 1} of {processedPageCount || 1}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateProcessedPage({ page: processedPage - 1 })
                    }
                    disabled={loadingProcessed || processedPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateProcessedPage({ page: processedPage + 1 })
                    }
                    disabled={loadingProcessed || isLastProcessedPage}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
