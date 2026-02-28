import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

const isProtectedRoute = createRouteMatcher([
  "/doctors(.*)",
  "/onboarding(.*)",
  "/doctor(.*)",
  "/admin(.*)",
  "/video-call(.*)",
  "/appointments(.*)",
]);


function redirectByRole (role, verificationStatus, req) {
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


export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId && isProtectedRoute(req))
    return redirectToSignIn();
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

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};