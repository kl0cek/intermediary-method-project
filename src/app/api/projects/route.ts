// app/api/projects/route.ts
import { NextResponse } from 'next/server';
import db from '../../../lib/db';

interface ProjectRow { id: number; name: string; input: string; result: string | null; }

export async function GET() {
  return new Promise<NextResponse>((resolve, reject) => {
    db.all<ProjectRow[]>(
      'SELECT id, name, input, result FROM projects ORDER BY id',
      [],
      (err, rows) => {
        if (err) reject(err);
        else resolve(NextResponse.json(rows));
      }
    );
  });
}

export async function POST(request: Request) {
  const { name, data } = await request.json() as { name: string; data: any };
  return new Promise<NextResponse>((resolve, reject) => {
    db.run(
      'INSERT INTO projects(name, input) VALUES(?,?)',
      name,
      JSON.stringify(data),
      function (err : any) {
        if (err) reject(err);
        else resolve(
          NextResponse.json({ id: this.lastID, name, input: data, result: null })
        );
      }
    );
  });
}