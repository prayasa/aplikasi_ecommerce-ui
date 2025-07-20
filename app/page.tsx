// app/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { apiClient } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Product {
  product_id: string; name: string; price: number; description: string; image_url?: string; 
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error("Gagal memuat produk:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Koleksi Terbaik, Harga Terbaik
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Temukan semua yang Anda butuhkan, dari fashion hingga elektronik, semuanya di satu tempat.
          </p>
          <div className="mt-8"><Button size="lg">Mulai Belanja</Button></div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Produk Unggulan</h2>
          {loading ? (
            <p className="text-center">Memuat produk...</p>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <Card key={product.product_id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                      <Image
                        src={product.image_url || `https://via.placeholder.com/300?text=${product.name.replace(/\s/g, '+')}`}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold truncate">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 h-10 overflow-hidden">{product.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xl font-bold">Rp {(product.price || 0).toLocaleString('id-ID')}</p>
                        <Button size="sm">Beli</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}