// app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/auth';
import { DollarSign, Package, Users, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Customer {
  customer_id: string;
  name: string;
}

interface Order {
  order_id: string;
  customer_id: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  order_date: string;
  customer_name?: string; 
}

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-8">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="h-[126px]" />
      <Skeleton className="h-[126px]" />
      <Skeleton className="h-[126px]" />
      <Skeleton className="h-[126px]" />
    </div>
    <div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);


export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, orderRes, customerRes] = await Promise.all([
          apiClient.get('/products'),
          apiClient.get('/orders'),
          apiClient.get('/customers'),
        ]);

        const productsData = Array.isArray(productRes.data) ? productRes.data : [];
        const ordersData = Array.isArray(orderRes.data) ? orderRes.data : [];
        const customersData: Customer[] = Array.isArray(customerRes.data) ? customerRes.data : [];
        
        const customerMap = new Map(customersData.map(c => [c.customer_id, c.name]));

        const ordersWithCustomerNames = ordersData.map(order => ({
          ...order,
          customer_name: customerMap.get(order.customer_id) || 'Pelanggan',
        }));
        
        const totalSales = ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0);

        setStats({
          products: productsData.length,
          customers: customersData.length,
          sales: totalSales,
          newOrders: ordersData.length, // Data "Total Pesanan"
        });

        const sortedOrders = ordersWithCustomerNames.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
        setRecentOrders(sortedOrders.slice(0, 5));
        
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {stats?.sales?.toLocaleString('id-ID') || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.customers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.products || 0}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.newOrders || 0}</div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Pesanan Terbaru</CardTitle>
            <CardDescription>
              Berikut adalah 5 pesanan terakhir yang masuk ke sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders && recentOrders.map((order) => (
                    <TableRow key={order.order_id}> 
                    <TableCell>
                        <div className="font-medium">{order.customer_name}</div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline">{order.status || 'pending'}</Badge>
                    </TableCell>
                    <TableCell>
                        {format(new Date(order.order_date), 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell className="text-right">
                        Rp {(order.total_amount || 0).toLocaleString('id-ID')}
                    </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
