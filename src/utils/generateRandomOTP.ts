import crypto from "crypto";

export const generateRandomOTP = (length = 6) => {
    const max = Math.pow(10, length);
    const min = max / 10;

    return crypto.randomInt(min, max).toString();
}