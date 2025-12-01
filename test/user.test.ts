import 'dotenv/config';
import {buildUrl} from "./routes";
import {AuthTestUtils} from "./test_utils";
import supertest from "supertest";
import {web} from "../src/application/web";
import logger from "../src/application/logger";
import prisma from "../src/application/database";



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