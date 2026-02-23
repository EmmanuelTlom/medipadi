import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl;

  // If not logged in and trying to access protected route
  if (!userId) {
    return NextResponse.next();
  }

  // Fetch user role from DB
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) return NextResponse.next();

  // If user is on onboarding but already has role
  if (url.pathname.startsWith("/onboarding") && user.role) {
    return redirectByRole(user.role, user.verificationStatus, req);
  }

  return NextResponse.next();
});

function redirectByRole(role, verificationStatus, req) {
  const url = req.nextUrl.clone();

  if (role === "PATIENT") {
    url.pathname = "/member";
  } else if (role === "DOCTOR") {
    url.pathname =
      verificationStatus === "VERIFIED"
        ? "/doctor"
        : "/doctor/verification";
  } else if (role === "ADMIN") {
    url.pathname = "/admin";
  } else if (role === "AGENT") {
    url.pathname = "/agent";
  } else if (role === "PROVIDER") {
    url.pathname = "/provider";
  }

  return NextResponse.redirect(url);
}
