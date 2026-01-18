import { NextResponse } from 'next/server';
import db from '@/lib/db';
import logger from '@/lib/logger';

export async function POST(request: Request) {
    logger.api('POST', '/api/projects/duplicate');

    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ status: 'error', message: 'Project ID is required' }, { status: 400 });
        }

        // 1. Get original project
        const project: any = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

        if (!project) {
            return NextResponse.json({ status: 'error', message: 'Project not found' }, { status: 404 });
        }

        // 2. Create new project name
        const newName = `${project.name} (Copy)`;

        // 3. Insert duplicate
        const stmt = db.prepare(`
            INSERT INTO projects (name, type, content, thumbnail, updated_at)
            VALUES (?, ?, ?, ?, ?)
        `);

        const now = new Date().toISOString();
        const info = stmt.run(newName, project.type, project.content, project.thumbnail, now);

        return NextResponse.json({
            status: 'success',
            data: {
                id: info.lastInsertRowid,
                name: newName
            }
        });
    } catch (error: any) {
        logger.error('Failed to duplicate project', { error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
