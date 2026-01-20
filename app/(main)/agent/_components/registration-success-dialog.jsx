'use client';

import {
  Calendar,
  Check,
  CreditCard,
  Mail,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

export function RegistrationSuccessDialog({ open, onOpenChange, memberData }) {
  if (!memberData) return null;

  const handleViewMembers = () => {
    onOpenChange(false);
    // Trigger tab change to my-members
    const event = new CustomEvent('switchTab', { detail: 'my-members' });
    window.dispatchEvent(event);
  };

  const handleRegisterAnother = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-black/90 border-emerald-900/30">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-emerald-900/20 rounded-full p-4">
              <Check className="h-12 w-12 text-emerald-400" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center text-white">
            Member Registered Successfully!
          </DialogTitle>
          <DialogDescription className="text-center">
            The new member has been created and their login credentials will be
            sent to their email.
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-background border-emerald-900/20 p-4 mt-4">
          <div className="space-y-4">
            {/* Member Name */}
            <div className="flex items-center gap-3">
              <div className="bg-muted/20 rounded-full p-2">
                <User className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member Name</p>
                <p className="font-medium text-white">
                  {`${memberData.firstName} ${memberData.lastName}`}
                </p>
              </div>
            </div>

            <Separator className="bg-emerald-900/20" />

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="bg-muted/20 rounded-full p-2">
                <Mail className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="font-medium text-white">{memberData.email}</p>
              </div>
            </div>

            <Separator className="bg-emerald-900/20" />

            {/* Membership ID */}
            <div className="flex items-center gap-3">
              <div className="bg-muted/20 rounded-full p-2">
                <UserPlus className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Membership ID</p>
                <p className="font-medium text-white font-mono">
                  {memberData.membershipId}
                </p>
              </div>
            </div>

            <Separator className="bg-emerald-900/20" />

            {/* Credits */}
            <div className="flex items-center gap-3">
              <div className="bg-muted/20 rounded-full p-2">
                <CreditCard className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between flex-1">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Initial Credits
                  </p>
                  <p className="font-medium text-white">
                    {memberData.credits} credits
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                >
                  Active
                </Badge>
              </div>
            </div>

            {/* Subscription End */}
            {memberData.subscriptionEnd && (
              <>
                <Separator className="bg-emerald-900/20" />
                <div className="flex items-center gap-3">
                  <div className="bg-muted/20 rounded-full p-2">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Subscription Expires
                    </p>
                    <p className="font-medium text-white">
                      {format(
                        new Date(memberData.subscriptionEnd),
                        'MMMM d, yyyy',
                      )}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-300">
            ✉️ An email has been sent to{' '}
            <span className="font-medium">{memberData.email}</span> with their
            login credentials.
          </p>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleRegisterAnother}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Register Another
          </Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleViewMembers}
          >
            <Users className="w-4 h-4 mr-2" />
            View My Members
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
