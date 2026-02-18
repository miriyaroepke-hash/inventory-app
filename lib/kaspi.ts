const KASPI_API_URL = 'https://kaspi.kz/shop/api/v2';

export interface KaspiOrder {
    id: string; // Kaspi ID
    code: string; // Order Code
    state: string; // NEW, SIGN_REQUIRED, PICKUP, DELIVERY, etc.
    totalPrice: number;
    paymentMode: string;
    creationDate: number;
    deliveryMode: string;
    entries: KaspiEntry[];
    user: {
        firstName: string;
        lastName: string;
        cellPhone: string;
    };
    deliveryAddress?: {
        streetName?: string;
        streetNumber?: string;
        town?: string;
        district?: string;
        building?: string;
        apartment?: string;
    }
}

export interface KaspiEntry {
    id: string;
    quantity: number;
    totalPrice: number;
    basePrice: number;
    product: {
        code: string; // SKU
        name: string;
    }
}

export async function getKaspiOrders(period: 'TODAY' | 'WEEK' = 'TODAY'): Promise<KaspiOrder[]> {
    const token = process.env.KASPI_API_TOKEN;
    if (!token || token.includes('YOUR_KASPI_TOKEN')) {
        console.warn('Kaspi Token invalid or missing');
        return [];
    }

    // Date range
    const now = new Date();
    const toDate = now.getTime();
    const fromDate = new Date();
    if (period === 'TODAY') {
        fromDate.setHours(0, 0, 0, 0);
    } else {
        fromDate.setDate(now.getDate() - 7);
    }

    try {
        const url = `${KASPI_API_URL}/orders?page[number]=0&page[size]=20&filter[orders][creationDate][$ge]=${fromDate.getTime()}&filter[orders][creationDate][$le]=${toDate}&filter[orders][state]=NEW`;

        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/vnd.api+json',
                'X-Auth-Token': token
            }
        });

        if (!res.ok) {
            console.error('Kaspi API Error', res.status, await res.text());
            return [];
        }

        const data = await res.json();
        return data.data.map((item: any) => ({
            id: item.id,
            code: item.attributes.code,
            state: item.attributes.state,
            totalPrice: item.attributes.totalPrice,
            paymentMode: item.attributes.paymentMode,
            creationDate: item.attributes.creationDate,
            deliveryMode: item.attributes.deliveryMode,
            entries: [], // Needs separate fetch or include? Kaspi API v2 usually enables include=entries
            user: item.attributes.customer,
            deliveryAddress: item.attributes.deliveryAddress
        }));
    } catch (e) {
        console.error('Kaspi Fetch Error', e);
        return [];
    }
}

// Helper to fetch entries for an order if not included
export async function getOrderEntries(orderId: string): Promise<KaspiEntry[]> {
    const token = process.env.KASPI_API_TOKEN;
    if (!token) return [];

    const url = `${KASPI_API_URL}/orders/${orderId}/entries`;
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/vnd.api+json',
            'X-Auth-Token': token
        }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.data.map((item: any) => ({
        id: item.id,
        quantity: item.attributes.quantity,
        totalPrice: item.attributes.totalPrice,
        basePrice: item.attributes.basePrice,
        product: {
            code: item.attributes.product?.code,
            name: item.attributes.product?.name
        }
    }));
}
