import { Trades } from "../../prisma/generated/client"
import { PositionType, TradeResult, TradeStatus } from "../../prisma/generated/enums"

export type TradeResponse = {
    id: string,
    account_id: string,
    pair: string,
    position: PositionType,
    position_size: number,
    entry_price: number,
    exit_price: number | null,
    exit_time: Date | null,
    entry_time: Date,
    tp_price: number | null,
    sl_price: number | null,
    trade_duration: number | null,
    pnl: number | null,
    risk_amount: number | null,
    risk_reward: number | null,
    rr_actueal: number | null,
    trade_result: TradeResult | null,
    status: TradeStatus,
    playbooks: TradePlaybooksRelation[],  
}

export type TradePlaybooksRelation = {
    id: string,
    name: string,
}

export type CreateTradeRequest = {
    account_id: string,
    entry_time: Date,
    pair: string,
    position: PositionType,
    entry_price: number,
    position_size: number,
    tp_price?: number | null,
    sl_price?: number | null,
    playbook_ids: string[],
}

export function toTradeResponse(trade: Trades & { trade_playbooks : {playbook: TradePlaybooksRelation}[]} ) : TradeResponse {
    return {
        id: trade.id,
        account_id: trade.account_id,
        pair: trade.pair,
        position: trade.position,
        position_size: trade.position_size.toNumber(),
        entry_price: trade.entry_price.toNumber(),
        exit_price: trade.exit_price?.toNumber() ?? null,
        trade_duration: trade.trade_duration ?? null,
        pnl: trade.pnl?.toNumber() ?? null,
        risk_amount: trade.risk_amount?.toNumber() ?? null,
        risk_reward: trade.risk_reward?.toNumber() ?? null,
        rr_actueal: trade.rr_actual?.toNumber() ?? null,
        trade_result: trade.trade_result ?? null,
        status: trade.status,
        exit_time: trade.exit_time,
        entry_time: trade.entry_time,
        tp_price: trade.tp_price?.toNumber() ?? null,
        sl_price: trade.sl_price?.toNumber() ?? null,
        playbooks: trade.trade_playbooks.map(pb => ({
            id: pb.playbook.id,
            name: pb.playbook.name,
        })),
    }
}
