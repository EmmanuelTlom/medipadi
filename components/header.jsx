import {
  Building2,
  Calendar,
  CreditCard,
  ShieldCheck,
  Stethoscope,
  User,
  UserCheck,
} from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { checkAndAllocateCredits } from '@/actions/credits';
import { checkUser } from '@/lib/checkUser';

export default async function Header() {
  const user = await checkUser();
  // console.log(user);
  if (user?.role === 'PATIENT') {
    await checkAndAllocateCredits(user);
  }

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-10 supports-[backdrop-filter]:bg-background/60 nav overflow-hidden">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Image
            src="/logo2.png"
            alt="MediPadi Logo"
            width={200}
            height={50}
            className="h-70 m-[-25%] w-auto object-contain bg-white mx-auto"
          />
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <SignedIn>
            {/* Admin Links */}
            {user?.role === 'ADMIN' && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Doctor Links */}
            {user?.role === 'DOCTOR' && (
              <Link href="/doctor">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <Stethoscope className="h-4 w-4" />
                  Doctor Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <Stethoscope className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Patient Links */}
            {user?.role === 'PATIENT' && (
              <>
                <Link href="/member">
                  <Button
                    variant="outline"
                    className="hidden md:inline-flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    My Membership
                  </Button>
                  <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                    <CreditCard className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/appointments">
                  <Button
                    variant="outline"
                    className="hidden md:inline-flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    My Appointments
                  </Button>
                  <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}

            {/* Agent Links */}
            {user?.role === 'AGENT' && (
              <Link href="/agent">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  Agent Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <UserCheck className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Provider Links */}
            {user?.role === 'PROVIDER' && (
              <Link href="/provider">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Provider Dashboard
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <Building2 className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Unassigned Role */}
            {user?.role === 'UNASSIGNED' && (
              <Link href="/onboarding">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Complete Profile
                </Button>
                <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </SignedIn>

          {(!user || user?.role !== 'ADMIN') && (
            <Link
              href={
                user?.role === 'PATIENT'
                  ? '/pricing'
                  : user?.role === 'DOCTOR'
                    ? '/doctor'
                    : '#'
              }
            >
              <Badge
                variant="outline"
                className="h-9 bg-emerald-900/20 border-emerald-700/30 px-3 py-1 flex items-center gap-2"
              >
                <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">
                  {user && user.role !== 'ADMIN' ? (
                    <>
                      {user.credits}{' '}
                      <span className="hidden md:inline">
                        {user?.role === 'PATIENT'
                          ? 'Credits'
                          : 'Earned Credits'}
                      </span>
                    </>
                  ) : (
                    <>Pricing</>
                  )}
                </span>
              </Badge>
            </Link>
          )}

          <SignedOut>
            <Link href="/sign-in">
              <Button
                variant="secondary"
                className="inline-flex items-center gap-2 cursor-pointer"
              >
                Sign In
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                  userButtonPopoverCard: 'shadow-xl',
                  userPreviewMainIdentifier: 'font-semibold',
                },
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
