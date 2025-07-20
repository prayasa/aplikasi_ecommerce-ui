// app/dashboard/products/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/auth';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster, toast } from 'sonner';

// Skema untuk Produk
const productSchema = z.object({
  name: z.string().min(1, 'Nama produk tidak boleh kosong.'),
  description: z.string().min(1, 'Deskripsi tidak boleh kosong.'),
  price: z.coerce.number().int().positive('Harga harus angka positif.'),
  stock: z.coerce.number().int().positive('Stok harus angka positif.'),
  category_id: z.string().min(1, 'Anda harus memilih kategori.'),
});

// Skema untuk Kategori
const categorySchema = z.object({
    name: z.string().min(1, 'Nama kategori tidak boleh kosong.'),
    description: z.string().min(1, 'Deskripsi tidak boleh kosong.'),
});

type ProductFormValues = z.infer<typeof productSchema>;
type CategoryFormValues = z.infer<typeof categorySchema>;

interface Category {
  category_id: string;
  name: string;
}
interface Product extends ProductFormValues {
    product_id: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const productForm = useForm<ProductFormValues>({ resolver: zodResolver(productSchema) });
  const categoryForm = useForm<CategoryFormValues>({ resolver: zodResolver(categorySchema) });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/categories')
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
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

  const onProductSubmit = async (data: ProductFormValues) => {
    try {
      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct.product_id}`, data);
        toast.success("Produk berhasil diperbarui!");
      } else {
        await apiClient.post('/products', data);
        toast.success("Produk baru berhasil ditambahkan!");
      }
      await fetchInitialData();
      closeProductDialog();
    } catch (error) {
      console.error("Gagal menyimpan produk:", error);
      toast.error("Gagal menyimpan produk.");
    }
  };

  const onCategorySubmit = async (data: CategoryFormValues) => {
    try {
        const response = await apiClient.post('/categories', data);
        toast.success(`Kategori "${data.name}" berhasil ditambahkan!`);
        
        const newCategory = response.data;
        setCategories(prev => [...prev, newCategory]);
        productForm.setValue('category_id', newCategory.category_id);
        
        setIsCategoryDialogOpen(false);
        categoryForm.reset();
    } catch (error) {
        console.error("Gagal menyimpan kategori:", error);
        toast.error("Gagal menyimpan kategori baru.");
    }
  }

  const handleDelete = async (productId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        try {
            await apiClient.delete(`/products/${productId}`);
            await fetchInitialData();
            toast.success("Produk berhasil dihapus.");
        } catch (error) {
            console.error("Gagal menghapus produk:", error);
            toast.error("Gagal menghapus produk.");
        }
    }
  };
  
  const openProductDialog = (product: Product | null = null) => {
    setEditingProduct(product);
    if (product) {
      productForm.reset(product);
    } else {
      productForm.reset({ name: '', description: '', price: 0, stock: 0, category_id: '' });
    }
    setIsProductDialogOpen(true);
  };
  
  const closeProductDialog = () => {
    setIsProductDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex flex-col gap-8">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Manajemen Produk</h1>
          <Button onClick={() => openProductDialog()} className="ml-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </div>

        {/* ===== KODE YANG HILANG SEBELUMNYA ADA DI SINI ===== */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Produk</CardTitle>
            <CardDescription>Semua produk yang terdaftar di toko Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Memuat...</TableCell></TableRow>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">Rp {(product.price || 0).toLocaleString('id-ID')}</TableCell>
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
                            <DropdownMenuItem onClick={() => openProductDialog(product)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(product.product_id)}>Hapus</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Belum ada produk.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* DIALOG UNTUK TAMBAH/EDIT PRODUK */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
            </DialogHeader>
            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4 py-4">
                <FormField control={productForm.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nama Produk</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={productForm.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Deskripsi</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={productForm.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Harga</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={productForm.control} name="stock" render={({ field }) => (
                  <FormItem><FormLabel>Stok</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={productForm.control} name="category_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <div className="flex items-center gap-2">
                        <Select onValueChange={field.onChange} value={field.value || ''} defaultValue={field.value || ''}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.category_id} value={cat.category_id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" size="icon" onClick={() => setIsCategoryDialogOpen(true)}>
                            <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                )}/>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeProductDialog}>Batal</Button>
                  <Button type="submit">Simpan</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* DIALOG UNTUK TAMBAH KATEGORI BARU (NESTED) */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Kategori Baru</DialogTitle>
            </DialogHeader>
            <Form {...categoryForm}>
              <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                <FormField control={categoryForm.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Nama Kategori</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={categoryForm.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Deskripsi</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Batal</Button>
                  <Button type="submit">Simpan Kategori</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}