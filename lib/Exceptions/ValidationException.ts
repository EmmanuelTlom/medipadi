import { ZodIssue } from "zod";

export class ValidationException<F = Record<string, any>> extends Error {
    public errors: Record<keyof F, ZodIssue[]>;

    constructor(
        message: string,
        errors: Record<keyof F, ZodIssue[]> = {} as Record<keyof F, ZodIssue[]>
    ) {
        super(message);
        this.name = 'ValidationException';
        this.errors = errors;
    }
}