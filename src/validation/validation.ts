import * as z from "zod";

export class Validation {
    static validate<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
        return schema.parse(data);
    }
}
