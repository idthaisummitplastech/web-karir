/**
 * Sentral URL runtime via env (web-karir) — ganti domain cukup sentuh .env.
 * Tanpa hardcoded localhost/domain di code (fail-fast bila kosong).
 *
 * Env yang dipakai (lihat .env.example):
 *  - BACKEND_API_URL            (wajib, server-only, contoh http://localhost:8004/api/v1)
 *  - NEXT_PUBLIC_APP_URL        (wajib untuk link publik karir, contoh http://localhost:3009)
 *  - CAREER_SITE_URL            (alias server-side untuk NEXT_PUBLIC_APP_URL, dipakai di compose)
 *  - NEXT_PUBLIC_COMPANY_URL / COMPANY_SITE_URL (opsional, tautan silang company, contoh http://localhost:3008)
 */

function readEnv(name: string): string {
  const v = process.env[name];
  return (v ?? '').trim();
}

function requiredEnv(name: string, altNames: string[] = []): string {
  const primary = readEnv(name);
  if (primary) return primary;
  for (const alt of altNames) {
    const v = readEnv(alt);
    if (v) return v;
  }
  throw new Error(
    `${name} belum diisi via env. Isi file .env — lihat .env.example. ` +
      `Ganti URL cukup via env, tanpa ubah code.`
  );
}

function stripTrailingSlash(v: string): string {
  return v.replace(/\/+$/, '');
}

/** Backend base tanpa trailing slash, selalu berakhiran /api/v1. */
export function getBackendBaseUrl(): string {
  const raw = stripTrailingSlash(requiredEnv('BACKEND_API_URL'));
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
}

/** URL publik portal karir (dipakai email & link portal). */
export function getAppUrl(): string {
  // Dukung dua nama agar fleksibel: NEXT_PUBLIC_* (client) & CAREER_SITE_URL (compose/server).
  return stripTrailingSlash(requiredEnv('NEXT_PUBLIC_APP_URL', ['CAREER_SITE_URL']));
}

/** Alias konsisten dengan web-perusahaan (getCareerUrl). */
export function getCareerUrl(): string {
  return getAppUrl();
}

/** URL publik company profile (untuk tautan silang, opsional -> '' bila belum diisi). */
export function getCompanyUrl(): string {
  const v = readEnv('NEXT_PUBLIC_COMPANY_URL') || readEnv('COMPANY_SITE_URL');
  return stripTrailingSlash(v);
}
