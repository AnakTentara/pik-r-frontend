import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const rows = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all();
        // Parse content JSON string back to object
        const projects = rows.map((row: any) => ({
            ...row,
            content: JSON.parse(row.content)
        }));
        return NextResponse.json({ status: 'success', data: projects });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { name, type, content } = data;

        if (!name || !type || !content) {
            return NextResponse.json({ status: 'error', message: 'Missing fields' }, { status: 400 });
        }

        const info = db.prepare(
            'INSERT INTO projects (name, type, content) VALUES (?, ?, ?)'
        ).run(name, type, JSON.stringify(content));

        return NextResponse.json({ status: 'success', data: { id: info.lastInsertRowid } });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
