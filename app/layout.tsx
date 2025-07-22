// app/layout.tsx

'use client';

import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono } from "next/font/google";
import { TransitionProvider } from "./context/TransitionContext";
import { ThemeProvider } from "./components/theme-provider"; // <-- 1. Impor

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith('/dashboard') || pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="E-Commerce Logo"
              width={120}
              height={40}
              priority
            />
          </Link>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">{children}</main>
      <footer className="border-t bg-white">
        <div className="container mx-auto py-6 px-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Devrian Prayasa
        </div>
      </footer>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          <title>Manajemen E-Commerce</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 2. Bungkus semua provider dengan ThemeProvider */}
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <TransitionProvider>
              <AuthProvider>
                <AppLayout>{children}</AppLayout>
                <Toaster position="top-center" richColors />
              </AuthProvider>
            </TransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
