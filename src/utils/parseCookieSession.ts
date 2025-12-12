import {ErrorResponse} from "../error/error_response";
import { ErrorCode } from "../error/error-code";

export const parseCookieSession = (sessionJSON: any) : {sid: string, rt: string} => {
    if (!sessionJSON) throw new ErrorResponse(401, "Unauthorized, no session provided", ErrorCode.AUTH_UNAUTHORIZED);

    try {
        return JSON.parse(sessionJSON);
    } catch (e) {
        throw new ErrorResponse(401, "Unauthorized, invalid session", ErrorCode.AUTH_UNAUTHORIZED);
    }
}