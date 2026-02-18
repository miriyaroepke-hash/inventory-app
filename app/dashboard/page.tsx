import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Package, AlertTriangle, DollarSign, Activity } from 'lucide-react';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    // Fetch stats concurrently
    const [productCount, lowStockCount, totalValueResult, recentTransactions] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { quantity: { lt: 5 } } }),
        prisma.product.aggregate({
            _sum: {
                price: true, // This is just sum of prices, we ideally need sum(price * quantity) but Prisma aggregate doesn't support math like that easily without raw query.
                // For now, let's just fetch all products and calculate in JS for V1, or just show sum of prices if that's what was intended?
                // Let's do a raw query for total value or just iterate if dataset is small.
                // For "Total Value" usually means Inventory Value.
            }
        }),
        prisma.transaction.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { product: true, user: true },
        }),
    ]);

    // Calculate total inventory value properly
    const allProducts = await prisma.product.findMany({ select: { price: true, quantity: true } });
    const totalValue = allProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0);


    const stats = [
        { name: 'Total Products', value: productCount, icon: Package, color: 'bg-blue-500' },
        { name: 'Low Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: 'bg-red-500' },
        { name: 'Стоимость склада', value: `₸${totalValue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-500' },
        { name: 'Recent Activity', value: `${recentTransactions.length} txns`, icon: Activity, color: 'bg-purple-500' },
    ];

    return (
        <div>
            <h1 className="mb-6 text-2xl font-bold text-black">Dashboard</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="overflow-hidden rounded-lg bg-white shadow-sm">
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
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Recent Transactions</h2>
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
                                            {transaction.user?.name || transaction.user?.username || 'Unknown User'}
                                        </p>
                                    </div>
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {transaction.type} {transaction.quantity}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(transaction.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </li>
                        ))}
                        {recentTransactions.length === 0 && (
                            <li className="p-4 text-sm text-center text-gray-500">No recent transactions</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
