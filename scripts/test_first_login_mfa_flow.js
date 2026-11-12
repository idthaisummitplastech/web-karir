// Test Suite Komprehensif Alur D.3 Web-Karir
// Memanggil LANGSUNG fungsi proxy() asli dari src/proxy.ts dan NextRequest nyata Next.js

require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    target: 'es2022',
    skipLibCheck: true,
    esModuleInterop: true,
  },
  transpileOnly: true,
});

const path = require('path');
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    request = path.join(__dirname, '..', 'src', request.slice(2));
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const { NextRequest } = require('next/dist/server/web/spec-extension/request');
const { proxy } = require('../src/proxy');
const { signAdminToken } = require('../src/lib/auth');
const { enforceSessionCompleteness, SessionIncompleteError } = require('../src/lib/api-client');

async function runRealTests() {
  console.log('=== PENGUJIAN REALISTIS ALUR D.3 DENGAN PROXY ASLI & NEXTREQUEST NYATA ===\n');

  process.env.JWT_SECRET = 'super-secret-key-for-testing-purposes-min-32-chars';

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

  // --- KELOMPOK 1: Pengujian Request Tanpa Sesi Langsung ke proxy() Asli ---
  {
    const reqApi = new NextRequest('http://localhost:3009/api/admin/applicants');
    const resApi = await proxy(reqApi);
    assert(resApi.status === 401, '1. proxy() asli menolak API tanpa cookie sesi dengan HTTP 401');

    const reqPage = new NextRequest('http://localhost:3009/admin/applicants');
    const resPage = await proxy(reqPage);
    assert(resPage.status === 307, '2. proxy() asli mengalihkan Page tanpa sesi ke /login (status 307)');
    assert(resPage.headers.get('location') === 'http://localhost:3009/login', '3. Redirect URL persis ke /login');
  }

  // --- KELOMPOK 2: Saklar FIRST_LOGIN_ENFORCE = false Langsung ke proxy() Asli ---
  {
    process.env.FIRST_LOGIN_ENFORCE = 'false';

    const tokenIncomplete = await signAdminToken({
      adminId: 1,
      username: 'hr_user',
      name: 'HR User',
      email: 'hr@itsp.co.id',
      role: 'hr',
      isMfaVerified: false,
      mustChangePassword: true,
      mfaRequired: true,
      mfaVerified: false,
    });

    const req = new NextRequest('http://localhost:3009/admin/applicants', {
      headers: { cookie: `admin_session=${tokenIncomplete}` },
    });
    const res = await proxy(req);
    assert(!res.headers.get('location'), '4. Saat FIRST_LOGIN_ENFORCE=false, proxy() asli tidak melakukan redirect paksa');
  }

  // --- KELOMPOK 3: Saklar FIRST_LOGIN_ENFORCE = true (Tahap 1: First Login) ---
  {
    process.env.FIRST_LOGIN_ENFORCE = 'true';

    const firstLoginToken = await signAdminToken({
      adminId: 10,
      username: 'new_staff',
      name: 'Staff Baru',
      email: 'staff@itsp.co.id',
      role: 'hr',
      isMfaVerified: false,
      mustChangePassword: true,
      mfaRequired: true,
      mfaVerified: false,
    });

    // 3a. Blokir API operasional
    const reqApi = new NextRequest('http://localhost:3009/api/admin/applicants', {
      headers: { cookie: `admin_session=${firstLoginToken}` },
    });
    const resApi = await proxy(reqApi);
    assert(resApi.status === 403, '5. proxy() asli memblokir API operasional dengan HTTP 403 untuk first-login');
    const apiJson = await resApi.json();
    assert(apiJson.error === 'SESSION_INCOMPLETE' && apiJson.code === 'MUST_CHANGE_PASSWORD', '6. Kode error terstruktur: SESSION_INCOMPLETE / MUST_CHANGE_PASSWORD');

    // 3b. Whitelist API change-password diizinkan lewat
    const reqWhitelist = new NextRequest('http://localhost:3009/api/admin/change-password', {
      headers: { cookie: `admin_session=${firstLoginToken}` },
    });
    const resWhitelist = await proxy(reqWhitelist);
    assert(!resWhitelist.headers.get('location') && resWhitelist.status === 200, '7. proxy() asli mengizinkan rute whitelist /api/admin/change-password');

    // 3c. Redirect Page ke /admin/change-password
    const reqPage = new NextRequest('http://localhost:3009/admin/applicants', {
      headers: { cookie: `admin_session=${firstLoginToken}` },
    });
    const resPage = await proxy(reqPage);
    assert(resPage.headers.get('location') === 'http://localhost:3009/admin/change-password', '8. proxy() asli mengalihkan halaman UI ke /admin/change-password');

    // 3d. Bebas Loop: Halaman /admin/change-password tidak redirect
    const reqSelf = new NextRequest('http://localhost:3009/admin/change-password', {
      headers: { cookie: `admin_session=${firstLoginToken}` },
    });
    const resSelf = await proxy(reqSelf);
    assert(!resSelf.headers.get('location'), '9. Halaman /admin/change-password bebas redirect loop');
  }

  // --- KELOMPOK 4: Tahap 2: Setup MFA (mustChangePassword=false, mfaRequired=true) ---
  {
    process.env.FIRST_LOGIN_ENFORCE = 'true';

    const mfaSetupToken = await signAdminToken({
      adminId: 10,
      username: 'new_staff',
      name: 'Staff Baru',
      email: 'staff@itsp.co.id',
      role: 'hr',
      isMfaVerified: false,
      mustChangePassword: false,
      mfaRequired: true,
      mfaVerified: false,
    });

    const reqApi = new NextRequest('http://localhost:3009/api/admin/jobs', {
      headers: { cookie: `admin_session=${mfaSetupToken}` },
    });
    const resApi = await proxy(reqApi);
    assert(resApi.status === 403, '10. API operasional ditolak saat MFA belum diaktifkan');
    const apiJson = await resApi.json();
    assert(apiJson.code === 'MFA_SETUP_REQUIRED', '11. Kode error adalah MFA_SETUP_REQUIRED');

    const reqPage = new NextRequest('http://localhost:3009/admin/dashboard', {
      headers: { cookie: `admin_session=${mfaSetupToken}` },
    });
    const resPage = await proxy(reqPage);
    assert(resPage.headers.get('location') === 'http://localhost:3009/admin/mfa?setup=first-time', '12. UI dialihkan ke /admin/mfa?setup=first-time');

    const reqMfaPage = new NextRequest('http://localhost:3009/admin/mfa', {
      headers: { cookie: `admin_session=${mfaSetupToken}` },
    });
    const resMfaPage = await proxy(reqMfaPage);
    assert(!resMfaPage.headers.get('location'), '13. Halaman /admin/mfa diizinkan tanpa redirect loop');
  }

  // --- KELOMPOK 5: Tahap 3: Sesi Lengkap (mustChangePassword=false, mfaRequired=false, mfaVerified=true) ---
  {
    process.env.FIRST_LOGIN_ENFORCE = 'true';

    const fullToken = await signAdminToken({
      adminId: 10,
      username: 'new_staff',
      name: 'Staff Baru',
      email: 'staff@itsp.co.id',
      role: 'hr',
      isMfaVerified: true,
      mustChangePassword: false,
      mfaRequired: false,
      mfaVerified: true,
    });

    const reqApi = new NextRequest('http://localhost:3009/api/admin/applicants', {
      headers: { cookie: `admin_session=${fullToken}` },
    });
    const resApi = await proxy(reqApi);
    assert(resApi.status === 200, '14. Sesi lengkap: proxy() asli menyetujui akses API operasional');

    const reqPage = new NextRequest('http://localhost:3009/admin/applicants', {
      headers: { cookie: `admin_session=${fullToken}` },
    });
    const resPage = await proxy(reqPage);
    assert(!resPage.headers.get('location'), '15. Sesi lengkap: proxy() asli menyetujui UI dashboard tanpa redirect');
  }

  // --- KELOMPOK 6: PENEGAKAN DI HELPER (enforceSessionCompleteness di api-client.ts) ---
  {
    process.env.FIRST_LOGIN_ENFORCE = 'true';

    // 6a. Helper menolak session dengan mustChangePassword=true tanpa panggil backend
    let caughtMustChange = false;
    try {
      enforceSessionCompleteness({
        adminId: 1,
        username: 'staff',
        role: 'hr',
        email: 'staff@itsp.co.id',
        isMfaVerified: false,
        mustChangePassword: true,
        mfaRequired: false,
        mfaVerified: true,
      });
    } catch (e) {
      if (e instanceof SessionIncompleteError && e.code === 'MUST_CHANGE_PASSWORD') {
        caughtMustChange = true;
      }
    }
    assert(caughtMustChange, '16. Helper api-client menolak langsung sesi mustChangePassword tanpa menyentuh backend');

    // 6b. Helper menolak session dengan mfaRequired=true
    let caughtMfaRequired = false;
    try {
      enforceSessionCompleteness({
        adminId: 1,
        username: 'staff',
        role: 'hr',
        email: 'staff@itsp.co.id',
        isMfaVerified: false,
        mustChangePassword: false,
        mfaRequired: true,
        mfaVerified: true,
      });
    } catch (e) {
      if (e instanceof SessionIncompleteError && e.code === 'MFA_SETUP_REQUIRED') {
        caughtMfaRequired = true;
      }
    }
    assert(caughtMfaRequired, '17. Helper api-client menolak langsung sesi mfaRequired tanpa menyentuh backend');

    // 6c. Helper mengizinkan jika bypass=true (misal saat change-password/mfa setup)
    let bypassOk = false;
    try {
      enforceSessionCompleteness({
        adminId: 1,
        username: 'staff',
        role: 'hr',
        email: 'staff@itsp.co.id',
        isMfaVerified: false,
        mustChangePassword: true,
        mfaRequired: true,
        mfaVerified: false,
      }, true);
      bypassOk = true;
    } catch { }
    assert(bypassOk, '18. Helper api-client mengizinkan bypass saat dipanggil rute setup penyelesaian sesi');
  }

  // --- KELOMPOK 7: Regresi Alur Handler admin-login/route.ts (A.2) ---
  {
    const { POST } = require('../src/app/api/auth/admin-login/route');

    // 7a. Kredensial kosong ditolak HTTP 400
    const reqEmpty = new NextRequest('http://localhost:3009/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ employee_id: '', password: '' }),
    });
    const resEmpty = await POST(reqEmpty);
    assert(resEmpty.status === 400, '19. admin-login: Kredensial kosong ditolak dengan HTTP 400');
    const bodyEmpty = await resEmpty.json();
    assert(bodyEmpty.error.includes('required'), '20. admin-login: Pesan error kredensial wajib');

    // 7b. Kredensial password kosong saja ditolak HTTP 400
    const reqNoPass = new NextRequest('http://localhost:3009/api/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ employee_id: 'ITSP.001', password: '' }),
    });
    const resNoPass = await POST(reqNoPass);
    assert(resNoPass.status === 400, '21. admin-login: Password kosong ditolak dengan HTTP 400');
  }

  console.log(`\n=== SEMUA PENGUJIAN SELESAI: ${passed}/${total} PENGUJIAN LULUS 100% ===`);
}

runRealTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
