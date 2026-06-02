import './globals.css';

import { Facebook, Instagram, Linkedin, X } from 'lucide-react';

import { ClerkProvider } from '@clerk/nextjs';
import ClientBase from './ClientBase';
import Header from '@/components/header';
import { Inter } from 'next/font/google';
import { Money } from '@toneflix/money';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { dark } from '@clerk/themes';

const inter = Inter({ subsets: ['latin'] });
Money.setDefaultCurrency('NGN');

// export const metadata = {
//   title: "Doctors Appointment App",
//   description: "Connect with doctors anytime, anywhere",
// };

export const metadata = {
  metadataBase: new URL('https://medisure.africa/'),
  title: {
    default: 'MediPadi – Affordable Health Plans by MediSure',
    template: '%s | MediPadi',
  },
  description:
    'MediPadi by MediSure gives Nigerians access to quality, affordable healthcare. Prepaid health plans covering malaria, fever, infections and more. Serving Kuje, Abuja.',
  icons: {
    icon: [{ url: '/logo2.png', type: 'image/png', sizes: '500x500' }],
    shortcut: '/favicon.ico',
    apple: [{ url: '/logo2.png', sizes: '500x500', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'MediPadi by MediSure',
    title: 'MediPadi – Affordable Health Plans by MediSure',
    description:
      'Prepaid health plans covering malaria, fever, infections and basic first aid. Quality healthcare for every Nigerian.',
    images: [
      {
        url: '/banner3.jpg',
        width: 1200,
        height: 630,
        alt: 'MediPadi – Affordable Healthcare Plans by MediSure',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediPadi – Affordable Health Plans by MediSure',
    description:
      'Quality prepaid health plans for every Nigerian. Covering malaria, fever, infections and more.',
    images: ['/banner3.jpg'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      afterSignOutUrl="/"
    >
      <ClientBase />
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200">
                {' '}
                <p className="text-white text-2xl font-semibold mb-4">
                  Contact Us
                </p>
                <div className="flex items-center justify-center text-white gap-4">
                  <a href="">
                    <Facebook />
                  </a>
                  <a href="">
                    <Instagram />
                  </a>
                  <a href="">
                    <X />
                  </a>
                  <a href="">
                    <Linkedin />
                  </a>
                </div>
                {/* <p>Made with 💗 by RoadsideCoder</p> */}
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
