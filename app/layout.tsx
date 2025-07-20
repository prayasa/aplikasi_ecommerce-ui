// app/layout.tsx

'use client';

import "./globals.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/**
 * Komponen Cerdas yang memilih layout berdasarkan URL.
 * Ini adalah inti dari perbaikan kita.
 */
function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { customer, logout } = useAuth();
  const router = useRouter();

  const handleCustomerLogout = () => {
    logout();
    router.push('/');
  };

  // JIKA URL ADALAH HALAMAN ADMIN (/dashboard atau /login),
  // MAKA JANGAN TAMPILKAN APA-APA. BIARKAN layout.tsx DARI DASHBOARD MENGAMBIL ALIH.
  if (pathname.startsWith('/dashboard') || pathname === '/login') {
    return <>{children}</>;
  }

  // JIKA BUKAN HALAMAN ADMIN, TAMPILKAN LAYOUT TOKO PUBLIK.
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold text-gray-800">TokoKita</Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="icon"><ShoppingCart className="h-5 w-5" /></Button>
            {customer ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full"><Avatar><AvatarFallback>{customer.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Hi, {customer.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCustomerLogout}><LogOut className="mr-2 h-4 w-4" /><span>Logout</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login"><Button variant="outline"><User className="mr-2 h-4 w-4" />Login</Button></Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">{children}</main>
      <footer className="border-t bg-white">
        <div className="container mx-auto py-6 px-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TokoKita.
        </div>
      </footer>
    </div>
  );
}


// Root Layout yang sebenarnya, sekarang hanya berisi struktur dasar + provider
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
          <title>TokoKita E-Commerce</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}