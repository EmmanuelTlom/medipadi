import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file || file.size === 0) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Convert to base64 data URL and upload
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
