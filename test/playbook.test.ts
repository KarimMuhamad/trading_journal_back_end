import 'dotenv/config';
import {buildUrl} from "./routes";
import {TestDBUtils} from "./test_utils";
import supertest from "supertest";
import {web} from "../src/application/web";
import logger from "../src/application/logger";
import prisma from "../src/application/database";
import {generateRandomOTP} from "../src/utils/generateRandomOTP";

describe('POST ' + buildUrl('/playbooks'), () => {
    let accessToken: string;

    beforeEach(async () => {
        await TestDBUtils.createUser('test', 'test@dev.com', 'test123456');
        const session = await TestDBUtils.createSession('test', 'test123456');
        accessToken = session.accessToken;
    });

    afterAll(async () => {
        await TestDBUtils.cleandDB();
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
    let playbook;

    beforeEach(async () => {
        await TestDBUtils.createUser('test', 'test@dev.com', 'test123456');
        const session = await TestDBUtils.createSession('test', 'test123456');

        accessToken = session.accessToken;

        playbook = await supertest(web).post(buildUrl('/playbooks')).set('Authorization', 'Bearer ' + accessToken).send({
            name: 'test playbook',
            description: 'test description'
        });
    });

    afterAll(async () => {
        await TestDBUtils.cleandDB();
    });

    it('should be able to update playbook', async () => {
        const playbook_id = playbook.body.data.id;
        console.log(playbook_id);
        const response = await supertest(web).patch(buildUrl(`/playbooks/${playbook_id}`)).set('Authorization', 'Bearer ' + accessToken).send({
            name: 'test update playbook',
            description: 'test update description'
        });

        logger.info(response.body);
    });
});