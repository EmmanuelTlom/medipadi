"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();

  if (!firstName) {
    throw new Error("First name is required");
  }

  const name = [firstName, lastName].filter(Boolean).join(" ");

  await db.user.update({
    where: { clerkUserId: userId },
    data: {
      firstName,
      lastName: lastName || null,
      name,
      phoneNumber: phoneNumber || null,
    },
  });

  revalidatePath("/member");
  return { success: true };
}
