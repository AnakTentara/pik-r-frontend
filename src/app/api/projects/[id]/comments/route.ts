import { NextResponse } from 'next/server';
import db from '@/lib/db';
import logger from '@/lib/logger';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: projectId } = await params;
    logger.api('GET', `/api/projects/${projectId}/comments`);

    try {
        const rows = db.prepare('SELECT * FROM comments WHERE project_id = ? ORDER BY created_at DESC').all(projectId);
        return NextResponse.json({ status: 'success', data: rows });
    } catch (error: any) {
        logger.error('Failed to fetch comments', { error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: projectId } = await params;
    logger.api('POST', `/api/projects/${projectId}/comments`);

    try {
        const { author, text } = await request.json();

        if (!text) {
            return NextResponse.json({ status: 'error', message: 'Comment text is required' }, { status: 400 });
        }

        const stmt = db.prepare(`
            INSERT INTO comments (project_id, author, text)
            VALUES (?, ?, ?)
        `);

        const info = stmt.run(projectId, author || 'Anonymous', text);

        return NextResponse.json({
            status: 'success',
            data: {
                id: info.lastInsertRowid,
                project_id: projectId,
                author: author || 'Anonymous',
                text,
                created_at: new Date().toISOString()
            }
        });
    } catch (error: any) {
        logger.error('Failed to post comment', { error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
