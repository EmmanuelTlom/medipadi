'use client';

import { Camera, Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PhotoCaptureProps {
  value: string;           // Cloudinary URL (empty string = no photo yet)
  onChange: (url: string) => void;
  disabled?: boolean;
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);

  const res = await fetch('/api/upload/photo', { method: 'POST', body: fd });
  const json = await res.json();

  if (!res.ok) throw new Error(json.error || 'Upload failed');
  return json.url as string;
}

export function PhotoCapture({ value, onChange, disabled }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [streaming, setStreaming] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [preview, setPreview] = useState<string>('');   // local object URL
  const [uploading, setUploading] = useState(false);

  /* ── helpers ── */
  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setStreaming(false);
    setVideoReady(false);
  };

  const handleFile = async (file: File) => {
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
      URL.revokeObjectURL(localUrl);
      setPreview('');
    } catch (err) {
      toast.error((err as Error).message || 'Upload failed — please try again');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      setStream(s);
      setVideoReady(false);
      setStreaming(true);
      // Attach stream after state update
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      }, 0);
    } catch {
      toast.error('Camera not accessible — use file upload instead');
    }
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !videoReady) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      toast.error('Camera not ready yet — wait a moment and try again');
      return;
    }

    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(video, 0, 0, w, h);

    canvas.toBlob(async (blob) => {
      if (!blob) { toast.error('Capture failed — please try again'); return; }
      stopCamera();
      await handleFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.85);
  };

  const clear = () => {
    onChange('');
    setPreview('');
    stopCamera();
  };

  /* ── render ── */

  // Uploading spinner
  if (uploading) {
    return (
      <div className="flex items-center gap-3">
        {preview && (
          <img src={preview} alt="Preview" className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-700/40 opacity-60" />
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Uploading photo…
        </div>
      </div>
    );
  }

  // Uploaded — show result
  if (value) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-700/40 shrink-0">
          <img src={value} alt="Member photo" className="w-full h-full object-cover" />
          {!disabled && (
            <button
              type="button"
              onClick={clear}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <p className="text-xs text-emerald-400">Photo uploaded ✓</p>
      </div>
    );
  }

  // Camera streaming
  if (streaming) {
    return (
      <div className="space-y-2">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onCanPlay={() => setVideoReady(true)}
          className="w-full max-h-56 rounded-xl border border-emerald-700/30 object-cover bg-black"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={capture}
            disabled={!videoReady}
            className="bg-emerald-600 hover:bg-emerald-700 flex-1"
          >
            <Camera className="h-3.5 w-3.5 mr-1.5" />
            {videoReady ? 'Capture Photo' : 'Camera loading…'}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={stopCamera}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Default — choose input method
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={startCamera}
          disabled={disabled}
          className="border-emerald-700/40 flex-1"
        >
          <Camera className="h-3.5 w-3.5 mr-1.5" /> Use Camera
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          className="border-emerald-700/40 flex-1"
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Photo
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Clear face photo — used by providers to verify identity before treatment.
      </p>
    </div>
  );
}
