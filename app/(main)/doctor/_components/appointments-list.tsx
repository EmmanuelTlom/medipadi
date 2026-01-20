'use client';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { AppointmentCard } from '@/components/appointment-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getDoctorAppointments } from '@/lib/requests/doctor-appointments';
import { usePagination } from 'alova/client';

export default function DoctorAppointmentsList() {
  const { update, data, loading, page, pageCount, isLastPage } = usePagination(
    getDoctorAppointments(),
    {
      initialData: {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      },
      total: (response) => response?.meta?.totalCount || 0,
      data: (response) => response?.data || [],
    },
  );

  const appointments = data || [];

  return (
    <Card className="border-emerald-900/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-emerald-400" />
          Upcoming Appointments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : appointments.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="DOCTOR"
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pageCount > 1 && (
              <div className="flex items-center justify-between border-t border-emerald-900/20 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => update({ page: page - 1 })}
                  disabled={page === 1 || loading}
                  className="border-emerald-900/20"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {page} of {pageCount}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => update({ page: page + 1 })}
                  disabled={isLastPage || loading}
                  className="border-emerald-900/20"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="text-xl font-medium text-white mb-2">
              No upcoming appointments
            </h3>
            <p className="text-muted-foreground">
              You don&apos;t have any scheduled appointments yet. Make sure
              you&apos;ve set your availability to allow patients to book.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
