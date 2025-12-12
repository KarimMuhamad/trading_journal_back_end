import { ErrorCode } from "./error-code";

export class ErrorResponse extends Error {
    constructor(public statusCode: number, public message: string, public code?: ErrorCode) {
        super(message);
    }
}