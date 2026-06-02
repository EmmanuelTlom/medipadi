import {
  Activity,
  Bell,
  Calendar,
  ChevronRight,
  CreditCard,
  Shield,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import VirtualAccountCard from '@/components/virtual-account-card';
import VirtualAccountBanner from '@/components/virtual-account-banner';
import { WelcomeDialog } from './_components/welcome-dialog';
import { ProfileSettings } from './_components/profile-settings';
import { checkUser } from '@/lib/checkUser';
import { generateQRCode } from '@/lib/server.utils';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';
import type { SubscriptionPlan } from '@prisma/client';

type UserWithPlan = Awaited<ReturnType<typeof checkUser>> & {
  plan?: SubscriptionPlan | null;
};

async function MemberDashboard() {
  const [rawUser, availablePlans] = await Promise.all([
    checkUser(),
    db.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }),
  ]);
  if (!rawUser) redirect('/sign-in');
  const user = rawUser as UserWithPlan;
  const qrCode = user.membershipId ? await generateQRCode(user.membershipId) : null;

  const hasActivePlan = (user.credits ?? 0) > 0;
  const needsRenewal = user.credits === 0;
  const lastAllocation = user.lastCreditAllocation
    ? new Date(user.lastCreditAllocation)
    : null;
  const daysSinceAllocation = lastAllocation
    ? Math.floor((Date.now() - lastAllocation.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Graceful name display: prefer firstName, fall back to combined name, then email prefix
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.name ||
    user.email.split('@')[0];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <WelcomeDialog />

      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-6 md:p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-16 translate-y-16" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-emerald-200 text-sm font-medium">{greeting}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">
              {displayName}
            </h1>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {needsRenewal ? (
                <Badge className="bg-red-500/20 text-red-200 border border-red-400/30 hover:bg-red-500/30">
                  <Bell className="h-3 w-3 mr-1" />
                  Renewal Needed
                </Badge>
              ) : (
                <Badge className="bg-white/20 text-white border border-white/30 hover:bg-white/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Active Member
                </Badge>
              )}
              {user.membershipId && (
                <span className="text-emerald-200 text-sm font-mono">
                  #{user.membershipId.slice(-8)}
                </span>
              )}
              <ProfileSettings
                user={{
                  firstName: user.firstName,
                  lastName: user.lastName,
                  phoneNumber: user.phoneNumber,
                  email: user.email,
                }}
              />
            </div>
          </div>
          <Link href="/doctors">
            <Button className="bg-white text-emerald-700 hover:bg-white/90 font-semibold shrink-0">
              <Stethoscope className="h-4 w-4 mr-2" />
              Find a Doctor
            </Button>
          </Link>
        </div>
      </div>

      {/* Virtual account quick-copy — only shown when account exists */}
      {user.virtualAccountActive && user.virtualAccountNumber && (
        <VirtualAccountBanner
          accountNumber={user.virtualAccountNumber}
          bankName={user.virtualAccountBank}
          accountName={user.virtualAccountName}
          walletBalance={user.walletBalance ?? 0}
        />
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="border-emerald-900/20">
          <CardContent className="p-2 sm:p-4">
            <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-3">
              <div className="bg-emerald-900/20 p-1.5 sm:p-2 rounded-lg shrink-0">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
              </div>
              <div className="text-center sm:text-left min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-white leading-tight">{user.credits || 0}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-900/20">
          <CardContent className="p-2 sm:p-4">
            <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-3">
              <div className="bg-emerald-900/20 p-1.5 sm:p-2 rounded-lg shrink-0">
                <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
              </div>
              <div className="text-center sm:text-left min-w-0">
                <p className={`text-base sm:text-lg font-bold leading-tight ${
                  hasActivePlan ? 'text-white' : needsRenewal && user.membershipId ? 'text-red-400' : 'text-muted-foreground'
                }`}>
                  {hasActivePlan ? 'Active' : user.membershipId ? 'Expired' : 'None'}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Plan Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-900/20">
          <CardContent className="p-2 sm:p-4">
            <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-3">
              <div className="bg-emerald-900/20 p-1.5 sm:p-2 rounded-lg shrink-0">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
              </div>
              <div className="text-center sm:text-left min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {daysSinceAllocation !== null ? `${daysSinceAllocation}d` : '—'}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Top-up</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Plan + Available Plans */}
      <Card className="border-emerald-900/20">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Current Plan</p>
              {user.plan ? (
                <>
                  <p className="text-xl font-bold text-white">{user.plan.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {user.plan.credits} credits ·{' '}
                    {user.subscriptionEnd
                      ? `Expires ${new Date(user.subscriptionEnd).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : `${user.plan.duration} ${user.plan.duration === 1 ? 'month' : 'months'}`}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold text-muted-foreground">No Active Plan</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Subscribe to unlock full coverage at partner clinics
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {availablePlans
                .filter((p) => p.id !== user.plan?.id)
                .map((plan) => (
                  <Link key={plan.id} href={`/pricing`}>
                    <Badge
                      variant="outline"
                      className="border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/20 cursor-pointer px-3 py-1.5 text-xs"
                    >
                      {plan.name} · ₦{plan.price.toLocaleString()}/mo
                    </Badge>
                  </Link>
                ))}
              <Link href="/pricing">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8">
                  {user.plan ? 'Change Plan' : 'View Plans'}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Digital Membership Card */}
        <Card className="border-emerald-900/20 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-emerald-400" />
              Digital Membership ID
            </CardTitle>
            <CardDescription>Your unique membership identification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasActivePlan || user.membershipId ? (
              <>
                {/* Premium membership card */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 translate-x-8 -translate-y-8" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 -translate-x-6 translate-y-6" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-emerald-200 uppercase tracking-widest font-medium">
                          MediPadi
                        </p>
                        <p className="font-bold text-lg mt-0.5">{displayName}</p>
                      </div>
                      <Shield className="h-8 w-8 text-emerald-200/50" />
                    </div>
                    {user.membershipId ? (
                      <>
                        <p className="font-mono text-sm tracking-widest text-emerald-100 break-all">
                          {user.membershipId}
                        </p>
                        <p className="text-xs text-emerald-200 mt-1">Member ID</p>
                      </>
                    ) : (
                      <p className="text-xs text-emerald-200/70 italic">
                        Membership ID being assigned...
                      </p>
                    )}
                  </div>
                </div>

                {qrCode ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground text-center">
                      Show this at any MediPadi-registered facility
                    </p>
                    <div className="flex justify-center bg-white p-4 rounded-xl">
                      <img
                        src={qrCode}
                        alt="Membership QR Code"
                        className="w-40 h-40"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Your QR code will appear here once your membership ID is confirmed.
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-4 text-center py-6">
                <div className="w-16 h-16 bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-white">No Active Membership</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Subscribe to a plan to receive your digital membership ID
                  </p>
                </div>
                <Link href="/pricing">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    View Plans
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Status Card */}
        <Card className="border-emerald-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-white flex items-center">
              <Activity className="h-5 w-5 mr-2 text-emerald-400" />
              Account Status
            </CardTitle>
            <CardDescription>Your membership details and credits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/10 rounded-lg p-3 border border-emerald-900/10">
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-white font-medium text-sm mt-0.5 truncate">
                  {displayName}
                </p>
              </div>
              <div className="bg-muted/10 rounded-lg p-3 border border-emerald-900/10">
                <p className="text-xs text-muted-foreground">Credits</p>
                <p
                  className={`font-bold text-2xl mt-0.5 ${
                    needsRenewal ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {user.credits || 0}
                </p>
              </div>
            </div>
            <div className="bg-muted/10 rounded-lg p-3 border border-emerald-900/10">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-white font-medium text-sm mt-0.5 truncate">
                {user.email}
              </p>
            </div>
            {lastAllocation && (
              <div className="bg-muted/10 rounded-lg p-3 border border-emerald-900/10">
                <p className="text-xs text-muted-foreground">Last Credit Allocation</p>
                <p className="text-white font-medium text-sm mt-0.5">
                  {lastAllocation.toLocaleDateString()} · {daysSinceAllocation} days ago
                </p>
              </div>
            )}
            {needsRenewal && (
              <p className="text-xs text-red-400 px-1">
                No credits remaining. Renew your subscription to continue accessing services.
              </p>
            )}
            <Link href="/pricing" className="block pt-1">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                {needsRenewal ? 'Renew Subscription' : hasActivePlan ? 'Manage Plan' : 'Get a Plan'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <VirtualAccountCard userPhone={user.phoneNumber} walletBalance={user.walletBalance} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/doctors">
            <Card className="border-emerald-900/20 hover:border-emerald-600/40 transition-colors cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-emerald-900/20 p-2 rounded-lg group-hover:bg-emerald-900/30 transition-colors shrink-0">
                  <Stethoscope className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm">Find Doctors</p>
                  <p className="text-xs text-muted-foreground">Browse specialists</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/appointments">
            <Card className="border-emerald-900/20 hover:border-emerald-600/40 transition-colors cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-emerald-900/20 p-2 rounded-lg group-hover:bg-emerald-900/30 transition-colors shrink-0">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm">My Appointments</p>
                  <p className="text-xs text-muted-foreground">View & manage</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/pricing">
            <Card className="border-emerald-900/20 hover:border-emerald-600/40 transition-colors cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-emerald-900/20 p-2 rounded-lg group-hover:bg-emerald-900/30 transition-colors shrink-0">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm">Plans & Pricing</p>
                  <p className="text-xs text-muted-foreground">Manage subscription</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;
