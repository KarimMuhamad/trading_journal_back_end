import 'dotenv/config';
import { buildUrl } from "./utils/routes";
import { TestDBUtils } from "./utils/prisma_helpers";
import { ApiTestHelper } from "./utils/api_helper";
import supertest from "supertest";
import { web } from "../src/application/web";
import logger from "../src/application/logger";
import { PositionType, TradeStatus } from '../prisma/generated/enums';
import { TradeFactory } from './factories/trade.factory';
import prisma from "../src/application/database";

describe('POST ' + buildUrl('/accounts/:accountId/trades'), () => {
    let accessToken: string;
    let account: any;
    let playbookGlobal: any;
    let user: any;

    beforeEach(async () => {
        user = await TestDBUtils.createUser("test", "test@dev.com", "test123456");
        const session = await ApiTestHelper.createSession("test", "test123456");
        accessToken = session.accessToken;

        account = await TestDBUtils.createAccount(user.id, false);
        playbookGlobal  = await TestDBUtils.createPlaybook(user.id, "OB Extreme", "Testing OB");
    });

    afterEach(async () => {
        await TestDBUtils.cleanDB();
    });

    it('should be able to execute trade', async () => {
        const response = await supertest(web).post(buildUrl(`/accounts/${account.id}/trades`)).set('Authorization', 'Bearer ' + accessToken).send({
            entry_time: new Date(),
            position: PositionType.Long, 
            pair: "BTC/USDT",
            entry_price: 99.123,
            position_size: 0.3,
            sl_price: 98.111,
            tp_price: 125.888,
            playbook_ids: [playbookGlobal.id],
        });
        
        logger.debug(response.body);

        expect(response.body.status).toBe("success");
        expect(response.body.data).toHaveProperty("id");
        expect(response.body.data.pair).toBe("BTC/USDT");
        expect(response.body.data.playbooks.length).toBe(1);
    });

    it('should be able to execute trade with more than one playbook', async () => {
        const playbook2 = await TestDBUtils.createPlaybook(user.id, "Liquidity Sweep", "Test Liquidity")

        const response = await supertest(web).post(buildUrl(`/accounts/${account.id}/trades`)).set('Authorization', 'Bearer ' + accessToken).send({
            entry_time: new Date(),
            position: PositionType.Long, 
            pair: "BTC/USDT",
            entry_price: 99.234,
            position_size: 0.00213,
            sl_price: 99.065,
            tp_price: 100.123,
            playbook_ids: [
                playbookGlobal.id,
                playbook2.id,
            ], 
        });
        
        logger.debug(response.body);

        expect(response.body.status).toBe("success");
        expect(response.body.data).toHaveProperty("id");
        expect(response.body.data.pair).toBe("BTC/USDT");
        expect(response.body.data.playbooks.length).toBe(2);
    });

    it('should be able to execute trade with no playbook', async () => {
        const response = await supertest(web).post(buildUrl(`/accounts/${account.id}/trades`)).set('Authorization', 'Bearer ' + accessToken).send({
            entry_time: new Date(),
            position: PositionType.Long, 
            pair: "BTC/USDT",
            entry_price: 99.234,
            position_size: 0.00213,
            sl_price: 99.065,
            tp_price: 100.123,
            playbook_ids: [], 
        });
        
        logger.debug(response.body);

        expect(response.body.status).toBe("success");
        expect(response.body.data).toHaveProperty("id");
        expect(response.body.data.pair).toBe("BTC/USDT");
        expect(response.body.data.playbooks.length).toBe(0);
    });


    it('should be reject with validation error', async () => {
        const playbook2 = await TestDBUtils.createPlaybook(user.id, "Liquidity Sweep", "Test Liquidity")

        const response = await supertest(web).post(buildUrl(`/accounts/${account.id}/trades`)).set('Authorization', 'Bearer ' + accessToken).send({
            entry_time: new Date(),
            position: PositionType.Long, 
            pair: "BTC/USDT",
            entry_price: "angka",
            position_size: 0.00213,
            sl_price: 99.065,
            tp_price: 100.123,
            playbook_ids: [
                playbookGlobal.id,
                playbook2.id,
            ], 
        });
        
        logger.debug(response.body);

        expect(response.body.status).toBe("error");

    });
    
    it('should be reject with account not found', async () => {
        const randomUUID = crypto.randomUUID();
        const playbook2 = await TestDBUtils.createPlaybook(user.id, "Liquidity Sweep", "Test Liquidity")

        const response = await supertest(web).post(buildUrl(`/accounts/${randomUUID}/trades`)).set('Authorization', 'Bearer ' + accessToken).send({
            entry_time: new Date(),
            position: PositionType.Long, 
            pair: "BTC/USDT",
            entry_price: "angka",
            position_size: 0.00213,
            sl_price: 99.065,
            tp_price: 100.123,
            playbook_ids: [
                playbookGlobal.id,
                playbook2.id,
            ], 
        });
        
        logger.debug(response.body);

        expect(response.body.status).toBe("error");

    });

    it('should be reject with Authorization error', async () => {
        const response = await supertest(web).post(buildUrl(`/accounts/${account.id}/trades`)).set('Authorization', 'Bearer ' + 'salah').send({
            entry_time: new Date(),
            position: PositionType.Long,
            pair: "BTC/USDT",
            entry_price: 99.123,
            position_size: 0.00123,
            playbook_ids: [playbookGlobal.id],
        });

        logger.debug(response.body);

        expect(response.body.status).toBe("error");
    });
});

describe('GET ' + buildUrl('/trades/:tradeId'), () => {
    let accessToken: string;
    let account: any;
    let playbookGlobal: any;
    let trade: any;
    let user: any;
    

    beforeEach(async () => {
        user = await TestDBUtils.createUser("test", "test@dev.com", "test123456");
        const session = await ApiTestHelper.createSession("test", "test123456");
        accessToken = session.accessToken;

        account = await TestDBUtils.createAccount(user.id, false);
        playbookGlobal  = await TestDBUtils.createPlaybook(user.id, "OB Extreme", "Testing OB");
        trade = await TradeFactory.create(account.id, {
            position: PositionType.Short,
        })
        await TestDBUtils.attachTradeToPlaybook(playbookGlobal.id, trade.id);
    });

    afterEach(async () => {
        await TestDBUtils.cleanDB();
    });

    it('should be able to get trade by id', async () => {
        const response = await supertest(web).get(buildUrl(`/trades/${trade.id}`)).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
    });

    it('should be able to reject if trade id not found', async () => {
        const randomUUID = crypto.randomUUID();

        const response = await supertest(web).get(buildUrl(`/trades/${randomUUID}`)).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
    });

    it('should be reject with validation error', async () => {
        const response = await supertest(web).get(buildUrl(`/trades/test`)).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
    });

    it('should be reject with credential error', async () => {
        const response = await supertest(web).get(buildUrl(`/trades/${trade.id}`)).set('Authorization', 'Bearer ' + 'salah');

        logger.info(response.body);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
    });

});

describe('PATCH ' + buildUrl('/trades/:tradeId/close'), () => {
    let accessToken: string;
    let account: any;
    let playbookGlobal: any;
    let trade: any;
    let user: any;
    

    beforeEach(async () => {
        user = await TestDBUtils.createUser("test", "test@dev.com", "test123456");
        const session = await ApiTestHelper.createSession("test", "test123456");
        accessToken = session.accessToken;

        account = await TestDBUtils.createAccount(user.id, false);
        playbookGlobal  = await TestDBUtils.createPlaybook(user.id, "OB Extreme", "Testing OB");
        trade = await TradeFactory.create(account.id);
        await TestDBUtils.attachTradeToPlaybook(playbookGlobal.id, trade.id);
    });

    afterEach(async () => {
        await TestDBUtils.cleanDB();
    });

    it('should be able to close trade', async () => {
        const exit_price = trade.position === PositionType.Long ? trade.entry_price * 1.01 : trade.entry_price * 0.99;

        const response = await supertest(web).patch(buildUrl(`/trades/${trade.id}/closed`)).set('Authorization', 'Bearer ' + accessToken).send({
            exit_time: new Date(),
            exit_price,
            pnl: 100,
        });

        console.log(response.body);

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.status).toBe(TradeStatus.Closed);
    });

    it('should be reject if trade was closed', async () => {
        const exit_price = trade.position === PositionType.Long ? trade.entry_price * 1.01 : trade.entry_price * 0.99;

        await prisma.trades.update({
            where: { id: trade.id },
            data: { status: TradeStatus.Closed }
        });

        const response = await supertest(web).patch(buildUrl(`/trades/${trade.id}/closed`)).set('Authorization', 'Bearer ' + accessToken).send({
            exit_time: new Date(),
            exit_price,
            pnl: 100,
        });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
    });

    it('should be reject if exit time lower than entry time', async () => {
        const exit_price = trade.position === PositionType.Long ? trade.entry_price * 1.01 : trade.entry_price * 0.99;

        const exit_time = new Date(trade.entry_time.getTime() - 1000);

        const response = await supertest(web).patch(buildUrl(`/trades/${trade.id}/closed`)).set('Authorization', 'Bearer ' + accessToken).send({
            exit_time,
            exit_price,
            pnl: 100,
        });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
    });

    it('should be able to reject if trade id not found', async () => {
        const randomUUID = crypto.randomUUID();

        const response = await supertest(web).patch(buildUrl(`/trades/${randomUUID}/closed`)).set('Authorization', 'Bearer ' + accessToken).send({
            exit_time: new Date(),
            exit_price: 100,
            pnl: 100,
        });

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
    });

    it('should be reject with validation error', async () => {
        const response = await supertest(web).patch(buildUrl(`/trades/test/closed`)).set('Authorization', 'Bearer ' + accessToken).send({
            exit_time: new Date(),
            exit_price: 100,
            pnl:"salah",
        });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
    });

    it('should be reject with invalid accessToken', async () => {
        const exit_price = trade.position === PositionType.Long ? trade.entry_price * 1.01 : trade.entry_price * 0.99;

        const response = await supertest(web).patch(buildUrl(`/trades/${trade.id}/closed`)).set('Authorization', 'Bearer ' + 'salah').send({
            exit_time: new Date(),
            exit_price,
            pnl: 100,
        });

        logger.info(response.body);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
    });
});
