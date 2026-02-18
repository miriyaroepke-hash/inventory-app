import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getKaspiOrders, getOrderEntries } from '@/lib/kaspi';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Fetch NEW orders from Kaspi
        const kaspiOrders = await getKaspiOrders('TODAY'); // or WEEK

        let importedCount = 0;
        let errors = [];

        for (const kOrder of kaspiOrders) {
            // Check if exists
            const existing = await prisma.order.findUnique({
                where: { externalId: kOrder.id }
            });

            if (existing) continue;

            // Fetch entries if missing
            let entries = kOrder.entries;
            if (!entries || entries.length === 0) {
                // Try fetching entries separately only if needed, 
                // but implementation of getOrderEntries needs Kaspi API support.
                // Assuming getKaspiOrders returns basic info, we might need detail fetch.
                // For now, let's assume entries are included or we skip.
            }

            // Create Order
            // Map status
            const statusMap: any = {
                'NEW': 'PENDING',
                'SIGN_REQUIRED': 'PROCESSING',
                'PICKUP': 'PROCESSING',
                'DELIVERY': 'SHIPPED',
                'COMPLETED': 'DELIVERED',
                'CANCELLED': 'CANCELLED'
            };

            const dbStatus = statusMap[kOrder.state] || 'PENDING';

            // Prepare Items
            // We need to match SKU
            const orderItemsData = [];

            // Mocking entries loop because the generic client might be empty
            // In real integration we need "entries" from Kaspi.
            // If Kaspi API v2 /orders doesnt return entries, we need loop fetch.
            // Let's assume we do the loop fetch for safety.
            const kEntries = await getOrderEntries(kOrder.id);

            if (kEntries.length === 0) {
                errors.push(`Order ${kOrder.code} has no items.`);
                continue;
            }

            for (const entry of kEntries) {
                const sku = entry.product.code;
                const qty = entry.quantity;

                // Find Product
                const product = await prisma.product.findUnique({ where: { sku } });

                if (product) {
                    orderItemsData.push({
                        productId: product.id,
                        name: product.name,
                        sku: product.sku,
                        price: entry.basePrice,
                        quantity: qty,
                        size: product.size // We hope SKU matches exact size variant
                    });

                    // DEDUCT STOCK
                    await prisma.product.update({
                        where: { id: product.id },
                        data: { quantity: { decrement: qty } }
                    });

                    // Log Transaction
                    await prisma.transaction.create({
                        data: {
                            type: 'OUT',
                            quantity: qty,
                            productId: product.id,
                            userId: session.user.id
                        }
                    });

                } else {
                    // Product not found in our DB
                    orderItemsData.push({
                        name: entry.product.name || 'Unknown Kaspi Item',
                        sku: sku,
                        price: entry.basePrice,
                        quantity: qty,
                        size: null
                    });
                }
            }

            // Save Order
            await prisma.order.create({
                data: {
                    externalId: kOrder.id,
                    source: 'KASPI',
                    orderNumber: parseInt(kOrder.code) || undefined, // use Kaspi code if numeric, else auto
                    clientName: `${kOrder.user.firstName} ${kOrder.user.lastName}`,
                    clientPhone: kOrder.user.cellPhone,
                    shippingMethod: kOrder.deliveryMode,
                    status: dbStatus,
                    totalAmount: kOrder.totalPrice,
                    items: {
                        create: orderItemsData
                    }
                }
            });

            importedCount++;
        }

        return NextResponse.json({ imported: importedCount, errors });

    } catch (error: any) {
        console.error('Kaspi Sync Error', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
