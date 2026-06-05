'use client';

import { Camera, CheckCircle, MapPin, Upload, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface IdentitySetupProps {
  userId: string;
  hasPhoto: boolean;
  hasLocation: boolean;
  currentLocation?: string | null;
  currentPhoto?: string | null;
}

async function uploadToCloudinary(dataUrl: string): Promise<string> {
  const res = await fetch('/api/upload/photo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl }),
  });
  if (!res.ok) throw new Error('Upload failed');
  const { url } = await res.json();
  return url;
}

export function IdentitySetup({ userId, hasPhoto, hasLocation, currentLocation, currentPhoto }: IdentitySetupProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [streaming, setStreaming] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<string>(currentPhoto || '');
  const [location, setLocation] = useState(currentLocation || '');
  const [done, setDone] = useState(hasPhoto && hasLocation);

  if (done) return null;

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setStreaming(true);
    } catch {
      toast.error('Camera not accessible — use file upload instead');
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setStreaming(false);
  };

  const handleUpload = async (dataUrl: string) => {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(dataUrl);
      setPhoto(url);
      toast.success('Photo uploaded');
    } catch {
      toast.error('Photo upload failed — please try again');
    } finally {
      setUploading(false);
    }
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    stopCamera();
    handleUpload(canvas.toDataURL('image/jpeg', 0.8));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => handleUpload(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!photo && !hasPhoto) {
      toast.error('Please add a profile photo — it is required for identity verification at clinics');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/member/update-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhotoUrl: photo || undefined, location: location || undefined }),
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
          Your photo and location are required for identity verification at partner clinics. Clinics will check your photo before providing services.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Photo */}
        {!hasPhoto && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-white">
              Profile Photo <span className="text-red-400">*</span>
            </Label>

            {uploading ? (
              <div className="w-24 h-24 rounded-xl border-2 border-amber-700/40 flex items-center justify-center bg-muted/10">
                <Upload className="h-5 w-5 text-amber-400 animate-bounce" />
              </div>
            ) : photo ? (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-700/40">
                <img src={photo} alt="Your photo" className="w-full h-full object-cover" />
                <button onClick={() => setPhoto('')} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-600 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : streaming ? (
              <div className="space-y-2">
                <video ref={videoRef} autoPlay playsInline className="w-full max-h-52 rounded-xl border border-amber-700/30 object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={capture} className="bg-emerald-600 hover:bg-emerald-700 flex-1">
                    <Camera className="h-3.5 w-3.5 mr-1.5" /> Capture Photo
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={stopCamera}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={startCamera} className="border-amber-700/40 flex-1">
                  <Camera className="h-3.5 w-3.5 mr-1.5" /> Use Camera
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="border-amber-700/40 flex-1">
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Photo
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
            )}
            <p className="text-xs text-muted-foreground">Use a clear, well-lit face photo. This cannot be changed without admin approval.</p>
          </div>
        )}

        {/* Location */}
        {!hasLocation && (
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-white flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-400" /> Your Location
            </Label>
            <Input
              id="location"
              placeholder="e.g. Kuje, Gwagwa, Zuba..."
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="border-amber-900/30 focus:border-amber-600/60"
            />
            <p className="text-xs text-muted-foreground">Your area/community — used to generate your membership ID.</p>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving || uploading} className="w-full bg-amber-600 hover:bg-amber-700">
          {saving ? 'Saving…' : 'Save & Complete Setup'}
        </Button>
      </CardContent>
    </Card>
  );
}
