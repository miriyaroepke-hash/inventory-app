'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Truck, PackageCheck, RefreshCw } from 'lucide-react';

interface Order {
    id: string;
    orderNumber: number; // Note: removed from schema for sqlite, using id or index for now visually? 
    // Actually we removed orderNumber field. We'll use ID slice or index.
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
                throw new Error(`Error: ${res.status}`);
            }

            const data = await res.json();

            if (Array.isArray(data)) {
                setOrders(data);
            } else {
                console.error('API did not return an array:', data);
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
        // Logic to call API -> get uuid -> update order
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
            <h1 className="text-2xl font-bold">Заказы (Debug Mode)</h1>
            <div className="bg-white p-4 rounded shadow">
                <p>Status: {loading ? 'Loading...' : 'Loaded'}</p>
                <p>Orders Count: {orders.length}</p>
                <Link href="/orders/new" className="text-blue-500 underline">Create New Order</Link>
            </div>

            <div className="space-y-2">
                {orders.map(order => (
                    <div key={order.id} className="p-4 bg-white border rounded">
                        <div>ID: {order.id}</div>
                        <div>Client: {order.clientName}</div>
                        <div>Total: {order.totalAmount}</div>
                        <div>Date: {order.createdAt}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
