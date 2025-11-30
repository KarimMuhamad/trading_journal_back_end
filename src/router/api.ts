import express from "express";
import {authMiddleware} from "../middleware/auth_middleware";
import {AuthController} from "../controller/auth_controller";

export const apiRouter = express.Router();

// Middleware Using
apiRouter.use(authMiddleware);

// Auth Endpoints
apiRouter.delete('/auth/logout', AuthController.logout);
apiRouter.post('/auth/email/send', AuthController.sendEmailVerification);
apiRouter.patch('/auth/change-password', AuthController.changePassword);

// User Endpoints