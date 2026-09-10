/**
 * Central Enterprise API Client for PT Indonesia Thai Summit Plastech (Career Portal / ATS)
 * Routes all data access to Python FastAPI Backend (Zero Direct DB Touch)
 * URL 100% via env (lihat src/lib/urls.ts) — tanpa hardcoded localhost/domain.
 */
import { getBackendBaseUrl } from './urls';

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
      throw new Error(errorJson.detail || errorJson.message || `Backend API error (HTTP ${res.status})`);
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
    throw new Error(errorJson.detail || errorJson.message || `Backend API error (HTTP ${res.status})`);
  }

  const json = await res.json();
  return dualCaseObject(json) as T;
}

export { dualCaseObject };
