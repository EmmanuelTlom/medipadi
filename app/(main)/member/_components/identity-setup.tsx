'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, MapPin } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhotoCapture } from '@/components/photo-capture';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface IdentitySetupProps {
  userId: string;
  hasPhoto: boolean;
  hasLocation: boolean;
  currentLocation?: string | null;
  currentPhoto?: string | null;
}

export function IdentitySetup({ hasPhoto, hasLocation, currentLocation, currentPhoto }: IdentitySetupProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<string>(currentPhoto || '');
  const [location, setLocation] = useState(currentLocation || '');
  const [done, setDone] = useState(hasPhoto && hasLocation);

  if (done) return null;

  const handleSave = async () => {
    if (!photo && !hasPhoto) {
      toast.error('Please add a profile photo — clinics need it to verify your identity');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/member/update-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profilePhotoUrl: photo || undefined,
          location: location.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success('Identity details saved');
      setDone(true);
      router.refresh();
    } catch {
      toast.error('Failed to save — please try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-amber-900/30 bg-amber-950/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-base">
          <CheckCircle className="h-4 w-4 text-amber-400" />
          Complete Your Identity Setup
        </CardTitle>
        <CardDescription>
          Your photo and location are required for identity verification at partner clinics.
          Clinics will confirm your photo before providing services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!hasPhoto && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-white">
              Profile Photo <span className="text-red-400">*</span>
            </Label>
            <PhotoCapture value={photo} onChange={setPhoto} />
            <p className="text-xs text-muted-foreground">
              This cannot be changed without contacting admin.
            </p>
          </div>
        )}

        {!hasLocation && (
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-white flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-400" /> Your Location
            </Label>
            <Input
              id="location"
              placeholder="e.g. Kuje, Gwagwa, Zuba…"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="border-amber-900/30 focus:border-amber-600/60"
            />
            <p className="text-xs text-muted-foreground">Your area/community.</p>
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-amber-600 hover:bg-amber-700"
        >
          {saving ? 'Saving…' : 'Save & Complete Setup'}
        </Button>
      </CardContent>
    </Card>
  );
}
