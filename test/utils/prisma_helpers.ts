import prisma from "../../src/application/database";
import argon2 from "argon2";

export class TestDBUtils {
    static async cleanDB() {
        await prisma.user.deleteMany();
    }

    static async createUser(username: string = "testUser", email: string = "test@dev.com", password: string = "test123456") {
        const hashedPw = await argon2.hash(password);
        return prisma.user.create({data: {username, email, password: hashedPw}});
    }

    static async createPlaybook(userId: string,name: string = "test playbook", description: string = "description test playbook") {
        return prisma.playbooks.create({data: {user_id: userId, name, description}});
    }
}