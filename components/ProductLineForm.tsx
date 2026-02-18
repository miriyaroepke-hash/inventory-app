'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const SIZES = ['42', '44', '46', '48', '50', '52', '54'];

export default function ProductLineForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        image: '',
    });

    const [quantities, setQuantities] = useState<Record<string, number>>(
        SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuantityChange = (size: string, value: string) => {
        const qty = parseInt(value) || 0;
        setQuantities((prev) => ({ ...prev, [size]: qty }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const productsToCreate = SIZES.filter(size => quantities[size] > 0);

            if (productsToCreate.length === 0) {
                setError('Введите количество хотя бы для одного размера');
                setLoading(false);
                return;
            }

            let createdCount = 0;

            for (const size of productsToCreate) {
                const sku = Math.floor(Math.random() * 1000000000000).toString(); // Generate random SKU

                const res = await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        price: parseFloat(formData.price),
                        image: formData.image,
                        size: size,
                        quantity: quantities[size],
                        sku: sku
                    }),
                });

                if (!res.ok) {
                    console.error(`Failed to create product size ${size}`);
                    // Continue trying others or stop? Let's continue but warn.
                } else {
                    createdCount++;
                }
            }

            if (createdCount > 0) {
                setSuccess(`Успешно создано ${createdCount} товаров!`);
                setTimeout(() => {
                    router.push('/inventory');
                    router.refresh();
                }, 1500);
            } else {
                setError('Не удалось создать товары. Попробуйте снова.');
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            {error && <div className="bg-red-50 text-red-500 p-3 rounded text-sm">{error}</div>}
            {success && <div className="bg-green-50 text-green-500 p-3 rounded text-sm">{success}</div>}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Название товара</label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Цена</label>
                    <input
                        type="number"
                        name="price"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Фото товара (Загрузить)</label>
                    <div className="mt-1 flex items-center space-x-4">
                        {formData.image && (
                            <div className="relative h-20 w-20">
                                <img src={formData.image} alt="Preview" className="h-20 w-20 rounded object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                                >
                                    X
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    if (file.size > 4 * 1024 * 1024) {
                                        alert("Файл слишком большой (макс 4MB)");
                                        return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                        const img = new Image();
                                        img.onload = () => {
                                            const canvas = document.createElement('canvas');
                                            let width = img.width;
                                            let height = img.height;
                                            const MAX_WIDTH = 800;
                                            const MAX_HEIGHT = 800;

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
                                            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                                            setFormData(prev => ({ ...prev, image: dataUrl }));
                                        };
                                        img.src = ev.target?.result as string;
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                        />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Размеры и Количество</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {SIZES.map((size) => (
                            <div key={size} className="flex flex-col">
                                <label className="text-xs text-gray-500 mb-1">Размер {size}</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={quantities[size] || ''}
                                    onChange={(e) => handleQuantityChange(size, e.target.value)}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 text-center"
                                />
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">* Оставьте 0, если товара этого размера нет.</p>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Создать линейку товаров'}
                </button>
            </div>
        </form>
    );
}
