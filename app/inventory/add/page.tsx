import ProductForm from '@/components/ProductForm';

export default function AddProductPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Добавить новый товар</h1>
            <ProductForm />
        </div>
    );
}
