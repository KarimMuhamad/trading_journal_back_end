import 'dotenv/config';
import {buildUrl} from "./utils/routes";
import {TestDBUtils} from "./utils/prisma_helpers";
import {ApiTestHelper} from "./utils/api_helper";
import supertest from "supertest";
import {web} from "../src/application/web";
import logger from "../src/application/logger";
import {expect} from "@jest/globals";
import prisma from "../src/application/database";

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

describe('PRISMA EXTENSION is_archived filtering on accounts table', () => {
    let user: any;
    beforeEach(async () => {
        user = await TestDBUtils.createUser();
        await TestDBUtils.createAccount(user.id, 'test1', 'binance', 1000, 0.1, 0.3);
        await TestDBUtils.createAccount(user.id, 'test2', 'binance', 1000, 0.1, 0.3);
        await TestDBUtils.createAccount(user.id, 'test3', 'binance', 1000, 0.1, 0.3);
        await TestDBUtils.createAccount(user.id, 'test4', 'binance', 1000, 0.1, 0.3);
        await TestDBUtils.createAccount(user.id, 'test5', 'binance', 1000, 0.1, 0.3);
    });

    afterEach(async () => {
        await TestDBUtils.cleanDB();
    });

    it('should filtering out is_archived records on findMany', async () => {
        await prisma.accounts.updateMany({
            where: { nickname: 'test2' },
            data: { is_archived: true }
        });

        const account = await prisma.accounts.findMany();

        console.log(account);

        account.forEach(acc => {
            expect(acc.nickname).not.toBe('test2');
        });
    });

    it('should filtering out is_archived records on findFirst', async () => {
        await prisma.accounts.updateMany({
            where: { nickname: 'test3' },
            data: { is_archived: true }
        });

        const account = await prisma.user.findFirst({
            where: { username: 'test3' }
        });

        console.log(account);

        expect(account).toBeNull();
    });

    it('should filtering out is_archived on findUnique', async () => {
        await prisma.accounts.updateMany({
            where: { nickname: 'test4' },
            data: { is_archived: true }
        });

        const account = await prisma.accounts.findFirst({
            where: { nickname: 'test4' }
        });

        console.log(account);

        expect(account).toBeNull();
    });

    it('should be able to include is_archived records on findUnique when includeDeleted is true', async () => {
        await prisma.accounts.updateMany({
            where: { nickname: 'test4' },
            data: { is_archived: true }
        });

        const account = await prisma.accounts.findFirst({
            where: { nickname: 'test4', includeArchived: true } as any
        });

        console.log(account);

        expect(account).not.toBeNull();
        expect(account!.nickname).toBe('test4');
    });
});

describe('GET' + buildUrl('/accounts'), () => {
    let accessToken: string;
    let user: any;
    let account: any;

    beforeEach(async () => {
        user = await TestDBUtils.createUser('test', 'test@dev.com', 'test123456');
        account = await TestDBUtils.createAccount(user.id);
        const session = await ApiTestHelper.createSession('test', 'test123456');
        accessToken = session.accessToken;
    });

    afterEach(async () => {
        await TestDBUtils.cleanDB();
    });

    it('should be able to get acc by id', async () => {
        const response = await supertest(web).get(buildUrl(`/accounts/${account.id}`)).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.nickname).toBe(account.nickname);
    });

    it('should be reject not found error', async () => {
        const response = await supertest(web).get(buildUrl(`/accounts/${crypto.randomUUID()}`)).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });

    it('should be reject with validation error', async () => {
        const response = await supertest(web).get(buildUrl(`/accounts/wrongID`)).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });

    it('should be reject with unauthorized', async () => {
        const response = await supertest(web).get(buildUrl(`/accounts/${account.id}`)).set('Authorization', 'Bearer ' + 'wrongToken');

        logger.info(response.body);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });
})