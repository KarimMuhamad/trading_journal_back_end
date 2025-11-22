import {z, ZodType} from "zod";

export class AuthValidation {
    static readonly REGISTER: ZodType = z.object({
        username: z.string().min(3).max(50),
        email: z.string().email().min(1).max(50),
        password: z.string().min(8).max(50),
    });

    static readonly LOGIN: ZodType = z.object({
        identifier: z.string().min(3),
        password: z.string().min(8).max(50)
    });

    static readonly CHANGEPASSWORD: ZodType = z.object({
        currentPassword: z.string().min(8).max(50),
        newPassword: z.string().min(8).max(50)
    });

    static readonly FORGOTPASSWORD: ZodType = z.object({
        email: z.string().email().min(1).max(50),
    })
}