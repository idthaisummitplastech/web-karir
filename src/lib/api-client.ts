/**
 * Central Enterprise API Client for PT Indonesia Thai Summit Plastech (Career Portal / ATS)
 * Routes all data access to Python FastAPI Backend (Zero Direct DB Touch)
 * URL 100% via env (lihat src/lib/urls.ts) — tanpa hardcoded localhost/domain.
 */
import { getBackendBaseUrl } from './urls';
import type { AdminTokenPayload } from './auth';

function getInternalSecret(): string {
  const s = process.env.BACKEND_INTERNAL_SECRET;
  if (!s) {
    throw new Error(
      'BACKEND_INTERNAL_SECRET belum diisi via env. Isi file .env — lihat .env.example. Dilarang fallback hardcoded di code.'
    );
  }
  return s;
}

/**
 * Normalise backend base URL (100% via env):
 * - trim whitespace, remove trailing slashes
 * - always ensure single `/api/v1` suffix (no double prefix)
 * Ganti backend cukup via env BACKEND_API_URL — tanpa ubah code.
 */
function getBackendBase(): string {
  return getBackendBaseUrl();
}

/** Lazy getter (fail-fast via env, tanpa evaluasi saat import). */
export function getBackendApiUrl(): string {
  return getBackendBase();
}

/** Build full backend URL consistently (handles trailing slash + optional /api/v1 prefix). */
export function buildBackendUrl(endpoint: string): string {
  const base = getBackendBase();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const path = cleanEndpoint.startsWith('/api/v1') ? cleanEndpoint.slice('/api/v1'.length) : cleanEndpoint;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

// Recursively ensures both camelCase and snake_case properties are available
function dualCaseObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(dualCaseObject);
  }
  if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const val = dualCaseObject(obj[key]);
      result[key] = val;

      // Convert snake_case to camelCase
      if (key.includes('_')) {
        const camelKey = key.replace(/_([a-z0-9])/g, (_, l) => l.toUpperCase());
        result[camelKey] = val;
      }
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (snakeKey !== key) {
        result[snakeKey] = val;
      }
    }
    return result;
  }
  return obj;
}

function extractBackendErrorMessage(errorJson: any, status: number): string {
  if (!errorJson) return `Backend API error (HTTP ${status})`;
  if (typeof errorJson.detail === 'string') return errorJson.detail;
  if (typeof errorJson.error === 'string') return errorJson.error;
  if (typeof errorJson.message === 'string') return errorJson.message;
  if (Array.isArray(errorJson.detail)) {
    return errorJson.detail
      .map((d: any) => {
        if (typeof d === 'string') return d;
        const loc = Array.isArray(d.loc) ? d.loc.filter((x: any) => x !== 'body').join('.') : '';
        const msg = d.msg || d.message || JSON.stringify(d);
        return loc ? `${loc}: ${msg}` : msg;
      })
      .join(', ');
  }
  if (errorJson.detail && typeof errorJson.detail === 'object') {
    return errorJson.detail.msg || errorJson.detail.message || JSON.stringify(errorJson.detail);
  }
  return `Backend API error (HTTP ${status})`;
}

export async function fetchFromBackend<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = buildBackendUrl(endpoint);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const internalSecret = getInternalSecret();

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': internalSecret,
        ...options?.headers,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(extractBackendErrorMessage(errorJson, res.status));
    }

    const json = await res.json();
    const data = json.data !== undefined ? json.data : json;
    return dualCaseObject(data) as T;
  } catch (err: any) {
    console.error(`[API-CLIENT ERROR] ${cleanEndpoint}:`, err.message);
    throw err;
  }
}

/**
 * Raw fetch that returns the full JSON response (not just .data)
 */
export async function fetchRawFromBackend<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = buildBackendUrl(endpoint);
  const internalSecret = getInternalSecret();

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Secret': internalSecret,
      ...options?.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(extractBackendErrorMessage(errorJson, res.status));
  }

  const json = await res.json();
  return dualCaseObject(json) as T;
}

export class SessionIncompleteError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'SessionIncompleteError';
    this.code = code;
  }
}

export interface AdminRequestOptions extends RequestInit {
  bypassEnforcement?: boolean;
}

/**
 * Penegakan kelengkapan sesi di tingkat helper (defense-in-depth).
 * Menolak panggilan ke backend jika mustChangePassword atau mfaRequired atau belum mfaVerified,
 * tanpa menyentuh backend sama sekali.
 */
export function enforceSessionCompleteness(
  session: AdminTokenPayload | null | undefined,
  bypass?: boolean
): void {
  if (!session) {
    throw new Error('Sesi admin tidak ditemukan atau tidak valid.');
  }

  if (bypass) {
    return;
  }

  const enforce = process.env.FIRST_LOGIN_ENFORCE === 'true';
  if (!enforce) {
    return;
  }

  if (session.mustChangePassword) {
    throw new SessionIncompleteError(
      'MUST_CHANGE_PASSWORD',
      'SESSION_INCOMPLETE: Akun wajib mengganti kata sandi awal terlebih dahulu.'
    );
  }

  if (session.mfaRequired) {
    throw new SessionIncompleteError(
      'MFA_SETUP_REQUIRED',
      'SESSION_INCOMPLETE: Akun wajib mengaktifkan autentikasi dua faktor (MFA) terlebih dahulu.'
    );
  }

  const isVerified = session.mfaVerified !== undefined ? session.mfaVerified : session.isMfaVerified;
  if (!isVerified) {
    throw new SessionIncompleteError(
      'MFA_VERIFY_REQUIRED',
      'SESSION_INCOMPLETE: Akun wajib memverifikasi kode MFA pada sesi login ini.'
    );
  }
}

function handleBackendSessionErrors(err: any): never {
  const msg = String(err?.message || '');
  if (msg.includes('FIRST_LOGIN_REQUIRED')) {
    throw new SessionIncompleteError('MUST_CHANGE_PASSWORD', msg);
  }
  if (msg.includes('MFA_SETUP_REQUIRED')) {
    throw new SessionIncompleteError('MFA_SETUP_REQUIRED', msg);
  }
  if (msg.includes('MFA_SESSION_EXPIRED')) {
    throw new SessionIncompleteError('MFA_SESSION_EXPIRED', msg);
  }
  if (msg.includes('MFA_VERIFICATION_REQUIRED')) {
    throw new SessionIncompleteError('MFA_VERIFY_REQUIRED', msg);
  }
  throw err;
}

/**
 * Enterprise Admin API Client: Automatically passes verified session identity
 * (X-Admin-Id, X-Admin-Role, X-Admin-Department, X-Session-Version) along with internal secret.
 * Enforces server-side authentication before contacting FastAPI backend.
 */
export async function fetchAdminBackend<T = any>(
  session: AdminTokenPayload | null | undefined,
  endpoint: string,
  options?: AdminRequestOptions
): Promise<T> {
  if (!session) {
    throw new Error('Sesi admin tidak ditemukan atau tidak valid.');
  }

  // Penegakan sisi helper sebelum menyentuh backend
  enforceSessionCompleteness(session, options?.bypassEnforcement);

  const customHeaders: Record<string, string> = {
    'X-Admin-Id': String(session.adminId),
    'X-Admin-Role': session.role,
    'X-Admin-Department': session.department || '',
    'X-Session-Version': String(session.sessionVersion ?? 1),
  };

  try {
    return await fetchFromBackend<T>(endpoint, {
      ...options,
      headers: {
        ...customHeaders,
        ...options?.headers,
      },
    });
  } catch (err: any) {
    handleBackendSessionErrors(err);
  }
}

/**
 * Enterprise Admin API Client (Raw JSON response): Automatically passes verified session identity
 * (X-Admin-Id, X-Admin-Role, X-Admin-Department, X-Session-Version) along with internal secret.
 */
export async function fetchAdminRawBackend<T = any>(
  session: AdminTokenPayload | null | undefined,
  endpoint: string,
  options?: AdminRequestOptions
): Promise<T> {
  if (!session) {
    throw new Error('Sesi admin tidak ditemukan atau tidak valid.');
  }

  // Penegakan sisi helper sebelum menyentuh backend
  enforceSessionCompleteness(session, options?.bypassEnforcement);

  const customHeaders: Record<string, string> = {
    'X-Admin-Id': String(session.adminId),
    'X-Admin-Role': session.role,
    'X-Admin-Department': session.department || '',
    'X-Session-Version': String(session.sessionVersion ?? 1),
  };

  try {
    return await fetchRawFromBackend<T>(endpoint, {
      ...options,
      headers: {
        ...customHeaders,
        ...options?.headers,
      },
    });
  } catch (err: any) {
    handleBackendSessionErrors(err);
  }
}

export { dualCaseObject };
