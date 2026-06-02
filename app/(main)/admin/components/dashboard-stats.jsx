'use client';

import {
  Activity,
  AlertCircle,
  Banknote,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Money } from '@toneflix/money';

function StatCard({ title, value, sub, icon, color = 'emerald', trend }) {
  const colors = {
    emerald: 'border-emerald-900/20 bg-emerald-950/5 text-emerald-400',
    amber:   'border-amber-900/20   bg-amber-950/5   text-amber-400',
    blue:    'border-blue-900/20    bg-blue-950/5    text-blue-400',
    red:     'border-red-900/20     bg-red-950/5     text-red-400',
    purple:  'border-purple-900/20  bg-purple-950/5  text-purple-400',
  };
  const [border, bg, text] = colors[color].split(' ');

  return (
    <Card className={`${border} ${bg}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className={`text-3xl font-bold ${text}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`${bg} border ${border} p-2.5 rounded-xl shrink-0`}>
            <span className={text}>{icon}</span>
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {trend >= 0
              ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
            <span className={trend >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {trend >= 0 ? '+' : ''}{trend}% vs last 30 days
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-2 mb-3">
      {children}
    </h3>
  );
}

export function DashboardStats({ stats }) {
  if (!stats) return null;

  const claimApprovalRate = stats.approvedClaims + stats.rejectedClaims > 0
    ? Math.round((stats.approvedClaims / (stats.approvedClaims + stats.rejectedClaims)) * 100)
    : 0;

  const appointmentCompletionRate = stats.totalAppointments > 0
    ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
    : 0;

  const doctorVerificationRate = stats.totalDoctors > 0
    ? Math.round((stats.verifiedDoctors / stats.totalDoctors) * 100)
    : 0;

  return (
    <div className="space-y-8">

      {/* Members */}
      <div>
        <SectionTitle>Membership</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            sub={`${stats.newMembersThisMonth} joined this month`}
            icon={<Users className="h-5 w-5" />}
            color="emerald"
            trend={stats.memberGrowthPct}
          />
          <StatCard
            title="Active Members"
            value={stats.activeMembers}
            sub={`${stats.totalMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}% of total`}
            icon={<UserCheck className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Expired Members"
            value={stats.expiredMembers}
            sub="Need renewal"
            icon={<AlertCircle className="h-5 w-5" />}
            color="amber"
          />
          <StatCard
            title="New This Month"
            value={stats.newMembersThisMonth}
            sub="Registered in last 30 days"
            icon={<TrendingUp className="h-5 w-5" />}
            color="purple"
          />
        </div>
      </div>

      {/* Plan Breakdown */}
      {stats.membersPerPlan?.length > 0 && (
        <div>
          <SectionTitle>Subscription Breakdown</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-emerald-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Members per Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.membersPerPlan.map(({ plan, count }) => {
                  const pct = stats.totalMembers > 0 ? Math.round((count / stats.totalMembers) * 100) : 0;
                  return (
                    <div key={plan} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{plan}</span>
                        <span className="text-white font-medium">{count} <span className="text-xs text-muted-foreground">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/20">
                        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {stats.membersPerPlan.every(p => p.count === 0) && (
                  <p className="text-sm text-muted-foreground py-2">No members on any plan yet</p>
                )}
              </CardContent>
            </Card>

            {/* Active vs Expired donut-style */}
            <Card className="border-emerald-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  Membership Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Active (with credits)', value: stats.activeMembers, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                  { label: 'Expired (no credits)', value: stats.expiredMembers, color: 'bg-red-500', textColor: 'text-red-400' },
                ].map(({ label, value, color, textColor }) => {
                  const pct = stats.totalMembers > 0 ? Math.round((value / stats.totalMembers) * 100) : 0;
                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className={`font-medium ${textColor}`}>{value} <span className="text-xs text-muted-foreground">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/20">
                        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Claims */}
      <div>
        <SectionTitle>Claims & Financials</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Pending Claims"
            value={stats.pendingClaims}
            sub={Money.format(stats.pendingClaimsAmount) + ' pending'}
            icon={<Clock className="h-5 w-5" />}
            color="amber"
          />
          <StatCard
            title="Approved Claims"
            value={stats.approvedClaims}
            sub={Money.format(stats.approvedClaimsAmount) + ' paid out'}
            icon={<CheckCircle className="h-5 w-5" />}
            color="emerald"
          />
          <StatCard
            title="Rejected Claims"
            value={stats.rejectedClaims}
            sub={`${claimApprovalRate}% approval rate`}
            icon={<XCircle className="h-5 w-5" />}
            color="red"
          />
          <StatCard
            title="Claims (30 days)"
            value={stats.recentClaimsCount}
            sub="New in last 30 days"
            icon={<Banknote className="h-5 w-5" />}
            color="blue"
          />
        </div>

        {/* Claims approval bar */}
        {(stats.approvedClaims + stats.rejectedClaims) > 0 && (
          <Card className="mt-4 border-emerald-900/20">
            <CardContent className="p-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Claim outcome breakdown</span>
                <span className="text-white font-medium">{stats.approvedClaims + stats.rejectedClaims + stats.pendingClaims} total</span>
              </div>
              <div className="h-3 rounded-full bg-muted/20 flex overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${Math.round((stats.approvedClaims / (stats.approvedClaims + stats.rejectedClaims + stats.pendingClaims)) * 100)}%` }} />
                <div className="bg-amber-500 h-full" style={{ width: `${Math.round((stats.pendingClaims / (stats.approvedClaims + stats.rejectedClaims + stats.pendingClaims)) * 100)}%` }} />
                <div className="bg-red-500 h-full flex-1" />
              </div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Approved</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Pending</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Rejected</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Doctors & Appointments */}
      <div>
        <SectionTitle>Doctors & Appointments</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Verified Doctors"
            value={stats.verifiedDoctors}
            sub={`${doctorVerificationRate}% verified`}
            icon={<Stethoscope className="h-5 w-5" />}
            color="emerald"
          />
          <StatCard
            title="Pending Review"
            value={stats.pendingDoctors}
            sub="Awaiting verification"
            icon={<Clock className="h-5 w-5" />}
            color="amber"
          />
          <StatCard
            title="Appointments"
            value={stats.totalAppointments}
            sub={`${appointmentCompletionRate}% completion rate`}
            icon={<Calendar className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={stats.completedAppointments}
            sub={`${stats.cancelledAppointments} cancelled`}
            icon={<CheckCircle className="h-5 w-5" />}
            color="purple"
          />
        </div>
      </div>

      {/* Agents & Providers */}
      <div>
        <SectionTitle>Agents & Providers</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Agents"
            value={stats.totalAgents}
            sub="Registered agents"
            icon={<UserCheck className="h-5 w-5" />}
            color="purple"
          />
          <StatCard
            title="Agents Wallet Pool"
            value={Money.format(stats.agentWalletTotal)}
            sub="Combined agent balances"
            icon={<Wallet className="h-5 w-5" />}
            color="emerald"
          />
          <StatCard
            title="Total Providers"
            value={stats.totalProviders}
            sub="Healthcare facilities"
            icon={<Building2 className="h-5 w-5" />}
            color="blue"
          />
        </div>
      </div>

      {/* Top Agents */}
      {stats.topAgents?.some(a => a.registrations > 0) && (
        <div>
          <SectionTitle>Top Performing Agents</SectionTitle>
          <Card className="border-emerald-900/20">
            <CardContent className="p-5 space-y-3">
              {stats.topAgents.filter(a => a.registrations > 0).map((agent, i) => {
                const max = stats.topAgents[0]?.registrations || 1;
                const pct = Math.round((agent.registrations / max) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono w-4">#{i + 1}</span>
                        <span className="text-white">{agent.name}</span>
                      </div>
                      <Badge variant="outline" className="bg-emerald-900/20 border-emerald-900/30 text-emerald-400 text-xs">
                        {agent.registrations} member{agent.registrations !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/20">
                      <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
