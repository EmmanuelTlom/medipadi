'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Medal,
  User,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getPendingDoctors, updateDoctorStatus } from '@/lib/requests/doctors';

import { Badge } from '@/components/ui/badge';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';
import { usePagination } from 'alova/client';
import { useState } from 'react';

export function PendingDoctors() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  let { loading, update, data, page, total, pageCount, isLastPage, refresh } =
    usePagination(getPendingDoctors(), {
      immediate: true,
      initialPageSize: 10,
      initialData: { data: [], meta: { totalCount: 0 } },
      total: (response) => response.meta.totalCount,
    });

  const { loading: updating, fn: submitStatusUpdate } = useFetch(
    async (doctorId, status) => {
      await updateDoctorStatus(doctorId, status);
    },
  );

  // Open doctor details dialog
  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
  };

  // Close doctor details dialog
  const handleCloseDialog = () => {
    setSelectedDoctor(null);
  };

  // Handle approve or reject doctor
  const handleUpdateStatus = async (doctorId, status) => {
    if (updating) return;

    try {
      await submitStatusUpdate(doctorId, status);
      toast.success(`Doctor ${status.toLowerCase()} successfully`);
      handleCloseDialog();
      await refresh();
    } catch (error) {
      toast.error(error.message || 'Failed to update doctor status');
    }
  };

  return (
    <div>
      <Card className="bg-muted/20 border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Pending Doctor Verifications ({total})
          </CardTitle>
          <CardDescription>
            Review and approve doctor applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-emerald-900/10 bg-card/50">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
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
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending verification requests at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="border-emerald-900/10 bg-card/50"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      {/* Doctor Info */}
                      <div className="flex gap-4 flex-1">
                        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
                          <User className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">
                              {doctor.firstName} {doctor.lastName}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {doctor.specialty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {doctor.email}
                          </p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Applied{' '}
                              {format(
                                new Date(doctor.createdAt),
                                'MMM d, yyyy',
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 md:justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(doctor)}
                          className="flex-1 md:flex-none"
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(doctor.id, 'VERIFIED')
                          }
                          disabled={loading}
                          className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700"
                        >
                          {loading ? (
                            <BarLoader className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleUpdateStatus(doctor.id, 'REJECTED')
                          }
                          disabled={loading}
                          className="flex-1 md:flex-none"
                        >
                          {loading ? (
                            <BarLoader className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {data.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
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
          )}
        </CardContent>
      </Card>

      {/* Doctor Details Dialog */}
      <Dialog open={!!selectedDoctor} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Doctor Verification Details
            </DialogTitle>
            <DialogDescription>
              Review the doctor's credentials and information
            </DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-medium">
                      {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedDoctor.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Specialty</p>
                    <Badge variant="outline">{selectedDoctor.specialty}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Registration Date</p>
                    <p className="font-medium">
                      {format(
                        new Date(selectedDoctor.createdAt),
                        'MMMM d, yyyy',
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Credentials */}
              {selectedDoctor.bio && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Medal className="w-5 h-5" />
                    Professional Bio
                  </h3>
                  <Separator />
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedDoctor.bio}
                  </p>
                </div>
              )}

              {selectedDoctor.experience && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Experience</h3>
                  <Separator />
                  <p className="text-sm">
                    {selectedDoctor.experience} years of practice
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleUpdateStatus(selectedDoctor.id, 'REJECTED');
              }}
              disabled={loading}
            >
              {loading ? (
                <BarLoader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                handleUpdateStatus(selectedDoctor.id, 'VERIFIED');
              }}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <BarLoader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
