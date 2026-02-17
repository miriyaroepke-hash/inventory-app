import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/ProductForm';

// Define params type for Next.js 15+ / 14 async params
type Props = {
    params: Promise<{ id: string }>
}

export default async function EditProductPage(props: Props) {
    const params = await props.params;
    const product = await prisma.product.findUnique({
        where: { id: params.id },
    });

    if (!product) {
        notFound();
    }

    // Convert Decimal/Date to plain objects if needed, but Prisma result is usually fine for Client Components
    // except Dates need to be serializable if passed directly to client component in some setups.
    // Next.js App Router handles serialization better, but let's be safe if issues arise.
    // For now, passing directly.

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
            <ProductForm initialData={product} />
        </div>
    );
}
