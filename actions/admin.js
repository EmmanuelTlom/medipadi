"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

/**
 * Creates a provider account (Clerk + DB).
 */
export async function createProvider({ firstName, lastName, email, phone, facilityName }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new Error("An account with this email already exists");

  const password = crypto.randomBytes(8).toString("base64").slice(0, 12) + "Pp1!";

  const { createClerkUser } = await import("@/lib/server.utils");
  const clerkUser = await createClerkUser({
    emailAddress: [email],
    password,
    firstName,
    lastName,
    publicMetadata: { role: "PROVIDER" },
  });

  await db.user.create({
    data: {
      clerkUserId: clerkUser.id,
      email,
      firstName,
      lastName,
      name: facilityName || `${firstName} ${lastName}`,
      role: "PROVIDER",
      isActive: true,
    },
  });

  revalidatePath("/admin");
  return { success: true, email, password };
}

/**
 * Suspend or reactivate an agent or provider account.
 */
export async function toggleUserActive(userId, isActive, reason) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (!["AGENT", "PROVIDER"].includes(user.role)) throw new Error("Can only suspend agents or providers");

  await db.user.update({
    where: { id: userId },
    data: {
      isActive,
      suspendedAt: isActive ? null : new Date(),
      suspendedReason: isActive ? null : (reason || "Suspended by admin"),
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Creates a test agent account (Clerk + DB) for development/testing.
 */
export async function createTestAgent({ firstName, lastName, email, phone }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  // Check if email already exists in DB
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new Error("An account with this email already exists");

  const password = crypto.randomBytes(8).toString("base64").slice(0, 12) + "Aa1!";

  const { createClerkUser } = await import("@/lib/server.utils");
  const clerkUser = await createClerkUser({
    emailAddress: [email],
    password,
    firstName,
    lastName,
    publicMetadata: { role: "AGENT" },
  });

  await db.user.create({
    data: {
      clerkUserId: clerkUser.id,
      email,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      role: "AGENT",
      walletBalance: 5000, // starter balance for testing
    },
  });

  revalidatePath("/admin");
  return { success: true, email, password };
}

/**
 * Verifies if current user has admin role
 */
export async function verifyAdmin () {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    return user?.role === "ADMIN";
  } catch (error) {
    console.error("Failed to verify admin:", error);
    return false;
  }
}

/**
 * Gets all doctors with pending verification
 */
export async function getPendingDoctors () {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const pendingDoctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { doctors: pendingDoctors };
  } catch (error) {
    throw new Error("Failed to fetch pending doctors");
  }
}

/**
 * Gets all verified doctors
 */
export async function getVerifiedDoctors () {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const verifiedDoctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
      orderBy: {
        name: "asc",
      },
    });

    return { doctors: verifiedDoctors };
  } catch (error) {
    console.error("Failed to get verified doctors:", error);
    return { error: "Failed to fetch verified doctors" };
  }
}

/**
 * Updates a doctor's verification status
 */
export async function updateDoctorStatus (formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const doctorId = formData.get("doctorId");
  const status = formData.get("status");

  if (!doctorId || !["VERIFIED", "REJECTED"].includes(status)) {
    throw new Error("Invalid input");
  }

  try {
    await db.user.update({
      where: {
        id: doctorId,
      },
      data: {
        verificationStatus: status,
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update doctor status:", error);
    throw new Error(`Failed to update doctor status: ${error.message}`);
  }
}

/**
 * Suspends or reinstates a doctor
 */
export async function updateDoctorActiveStatus (formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const doctorId = formData.get("doctorId");
  const suspend = formData.get("suspend") === "true";

  if (!doctorId) {
    throw new Error("Doctor ID is required");
  }

  try {
    const status = suspend ? "PENDING" : "VERIFIED";

    await db.user.update({
      where: {
        id: doctorId,
      },
      data: {
        verificationStatus: status,
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update doctor active status:", error);
    throw new Error(`Failed to update doctor status: ${error.message}`);
  }
}

/**
 * Gets all pending payouts that need admin approval
 */
export async function getPendingPayouts () {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  try {
    const pendingPayouts = await db.payout.findMany({
      where: {
        status: "PROCESSING",
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
            specialty: true,
            credits: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { payouts: pendingPayouts };
  } catch (error) {
    console.error("Failed to fetch pending payouts:", error);
    throw new Error("Failed to fetch pending payouts");
  }
}

/**
 * Approves a payout request and deducts credits from doctor's account
 */
export async function approvePayout (formData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const payoutId = formData.get("payoutId");

  if (!payoutId) {
    throw new Error("Payout ID is required");
  }

  try {
    // Get admin user info
    const { userId } = await auth();
    const admin = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    // Find the payout request
    const payout = await db.payout.findUnique({
      where: {
        id: payoutId,
        status: "PROCESSING",
      },
      include: {
        doctor: {
          select: {
            id: true,
            credits: true,
            email: true,
            firstName: true,
            lastName: true,
            paystackRecipientCode: true,
          },
        },
      },
    });

    if (!payout) {
      throw new Error("Payout request not found or already processed");
    }

    // Check if doctor has enough credits
    if (payout.doctor.credits < payout.credits) {
      throw new Error("Doctor doesn't have enough credits for this payout");
    }

    // Process the payout in a transaction
    await db.$transaction(async (tx) => {
      // Update payout status to PROCESSED
      await tx.payout.update({
        where: {
          id: payoutId,
        },
        data: {
          status: "PROCESSED",
          processedAt: new Date(),
          processedBy: admin?.id || "unknown",
        },
      });

      // Deduct credits from doctor's account
      await tx.user.update({
        where: {
          id: payout.doctorId,
        },
        data: {
          credits: {
            decrement: payout.credits,
          },
        },
      });

      // Create a transaction record for the deduction
      await tx.creditTransaction.create({
        data: {
          userId: payout.doctorId,
          amount: -payout.credits,
          type: "ADMIN_ADJUSTMENT",
        },
      });
    });

    revalidatePath("/admin");

    // Attempt automatic Paystack transfer — non-fatal, existing flow always completes first
    if (payout.doctor.paystackRecipientCode && payout.netAmount > 0) {
      try {
        const transferRes = await fetch('https://api.paystack.co/transfer', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: 'balance',
            amount: Math.round(payout.netAmount * 100), // kobo
            recipient: payout.doctor.paystackRecipientCode,
            reason: `Claim payout #${payoutId.substring(0, 8)}`,
          }),
        });
        const transferData = await transferRes.json();
        if (transferData.status) {
          await db.payout.update({
            where: { id: payoutId },
            data: { transferReference: transferData.data?.transfer_code ?? null },
          });
        } else {
          await db.payout.update({
            where: { id: payoutId },
            data: { transferError: transferData.message || 'Transfer failed' },
          });
        }
      } catch (transferErr) {
        console.error('Auto-transfer failed (payout already marked processed):', transferErr);
        await db.payout.update({
          where: { id: payoutId },
          data: { transferError: transferErr.message },
        }).catch(() => {}); // fire and forget
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to approve payout:", error);
    throw new Error(`Failed to approve payout: ${error.message}`);
  }
}
