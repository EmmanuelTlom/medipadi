import { FileText, History, QrCode, Stethoscope } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ClaimHistory } from './_components/claim-history';
import { ClaimSubmission } from './_components/claim-submission';
import { QRScanner } from './_components/qr-scanner';
import { getCurrentUser } from '@/actions/onboarding';
import { redirect } from 'next/navigation';

export default async function ProviderDashboardPage() {
  const user = await getCurrentUser();

  if (user?.role !== 'PROVIDER') {
    redirect('/onboarding');
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.name ||
    'Provider';

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-6 md:p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-16 translate-y-16" />
        </div>
        <div className="relative">
          <p className="text-emerald-200 text-sm font-medium">{greeting}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">
            {displayName}
          </h1>
          <p className="text-emerald-200 text-sm mt-1 flex items-center gap-1">
            <Stethoscope className="h-4 w-4" />
            Provider Dashboard · {user.email}
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="submit"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <TabsList className="md:col-span-1 bg-muted/30 border h-14 md:h-40 flex sm:flex-row md:flex-col w-full p-2 md:p-1 rounded-md md:space-y-2 sm:space-x-2 md:space-x-0">
          <TabsTrigger
            value="submit"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <FileText className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Submit Claim</span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <History className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Claim History</span>
          </TabsTrigger>
          <TabsTrigger
            value="verify"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <QrCode className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Verify Member</span>
          </TabsTrigger>
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
        </div>
      </Tabs>
    </div>
  );
}
