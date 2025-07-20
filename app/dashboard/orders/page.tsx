// app/dashboard/orders/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/auth';
import { MoreHorizontal, FileText } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';

// --- Interfaces (Definisi Tipe Data dari Backend) ---
interface Customer {
  customer_id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
}

interface Product {
    product_id: string;
    name: string;
    price: number;
}

interface OrderItem {
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
}

interface Order {
  order_id: string;
  customer_id: string;
  order_date: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  // Properti tambahan untuk data yang sudah digabung
  customer_name?: string;
  items?: OrderItem[];
}


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Ambil semua data yang dibutuhkan secara paralel
        const [ordersRes, customersRes, orderItemsRes, productsRes] = await Promise.all([
          apiClient.get('/orders'),
          apiClient.get('/customers'),
          apiClient.get('/order-items'), // Seharusnya difilter di backend, tapi kita proses di frontend
          apiClient.get('/products')
        ]);

        const customers: Customer[] = customersRes.data;
        const orderItems: OrderItem[] = orderItemsRes.data;
        const products: Product[] = productsRes.data;

        // Buat "kamus" untuk mencari data dengan cepat
        const customerMap = new Map(customers.map(c => [c.customer_id, c.name]));
        const productMap = new Map(products.map(p => [p.product_id, p]));

        // Gabungkan data pesanan dengan nama pelanggan dan item-itemnya
        const combinedOrders = ordersRes.data.map(order => {
            const items = orderItems
                .filter(item => item.order_id === order.order_id)
                .map(item => ({
                    ...item,
                    product_name: productMap.get(item.product_id)?.name || 'Produk tidak ditemukan'
                }));

            return {
                ...order,
                customer_name: customerMap.get(order.customer_id) || 'Pelanggan tidak diketahui',
                items: items
            };
        });

        setOrders(combinedOrders);

      } catch (error) {
        console.error("Gagal memuat data pesanan:", error);
        toast.error("Gagal memuat data pesanan.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex flex-col gap-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Manajemen Pesanan</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pesanan</CardTitle>
            <CardDescription>Semua pesanan yang masuk ke toko Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center">Memuat...</TableCell></TableRow>
                ) : orders.map((order) => (
                  <TableRow key={order.order_id}>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell>{format(new Date(order.order_date), 'dd MMM yyyy')}</TableCell>
                    <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                    <TableCell className="text-right">Rp {order.total_amount.toLocaleString('id-ID')}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </DropdownMenuItem>
                          {/* Tambahkan aksi lain seperti "Update Status" di sini */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog untuk Melihat Detail Pesanan */}
      <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
            <DialogDescription>
              ID Pesanan: {selectedOrder?.order_id}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
                <div>
                    <h3 className="font-semibold">Informasi Pelanggan</h3>
                    <p className="text-sm text-muted-foreground">{selectedOrder.customer_name}</p>
                </div>
                 <div>
                    <h3 className="font-semibold">Detail Item</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produk</TableHead>
                                <TableHead>Jumlah</TableHead>
                                <TableHead className="text-right">Harga</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedOrder.items?.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.product_name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell className="text-right">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 <div className="text-right font-bold">
                    Total: Rp {selectedOrder.total_amount.toLocaleString('id-ID')}
                 </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}