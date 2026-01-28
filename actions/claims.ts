import { ClaimStatus } from "@prisma/client";
// Claims processing actions
import { db } from "@/lib/prisma";
import { verifyAdmin } from "./admin";

/**
 * Submit a claim request
 */
export async function submitClaim (
    providerId: string,
    memberId: string,
    amount: string,
    description: string,
    serviceDate: string
) {
    if (!providerId || !memberId || parseFloat(amount) <= 0) {
        throw new Error("Invalid claim details");
    }

    try {
        const provider = await db.user.findUnique({
            where: { id: providerId, role: "PROVIDER" },
        });

        if (!provider) {
            throw new Error("Provider not found");
        }

        const member = await db.user.findFirst({
            where: {
                OR: [
                    { id: memberId },
                    { membershipId: memberId },
                ],
                role: "PATIENT",
            },
        });

        if (!member) {
            throw new Error("Member not found");
        }

        const claim = await db.claim.create({
            data: {
                providerId,
                memberId: member.id,
                amount: parseFloat(amount),
                description: description || "",
                serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
                status: "PENDING",
            },
        });

        return claim;
    } catch (error) {
        throw new Error("Failed to submit claim: " + (error as Error).message);
    }
}

/**
 * Approve or reject a claim
 */
export async function processClaim (claimId: string, status: "APPROVED" | "REJECTED", adminNotes?: string) {
    if (!claimId || !["APPROVED", "REJECTED"].includes(status)) {
        throw new Error("Invalid claim ID or status");
    }

    try {
        // Fetch claim with provider and member details
        const existingClaim = await db.claim.findUnique({
            where: { id: claimId },
            include: {
                provider: true,
                member: true,
            },
        });

        if (!existingClaim) {
            throw new Error("Claim not found");
        }

        // Update claim status
        const claim = await db.claim.update({
            where: { id: claimId },
            data: {
                status,
                adminNotes: adminNotes || null,
            },
        });

        // Send notification to provider
        const notificationMessage = status === "APPROVED"
            ? `Your claim for ${existingClaim.member.firstName} ${existingClaim.member.lastName} (₦${existingClaim.amount.toFixed(2)}) has been APPROVED. ${adminNotes ? `Admin notes: ${adminNotes}` : 'Payment will be processed shortly.'}`
            : `Your claim for ${existingClaim.member.firstName} ${existingClaim.member.lastName} (₦${existingClaim.amount.toFixed(2)}) has been REJECTED. ${adminNotes ? `Reason: ${adminNotes}` : ''}`;

        // Send email notification
        if (existingClaim.provider.email) {
            try {
                const { sendEmailNotification } = await import("@/lib/server.utils");
                await sendEmailNotification(
                    existingClaim.provider.email,
                    `Claim ${status === "APPROVED" ? "Approved" : "Rejected"} - MediPadi`,
                    `Hello ${existingClaim.provider.firstName} ${existingClaim.provider.lastName},\n\n` +
                    notificationMessage +
                    `\n\nClaim Details:\n` +
                    `Claim ID: ${claimId}\n` +
                    `Member: ${existingClaim.member.firstName} ${existingClaim.member.lastName}\n` +
                    `Amount: ₦${existingClaim.amount.toFixed(2)}\n` +
                    `Service Date: ${existingClaim.serviceDate.toLocaleDateString()}\n\n` +
                    `Best regards,\nMediPadi Team`
                );
            } catch (emailError) {
                console.error("Failed to send email notification:", emailError);
            }
        }

        // Send SMS notification
        if (existingClaim.provider.phoneNumber) {
            try {
                const { sendSMSNotification } = await import("@/lib/server.utils");
                await sendSMSNotification(
                    existingClaim.provider.phoneNumber,
                    notificationMessage.substring(0, 160) // SMS character limit
                );
            } catch (smsError) {
                console.error("Failed to send SMS notification:", smsError);
            }
        }

        // If approved, create payout record for the provider
        if (status === "APPROVED") {
            try {
                await db.payout.create({
                    data: {
                        doctorId: existingClaim.providerId,
                        amount: existingClaim.amount,
                        credits: 0, // Claims are direct amounts, not credit-based
                        platformFee: 0, // No platform fee for provider claims
                        netAmount: existingClaim.amount,
                        status: "PROCESSING",
                        paypalEmail: existingClaim.provider.email, // Use provider's email as default
                        claimId: claimId, // Link to the claim
                    },
                });
            } catch (payoutError) {
                console.error("Failed to create payout record:", payoutError);
                // Don't throw error - claim approval should still succeed
            }
        }

        return claim;
    } catch (error) {
        console.error("Failed to process claim:", error);
        throw new Error("Failed to process claim");
    }
}

export async function getAllClaims (status: ClaimStatus | null = null) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    try {
        const allClaims = await db.claim.findMany({
            where: status ? {
                status: status,
            } : undefined,
            orderBy: {
                createdAt: "desc",
            },
        });

        return { claims: allClaims };
    } catch (error) {
        throw new Error("Failed to fetch claims");
    }
}