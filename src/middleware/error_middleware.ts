import {Request, Response, NextFunction} from "express";
import {ZodError} from "zod";
import {ErrorResponse} from "../error/error_response";

export const errorMiddleware = async (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            status: "error",
            message: "Validation error",
            errors: err.message
        });
    } else if (err instanceof ErrorResponse) {
        return res.status(err.statusCode).json({
            status: "error",
            message: err.message
        });
    } else {
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        });
    }
}