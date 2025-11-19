import express from "express";
import {publicRouter} from "../router/public_router";
import {errorMiddleware} from "../middleware/error_middleware";
import {apiRouter} from "../router/api";
import cookieParser from "cookie-parser";

export const web = express();

const BASE_PATH = process.env.BASE_PATH as string;

web.use(express.json());
web.use(cookieParser());

const baseUrl = express.Router();
baseUrl.use(publicRouter);
baseUrl.use(apiRouter);
web.use(BASE_PATH, baseUrl);

web.use(errorMiddleware);