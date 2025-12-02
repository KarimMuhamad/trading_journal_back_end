import { Resend } from "resend";
import Handlebars from "handlebars";
import path from "path";
import fs from "fs/promises";
import 'dotenv/config';
import logger from "../../application/logger";
import {
    EmailOptions,
    ResetPasswordData,
    EmailVerificationData,
    PasswordChangedData, DeleteAccountData
} from '../types/email_types';


class EmailServices {
    private resend: Resend;
    private templateDir: string;
    private compiledTemplates: Map<string, HandlebarsTemplateDelegate>;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.templateDir = path.join(__dirname, "..", "templates");
        this.compiledTemplates = new Map();
    }

    private async loadTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
        if (this.compiledTemplates.has(templateName)) {
            return this.compiledTemplates.get(templateName)!;
        }

        const templatePath = path.join(this.templateDir, `${templateName}.html`);
        const templateSource = await fs.readFile(templatePath, "utf-8");

        const compiledTemplate = Handlebars.compile(templateSource);
        this.compiledTemplates.set(templateName, compiledTemplate);
        return compiledTemplate;
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            const template = await this.loadTemplate(options.template);
            const html = template(options.context);


            const {data, error} = await this.resend.emails.send({
                from: `${process.env.EMAIL_FROM} <${process.env.EMAIL_FROM_ADDRESS}>`,
                to: Array.isArray(options.to) ? options.to : [options.to],
                subject: options.subject,
                html: html,
            });

            if (error) {
                logger.error("Error sending email:", error);
                return false;
            }

            logger.info("Email sent successfully:", data?.id);
            return true;
        } catch (err) {
            logger.error("Unexpected error sending email:", err);
            return false;
        }
    }

    async sendResetPasswordEmail(data: ResetPasswordData): Promise<boolean> {
        const resetLink = `${process.env.FRONTEND_URL}/forgot-password/reset?token=${data.resetToken}`;

        return this.sendEmail({
            to: data.email,
            subject: "Reset Your Password",
            template: "reset_password",
            context: {
                userName: data.username,
                resetLink,
                expiryTime: data.expiryTIme,
                resetUrl: resetLink,
                year: new Date().getFullYear(),
            },
        });
    }

    async sendEmailVerificationEmail(data: EmailVerificationData): Promise<boolean> {
        const verificationLink = `${process.env.FRONTEND_URL}/auth/email/verify?token=${data.verificationToken}`;

        return this.sendEmail({
            to: data.email,
            subject: "Verify Your Email Address",
            template: "email_verification",
            context: {
                userName: data.username,
                verificationLink,
                expiryTime: data.expiryTime,
                verificationUrl: verificationLink,
                year: new Date().getFullYear(),
            },
        });
    }

    async sendPasswordChangedNotification(data : PasswordChangedData): Promise<boolean> {
        return this.sendEmail({
            to: data.email,
            subject: "Your Password Has Been Changed",
            template: "password_changed",
            context: {
                userName: data.username,
                changeTime: data.changedAt,
                deviceInfo: data.deviceInfo || "Unknown device",
                year: new Date().getFullYear(),
            },
        });
    }

    async deleteAccountNotification(data : DeleteAccountData): Promise<boolean> {
        const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;
        return this.sendEmail({
            to: data.email,
            subject: "You Requested Account Deletion",
            template: "delete_account",
            context: {
                userName: data.username,
                deletionData: data.deleteDate,
                loginUrl,
                year: new Date().getFullYear(),
            },
        });
    }
}

export default new EmailServices();