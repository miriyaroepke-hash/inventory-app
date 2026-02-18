
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const email = 'miriya.roepke@gmail.com';
        const user = await prisma.user.update({
            where: { username: email },
            data: { role: 'ADMIN' },
        });
        return NextResponse.json({
            message: `User ${user.username} promoted to ADMIN successfully.`,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to promote user. User might not exist.' }, { status: 500 });
    }
}
