'use client';

import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  XCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ClaimStatus, User } from '@prisma/client';

import { Badge } from '@/components/ui/badge';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { Money } from '@toneflix/money';
import { Skeleton } from '@/components/ui/skeleton';
import { getProviderClaims } from '@/lib/requests/claims';
import { usePagination } from 'alova/client';
import { useState } from 'react';

export function ClaimHistory({ user }: { user: User }) {
  const [meta, setMeta] = useState({
    pending: 0,
    processed: 0,
    approvedAmount: 0,
  });

  const {
    data: claims,
    loading,
    page,
    update,
    pageCount,
    isLastPage,
  } = usePagination(getProviderClaims(user.id), {
    immediate: true,
    total: (response) => response.meta.totalCount,
    initialData: { data: [], meta: { totalCount: 0 } },
    initialPageSize: 15,
  }).onSuccess(({ data }) => {
    setMeta({
      pending: data.pending,
      processed: data.processed,
      approvedAmount: data.approvedAmount,
    });
  });

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

  const getStatusBadge = (status: ClaimStatus) => {
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
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Claims</p>
                <p className="text-2xl font-bold text-white">
                  {meta.pending + meta.processed}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {meta.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved Amount</p>
                <p className="text-2xl font-bold text-green-400">
                  {Money.format(meta.approvedAmount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Claims List */}
      <Card className="border-blue-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Claim History
          </CardTitle>
          <CardDescription>
            View all your submitted claims and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
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
          )}

          {!loading && (!claims || claims.length === 0) && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No claims submitted yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Submit your first claim to get started
              </p>
            </div>
          )}

          {!loading && claims && claims.length > 0 && (
            <div className="space-y-4">
              {claims.map((claim) => (
                <Card key={claim.id} className="bg-muted/5 border-muted/10">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-white">
                              Claim #{claim.id.substring(0, 8)}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {claim.description}
                            </p>
                          </div>
                          {getStatusBadge(claim.status)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Member</p>
                            <p className="font-medium text-white">
                              {claim.member?.firstName} {claim.member?.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-semibold text-emerald-400">
                              {Money.format(claim.amount)}
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
                          <div>
                            <p className="text-muted-foreground">Submitted</p>
                            <p className="font-medium text-white">
                              {formatDate(claim.createdAt)}
                            </p>
                          </div>
                        </div>

                        {claim.adminNotes && (
                          <div className="mt-3 bg-blue-950/20 border border-blue-900/30 rounded-md p-3">
                            <p className="text-xs text-blue-400 font-semibold mb-1">
                              Admin Notes:
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {claim.adminNotes}
                            </p>
                          </div>
                        )}
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
    </div>
  );
}
