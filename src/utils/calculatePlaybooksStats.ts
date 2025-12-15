export function calculatePlaybooksStats(trades: {
    trade_result: string;
    pnl: number
}[]) {
    const total = trades.length;

    let win = 0;
    let grossProfit = 0;
    let grossLose = 0;

    for (const t of trades) {
        if (t.trade_result === "WIN") win++;
        if (t.pnl > 0) grossProfit += t.pnl;
        if (t.pnl < 0) grossLose += Math.abs(t.pnl);
    }

    return {
        total_trades: total,
        winrate: total === 0 ? 0 : (win/total) * 100,
        profit_factor: grossLose === 0 ? 0 : grossProfit / grossLose
    }
}