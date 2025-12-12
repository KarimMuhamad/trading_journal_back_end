import 'dotenv/config';
import {buildUrl} from "./routes";
import {AuthTestUtils} from "./test_utils";
import supertest from "supertest";
import {web} from "../src/application/web";
import logger from "../src/application/logger";
import prisma from "../src/application/database";
import {generateRandomOTP} from "../src/utils/generateRandomOTP";

describe('POST ' + buildUrl('/playbooks'), () => {
    let accessToken: string;

    beforeEach(async () => {
        await AuthTestUtils.createUser('test', 'test@dev.com', 'test123456');
        const session = await AuthTestUtils.createSession('test', 'test123456');
        accessToken = session.accessToken;
    });

    afterAll(async () => {
        await AuthTestUtils.deleteAll();
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