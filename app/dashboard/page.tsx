import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Package, Activity } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    const isAdmin = session.user.role === 'ADMIN';

    // Fetch stats
    // We only need product count for everyone
    // Recent transactions only for admin
    const productCount = await prisma.product.count();

    let recentTransactions: any[] = [];
    if (isAdmin) {
        recentTransactions = await prisma.transaction.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { product: true, user: true },
        });
    }

    const stats = [
        {
            name: 'Всего товаров',
            value: productCount,
            icon: Package,
            color: 'bg-blue-500',
            href: '/inventory',
            adminOnly: false
        },
        {
            name: 'Последние операции',
            value: isAdmin ? `${recentTransactions.length} (Показать)` : 'Скрыто',
            icon: Activity,
            color: 'bg-purple-500',
            href: '/sales',
            adminOnly: true
        },
    ];

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-gray-900">Главная</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    if (stat.adminOnly && !isAdmin) return null;

                    return (
                        <Link
                            key={stat.name}
                            href={stat.href || '#'}
                            className={clsx(
                                "overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer block"
                            )}
                        >
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <stat.icon className={`h-6 w-6 text-white rounded-full p-1 ${stat.color}`} aria-hidden="true" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {isAdmin && (
                <div className="mt-8">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">История последних операций</h2>
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <ul role="list" className="divide-y divide-gray-200">
                            {recentTransactions.map((transaction) => (
                                <li key={transaction.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {transaction.product.name}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {transaction.user?.name || transaction.user?.username || 'Неизвестный'}
                                            </p>
                                        </div>
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {transaction.type === 'IN' ? 'ПОПОЛНЕНИЕ' : 'ПРОДАЖА'} {transaction.quantity}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(transaction.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {recentTransactions.length === 0 && (
                                <li className="p-4 text-sm text-center text-gray-500">Нет последних операций</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
