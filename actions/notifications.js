// Notification actions
import { sendEmailNotification, sendSMSNotification } from "@/lib/server.utils";

export async function notifyUser (userId, type, message) {
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        if (type === "email" && user.email) {
            await sendEmailNotification(user.email, "Notification", message);
        } else if (type === "sms" && user.phoneNumber) {
            await sendSMSNotification(user.phoneNumber, message);
        } else {
            throw new Error("Invalid notification type or missing contact info");
        }
    } catch (error) {
        console.error("Failed to notify user:", error);
    }
}