import { env } from '$env/dynamic/private';

export async function GET({ url }) {
    const query = url.searchParams.get('q');

    if (!query) {
        return new Response(
            JSON.stringify({ error: 'Missing query parameter `q`' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const API_KEY = env.NZBGEEK_API_KEY;

    const apiUrl = `https://api.nzbgeek.info/api?t=search&q=${encodeURIComponent(query)}&limit=200&extended=1&o=json&apikey=${API_KEY}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ error: 'Failed to fetch from NZBgeek' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
