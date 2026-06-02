import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/onboarding';
import AgentDashboardPage from './dashboard-client';
import { UserCheck } from 'lucide-react';

export default async function AgentPage() {
  const user = await getCurrentUser();

  if (user?.role !== 'AGENT') {
    redirect('/onboarding');
  }

  if (user.isActive === false) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center space-y-4">
        <div className="bg-red-900/20 p-5 rounded-full">
          <UserCheck className="h-12 w-12 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Account Suspended</h1>
        <p className="text-muted-foreground max-w-md">
          Your agent account has been suspended.
          {user.suspendedReason && <> Reason: <span className="text-red-300 italic">"{user.suspendedReason}"</span>.</>}
        </p>
        <p className="text-sm text-muted-foreground">Please contact MediSure support to resolve this.</p>
      </div>
    );
  }

  return <AgentDashboardPage user={user} />;
}
