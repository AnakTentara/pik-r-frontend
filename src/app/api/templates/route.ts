import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import logger from '@/lib/logger';

// Use a persistent uploads directory outside of public (won't be deleted on rebuild)
const uploadsDir = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
async function ensureUploadsDir() {
    if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
    }
}

// GET /api/templates - List all templates
export async function GET() {
    logger.api('GET', '/api/templates');
    try {
        const rows = db.prepare('SELECT * FROM templates ORDER BY created_at DESC').all();
        logger.info('Templates fetched', { count: rows.length });
        return NextResponse.json({ status: 'success', data: rows });
    } catch (error: any) {
        logger.error('Failed to fetch templates', { error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

// POST /api/templates - Upload a new template
export async function POST(request: Request) {
    logger.api('POST', '/api/templates');
    try {
        await ensureUploadsDir();

        const formData = await request.formData();
        const name = formData.get('name') as string;
        const category = formData.get('category') as string;
        const file = formData.get('overlay_file') as File;

        if (!name || !category || !file) {
            logger.warn('Missing fields in template upload', { name, category, hasFile: !!file });
            return NextResponse.json({ status: 'error', message: 'Missing fields' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Sanitize filename: remove brackets and special chars
        const ext = path.extname(file.name);
        const baseName = path.basename(file.name, ext)
            .replace(/[\[\](){}]/g, '')  // Remove brackets
            .replace(/[^a-zA-Z0-9_-]/g, '_')  // Replace other special chars with underscore
            .replace(/_+/g, '_');  // Collapse multiple underscores

        const filename = `${Date.now()}_${baseName}${ext}`;
        const uploadPath = path.join(uploadsDir, filename);

        await writeFile(uploadPath, buffer);
        logger.info('File uploaded', { filename, size: buffer.length });

        // Store path that will be served via API
        const imagePath = `/api/uploads/${filename}`;

        const info = db.prepare(
            'INSERT INTO templates (name, category, image_path) VALUES (?, ?, ?)'
        ).run(name, category, imagePath);

        logger.info('Template created', { id: info.lastInsertRowid, name });

        return NextResponse.json({
            status: 'success',
            data: { id: info.lastInsertRowid, name, category, image_path: imagePath }
        });
    } catch (error: any) {
        logger.error('Failed to upload template', { error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

// DELETE /api/templates - Delete a template
export async function DELETE(request: Request) {
    logger.api('DELETE', '/api/templates');
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ status: 'error', message: 'Missing ID' }, { status: 400 });
        }

        const template: any = db.prepare('SELECT image_path FROM templates WHERE id = ?').get(id);
        if (template) {
            // Extract filename from path like /api/uploads/filename.png
            const filename = template.image_path.split('/').pop();
            const filePath = path.join(uploadsDir, filename);
            try {
                await unlink(filePath);
                logger.info('Template file deleted', { path: filePath });
            } catch (err) {
                logger.warn('Failed to delete template file', { path: filePath });
            }
        }

        db.prepare('DELETE FROM templates WHERE id = ?').run(id);
        logger.info('Template deleted', { id });
        return NextResponse.json({ status: 'success', message: 'Template deleted' });
    } catch (error: any) {
        logger.error('Failed to delete template', { error: error.message });
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
