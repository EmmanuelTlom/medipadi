'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Users, UsersRound, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AgentMembersList } from './_components/agent-members-list';
import { AgentWalletFunding } from './_components/wallet-funding';
import { MemberRegistration } from './_components/member-registration';
import { PageHeader } from '@/components/page-header';

export default function AgentDashboardPage({ user }) {
  const [activeTab, setActiveTab] = useState('wallet');

  // Listen for custom event to switch tabs
  useEffect(() => {
    const handleSwitchTab = (event) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('switchTab', handleSwitchTab);
    return () => window.removeEventListener('switchTab', handleSwitchTab);
  }, []);
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader icon={<UserCheck />} title="Agent Dashboard" />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <TabsList className="md:col-span-1 bg-muted/30 border h-14 md:h-fit flex sm:flex-row md:flex-col w-full p-2 md:p-2 rounded-md md:space-y-2 sm:space-x-2 md:space-x-0">
          <TabsTrigger
            value="wallet"
            className="flex-1 md:flex-none md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <Wallet className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Wallet</span>
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="flex-1 md:flex-none md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <Users className="h-4 w-4 mr-2 hidden md:inline" />
            <span>Register Members</span>
          </TabsTrigger>
          <TabsTrigger
            value="my-members"
            className="flex-1 md:flex-none md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <UsersRound className="h-4 w-4 mr-2 hidden md:inline" />
            <span>My Members</span>
          </TabsTrigger>
        </TabsList>
        <div className="md:col-span-3">
          <TabsContent value="wallet" className="border-none p-0">
            <AgentWalletFunding user={user} />
          </TabsContent>
          <TabsContent value="members" className="border-none p-0">
            <MemberRegistration user={user} />
          </TabsContent>
          <TabsContent value="my-members" className="border-none p-0">
            <AgentMembersList />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
