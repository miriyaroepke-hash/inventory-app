import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { productId, type, quantity } = body; // type: IN, OUT

        if (!['IN', 'OUT'].includes(type)) {
            return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
        }

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
        }

        // Start a transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const product = await tx.product.findUnique({
                where: { id: productId },
            });

            if (!product) {
                throw new Error('Product not found');
            }

            let newQuantity = product.quantity;
            if (type === 'IN') {
                newQuantity += qty;
            } else if (type === 'OUT') {
                if (product.quantity < qty) {
                    throw new Error('Insufficient stock');
                }
                newQuantity -= qty;
            }

            // Create transaction record
            const transaction = await tx.transaction.create({
                data: {
                    type,
                    quantity: qty,
                    productId,
                    userId: session.user.id,
                },
            });

            // Update product quantity
            await tx.product.update({
                where: { id: productId },
                data: { quantity: newQuantity },
            });

            return transaction;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        if (error.message === 'Insufficient stock') {
            return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 });
    }
}
