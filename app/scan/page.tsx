'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Loader2, ArrowRight, MinusCircle, PlusCircle } from 'lucide-react';

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

    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Initialize scanner
        // Use a unique ID for the scanner element
        const scannerId = "reader";

        // Cleanup previous instance if any (though useEffect with [] runs once)

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
            }
        }
    }, []);

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
        // Optional: Stop scanning after success
        // if (scannerRef.current) {
        //   scannerRef.current.clear();
        //   scannerRef.current = null;
        // }
    };

    const onScanFailure = (error: any) => {
        // handle scan failure, usually better to ignore to avoid noise
    };

    const handleSearch = async (skuToSearch: string = sku) => {
        if (!skuToSearch) return;
        setLoading(true);
        setError('');
        setProduct(null);
        setSuccess('');

        try {
            // We need to fetch all products and filter by SKU because our API doesn't support searching by SKU directly in GET /api/products yet locally?
            // Wait, GET /api/products returns all. We can filter on client for now or implement a specific search endpoint.
            // Better: filter on client since we probably don't have millions of products yet.
            // Ideally: GET /api/products?sku=...

            // Let's optimize: fetch all once or fetch specific?
            // Since current API returns all, let's just fetch all and find. 
            // Optimization: Add search param to API later.

            const res = await fetch('/api/products');
            const products: Product[] = await res.json();
            const found = products.find(p => p.sku === skuToSearch);

            if (found) {
                setProduct(found);
            } else {
                setError('Product not found');
            }
        } catch (err) {
            setError('Failed to fetch product');
        } finally {
            setLoading(false);
        }
    };

    const handleTransaction = async (type: 'IN' | 'OUT', qty: number = 1) => {
        if (!product) return;
        setLoading(true);
        setError('');

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
                throw new Error(data.error || 'Transaction failed');
            }

            setSuccess(`Successfully ${type === 'IN' ? 'added' : 'sold'} ${qty} item(s)`);
            // Update local product state
            setProduct(prev => prev ? ({
                ...prev,
                quantity: type === 'IN' ? prev.quantity + qty : prev.quantity - qty
            }) : null);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-center">Scan & Transaction</h1>

            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <div id="reader" className="w-full"></div>
                {!scannerRef.current && (
                    <button
                        onClick={startScanner}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Start Camera Scanner
                    </button>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Enter SKU / Barcode</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            className="block w-full rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="Scan or type..."
                        />
                        <button
                            type="button"
                            onClick={() => handleSearch()}
                            className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                        >
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}
                {success && <div className="text-green-500 text-sm">{success}</div>}
                {loading && <div className="text-gray-500 text-sm">Processing...</div>}

                {product && (
                    <div className="border-t pt-4 mt-4">
                        <div className="flex items-center space-x-4 mb-4">
                            {product.image && (
                                <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                            )}
                            <div>
                                <h3 className="text-lg font-medium">{product.name}</h3>
                                <p className="text-gray-500">Stock: {product.quantity}</p>
                                <p className="text-gray-500">${product.price}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleTransaction('OUT')}
                                className="flex flex-col items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 text-red-700"
                            >
                                <MinusCircle className="h-8 w-8 mb-2" />
                                <span className="font-bold">SELL (1)</span>
                            </button>
                            <button
                                onClick={() => handleTransaction('IN')}
                                className="flex flex-col items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 text-green-700"
                            >
                                <PlusCircle className="h-8 w-8 mb-2" />
                                <span className="font-bold">RESTOCK (1)</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
