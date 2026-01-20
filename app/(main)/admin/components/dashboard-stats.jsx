'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  UserCheck,
  Stethoscope,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export function DashboardStats({ stats }) {
  const statCards = [
    {
      title: 'Total Members',
      value: stats.totalMembers || 0,
      icon: <Users className="h-5 w-5 text-emerald-400" />,
      description: `${stats.activeMembers || 0} active members`,
    },
    {
      title: 'Verified Doctors',
      value: stats.verifiedDoctors || 0,
      icon: <Stethoscope className="h-5 w-5 text-emerald-400" />,
      description: `${stats.totalDoctors || 0} total doctors`,
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments || 0,
      icon: <Calendar className="h-5 w-5 text-emerald-400" />,
      description: `${stats.completedAppointments || 0} completed`,
    },
    {
      title: 'Pending Claims',
      value: stats.pendingClaims || 0,
      icon: <AlertCircle className="h-5 w-5 text-emerald-400" />,
      description: 'Awaiting approval',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-emerald-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              {stat.title}
            </CardTitle>
            <div className="bg-emerald-900/20 p-2 rounded-full">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
