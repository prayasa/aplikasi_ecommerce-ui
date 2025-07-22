// app/dashboard/layout.tsx

"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getToken, logout } from '@/lib/auth';
import { Home, LogOut, Package, ShoppingCart, Users, Moon, Sun } from 'lucide-react';
import { useTheme } from "next-themes";

import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Komponen Fungsional: Tombol Ganti Tema
function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  return (
    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// Komponen Header Sidebar yang disempurnakan
function DashboardSidebarHeader() {
    const { state } = useSidebar();
    return (
        <SidebarHeader className="flex h-16 items-center justify-between px-4">
            {/* Logo hanya akan terlihat saat sidebar terbuka penuh */}
            <div className={cn(
                "flex items-center gap-2 overflow-hidden whitespace-nowrap transition-all duration-300",
                state === 'expanded' ? "w-32 opacity-100" : "w-0 opacity-0"
            )}>
                 <Image
                    src="/logo.png"
                    alt="E-Commerce Logo"
                    width={120}
                    height={30}
                    priority
                />
            </div>
            <div className="flex-grow" />
            <SidebarTrigger />
        </SidebarHeader>
    )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = getToken();
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!isClient) {
    return (
        <div className="flex h-screen items-center justify-center bg-muted/40">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar>
          <DashboardSidebarHeader />
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/dashboard" tooltip="Dashboard">
                  <Home className="size-5" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
                <SidebarMenuButton href="/dashboard/products" tooltip="Produk">
                  <Package className="size-5" />
                  <span>Produk</span>
                </SidebarMenuButton>
                <SidebarMenuButton href="/dashboard/orders" tooltip="Pesanan">
                  <ShoppingCart className="size-5" />
                  <span>Pesanan</span>
                </SidebarMenuButton>
                <SidebarMenuButton href="/dashboard/customers" tooltip="Pelanggan">
                  <Users className="size-5" />
                  <span>Pelanggan</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="flex-1">
                <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarImage src="https://ui.shadcn.com/avatars/01.png" alt="Admin" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

           <main className="flex-1 overflow-auto p-6 animate-in fade-in-50 duration-500">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
