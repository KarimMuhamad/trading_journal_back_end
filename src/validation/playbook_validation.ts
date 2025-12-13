import {z, ZodType } from "zod";
import { id } from "zod/v4/locales";

export class PlaybookValidation {
    static readonly CREATEPLAYBOOK: ZodType = z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
    });

    static readonly UPDATEPLAYBOOK: ZodType = z.object({
        id: z.string().min(10),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
    });
}