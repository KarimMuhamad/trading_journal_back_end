import {z, ZodType} from "zod";

export class UuidValidator {
    static readonly UUIDVALIDATOR: ZodType = z.string().regex(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
        "Invalid ID Format"
    );
}