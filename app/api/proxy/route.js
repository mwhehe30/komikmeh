import { NextRequest } from 'next/server';

export async function GET(req) {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
        return new Response('Missing url', { status: 400 });
    }

    try {
        console.log('Fetching image:', url); // Added log for debugging
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://v1.komikcast.fit/',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Sec-Fetch-Dest': 'image',
                'Sec-Fetch-Mode': 'no-cors',
                'Sec-Fetch-Site': 'cross-site',
            },
        });

        if (!response.ok) {
            console.error('Image Fetch Failed:', response.status, response.statusText);
            return new Response('Failed to fetch image', { status: response.status });
        }

        const buffer = await response.arrayBuffer();

        // Standard headers for the response
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
        headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200');

        return new Response(buffer, {
            headers,
        });
    } catch (err) {
        console.error('Image Proxy Error:', err);
        return new Response('Error fetching image', { status: 500 });
    }
}
