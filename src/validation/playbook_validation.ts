import {z, ZodType } from "zod";

export class PlaybookValidation {
    static readonly CREATEPLAYBOOK: ZodType = z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
    });
}