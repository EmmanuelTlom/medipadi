import {
  initializePaystackPayment,
  processSubscription,
  processFundWallet,
} from '@/lib/payments';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/actions/onboarding';
import { verifyPaystackTransaction } from '@/lib/payments';

export async function POST (request: NextRequest) {
  try {
    const { amount, email, metadata, callback_url } = await request.json();

    const { data } = await initializePaystackPayment({
      amount,
      email,
      metadata,
      callback_url,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to initialize subscription: ' + error.message },
      { status: 402 },
    );
  }
}

export async function GET (request: NextRequest) {
  try {
    const reference = request.nextUrl.searchParams.get('reference');
    const pType = request.nextUrl.searchParams.get('type') as
      | 'subscription'
      | 'wallet';

    const { data, status } = await verifyPaystackTransaction(reference);

    if (!status) {
      return NextResponse.json(
        { error: `Paystack verification failed: ${data.message}` },
        { status: 402 },
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const callbacks = {
      wallet: () => processFundWallet(user.id, data),
      subscription: () =>
        processSubscription(String(data.metadata.planId), user.id, data),
    };

    return callbacks[pType]();
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to verify subscription: ' + error.message },
      { status: 402 },
    );
  }
}
