import prisma from "../src/application/database";
import supertest from "supertest";
import {web} from "../src/application/web";
import {buildUrl} from "./routes";

export class AuthTestUtils {

    static async deleteAll () {
        await prisma.user.deleteMany({});
    }

    static async createUser (username: string, email: string, password: string) {
        await supertest(web).post(buildUrl('/auth/register')).send({username, email, password});
    }
}