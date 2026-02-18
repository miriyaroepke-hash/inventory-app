
import { NextResponse } from 'next/server';
import { searchCdekCities } from '@/lib/cdek';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 3) return NextResponse.json([]);

    try {
        const cities = await searchCdekCities(q);
        return NextResponse.json(cities);
    } catch (error) {
        console.error('CDEK City Search Error:', error);
        return NextResponse.json({ error: 'Failed to search cities' }, { status: 500 });
    }
}
