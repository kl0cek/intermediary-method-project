// app/api/projects/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import db from '../../../../lib/db';

export async function GET(request: NextRequest, params: { params: { id: string } }) {
  const par = await params.params;
  const id = Number(par.id);
  return new Promise<NextResponse>((resolve, reject) => {
    db.get(
      'SELECT id, name, input, result FROM projects WHERE id = ?',
      id,
      (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(NextResponse.json({ error: 'Not found' }, { status: 404 }));
        else resolve(NextResponse.json(row));
      }
    );
  });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const par = await params
  const id = Number(par.id);
  const { name, data, result } = await request.json();
  const updates: string[] = [];
  const values: any[] = [];

  if (name !== undefined) { updates.push('name = ?'); values.push(name); }
  if (data !== undefined) { updates.push('input = ?'); values.push(JSON.stringify(data)); }
  if (result !== undefined) { updates.push('result = ?'); values.push(JSON.stringify(result)); }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const sql = `UPDATE projects SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  values.push(id);

  return new Promise<NextResponse>((resolve, reject) => {
    db.run(sql, ...values, function (err : any) {
      if (err) reject(err);
      else resolve(NextResponse.json({ id, name, input: data, result }));
    });
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const par = await params
  const id = Number(par.id);
  return new Promise<NextResponse>((resolve, reject) => {
    db.run('DELETE FROM projects WHERE id = ?', id, function (err) {
      if (err) reject(err);
      else resolve(NextResponse.json({ success: true }));
    });
  });
}