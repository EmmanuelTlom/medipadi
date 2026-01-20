import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/onboarding';
import {
  Stethoscope,
  ClipboardList,
  FileText,
  History,
  QrCode,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ClaimSubmission } from './_components/claim-submission';
import { ClaimHistory } from './_components/claim-history';
import { QRScanner } from './_components/qr-scanner';

export default async function ProviderDashboardPage() {
  const user = await getCurrentUser();

  // Redirect if not a provider
  if (user?.role !== 'PROVIDER') {
    redirect('/onboarding');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader icon={<Stethoscope />} title="Provider Dashboard" />

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
