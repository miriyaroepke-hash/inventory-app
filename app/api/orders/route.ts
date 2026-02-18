
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
        const {
            clientName,
            clientPhone,
            clientCity,
            clientStreet,
            clientBuilding,
            clientFlat,
            clientNote,
            shippingMethod,
            sdekCityCode,
            items
        } = body;

        // Calculate total
        let totalAmount = 0;

        // Prepare items
        // We find all standard products first
        const productIds = items.filter((i: any) => i.productId).map((i: any) => i.productId);
        const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

        const validItems = items.map((item: any) => {
            if (item.productId) {
                const product = products.find(p => p.id === item.productId);
                if (!product) throw new Error(`Product ${item.productId} not found`);

                const lineTotal = product.price * item.quantity;
                totalAmount += lineTotal;

                // Deduct stock
                // Note: This should be a transaction but for simplicity we do it here or let trigger handle it?
                // We'll update product quantity manually here.
                // await prisma.product.update(...) - We can do this in a $transaction ideally.

                return {
                    productId: item.productId,
                    name: product.name,
                    sku: product.sku,
                    size: product.size,
                    image: product.image,
                    quantity: item.quantity,
                    price: product.price // Snapshot price
                };
            } else {
                // Custom Item
                const lineTotal = item.price * item.quantity;
                totalAmount += lineTotal;

                return {
                    name: item.name,
                    sku: 'CUSTOM',
                    size: item.size,
                    image: item.image, // Base64
                    quantity: item.quantity,
                    price: item.price
                };
            }
        });

        // Use interactive transaction to ensure stock is deducted
        const order = await prisma.$transaction(async (tx) => {
            // Deduct stock for standard items
            for (const item of validItems) {
                if (item.productId) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { quantity: { decrement: item.quantity } }
                    });
                }
            }

            return await tx.order.create({
                data: {
                    clientName,
                    clientPhone,
                    clientCity,
                    clientStreet,
                    clientBuilding,
                    clientFlat,
                    clientNote,
                    shippingMethod,
                    sdekCityCode,
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
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Failed to create order', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
