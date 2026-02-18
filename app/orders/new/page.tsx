'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    size: string | null;
    quantity: number;
}

export default function NewOrderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [clientNote, setClientNote] = useState('');
    const [shippingMethod, setShippingMethod] = useState('SDEK');

    // Order Items
    const [orderItems, setOrderItems] = useState<{ product: Product; quantity: number }[]>([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        }
    };

    const addToOrder = (product: Product) => {
        setOrderItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        setSearchTerm(''); // Clear search after adding
    };

    const removeFromOrder = (productId: string) => {
        setOrderItems(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setOrderItems(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                // Optional: Check max stock
                if (newQty > item.product.quantity) {
                    alert(`Максимальный остаток: ${item.product.quantity}`);
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (orderItems.length === 0) return alert('Добавьте товары в заказ');
        if (!clientName) return alert('Введите имя клиента');

        setLoading(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName,
                    clientPhone,
                    clientAddress,
                    clientNote,
                    shippingMethod,
                    items: orderItems.map(item => ({
                        productId: item.product.id,
                        quantity: item.quantity
                    }))
                })
            });

            if (!res.ok) throw new Error('Failed to create order');

            router.push('/orders');
        } catch (error) {
            console.error(error);
            alert('Ошибка при создании заказа');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.includes(searchTerm)) &&
        p.quantity > 0
    ).slice(0, 5); // Limit suggestions

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/orders" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Новый заказ</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Info */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Клиент</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Имя *</label>
                        <input type="text" required value={clientName} onChange={e => setClientName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Телефон</label>
                        <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Адрес</label>
                        <textarea value={clientAddress} onChange={e => setClientAddress(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3}></textarea>
                    </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Доставка</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Способ доставки</label>
                        <select value={shippingMethod} onChange={e => setShippingMethod(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                            <option value="SDEK">СДЭК</option>
                            <option value="YANDEX">Яндекс Доставка</option>
                            <option value="POST">Почта</option>
                            <option value="ALMATY_COURIER">Алматы Курьер</option>
                            <option value="RIKA_INDRIVE">Рика / InDrive</option>
                            <option value="PICKUP">Самовывоз</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Комментарий</label>
                        <textarea value={clientNote} onChange={e => setClientNote(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows={3}></textarea>
                    </div>
                </div>

                {/* Products */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Товары</h2>

                    {/* Product Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Поиск товара по названию или артикулу..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {/* Suggestions Dropdown */}
                        {searchTerm && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => addToOrder(product)}
                                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 flex justify-between"
                                    >
                                        <div>
                                            <span className="font-medium block truncate">{product.name}</span>
                                            <span className="text-gray-500 text-xs">{product.sku} | {product.size}</span>
                                        </div>
                                        <div className="text-gray-900 font-bold">₸{product.price}</div>
                                    </div>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-700">Не найдено</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Order Items Table */}
                    {orderItems.length > 0 ? (
                        <div className="border rounded-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Товар</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Кол-во</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Сумма</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Del</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orderItems.map((item) => (
                                        <tr key={item.product.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.product.name} ({item.product.size})
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button type="button" onClick={() => updateQuantity(item.product.id, -1)} className="px-2 border rounded">-</button>
                                                    <span>{item.quantity}</span>
                                                    <button type="button" onClick={() => updateQuantity(item.product.id, 1)} className="px-2 border rounded">+</button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                ₸{item.product.price * item.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button type="button" onClick={() => removeFromOrder(item.product.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold">
                                        <td colSpan={2} className="px-6 py-4 text-right text-gray-900">Итого:</td>
                                        <td className="px-6 py-4 text-right text-indigo-600">₸{totalAmount}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded-lg">
                            Выберите товары для добавления в заказ
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Создание...' : 'Создать заказ'}
                    </button>
                </div>
            </form>
        </div>
    );
}
