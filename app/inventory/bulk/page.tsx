'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function BulkImportPage() {
    const [data, setData] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleImport = async () => {
        if (!data) return;
        setLoading(true);
        setError('');
        setSuccess('');

        // Parse CSV-like data
        // Format: Name, Price, Size, Image
        // SKU generated automatically if not provided (not supported in this simple parser yet, lets auto-generate in API if missing? API expects SKU)
        // Let's assume user provides: Name, Price, Size

        const lines = data.split('\n').filter(line => line.trim() !== '');
        let successCount = 0;
        let failCount = 0;

        for (const line of lines) {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length < 2) {
                failCount++;
                continue;
            }

            const [name, priceStr, size, image] = parts;
            const price = parseFloat(priceStr);

            if (isNaN(price)) {
                failCount++;
                continue;
            }

            const randomSku = Math.floor(Math.random() * 1000000000000).toString();

            try {
                const res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        price,
                        size: size || null,
                        image: image || null,
                        sku: randomSku
                    }),
                });

                if (res.ok) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (err) {
                failCount++;
            }
        }

        setLoading(false);
        setSuccess(`Imported: ${successCount}, Failed: ${failCount}`);
        if (successCount > 0) {
            router.refresh();
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Bulk Import Products</h1>

            <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-sm text-gray-500 mb-4">
                    Enter products one per line. Format:<br />
                    <code>Name, Price, Size (optional), Image URL (optional)</code><br />
                    Example:<br />
                    <code>Blue T-Shirt, 19.99, L, https://example.com/blue.jpg</code>
                </p>

                <textarea
                    rows={10}
                    className="w-full rounded-md border border-gray-300 p-3 mb-4 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Product Name, 10.99, M"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                />

                {error && <div className="text-red-500 mb-4">{error}</div>}
                {success && <div className="text-green-500 mb-4">{success}</div>}

                <button
                    onClick={handleImport}
                    disabled={loading || !data}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Import Products'}
                </button>
            </div>
        </div>
    );
}
