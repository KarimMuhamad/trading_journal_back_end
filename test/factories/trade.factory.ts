import { faker } from "@faker-js/faker/locale/en";
import { PositionType, TradeStatus } from "../../prisma/generated/enums";
import { Prisma } from "../../prisma/generated/client";
import prisma from "../../src/application/database";

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

    static base(accountId: string, position: PositionType = PositionType.Long) : Prisma.TradesCreateInput {
        const prices = this.generatePrices(position);

        return {
            account: {connect: {id: accountId}},
            pair: faker.helpers.arrayElement(["BTC", "ETH", "BNB", "SOL", "XRP"]),
            position,
            entry_price: prices.entry,
            sl_price: prices.sl,
            tp_price: prices.tp,
            position_size: faker.number.float({min: 0.01, max: 1, fractionDigits: 3}),
            entry_time: faker.date.recent({days: 3}),
            status: TradeStatus.Running,
        }
    }


    static async create(accountId: string, override: Partial<Prisma.TradesCreateInput> = {}) {
        const position = override.position ?? PositionType.Long;
        const isClosed = override.status === TradeStatus.Closed;

        return prisma.trades.create({
            data: {
                ...this.base(accountId, position),
                ...(isClosed && {exit_time: new Date()}),
                ...override
            }
        });
    }

}
