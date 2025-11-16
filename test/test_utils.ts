import prisma from "../src/application/database";

export class AuthTestUtils {
    static async deleteAll () {
        await prisma.user.deleteMany({});
    }
}