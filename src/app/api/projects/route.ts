import { NextResponse } from 'next/server';
import db from '@/lib/db';
import logger from '@/lib/logger';

export async function GET() {
    logger.api('GET', '/api/projects');
    try {
        const rows = db.prepare('SELECT id, name, type, thumbnail, created_at, updated_at FROM projects ORDER BY updated_at DESC').all();
        logger.info('Projects fetched', { count: rows.length });
        return NextResponse.json({ status: 'success', data: rows });
    } catch (error: any) {
        logger.error('Failed to fetch projects', { error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    logger.api('POST', '/api/projects');
    try {
        const data = await request.json();
        const { name, type } = data;

        if (!name || !type) {
            logger.warn('Missing fields in project creation', { name, type });
            return NextResponse.json({ status: 'error', message: 'Missing fields' }, { status: 400 });
        }

        const initialContent = JSON.stringify({ objects: [], version: '1.0' });

        const info = db.prepare(
            'INSERT INTO projects (name, type, content, thumbnail) VALUES (?, ?, ?, ?)'
        ).run(name, type, initialContent, null);

        logger.info('Project created', { id: info.lastInsertRowid, name });
        return NextResponse.json({
            status: 'success',
            data: {
                id: info.lastInsertRowid,
                name,
                type
            }
        });
    } catch (error: any) {
        logger.error('Failed to create project', { error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
