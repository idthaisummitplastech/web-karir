import { NextResponse } from 'next/server';
import { fetchFromBackend } from '@/lib/api-client';
function getInternalSecret(): string { const s = process.env.BACKEND_INTERNAL_SECRET; if (!s) throw new Error('BACKEND_INTERNAL_SECRET belum diisi via env'); return s; }
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const portal = searchParams.get('portal') || undefined;
    const location = searchParams.get('location') || undefined;
    const role = searchParams.get('role') || undefined;
    const qs = new URLSearchParams(); if (portal) qs.set('portal', portal); if (location) qs.set('location', location); if (role) qs.set('role', role);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    const data = await fetchFromBackend(`/cms/admin-menus${suffix}`, { headers: { 'X-Internal-Secret': getInternalSecret() } });
    return NextResponse.json(data);
  } catch (e: any) { return NextResponse.json({ error: e.message || 'Failed to load admin menus' }, { status: 500 }); }
}
