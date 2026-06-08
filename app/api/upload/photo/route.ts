import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Configure inside handler so env vars are always fresh
        const cloudName  = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey     = process.env.CLOUDINARY_API_KEY;
        const apiSecret  = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            console.error('Missing Cloudinary env vars:', { cloudName: !!cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret });
            return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
        }

        cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file || file.size === 0) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;

        const result = await cloudinary.uploader.upload(dataUrl, {
            folder: 'medipadi/members',
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                { quality: 'auto', fetch_format: 'auto' },
            ],
        });

        return NextResponse.json({ url: result.secure_url });
    } catch (error: any) {
        console.error('Photo upload error:', error?.message ?? error);
        return NextResponse.json(
            { error: 'Failed to upload photo', detail: error?.message },
            { status: 500 }
        );
    }
}
