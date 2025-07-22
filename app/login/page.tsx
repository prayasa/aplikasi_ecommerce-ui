// app/login/page.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react'; // <-- Impor ikon mata

// Skema validasi tetap sama
const loginSchema = z.object({
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(1, 'Password tidak boleh kosong.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Komponen LoginForm yang disederhanakan hanya untuk Admin
const AdminLoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // <-- State untuk show/hide password
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      await login(data.email, data.password);
      toast.success('Login berhasil!');
      // Tunda navigasi agar toast sempat terlihat
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kredensial tidak valid.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="admin@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'} // <-- Tipe input dinamis
                    placeholder="••••••••"
                    {...field}
                    className="pr-10" // <-- Beri ruang untuk ikon
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Memproses...' : 'Login'}
        </Button>
      </form>
    </Form>
  );
};

// Komponen utama LoginPage yang sudah dirombak total
export default function LoginPage() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* 1. Background dari app/page.tsx yang di-blur */}
        <div
          className="absolute inset-0 z-0 bg-gradient-to-r from-gray-100 to-gray-200"
          style={{
            filter: 'blur(8px)',
            transform: 'scale(1.1)', // Sedikit zoom agar blur tidak menciptakan tepi kosong
          }}
        >
          {/* Konten dari page.tsx sebagai background */}
           <div className="container mx-auto px-4 text-center h-full flex flex-col justify-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl opacity-30">
              Sistem Manajemen E-Commerce
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 opacity-30">
              Masuk ke dasbor untuk mengelola semua pesanan pelanggan dengan mudah dan cepat.
            </p>
          </div>
        </div>

        {/* 2. Konten Login di atas background yang blur */}
        <div className="relative z-10 w-full max-w-sm animate-in fade-in-0 zoom-in-95 duration-500">
          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Administrator Area
              </CardTitle>
              <CardDescription>
                Silakan masuk untuk mengakses dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminLoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
