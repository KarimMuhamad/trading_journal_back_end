import {z, ZodType } from "zod";
import {DecimalValidator} from "./helpers/decimal_validator";
import {UuidValidator} from "./helpers/uuid_validator";

export class AccountValidation {
    static readonly CREATE: ZodType = z.object({
        nickname: z.string().min(3).max(100),
        exchange: z.string().min(1).max(50),
        balance: DecimalValidator.BALANCE,
        risk_per_trade: DecimalValidator.PERCENTAGE,
        max_risk_daily: DecimalValidator.PERCENTAGE
    });

    static readonly UPDATE: ZodType = z.object({
        id: UuidValidator.UUIDVALIDATOR,
        nickname: z.string().min(3).max(100).optional(),
        exchange: z.string().min(1).max(50).optional(),
        balance: DecimalValidator.BALANCE.optional(),
        risk_per_trade: DecimalValidator.PERCENTAGE.optional(),
        max_risk_daily: DecimalValidator.PERCENTAGE.optional()
    });

    static readonly GETALLACCOUNT: ZodType = z.object({
        page: z.number().min(1).positive().default(1),
        size: z.number().min(1).max(50).positive().default(5),
    });
}
