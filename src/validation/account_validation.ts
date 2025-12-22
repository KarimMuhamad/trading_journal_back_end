import {z, ZodType } from "zod";
import { Prisma } from "../../prisma/generated/client";

export class AccountValidation {
    static readonly CREATE: ZodType = z.object({
        nickname: z.string().min(3).max(100),
        exchange: z.string().min(1).max(50),
        balance: z.number().transform((v) => Prisma.Decimal(v)).refine((val) => val.gte(0), {
            message: "Value must be non-negative",
        }),
        risk_per_trade: z.number().transform((v) => Prisma.Decimal(v)).refine((val) => val.gte(0), {
            message: "Value must be non-negative",
        }).refine((val) => val.lte(1), {
            message: "Value must be less than or equal to 1",
        }).refine((val) => val.decimalPlaces() <= 4, {
            message: "Max 4 decimal places allowed",
        }),
        max_risk_daily: z.number().transform((v) => Prisma.Decimal(v)).refine((val) => val.gte(0), {
            message: "Value must be non-negative",
        }).refine((val) => val.lte(1), {
            message: "Value must be less than or equal to 1",
        }).refine((val) => val.decimalPlaces() <= 4, {
            message: "Max 4 decimal places allowed",
        }),
    })
}
