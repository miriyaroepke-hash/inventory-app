'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    size: string | null;
    quantity: number;
    image?: string | null;
}

interface OrderItem {
    productId?: string;
    name: string;
    size?: string | null;
    price: number;
    quantity: number;
    image?: string | null;
    product?: Product;
}

export default function NewOrderPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');

    // Detailed Address
    const [clientCity, setClientCity] = useState('');
    const [clientStreet, setClientStreet] = useState('');
    const [clientBuilding, setClientBuilding] = useState('');
    const [clientFlat, setClientFlat] = useState('');

    const [clientNote, setClientNote] = useState('');
    const [shippingMethod, setShippingMethod] = useState('SDEK');

    // Order Items
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    // Custom Item Modal
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customSize, setCustomSize] = useState('');
    const [customPrice, setCustomPrice] = useState('');
    const [customImage, setCustomImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                size: product.size,
                price: product.price,
                quantity: 1,
                product: product
            }];
        });
        setSearchTerm('');
    };

    const addCustomItem = () => {
        if (!customName || !customPrice) return alert('Заполните название и цену');
        setOrderItems(prev => [...prev, {
            name: customName,
            size: customSize,
            price: parseFloat(customPrice),
            quantity: 1,
            image: customImage
        }]);
        // Reset modal
        setCustomName('');
        setCustomSize('');
        setCustomPrice('');
        setCustomImage(null);
        setShowCustomModal(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Compress image
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Compress
                setCustomImage(dataUrl);
            };
        };
    };

    const removeFromOrder = (index: number) => {
        setOrderItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateQuantity = (index: number, delta: number) => {
        setOrderItems(prev => prev.map((item, i) => {
            if (i === index) {
                const newQty = Math.max(1, item.quantity + delta);
                if (item.product && newQty > item.product.quantity) {
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
                    clientCity,
                    clientStreet,
                    clientBuilding,
                    clientFlat,
                    clientNote,
                    shippingMethod,
                    items: orderItems
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
    ).slice(0, 5);

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/orders" className="text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Новый заказ</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Client Info */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4 md:col-span-1">
                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Клиент</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Имя *</label>
                        <input type="text" required value={clientName} onChange={e => setClientName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Телефон</label>
                        <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                </div>

                {/* Address Info */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4 md:col-span-1">
                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Адрес</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Город</label>
                        <input type="text" value={clientCity} onChange={e => setClientCity(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Улица</label>
                        <input type="text" value={clientStreet} onChange={e => setClientStreet(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Дом</label>
                            <input type="text" value={clientBuilding} onChange={e => setClientBuilding(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Кв/Оф</label>
                            <input type="text" value={clientFlat} onChange={e => setClientFlat(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-white p-6 rounded-lg shadow space-y-4 md:col-span-1">
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
                <div className="md:col-span-3 bg-white p-6 rounded-lg shadow space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h2 className="text-lg font-medium text-gray-900">Товары</h2>
                        <button type="button" onClick={() => setShowCustomModal(true)} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100">
                            + Временный товар
                        </button>
                    </div>

                    {/* Product Search */}
                    <div className="relative max-w-xl">
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
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Цена</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Сумма</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Del</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orderItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {item.image && (
                                                        <img src={item.image} alt="" className="h-8 w-8 rounded-full object-cover mr-3" />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.name} {item.productId ? '' : <span className="text-yellow-600 text-xs">(Временный)</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{item.size}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button type="button" onClick={() => updateQuantity(idx, -1)} className="px-2 border rounded">-</button>
                                                    <span>{item.quantity}</span>
                                                    <button type="button" onClick={() => updateQuantity(idx, 1)} className="px-2 border rounded">+</button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                ₸{item.price}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                ₸{item.price * item.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button type="button" onClick={() => removeFromOrder(idx)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold">
                                        <td colSpan={3} className="px-6 py-4 text-right text-gray-900">Итого:</td>
                                        <td className="px-6 py-4 text-right text-indigo-600">₸{totalAmount}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded-lg">
                            Выберите товары из поиска или добавьте временный
                        </div>
                    )}
                </div>

                <div className="md:col-span-3 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Создание...' : 'Создать заказ'}
                    </button>
                </div>
            </form>

            {/* Custom Item Modal */}
            {showCustomModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Временный товар</h3>
                            <button onClick={() => setShowCustomModal(false)}><X className="h-5 w-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Название *</label>
                                <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Цена *</label>
                                <input type="number" value={customPrice} onChange={e => setCustomPrice(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Размер</label>
                                <input type="text" value={customSize} onChange={e => setCustomSize(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Фото</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                {customImage && <img src={customImage} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />}
                            </div>
                            <button onClick={addCustomItem} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Добавить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
