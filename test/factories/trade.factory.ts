import { faker } from "@faker-js/faker";
import { PositionType, TradeStatus } from "../../prisma/generated/enums";
import { Prisma } from "../../prisma/generated/client";
import prisma from "../../src/application/database";
import {calculateRiskAmount, calculateRiskReward} from "../../src/utils/calculateRR";
import { calculateRiskRewardActual, resultClassification } from "../../src/utils/closeTradeCalculate";

export class TradeFactory {
    
    private static generatePrices(position: PositionType) {
        const entry = faker.number.float({
            min: 1000,
            max: 60000,
            fractionDigits: 2,
        });

        if(position === PositionType.Long) {
            return {
                entry,
                sl: entry * faker.number.float({min: 0.95, max: 0.99}),
                tp: entry * faker.number.float({min: 1.01, max: 1.05}),
            };
        }

        return {
            entry,
            sl: entry * faker.number.float({min: 1.01, max: 1.05}),
            tp: entry * faker.number.float({min: 0.95, max: 0.99}),
        }
    }

    private static randomPosition(): PositionType {
        return faker.helpers.arrayElement([PositionType.Long, PositionType.Short]);
    }

    private static generateClosedFields(base: {entry_price: number; sl_price: number; tp_price: number; position: PositionType; position_size: number; entry_time: Date}) {
        const exit_type = faker.helpers.arrayElement(["TP", "SL"]);

        const exit_price = exit_type === "TP" ? base.tp_price : base.sl_price;

        const exit_time = faker.date.between({
            from: base.entry_time,
            to: new Date(),
        });
        
        const trade_duration = Math.floor((exit_time.getTime() - base.entry_time.getTime()) / 1000);

        const pnl = base.position === PositionType.Long 
            ? (exit_price - base.entry_price) * base.position_size
            : (base.entry_price - exit_price) * base.position_size;

        const rr_actual = calculateRiskRewardActual(pnl, calculateRiskAmount(base.entry_price, exit_price, base.position_size));
        const trade_result = resultClassification(pnl, rr_actual);
            
        return {
            exit_price,
            exit_time,
            trade_duration,
            pnl,
            rr_actual,
            trade_result,
        };
    }

    static base(accountId: string, position: PositionType = this.randomPosition()) : Prisma.TradesCreateInput {
        const prices = this.generatePrices(position);
        const position_size = faker.number.float({min: 0.01, max: 1, fractionDigits: 3})
        const risk_amount = calculateRiskAmount(prices.entry, prices.sl, position_size);
        const risk_reward = calculateRiskReward(prices.entry, prices.sl, prices.tp);

        return {
            account: {connect: {id: accountId}},
            pair: faker.helpers.arrayElement(["BTC", "ETH", "BNB", "SOL", "XRP"]),
            position,
            entry_price: prices.entry,
            sl_price: prices.sl,
            tp_price: prices.tp,
            risk_amount,
            risk_reward,
            position_size,
            entry_time: faker.date.recent({days: 30}),
            status: TradeStatus.Running,
        }
    }


    static async create(accountId: string, override: Partial<Prisma.TradesCreateInput> = {}) {
        const position = override.position ?? PositionType.Long;
        const base = this.base(accountId, position);
        const isClosed = override.status === TradeStatus.Closed;
        
        const closedFields = isClosed 
            ? this.generateClosedFields({
                entry_price: Number(base.entry_price),
                sl_price: Number(base.sl_price),
                tp_price: Number(base.tp_price),
                position,
                position_size: Number(base.position_size),
                entry_time: new Date(base.entry_time),
            })
            : {};

        return prisma.trades.create({
            data: {
                ...base,
                status: override.status ?? TradeStatus.Running,
                ...closedFields,
                ...override
            }
        });
    }

    static async createBatch(accountId: string, count: number, options?: {status?: TradeStatus; seed?: number}) {
        if(options?.seed !== undefined) {
            faker.seed(options.seed);
        }

        return Promise.all(
            Array.from({length: count}).map(() => {
                const position = this.randomPosition();

                return this.create(accountId, {
                    position,
                    status: options?.status ?? TradeStatus.Running
                });
            })
        );
    }

    static async createBatchWithPlaybook(accountId: string, playbookId: string, count: number, options: {}) {
        const trades = await this.createBatch(accountId, count, options);

        await Promise.all(
            trades.map(trd => prisma.tradePlaybooks.create({
                data: {
                    trade_id: trd.id,
                    playbook_id: playbookId,
                }
            }))
        )

        return trades;
    }

}
