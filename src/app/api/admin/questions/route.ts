import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

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
    const search = searchParams.get('search');

    const whereClause: any = {};
    if (category) whereClause.category = category;
    if (department && department !== 'All') whereClause.department = department;
    if (search) {
      whereClause.question = { contains: search, mode: 'insensitive' };
    }

    const questions = await prisma.testQuestion.findMany({
      where: whereClause,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Gagal mengambil data soal ujian.' }, { status: 500 });
  }
}

// POST: Create question
export async function POST(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Sesi login admin diperlukan.' }, { status: 401 });
    }

    const body = await req.json();
    const { category, department, question, questionType, imageUrl, options, correctKey, points, sortOrder } = body;

    const qType = questionType || 'single_choice';

    if (!category || !question) {
      return NextResponse.json(
        { error: 'Kategori dan isi teks pertanyaan wajib diisi.' },
        { status: 400 }
      );
    }

    if (qType === 'single_choice' && (!options || !correctKey)) {
      return NextResponse.json(
        { error: 'Pilihan ganda reguler wajib memiliki 4 opsi jawaban dan 1 kunci jawaban benar.' },
        { status: 400 }
      );
    }

    if (qType === 'multi_choice' && (!options || options.length < 2)) {
      return NextResponse.json(
        { error: 'Soal pilihan kepribadian wajib memiliki opsi pilihan karakter diri.' },
        { status: 400 }
      );
    }

    const optionsJson = qType === 'essay' ? '[]' : (Array.isArray(options) ? JSON.stringify(options) : options || '[]');

    const newQuestion = await prisma.testQuestion.create({
      data: {
        category,
        department: department || 'General',
        question: question.trim(),
        questionType: qType,
        imageUrl: imageUrl || null,
        options: optionsJson,
        correctKey: qType === 'single_choice' ? (correctKey ? correctKey.toUpperCase() : 'A') : (correctKey || null),
        points: points ? Number(points) : 10,
        sortOrder: sortOrder ? Number(sortOrder) : 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Soal ujian berhasil ditambahkan ke bank soal.',
      question: newQuestion,
    });
  } catch (error: any) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Gagal menambahkan soal baru.' }, { status: 500 });
  }
}

// PUT: Update question
export async function PUT(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Sesi login admin diperlukan.' }, { status: 401 });
    }

    const body = await req.json();
    const { id, category, department, question, questionType, imageUrl, options, correctKey, points, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID soal wajib disertakan.' }, { status: 400 });
    }

    const qType = questionType || 'single_choice';
    const optionsJson = qType === 'essay' ? '[]' : (Array.isArray(options) ? JSON.stringify(options) : options || '[]');

    const updated = await prisma.testQuestion.update({
      where: { id: Number(id) },
      data: {
        category,
        department: department || 'General',
        question: question ? question.trim() : undefined,
        questionType: qType,
        imageUrl: imageUrl !== undefined ? (imageUrl || null) : undefined,
        options: optionsJson,
        correctKey: qType === 'single_choice' ? (correctKey ? correctKey.toUpperCase() : 'A') : (correctKey || null),
        points: points !== undefined ? Number(points) : undefined,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Soal ujian berhasil diperbarui.',
      question: updated,
    });
  } catch (error: any) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Gagal memperbarui soal ujian.' }, { status: 500 });
  }
}

// DELETE: Delete question
export async function DELETE(req: Request) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Akses ditolak. Sesi login admin diperlukan.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID soal wajib disertakan.' }, { status: 400 });
    }

    await prisma.testQuestion.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Soal ujian berhasil dihapus dari bank soal.',
    });
  } catch (error: any) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Gagal menghapus soal ujian.' }, { status: 500 });
  }
}
