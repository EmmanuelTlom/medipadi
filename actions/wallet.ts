'use server';

import { auth } from '@clerk/nextjs/server';
import { buildSubscriptionEmailText, sendEmailNotification } from '@/lib/server.utils';

import { db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function subscribeWithWallet(planId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized. Please sign in.');

  const [user, plan] = await Promise.all([
    db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        walletBalance: true,
      },
    }),
    db.subscriptionPlan.findUnique({
      where: { id: planId, isActive: true },
    }),
  ]);

  if (!user) throw new Error('User not found.');
  if (!plan) throw new Error('Plan not found or no longer available.');

  if (user.walletBalance < plan.price) {
    throw new Error(
      `Insufficient wallet balance. You need ₦${plan.price.toLocaleString()} but only have ₦${user.walletBalance.toLocaleString()}.`,
    );
  }

  const subscriptionEnd = new Date();
  subscriptionEnd.setMonth(subscriptionEnd.getMonth() + plan.duration);
  const reference = `WAL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: {
        walletBalance: { decrement: plan.price },
        planId: plan.id,
        credits: plan.credits,
        subscriptionEnd,
        lastCreditAllocation: new Date(),
      },
    }),
    db.walletTransaction.create({
      data: {
        userId: user.id,
        amount: -plan.price,
        type: 'WITHDRAWAL',
        description: `Subscription: ${plan.name}`,
        balanceBefore: user.walletBalance,
        balanceAfter: user.walletBalance - plan.price,
      },
    }),
    db.transaction.create({
      data: {
        reference,
        userId: user.id,
        amount: plan.price,
        status: 'SUCCESS',
        type: 'SUBSCRIPTION',
        metadata: { planId: plan.id, planSlug: plan.slug, source: 'wallet' },
        verifiedAt: new Date(),
        completedAt: new Date(),
        serviceProvided: true,
        serviceProvidedAt: new Date(),
      },
    }),
  ]);

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.name ||
    'Member';

  sendEmailNotification(
    user.email,
    `Your ${plan.name} is now active — MediPadi`,
    buildSubscriptionEmailText({
      name: displayName,
      planName: plan.name,
      credits: plan.credits,
      subscriptionEnd,
    }),
  ).catch(console.error);

  revalidatePath('/member');
  revalidatePath('/pricing');

  return { success: true, planName: plan.name, planSlug: plan.slug };
}
