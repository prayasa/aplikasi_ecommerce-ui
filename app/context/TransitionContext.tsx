'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface TransitionContextType {
  transitionTo: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const TransitionProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isShowingOverlay, setIsShowingOverlay] = useState(false);
  const [targetPath, setTargetPath] = useState<string>('');

  // Fungsi yang dipanggil dari tombol
  const transitionTo = useCallback((href: string) => {
    // Hanya jalankan jika tujuannya beda halaman
    if (pathname !== href) {
      setTargetPath(href);
      setIsShowingOverlay(true); // <-- Langkah 1: Tampilkan overlay SEGERA
    }
  }, [pathname]);

  // Efek ini berjalan setelah overlay muncul
  useEffect(() => {
    if (isShowingOverlay && targetPath) {
      // Langkah 2: Langsung pindah halaman di belakang layar
      router.push(targetPath);
    }
  }, [isShowingOverlay, targetPath, router]);

  // Efek ini berjalan SETELAH halaman baru selesai dimuat (dideteksi dari perubahan pathname)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isShowingOverlay) {
        // Langkah 3: Beri jeda sangat singkat agar halaman baru sempat render,
        // lalu mulai proses fade-out overlay
        timeoutId = setTimeout(() => {
            setIsShowingOverlay(false);
        }, 50); // Jeda 50ms
    }
    return () => clearTimeout(timeoutId);
  }, [pathname]); // <-- Kunci: Efek ini hanya berjalan saat URL berubah

  return (
    <TransitionContext.Provider value={{ transitionTo }}>
      {children}

      {/* Elemen Overlay yang sudah disempurnakan */}
      <div
        className={cn(
          'fixed inset-0 bg-background z-[100] pointer-events-none',
          // Transisi KELUAR (fade-out) dibuat halus
          'transition-opacity duration-500 ease-in-out',
          // Logika baru: Muncul seketika, menghilang perlahan
          isShowingOverlay ? 'opacity-100' : 'opacity-0'
        )}
      />
    </TransitionContext.Provider>
  );
};

// Hook kustom (tidak berubah)
export const usePageTransition = () => {
  const context = useContext(TransitionContext);
  if (context === undefined) {
    throw new Error('usePageTransition must be used within a TransitionProvider');
  }
  return context;
};
