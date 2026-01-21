'use client';

import { Camera, CheckCircle, QrCode, Search, XCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { BarLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Member } from '@/interfaces/users';
import { Scanner } from '@yudiel/react-qr-scanner';
import { alova } from '@/lib/alova';
import { toast } from 'sonner';
import { useRequest } from 'alova/client';

export function QRScanner({
  onMemberVerified,
}: {
  onMemberVerified?: (member: Member) => void;
}) {
  const [membershipId, setMembershipId] = useState('');
  const [scanMode, setScanMode] = useState(false);

  const {
    data,
    loading,
    send: verifyMember,
    update,
  } = useRequest(
    (membershipId: string) =>
      alova.Get<Member>('/api/provider/verify-member', {
        params: {
          membershipId,
        },
      }),
    {
      immediate: false,
    },
  )
    .onSuccess(({ data }) => {
      toast.success(`Member verified: ${data.firstName} ${data.lastName}`);

      // Pass member data to parent if callback provided
      if (onMemberVerified) {
        onMemberVerified(data);
      }
    })
    .onError(({ error }) => {
      update({ data: undefined });
      toast.error(error.message || 'Failed to verify member');
    })
    .onComplete(() => {
      setScanMode(false);
    });

  const handleVerify = async () => {
    if (!membershipId) {
      toast.error('Please enter a membership ID');
      return;
    }

    await verifyMember(membershipId);
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const clearVerification = () => {
    update({ data: undefined });
    setMembershipId('');
  };

  return (
    <div className="space-y-6">
      {/* Scanner Card */}
      <Card className="border-purple-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <QrCode className="h-5 w-5 mr-2 text-purple-400" />
            Verify Member
          </CardTitle>
          <CardDescription>
            Scan QR code or enter membership ID manually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scanMode ? (
            <>
              {/* Manual Entry */}
              <div className="space-y-2">
                <Label htmlFor="membershipId">Membership ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="membershipId"
                    type="text"
                    placeholder="MED1234567890"
                    value={membershipId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setMembershipId(e.target.value)
                    }
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleVerify}
                    disabled={loading || !membershipId}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                </div>
              </div>

              {/* QR Scan Button */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or scan QR code
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setScanMode(true)}
                variant="outline"
                className="w-full border-purple-900/30"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Camera Scanner
              </Button>
            </>
          ) : (
            <>
              {/* Camera View */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <Scanner
                  onScan={([result]) => verifyMember(result.rawValue)}
                  onError={(error: Error) => toast.error(error.message)}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-purple-400 w-64 h-64 rounded-lg" />
                </div>
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Position the QR code within the frame
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={() => setScanMode(false)}
                  variant="outline"
                  className="border-red-900/30 flex-1"
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Stop Camera
                </Button>
              </div>
            </>
          )}

          {loading && <BarLoader width="100%" color="#a855f7" />}
        </CardContent>
      </Card>

      {/* Verified Member Info */}
      {data && (
        <Card className="border-emerald-900/20 bg-emerald-950/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-white flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-emerald-400" />
                Member Verified
              </CardTitle>
              <Button onClick={clearVerification} variant="ghost" size="sm">
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold text-white wrap-anywhere">
                  {data.firstName} {data.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member ID</p>
                <p className="font-mono text-sm font-semibold text-white wrap-anywhere">
                  {data.membershipId}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm text-white wrap-anywhere">{data.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-sm text-white wrap-anywhere">
                  {data.phoneNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Subscription Expires
                </p>
                <p className="text-sm text-white wrap-anywhere">
                  {formatDate(data.subscriptionEnd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant="outline"
                  className={
                    data.isActive
                      ? 'bg-green-950/20 text-green-400 border-green-900/30'
                      : 'bg-red-950/20 text-red-400 border-red-900/30'
                  }
                >
                  {data.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {!data.isActive && (
              <div className="bg-red-950/20 border border-red-900/30 rounded-md p-3">
                <p className="text-sm text-red-400">
                  ⚠️ This member's subscription has expired. Claims may not be
                  processed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-blue-900/20 bg-blue-950/10">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-blue-400">
              How to verify members:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Ask member to show their QR code from the mobile app</li>
              <li>Or manually enter their membership ID</li>
              <li>Verify member status before providing services</li>
              <li>Only active members can submit claims</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
