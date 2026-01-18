import { NextResponse } from 'next/server';
import db from '@/lib/db';
import logger from '@/lib/logger';

export async function GET() {
    logger.api('GET', '/api/projects');
    try {
        const rows = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all();
        const projects = rows.map((row: any) => ({
            ...row,
            content: JSON.parse(row.content)
        }));
        logger.info('Projects fetched', { count: projects.length });
        return NextResponse.json({ status: 'success', data: projects });
    } catch (error: any) {
        logger.error('Failed to fetch projects', { error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    logger.api('POST', '/api/projects');
    try {
        const data = await request.json();
        const { name, type, content } = data;

        if (!name || !type || !content) {
            logger.warn('Missing fields in project save', { name, type });
            return NextResponse.json({ status: 'error', message: 'Missing fields' }, { status: 400 });
        }

        const info = db.prepare(
            'INSERT INTO projects (name, type, content) VALUES (?, ?, ?)'
        ).run(name, type, JSON.stringify(content));

        logger.info('Project saved', { id: info.lastInsertRowid, name });
        return NextResponse.json({ status: 'success', data: { id: info.lastInsertRowid } });
    } catch (error: any) {
        logger.error('Failed to save project', { error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
