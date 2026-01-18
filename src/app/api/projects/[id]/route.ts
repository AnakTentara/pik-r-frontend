import { NextResponse } from 'next/server';
import db from '@/lib/db';
import logger from '@/lib/logger';

// GET /api/projects/[id] - Get single project
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    logger.api('GET', `/api/projects/${id}`);

    try {
        const project: any = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

        if (!project) {
            return NextResponse.json({ status: 'error', message: 'Project not found' }, { status: 404 });
        }

        const parsed = {
            ...project,
            content: JSON.parse(project.content || '{}')
        };

        logger.info('Project fetched', { id });
        return NextResponse.json({ status: 'success', data: parsed });
    } catch (error: any) {
        logger.error('Failed to fetch project', { id, error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    logger.api('PUT', `/api/projects/${id}`);

    try {
        const data = await request.json();
        const { name, content, thumbnail } = data;

        const updates: string[] = [];
        const values: any[] = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (content) {
            updates.push('content = ?');
            values.push(JSON.stringify(content));
        }
        if (thumbnail) {
            updates.push('thumbnail = ?');
            values.push(thumbnail);
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).run(...values);

        logger.info('Project updated', { id });
        return NextResponse.json({ status: 'success', message: 'Project updated' });
    } catch (error: any) {
        logger.error('Failed to update project', { id, error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    logger.api('DELETE', `/api/projects/${id}`);

    try {
        db.prepare('DELETE FROM projects WHERE id = ?').run(id);
        logger.info('Project deleted', { id });
        return NextResponse.json({ status: 'success', message: 'Project deleted' });
    } catch (error: any) {
        logger.error('Failed to delete project', { id, error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
