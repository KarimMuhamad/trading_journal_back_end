import {z, ZodType } from "zod";
import { id } from "zod/v4/locales";

export class PlaybookValidation {
    static readonly CREATEPLAYBOOK: ZodType = z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
    });

    static readonly UPDATEPLAYBOOK: ZodType = z.object({
        id: z.string().regex(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
            "Invalid ID Format"
        ),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
    });

    static readonly UUIDVALIDATOR: ZodType = z.string().regex(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
        "Invalid ID Format"
    );

    static readonly GETALLPLAYBOOK: ZodType = z.object({
        name: z.string().min(1).optional(),
        page: z.number().min(1).positive(),
        size: z.number().min(1).max(50).positive(),
        view: z.enum(['basic', 'detailed']).optional()
    });
}