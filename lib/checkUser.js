import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
import { sendEmailNotification, buildWelcomeEmailText } from "./server.utils";

async function generateMembershipId() {
  const count = await db.user.count({ where: { role: 'PATIENT' } });
  return `MED-${String(count + 1).padStart(3, '0')}`;
}

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
      include: {
        plan: true,
        transactions: {
          where: {
            type: "CREDIT_PURCHASE",
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (loggedInUser) {
      // Backfill any critical fields that may be missing
      const updates = {};

      if (!loggedInUser.membershipId) {
        updates.membershipId = await generateMembershipId();
      }
      if (!loggedInUser.firstName && user.firstName) {
        updates.firstName = user.firstName;
      }
      if (!loggedInUser.lastName && user.lastName) {
        updates.lastName = user.lastName;
      }
      // Keep the combined name in sync if we're updating individual parts
      if ((updates.firstName || updates.lastName) && !loggedInUser.name) {
        const first = updates.firstName || loggedInUser.firstName || '';
        const last = updates.lastName || loggedInUser.lastName || '';
        updates.name = `${first} ${last}`.trim();
      }

      if (Object.keys(updates).length > 0) {
        return await db.user.update({
          where: { id: loggedInUser.id },
          data: updates,
          include: {
            plan: true,
            transactions: {
              where: {
                type: "CREDIT_PURCHASE",
                createdAt: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        });
      }

      return loggedInUser;
    }

    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const name = `${firstName} ${lastName}`.trim() || user.emailAddresses[0].emailAddress.split('@')[0];

    const email = user.emailAddresses[0].emailAddress;
    const membershipId = await generateMembershipId();

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        imageUrl: user.imageUrl,
        email,
        membershipId,
        transactions: {
          create: {
            type: "CREDIT_PURCHASE",
            packageId: "free_user",
            amount: 0,
          },
        },
      },
    });

    // Send welcome email (fire-and-forget — don't block sign-in on email failure)
    sendEmailNotification(
      email,
      "Welcome to MediPadi!",
      buildWelcomeEmailText({ name, email, membershipId })
    ).catch((err) => console.error("Welcome email failed:", err));

    return newUser;
  } catch (error) {
    console.log(error.message);
  }
};
