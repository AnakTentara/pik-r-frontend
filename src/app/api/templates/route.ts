import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

// GET /api/templates - List all templates
export async function GET() {
    try {
        const rows = db.prepare('SELECT * FROM templates ORDER BY created_at DESC').all();
        return NextResponse.json({ status: 'success', data: rows });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

// POST /api/templates - Upload a new template
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const category = formData.get('category') as string;
        const file = formData.get('overlay_file') as File;

        if (!name || !category || !file) {
            return NextResponse.json({ status: 'error', message: 'Missing fields' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const uploadPath = path.join(process.cwd(), 'public/uploads', filename);

        // Create uploads directory if not exists
        const uploadsDir = path.join(process.cwd(), 'public/uploads');
        if (!require('fs').existsSync(uploadsDir)) {
            require('fs').mkdirSync(uploadsDir, { recursive: true });
        }

        await writeFile(uploadPath, buffer);

        const imagePath = `uploads/${filename}`;

        const info = db.prepare(
            'INSERT INTO templates (name, category, image_path) VALUES (?, ?, ?)'
        ).run(name, category, imagePath);

        return NextResponse.json({
            status: 'success',
            data: { id: info.lastInsertRowid, name, category, image_path: imagePath }
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

// DELETE /api/templates - Delete a template
export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ status: 'error', message: 'Missing ID' }, { status: 400 });
        }

        // Get image path first to delete the file
        const template: any = db.prepare('SELECT image_path FROM templates WHERE id = ?').get(id);
        if (template) {
            const filePath = path.join(process.cwd(), 'public', template.image_path);
            try {
                await unlink(filePath);
            } catch (err) {
                console.error("Failed to delete file:", err);
            }
        }

        db.prepare('DELETE FROM templates WHERE id = ?').run(id);
        return NextResponse.json({ status: 'success', message: 'Template deleted' });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
