import express from "express";
import {authMiddleware} from "../middleware/auth_middleware";
import {AuthController} from "../controller/auth_controller";
import {UserController} from "../controller/user_controller";
import { PlaybookController } from "../controller/playbook_controller";

export const apiRouter = express.Router();

// Middleware Using
apiRouter.use(authMiddleware);

// Auth Endpoints
apiRouter.delete('/auth/logout', AuthController.logout);
apiRouter.post('/auth/email/send', AuthController.sendEmailVerification);
apiRouter.patch('/auth/change-password', AuthController.changePassword);

// User Endpoints
apiRouter.get('/users/me', UserController.getUserProfile);
apiRouter.patch('/users/me', UserController.updateUsername);
apiRouter.delete('/users/me', UserController.deleteAccount);
apiRouter.post('/users/email/request-otp', UserController.sendOTPEmail);
apiRouter.patch('/users/email/verify-otp', UserController.verifyOTP);

// Playbook Endpoints
apiRouter.post('/playbooks', PlaybookController.createPlaybook);
apiRouter.patch('/playbooks/:playbookId', PlaybookController.updatePlaybook);
apiRouter.get('/playbooks/:playbookId', PlaybookController.getPlayBookById);