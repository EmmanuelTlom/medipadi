import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/onboarding';
import AgentDashboardPage from './dashboard-client';

export default async function AgentPage() {
  const user = await getCurrentUser();

  // Redirect if not an agent
  if (user?.role !== 'AGENT') {
    redirect('/onboarding');
  }

  return <AgentDashboardPage user={user} />;
}
