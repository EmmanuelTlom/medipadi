import { AgentsList } from './components/agents-list';
import { ClaimsManagement } from './components/claims-management';
import { DashboardStats } from './components/dashboard-stats';
import { MembersList } from './components/members-list';
import { PendingDoctors } from './components/pending-doctors';
import { PendingPayouts } from './components/pending-payouts';
import { TabsContent } from '@/components/ui/tabs';
import { VerifiedDoctors } from './components/verified-doctors';
import dynamic from 'next/dynamic';
import { getDashboardStats } from '@/actions/members';

const PlansManagement = dynamic(() => import('./components/plans-management'), {
  ssr: false,
});

export default async function AdminPage() {
  const [dashboardStats] = await Promise.all([getDashboardStats()]);

  return (
    <>
      <TabsContent value="pending" className="border-none p-0">
        <PendingDoctors />
      </TabsContent>

      <TabsContent value="doctors" className="border-none p-0">
        <VerifiedDoctors />
      </TabsContent>

      <TabsContent value="payouts" className="border-none p-0">
        <PendingPayouts />
      </TabsContent>

      <TabsContent value="claims" className="border-none p-0">
        <ClaimsManagement />
      </TabsContent>

      <TabsContent value="members" className="border-none p-0">
        <MembersList />
      </TabsContent>

      <TabsContent value="agents" className="border-none p-0">
        <AgentsList />
      </TabsContent>

      <TabsContent value="reports" className="border-none p-0">
        <DashboardStats stats={dashboardStats} />
      </TabsContent>

      <TabsContent value="plans" className="border-none p-0">
        <PlansManagement />
      </TabsContent>
    </>
  );
}
