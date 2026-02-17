import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 12);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'USER'
            },
        });

        return NextResponse.json({ message: 'User created' }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
