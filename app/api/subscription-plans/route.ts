import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET () {
    try {
        const data = await db.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { duration: "asc" },
        });

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error fetching subscription plans:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscription plans" },
            { status: 500 }
        );
    }
}
