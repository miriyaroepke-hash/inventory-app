'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Truck, PackageCheck, RefreshCw } from 'lucide-react';

interface Order {
    id: string;
    clientName: string;
    status: string;
    shippingMethod: string;
    totalAmount: number;
    createdAt: string;
    sdekStatus: string | null;
    items: any[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const url = statusFilter === 'ALL' ? '/api/orders' : `/api/orders?status=${statusFilter}`;
            const res = await fetch(url);

            if (!res.ok) {
                // If the table doesn't exist yet or API fails, we shouldn't crash
                throw new Error(`Error: ${res.status}`);
            }

            const data = await res.json();

            if (Array.isArray(data)) {
                setOrders(data);
            } else {
                console.warn('API returned non-array:', data);
                setOrders([]);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWaybill = (order: Order) => {
        if (order.shippingMethod !== 'SDEK') return alert('Накладные создаются только для СДЭК');
        alert(`Создание накладной СДЭК для заказа ${order.clientName}...\n\n(Здесь будет интеграция с API СДЭК)\nЛогин: IM25726`);
    };

    const handleSyncStatus = (order: Order) => {
        alert(`Обновление статуса СДЭК для заказа ${order.clientName}...\n\n(Запрос статуса по UUID)`);
    };

    const filteredOrders = orders.filter(order =>
        order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
                <Link href="/orders/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="-ml-1 mr-2 h-5 w-5" /> Новый заказ
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Поиск по клиенту или ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="ALL">Все статусы</option>
                        <option value="PENDING">Ожидает</option>
                        <option value="PROCESSING">В обработке</option>
                        <option value="SHIPPED">Отправлен</option>
                        <option value="DELIVERED">Доставлен</option>
                        <option value="CANCELLED">Отменен</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Загрузка заказов...</div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Заказ / Дата</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Клиент</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Доставка</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-indigo-600">#{order.id.slice(-6)}</div>
                                        <div className="text-sm text-gray-500">
                                            <span suppressHydrationWarning>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{order.clientName}</div>
                                        <div className="text-sm text-gray-500">{order.items.length} товаров</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {order.shippingMethod}
                                        </span>
                                        {order.sdekStatus && (
                                            <div className="text-xs text-gray-500 mt-1">SDEK: {order.sdekStatus}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'SHIPPED' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₸{order.totalAmount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {order.shippingMethod === 'SDEK' && (
                                            <>
                                                <button onClick={() => handleCreateWaybill(order)} className="text-indigo-600 hover:text-indigo-900" title="Создать накладную">
                                                    <PackageCheck className="h-5 w-5" />
                                                </button>
                                                <button onClick={() => handleSyncStatus(order)} className="text-green-600 hover:text-green-900" title="Обновить статус">
                                                    <RefreshCw className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredOrders.length === 0 && (
                        <div className="text-center py-10 text-gray-500">Заказов пока нет</div>
                    )}
                </div>
            )}
        </div>
    );
}
