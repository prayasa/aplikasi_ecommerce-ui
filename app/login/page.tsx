// app/login/page.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { login, customerLogin } from '@/lib/auth';
import { useAuth } from '@/app/context/AuthContext'; // <-- Impor useAuth
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = ({ userType }: { userType: 'seller' | 'customer' }) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { setCustomer } = useAuth(); // <-- Ambil fungsi setCustomer dari context
  const form = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' }});

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      if (userType === 'seller') {
        await login(data.email, data.password);
        toast.success('Login sebagai penjual berhasil!');
        router.push('/dashboard');
      } else {
        const response = await customerLogin(data.email, data.password);
        setCustomer(response.customer); // <-- Panggil setCustomer untuk update state global
        toast.success('Login sebagai pembeli berhasil!');
        router.push('/');
      }
      // router.refresh() tidak diperlukan lagi
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
              <FormControl><Input placeholder="email@contoh.com" {...field} /></FormControl>
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
              <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Memproses...' : 'Login'}
        </Button>
      </form>
    </Form>
  );
};

export default function LoginPage() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Tabs defaultValue="customer" className="w-full max-w-sm">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer">Pembeli</TabsTrigger>
            <TabsTrigger value="seller">Penjual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customer">
            <Card>
              <CardHeader>
                <CardTitle>Login Pembeli</CardTitle>
                <CardDescription>Masuk untuk melanjutkan belanja Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm userType="customer" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seller">
            <Card>
              <CardHeader>
                <CardTitle>Login Penjual</CardTitle>
                <CardDescription>Masuk ke dashboard admin Anda.</CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm userType="seller" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}