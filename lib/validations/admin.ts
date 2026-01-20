import { z } from "zod";

// Doctor verification status
export const updateDoctorStatusSchema = z.object({
    doctorId: z.string().uuid("Invalid doctor ID format"),
    status: z.enum(["VERIFIED", "REJECTED", "PENDING"], {
        errorMap: () => ({ message: "Status must be VERIFIED, REJECTED, or PENDING" })
    }),
});

export const updateDoctorActiveStatusSchema = z.object({
    doctorId: z.string().uuid("Invalid doctor ID format"),
    isActive: z.boolean({
        required_error: "isActive is required",
        invalid_type_error: "isActive must be a boolean"
    }),
});

// Payout approval
export const approvePayoutSchema = z.object({
    payoutId: z.string().uuid("Invalid payout ID format"),
});

// Claim management
export const updateClaimStatusSchema = z.object({
    claimId: z.string().uuid("Invalid claim ID format"),
    status: z.enum(["APPROVED", "REJECTED", "PENDING"], {
        errorMap: () => ({ message: "Status must be APPROVED, REJECTED, or PENDING" })
    }),
    adminNotes: z.string().optional(),
});

export type UpdateDoctorStatusInput = z.infer<typeof updateDoctorStatusSchema>;
export type UpdateDoctorActiveStatusInput = z.infer<typeof updateDoctorActiveStatusSchema>;
export type ApprovePayoutInput = z.infer<typeof approvePayoutSchema>;
export type UpdateClaimStatusInput = z.infer<typeof updateClaimStatusSchema>;
