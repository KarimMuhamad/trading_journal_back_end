import supertest from "supertest";
import {web} from "../../src/application/web";
import {buildUrl} from "../routes";

export class ApiTestHelper {
    static async createSession (ident: string = "testUser", password: string = "test123456") {
        const response = await supertest(web).post(buildUrl('/auth/login')).send({identifier: ident, password}).set({
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0',
            'X-Forwarded-For': '127.0.0.1'
        });

        if (response.status !== 200) throw new Error("Failed to create session");

        return {
            userId: response.body.data.id,
            accessToken: response.body.accessToken,
            session: response.headers['set-cookie'][0].split(';')[0]
        }
    }
}