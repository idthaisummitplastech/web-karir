/**
 * Script Pengujian Koneksi SMTP Email Zimbra / Korporat
 * PT Indonesia Thai Summit Plastech
 * 
 * Jalankan perintah:
 *   node test_smtp_zimbra.js
 */

const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testZimbraSMTP() {
  console.log('====================================================');
  console.log('  UJI KONEKSI EMAIL KORPORAT / ZIMBRA PT ITSP');
  console.log('====================================================');

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  console.log('Parameter Konfigurasi dari .env:');
  console.log('- SMTP Host :', host || '(KOSONG)');
  console.log('- SMTP Port :', port);
  console.log('- SMTP User :', user || '(KOSONG)');
  console.log('- SMTP Pass :', pass ? '********' : '(KOSONG)');
  console.log('- SMTP From :', from);
  console.log('----------------------------------------------------');

  if (!host || !user || !pass) {
    console.error('[ERROR] Parameter SMTP belum lengkap di file .env!');
    console.log('Silakan lengkapi SMTP_HOST, SMTP_USER, dan SMTP_PASS.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false, // Kompatibel dengan sertifikat internal Zimbra
    },
    connectionTimeout: 10000, // 10 detik timeout
  });

  console.log('1. Menguji koneksi handshake ke server mail...');
  try {
    await transporter.verify();
    console.log('   [BERHASIL] Server SMTP merespons dan autentikasi berhasil!');
  } catch (verifyErr) {
    console.error('   [GAGAL] Tidak dapat terhubung ke server SMTP:');
    console.error('   Pesan error:', verifyErr.message);
    console.log('\nSaran Troubleshooting:');
    console.log('1. Cek apakah alamat host server (misal mail.thaisummit.co.id atau IP) sudah benar.');
    console.log('2. Coba ganti port ke 465 (SSL) atau 587 (TLS).');
    console.log('3. Pastikan username dan password email Zimbra sesuai.');
    process.exit(1);
  }

  console.log('2. Mengirimkan email uji coba ke:', user);
  try {
    const info = await transporter.sendMail({
      from,
      to: user,
      subject: 'Uji Coba Pengiriman Email Zimbra PT ITSP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3 style="color: #018730;">Uji Coba Koneksi Zimbra Berhasil!</h3>
          <p>Email ini dikirimkan secara otomatis dari sistem Portal Rekrutmen PT ITSP untuk memastikan konfigurasi SMTP korporat bekerja dengan normal.</p>
          <hr style="border: none; border-top: 1px solid #eee;">
          <small style="color: #888;">Timestamp: ${new Date().toLocaleString('id-ID')}</small>
        </div>
      `,
    });

    console.log('   [SUKSES] Email uji coba berhasil dikirim!');
    console.log('   Message ID:', info.messageId);
    console.log('\nSelamat! Server Zimbra Anda siap digunakan untuk sistem rekrutmen & portal.');
  } catch (sendErr) {
    console.error('   [GAGAL] Terjadi kesalahan saat mengirim email:');
    console.error('   Pesan error:', sendErr.message);
  }
}

testZimbraSMTP();
