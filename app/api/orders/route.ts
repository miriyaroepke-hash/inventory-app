
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    // Add more filters if needed

    try {
        const whereClause: any = {};
        if (status && status !== 'ALL') {
            whereClause.status = status;
        }

        const orders = await prisma.order.findMany({
            where: whereClause,
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Failed to fetch orders', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { clientName, clientPhone, clientAddress, clientNote, shippingMethod, items } = body;

        // Calculate total
        let totalAmount = 0;

        // Verify items and calculate total
        // Note: In a real app we should fetch fresh prices from DB to avoid client-side manipulation.
        // For now trusting client or we can fetch. Let's fetch to be safe.
        const productIds = items.map((i: any) => i.productId);
        const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

        const validItems = items.map((item: any) => {
            const product = products.find(p => p.id === item.productId);
            if (!product) throw new Error(`Product ${item.productId} not found`);

            const lineTotal = product.price * item.quantity;
            totalAmount += lineTotal;

            return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price // Snapshot price
            };
        });

        const order = await prisma.order.create({
            data: {
                clientName,
                clientPhone,
                clientAddress,
                clientNote,
                shippingMethod,
                totalAmount,
                status: 'PENDING',
                items: {
                    create: validItems
                }
            },
            include: {
                items: true
            }
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Failed to create order', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
