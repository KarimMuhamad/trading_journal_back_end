import {z, ZodType } from "zod";
import {UuidValidator} from "./helpers/uuid_validator";

export class PlaybookValidation {
    static readonly CREATEPLAYBOOK: ZodType = z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
    });

    static readonly UPDATEPLAYBOOK: ZodType = z.object({
        id: UuidValidator.UUIDVALIDATOR,
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
    });

    static readonly GETALLPLAYBOOK: ZodType = z.object({
        search: z.string().min(1).optional(),
        page: z.number().min(1).positive().default(1),
        size: z.number().min(1).max(50).positive().default(5),
        view: z.enum(['basic', 'detailed']).optional()
    });
}
