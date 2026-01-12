import express from "express";
import {authMiddleware} from "../middleware/auth_middleware";
import {AuthController} from "../controller/auth_controller";
import {UserController} from "../controller/user_controller";
import { PlaybookController } from "../controller/playbook_controller";
import {AccountController} from "../controller/account_controller";
import { TradeController } from "../controller/trade_controller";

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
apiRouter.get('/playbooks', PlaybookController.getAllPlaybooks);
apiRouter.delete('/playbooks/:playbookId', PlaybookController.delete);

// Account Endpoints
apiRouter.post('/accounts', AccountController.createAccount);
apiRouter.get('/accounts/archived', AccountController.getAllArchivedAccount);
apiRouter.get('/accounts/:accountId', AccountController.getAccountById);
apiRouter.patch('/accounts/:accountId', AccountController.updateAccount);
apiRouter.delete('/accounts/:accountId', AccountController.deleteAccount);
apiRouter.get('/accounts', AccountController.getAllAccount);
apiRouter.patch('/accounts/:accountId/archive', AccountController.archiveAccount);
apiRouter.patch('/accounts/:accountId/unarchive', AccountController.unarchiveAccount);

// Trade Endpoints
apiRouter.post('/accounts/:accountId/trades', TradeController.executeTrade);
apiRouter.get('/trades/:tradeId', TradeController.getTradeById);
apiRouter.patch('/trades/:tradeId', TradeController.updateTradeById);
apiRouter.patch('/trades/:tradeId/closed', TradeController.closeTrade);
