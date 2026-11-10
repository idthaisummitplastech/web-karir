import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { fetchAdminBackend } from '@/lib/api-client';

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Tidak memiliki hak akses.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const portal = searchParams.get('portal') || undefined;
    const location = searchParams.get('location') || undefined;
    const role = searchParams.get('role') || undefined;
    const qs = new URLSearchParams();
    if (portal) qs.set('portal', portal);
    if (location) qs.set('location', location);
    if (role) qs.set('role', role);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';

    const data = await fetchAdminBackend(session, `/cms/admin-menus${suffix}`);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to load admin menus' }, { status: 500 });
  }
}
