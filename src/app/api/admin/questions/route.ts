import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { fetchFromBackend, fetchRawFromBackend } from '@/lib/api-client';

// GET: List questions
export async function GET(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Sesi login admin diperlukan.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const department = searchParams.get('department');

    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (department && department !== 'All') params.set('department', department);

    const questions = await fetchFromBackend(`/tests/questions?${params.toString()}`);
    return NextResponse.json({ questions: questions || [] });
  } catch (error: any) {
    console.error('Fetch questions error:', error);
    return NextResponse.json({ error: 'Gagal memuat bank soal.' }, { status: 500 });
  }
}

// POST: Create question
export async function POST(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const body = await req.json();
    const result = await fetchRawFromBackend('/tests/questions', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return NextResponse.json({ success: true, question: result.data || result });
  } catch (error: any) {
    console.error('Create question error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menambah soal.' }, { status: 500 });
  }
}

// PUT: Update question
export async function PUT(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: 'ID soal wajib disertakan.' }, { status: 400 });

    const result = await fetchRawFromBackend(`/tests/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    return NextResponse.json({ success: true, question: result.data || result });
  } catch (error: any) {
    console.error('Update question error:', error);
    return NextResponse.json({ error: error.message || 'Gagal memperbarui soal.' }, { status: 500 });
  }
}

// DELETE: Delete question
export async function DELETE(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID soal wajib disertakan.' }, { status: 400 });

    await fetchRawFromBackend(`/tests/questions/${id}`, { method: 'DELETE' });
    return NextResponse.json({ success: true, message: 'Soal berhasil dihapus.' });
  } catch (error: any) {
    console.error('Delete question error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghapus soal.' }, { status: 500 });
  }
}
