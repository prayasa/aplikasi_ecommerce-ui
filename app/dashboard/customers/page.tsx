// app/dashboard/customers/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/auth';
import { MoreHorizontal, PlusCircle, Eye, EyeOff } from 'lucide-react'; // Impor ikon Eye

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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Toaster, toast } from 'sonner';

const customerSchema = z.object({
  name: z.string().min(1, 'Nama tidak boleh kosong.').max(50),
  email: z.string().email('Format email tidak valid.'),
  password: z.string().optional(),
  phone: z.string().min(1, 'Nomor telepon tidak boleh kosong.'),
  address: z.string().min(1, 'Alamat tidak boleh kosong.'),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface Customer extends CustomerFormValues {
    customer_id: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showPassword, setShowPassword] = useState(false); // State untuk toggle password

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  // Fungsi fetchCustomers tetap sama, memanggil '/customers'
  const fetchCustomers = async () => {
    try {
      const response = await apiClient.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error("Gagal memuat pelanggan:", error);
      toast.error("Gagal memuat data pelanggan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fungsi onSubmit tetap sama
  const onSubmit = async (data: CustomerFormValues) => {
    try {
      const submissionData = { ...data };
      if (editingCustomer && !submissionData.password) {
        delete submissionData.password;
      } else if (!editingCustomer && !submissionData.password) {
        form.setError("password", { message: "Password wajib diisi untuk pelanggan baru." });
        return;
      }
      
      if (editingCustomer) {
        await apiClient.put(`/customers/${editingCustomer.customer_id}`, submissionData);
        toast.success("Data pelanggan berhasil diperbarui!");
      } else {
        await apiClient.post('/customers', submissionData);
        toast.success("Pelanggan baru berhasil ditambahkan!");
      }
      await fetchCustomers();
      closeDialog();
    } catch (error: any) {
      console.error("Gagal menyimpan pelanggan:", error);
      toast.error(error.response?.data?.message || "Gagal menyimpan data pelanggan.");
    }
  };

  const handleDelete = async (customerId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pelanggan ini?')) {
        try {
            await apiClient.delete(`/customers/${customerId}`);
            await fetchCustomers();
            toast.success("Pelanggan berhasil dihapus.");
        } catch (error) {
            console.error("Gagal menghapus pelanggan:", error);
            toast.error("Gagal menghapus pelanggan.");
        }
    }
  };
  
  const openDialog = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    if (customer) {
      form.reset(customer);
    } else {
      form.reset({ name: '', email: '', password: '', phone: '', address: '' });
    }
    setShowPassword(false); // Reset show password state
    setIsDialogOpen(true);
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCustomer(null);
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex flex-col gap-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Manajemen Pelanggan</h1>
          <Button onClick={() => openDialog()} className="ml-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Pelanggan
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pelanggan</CardTitle>
            <CardDescription>Semua pelanggan yang terdaftar di toko Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Memuat...</TableCell></TableRow>
                ) : customers.map((customer) => (
                  <TableRow key={customer.customer_id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openDialog(customer)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(customer.customer_id)}>Hapus</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showPassword ? 'text' : 'password'} 
                          {...field} 
                          placeholder={editingCustomer ? "Isi untuk ganti password" : ""}
                          className="pr-10"
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-0 right-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}/>

                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Nomor Telepon</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel>Alamat</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog}>Batal</Button>
                  <Button type="submit">Simpan</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}