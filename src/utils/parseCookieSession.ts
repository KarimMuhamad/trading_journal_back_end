import {ErrorResponse} from "../error/error_response";

export const parseCookieSession = (sessionJSON: any) : {sid: string, rt: string} => {
    if (!sessionJSON) throw new ErrorResponse(401, "Unauthorized, no session provided");

    try {
        return JSON.parse(sessionJSON);
    } catch (e) {
        throw new ErrorResponse(401, "Unauthorized, invalid session");
    }
}