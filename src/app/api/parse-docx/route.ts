import { NextRequest, NextResponse } from 'next/server';
import { parseDocxBuffer } from '@/lib/parseDocx';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!(file instanceof Blob)) {
    return NextResponse.json(
      { error: 'Missing DOCX file in form field "file".' },
      { status: 400 }
    );
  }

  const buffer = await file.arrayBuffer();
  const result = await parseDocxBuffer(buffer);

  return NextResponse.json(result);
}
