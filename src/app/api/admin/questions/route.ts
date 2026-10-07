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
    return NextResponse.json({ error: 'Failed to load question bank.' }, { status: 500 });
  }
}

function formatQuestionPayload(body: any) {
  const options = Array.isArray(body.options)
    ? JSON.stringify(body.options)
    : typeof body.options === 'string'
    ? body.options
    : JSON.stringify([]);

  const payload: Record<string, any> = {
    category: body.category,
    department: body.department || 'General',
    question: body.question,
    question_type: body.question_type || body.questionType || 'single_choice',
    image_url: body.image_url !== undefined ? body.image_url : (body.imageUrl || null),
    options: options,
    points: Number(body.points ?? 10),
    sort_order: Number(body.sort_order ?? body.sortOrder ?? 0),
  };

  const correctKey = body.correct_key !== undefined ? body.correct_key : body.correctKey;
  if (correctKey !== undefined) {
    payload.correct_key = correctKey;
  }

  return payload;
}

// POST: Create question
export async function POST(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 401 });
    }

    const body = await req.json();
    const payload = formatQuestionPayload(body);

    const result = await fetchRawFromBackend('/tests/questions', {
      method: 'POST',
      headers: {
        'x-admin-id': String(admin.adminId),
        'x-admin-role': admin.role,
        'x-admin-department': admin.department || '',
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: true,
      message: 'Soal ujian berhasil ditambahkan ke bank soal.',
      question: result.data || result,
    });
  } catch (error: any) {
    console.error('Create question error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add question.' }, { status: 500 });
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
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: 'ID soal wajib disertakan.' }, { status: 400 });

    const payload = formatQuestionPayload(rest);

    const result = await fetchRawFromBackend(`/tests/questions/${id}`, {
      method: 'PUT',
      headers: {
        'x-admin-id': String(admin.adminId),
        'x-admin-role': admin.role,
        'x-admin-department': admin.department || '',
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      success: true,
      message: 'Soal ujian berhasil diperbarui.',
      question: result.data || result,
    });
  } catch (error: any) {
    console.error('Update question error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update question.' }, { status: 500 });
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

    await fetchRawFromBackend(`/tests/questions/${id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-id': String(admin.adminId),
        'x-admin-role': admin.role,
        'x-admin-department': admin.department || '',
      },
    });
    return NextResponse.json({ success: true, message: 'Soal berhasil dihapus.' });
  } catch (error: any) {
    console.error('Delete question error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete question.' }, { status: 500 });
  }
}

