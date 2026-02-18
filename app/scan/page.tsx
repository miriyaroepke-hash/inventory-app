'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Loader2, ArrowRight, MinusCircle, PlusCircle, Search, X } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    size: string | null;
    image: string | null;
    quantity: number;
}

export default function ScanPage() {
    const [sku, setSku] = useState('');
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Search by name state
    const [nameSearch, setNameSearch] = useState('');
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [showResults, setShowResults] = useState(false);

    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Fetch all products for name search
        fetch('/api/products')
            .then(res => res.json())
            .then(data => setAllProducts(data))
            .catch(err => console.error('Failed to load products', err));

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
            }
        }
    }, []);

    // Filter products when nameSearch changes
    useEffect(() => {
        if (nameSearch.length > 1) {
            const results = allProducts.filter(p =>
                p.name.toLowerCase().includes(nameSearch.toLowerCase()) ||
                (p.size && p.size.includes(nameSearch))
            );
            setSearchResults(results);
            setShowResults(true);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    }, [nameSearch, allProducts]);

    const startScanner = () => {
        if (scannerRef.current) return;

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;
    }

    const onScanSuccess = (decodedText: string) => {
        setSku(decodedText);
        handleSearch(decodedText);
    };

    const onScanFailure = (error: any) => {
        // handle scan failure
    };

    const handleSearch = async (skuToSearch: string = sku) => {
        if (!skuToSearch) return;
        setLoading(true);
        setError('');
        setProduct(null);
        setSuccess('');
        setNameSearch(''); // Clear name search when searching by SKU
        setShowResults(false);

        try {
            // Find in local list first if available, else fetch (but we have allProducts)
            const found = allProducts.find(p => p.sku === skuToSearch);

            if (found) {
                setProduct(found);
            } else {
                // Fallback fetch if not in local list (rare)
                const res = await fetch('/api/products');
                const products: Product[] = await res.json();
                const foundRemote = products.find(p => p.sku === skuToSearch);

                if (foundRemote) {
                    setProduct(foundRemote);
                    setAllProducts(products); // Update local list
                } else {
                    setError('Товар не найден (Product not found)');
                }
            }
        } catch (err) {
            setError('Ошибка поиска (Failed to fetch)');
        } finally {
            setLoading(false);
        }
    };

    const selectProduct = (p: Product) => {
        setProduct(p);
        setSku(p.sku);
        setNameSearch('');
        setShowResults(false);
        setError('');
        setSuccess('');
    };

    const handleTransaction = async (type: 'IN' | 'OUT', qty: number = 1) => {
        if (!product) return;
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    type,
                    quantity: qty
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Ошибка транзакции');
            }

            setSuccess(`Успешно: ${type === 'IN' ? 'Пополнено' : 'Продано'} ${qty} шт.`);

            // Update local product state
            const newQty = type === 'IN' ? product.quantity + qty : product.quantity - qty;

            setProduct({ ...product, quantity: newQty });

            // Update in allProducts list too
            setAllProducts(prev => prev.map(p => p.id === product.id ? { ...p, quantity: newQty } : p));

        } catch (err: any) {
            setError(err.message === 'Insufficient stock' ? 'Недостаточно товара на складе' : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-center text-gray-900">Инвентаризация (Сканер)</h1>

            {/* Camera Scanner */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
                <div id="reader" className="w-full overflow-hidden rounded-lg"></div>
                {!scannerRef.current && (
                    <button
                        onClick={startScanner}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        Сканировать камерой
                    </button>
                )}
            </div>

            {/* Manual Search Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">

                {/* SKU search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Поиск по Штрихкоду / Артикулу</label>
                    <div className="flex rounded-md shadow-sm">
                        <input
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            className="block w-full rounded-l-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                            placeholder="Сканируйте или введите..."
                        />
                        <button
                            type="button"
                            onClick={() => handleSearch()}
                            className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
                        >
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">ИЛИ</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Name Search */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Поиск по Названию</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={nameSearch}
                            onChange={(e) => setNameSearch(e.target.value)}
                            className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Введите название товара..."
                        />
                        {nameSearch && (
                            <button
                                onClick={() => { setNameSearch(''); setShowResults(false); }}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                            {searchResults.length === 0 ? (
                                <div className="cursor-default select-none relative py-2 px-4 text-gray-700">
                                    Ничего не найдено
                                </div>
                            ) : (
                                searchResults.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => selectProduct(p)}
                                        className="cursor-pointer select-none relative py-2 px-4 hover:bg-indigo-50 border-b border-gray-100 last:border-0"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium block truncate text-gray-900">{p.name}</span>
                                            <span className="text-xs text-gray-500">Ост: {p.quantity}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                                            <span>{p.sku}</span>
                                            {p.size && <span>Р: {p.size}</span>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Feedback Messages */}
                {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
                {success && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm font-medium">{success}</div>}
                {loading && <div className="flex items-center justify-center p-4 text-gray-500 text-sm"><Loader2 className="animate-spin mr-2 h-4 w-4" /> Обработка...</div>}

                {/* Selected Product Card */}
                {product && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden mt-6">
                        <div className="bg-gray-50 p-4 flex items-center space-x-4 border-b border-gray-200">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="h-16 w-16 object-cover rounded-md shadow-sm bg-white" />
                            ) : (
                                <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">Нет фото</div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                                <div className="text-sm text-gray-600 mt-1">Остаток: <span className="font-semibold text-gray-900">{product.quantity} шт.</span></div>
                                <div className="text-sm text-gray-600">Цена: <span className="font-semibold text-gray-900">₸{product.price}</span></div>
                                {product.size && <div className="text-xs text-gray-500 mt-1 bg-gray-200 inline-block px-1.5 py-0.5 rounded">Размер: {product.size}</div>}
                            </div>
                        </div>

                        <div className="p-4 grid grid-cols-2 gap-4 bg-white">
                            <button
                                onClick={() => handleTransaction('OUT')}
                                className="flex flex-col items-center justify-center p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 text-red-700 transition duration-150 ease-in-out group"
                            >
                                <MinusCircle className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold">ПРОДАТЬ (1)</span>
                            </button>
                            <button
                                onClick={() => handleTransaction('IN')}
                                className="flex flex-col items-center justify-center p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 text-green-700 transition duration-150 ease-in-out group"
                            >
                                <PlusCircle className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold">ПОПОЛНИТЬ (1)</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
