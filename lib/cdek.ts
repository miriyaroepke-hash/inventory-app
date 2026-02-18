
const CDEK_API_URL = 'https://api.cdek.ru/v2';
const CDEK_ACCOUNT = process.env.SDEK_ACCOUNT;
const CDEK_PASSWORD = process.env.SDEK_PASSWORD;

let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getCdekToken() {
    if (accessToken && Date.now() < tokenExpiresAt) {
        return accessToken;
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', CDEK_ACCOUNT || '');
    params.append('client_secret', CDEK_PASSWORD || '');

    try {
        const res = await fetch(`${CDEK_API_URL}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`CDEK Auth Failed: ${err}`);
        }

        const data = await res.json();
        accessToken = data.access_token;
        // Expires in is in seconds, reduce by 60s for safety
        tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
        return accessToken;
    } catch (error) {
        console.error('CDEK Token Error:', error);
        throw error;
    }
}

export async function searchCdekCities(query: string) {
    const token = await getCdekToken();
    const res = await fetch(`${CDEK_API_URL}/location/cities?city=${encodeURIComponent(query)}&country_codes=KZ,RU,BY,KG,AM`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch cities');
    return await res.json();
}

export async function createCdekOrder(orderData: any) {
    const token = await getCdekToken();
    const res = await fetch(`${CDEK_API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`CDEK Order Failed: ${JSON.stringify(err)}`);
    }
    return await res.json();
}
