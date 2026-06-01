import { Calendar, Clock, Coins, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDoctorEarnings, getDoctorPayouts } from '@/actions/payout';

import { AvailabilitySettings } from './_components/availability-settings';
import DoctorAppointmentsList from './_components/appointments-list';
import { DoctorEarnings } from './_components/doctor-earnings';
import { Money } from '@toneflix/money';
import { getCurrentUser } from '@/actions/onboarding';
import { getWeeklyAvailability } from '@/actions/doctor';
import { redirect } from 'next/navigation';

export default async function DoctorDashboardPage() {
  const user = await getCurrentUser();

  const [weeklySchedule, earningsData, payoutsData] = await Promise.all([
    getWeeklyAvailability(),
    getDoctorEarnings(),
    getDoctorPayouts(),
  ]);

  if (user?.role !== 'DOCTOR') {
    redirect('/onboarding');
  }

  if (user?.verificationStatus !== 'VERIFIED') {
    redirect('/doctor/verification');
  }

  const {
    thisMonthEarnings = 0,
    completedAppointments = 0,
    availableCredits = 0,
  } = earningsData.earnings || {};

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.name ||
    'Doctor';

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-6 md:p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-16 translate-y-16" />
        </div>
        <div className="relative">
          <p className="text-emerald-200 text-sm font-medium">{greeting}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">
            Dr. {displayName}
          </h1>
          <p className="text-emerald-200 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-emerald-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-900/20 p-2 rounded-lg shrink-0">
                <Coins className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-white">{availableCredits}</p>
                <p className="text-xs text-muted-foreground">Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-900/20 p-2 rounded-lg shrink-0">
                <Calendar className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-white">{completedAppointments}</p>
                <p className="text-xs text-muted-foreground">Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-900/20 p-2 rounded-lg shrink-0">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-white truncate">
                  {Money.format(thisMonthEarnings)}
                </p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="earnings"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <TabsList className="md:col-span-1 bg-muted/30 border h-14 md:h-40 flex sm:flex-row md:flex-col w-full p-2 md:p-1 rounded-md md:space-y-2 sm:space-x-2 md:space-x-0">
          <TabsTrigger
            value="earnings"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <DollarSign className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Earnings</span>
          </TabsTrigger>
          <TabsTrigger
            value="appointments"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <Calendar className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Appointments</span>
          </TabsTrigger>
          <TabsTrigger
            value="availability"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <Clock className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Availability</span>
          </TabsTrigger>
        </TabsList>
        <div className="md:col-span-3">
          <TabsContent value="appointments" className="border-none p-0">
            <DoctorAppointmentsList />
          </TabsContent>
          <TabsContent value="availability" className="border-none p-0">
            <AvailabilitySettings weeklySchedule={weeklySchedule || []} />
          </TabsContent>
          <TabsContent value="earnings" className="border-none p-0">
            <DoctorEarnings
              earnings={earningsData.earnings || {}}
              payouts={payoutsData.payouts || []}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
