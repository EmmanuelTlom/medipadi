import { z } from "zod";

export const bookAppointmentSchema = z.object({
    doctorId: z.string().uuid("Invalid doctor ID"),
    startTime: z.coerce.date({
        required_error: "Start time is required",
        invalid_type_error: "Invalid start time",
    }),
    endTime: z.coerce.date({
        required_error: "End time is required",
        invalid_type_error: "Invalid end time",
    }),
    description: z.string().max(500, "Description must be less than 500 characters").optional().nullable(),
}).refine(
    (data) => data.endTime > data.startTime,
    {
        message: "End time must be after start time",
        path: ["endTime"],
    }
);

export const cancelAppointmentSchema = z.object({
    appointmentId: z.string().uuid("Invalid appointment ID"),
    reason: z.string().max(500, "Reason must be less than 500 characters").optional().nullable(),
});

export const completeAppointmentSchema = z.object({
    appointmentId: z.string().uuid("Invalid appointment ID"),
    diagnosis: z.string().max(1000, "Diagnosis must be less than 1000 characters").optional().nullable(),
    prescription: z.string().max(1000, "Prescription must be less than 1000 characters").optional().nullable(),
    notes: z.string().max(1000, "Notes must be less than 1000 characters").optional().nullable(),
});

export const appointmentQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional(),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
export type CompleteAppointmentInput = z.infer<typeof completeAppointmentSchema>;
export type AppointmentQueryInput = z.infer<typeof appointmentQuerySchema>;
