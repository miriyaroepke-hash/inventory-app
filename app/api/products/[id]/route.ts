import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define params type for Next.js 15+ / 14 async params
type Props = {
    params: Promise<{ id: string }>
}

export async function GET(request: Request, props: Props) {
    const params = await props.params;
    try {
        const product = await prisma.product.findUnique({
            where: { id: params.id },
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}

export async function PUT(request: Request, props: Props) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, size, price, image } = body;

        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                name,
                size,
                price: parseFloat(price),
                image,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: Props) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await prisma.product.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Product deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
