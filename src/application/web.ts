import express from "express";
import {publicRouter} from "../router/public_router";
import {errorMiddleware} from "../middleware/error_middleware";

export const web = express();

const BASE_PATH = process.env.BASE_PATH as string;

web.use(express.json());

const baseUrl = express.Router();
baseUrl.use(publicRouter);
web.use(BASE_PATH, baseUrl);

web.use(errorMiddleware);