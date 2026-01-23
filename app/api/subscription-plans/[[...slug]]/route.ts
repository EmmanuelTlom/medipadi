import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const slug = (await params)?.slug?.[0];

  try {
    if (slug) {
      const data = await db.subscriptionPlan.findFirst({
        where: { isActive: true, slug },
      });

      return NextResponse.json({ data });
    }

    const data = await db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { duration: 'asc' },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 },
    );
  }
}
