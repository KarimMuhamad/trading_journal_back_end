import {z, ZodType} from "zod";

export class DecimalValidator {
    static readonly BALANCE: ZodType<number> = z.number().nonnegative().max(1e10);
    static readonly PERCENTAGE: ZodType<number> = z.number().gte(0.0001).lte(1);
    static readonly PRICE: ZodType<number> = z.number().nonnegative().max(1e10);
    static readonly SIZES: ZodType<number> = z.number().nonnegative().max(1e8);
    static readonly PNL: ZodType<number> = z.number().min(-1e10).max(1e10);
}
