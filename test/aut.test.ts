import 'dotenv/config';
import {buildUrl} from "./routes";
import supertest from "supertest";
import {web} from "../src/application/web";
import logger from "../src/application/logger";
import {AuthTestUtils} from "./test_utils";

describe('POST ' + buildUrl('') , () => {
    afterAll(async () => {
       await AuthTestUtils.deleteAll();
    });

    it('should be able to register user', async () => {
        const response = await supertest(web).post(buildUrl('/auth/register')).send({
            username: 'test',
            email: 'test@dev.com',
            password: 'test123456'
        });

        logger.info(response.body);
        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
    });

    it('should be reject register user with validation eror', async () => {
        const response = await supertest(web).post(buildUrl('/auth/register')).send({
            username: 'test',
            email: 'testdev.com',
            password: 'test123456'
        });

        logger.info(response.body);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.errors).toBeDefined();
    });
});