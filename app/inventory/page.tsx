'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    size: string | null;
    image: string | null;
    quantity: number;
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);

    useEffect(() => {
        // Check URL for search param
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const search = params.get('search');
            if (search) {
                setSearchTerm(search);
            }
        }
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            // Sort by createdAt desc by default
            const sortedData = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setProducts(sortedData);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
        const sorted = [...products].sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return newOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        setProducts(sorted);
    };

    const toggleSelectAll = () => {
        if (selectedProducts.size === products.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(products.map(p => p.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedProducts(newSelected);
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
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
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const handleCheckout = async () => {
        if (!confirm('Подтвердить продажу?')) return;

        try {
            for (const item of cart) {
                const res = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId: item.product.id,
                        type: 'OUT',
                        quantity: item.quantity
                    })
                });

                if (!res.ok) {
                    const error = await res.json();
                    alert(`Ошибка при продаже ${item.product.name}: ${error.error}`);
                }
            }
            setCart([]);
            fetchProducts();
            alert('Продажа успешно оформлена!');
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Произошла ошибка при оформлении продажи');
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const deleteProduct = async (id: string) => {
        if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            fetchProducts();
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Удалить выбранные товары (${selectedProducts.size})?`)) return;

        try {
            for (const id of Array.from(selectedProducts)) {
                await fetch(`/api/products/${id}`, { method: 'DELETE' });
            }
            setSelectedProducts(new Set());
            fetchProducts();
        } catch (error) {
            alert('Ошибка при удалении');
        }
    };

    const handleExportExcel = async () => {
        const XLSX = (await import('xlsx'));
        const productsToExport = products.filter(p => selectedProducts.has(p.id));
        if (productsToExport.length === 0) return alert('Выберите товары для экспорта');

        const ws = XLSX.utils.json_to_sheet(productsToExport.map(p => ({
            Name: p.name,
            SKU: p.sku,
            Price: p.price,
            Size: p.size,
            Quantity: p.quantity,
            StockValue: p.price * p.quantity
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventory");
        XLSX.writeFile(wb, "inventory_export.xlsx");
    };

    const handlePrintLabels = async () => {
        const { jsPDF } = await import('jspdf');
        const productsToPrint = products.filter(p => selectedProducts.has(p.id));
        if (productsToPrint.length === 0) return alert('Выберите товары для печати ценников');

        // 42mm x 25mm label size
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [42, 25]
        });

        productsToPrint.forEach((product, index) => {
            if (index > 0) doc.addPage();

            doc.setFontSize(8);
            doc.text(product.name.substring(0, 20), 2, 4); // Product Name

            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(`${product.size ? `Размер: ${product.size}` : ''}`, 2, 9); // Size

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(`${product.sku}`, 2, 14); // SKU Text

            doc.text(`₸${product.price}`, 25, 9);
        });

        doc.save("labels.pdf");
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* Cart Summary Panel */}
            {cart.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-10 shadow-md">
                    <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-indigo-900">Чек: {cart.length} поз.</span>
                        <span className="text-xl font-bold text-indigo-600">₸{cartTotal}</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto max-w-xl">
                        {cart.map((item) => (
                            <div key={item.product.id} className="bg-white px-2 py-1 rounded border border-indigo-100 flex items-center gap-2 text-sm whitespace-nowrap">
                                <span>{item.product.name} ({item.product.size})</span>
                                <span className="bg-indigo-100 text-indigo-800 px-1.5 rounded-full text-xs">{item.quantity}</span>
                                <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="bg-green-600 text-white px-6 py-2 rounded-md font-bold hover:bg-green-700 shadow-sm whitespace-nowrap"
                    >
                        Продать (Списать)
                    </button>
                </div>
            )}

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Склад</h1>
                <div className="flex flex-wrap gap-3">
                    {selectedProducts.size > 0 ? (
                        <>
                            <button onClick={handleBulkDelete} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                                <Trash2 className="-ml-1 mr-2 h-5 w-5" /> Удалить ({selectedProducts.size})
                            </button>
                            <button onClick={handleExportExcel} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Excel
                            </button>
                            <button onClick={handlePrintLabels} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Печать (PDF)
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/inventory/add" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="-ml-1 mr-2 h-5 w-5" /> Добавить товар
                            </Link>
                            <Link href="/inventory/line" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700">
                                <Plus className="-ml-1 mr-2 h-5 w-5" /> Добавить линейку
                            </Link>
                            <Link href="/inventory/bulk" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Импорт (CSV)
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Поиск по названию или артикулу..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

            {loading ? (
                <div className="text-center py-10">Загрузка...</div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.size === products.length && products.length > 0}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={handleSort}>
                                    Товар {sortOrder === 'asc' ? '↑' : '↓'}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Артикул</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Остаток</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Действия</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className={selectedProducts.has(product.id) ? 'bg-indigo-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.has(product.id)}
                                            onChange={() => toggleSelect(product.id)}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {product.image ? (
                                                    <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">No Img</div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.size}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₸{product.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.quantity < 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {product.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="text-green-600 hover:text-green-900 font-medium px-2 py-1 border border-green-200 rounded hover:bg-green-50 text-xs"
                                        >
                                            + В чек
                                        </button>
                                        <Link href={`/inventory/${product.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                                            <Edit className="h-4 w-4 inline" />
                                        </Link>
                                        <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-4 w-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-6 text-gray-500">Товары не найдены</div>
                    )}
                </div>
            )}
        </div>
    );
}
