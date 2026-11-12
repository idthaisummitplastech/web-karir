// Test Runner untuk Verifikasi Alur D.3 Web-Karir
const { SignJWT, jwtVerify } = require('jose');

async function main() {
  console.log('=== VERIFIKASI UNIT TEST ALUR D.3 (WEB-KARIR PROXY & SESSION LOGIC) ===\n');

  const secretText = 'super-secret-key-for-testing-purposes-min-32-chars';
  const secret = new TextEncoder().encode(secretText);

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`[FAIL] ${message}`);
      throw new Error(`Test assertion failed: ${message}`);
    }
    console.log(`[PASS] ${message}`);
    passed++;
  }

  // 1. Uji Penerbitan & Verifikasi Token Admin Sesi
  async function signToken(payload) {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secret);
  }

  async function verifyToken(token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      if (!payload.adminId) return null;
      return payload;
    } catch {
      return null;
    }
  }

  // Simulasi Fungsi Proxy Logic
  function evaluateProxyAccess({ pathname, session, enforceEnabled }) {
    const isApiRoute = pathname.startsWith('/api/admin');
    const isAdminPageRoute = pathname.startsWith('/admin');

    if (!session) {
      if (isApiRoute) return { action: 'reject', status: 401, error: 'Unauthorized' };
      if (isAdminPageRoute) return { action: 'redirect', destination: '/login' };
      return { action: 'next' };
    }

    if (!enforceEnabled) {
      return { action: 'next' };
    }

    const apiWhitelist = [
      '/api/admin/change-password',
      '/api/admin/session',
      '/api/admin/logout',
      '/api/admin/mfa',
    ];

    const isApiWhitelisted = apiWhitelist.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    const mustChangePassword = Boolean(session.mustChangePassword);
    const mfaRequired = Boolean(session.mfaRequired);
    const mfaVerified = session.mfaVerified !== undefined ? Boolean(session.mfaVerified) : Boolean(session.isMfaVerified);

    if (mustChangePassword) {
      if (isApiRoute && !isApiWhitelisted) {
        return {
          action: 'reject',
          status: 403,
          code: 'MUST_CHANGE_PASSWORD',
          error: 'SESSION_INCOMPLETE',
        };
      }
      if (isAdminPageRoute && pathname !== '/admin/change-password') {
        return { action: 'redirect', destination: '/admin/change-password' };
      }
      return { action: 'next' };
    }

    if (mfaRequired) {
      if (isApiRoute && !isApiWhitelisted) {
        return {
          action: 'reject',
          status: 403,
          code: 'MFA_SETUP_REQUIRED',
          error: 'SESSION_INCOMPLETE',
        };
      }
      if (isAdminPageRoute && pathname !== '/admin/mfa') {
        return { action: 'redirect', destination: '/admin/mfa?setup=first-time' };
      }
      return { action: 'next' };
    }

    if (!mfaVerified) {
      if (isApiRoute && !isApiWhitelisted) {
        return {
          action: 'reject',
          status: 403,
          code: 'MFA_VERIFY_REQUIRED',
          error: 'SESSION_INCOMPLETE',
        };
      }
      if (isAdminPageRoute && pathname !== '/admin/mfa') {
        return { action: 'redirect', destination: '/admin/mfa' };
      }
      return { action: 'next' };
    }

    return { action: 'next' };
  }

  // --- KASUS UJI 1: Request Tanpa Sesi ---
  {
    const res1 = evaluateProxyAccess({ pathname: '/api/admin/applicants', session: null, enforceEnabled: true });
    assert(res1.action === 'reject' && res1.status === 401, 'Request API tanpa sesi ditolak 401 Unauthorized');

    const res2 = evaluateProxyAccess({ pathname: '/admin/applicants', session: null, enforceEnabled: true });
    assert(res2.action === 'redirect' && res2.destination === '/login', 'Request Halaman tanpa sesi dialihkan ke /login');
  }

  // --- KASUS UJI 2: Saklar FIRST_LOGIN_ENFORCE = false ---
  {
    const sessionIncomplete = {
      adminId: 1,
      username: 'admin',
      role: 'admin',
      mustChangePassword: true,
      mfaRequired: true,
      mfaVerified: false,
    };
    const res = evaluateProxyAccess({
      pathname: '/admin/applicants',
      session: sessionIncomplete,
      enforceEnabled: false,
    });
    assert(res.action === 'next', 'Saat FIRST_LOGIN_ENFORCE=false, akses langsung diizinkan tanpa redirect paksa');

    const resApi = evaluateProxyAccess({
      pathname: '/api/admin/applicants',
      session: sessionIncomplete,
      enforceEnabled: false,
    });
    assert(resApi.action === 'next', 'Saat FIRST_LOGIN_ENFORCE=false, API langsung diizinkan tanpa blokir');
  }

  // --- KASUS UJI 3: Saklar FIRST_LOGIN_ENFORCE = true (Tahap 1: First Login) ---
  {
    const token = await signToken({
      adminId: 10,
      username: 'new_staff',
      role: 'hr',
      mustChangePassword: true,
      mfaRequired: true,
      mfaVerified: false,
    });
    const verifiedSession = await verifyToken(token);
    assert(verifiedSession !== null && verifiedSession.mustChangePassword === true, 'Token first-login memuat klaim mustChangePassword=true');

    // 3a. Blokir API operasional
    const resBlockApi = evaluateProxyAccess({
      pathname: '/api/admin/applicants',
      session: verifiedSession,
      enforceEnabled: true,
    });
    assert(
      resBlockApi.action === 'reject' &&
      resBlockApi.status === 403 &&
      resBlockApi.code === 'MUST_CHANGE_PASSWORD',
      'API operasional diblokir 403 SESSION_INCOMPLETE (MUST_CHANGE_PASSWORD)'
    );

    // 3b. Whitelist API change-password diizinkan
    const resAllowApi = evaluateProxyAccess({
      pathname: '/api/admin/change-password',
      session: verifiedSession,
      enforceEnabled: true,
    });
    assert(resAllowApi.action === 'next', 'Rute API /api/admin/change-password diizinkan untuk penyelesaian sesi');

    // 3c. Redirect Page ke /admin/change-password
    const resRedirectPage = evaluateProxyAccess({
      pathname: '/admin/applicants',
      session: verifiedSession,
      enforceEnabled: true,
    });
    assert(
      resRedirectPage.action === 'redirect' &&
      resRedirectPage.destination === '/admin/change-password',
      'Halaman dashboard otomatis dialihkan ke /admin/change-password'
    );

    // 3d. Bebas Loop: Halaman /admin/change-password tidak redirect
    const resChangePage = evaluateProxyAccess({
      pathname: '/admin/change-password',
      session: verifiedSession,
      enforceEnabled: true,
    });
    assert(resChangePage.action === 'next', 'Halaman /admin/change-password diizinkan tanpa redirect loop');
  }

  // --- KASUS UJI 4: Tahap 2: Ganti Password Selesai -> Wajib Setup MFA ---
  {
    const tokenAfterPasswordChange = await signToken({
      adminId: 10,
      username: 'new_staff',
      role: 'hr',
      mustChangePassword: false,
      mfaRequired: true,
      mfaVerified: false,
    });
    const sessionStep2 = await verifyToken(tokenAfterPasswordChange);

    // 4a. API operasional diblokir dengan MFA_SETUP_REQUIRED
    const resBlockApi = evaluateProxyAccess({
      pathname: '/api/admin/jobs',
      session: sessionStep2,
      enforceEnabled: true,
    });
    assert(
      resBlockApi.action === 'reject' &&
      resBlockApi.status === 403 &&
      resBlockApi.code === 'MFA_SETUP_REQUIRED',
      'API operasional diblokir 403 SESSION_INCOMPLETE (MFA_SETUP_REQUIRED)'
    );

    // 4b. Redirect Page ke /admin/mfa?setup=first-time
    const resRedirectPage = evaluateProxyAccess({
      pathname: '/admin/employees',
      session: sessionStep2,
      enforceEnabled: true,
    });
    assert(
      resRedirectPage.action === 'redirect' &&
      resRedirectPage.destination === '/admin/mfa?setup=first-time',
      'Halaman dialihkan ke /admin/mfa?setup=first-time'
    );

    // 4c. Whitelist API mfa diizinkan
    const resAllowMfaApi = evaluateProxyAccess({
      pathname: '/api/admin/mfa/setup',
      session: sessionStep2,
      enforceEnabled: true,
    });
    assert(resAllowMfaApi.action === 'next', 'API /api/admin/mfa/* diizinkan untuk setup MFA');

    // 4d. Halaman /admin/mfa bebas loop
    const resMfaPage = evaluateProxyAccess({
      pathname: '/admin/mfa',
      session: sessionStep2,
      enforceEnabled: true,
    });
    assert(resMfaPage.action === 'next', 'Halaman /admin/mfa diizinkan tanpa redirect loop');
  }

  // --- KASUS UJI 5: Tahap 3: Setup MFA Selesai -> Sesi Lengkap (Dashboard Terbuka Penuh) ---
  {
    const tokenCompleted = await signToken({
      adminId: 10,
      username: 'new_staff',
      role: 'hr',
      mustChangePassword: false,
      mfaRequired: false,
      mfaVerified: true,
    });
    const sessionStep3 = await verifyToken(tokenCompleted);

    // 5a. Akses API operasional diizinkan penuh
    const resApi = evaluateProxyAccess({
      pathname: '/api/admin/applicants',
      session: sessionStep3,
      enforceEnabled: true,
    });
    assert(resApi.action === 'next', 'Sesi lengkap: Akses API operasional /api/admin/applicants disetujui');

    // 5b. Akses UI dashboard diizinkan penuh
    const resPage = evaluateProxyAccess({
      pathname: '/admin/applicants',
      session: sessionStep3,
      enforceEnabled: true,
    });
    assert(resPage.action === 'next', 'Sesi lengkap: Akses UI dashboard /admin/applicants disetujui');
  }

  // --- KASUS UJI 6: Integritas & Anti-Tampering ---
  {
    const invalidSignature = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.invalidsig123';
    const verified = await verifyToken(invalidSignature);
    assert(verified === null, 'Token dengan signature salah ditolak oleh verifier');
  }

  console.log(`\n=== SEMUA PENGUJIAN SELESAI: ${passed}/${total} PENGUJIAN LULUS 100% ===`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
