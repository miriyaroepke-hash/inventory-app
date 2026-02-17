'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Barcode from 'react-barcode';

interface ProductFormProps {
    initialData?: {
        id: string;
        name: string;
        sku: string;
        price: number;
        size?: string | null;
        image?: string | null;
    };
}

export default function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        sku: initialData?.sku || '',
        price: initialData?.price || '',
        size: initialData?.size || '',
        image: initialData?.image || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = initialData
                ? `/api/products/${initialData.id}`
                : '/api/products';

            const method = initialData ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Something went wrong');
            }

            router.push('/inventory');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
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
                    <label className="block text-sm font-medium text-gray-700">Артикул / Штрихкод</label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            name="sku"
                            required
                            value={formData.sku}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                // Generate simple random barcode
                                const randomSku = Math.floor(Math.random() * 1000000000000).toString();
                                setFormData(prev => ({ ...prev, sku: randomSku }));
                            }}
                            className="mt-1 rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-300"
                        >
                            Сгенерировать
                        </button>
                    </div>
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

                <div>
                    <label className="block text-sm font-medium text-gray-700">Размер</label>
                    <input
                        type="text"
                        name="size"
                        value={formData.size}
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
            </div>

            {formData.sku && (
                <div className="mt-4 flex justify-center p-4 border border-dashed border-gray-300 rounded">
                    <Barcode value={formData.sku} width={1.5} height={50} fontSize={14} />
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (initialData ? 'Обновить товар' : 'Создать товар')}
                </button>
            </div>
        </form>
    );
}
