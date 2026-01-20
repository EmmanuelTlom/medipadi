'use client';

import {
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  User,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getVerifiedDoctors,
  updateDoctorActiveStatus,
} from '@/lib/requests/doctors';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';
import { usePagination } from 'alova/client';
import { useState } from 'react';

export function VerifiedDoctors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [targetDoctor, setTargetDoctor] = useState(null);
  const [_actionType, setActionType] = useState(null);

  let { loading, update, data, page, total, pageCount, isLastPage, refresh } =
    usePagination(getVerifiedDoctors({ search: searchTerm }), {
      immediate: true,
      initialPageSize: 10,
      initialData: { data: [], meta: { totalCount: 0 } },
      total: (response) => response.meta.totalCount,
      watchingStates: [searchTerm],
    });

  const { loading: updating, fn: submitStatusUpdate } = useFetch(
    async (doctorId, suspend) => {
      await updateDoctorActiveStatus(doctorId, suspend);
    },
  );

  const handleStatusChange = async (doctor, suspend) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${suspend ? 'suspend' : 'reinstate'} ${
        doctor.firstName + ' ' + doctor.lastName
      }?`,
    );
    if (!confirmed || updating) return;

    setTargetDoctor(doctor);
    setActionType(suspend ? 'SUSPEND' : 'REINSTATE');

    try {
      await submitStatusUpdate(doctor.id, suspend);
      const actionVerb = suspend ? 'Suspended' : 'Reinstated';
      toast.success(
        `${actionVerb} ${doctor.firstName} ${doctor.lastName} successfully!`,
      );
      setTargetDoctor(null);
      setActionType(null);
      await refresh();
    } catch (error) {
      toast.error(error.message || 'Failed to update doctor status');
      setTargetDoctor(null);
      setActionType(null);
    }
  };

  return (
    <div>
      <Card className="bg-muted/20 border-emerald-900/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-white">
                Manage Doctors
              </CardTitle>
              <CardDescription>
                View and manage all verified doctors
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                className="pl-8 bg-background border-emerald-900/20"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-background border-emerald-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? 'No doctors match your search criteria.'
                : 'No verified doctors available.'}
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((doctor) => {
                const isSuspended = doctor.verificationStatus === 'REJECTED';
                return (
                  <Card
                    key={doctor.id}
                    className="bg-background border-emerald-900/20 hover:border-emerald-700/30 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-muted/20 rounded-full p-2">
                            <User className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white">
                              {`${doctor.firstName} ${doctor.lastName}`}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {doctor.specialty} • {doctor.experience} years
                              experience
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {doctor.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end md:self-auto">
                          {isSuspended ? (
                            <>
                              <Badge
                                variant="outline"
                                className="bg-red-900/20 border-red-900/30 text-red-400"
                              >
                                Suspended
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(doctor, false)
                                }
                                disabled={loading}
                                className="border-emerald-900/30 hover:bg-muted/80"
                              >
                                {loading && targetDoctor?.id === doctor.id ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 mr-1" />
                                )}
                                Reinstate
                              </Button>
                            </>
                          ) : (
                            <>
                              <Badge
                                variant="outline"
                                className="bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                              >
                                Active
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(doctor, true)}
                                disabled={loading}
                                className="border-red-900/30 hover:bg-red-900/10 text-red-400"
                              >
                                {loading && targetDoctor?.id === doctor.id ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Ban className="h-4 w-4 mr-1" />
                                )}
                                Suspend
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {data.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page || 1} of {pageCount}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
