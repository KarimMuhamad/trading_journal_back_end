import { PositionType, TradeResult, TradeStatus } from "../../prisma/generated/enums"

export type TradeResponse = {
    id: string,
    pair: string,
    position: PositionType,
    entryPrice: number,
    exitPrice: number | null,
    positionSize: number,
    entry_price: number,
    exit_price: number | null,
    exit_time: Date | null,
    entry_time: Date,
    tp_price: number | null,
    sl_price: number | null,
    trade_duration: number | null,
    pnl: number | null,
    risk_reward: number | null,
    rr_actueal: number | null,
    trade_result: TradeResult | null,
    status: TradeStatus,
    playbooks: TradePlaybooks | null,  
}

export type TradePlaybooks = {
    id: string,
    name: string,
}
