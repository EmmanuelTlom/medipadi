'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  DollarSign,
} from 'lucide-react';
import useFetch from '@/hooks/use-fetch';
import { BarLoader } from 'react-spinners';

async function getProviderClaims(providerId) {
  const response = await fetch(`/api/provider/claims?providerId=${providerId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch claims');
  }
  return response.json();
}

export function ClaimHistory({ user }) {
  const {
    loading,
    data: claims,
    fn: fetchClaims,
  } = useFetch(getProviderClaims, {
    autoRun: true,
    autoRunArgs: [user.id],
  });

  const getStatusIcon = (status) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalClaims = claims?.length || 0;
  const pendingClaims =
    claims?.filter((c) => c.status === 'PENDING').length || 0;
  const approvedAmount =
    claims
      ?.filter((c) => c.status === 'APPROVED')
      .reduce((sum, c) => sum + c.amount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Claims</p>
                <p className="text-2xl font-bold text-white">{totalClaims}</p>
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
                  {pendingClaims}
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
                  ${approvedAmount.toFixed(2)}
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
          {loading && <BarLoader width="100%" color="#3b82f6" />}

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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
