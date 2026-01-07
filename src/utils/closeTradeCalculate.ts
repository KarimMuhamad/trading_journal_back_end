import { TradeResult } from "../../prisma/generated/enums";

export function calculateRiskRewardActual(pnl: number, risk_amount: number | null) : number | null {
    if(!risk_amount || risk_amount <= 0) {
        return null;
    }


    const rr_actual = pnl / risk_amount;

    return rr_actual;
}


export function calculateTradeDuration(entry_time: Date, exit_time: Date) : number {
    const duration = Math.floor((exit_time.getTime() - entry_time.getTime()) / 1000);

    return duration;
}

export function resultClassification(pnl: number, rr_acutal: number | null) : TradeResult {
    const treshold = 0.1

    if(rr_acutal === null) {
        if(Math.abs(pnl) < 0.000001) return TradeResult.BE;
        return pnl > 0 ? TradeResult.Win : TradeResult.Lose;
    }

    if(rr_acutal > treshold) {
        return TradeResult.Win;
    }

    if(rr_acutal < -treshold) {
        return TradeResult.Lose;
    }

    return TradeResult.BE;
}
