import { NextResponse } from 'next/server';
import db from '@/lib/db';
import logger from '@/lib/logger';

// GET /api/settings - Get all settings (API keys)
export async function GET() {
    logger.api('GET', '/api/settings');
    try {
        const rows = db.prepare('SELECT * FROM settings').all();
        const settings: Record<string, string> = {};
        (rows as any[]).forEach(row => {
            settings[row.key] = row.value;
        });
        return NextResponse.json({ status: 'success', data: settings });
    } catch (error: any) {
        logger.error('Failed to fetch settings', { error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

// POST /api/settings - Save settings
export async function POST(request: Request) {
    logger.api('POST', '/api/settings');
    try {
        const data = await request.json();

        const upsert = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

        for (const [key, value] of Object.entries(data)) {
            upsert.run(key, value as string);
        }

        logger.info('Settings saved', { keys: Object.keys(data) });
        return NextResponse.json({ status: 'success', message: 'Settings saved' });
    } catch (error: any) {
        logger.error('Failed to save settings', { error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
