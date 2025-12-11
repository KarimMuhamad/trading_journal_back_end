import {Request, Response, NextFunction} from "express";
import {ZodError} from "zod";
import {ErrorResponse} from "../error/error_response";
import {JsonWebTokenError} from "jsonwebtoken";
import { ErrorCode } from "../error/error-code";

export const errorMiddleware = async (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }

    // Zod Schema Validation Error
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: "error",
            message: "Validation error",
            errors: err.issues.map((e: any) => ({
                field: e.path.join("."),
                message: e.message
            })),
        });
    
    // JsonWebTokenError
    } else if (err instanceof JsonWebTokenError) {
        return res.status(401).json({
            status: "error",
            message: "Unauthorized, invalid or expired token",
            code: ErrorCode.AUTH_UNAUTHORIZED
        });

    // ErrorResponse
    } else if (err instanceof ErrorResponse) {
        return res.status(err.statusCode).json({
            status: "error",
            message: err.message,
            code: err.code
        });

    // Default Error
    } else {
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            code: ErrorCode.INTERNAL_SERVER_ERROR
        });
    }
}