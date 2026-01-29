import * as z from "zod";
import { UuidValidator } from "./helpers/uuid_validator";
import { PositionType, TradeStatus } from "../../prisma/generated/enums";
import { DecimalValidator } from "./helpers/decimal_validator";

export class TradeValidation {
    static readonly CREATE_TRADE = z.object({
        account_id: z.uuidv7(),
        pair: z.string().min(3).max(50),
        entry_time: z.coerce.date(),
        position: z.enum(PositionType),
        entry_price: DecimalValidator.PRICE,
        position_size: DecimalValidator.SIZES,
        tp_price: DecimalValidator.PRICE.optional(),
        sl_price: DecimalValidator.PRICE.optional(),
        notes: z.string().trim().min(1).max(2000).optional(),
        link_img: z.url().optional(),
        playbook_ids: z.array(z.uuidv7()).default([]),
    })      

    static readonly GET_TRADE_BY_ID = z.object({
        trade_id: z.uuidv7(),
    })

    static readonly CLOSE_TRADE: ZodType = z.object({
        trade_id: UuidValidator.UUIDVALIDATOR,
        exit_price: DecimalValidator.PRICE,
        exit_time: z.coerce.date(),
        pnl: DecimalValidator.PRICE,
        notes: z.string().trim().min(1).max(2000).optional(),
        link_img: z.string().max(500).optional(),
    })

    static readonly UPDATE_TRADE: ZodType = z.object({
        trade_id: UuidValidator.UUIDVALIDATOR,
        pair: z.string().min(3).max(50).optional(),
        entry_time: z.coerce.date().optional(),
        position: z.enum(PositionType).optional(),
        entry_price: DecimalValidator.PRICE.optional(),
        position_size: DecimalValidator.SIZES.optional(),
        tp_price: DecimalValidator.PRICE.optional(),
        sl_price: DecimalValidator.PRICE.optional(),
        notes: z.string().trim().min(1).max(2000).optional(),
        link_img: z.string().max(500).optional(),
        playbook_ids: z.array(UuidValidator.UUIDVALIDATOR).optional(),
    })

    static readonly GET_ALL_TRADES = z.object({
        account_id: UuidValidator.UUIDVALIDATOR,
        search: z.string().min(1).optional(),
        page: z.coerce.number().min(1).positive().default(1),
        size: z.coerce.number().min(1).max(50).positive().default(10),
        status: z.enum([TradeStatus.Running, TradeStatus.Closed]).optional(),
        from_date: z.coerce.date().optional(),
        to_date: z.coerce.date().optional(),
    }) 
}
