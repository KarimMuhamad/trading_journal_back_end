import prisma from "../../src/application/database";
import argon2 from "argon2";
import {PositionType, TradeResult, TradeStatus} from "../../prisma/generated/enums";
import { Prisma } from "../../prisma/generated/client";

export class TestDBUtils {
    static async cleanDB() {
        await prisma.user.deleteMany();
    }

    static async createUser(username: string = "testUser", email: string = "test@dev.com", password: string = "test123456") {
        const hashedPw = await argon2.hash(password);
        return prisma.user.create({data: {username, email, password: hashedPw}});
    }

    static async createPlaybook(userId: string,name: string = "test playbook", description: string = "description test playbook") {
        return prisma.playbooks.create({data: {user_id: userId, name, description}});
    }

    static async createAccount(
        userId: string, is_archived: boolean = false, nickname: string = "acc-test", exchange: string = "paper", balance: number = 1000, risk_per_trade: number = 0.1, max_risk_daily: number = 0.3,
    ) {
        return prisma.accounts.create({
            data: {
                user_id: userId,
                nickname,
                exchange,
                balance,
                risk_per_trade,
                max_risk_daily,
                is_archived,
            }
        });
    }

    static defaultTrade = (accountId: string) : Prisma.TradesCreateInput => ({
        account: {
            connect: {id: accountId},
        },
        pair: "BTC/USDT",
        position: PositionType.Long,
        entry_price: 10000,
        entry_time: new Date(),
        position_size: 0.01,
        sl_price: 9000,
        tp_price: 11000,
        status: TradeStatus.Running,
    })

    static async createTrade(accountId: string, override: Partial<Prisma.TradesCreateInput> = {}) {
        const isClosed = override.status === TradeStatus.Closed;

        return prisma.trades.create({
            data: {
                ...TestDBUtils.defaultTrade(accountId),
                ...(isClosed && {exit_time: new Date()}),
                ...override,
            }
        });
    }

    static async attachTradeToPlaybook( playbookId: string, tradeId: string ) {
        return prisma.tradePlaybooks.create({
            data: {
                playbook_id: playbookId,
                trade_id: tradeId,
            }
        });
    }

}
