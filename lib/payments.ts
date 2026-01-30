import 'dotenv/config';

import { DedicatedAccountCreatedResponse } from 'paystack-sdk/dist/dedicated/interface';
import { Money } from '@toneflix/money';
import { NextResponse } from 'next/server';
import Paystack from 'paystack-sdk';
import type { Transaction } from 'paystack-sdk/dist/transaction/interface';
import { db } from './prisma';
import { dvaResponse } from './dummy';

// Type for Paystack dedicated account response
type DedicatedAccountResponse = {
  account_number: string;
  account_name: string;
  bank?: {
    name: string;
    id: number;
    slug: string;
  };
  bank_name?: string;
  customer?: {
    customer_code: string;
  };
};

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

/**
 * Create or retrieve Paystack virtual account for a user
 *
 * @param userId - The user ID
 * @param email - User email
 * @param firstName - User first name
 * @param lastName - User last name
 * @returns Virtual account details
 */
export async function createVirtualAccount (
  userId: string,
  email: string,
  firstName: string,
  lastName: string
) {
  try {
    const bank = ['wema-bank', 'titan-paystack'][Math.floor(Math.random() * 2)];
    const testing = process.env.PAYSTACK_SECRET_KEY?.includes('test');
    const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

    // Check if user already has a virtual account
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        virtualAccountNumber: true,
        virtualAccountBank: true,
        virtualAccountName: true,
        paystackCustomerId: true,
        virtualAccountActive: true,
      },
    });

    if (user?.virtualAccountActive && user.virtualAccountNumber) {
      return {
        success: true,
        data: {
          account_number: user.virtualAccountNumber,
          bank_name: user.virtualAccountBank,
          account_name: user.virtualAccountName,
          customer_code: user.paystackCustomerId,
        },
        message: 'Virtual account already exists',
      };
    }

    // Check if customer exists on Paystack or create new customer
    let paystackCustomerId = user.paystackCustomerId

    if (!paystackCustomerId) {
      const { data: customer } = await paystack.customer.create({
        email,
        first_name: firstName,
        last_name: lastName,
      });
      paystackCustomerId = customer.customer_code;

      // Update user with Paystack customer ID
      await db.user.update({
        where: { id: userId },
        data: { paystackCustomerId },
      });
    }

    // Create dedicated virtual account using raw API call
    const virtualResponse = testing ? dvaResponse : (await paystack.dedicated.create({
      customer: paystackCustomerId,
      preferred_bank: bank,
      first_name: firstName,
      last_name: lastName,
    })) as DedicatedAccountCreatedResponse

    if (!virtualResponse.status || !virtualResponse.data) {
      throw new Error(virtualResponse.message || 'Failed to create virtual account');
    }

    const accountData = virtualResponse.data

    // Update user with virtual account details
    await db.user.update({
      where: { id: userId },
      data: {
        virtualAccountNumber: accountData.account_number,
        virtualAccountBank: accountData.bank?.name || 'Wema Bank',
        virtualAccountName: accountData.account_name,
        paystackCustomerId: accountData.customer?.customer_code,
        virtualAccountActive: true,
        virtualAccountCreatedAt: new Date(),
      },
    });

    return {
      success: true,
      data: accountData,
      message: 'Virtual account created successfully',
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Failed to create virtual account'
    );
  }
}

/**
 * Process virtual account payment
 * - Add to wallet
 * - Auto-subscribe if amount matches a plan
 *
 * @param userId - The user ID
 * @param amount - Payment amount in kobo
 * @param reference - Transaction reference
 */
export async function processVirtualAccountPayment (
  userId: string,
  amount: number,
  reference: string
) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        walletBalance: true,
        planId: true,
        subscriptionEnd: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const amountInNaira = amount / 100;

    // Check if amount matches any subscription plan
    const matchingPlan = await db.subscriptionPlan.findFirst({
      where: {
        price: amountInNaira,
        isActive: true,
      },
    });

    // Check if user is already on this plan
    const shouldAutoSubscribe =
      matchingPlan &&
      user.planId !== matchingPlan.id &&
      (!user.subscriptionEnd || new Date() > user.subscriptionEnd);

    if (shouldAutoSubscribe && matchingPlan) {
      // Auto-subscribe to the plan
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + matchingPlan.duration);

      await db.$transaction([
        // Update user subscription
        db.user.update({
          where: { id: userId },
          data: {
            planId: matchingPlan.id,
            credits: matchingPlan.credits,
            subscriptionEnd,
            lastCreditAllocation: new Date(),
          },
        }),
        // Create transaction record
        db.transaction.create({
          data: {
            reference,
            userId,
            amount: amountInNaira,
            status: 'SUCCESS',
            type: 'SUBSCRIPTION',
            metadata: {
              planId: matchingPlan.id,
              planSlug: matchingPlan.slug,
              autoSubscribed: true,
              source: 'virtual_account',
            },
            verifiedAt: new Date(),
            completedAt: new Date(),
            serviceProvided: true,
            serviceProvidedAt: new Date(),
          },
        }),
      ]);

      return {
        success: true,
        type: 'subscription',
        plan: matchingPlan,
        subscriptionEnd,
        message: `Auto-subscribed to ${matchingPlan.name}`,
      };
    } else {
      // Add to wallet
      const balanceBefore = user.walletBalance;
      const balanceAfter = balanceBefore + amountInNaira;

      await db.$transaction([
        // Update wallet balance
        db.user.update({
          where: { id: userId },
          data: { walletBalance: balanceAfter },
        }),
        // Create wallet transaction
        db.walletTransaction.create({
          data: {
            userId,
            amount: amountInNaira,
            type: 'DEPOSIT',
            description: `Virtual account payment - ${reference}`,
            balanceBefore,
            balanceAfter,
          },
        }),
        // Create payment transaction record
        db.transaction.create({
          data: {
            reference,
            userId,
            amount: amountInNaira,
            status: 'SUCCESS',
            type: 'WALLET_FUNDING',
            metadata: {
              source: 'virtual_account',
            },
            verifiedAt: new Date(),
            completedAt: new Date(),
            serviceProvided: true,
            serviceProvidedAt: new Date(),
          },
        }),
      ]);

      return {
        success: true,
        type: 'wallet',
        amount: amountInNaira,
        balanceAfter,
        message: `Wallet credited with ${Money.of(amountInNaira)}`,
      };
    }
  } catch (error) {
    console.error('Failed to process virtual account payment:', error);
    throw error;
  }
}
