import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Package, Activity, ShoppingCart, Truck, MapPin, Navigation, ShoppingBag, Layers } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    const isAdmin = session.user.role === 'ADMIN';

    // 1. Fetch Active Orders (Not Delivered, Not Cancelled)
    const activeOrders = await prisma.order.findMany({
        where: {
            status: {
                notIn: ['DELIVERED', 'CANCELLED']
            }
        },
        select: {
            id: true,
            source: true,
            shippingMethod: true,
        }
    });

    const totalActive = activeOrders.length;

    // 2. Count by Category
    const kaspiCount = activeOrders.filter(o => o.source === 'KASPI').length;
    const sdekCount = activeOrders.filter(o => o.shippingMethod === 'SDEK').length;
    const postCount = activeOrders.filter(o => o.shippingMethod === 'POST').length;
    const courierCount = activeOrders.filter(o => o.shippingMethod === 'ALMATY_COURIER').length;
    const rikaCount = activeOrders.filter(o => o.shippingMethod === 'RIKA_INDRIVE').length;
    const pickupCount = activeOrders.filter(o => ['PICKUP', 'YANDEX'].includes(o.shippingMethod)).length;

    // 3. Other Stats
    const productCount = await prisma.product.count();

    let recentTransactions: any[] = [];
    if (isAdmin) {
        recentTransactions = await prisma.transaction.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { product: true, user: true },
        });
    }

    const dailyPlan = [
        { name: 'Kaspi Магазин', value: kaspiCount, icon: ShoppingCart, color: 'bg-red-500', href: '/orders' },
        { name: 'SDEK Отправки', value: sdekCount, icon: Truck, color: 'bg-green-600', href: '/orders' },
        { name: 'Почта', value: postCount, icon: Package, color: 'bg-blue-500', href: '/orders' },
        { name: 'Алматы Курьер', value: courierCount, icon: MapPin, color: 'bg-yellow-500', href: '/orders' },
        { name: 'Rika / InDrive', value: rikaCount, icon: Navigation, color: 'bg-purple-500', href: '/orders' },
        { name: 'Самовывоз', value: pickupCount, icon: ShoppingBag, color: 'bg-orange-500', href: '/orders' },
    ];

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
                План на сегодня <span className="text-gray-400 text-lg font-normal">(Активно: {totalActive})</span>
            </h1>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-10">
                {dailyPlan.map((stat) => (
                    <Link key={stat.name} href={stat.href} className="block group">
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-all p-4 flex flex-col items-center text-center border border-gray-100 group-hover:border-indigo-100">
                            <stat.icon className={`h-10 w-10 text-white rounded-full p-2 mb-3 shadow-sm ${stat.color}`} />
                            <dt className="truncate text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.name}</dt>
                            <dd className={`mt-1 text-3xl font-extrabold ${stat.value > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                                {stat.value}
                            </dd>
                        </div>
                    </Link>
                ))}
            </div>

            <h2 className="mb-4 text-lg font-medium text-gray-900">Склад и Операции</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
                <Link href="/inventory" className="overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer block border border-gray-100">
                    <div className="p-5 flex items-center">
                        <Layers className="h-8 w-8 text-white rounded-full p-1.5 bg-indigo-600" />
                        <div className="ml-5">
                            <div className="text-sm font-medium text-gray-500">Всего товаров на складе</div>
                            <div className="text-2xl font-bold text-gray-900">{productCount}</div>
                        </div>
                    </div>
                </Link>

                {isAdmin && (
                    <Link href="/sales" className="overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer block border border-gray-100">
                        <div className="p-5 flex items-center">
                            <Activity className="h-8 w-8 text-white rounded-full p-1.5 bg-purple-600" />
                            <div className="ml-5">
                                <div className="text-sm font-medium text-gray-500">История операций</div>
                                <div className="text-base font-medium text-purple-600 hover:text-purple-800">Перейти к отчету &rarr;</div>
                            </div>
                        </div>
                    </Link>
                )}
            </div>

            {isAdmin && (
                <div className="mt-8">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">Последние действия</h2>
                    <div className="overflow-hidden rounded-lg bg-white shadow border border-gray-100">
                        <ul role="list" className="divide-y divide-gray-200">
                            {recentTransactions.map((transaction) => (
                                <li key={transaction.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {transaction.product.name}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {transaction.user?.name || transaction.user?.username || 'Система'}
                                            </p>
                                        </div>
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {transaction.type === 'IN' ? '+' : '-'} {transaction.quantity}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(transaction.createdAt).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {recentTransactions.length === 0 && (
                                <li className="p-4 text-sm text-center text-gray-500">Нет операций за сегодня</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
