import 'dotenv/config';

import QRCode from "qrcode";
import { clerkClient } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";
import twilio from "twilio";

// Add notification utility functions
const transporter = nodemailer.createTransport({
    service: (process.env.MAIL_SERVICE ?? 'smtp').toLowerCase(),
    host: process.env.MAIL_SERVICE_HOST,
    port: parseInt(process.env.MAIL_SERVICE_PORT ?? '587', 10),
    auth: {
        user: process.env.MAIL_SERVICE_USERNAME ?? '',
        pass: process.env.MAIL_SERVICE_PASSWORD ?? '',
    }
});

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendEmailNotification (to: string, subject: string, text: string) {
    try {
        await transporter.sendMail({
            from: process.env.MAIL_SERVICE_USERNAME ?? '',
            to,
            subject,
            text,
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Failed to send email:", error);
    }
}

export async function sendSMSNotification (to: string, message: string) {
    try {
        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
        console.log("SMS sent successfully");
    } catch (error) {
        console.error("Failed to send SMS:", error);
    }
}


/**
 * Generate QR code for membership ID
 */
export async function generateQRCode (membershipId: string) {
    try {
        const qrCodeDataURL = await QRCode.toDataURL(membershipId, {
            width: 200,
            margin: 2,
            color: {
                dark: "#10b981",
                light: "#ffffff",
            },
        });
        return qrCodeDataURL;
    } catch (error) {
        console.error("Failed to generate QR code:", error);
        throw new Error("Failed to generate QR code");
    }
}

type CreateUserParams = Parameters<
    Awaited<ReturnType<typeof clerkClient>>['users']['createUser']
>[0] & { emailAddress?: string | string[], phoneNumber?: string | string[] };

/**
 * 
 * @param  params 
 * @returns 
 */
export async function createClerkUser (params: CreateUserParams) {
    const client = await clerkClient()
    if (typeof params.emailAddress === "string") {
        params.emailAddress = [params.emailAddress]
    }
    if (typeof params.phoneNumber === "string") {
        params.phoneNumber = [params.phoneNumber]
    }

    return await client.users.createUser(params)
}