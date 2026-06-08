import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey    = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json(
                { error: 'Storage not configured', missing: { cloudName: !cloudName, apiKey: !apiKey, apiSecret: !apiSecret } },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file || file.size === 0) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Build signed upload parameters (sorted alphabetically — Cloudinary requirement)
        const timestamp = Math.round(Date.now() / 1000).toString();
        const folder    = 'medipadi/members';
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
        const signature = createHash('sha256')
            .update(paramsToSign + apiSecret)
            .digest('hex');

        // Convert file to base64 data URL
        const arrayBuffer = await file.arrayBuffer();
        const base64  = Buffer.from(arrayBuffer).toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;

        // Direct fetch to Cloudinary — no SDK, no transformation param (applied at display time)
        const body = new FormData();
        body.append('file', dataUrl);
        body.append('api_key', apiKey);
        body.append('timestamp', timestamp);
        body.append('signature', signature);
        body.append('folder', folder);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const res = await fetch(uploadUrl, { method: 'POST', body });

        const text = await res.text();

        let json: any;
        try { json = JSON.parse(text); }
        catch {
            return NextResponse.json(
                { error: 'Cloudinary returned unexpected response', status: res.status, body: text.slice(0, 300) },
                { status: 500 }
            );
        }

        if (!res.ok) {
            return NextResponse.json(
                { error: 'Cloudinary upload failed', detail: json },
                { status: 500 }
            );
        }

        return NextResponse.json({ url: json.secure_url });

    } catch (error: any) {
        console.error('Photo upload error:', error?.message ?? error);
        return NextResponse.json(
            { error: 'Failed to upload photo', detail: error?.message },
            { status: 500 }
        );
    }
}
