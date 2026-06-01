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

export async function sendEmailNotification (to: string, subject: string, text: string, html?: string) {
    try {
        return await transporter.sendMail({
            from: `MediPadi <${process.env.MAIL_SERVICE_USERNAME ?? ''}>`,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        console.error("Failed to send email:", error);
    }
}

export function buildWelcomeEmailText ({ name, email, membershipId }: { name: string; email: string; membershipId: string }) {
    return `Welcome to MediPadi, ${name}!

Your account has been created successfully.

Account Details:
  Name: ${name}
  Email: ${email}
  Membership ID: ${membershipId}

Getting Started:
  1. Log in at your dashboard and choose a health plan
  2. Coverage begins 14 days after plan activation
  3. Show your QR code at any certified MediPadi partner clinic

Questions? Reply to this email or visit our website.

Welcome to the MediPadi family!
Team MediPadi`;
}

export function buildSubscriptionEmailText ({ name, planName, credits, subscriptionEnd }: { name: string; planName: string; credits: number; subscriptionEnd: Date }) {
    return `Hello ${name},

Your MediPadi subscription has been activated!

Plan: ${planName}
Credits: ${credits}
Coverage Until: ${subscriptionEnd.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}

Important reminders:
  - Coverage begins 14 days from activation
  - Visit any certified MediPadi partner clinic to use your benefits
  - Show your QR code for instant verification
  - Each illness episode is covered up to a ₦5,000 claim cap

Thank you for choosing MediPadi.
Team MediPadi`;
}

export async function sendSMSNotification (to: string, message: string) {
    try {
        return await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
    } catch (error) {
        console.error("Failed to send SMS:", error);
    }
}


/**
 * Generate QR code for membership ID
 */
export async function generateQRCode (membershipId: string) {
    try {
        return await QRCode?.toDataURL(membershipId, {
            width: 200,
            margin: 2,
            color: {
                dark: "#10b981",
                light: "#ffffff",
            },
        });
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