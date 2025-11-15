import express from "express";
import {publicRouter} from "../router/public_router";

export const web = express();

const BASE_PATH = process.env.BASE_PATH || "/";

web.use(express.json());

const baseUrl = express.Router();
baseUrl.use(publicRouter);
web.use(BASE_PATH, baseUrl);