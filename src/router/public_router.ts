import express from 'express';
import { AuthController } from "../controller/auth_controller";

export const publicRouter = express.Router();
publicRouter.post('/auth/register', AuthController.register);
publicRouter.post('/auth/login', AuthController.login);
publicRouter.post('/auth/refresh', AuthController.refreshAccessToken);
publicRouter.get('/auth/email/verify', AuthController.verifyEmail);
publicRouter.post('/auth/forgot-password', AuthController.forgotPassword);
publicRouter.patch('/forgot-password/reset', AuthController.resetPassword);