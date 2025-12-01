import {z, ZodType} from "zod";

export class UserValidation {
    static readonly UPDATEUSERNAME: ZodType = z.object({
        username: z.string().min(3).max(50),
    });
}