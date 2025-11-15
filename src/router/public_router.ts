import express from 'express';
import {AuthController} from "../controller/auth_controller";

export const publicRouter = express.Router();
publicRouter.post('/auth/register', AuthController.register);