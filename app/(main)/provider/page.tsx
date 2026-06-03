import { Banknote, Building2, CheckCircle, Clock, FileText, History, QrCode, Stethoscope, Wallet, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { ClaimHistory } from './_components/claim-history';
import { ClaimSubmission } from './_components/claim-submission';
import { QRScanner } from './_components/qr-scanner';
import { BankDetails } from './_components/bank-details';
import { getCurrentUser } from '@/actions/onboarding';
import { getProviderEarnings } from '@/actions/provider';
import { Money } from '@toneflix/money';
import { redirect } from 'next/navigation';

export default async function ProviderDashboardPage() {
  const user = await getCurrentUser();

  if (user?.role !== 'PROVIDER') {
    redirect('/onboarding');
  }

  if (user.isActive === false) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center space-y-4">
        <div className="bg-red-900/20 p-5 rounded-full">
          <Building2 className="h-12 w-12 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Account Suspended</h1>
        <p className="text-muted-foreground max-w-md">
          Your provider account has been suspended.
          {user.suspendedReason && <> Reason: <span className="text-red-300 italic">"{user.suspendedReason}"</span>.</>}
        </p>
        <p className="text-sm text-muted-foreground">Please contact MediSure support to resolve this.</p>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.name ||
    'Provider';

  const earnings = await getProviderEarnings();

  const stats = [
    { label: 'Pending Claims', value: String(earnings.totalApprovedCount - earnings.totalPaidCount - earnings.pendingPayoutCount), icon: <Clock className="h-4 w-4" />, color: 'text-amber-400' },
    { label: 'Approved Claims', value: String(earnings.totalApprovedCount), icon: <CheckCircle className="h-4 w-4" />, color: 'text-emerald-400' },
    { label: 'Outstanding', value: Money.format(earnings.pendingPayoutAmount), icon: <Wallet className="h-4 w-4" />, color: 'text-amber-400' },
    { label: 'Total Paid Out', value: Money.format(earnings.totalPaidAmount), icon: <Banknote className="h-4 w-4" />, color: 'text-blue-400' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-emerald-700 p-6 md:p-8 isolate">
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-16 translate-y-16" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium">{greeting}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">{displayName}</h1>
            <p className="text-blue-200 text-sm mt-1 flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4" />
              Healthcare Provider · {user.email}
            </p>
          </div>
          {/* Quick stats inline */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {stats.map(({ label, value, icon, color }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5 text-center">
                <div className={`flex items-center justify-center gap-1 ${color} mb-0.5`}>
                  {icon}
                  <span className="font-bold text-base">{value}</span>
                </div>
                <p className="text-blue-100 text-xs leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { step: '1', title: 'Verify Member', desc: 'Scan QR code or enter membership ID to confirm the patient is active', color: 'border-purple-900/20 bg-purple-950/5 text-purple-400' },
          { step: '2', title: 'Provide Service', desc: 'Treat the patient and document the services rendered', color: 'border-blue-900/20 bg-blue-950/5 text-blue-400' },
          { step: '3', title: 'Submit Claim', desc: 'Enter the service details and claim amount for admin review', color: 'border-emerald-900/20 bg-emerald-950/5 text-emerald-400' },
        ].map(({ step, title, desc, color }) => (
          <Card key={step} className={`${color.split(' ').slice(0, 2).join(' ')}`}>
            <CardContent className="p-4 flex gap-3">
              <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${color.split(' ').slice(2).join(' ')}`}>
                {step}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{title}</p>
                <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="submit" className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <TabsList className="md:col-span-1 self-start sticky top-20 bg-muted/30 border h-auto flex sm:flex-row md:flex-col w-full p-1.5 rounded-xl md:space-y-1">
          {[
            { value: 'submit',   icon: <FileText className="h-4 w-4" />, label: 'Submit Claim',  desc: 'New claim' },
            { value: 'history',  icon: <History className="h-4 w-4" />,  label: 'Claim History', desc: 'View all claims' },
            { value: 'verify',   icon: <QrCode className="h-4 w-4" />,   label: 'Verify Member', desc: 'Check membership' },
            { value: 'earnings', icon: <Wallet className="h-4 w-4" />,   label: 'Earnings',      desc: 'Payouts & bank' },
          ].map(({ value, icon, label, desc }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 md:flex md:items-center md:gap-3 md:px-3 md:py-3 w-full text-left data-[state=active]:bg-blue-600/20"
            >
              <span className="hidden md:flex shrink-0 p-1.5 rounded-lg bg-muted/20">{icon}</span>
              <span className="hidden md:block text-left">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs text-muted-foreground">{desc}</span>
              </span>
              <span className="md:hidden text-xs">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="md:col-span-3">
          <TabsContent value="submit" className="border-none p-0">
            <ClaimSubmission user={user} />
          </TabsContent>
          <TabsContent value="history" className="border-none p-0">
            <ClaimHistory user={user} />
          </TabsContent>
          <TabsContent value="verify" className="border-none p-0">
            <QRScanner />
          </TabsContent>
          <TabsContent value="earnings" className="border-none p-0">
            <div className="space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Approved', value: Money.format(earnings.totalApprovedAmount), sub: `${earnings.totalApprovedCount} claims`, color: 'border-emerald-900/20', text: 'text-emerald-400', icon: <CheckCircle className="h-5 w-5" /> },
                  { label: 'Outstanding', value: Money.format(earnings.pendingPayoutAmount), sub: `${earnings.pendingPayoutCount} awaiting`, color: 'border-amber-900/20', text: 'text-amber-400', icon: <Clock className="h-5 w-5" /> },
                  { label: 'Total Paid Out', value: Money.format(earnings.totalPaidAmount), sub: `${earnings.totalPaidCount} processed`, color: 'border-blue-900/20', text: 'text-blue-400', icon: <Banknote className="h-5 w-5" /> },
                ].map(({ label, value, sub, color, text, icon }) => (
                  <Card key={label} className={color}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className={`text-xl font-bold mt-1 ${text}`}>{value}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                        </div>
                        <span className={text}>{icon}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Bank details */}
              <BankDetails existing={earnings.bankDetails} />

              {/* Recent claims */}
              {earnings.recentClaims.length > 0 && (
                <Card className="border-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Recent Claims</CardTitle>
                    <CardDescription>Last 5 submitted</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {earnings.recentClaims.map((c) => {
                      const statusCfg = {
                        PENDING:  { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
                        APPROVED: { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
                        REJECTED: { cls: 'bg-red-500/10 text-red-400 border-red-500/30' },
                      };
                      return (
                        <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg border border-muted/10 hover:border-muted/20">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-xs text-muted-foreground shrink-0">#{c.id.substring(0, 8)}</span>
                            <Badge variant="outline" className={`text-xs ${statusCfg[c.status]?.cls}`}>
                              {c.status.toLowerCase()}
                            </Badge>
                            {c.description && <span className="text-xs text-muted-foreground truncate">{c.description}</span>}
                          </div>
                          <div className="flex items-center gap-3 shrink-0 text-sm">
                            <span className="text-emerald-400 font-medium">{Money.format(c.amount)}</span>
                            <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* No bank details warning */}
              {!earnings.bankDetails && (
                <div className="flex items-start gap-3 bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
                  <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-200">
                    Add your bank account above so approved payouts are sent to you automatically when admin processes them.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
