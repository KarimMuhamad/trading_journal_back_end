import {User} from "../../prisma/generated/client";
import {Request} from "express";

export interface AuthUserRequest extends Request {
    user?: User;
}

export interface JWTDecoded {
    id: number;
    iat: number;
    exp: number;
}