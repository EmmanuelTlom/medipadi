import {
  AlertCircle,
  BarChart3,
  Building2,
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
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
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

  const navItems = [
    { value: 'pending',  icon: <AlertCircle className="h-4 w-4" />,  label: 'Pending',  desc: 'Doctor applications' },
    { value: 'doctors',  icon: <Stethoscope className="h-4 w-4" />,  label: 'Doctors',  desc: 'Verified providers' },
    { value: 'claims',   icon: <FileText className="h-4 w-4" />,     label: 'Claims',   desc: 'Provider claims' },
    { value: 'payouts',  icon: <CreditCard className="h-4 w-4" />,   label: 'Payouts',  desc: 'Pending payments' },
    { value: 'members',  icon: <Users className="h-4 w-4" />,        label: 'Members',  desc: 'All patients' },
    { value: 'agents',    icon: <UserCheck className="h-4 w-4" />,   label: 'Agents',    desc: 'Field agents' },
    { value: 'providers', icon: <Building2 className="h-4 w-4" />,   label: 'Providers', desc: 'Healthcare facilities' },
    { value: 'plans',     icon: <Package className="h-4 w-4" />,     label: 'Plans',     desc: 'Subscription plans' },
    { value: 'reports',  icon: <BarChart3 className="h-4 w-4" />,    label: 'Reports',  desc: 'Analytics' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 isolate">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-900 p-6 md:p-8">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-400 translate-x-32 -translate-y-32" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm mt-0.5">MediSure platform control centre</p>
            </div>
          </div>
          {/* Stats strip inside hero */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="pending" className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <TabsList className="md:col-span-1 self-start sticky top-20 bg-muted/20 border border-muted/30 h-auto flex sm:flex-row md:flex-col w-full p-1.5 rounded-xl md:space-y-0.5 overflow-x-auto md:overflow-x-visible">
          {navItems.map(({ value, icon, label, desc }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="
                shrink-0 md:shrink-0 md:w-full
                flex items-center justify-center
                md:justify-start md:gap-3 md:px-3 md:py-2.5
                text-left rounded-lg transition-all
                data-[state=active]:bg-emerald-600/20
                data-[state=active]:text-emerald-400
              "
            >
              {/* Icon box — desktop only */}
              <span className="hidden md:flex items-center justify-center shrink-0 w-7 h-7 rounded-md bg-muted/20">
                {icon}
              </span>
              {/* Label + desc — desktop only */}
              <span className="hidden md:block text-left min-w-0">
                <span className="block text-sm font-medium leading-tight">{label}</span>
                <span className="block text-[11px] text-muted-foreground leading-tight">{desc}</span>
              </span>
              {/* Mobile: label only */}
              <span className="md:hidden text-xs">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="md:col-span-3">{children}</div>
      </Tabs>
    </div>
  );
}
