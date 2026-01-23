import 'dotenv/config';
import { NextResponse } from 'next/server';
import Paystack from 'paystack-sdk';
import { db } from './prisma';
import type { Transaction } from 'paystack-sdk/dist/transaction/interface';
import { Money } from './money';

type Metadata = {
  [key: string]: string | number | boolean | undefined;
  planId?: string;
  planSlug?: string;
  userId?: string;
};

/**
 * Initialize Paystack payment
 * @param amount   - Amount in kobo (NGN minor units)
 * @param email    - Customer email
 * @param metadata - Additional metadata
 */
export const initializePaystackPayment = async ({
  amount,
  email,
  metadata = {},
  callback_url,
}: {
  amount: number;
  email: string;
  metadata?: Metadata;
  callback_url?: string;
}) => {
  try {
    const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

    const response = await paystack.transaction.initialize({
      amount: String(amount * 100),
      email,
      metadata,
      callback_url,
      reference: `MP${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    });

    if (!response.status) {
      throw new Error(`Paystack initialization failed: ${response.message}`);
    }

    return response;
  } catch (error) {
    console.error('Failed to initialize Paystack payment:', error);
    throw new Error('Failed to initialize payment:' + (error as Error).message);
  }
};

/**
 * Verify Paystack transaction
 * @param reference - Transaction reference
 * @returns
 */
export async function verifyPaystackTransaction (reference: string) {
  try {
    const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

    const response = await paystack.transaction.verify(reference);

    return response;
  } catch (error) {
    console.error('Failed to verify Paystack transaction:', error);
    throw new Error('Failed to verify transaction');
  }
}

/**
 * Process subscription payment
 *
 * @param planId
 * @param userId
 * @param data
 * @returns
 */
export const processSubscription = async (
  planId: string,
  userId: string,
  data: Transaction,
) => {
  const plan = await db.subscriptionPlan.findUnique({
    where: { id: planId, isActive: true },
  });

  if (!plan) {
    return NextResponse.json(
      {
        error:
          'The subscription plan is no longer available or inactive, please choose a different plan and contact support for refund.',
      },
      { status: 400 },
    );
  }

  const subscriptionEnd = new Date();
  subscriptionEnd.setMonth(subscriptionEnd.getMonth() + plan.duration);

  await db.user.update({
    where: { id: userId },
    data: {
      planId: plan.id,
      credits: plan.credits,
      subscriptionEnd,
      lastCreditAllocation: new Date(),
    },
  });

  return NextResponse.json({
    data,
    credits: plan.credits,
    subscriptionEnd,
    message: `Subscription successful! You are now subscribed to the ${plan.name} plan.`,
  });
};

/**
 * Fund agent wallet
 *
 * @param agentId
 * @param data
 * @returns
 */
export async function processFundWallet (agentId: string, data: Transaction) {
  if (!agentId || data.amount <= 0) {
    return NextResponse.json(
      { error: 'Invalid agent ID or amount.' },
      { status: 422 },
    );
  }

  try {
    const agent = await db.user.findUnique({
      where: { id: agentId, role: 'AGENT' },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found.' }, { status: 422 });
    }

    const balanceBefore = agent.walletBalance;
    const balanceAfter = balanceBefore + data.amount;

    // Update wallet balance and create transaction record
    await db.$transaction([
      db.user.update({
        where: { id: agentId },
        data: { walletBalance: balanceAfter },
      }),
      db.walletTransaction.create({
        data: {
          userId: agentId,
          amount: data.amount / 100,
          type: 'DEPOSIT',
          description: `Wallet deposit of ${Money.of(data.amount / 100)}`,
          balanceBefore,
          balanceAfter,
        },
      }),
    ]);

    const updatedAgent = await db.user.findUnique({
      where: { id: agentId },
    });

    return NextResponse.json({
      data,
      agent: updatedAgent,
      amount: data.amount / 100,
      message: `Wallet funded successfully with ${Money.of(data.amount / 100)}.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fund wallet' },
      { status: 500 },
    );
  }
}
