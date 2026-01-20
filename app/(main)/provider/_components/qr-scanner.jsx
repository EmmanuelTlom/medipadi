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
import { toast } from 'sonner';
import useFetch from '@/hooks/use-fetch';

export function QRScanner({ onMemberVerified }) {
  const [membershipId, setMembershipId] = useState('');
  const [verifiedMember, setVerifiedMember] = useState(null);
  const [scanMode, setScanMode] = useState(false);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  const { loading, fn: verifyMember } = useFetch(async (id) => {
    const response = await fetch(
      `/api/provider/verify-member?membershipId=${id}`,
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify member');
    }
    return response.json();
  });

  const handleVerify = async () => {
    if (!membershipId) {
      toast.error('Please enter a membership ID');
      return;
    }

    try {
      const member = await verifyMember(membershipId);
      setVerifiedMember(member);
      toast.success(`Member verified: ${member.firstName} ${member.lastName}`);

      // Pass member data to parent if callback provided
      if (onMemberVerified) {
        onMemberVerified(member);
      }
    } catch (error) {
      setVerifiedMember(null);
      toast.error(error.message);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setScanMode(true);
      toast.info("Camera started. Point at member's QR code.");
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setScanMode(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const clearVerification = () => {
    setVerifiedMember(null);
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
                    onChange={(e) => setMembershipId(e.target.value)}
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
                onClick={startCamera}
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
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-purple-400 w-64 h-64 rounded-lg" />
                </div>
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Position the QR code within the frame
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="border-red-900/30"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Stop Camera
                </Button>
                <Button
                  onClick={() => {
                    // In a real implementation, this would trigger QR code detection
                    toast.info(
                      'QR code scanning functionality requires additional library',
                    );
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Capture
                </Button>
              </div>

              <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-md p-3">
                <p className="text-xs text-yellow-400">
                  Note: Full QR code scanning requires the react-qr-scanner
                  library. For now, please use manual entry above.
                </p>
              </div>
            </>
          )}

          {loading && <BarLoader width="100%" color="#a855f7" />}
        </CardContent>
      </Card>

      {/* Verified Member Info */}
      {verifiedMember && (
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
                <p className="font-semibold text-white">
                  {verifiedMember.firstName} {verifiedMember.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member ID</p>
                <p className="font-mono text-sm font-semibold text-white">
                  {verifiedMember.membershipId}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm text-white">{verifiedMember.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-sm text-white">
                  {verifiedMember.phoneNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Subscription Expires
                </p>
                <p className="text-sm text-white">
                  {formatDate(verifiedMember.subscriptionEnd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant="outline"
                  className={
                    verifiedMember.isActive
                      ? 'bg-green-950/20 text-green-400 border-green-900/30'
                      : 'bg-red-950/20 text-red-400 border-red-900/30'
                  }
                >
                  {verifiedMember.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {!verifiedMember.isActive && (
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
