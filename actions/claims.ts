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
        const claim = await db.claim.update({
            where: { id: claimId },
            data: {
                status,
                adminNotes: adminNotes || null,
            },
        });

        // TODO: Send notification to provider
        // TODO: If approved, process payment

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