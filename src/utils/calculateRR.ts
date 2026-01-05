export function calculateRiskReward(entry_price: number, sl_price: number | null, tp_price: number | null) : number | null {
    if(!tp_price || !sl_price) return null;
    
    const risk = Math.abs(entry_price - sl_price);
    const reward = Math.abs(tp_price - entry_price);
    
    const rr = risk / reward;

    return rr;
}

export function calculateRiskAmount(entry_price: number, sl_price: number | null, position_size: number) : number | null {
    if(!sl_price) return null;

    const risk_unit = Math.abs(entry_price - sl_price);

    if (risk_unit <= 0) return null;
    
    const risk_amount = risk_unit * position_size;

    return risk_amount;
}
