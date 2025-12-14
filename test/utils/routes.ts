const BASE_PATH = process.env.BASE_PATH || '/';

export const buildUrl = (path: string) : string => {
    return `${BASE_PATH}${path}`;
};