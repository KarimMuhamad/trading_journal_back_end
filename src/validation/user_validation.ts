import {z, ZodType} from "zod";

export class UserValidation {
    static readonly UPDATEUSERNAME: ZodType = z.object({
        username: z.string().min(3).max(50),
    });

    static readonly UPDATEUSEREMAIL: ZodType = z.object({
        email: z.email().min(1).max(50),
    });
}