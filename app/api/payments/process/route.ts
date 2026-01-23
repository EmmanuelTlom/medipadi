import { NextRequest, NextResponse } from 'next/server';
import {
  initializePaystackPayment,
  processFundWallet,
  processSubscription,
} from '@/lib/payments';

import { db } from '@/lib/prisma';
import { getCurrentUser } from '@/actions/onboarding';
import { verifyPaystackTransaction } from '@/lib/payments';

const type = {
  wallet: 'WALLET_FUNDING',
  subscription: 'SUBSCRIPTION',
} as const;

export async function POST (request: NextRequest) {
  try {
    const { amount, email, metadata, callback_url } = await request.json();

    const { data } = await initializePaystackPayment({
      amount,
      email,
      metadata,
      callback_url,
    });

    // Create pending transaction record
    const user = await getCurrentUser();
    if (user && data.reference) {
      await db.transaction.create({
        data: {
          reference: data.reference,
          userId: user.id,
          amount: amount, // Convert kobo to Naira
          status: 'PENDING',
          type: type[metadata.type as keyof typeof type] || 'WALLET_FUNDING',
          metadata: metadata || {},
        },
      });
    }

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

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if transaction already exists and was processed
    const existingTransaction = await db.transaction.findUnique({
      where: { reference },
    });

    if (existingTransaction?.serviceProvided) {
      return NextResponse.json({
        error: 'This transaction has already been processed',
        alreadyProcessed: true,
      }, { status: 400 });
    }

    // Update transaction status to processing
    if (existingTransaction) {
      await db.transaction.update({
        where: { reference },
        data: {
          status: 'PROCESSING',
        },
      });
    }

    const { data, status } = await verifyPaystackTransaction(reference);

    if (!status) {
      // Update transaction as failed
      if (existingTransaction) {
        await db.transaction.update({
          where: { reference },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            webhookError: data.message || 'Verification failed',
          },
        });
      }

      return NextResponse.json(
        { error: `Paystack verification failed: ${data.message}` },
        { status: 402 },
      );
    }

    // Update transaction as verified
    if (existingTransaction) {
      await db.transaction.update({
        where: { reference },
        data: {
          status: 'SUCCESS',
          verifiedAt: new Date(),
          amount: data.amount / 100,
        },
      });
    } else {
      // Create transaction if it doesn't exist
      await db.transaction.create({
        data: {
          reference,
          userId: user.id,
          amount: data.amount / 100,
          status: 'SUCCESS',
          type: type[pType] || 'WALLET_FUNDING',
          verifiedAt: new Date(),
          metadata: data.metadata || {},
        },
      });
    }

    const callbacks = {
      wallet: () => processFundWallet(user.id, data),
      subscription: () =>
        processSubscription(String(data.metadata.planId), user.id, data),
    };

    const result = await callbacks[pType]();

    // Mark service as provided
    await db.transaction.update({
      where: { reference },
      data: {
        serviceProvided: true,
        serviceProvidedAt: new Date(),
        completedAt: new Date(),
      },
    });

    return result;
  } catch (error) {
    // Log webhook error
    const reference = request.nextUrl.searchParams.get('reference');
    if (reference) {
      try {
        await db.transaction.update({
          where: { reference },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            webhookError: error.message,
          },
        });
      } catch (dbError) {
        console.error('Failed to update transaction error:', dbError);
      }
    }

    return NextResponse.json(
      { error: 'Unable to verify subscription: ' + error.message },
      { status: 402 },
    );
  }
}
