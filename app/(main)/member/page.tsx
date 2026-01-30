import { Bell, Calendar, CreditCard } from 'lucide-react';
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
import { WelcomeDialog } from './_components/welcome-dialog';
import { checkUser } from '@/lib/checkUser';
import { generateQRCode } from '@/lib/server.utils';

async function MembershipID() {
  const user = await checkUser();
  const qrCode = await generateQRCode(user.membershipId);

  // Check if renewal is needed (example: if credits are 0 or lastCreditAllocation is more than 30 days ago)
  const needsRenewal = user.credits === 0;
  const lastAllocation = user.lastCreditAllocation
    ? new Date(user.lastCreditAllocation)
    : null;
  const daysSinceAllocation = lastAllocation
    ? Math.floor(
        (Date.now() - lastAllocation.getTime()) / (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <WelcomeDialog />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Membership Dashboard</h1>
        {needsRenewal && (
          <Badge variant="destructive" className="flex items-center gap-2">
            <Bell className="h-3 w-3" />
            Renewal Needed
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Membership ID Card */}
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-emerald-400" />
              Digital Membership ID
            </CardTitle>
            <CardDescription>
              Your unique membership identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Membership ID</p>
              <p className="text-lg font-mono text-white bg-muted/20 p-3 rounded-lg border border-emerald-900/20">
                {user.membershipId}
              </p>
            </div>
            {qrCode && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">QR Code</p>
                <div className="flex justify-center bg-white p-4 rounded-lg">
                  <img
                    src={qrCode}
                    alt="Membership QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Show this QR code at healthcare facilities for verification
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Information Card */}
        <Card className="border-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-emerald-400" />
              Account Status
            </CardTitle>
            <CardDescription>
              Your membership details and credits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-white font-medium">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
              <div className="border-t border-emerald-900/20 pt-3">
                <p className="text-sm text-muted-foreground">
                  Available Credits
                </p>
                <p className="text-3xl font-bold text-emerald-400">
                  {user.credits || 0}
                </p>
                {needsRenewal && (
                  <p className="text-xs text-red-400 mt-1">
                    You have no credits remaining. Please renew your
                    subscription.
                  </p>
                )}
              </div>
              {lastAllocation && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Last Credit Allocation
                  </p>
                  <p className="text-white font-medium">
                    {lastAllocation.toLocaleDateString()} ({daysSinceAllocation}{' '}
                    days ago)
                  </p>
                </div>
              )}
              <div className="pt-4">
                <Link href="/pricing">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    {needsRenewal ? 'Renew Subscription' : 'Upgrade Plan'}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <VirtualAccountCard />
      </div>
    </div>
  );
}

export default MembershipID;
