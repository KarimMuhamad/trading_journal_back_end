import 'dotenv/config';
import {buildUrl} from "./routes";
import supertest from "supertest";
import {web} from "../src/application/web";
import logger from "../src/application/logger";
import {AuthTestUtils} from "./test_utils";
import jwt from "jsonwebtoken";
import prisma from "../src/application/database";

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

describe('POST' + buildUrl('/auth/login'), () => {
    const userAgent = 'Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0';
    const ipAddress = '127.0.0.1';


   beforeEach(async () => {
      await AuthTestUtils.createUser('test', 'test@dev.com', 'test123456');
   });

   afterAll(async () => {
       await AuthTestUtils.deleteAll();
   });

    it('should be able to login user with username', async () => {
        const response = await supertest(web).post(buildUrl('/auth/login')).send({
            identifier: 'test',
            password: 'test123456'
        }).set('User-Agent', userAgent).set('X-Forwarded-For', ipAddress);

        logger.info(response.body);
        logger.info(response.headers['set-cookie']);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.username).toBe('test');
        expect(response.body.accessToken).toBeDefined();
        expect(response.headers['set-cookie']).toBeDefined();
        expect(response.headers['set-cookie'][0]).toBeDefined();

    });

    it('should be able to login user with email', async () => {
        const response = await supertest(web).post(buildUrl('/auth/login')).send({
            identifier: 'test@dev.com',
            password: 'test123456'
        }).set('User-Agent', userAgent).set('X-Forwarded-For', ipAddress);

        logger.info(response.headers['set-cookie']);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.data.username).toBe('test');
        expect(response.body.accessToken).toBeDefined();
        expect(response.headers['set-cookie']).toBeDefined();
        expect(response.headers['set-cookie'][0]).toBeDefined();

    });

    it('should be reject login user with validation error', async () => {
        const response = await supertest(web).post(buildUrl('/auth/login')).send({
            identifier: 'te',
            password: 'test12345'
        });

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Validation error');
        expect(response.body.errors).toBeDefined();
        expect(response.headers['set-cookie']).toBeUndefined();

    });

    it('should be reject login user if email/username is wrong', async () => {
        const response = await supertest(web).post(buildUrl('/auth/login')).send({
            identifier: 'test231',
            password: 'test12345'
        });

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
        expect(response.headers['set-cookie']).toBeUndefined();

    });

    it('should be reject login user if password is wrong', async () => {
        const response = await supertest(web).post(buildUrl('/auth/login')).send({
            identifier: 'test',
            password: 'testsalah'
        });

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
        expect(response.headers['set-cookie']).toBeUndefined();
    });

});

describe('DELETE ' + buildUrl('/auth/logout'), () => {
    let userId: number;
    let accessToken: string;
    let sessionJSON: any;

    beforeEach(async () => {
        await AuthTestUtils.createUser('test', 'test@dev.com', 'test123456');
        const session = await AuthTestUtils.createSession('test', 'test123456');

        userId = session.userId;
        accessToken = session.accessToken;
        sessionJSON = session.session;
    });

    afterAll(async () => {
        await AuthTestUtils.deleteAll();
    });

    it('should be able to logout user', async () => {
        const response = await supertest(web).delete(buildUrl('/auth/logout')).set('Authorization', 'Bearer ' + accessToken).set('Cookie', sessionJSON);

        const cookies = response.headers['set-cookie'];

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(cookies[0]).toContain("Expires=Thu, 01 Jan 1970");
    });

    it('should be reject logout if accessToken Invalid', async () => {
        const response = await supertest(web).delete(buildUrl('/auth/logout')).set('Authorization', 'Bearer ' + 'invalidAccessToken').set('Cookie', sessionJSON);

        logger.info(response.body);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });

    it('should be reject logout if accessToken Expired', async () => {
        const JWTExpiredAccessToken = jwt.sign({id: userId}, process.env.JWT_ACCESS_TOKEN_SECRET!, {expiresIn: '-1s'});


        const response = await supertest(web).delete(buildUrl('/auth/logout')).set('Authorization', 'Bearer ' + JWTExpiredAccessToken).set('Cookie', sessionJSON);


        logger.warn(response.body);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });
});

describe('POST ' + buildUrl('/auth/refresh'), () => {
    let userId: number;
    let sessionJSON: any;

    beforeEach(async ()=> {
        await AuthTestUtils.createUser('test', 'test@dev.com', 'test123456');
        const session = await AuthTestUtils.createSession('test', 'test123456');

        userId = session.userId;
        sessionJSON = session.session;
    });

    afterAll(async () => {
        await AuthTestUtils.deleteAll();
    });

    it('should be generate new Access Token', async () => {
        const response = await supertest(web).post(buildUrl('/auth/refresh')).set('Cookie', sessionJSON);
        console.log('Refresh Token session : ' + sessionJSON);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.accessToken).toBeDefined();
    });

    it('should be reject generate and clear cookies if session Invalid', async () => {
        const response = await supertest(web).post(buildUrl('/auth/refresh')).set('Cookie', 'invalidSession=invalidSession');

        const cookies = response.headers['set-cookie'];

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(cookies[0]).toContain("Expires=Thu, 01 Jan 1970");
    });

    it('should be reject generate if session was expired', async () => {
        await prisma.auth_session.updateMany({
            where: {user_id: userId},
            data: {expires_at: new Date(Date.now() - 1000)}
        });

        const response = await supertest(web).post(buildUrl('/auth/refresh')).set('Cookie', sessionJSON);

        const cookies = response.headers['set-cookie'];

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(cookies[0]).toContain("Expires=Thu, 01 Jan 1970");
    });

});

describe('POST' + buildUrl('/auth/email/send'), () => {
    let userId: number;
    let accessToken: string;
    let sessionJSON: any;
    const emailTesting = process.env.EMAIL_TESTING as string;

    beforeEach(async () => {
        await AuthTestUtils.createUser('test', emailTesting, 'test123456');
        const session = await AuthTestUtils.createSession('test', 'test123456');

        userId = session.userId;
        accessToken = session.accessToken;
        sessionJSON = session.session;
    });

    afterAll(async () => {
        await AuthTestUtils.deleteAll();
    });

    it('should be send a verification email', async () => {
        const response = await supertest(web).post(buildUrl('/auth/email/send')).set('Authorization', 'Bearer ' + accessToken);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
    });

    it('should be reject if accessToken Invalid or Expired', async () => {
        const response = await supertest(web).post(buildUrl('/auth/email/send')).set('Authorization', 'Bearer ' + 'invalidAccessToken');

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect(response.error).toBeDefined();
    });
});


describe('GET ' + buildUrl('/auth/email/verify'), () => {
    let userId: number;
    let accessToken: string;
    let sessionJSON: any;
    const emailTesting = process.env.EMAIL_TESTING as string;

    beforeEach(async () => {
        await AuthTestUtils.createUser('test', emailTesting, 'test123456');
        const session = await AuthTestUtils.createSession('test', 'test123456');

        userId = session.userId;
        accessToken = session.accessToken;
        sessionJSON = session.session;
    });

    afterAll(async () => {
        await AuthTestUtils.deleteAll();
    });

    it('should be verify token email', async () => {
        await supertest(web).post(buildUrl('/auth/email/send')).set('Authorization', 'Bearer ' + accessToken);

        const tokenVerification = await prisma.emailVerification.findFirst({where: {user_id: userId}});

        const response = await supertest(web).get(buildUrl('/auth/email/verify') + '?token=' + tokenVerification!.token);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
    });

    it('should be reject verify if token expired', async () => {
        await supertest(web).post(buildUrl('/auth/email/send')).set('Authorization', 'Bearer ' + accessToken);

        const tokenVerification = await prisma.emailVerification.findFirst({where: {user_id: userId}});

        await prisma.emailVerification.update({
            where: {id: tokenVerification!.id},
            data: {expires_at: new Date(Date.now() - 1000)}
        });

        const response = await supertest(web).get(buildUrl('/auth/email/verify') + '?token=' + tokenVerification!.token);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
    });

    it('should be reject verify if token invalid', async () => {
        const response = await supertest(web).get(buildUrl('/auth/email/verify') + '?token=' + 'wrongToken');

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
    });
});

describe('PATCH ' + buildUrl('/auth/change-password'), () => {
    let userId: number;
    let accessToken: string;
    let sessionJSON: any;
    const emailTesting = process.env.EMAIL_TESTING as string;

    beforeEach(async () => {
        await AuthTestUtils.createUser('test', emailTesting, 'currentPassword123');
        const session = await AuthTestUtils.createSession('test', 'currentPassword123');

        userId = session.userId;
        accessToken = session.accessToken;
        sessionJSON = session.session;
    });

    afterEach(async () => {
        await AuthTestUtils.deleteAll();
    });

    it('should be able to change password ', async () => {
        const response = await supertest(web).patch(buildUrl('/auth/change-password'))
            .set('Authorization', 'Bearer ' + accessToken).send({
                currentPassword: 'currentPassword123',
                newPassword: 'newPassword123'
            }).set('Cookie', sessionJSON);

        console.log('Change Passowrd session : ' + sessionJSON);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
    });

    it('should reject if currentPassword is Wrong', async () => {
        const response = await supertest(web).patch(buildUrl('/auth/change-password'))
            .set('Authorization', 'Bearer ' + accessToken).send({
                currentPassword: 'passwordWrong',
                newPassword: 'newPassword123'
            }).set('Cookie', sessionJSON);

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
    });

    it('should reject wit Validation Error ', async () => {
        const response = await supertest(web).patch(buildUrl('/auth/change-password'))
            .set('Authorization', 'Bearer ' + accessToken).send({
                currentPassword: '12as',
                newPassword: '123a'
            }).set('Cookie', sessionJSON);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
    });
});

describe('POST ' + buildUrl('/auth/forgot-password'), () => {
    const emailTesting = process.env.EMAIL_TESTING as string;

    beforeEach(async () => {
        await AuthTestUtils.createUser('test', emailTesting, 'test123456');
    });

    afterAll(async () => {
        await AuthTestUtils.deleteAll();
    });

    it('should be able to send reset password link', async () => {
        const response = await supertest(web).post(buildUrl('/auth/forgot-password')).send({email: emailTesting});

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
    });

    it('should be not sending reset password link if email invalid', async () => {
        const response = await supertest(web).post(buildUrl('/auth/forgot-password')).send({email: "salah@dev.com"});


        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
    });
});

describe('PATCH ' + buildUrl('/auth/reset-password'), () => {
    const emailTesting = process.env.EMAIL_TESTING as string;
    let record: any;

    beforeEach(async () => {
        await AuthTestUtils.deleteAll(); // clear user & password reset table
        await AuthTestUtils.createUser('test', emailTesting, 'oldPassword123');
        await supertest(web)
            .post(buildUrl('/auth/forgot-password'))
            .send({ email: emailTesting })
            .expect(200);

        record = await prisma.passwordReset.findFirst({});
    });

    afterAll(async () => {
        await AuthTestUtils.deleteAll();
    });

    it('should reset password successfully', async () => {
        const res = await supertest(web)
            .patch(buildUrl('/forgot-password/reset') + '?token=' + record!.token) // inject raw token
            .send({ newPassword: 'newPassword123' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
    });

    it('should reject invalid token', async () => {
        const res = await supertest(web)
            .patch(buildUrl('/forgot-password/reset') + '?token=' + record!.token + 'as') // inject raw token
            .send({ newPassword: 'newPassword123' });

        expect(res.status).toBe(401);
        expect(res.body.status).toBe('error');
    });

    it('should reject expired token', async () => {
        await prisma.passwordReset.updateMany({
            data: { expires_at: new Date(Date.now() - 1000) }
        });

        const res = await supertest(web)
            .patch(buildUrl('/forgot-password/reset') + '?token=' + record!.token)
            .send({ newPassword: 'newPassword123' });

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/expired/i);
    });

    it('should reject used token', async () => {
        await prisma.passwordReset.update({
            where: { id: record!.id },
            data: { used: true }
        });

        const res = await supertest(web)
            .patch(buildUrl('/forgot-password/reset') + '?token=' + record!.token)
            .send({ newPassword: 'newPassword123' });

        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/invalid/i);
    });
});