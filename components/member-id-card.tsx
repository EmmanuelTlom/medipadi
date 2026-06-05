'use client';

import { Download, Printer } from 'lucide-react';
import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';

interface MemberIdCardProps {
  firstName: string;
  lastName: string;
  membershipId: string;
  planName?: string | null;
  subscriptionEnd?: string | Date | null;
  profilePhotoUrl?: string | null;
  location?: string | null;
}

export function MemberIdCard({
  firstName,
  lastName,
  membershipId,
  planName,
  subscriptionEnd,
  profilePhotoUrl,
  location,
}: MemberIdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const expiryDate = subscriptionEnd
    ? new Date(subscriptionEnd).toLocaleDateString('en-NG', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null;

  const printCard = () => {
    const content = cardRef.current?.innerHTML;
    if (!content) return;

    const win = window.open('', '_blank', 'width=600,height=800');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MediPadi ID — ${firstName} ${lastName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, sans-serif; background: #fff; display: flex; justify-content: center; align-items: flex-start; padding: 20px; }
            .id-card { width: 340px; background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%); border-radius: 16px; overflow: hidden; color: white; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
            .card-header { padding: 16px 20px 12px; border-bottom: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: space-between; }
            .logo-text { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
            .logo-sub { font-size: 8px; opacity: 0.7; letter-spacing: 1px; text-transform: uppercase; margin-top: 1px; }
            .card-badge { font-size: 9px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; padding: 3px 8px; letter-spacing: 0.5px; text-transform: uppercase; }
            .card-body { padding: 16px 20px; display: flex; gap: 14px; align-items: flex-start; }
            .photo { width: 80px; height: 80px; border-radius: 10px; object-fit: cover; border: 2px solid rgba(255,255,255,0.3); flex-shrink: 0; }
            .photo-placeholder { width: 80px; height: 80px; border-radius: 10px; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.3); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 700; color: rgba(255,255,255,0.6); }
            .info { flex: 1; }
            .member-name { font-size: 17px; font-weight: 700; line-height: 1.2; margin-bottom: 4px; }
            .member-id { font-size: 12px; font-family: monospace; background: rgba(0,0,0,0.2); border-radius: 4px; padding: 3px 7px; display: inline-block; margin-bottom: 8px; letter-spacing: 1px; }
            .info-row { display: flex; flex-direction: column; gap: 3px; }
            .info-label { font-size: 9px; opacity: 0.65; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-value { font-size: 11px; font-weight: 600; }
            .card-footer { padding: 12px 20px 16px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.15); }
            .qr-wrap { background: white; border-radius: 8px; padding: 6px; display: inline-block; }
            .footer-info { font-size: 9px; opacity: 0.65; text-align: right; line-height: 1.5; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${content}
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-3">
      {/* The actual card — rendered for screen + captured for print */}
      <div ref={cardRef}>
        <div className="id-card" style={{
          width: '340px',
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          borderRadius: '16px',
          overflow: 'hidden',
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          fontFamily: 'system-ui, sans-serif',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>MediPadi</div>
              <div style={{ fontSize: '8px', opacity: 0.7, letterSpacing: '1px', textTransform: 'uppercase', marginTop: '1px' }}>by MediSure Care Service Ltd</div>
            </div>
            <div style={{ fontSize: '9px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', padding: '3px 8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Health Plan Member
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="Member" style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                {firstName[0]}{lastName[0]}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.2, marginBottom: '4px' }}>{firstName} {lastName}</div>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', padding: '3px 7px', display: 'inline-block', marginBottom: '10px', letterSpacing: '1px' }}>
                {membershipId}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {planName && (
                  <div>
                    <div style={{ fontSize: '9px', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plan</div>
                    <div style={{ fontSize: '11px', fontWeight: 600 }}>{planName}</div>
                  </div>
                )}
                {expiryDate && (
                  <div>
                    <div style={{ fontSize: '9px', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Valid Until</div>
                    <div style={{ fontSize: '11px', fontWeight: 600 }}>{expiryDate}</div>
                  </div>
                )}
                {location && (
                  <div>
                    <div style={{ fontSize: '9px', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</div>
                    <div style={{ fontSize: '11px', fontWeight: 600 }}>{location}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer with QR */}
          <div style={{ padding: '12px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '6px', display: 'inline-block' }}>
              <QRCode value={membershipId} size={64} />
            </div>
            <div style={{ fontSize: '9px', opacity: 0.65, textAlign: 'right', lineHeight: 1.6 }}>
              <div>Show this card at any</div>
              <div>MediPadi partner clinic</div>
              <div style={{ marginTop: '4px', opacity: 0.5 }}>medisure.africa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={printCard} className="flex-1 border-emerald-700/40">
          <Printer className="h-3.5 w-3.5 mr-1.5" /> Print ID
        </Button>
        <Button size="sm" variant="outline" onClick={printCard} className="flex-1 border-emerald-700/40">
          <Download className="h-3.5 w-3.5 mr-1.5" /> Save as PDF
        </Button>
      </div>
    </div>
  );
}
