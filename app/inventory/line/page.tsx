import ProductLineForm from '@/components/ProductLineForm';

export default function AddProductLinePage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Добавить линейку товаров</h1>
            <ProductLineForm />
        </div>
    );
}
