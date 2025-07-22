// app/dashboard/orders/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/auth';
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toaster, toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// --- Tipe Data ---
interface Customer {
  customer_id: string;
  name: string;
}

interface Product {
    product_id: string;
    name: string;
    price: number;
}

type OrderStatus = 'pending' | 'completed' | 'cancelled';

interface Order {
  order_id: string;
  customer: Customer;
  order_date: string;
  total_amount: number;
  payment_method: string;
  status: OrderStatus;
}

// --- Skema Validasi untuk Form Pesanan Baru ---
const orderFormSchema = z.object({
  customer_id: z.string().min(1, 'Pelanggan harus dipilih.'),
  payment_method: z.enum(['Tunai', 'Transfer Bank'], { required_error: 'Metode pembayaran harus dipilih.' }),
  items: z.array(z.object({
    product_id: z.string().min(1, 'Produk harus dipilih.'),
    quantity: z.coerce.number().min(1, 'Jumlah minimal 1.'),
  })).min(1, 'Minimal harus ada 1 produk dalam pesanan.'),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer_id: '',
      payment_method: 'Tunai',
      items: [{ product_id: '', quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // --- Logika untuk mengambil data awal ---
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        apiClient.get('/orders'),
        apiClient.get('/customers'),
        apiClient.get('/products'),
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Gagal memuat data:", error);
      toast.error("Gagal memuat data dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- Logika untuk mengirim pesanan baru ---
  const onSubmit = async (data: OrderFormValues) => {
    try {
      await apiClient.post('/orders', data);
      toast.success("Pesanan baru berhasil ditambahkan!");
      await fetchInitialData();
      closeDialog();
    } catch (error: any) {
      console.error("Gagal menyimpan pesanan:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan pesanan.");
    }
  };

  // ======================================================================
  // FUNGSI BARU: Mengubah Status Pesanan
  // ======================================================================
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const originalOrders = [...orders];
    
    // Optimistic UI update
    setOrders(prevOrders =>
      prevOrders.map(o =>
        o.order_id === orderId ? { ...o, status: newStatus } : o
      )
    );

    try {
      await apiClient.put(`/orders/${orderId}`, { status: newStatus });
      toast.success(`Status pesanan berhasil diubah menjadi "${newStatus}"`);
    } catch (error) {
      // Rollback jika gagal
      setOrders(originalOrders);
      toast.error("Gagal mengubah status pesanan.");
      console.error("Gagal update status:", error);
    }
  };

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => {
    setIsDialogOpen(false);
    form.reset();
  };

  // Helper untuk warna badge status
  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'default'; // Warna hijau/primer
      case 'pending':
        return 'secondary'; // Warna abu-abu
      case 'cancelled':
        return 'destructive'; // Warna merah
      default:
        return 'outline';
    }
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex flex-col gap-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Manajemen Pesanan</h1>
          <Button onClick={openDialog} className="ml-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Pesanan
          </Button>
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
                  <TableHead>Metode Pembayaran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Aksi</TableHead> {/* <-- KOLOM AKSI BARU */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center">Memuat...</TableCell></TableRow>
                ) : orders.map((order) => (
                  <TableRow key={order.order_id}>
                    <TableCell className="font-medium">{order.customer?.name || 'N/A'}</TableCell>
                    <TableCell>{format(new Date(order.order_date), 'dd MMM yyyy', { locale: localeID })}</TableCell>
                    <TableCell>{order.payment_method}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                            {order.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">Rp {order.total_amount.toLocaleString('id-ID')}</TableCell>
                    {/* ====================================================================== */}
                    {/* KOLOM AKSI DENGAN DROPDOWN */}
                    {/* ====================================================================== */}
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={order.status === 'completed'}
                            onClick={() => handleStatusChange(order.order_id, 'completed')}
                          >
                            Tandai Selesai (Completed)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={order.status === 'pending'}
                            onClick={() => handleStatusChange(order.order_id, 'pending')}
                          >
                            Tandai Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            disabled={order.status === 'cancelled'}
                            onClick={() => handleStatusChange(order.order_id, 'cancelled')}
                          >
                            Batalkan (Cancelled)
                          </DropdownMenuItem>
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

      {/* Dialog untuk Tambah Pesanan Baru (Tidak berubah) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buat Pesanan Baru</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pelanggan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Pilih pelanggan" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.customer_id} value={c.customer_id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <FormLabel>Item Pesanan</FormLabel>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_id`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                               <SelectTrigger><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.product_id} value={p.product_id}>
                                  {p.name} - Rp {p.price.toLocaleString('id-ID')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="number" placeholder="Jumlah" {...field} className="w-24" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                 <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ product_id: '', quantity: 1 })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Tambah Produk
                </Button>
              </div>
               <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Metode Pembayaran</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Tunai" id="tunai" /></FormControl>
                            <FormLabel htmlFor="tunai" className="font-normal">Tunai</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl><RadioGroupItem value="Transfer Bank" id="transfer" /></FormControl>
                            <FormLabel htmlFor="transfer" className="font-normal">Transfer Bank</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>Batal</Button>
                <Button type="submit">Simpan Pesanan</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
