import {AuthUserRequest, JWTDecoded} from "../types/auth_type";
import {Response, NextFunction} from "express";
import {ErrorResponse} from "../error/error_response";
import jwt from "jsonwebtoken";
import prisma from "../application/database";
import { ErrorCode } from "../error/error-code";

export const authMiddleware = async (req: AuthUserRequest, res: Response, next: NextFunction)=> {
    const token = req.headers.authorization?.split(' ')[1] as string;

    if (!token) throw new ErrorResponse(401, "Unauthorized, no token provided", ErrorCode.AUTH_UNAUTHORIZED);

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!) as JWTDecoded;
    const user = await prisma.user.findUnique({where: {id: decoded.id}});

    if (!user) throw new ErrorResponse(401, "Unauthorized, invalid token", ErrorCode.AUTH_UNAUTHORIZED);

    req.user = user;

    next();
}