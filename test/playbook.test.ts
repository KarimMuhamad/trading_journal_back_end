import 'dotenv/config';
import {buildUrl} from "./utils/routes";
import { TestDBUtils } from "./utils/prisma_helpers";
import supertest from "supertest";
import {web} from "../src/application/web";
import logger from "../src/application/logger";
import prisma from "../src/application/database";
import {generateRandomOTP} from "../src/utils/generateRandomOTP";
import {ApiTestHelper} from "./utils/api_helper";
import {expect} from "@jest/globals";
import {TradeResult} from "../prisma/generated/enums";

describe('POST ' + buildUrl('/playbooks'), () => {
    let accessToken: string;

    beforeEach(async () => {
        const user = await TestDBUtils.createUser('test', 'test@dev.com', 'test123456');
        const session = await ApiTestHelper.createSession('test', 'test123456');
        accessToken = session.accessToken;
    });

    afterEach(async () => {
        await TestDBUtils.cleanDB();
    });

    it('should be able to create playbook', async () => {
        const response = await supertest(web).post(buildUrl('/playbooks')).set('Authorization', 'Bearer ' + accessToken).send({
            name: 'test playbook',
            description: 'test description'
        });

        logger.info(response.body);
        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.data.name).toBe('test playbook');
        expect(response.body.data.description).toBe('test description');
    });

    it('should be reject validation eror', async () => {
        const response = await supertest(web).post(buildUrl('/playbooks')).set('Authorization', 'Bearer ' + accessToken).send({
            name: '',
            description: 'test description'
        });

        logger.info(response.body);
        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.errors).toBeDefined();
    });

    it('should be reject if name is too long', async () => {
        const response = await supertest(web).post(buildUrl('/playbooks')).set('Authorization', 'Bearer ' + accessToken).send({
            name: 'test playbook'.repeat(100),
            description: 'test description'
        });

        logger.info(response.body);
        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.errors).toBeDefined();
    });

    it('should be reject if accessToken Invalid', async () => {
        const response = await supertest(web).post(buildUrl('/playbooks')).set('Authorization', 'Bearer ' + 'invalidAccessToken').send({
            name: 'test playbook',
            description: 'test description'
        });

        logger.info(response.body);
        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });
});

describe('PATCH' + buildUrl('/playbooks'), () => {
    let accessToken: string;
    let playbook: any;

    beforeEach(async () => {
        const user = await TestDBUtils.createUser('test', 'test@dev.com', 'test123456');
        const session = await ApiTestHelper.createSession('test', 'test123456');
        playbook = await TestDBUtils.createPlaybook(user.id);

        accessToken = session.accessToken;
    });

    afterEach(async () => {
        await TestDBUtils.cleanDB();
    });

    it('should be able to update playbook', async () => {
        const response = await supertest(web).patch(buildUrl(`/playbooks/${playbook.id}`)).set('Authorization', 'Bearer ' + accessToken).send({
            name: 'test update playbook',
            description: 'test update description'
        });

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.name).toBe('test update playbook');
    });

    it('should be reject with validation error', async () => {
        const response = await supertest(web).patch(buildUrl(`/playbooks/${playbook.id}`)).set('Authorization', 'Bearer ' + accessToken).send({
            name: '',
        });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.errors).toBeDefined();
    });

    it('should be reject if playbook not found', async () => {
        const randomUUID = crypto.randomUUID();
        const response = await supertest(web).patch(buildUrl(`/playbooks/${randomUUID}`)).set('Authorization', 'Bearer ' + accessToken).send({
            name: 'test update playbook',
            description: 'test update description'
        });

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    })

    it('should be reject if access token invalid', async () => {
        const response = await supertest(web).patch(buildUrl(`/playbooks/${playbook.id}`)).set('Authorization', 'Bearer ' + 'salah').send({
            name: 'test update playbook',
            description: 'test update description'
        });

        logger.info(response.body);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });
});

describe('GET ' + buildUrl('/playbooks'), () => {
    let accessToken: string;
    let playbook: any;

    beforeEach(async () => {
        const user = await TestDBUtils.createUser('test', 'test@dev.com', 'test123456');
        const session = await ApiTestHelper.createSession('test', 'test123456');
        playbook = await TestDBUtils.createPlaybook(user.id);

        accessToken = session.accessToken;
    });

    afterEach(async () => {
        await TestDBUtils.cleanDB();
    });

    it('should be able to get playbooks by id', async () => {
        const response = await supertest(web).get(buildUrl(`/playbooks/${playbook.id}`)).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.name).toBe(playbook.name);
    });

    it('should be reject if playbooks not found', async () => {
        const cryptoUUID = crypto.randomUUID();
        const response = await supertest(web).get(buildUrl(`/playbooks/${cryptoUUID}`)).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });

    it('should be reject with validation UUID error', async () => {
        const response = await supertest(web).get(buildUrl(`/playbooks/test`)).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.errors).toBeDefined();
    });

    it('should be reject if access token invalid', async () => {
        const response = await supertest(web).get(buildUrl(`/playbooks/${playbook.id}`)).set('Authorization', 'Bearer ' + 'invalidAccessToken');

        logger.info(response.body);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });
});

describe('GET ' + buildUrl('/playbooks'), () => {
    let accessToken: string;
    let account: any;
    let playbooks: any;

    beforeEach(async () => {
        const user = await TestDBUtils.createUser('test', 'test@dev.com', 'test123456');
        const session = await ApiTestHelper.createSession('test', 'test123456');
        account = await TestDBUtils.createAccount(user.id);

        playbooks = [];

        for (let i = 0; i <= 12; i++) {
            const pb = await TestDBUtils.createPlaybook(user.id, `playbook ${i + 1}`, `description ${i + 1}`);
            playbooks.push(pb);
        }

        accessToken = session.accessToken;
    });

    afterEach(async () => {
        await TestDBUtils.cleanDB();
    });

    it('should be able to get all playbook basic view', async () => {
        const response = await supertest(web).get(buildUrl('/playbooks')).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should be able to get all playbook explicit basic view', async () => {
        const response = await supertest(web).get(buildUrl('/playbooks?view=basic')).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should be ignore random params in basic view', async () => {
        const response = await supertest(web).get(buildUrl('/playbooks?page=1&size=1')).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should be able to get all playbook with detailed view and pagination', async () => {
        const response = await supertest(web).get(buildUrl('/playbooks?view=detailed')).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should be able to get all playbook with detailed view and pagination page 2', async () => {
        const response = await supertest(web).get(buildUrl('/playbooks?view=detailed&page=2')).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should be able to search playbooks', async () => {
        const response = await supertest(web).get(buildUrl('/playbooks?view=detailed&search=playbook 4')).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(1);
    });

    it('should return correct statistics for detailed view', async () => {
        const trade = await Promise.all([
            TestDBUtils.createTrade(account.id, 100, TradeResult.Win),
            TestDBUtils.createTrade(account.id, 50, TradeResult.Win),
            TestDBUtils.createTrade(account.id, -30, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, 30, TradeResult.Win),
            TestDBUtils.createTrade(account.id, -50, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, 76, TradeResult.Win),
            TestDBUtils.createTrade(account.id, 43, TradeResult.Win),
            TestDBUtils.createTrade(account.id, -10, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
            TestDBUtils.createTrade(account.id, -11, TradeResult.Lose),
        ]);

        for (const t of trade) {
            await TestDBUtils.attachTradeToPlaybook(
                playbooks[12].id,
                t.id
            );
        }

        // playbook 2 → 1 loss
        const tradePb2 = await TestDBUtils.createTrade(
            account.id,
            -40,
            TradeResult.Lose
        );

        await TestDBUtils.attachTradeToPlaybook(
            playbooks[11].id,
            tradePb2.id
        );

        // call API
        const res = await supertest(web)
            .get(buildUrl('/playbooks?view=detailed'))
            .set('Authorization', `Bearer ${accessToken}`);

        logger.info(res.body);
        expect(res.status).toBe(200);

    });


    it('should be reject if token invalid', async () => {
        const response = await supertest(web).get(buildUrl('/playbooks?view=detailed&search=playbook 4')).set('Authorization', 'Bearer ' + 'wrongToken');

        logger.info(response.body);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });
});

describe('DELETE ' + buildUrl('/playbooks'), () => {
    let accessToken: string;
    let playbook: any;

    beforeEach(async () => {
        const user = await TestDBUtils.createUser('test', 'test@dev.com', 'test123456');
        const session = await ApiTestHelper.createSession('test', 'test123456');
        playbook = await TestDBUtils.createPlaybook(user.id);

        accessToken = session.accessToken;
    });

    afterEach(async () => {
        await TestDBUtils.cleanDB();
    });

    it('should be able to delete playbooks', async () => {
        const response = await supertest(web).delete(buildUrl(`/playbooks/${playbook.id}`)).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.name).toBe(playbook.name);
    });

    it('should be reject if playbooks not found', async () => {
        const cryptoUUID = crypto.randomUUID();
        const response = await supertest(web).delete(buildUrl(`/playbooks/${cryptoUUID}`)).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });

    it('should be reject with validation UUID error', async () => {
        const response = await supertest(web).delete(buildUrl(`/playbooks/test`)).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.errors).toBeDefined();
    });

    it('should be reject if access token invalid', async () => {
        const response = await supertest(web).get(buildUrl(`/playbooks/${playbook.id}`)).set('Authorization', 'Bearer ' + 'invalidAccessToken');

        logger.info(response.body);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });
});