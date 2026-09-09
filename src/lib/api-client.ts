/**
 * Central Enterprise API Client for PT Indonesia Thai Summit Plastech (Career Portal / ATS)
 * Routes all data access to Python FastAPI Backend (Zero Direct DB Touch)
 */

const FALLBACK_BACKEND_URL = 'http://localhost:8000';
const INTERNAL_SECRET = process.env.BACKEND_INTERNAL_SECRET || 'pt-itsp-recruitment-ats-enterprise-jwt-secret-key-2026';

/**
 * Normalise backend base URL:
 * - trim whitespace, remove trailing slashes
 * - always ensure single `/api/v1` suffix (no double prefix)
 */
function getBackendBase(): string {
  const raw = (process.env.BACKEND_API_URL || FALLBACK_BACKEND_URL).trim().replace(/\/+$/, '');
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
}

/** Build full backend URL consistently (handles trailing slash + optional /api/v1 prefix). */
export function buildBackendUrl(endpoint: string): string {
  const base = getBackendBase();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const path = cleanEndpoint.startsWith('/api/v1') ? cleanEndpoint.slice('/api/v1'.length) : cleanEndpoint;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

// Kept for backward-compat; always normalised (no trailing slash, includes /api/v1).
export const BACKEND_API_URL = getBackendBase();

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

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': INTERNAL_SECRET,
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

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Secret': INTERNAL_SECRET,
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
