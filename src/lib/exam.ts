/**
 * Helper randomisasi ujian per peserta.
 * - Acak urutan soal PG (single_choice + multi_choice) per peserta
 * - Essay selalu paling akhir
 * - Acak urutan opsi jawaban per peserta (unik tiap user)
 */

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function isEssay(q: { questionType?: string | null }) {
  return (q.questionType || "single_choice") === "essay";
}

export function isPg(q: { questionType?: string | null }) {
  return !isEssay(q);
}

export function parseOptions(optionsJson: string): string[] {
  try {
    const v = JSON.parse(optionsJson || "[]");
    return Array.isArray(v) ? v.map((x) => String(x)) : [];
  } catch {
    return [];
  }
}

/** Ambil config jumlah soal dari RecruitmentSetting (fallback default). */
export function getExamCounts(
  settingsMap: Record<string, string>,
  category: string
): { pgCount: number; essayCount: number } {
  if (category === "psikotes") {
    const pg = parseInt(settingsMap["exam_psikotes_pg_count"] || "10", 10);
    const essay = parseInt(settingsMap["exam_psikotes_essay_count"] || "5", 10);
    return {
      pgCount: Number.isFinite(pg) && pg > 0 ? pg : 10,
      essayCount: Number.isFinite(essay) && essay >= 0 ? essay : 5,
    };
  }
  const pg = parseInt(settingsMap["exam_user_test_pg_count"] || "10", 10);
  const essay = parseInt(settingsMap["exam_user_test_essay_count"] || "5", 10);
  return {
    pgCount: Number.isFinite(pg) && pg > 0 ? pg : 10,
    essayCount: Number.isFinite(essay) && essay >= 0 ? essay : 5,
  };
}

export const DEFAULT_EXAM_COUNTS = {
  psikotesPg: 10,
  psikotesEssay: 5,
  userTestPg: 10,
  userTestEssay: 5,
};
