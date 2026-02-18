
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hash } from 'bcryptjs';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
        select: { id: true, username: true, name: true, role: true, createdAt: true }
    });
    return NextResponse.json(users);
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Simple admin check or self-update check could go here. 
    // For now assuming any logged in user can update (or we trust the admin/users).

    const body = await request.json();
    const { id, name, password } = body;

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (password) {
        data.password = await hash(password, 12);
    }

    try {
        const updated = await prisma.user.update({
            where: { id },
            data,
            select: { id: true, username: true, name: true, role: true }
        });
        return NextResponse.json(updated);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
