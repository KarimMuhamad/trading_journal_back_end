import {z, ZodType } from "zod";
import { UuidValidator } from "./helpers/uuid_validator";
import { PositionType } from "../../prisma/generated/enums";
import { DecimalValidator } from "./helpers/decimal_validator";

export class TradeValidation {
    static readonly CREATE_TRADE: ZodType = z.object({
        account_id: UuidValidator.UUIDVALIDATOR,
        pair: z.string().min(3).max(50),
        entry_time: z.coerce.date(),
        position: z.enum(PositionType),
        entry_price: DecimalValidator.PRICE,
        position_size: DecimalValidator.SIZES,
        tp_price: DecimalValidator.PRICE.optional(),
        sl_price: DecimalValidator.PRICE.optional(),
        playbook_ids: z.array(UuidValidator.UUIDVALIDATOR).optional(),
    })      

    static readonly CLOSE_TRADE: ZodType = z.object({
        trade_id: UuidValidator.UUIDVALIDATOR,
        exit_price: DecimalValidator.PRICE,
        exit_time: z.ceorce.date(),
        pnl: DecimalValidator.PRICE,
    })
}
