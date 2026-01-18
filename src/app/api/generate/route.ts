import { NextResponse } from 'next/server';
import db from '@/lib/db';
import logger from '@/lib/logger';

const MODELS = [
    'gemini-2.5-flash-preview-05-20',
    'gemini-2.5-flash-lite-preview-06-17',
    'gemini-2.0-flash'
];

async function tryGenerate(apiKey: string, model: string, prompt: string): Promise<string | null> {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            logger.warn(`Model ${model} failed`, { error: error.error?.message });
            return null;
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
        logger.error(`Request to ${model} failed`, { error });
        return null;
    }
}

export async function POST(request: Request) {
    logger.api('POST', '/api/generate');

    try {
        const { topic, tone } = await request.json();

        if (!topic) {
            return NextResponse.json({ status: 'error', message: 'Topic required' }, { status: 400 });
        }

        // Get API keys from settings
        const keys: string[] = [];
        for (let i = 1; i <= 3; i++) {
            const row: any = db.prepare('SELECT value FROM settings WHERE key = ?').get(`api_key_${i}`);
            if (row?.value) keys.push(row.value);
        }

        if (keys.length === 0) {
            return NextResponse.json({
                status: 'error',
                message: 'No API keys configured. Go to Admin panel to add keys.'
            }, { status: 400 });
        }

        const prompt = `Generate an Instagram caption about: ${topic}
Tone: ${tone || 'informative'}
Requirements:
- Use Indonesian language
- Include relevant emojis
- Add 3-5 relevant hashtags at the end
- Keep it engaging and shareable
- Max 150 words`;

        // Try each key with each model until success
        for (const apiKey of keys) {
            for (const model of MODELS) {
                logger.info(`Trying ${model}`);
                const result = await tryGenerate(apiKey, model, prompt);

                if (result) {
                    logger.info('Caption generated successfully', { model });
                    return NextResponse.json({
                        status: 'success',
                        data: { caption: result, model }
                    });
                }
            }
        }

        return NextResponse.json({
            status: 'error',
            message: 'All API keys and models exhausted. Try again later.'
        }, { status: 429 });

    } catch (error: any) {
        logger.error('Generation failed', { error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
