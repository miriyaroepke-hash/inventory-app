
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

dotenv.config();

const prisma = new PrismaClient();

const MOYSKLAD_LOGIN = process.env.MOYSKLAD_LOGIN;
const MOYSKLAD_PASSWORD = process.env.MOYSKLAD_PASSWORD;
const AUTH_HEADER = 'Basic ' + Buffer.from(`${MOYSKLAD_LOGIN}:${MOYSKLAD_PASSWORD}`).toString('base64');

async function main() {
    if (!MOYSKLAD_LOGIN || !MOYSKLAD_PASSWORD) {
        console.error('❌ MOYSKLAD credentials not found in null');
        return;
    }

    console.log('🔄 Connecting to MoiSklad...');

    // 1. Fetch Products
    let offset = 0;
    const limit = 100;
    let hasMore = true;
    let count = 0;

    while (hasMore) {
        const url = `https://api.moysklad.ru/api/remap/1.2/entity/assortment?limit=${limit}&offset=${offset}&expand=images`;
        const res = await fetch(url, {
            headers: { 'Authorization': AUTH_HEADER }
        });

        if (!res.ok) {
            console.error(`❌ API Error: ${res.statusText}`);
            const text = await res.text();
            console.error(text);
            break;
        }

        const data: any = await res.json();
        const items = data.rows;

        if (items.length === 0) {
            hasMore = false;
            break;
        }

        console.log(`📦 Processing batch ${offset} - ${offset + items.length} / ${data.meta.size}`);

        for (const item of items) {
            // Only process products/variants
            if (item.meta.type !== 'product' && item.meta.type !== 'variant') continue;

            const name = item.name;
            const price = item.salePrices?.[0]?.value / 100 || 0;
            const quantity = item.quantity || 0;

            // Barcode/SKU Priority: Barcode -> Article -> Code
            let sku = item.article || item.code || 'NO_SKU';
            if (item.barcodes && item.barcodes.length > 0) {
                // Try to pick EAN13 or first available
                const ean = item.barcodes.find((b: any) => b.ean13);
                sku = ean ? ean.ean13 : item.barcodes[0][Object.keys(item.barcodes[0])[0]];
            }

            // Image Fetching
            let imageBase64 = null;
            if (item.images && item.images.meta.size > 0) {
                try {
                    // Get the first image
                    const imageListUrl = item.images.meta.href;
                    const imgRes = await fetch(imageListUrl, { headers: { 'Authorization': AUTH_HEADER } });
                    const imgData: any = await imgRes.json();

                    if (imgData.rows && imgData.rows.length > 0) {
                        const downloadUrl = imgData.rows[0].meta.downloadHref;
                        // Fetch the actual image binary
                        const binaryRes = await fetch(downloadUrl, { headers: { 'Authorization': AUTH_HEADER } });
                        if (binaryRes.ok) {
                            const buffer = await binaryRes.buffer();
                            // Convert to Base64
                            const base64 = buffer.toString('base64');
                            imageBase64 = `data:image/jpeg;base64,${base64}`;
                        }
                    }
                } catch (e) {
                    console.error(`    Failed to fetch image for ${name}`, e);
                }
            }

            // Size extraction (if in name like "Dress Size S")
            // Simple heuristic
            let size = null;
            const sizeMatch = name.match(/\b(XS|S|M|L|XL|XXL|\d{2})\b/i);
            if (sizeMatch) size = sizeMatch[0].toUpperCase();

            // Upsert to DB
            try {
                const productData = {
                    name,
                    price,
                    quantity,
                    sku,
                    size,
                    image: imageBase64 // Save image
                };

                // Check if SKU exists to avoid uniqueness error if multiple MS products share SKU
                const existing = await prisma.product.findUnique({ where: { sku } });

                if (existing) {
                    console.log(`  Start update ${name} (${sku})...`);
                    await prisma.product.update({
                        where: { sku },
                        data: {
                            quantity: existing.quantity + quantity, // Add up quantities if duplicates
                            price: price > 0 ? price : existing.price,
                            image: imageBase64 ? imageBase64 : existing.image
                        }
                    });
                } else {
                    console.log(`  New product ${name} (${sku})...`);
                    await prisma.product.create({
                        data: productData
                    });
                }
                count++;
            } catch (e) {
                console.error(`  Failed to save ${name}:`, e);
            }
        }

        offset += limit;
        if (offset >= data.meta.size) hasMore = false;
    }

    console.log(`✅ Import finished. Processed ${count} items.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
