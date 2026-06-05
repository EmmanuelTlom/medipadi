import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@clerk/nextjs/server';
import { uploadPhoto } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { dataUrl } = await request.json();

        if (!dataUrl || !dataUrl.startsWith('data:image/')) {
            return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
        }

        const url = await uploadPhoto(dataUrl);
        return NextResponse.json({ url });
    } catch (error) {
        console.error('Photo upload error:', error);
        return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
    }
}
