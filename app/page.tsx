// app/page.tsx

'use client';

import { Button } from '@/components/ui/button';
import { usePageTransition } from '@/app/context/TransitionContext'; // <-- Impor hook

export default function HomePage() {
  const { transitionTo } = usePageTransition(); // <-- Gunakan hook

  return (
    <>
      <section
        className="w-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center"
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        {/* Tambahkan animasi masuk untuk konten halaman */}
        <div className="container mx-auto px-4 text-center animate-in fade-in-0 duration-700">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Sistem Manajemen E-Commerce
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Masuk ke dasbor untuk mengelola semua pesanan pelanggan dengan mudah dan cepat.
          </p>
          <div className="mt-8">
            {/* Panggil transitionTo saat tombol di-klik */}
            <Button size="lg" onClick={() => transitionTo('/login')}>
              Dashboard
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
