import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sharp from 'sharp';

const MOYSKLAD_LOGIN = process.env.MOYSKLAD_LOGIN;
const MOYSKLAD_PASSWORD = process.env.MOYSKLAD_PASSWORD;
const AUTH_HEADER = 'Basic ' + Buffer.from(`${MOYSKLAD_LOGIN}:${MOYSKLAD_PASSWORD}`).toString('base64');

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { offset = 0, limit = 25 } = await request.json();

    if (!MOYSKLAD_LOGIN || !MOYSKLAD_PASSWORD) {
        return NextResponse.json({ error: 'Credentials missing' }, { status: 500 });
    }

    try {
        // 1. Fetch from MoiSklad
        // We use filter to get only positive quantity if possible, but MS API filter syntax is specific.
        // It's easier to filter in memory for this batch size, or try filter=quantity>0
        // MS API: filter=quantity>0 might work. Let's try param string. 
        // Actually, let's fetch and filter in loop to be safe and simple.
        const url = `https://api.moysklad.ru/api/remap/1.2/entity/assortment?limit=${limit}&offset=${offset}&expand=images`;
        const res = await fetch(url, {
            headers: { 'Authorization': AUTH_HEADER }
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`MoiSklad API Error: ${res.status} ${txt}`);
        }

        const data = await res.json();
        const items = data.rows;

        let processed = 0;
        let errors = 0;
        let skipped = 0;

        // 2. Process Items
        for (const item of items) {
            if (item.meta.type !== 'product' && item.meta.type !== 'variant') {
                skipped++;
                continue;
            }

            const quantity = item.quantity || 0;

            // FILTER: Only positive quantity
            if (quantity <= 0) {
                skipped++;
                continue;
            }

            const name = item.name;
            const price = item.salePrices?.[0]?.value / 100 || 0;

            // SKU / Barcode Logic
            let sku = item.article || item.code || 'NO_SKU';
            if (item.barcodes && item.barcodes.length > 0) {
                const ean = item.barcodes.find((b: any) => b.ean13);
                sku = ean ? ean.ean13 : item.barcodes[0][Object.keys(item.barcodes[0])[0]];
            }

            // Image Logic with Compression
            let imageBase64 = null;
            if (item.images && item.images.meta.size > 0) {
                try {
                    const imageListUrl = item.images.meta.href;
                    const imgRes = await fetch(imageListUrl, { headers: { 'Authorization': AUTH_HEADER } });
                    const imgData: any = await imgRes.json();

                    if (imgData.rows && imgData.rows.length > 0) {
                        const downloadUrl = imgData.rows[0].meta.downloadHref;
                        const binaryRes = await fetch(downloadUrl, { headers: { 'Authorization': AUTH_HEADER } });
                        if (binaryRes.ok) {
                            const arrayBuffer = await binaryRes.arrayBuffer();
                            const buffer = Buffer.from(arrayBuffer);

                            // COMPRESSION using sharp
                            const resizedBuffer = await sharp(buffer)
                                .resize(800, 800, { // Max dims
                                    fit: 'inside',
                                    withoutEnlargement: true
                                })
                                .jpeg({ quality: 80 }) // Compress to JPEG 80%
                                .toBuffer();

                            const base64 = resizedBuffer.toString('base64');
                            imageBase64 = `data:image/jpeg;base64,${base64}`;
                        }
                    }
                } catch (e) {
                    console.error(`Failed to fetch/resize image for ${name}`, e);
                }
            }

            // DB Upsert
            try {
                const productData = {
                    name,
                    price,
                    quantity,
                    sku,
                    size: extractSize(name),
                    image: imageBase64
                };

                const existing = await prisma.product.findUnique({ where: { sku } });

                if (existing) {
                    await prisma.product.update({
                        where: { sku },
                        data: {
                            quantity: existing.quantity + quantity,
                            price: price > 0 ? price : existing.price,
                            image: imageBase64 ? imageBase64 : existing.image
                        }
                    });
                } else {
                    await prisma.product.create({ data: productData });
                }
                processed++;
            } catch (e) {
                console.error(e);
                errors++;
            }
        }

        return NextResponse.json({
            processed,
            errors,
            skipped,
            total: data.meta.size,
            hasMore: (offset + limit) < data.meta.size
        });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function extractSize(name: string): string | null {
    const sizeMatch = name.match(/\b(XS|S|M|L|XL|XXL|\d{2})\b/i);
    return sizeMatch ? sizeMatch[0].toUpperCase() : null;
}
