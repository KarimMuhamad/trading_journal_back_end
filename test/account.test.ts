import 'dotenv/config';
import {buildUrl} from "./utils/routes";
import {TestDBUtils} from "./utils/prisma_helpers";
import {ApiTestHelper} from "./utils/api_helper";
import supertest from "supertest";
import {web} from "../src/application/web";
import logger from "../src/application/logger";
import {expect} from "@jest/globals";

describe('POST ' + buildUrl('/accounts'), () => {
    let accessToken: string;

    beforeEach(async () => {
        const user = await TestDBUtils.createUser('test', 'test@dev.com', 'test123456');
        const session = await ApiTestHelper.createSession('test', 'test123456');
        accessToken = session.accessToken;
    });

    afterEach(async () => {
        await TestDBUtils.cleanDB();
    });

    it('should be able to create an account', async () => {
        const response = await supertest(web).post(buildUrl('/accounts')).set('Authorization', 'Bearer ' + accessToken).send({
            nickname: 'test account',
            exchange: 'binance',
            balance: 1000,
            risk_per_trade: 0.1,
            max_risk_daily: 0.3
        });

        logger.info(response.body);

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data.nickname).toBe('test account');
        expect(response.body.data.exchange).toBe('binance');
    });

    it('should be reject wit validation error', async () => {
        const response = await supertest(web).post(buildUrl('/accounts')).set('Authorization', 'Bearer ' + accessToken).send({
            nickname: 'test account',
            exchange: 'binance',
            balance: -1000.12,
            risk_per_trade: 3.1,
            max_risk_daily: 1.3
        });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.errors).toBeDefined();
    });

    it('should be reject with unauthorized', async () => {
        const response = await supertest(web).post(buildUrl('/accounts')).set('Authorization', 'Bearer ' + 'wrongToken').send({
            nickname: 'test account',
            exchange: 'binance',
            balance: 1000,
            risk_per_trade: 0.1,
            max_risk_daily: 0.3
        });

        logger.info(response.body);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });

});