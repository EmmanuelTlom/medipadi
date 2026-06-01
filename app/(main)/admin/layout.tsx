import {
  AlertCircle,
  BarChart3,
  Calendar,
  CreditCard,
  FileText,
  Package,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PageHeader } from '@/components/page-header';
import { getDashboardStats } from '@/actions/members';
import { redirect } from 'next/navigation';
import { verifyAdmin } from '@/actions/admin';

export const metadata = {
  title: 'Admin Dashboard - MediPadi',
  description: 'Manage doctors, patients, agents, and platform settings',
};

export default async function AdminLayout({ children }) {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    redirect('/onboarding');
  }

  const dashboardStats = await getDashboardStats();

  const stats = [
    {
      label: 'Members',
      value: dashboardStats?.totalMembers ?? 0,
      icon: <Users className="h-4 w-4 text-emerald-400" />,
    },
    {
      label: 'Doctors',
      value: dashboardStats?.verifiedDoctors ?? 0,
      icon: <Stethoscope className="h-4 w-4 text-emerald-400" />,
    },
    {
      label: 'Appointments',
      value: dashboardStats?.totalAppointments ?? 0,
      icon: <Calendar className="h-4 w-4 text-emerald-400" />,
    },
    {
      label: 'Pending Claims',
      value: dashboardStats?.pendingClaims ?? 0,
      icon: <AlertCircle className="h-4 w-4 text-amber-400" />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <PageHeader icon={<ShieldCheck />} title="Admin Dashboard" />

      {/* Always-visible stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-emerald-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-900/20 p-2 rounded-lg shrink-0">
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs
        defaultValue="pending"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <TabsList className="md:col-span-1 bg-muted/30 border h-14 md:h-fit md:max-h-[calc(100vh-20rem)] md:overflow-y-auto flex sm:flex-row md:flex-col w-full p-2 md:p-1 rounded-md md:space-y-2 sm:space-x-2 md:space-x-0">
          <TabsTrigger
            value="pending"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full md:flex-none"
          >
            <AlertCircle className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Pending</span>
          </TabsTrigger>
          <TabsTrigger
            value="doctors"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full md:flex-none"
          >
            <Users className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Doctors</span>
          </TabsTrigger>
          <TabsTrigger
            value="payouts"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full md:flex-none"
          >
            <CreditCard className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Payouts</span>
          </TabsTrigger>
          <TabsTrigger
            value="claims"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full md:flex-none"
          >
            <FileText className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Claims</span>
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full md:flex-none"
          >
            <Users className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Members</span>
          </TabsTrigger>
          <TabsTrigger
            value="agents"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full md:flex-none"
          >
            <UserCheck className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Agents</span>
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full md:flex-none"
          >
            <BarChart3 className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Reports</span>
          </TabsTrigger>
          <TabsTrigger
            value="plans"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full md:flex-none"
          >
            <Package className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Plans</span>
          </TabsTrigger>
        </TabsList>
        <div className="md:col-span-3">{children}</div>
      </Tabs>
    </div>
  );
}
