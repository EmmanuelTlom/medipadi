import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme-provider";
import { Facebook, Instagram, Linkedin, X } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Doctors Appointment App",
  description: "Connect with doctors anytime, anywhere",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.png" sizes="any" />
        </head>
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
                {" "}
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
