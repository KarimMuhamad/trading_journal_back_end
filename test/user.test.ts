import 'dotenv/config';
import {buildUrl} from "./routes";
import {AuthTestUtils} from "./test_utils";
import supertest from "supertest";
import {web} from "../src/application/web";
import logger from "../src/application/logger";
import prisma from "../src/application/database";
import {generateRandomOTP} from "../src/utils/generateRandomOTP";



describe('GET ' + buildUrl('/users/me'), () => {
    let accessToken: string;

   beforeEach(async () => {
        await AuthTestUtils.createUser('test', 'test@dev.com', 'test123456');
        const session = await AuthTestUtils.createSession('test', 'test123456');
        accessToken = session.accessToken;
   });

   afterAll(async () => {
      await AuthTestUtils.deleteAll();
   });

    it('should be able to get user profile', async () => {
        const response = await supertest(web).get(buildUrl('/users/me')).set('Authorization', 'Bearer ' + accessToken);

        logger.info(response.body);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.username).toBe('test');
    });

    it('should be reject if accessToken Invalid', async () => {
        const response = await supertest(web).get(buildUrl('/users/me')).set('Authorization', 'Bearer ' + 'invalidAccessToken');

        logger.info(response.body);
        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });
});

describe('PATCH ' + buildUrl('/users/me'), () => {
    let accessToken: string;

    beforeEach(async () => {
        await AuthTestUtils.createUser('test', 'test@dev.com', 'test123456');
        const session = await AuthTestUtils.createSession('test', 'test123456');
        accessToken = session.accessToken;
    });

    afterEach(async () => {
        await AuthTestUtils.deleteAll();
    });

    it('should be able to update user profile', async () => {
        const response = await supertest(web).patch(buildUrl('/users/me')).set('Authorization', 'Bearer ' + accessToken).send({
            username: 'testing1'
        });

        logger.info(response.body);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.username).toBe('testing1');
    });

    it('should be reject with validation error', async () => {
        const response = await supertest(web).patch(buildUrl('/users/me')).set('Authorization', 'Bearer ' + accessToken).send({
            username: 'te'
        });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.errors).toBeDefined();
    });

    it('should be reject if username exist', async () => {
        await AuthTestUtils.createUser('testExist', 'exist@dev.com', 'test123456');
        const response = await supertest(web).patch(buildUrl('/users/me')).set('Authorization', 'Bearer ' + accessToken).send({
            username: 'testExist'
        });

        logger.info(response.body);

        expect(response.status).toBe(409);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });

    it('should be reject if username are same with old', async () => {
        const response = await supertest(web).patch(buildUrl('/users/me')).set('Authorization', 'Bearer ' + accessToken).send({
            username: 'test'
        });

        logger.info(response.body);

        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });

    it('should be reject if accessToken Invalid', async () => {
        const response = await supertest(web).patch(buildUrl('/users/me')).set('Authorization', 'Bearer ' + 'invalidAccessToken');

        logger.info(response.body);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });
});

describe('DELETE ' + buildUrl('/users/me'), () => {
    let accessToken: string;

    beforeEach(async () => {
       await AuthTestUtils.createUser('test', process.env.EMAIL_TESTING as string, 'test123456');
       const session = await AuthTestUtils.createSession('test', 'test123456');
       accessToken = session.accessToken;
    });

    afterEach(async () => {
        await AuthTestUtils.deleteAll();
    });

    it('should be able to soft delete account', async () => {
        const response = await supertest(web).delete(buildUrl('/users/me')).set('Authorization', 'Bearer ' + accessToken).send({
            password: 'test123456'
        });

        logger.info(response.body);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
    });

    it('should be reject if password invalid', async () => {
        const response = await supertest(web).delete(buildUrl('/users/me')).set('Authorization', 'Bearer ' + accessToken).send({
            password: 'salah'
        });

        logger.info(response.body);
        expect(response.status).toBe(403);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });

    it('should be reject if invalid token', async () => {
        const response = await supertest(web).delete(buildUrl('/users/me')).set('Authorization', 'Bearer ' + 'invalidAccessToken').send({
           password: 'test123456'
        });

        logger.info(response.body);
        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });
})