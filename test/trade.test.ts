import 'dotenv/config';
import { buildUrl } from "./utils/routes";
import { TestDBUtils } from "./utils/prisma_helpers";
import { ApiTestHelper } from "./utils/api_helper";
import supertest from "supertest";
import { web } from "../src/application/web";
import logger from "../src/application/logger";
import { PositionType } from '../prisma/generated/enums';

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
            entry_price: 99.234,
            position_size: 0.00213,
            sl_price: 99.065,
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
