import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from './lib/auth';

/**
 * Next.js 16.3.4 Proxy (formerly middleware.ts)
 * Penegakan Sesi Admin & First-Login MFA (Opsi A)
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Baca cookie admin_session
  const token = request.cookies.get('admin_session')?.value;
  const isApiRoute = pathname.startsWith('/api/admin');
  const isAdminPageRoute = pathname.startsWith('/admin');

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (isAdminPageRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Verifikasi JWT token sesi admin
  const session = await verifyAdminToken(token);
  if (!session) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized: Sesi tidak valid atau kedaluwarsa' }, { status: 401 });
    }
    if (isAdminPageRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Saklar server-side FIRST_LOGIN_ENFORCE (bukan NEXT_PUBLIC)
  const isEnforceEnabled = process.env.FIRST_LOGIN_ENFORCE === 'true';
  if (!isEnforceEnabled) {
    return NextResponse.next();
  }

  // Whitelist rute API penyelesaian sesi
  const apiSessionCompletionWhitelist = [
    '/api/admin/change-password',
    '/api/admin/session',
    '/api/admin/logout',
    '/api/admin/mfa',
  ];

  const isApiWhitelisted = apiSessionCompletionWhitelist.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const mustChangePassword = Boolean(session.mustChangePassword);
  const mfaRequired = Boolean(session.mfaRequired);
  const mfaVerified = session.mfaVerified !== undefined ? Boolean(session.mfaVerified) : Boolean(session.isMfaVerified);

  // 1. Penegakan Ganti Password (First Login)
  if (mustChangePassword) {
    if (isApiRoute && !isApiWhitelisted) {
      return NextResponse.json(
        {
          error: 'SESSION_INCOMPLETE',
          code: 'MUST_CHANGE_PASSWORD',
          message: 'Sesi belum lengkap: Anda wajib memperbarui kata sandi sebelum dapat mengakses sistem.',
        },
        { status: 403 }
      );
    }

    if (isAdminPageRoute && pathname !== '/admin/change-password') {
      return NextResponse.redirect(new URL('/admin/change-password', request.url));
    }

    return NextResponse.next();
  }

  // 2. Penegakan Aktivasi MFA (Setup Google Authenticator)
  if (mfaRequired) {
    if (isApiRoute && !isApiWhitelisted) {
      return NextResponse.json(
        {
          error: 'SESSION_INCOMPLETE',
          code: 'MFA_SETUP_REQUIRED',
          message: 'Sesi belum lengkap: Anda wajib mengaktifkan Autentikasi Dua Langkah (MFA) sebelum dapat mengakses sistem.',
        },
        { status: 403 }
      );
    }

    if (isAdminPageRoute && pathname !== '/admin/mfa') {
      return NextResponse.redirect(new URL('/admin/mfa?setup=first-time', request.url));
    }

    return NextResponse.next();
  }

  // 3. Penegakan Verifikasi TOTP Sesi Ini
  if (!mfaVerified) {
    if (isApiRoute && !isApiWhitelisted) {
      return NextResponse.json(
        {
          error: 'SESSION_INCOMPLETE',
          code: 'MFA_VERIFY_REQUIRED',
          message: 'Sesi belum lengkap: Verifikasi kode Authenticator diperlukan.',
        },
        { status: 403 }
      );
    }

    if (isAdminPageRoute && pathname !== '/admin/mfa') {
      return NextResponse.redirect(new URL('/admin/mfa', request.url));
    }

    return NextResponse.next();
  }

  // Sesi lengkap: izinkan request ke seluruh rute admin
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
