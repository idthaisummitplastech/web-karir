import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shuffleArray, parseOptions, getExamCounts } from "@/lib/exam";

export async function GET(req: Request) {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "psikotes"; // 'psikotes' or 'user_test'

    const applicant = await prisma.applicant.findUnique({
      where: { id: session.applicantId },
      include: { jobPosting: true, testSubmissions: true },
    });
    if (!applicant) {
      return NextResponse.json({ error: "Data pelamar tidak ditemukan." }, { status: 404 });
    }

    const existing = (applicant.testSubmissions as any[]).find((s) => s.testType === category) as any;

    let settingsMap: Record<string, string> = {};
    try {
      const list = await prisma.recruitmentSetting.findMany();
      list.forEach((r) => { settingsMap[r.key] = r.value; });
    } catch {}
    const { pgCount, essayCount } = getExamCounts(settingsMap, category);

    // Reuse paket stabil bila sudah ada (anti berubah saat refresh)
    if (existing?.questionSet) {
      try {
        const ids: number[] = JSON.parse(existing.questionSet);
        const optionMap: Record<string, number[]> = existing.optionMap ? JSON.parse(existing.optionMap) : {};
        if (Array.isArray(ids) && ids.length > 0) {
          const bank = await prisma.testQuestion.findMany({ where: { id: { in: ids } } });
          const byId = new Map(bank.map((q) => [q.id, q]));
          const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as typeof bank;
          const sanitized = ordered.map((q) => {
            const orig = parseOptions(q.options);
            const qType = q.questionType || "single_choice";
            if (qType === "essay") {
              return { id: q.id, question: q.question, questionType: "essay", imageUrl: q.imageUrl, options: [], points: q.points, sortOrder: q.sortOrder };
            }
            const map = optionMap[String(q.id)];
            let shown = orig;
            if (Array.isArray(map) && map.length === orig.length) {
              shown = map.map((oi) => orig[oi]);
            }
            return { id: q.id, question: q.question, questionType: qType, imageUrl: q.imageUrl, options: shown, points: q.points, sortOrder: q.sortOrder };
          });
          return NextResponse.json({
            success: true, category, totalQuestions: sanitized.length,
            pgCount: sanitized.filter((q) => q.questionType !== "essay").length,
            essayCount: sanitized.filter((q) => q.questionType === "essay").length,
            questions: sanitized, reused: true,
          });
        }
      } catch {}
    }

    // Pool soal: user_test prioritaskan departemen pelamar
    let pool = await prisma.testQuestion.findMany({
      where: { category },
      orderBy: { sortOrder: "asc" },
    });
    if (category === "user_test" && (applicant as any).jobPosting?.department) {
      const dept = String((applicant as any).jobPosting.department).toLowerCase();
      const deptPool = pool.filter((q) => {
        const qd = String(q.department || "").toLowerCase();
        return (qd && (dept.includes(qd) || qd.includes(dept)));
      });
      if (deptPool.length >= 3) pool = deptPool;
    }

    const pgPool = shuffleArray(pool.filter((q) => (q.questionType || "single_choice") !== "essay"));
    const essayPool = shuffleArray(pool.filter((q) => (q.questionType || "single_choice") === "essay"));
    const pickedPg = pgPool.slice(0, Math.min(pgCount, pgPool.length));
    const pickedEssay = essayPool.slice(0, Math.min(essayCount, essayPool.length));
    const finalSet = [...pickedPg, ...pickedEssay];
    if (finalSet.length === 0) {
      return NextResponse.json({ success: true, category, totalQuestions: 0, pgCount: 0, essayCount: 0, questions: [], reused: false });
    }
    const optionMapNew: Record<string, number[]> = {};
    const sanitizedNew = finalSet.map((q) => {
      const orig = parseOptions(q.options);
      const qType = q.questionType || "single_choice";
      if (qType === "essay" || orig.length === 0) {
        return { id: q.id, question: q.question, questionType: qType, imageUrl: q.imageUrl, options: [], points: q.points, sortOrder: q.sortOrder };
      }
      const idx = shuffleArray(orig.map((_, i) => i));
      optionMapNew[String(q.id)] = idx;
      return { id: q.id, question: q.question, questionType: qType, imageUrl: q.imageUrl, options: idx.map((oi) => orig[oi]), points: q.points, sortOrder: q.sortOrder };
    });
    const questionSetNew = JSON.stringify(finalSet.map((q) => q.id));
    try {
      if (!existing) {
        await prisma.testSubmission.create({
          data: { applicantId: applicant.id, testType: category, score: 0, showScore: false, answers: "{}", questionSet: questionSetNew, optionMap: JSON.stringify(optionMapNew), startedAt: new Date() } as any,
        });
      } else if (!existing.submittedAt) {
        await prisma.testSubmission.update({ where: { id: existing.id }, data: { questionSet: questionSetNew, optionMap: JSON.stringify(optionMapNew), startedAt: existing.startedAt || new Date() } as any });
      }
    } catch (e: any) {
      console.warn("Save questionSet skipped:", e?.message);
    }
    return NextResponse.json({
      success: true, category, totalQuestions: sanitizedNew.length,
      pgCount: pickedPg.length, essayCount: pickedEssay.length,
      bankPgTotal: pool.filter((q) => (q.questionType || "single_choice") !== "essay").length,
      bankEssayTotal: pool.filter((q) => (q.questionType || "single_choice") === "essay").length,
      questions: sanitizedNew, reused: false,
    });
  } catch (error: any) {
    console.error("Fetch questions error:", error);
    return NextResponse.json({ error: "Gagal memuat soal ujian." }, { status: 500 });
  }
}
