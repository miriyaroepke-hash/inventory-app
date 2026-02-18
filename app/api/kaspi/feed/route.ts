import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch all products with positive price
        // Kaspi requires: sku, model, price, availability
        const products = await prisma.product.findMany({
            where: {
                // simple filter
            }
        });

        const xmlItems = products.map(product => {
            const availability = product.quantity > 0 ? 'yes' : 'no';
            // Kaspi XML format for offers
            return `
    <offer sku="${product.sku}">
        <model>${escapeXml(product.name)}</model>
        <brand>Dimmiani</brand>
        <availabilities>
             <availability storeId="PP1" available="${availability}"/>
        </availabilities>
        <price>${product.price}</price>
    </offer>`;
        }).join('\n');

        const xml = `<?xml version="1.0" encoding="utf-8"?>
<kaspi_catalog date="string"
      xmlns="kaspiShopping"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="kaspiShopping http://kaspi.kz/kaspishopping.xsd">
<company>Dimmiani</company>
<merchantid>Dimmiani</merchantid>
<offers>
${xmlItems}
</offers>
</kaspi_catalog>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'text/xml',
            },
        });

    } catch (error) {
        console.error('Kaspi Feed Error:', error);
        return new NextResponse('Error generating feed', { status: 500 });
    }
}

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
        return c;
    });
}
