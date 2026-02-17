import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { updatedAt: 'desc' },
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, size, price, sku, image, quantity } = body;

        // Check if SKU already exists
        const existingProduct = await prisma.product.findUnique({
            where: { sku },
        });

        if (existingProduct) {
            return NextResponse.json({ error: 'Product with this SKU already exists' }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                size,
                price: parseFloat(price),
                sku,
                image,
                quantity: quantity ? parseInt(quantity) : 0,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
