import { NextResponse } from 'next/server';
import db from '@/lib/db';
import logger from '@/lib/logger';
import axios from 'axios';

export async function POST(request: Request) {
    logger.api('POST', '/api/remove-bg');

    try {
        const { image } = await request.json(); // base64 image
        if (!image) {
            return NextResponse.json({ status: 'error', message: 'No image provided' }, { status: 400 });
        }

        // Get API key from DB
        const setting: any = db.prepare('SELECT value FROM settings WHERE key = ?').get('remove_bg_key');
        const apiKey = setting?.value;

        if (!apiKey) {
            return NextResponse.json({ status: 'error', message: 'Remove.bg API key not configured' }, { status: 404 });
        }

        // Helper for remove.bg request
        const tryRemoveBg = async (key: string, base64Image: string) => {
            const base64Data = base64Image.split(',')[1] || base64Image;

            while (true) {
                try {
                    const response = await axios.post('https://api.remove.bg/v1.0/removebg', {
                        image_file_b64: base64Data,
                        size: 'auto'
                    }, {
                        headers: {
                            'X-Api-Key': key,
                        },
                        responseType: 'arraybuffer'
                    });

                    if (response.status === 200) {
                        const buffer = Buffer.from(response.data, 'binary');
                        return `data:image/png;base64,${buffer.toString('base64')}`;
                    }
                } catch (error: any) {
                    if (error.response?.status === 429) {
                        const retryAfter = error.response.headers['retry-after'];
                        const delay = retryAfter ? parseInt(retryAfter) * 1000 : 10000;
                        logger.warn(`Rate limit reached. Retrying after ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    throw error;
                }
            }
        };

        const result = await tryRemoveBg(apiKey, image);

        return NextResponse.json({ status: 'success', data: { image: result } });
    } catch (error: any) {
        logger.error('Failed to remove background', { error: error.message });
        return NextResponse.json({
            status: 'error',
            message: error.response?.data?.errors?.[0]?.title || error.message
        }, { status: 500 });
    }
}
