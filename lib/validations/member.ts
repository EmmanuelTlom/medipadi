import { z } from "zod";

export const registerMemberSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
    lastName: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long"),
    planType: z.enum(["monthly", "yearly"], {
        errorMap: () => ({ message: "Plan type must be either 'monthly' or 'yearly'" })
    }),
    subscriptionCost: z.number().positive("Subscription cost must be positive"),
    agentId: z.string().optional(),
});

export type RegisterMemberInput = z.infer<typeof registerMemberSchema>;
