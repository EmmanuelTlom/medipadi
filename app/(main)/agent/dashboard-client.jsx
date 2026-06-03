'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Users, UsersRound, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AgentMembersList } from './_components/agent-members-list';
import { AgentWalletFunding } from './_components/wallet-funding';
import { MemberRegistration } from './_components/member-registration';
import { Money } from '@toneflix/money';

export default function AgentDashboardPage({ user }) {
  const [activeTab, setActiveTab] = useState('wallet');

  useEffect(() => {
    const handleSwitchTab = (event) => {
      setActiveTab(event.detail);
    };
    window.addEventListener('switchTab', handleSwitchTab);
    return () => window.removeEventListener('switchTab', handleSwitchTab);
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.name ||
    'Agent';

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-6 md:p-8 isolate">
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-16 translate-y-16" />
        </div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-emerald-200 text-sm font-medium">{greeting}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">
              {displayName}
            </h1>
            <p className="text-emerald-200 text-sm mt-1 flex items-center gap-1">
              <UserCheck className="h-4 w-4" />
              Agent Dashboard
            </p>
          </div>
          <div className="bg-white/10 rounded-xl px-5 py-3 text-white backdrop-blur-sm border border-white/10 shrink-0">
            <p className="text-xs text-emerald-200 font-medium">Wallet Balance</p>
            <p className="text-2xl font-bold">{Money.format(user.walletBalance || 0)}</p>
          </div>
        </div>
      </div>

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
