import nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  applicantName: string;
  positionTitle: string;
  subject: string;
  contentHtml: string;
}

export async function sendMailDirect({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || `PT ITSP Recruitment <${user || 'recruitment@itsp.co.id'}>`;

    if (!user || !pass) {
      console.warn('[EMAIL WARNING] SMTP_USER atau SMTP_PASS belum diset di .env');
      return { success: false, error: 'Kredensial SMTP belum diset.' };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log('[EMAIL SENT] Berhasil mengirim email ke:', to, 'Message ID:', info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error('[EMAIL ERROR] Gagal mengirim email ke:', to, error.message);
    return { success: false, error: error.message };
  }
}

export function generateCorporateEmailWrapper(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .email-card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #018730 0%, #005c21 100%); padding: 28px 32px; color: #ffffff; text-align: left; position: relative; border-bottom: 4px solid #fc4509; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #d1fae5; }
    .content { padding: 32px; font-size: 15px; line-height: 1.65; color: #334155; }
    .greeting { font-size: 17px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
    .info-box { background: #f8fafc; border: 1px solid #cbd5e1; border-left: 5px solid #018730; padding: 18px 20px; border-radius: 6px; margin: 20px 0; }
    .info-item { display: flex; margin-bottom: 8px; font-size: 14px; }
    .info-label { width: 140px; font-weight: 600; color: #475569; }
    .info-value { flex: 1; color: #0f172a; }
    .btn-action { display: inline-block; background: #018730; color: #ffffff !important; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: 600; border-radius: 6px; margin: 24px 0; }
    .footer { background: #0f172a; padding: 24px 32px; color: #94a3b8; font-size: 12px; line-height: 1.6; text-align: center; }
    .footer strong { color: #f8fafc; }
    .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="email-card">
    <div class="header">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #fed7aa; font-weight: 700;">Human Capital Management</div>
      <h1>PT INDONESIA THAI SUMMIT PLASTECH</h1>
      <p>Sistem Rekrutmen Terpadu & Portal Karir Resmi</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <strong>PT Indonesia Thai Summit Plastech (Thai Summit Group)</strong><br>
      Plant 1: Kawasan Industri KIIC, Lot FF-3, Karawang Barat 41361<br>
      Plant 2: Greenland International Industrial Center (GIIC), Deltamas, Cikarang Pusat 17530<br>
      <div style="margin-top: 10px; color: #64748b; font-size: 11px;">
        Email ini dikirimkan otomatis oleh Sistem ATS Resmi PT ITSP. Mohon tidak membalas langsung ke alamat email ini.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// 1. Pendaftaran Berhasil
export function emailAccountCreated(name: string, position: string, email: string, tempPass: string, appUrl: string) {
  const body = `
    <div class="greeting">Yth. Sdr/i. ${name},</div>
    <p>Terima kasih atas minat dan antusiasme Anda untuk bergabung dengan <strong>PT Indonesia Thai Summit Plastech</strong> untuk posisi <strong>${position}</strong>.</p>
    <p>Berkas lamaran Anda telah kami terima dalam sistem. Akun portal kandidat Anda telah aktif, silakan login untuk memantau status perkembangan seleksi 7 tahap Anda secara langsung:</p>
    
    <div class="info-box">
      <div class="info-item"><span class="info-label">Email Login:</span> <span class="info-value"><strong>${email}</strong></span></div>
      <div class="info-item"><span class="info-label">Password Sementara:</span> <span class="info-value"><strong>${tempPass}</strong></span></div>
      <div class="info-item"><span class="info-label">Posisi Dilamar:</span> <span class="info-value">${position}</span></div>
      <div class="info-item"><span class="info-label">Tahap Saat Ini:</span> <span class="info-value"><span class="badge">Tahap 1: Screening Dokumen & CV</span></span></div>
    </div>

    <p>Silakan akses portal pelamar menggunakan tautan di bawah ini:</p>
    <div style="text-align: center;">
      <a href="${appUrl}/login" class="btn-action">Masuk ke Portal Karir PT ITSP &rarr;</a>
    </div>
    <p>Mohon jaga kerahasiaan kredensial login Anda. Informasi hasil screening berkas akan kami perbarui sesegera mungkin.</p>
  `;
  return generateCorporateEmailWrapper("Konfirmasi Pendaftaran Lamaran - PT ITSP", body);
}

// 2. Lolos Screening Dokumen & Undangan Psikotes
export function emailScreeningPassed(name: string, position: string, scheduledAt: string, appUrl: string) {
  const body = `
    <div class="greeting">Yth. Sdr/i. ${name},</div>
    <p>Berdasarkan hasil evaluasi kualifikasi dan verifikasi berkas administrasi yang Anda kirimkan, Tim Rekrutmen <strong>PT Indonesia Thai Summit Plastech</strong> menyatakan bahwa Anda:</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <span style="background: #dcfce7; color: #15803d; padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 16px; border: 1px solid #86efac;">
        LOLOS TAHAP SCREENING DOKUMEN & ADMINISTRASI
      </span>
    </div>

    <p>Selanjutnya, Anda diundang untuk mengikuti <strong>Tahap 2: Tes Psikotes Online</strong> yang akan dilaksanakan pada:</p>
    <div class="info-box">
      <div class="info-item"><span class="info-label">Mata Ujian:</span> <span class="info-value">Tes Psikotes & Potensi Akademik Online</span></div>
      <div class="info-item"><span class="info-label">Jadwal Pelaksanaan:</span> <span class="info-value"><strong>${scheduledAt || "Akan diumumkan / Terbuka di Dashboard"}</strong></span></div>
      <div class="info-item"><span class="info-label">Lokasi:</span> <span class="info-value">Portal Ujian Karir PT ITSP</span></div>
      <div class="info-item"><span class="info-label">Ketentuan Khusus:</span> <span class="info-value">Tombol tes akan aktif pada jadwal yang ditentukan. Password / Token Sesi Ujian akan dibagikan oleh Tim HR sesaat sebelum tes dimulai.</span></div>
    </div>

    <p><strong>Perhatian Sistem Anti-Kecurangan:</strong> Selama ujian berlangsung, peserta dilarang keras membuka tab browser baru atau berpindah aplikasi (AI/LLM). Sistem dilengkapi sensor proctoring otomatis yang akan menghentikan ujian jika terjadi pelanggaran berulang.</p>

    <div style="text-align: center;">
      <a href="${appUrl}/portal/dashboard" class="btn-action">Buka Portal & Cek Jadwal Tes &rarr;</a>
    </div>
  `;
  return generateCorporateEmailWrapper("Undangan Tes Psikotes Online - PT ITSP", body);
}

// 3. Lolos Psikotes & Undangan Tes User / Teknis
export function emailPsikotesPassed(name: string, position: string, scheduledAt: string, appUrl: string) {
  const body = `
    <div class="greeting">Yth. Sdr/i. ${name},</div>
    <p>Selamat! Anda dinyatakan <strong>LOLOS Tahap 2: Tes Psikotes Online</strong> untuk posisi <strong>${position}</strong> di PT Indonesia Thai Summit Plastech.</p>
    <p>Anda berhak melanjutkan ke <strong>Tahap 3: Tes Teknis / User Test Departemen</strong>:</p>
    
    <div class="info-box">
      <div class="info-item"><span class="info-label">Materi Ujian:</span> <span class="info-value">Uji Kompetensi Teknis & Keahlian Bidang</span></div>
      <div class="info-item"><span class="info-label">Waktu:</span> <span class="info-value"><strong>${scheduledAt || "Sesuai Jadwal di Dashboard"}</strong></span></div>
      <div class="info-item"><span class="info-label">Akses Ujian:</span> <span class="info-value">Memerlukan Token Ujian User yang dibagikan oleh penilai departemen</span></div>
    </div>

    <div style="text-align: center;">
      <a href="${appUrl}/portal/dashboard" class="btn-action">Akses Ujian Teknis di Dashboard &rarr;</a>
    </div>
  `;
  return generateCorporateEmailWrapper("Undangan Tes Teknis / User Test - PT ITSP", body);
}

// 4. Undangan Interview HR (Teams / Zoom / Onsite)
export function emailHrInterviewInvite(name: string, position: string, scheduleInfo: {
  scheduledAt: string;
  locationMode: string;
  meetingPlatform?: string;
  meetingLink?: string;
  meetingPasscode?: string;
  locationAddress?: string;
  roomName?: string;
  notes?: string;
}, appUrl: string) {
  const isOnline = scheduleInfo.locationMode === "online";
  const body = `
    <div class="greeting">Yth. Sdr/i. ${name},</div>
    <p>Selamat! Berdasarkan hasil evaluasi tes online, Tim Human Capital Management <strong>PT Indonesia Thai Summit Plastech</strong> mengundang Anda untuk mengikuti <strong>Tahap 4: Interview HR (Wawancara SDM)</strong>.</p>
    
    <div class="info-box">
      <div class="info-item"><span class="info-label">Posisi:</span> <span class="info-value">${position}</span></div>
      <div class="info-item"><span class="info-label">Jadwal Waktu:</span> <span class="info-value"><strong>${scheduleInfo.scheduledAt}</strong></span></div>
      <div class="info-item"><span class="info-label">Mode Interview:</span> <span class="info-value"><strong>${isOnline ? "VIRTUAL ONLINE (" + (scheduleInfo.meetingPlatform || "MS Teams").toUpperCase() + ")" : "ONSITE DI PABRIK PERUSAHAAN"}</strong></span></div>
      
      ${isOnline ? `
      <div class="info-item"><span class="info-label">Tautan Meeting:</span> <span class="info-value"><a href="${scheduleInfo.meetingLink || '#'}" target="_blank" style="color: #018730; font-weight: 600;">Klik di sini untuk bergabung</a></span></div>
      ${scheduleInfo.meetingPasscode ? `<div class="info-item"><span class="info-label">Passcode / PIN:</span> <span class="info-value"><code>${scheduleInfo.meetingPasscode}</code></span></div>` : ""}
      ` : `
      <div class="info-item"><span class="info-label">Alamat Pabrik:</span> <span class="info-value">${scheduleInfo.locationAddress || "Kawasan Industri KIIC, Lot FF-3, Karawang Barat"}</span></div>
      ${scheduleInfo.roomName ? `<div class="info-item"><span class="info-label">Ruangan:</span> <span class="info-value">${scheduleInfo.roomName}</span></div>` : ""}
      `}
    </div>

    ${isOnline ? `
    <p><strong>Ketentuan Virtual Interview:</strong> Mohon bergabung 10 menit sebelum jadwal dimulai, menggunakan koneksi internet stabil, kamera aktif (On-Camera), serta mengenakan kemeja formal rapi.</p>
    ` : `
    <p><strong>Ketentuan Onsite:</strong> Mohon hadir 15 menit sebelum waktu interview, melapor ke pos security pabrik dengan menunjukkan KTP asli, mengenakan pakaian kemeja formal berkerah dan sepatu tertutup.</p>
    `}

    <div style="text-align: center;">
      <a href="${appUrl}/portal/dashboard" class="btn-action">Buka Ruang Tunggu Interview di Dashboard &rarr;</a>
    </div>
  `;
  return generateCorporateEmailWrapper("Undangan Resmi Interview HR - PT ITSP", body);
}

// 5. Undangan Interview User Departemen
export function emailUserInterviewInvite(name: string, position: string, scheduleInfo: {
  scheduledAt: string;
  locationMode: string;
  interviewerName?: string;
  meetingPlatform?: string;
  meetingLink?: string;
  meetingPasscode?: string;
  locationAddress?: string;
  roomName?: string;
}, appUrl: string) {
  const isOnline = scheduleInfo.locationMode === "online";
  const body = `
    <div class="greeting">Yth. Sdr/i. ${name},</div>
    <p>Anda dinyatakan <strong>LOLOS Tahap Interview HR</strong> dan diundang untuk melanjutkan ke <strong>Tahap 5: Interview User / Departemen Terkait</strong> bersama jajaran pimpinan divisi.</p>
    
    <div class="info-box">
      <div class="info-item"><span class="info-label">Posisi:</span> <span class="info-value">${position}</span></div>
      <div class="info-item"><span class="info-label">Waktu:</span> <span class="info-value"><strong>${scheduleInfo.scheduledAt}</strong></span></div>
      <div class="info-item"><span class="info-label">Pewawancara:</span> <span class="info-value">${scheduleInfo.interviewerName || "Tim Kepala Departemen & Supervisor Terkait"}</span></div>
      <div class="info-item"><span class="info-label">Mode:</span> <span class="info-value"><strong>${isOnline ? "VIRTUAL (" + (scheduleInfo.meetingPlatform || "MS Teams").toUpperCase() + ")" : "ONSITE DI PABRIK"}</strong></span></div>
      ${isOnline ? `
      <div class="info-item"><span class="info-label">Link Meeting:</span> <span class="info-value"><a href="${scheduleInfo.meetingLink || '#'}" target="_blank" style="color: #018730; font-weight: 600;">Gabung Video Meeting</a></span></div>
      ` : `
      <div class="info-item"><span class="info-label">Lokasi:</span> <span class="info-value">${scheduleInfo.locationAddress || "Pabrik PT ITSP"}</span></div>
      `}
    </div>

    <div style="text-align: center;">
      <a href="${appUrl}/portal/dashboard" class="btn-action">Lihat Rincian di Portal Karir &rarr;</a>
    </div>
  `;
  return generateCorporateEmailWrapper("Undangan Interview User / Departemen - PT ITSP", body);
}

// 6. Rujukan Medical Check-Up (MCU) Rekanan
export function emailMcuReferral(name: string, position: string, clinicName: string, clinicAddress: string, estimatedCost: string, instructions: string, appUrl: string) {
  const body = `
    <div class="greeting">Yth. Sdr/i. ${name},</div>
    <p>Selamat! Anda telah menyelesaikan seluruh rangkaian wawancara teknis dan dinyatakan berhak melanjutkan ke <strong>Tahap 6: Pemeriksaan Kesehatan Medis (Medical Check-Up / MCU)</strong>.</p>
    
    <div class="info-box">
      <div class="info-item"><span class="info-label">Fasilitas Rekanan:</span> <span class="info-value"><strong>${clinicName}</strong></span></div>
      <div class="info-item"><span class="info-label">Alamat Rujukan:</span> <span class="info-value">${clinicAddress}</span></div>
      <div class="info-item"><span class="info-label">Estimasi Biaya:</span> <span class="info-value"><strong>${estimatedCost}</strong></span></div>
      <div class="info-item"><span class="info-label">Petunjuk Medis:</span> <span class="info-value">${instructions}</span></div>
    </div>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px 18px; margin: 18px 0; font-size: 13.5px; color: #1e40af;">
      ℹ️ <strong>Catatan Penting:</strong> Anda <em>tidak perlu mengunggah berkas apa pun</em> ke website. Hasil pemeriksaan resmi akan dikirimkan secara langsung dan rahasia oleh pihak klinik/RS rekanan kepada Tim HR PT ITSP. Status kelolosan medis Anda akan diperbarui otomatis di portal pelamar.
    </div>

    <div style="text-align: center;">
      <a href="${appUrl}/portal/dashboard" class="btn-action">Lihat Surat Pengantar MCU di Portal &rarr;</a>
    </div>
  `;
  return generateCorporateEmailWrapper("Surat Pengantar Medical Check-Up (MCU) - PT ITSP", body);
}

// 7. Lolos MCU & Penerbitan Offering Letter
export function emailOfferingIssued(name: string, position: string, appUrl: string) {
  const body = `
    <div class="greeting">Yth. Sdr/i. ${name},</div>
    <p>Berdasarkan hasil verifikasi pemeriksaan medis (Fit to Work) dan pertimbangan manajemen, kami dengan bangga menginformasikan bahwa Anda dinyatakan <strong>LOLOS SELEKSI PENERIMAAN KARYAWAN</strong> di <strong>PT Indonesia Thai Summit Plastech</strong>.</p>
    <p>Surat Penawaran Resmi (<strong>Offering Letter</strong>) untuk posisi <strong>${position}</strong> telah diterbitkan di portal kandidat Anda. Rincian gaji pokok, tunjangan, benefit kesehatan, dan tanggal mulai kerja dapat Anda tinjau secara lengkap di portal.</p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${appUrl}/portal/dashboard" class="btn-action" style="background: #ea580c;">Tinjau & Setujui Offering Letter &rarr;</a>
    </div>
  `;
  return generateCorporateEmailWrapper("Resmi: Penawaran Kerja (Offering Letter) - PT ITSP", body);
}

// 8. Undangan Tanda Tangan Kontrak Fisik
export function emailContractSigningInvite(name: string, position: string, signingDate: string, plantLocation: string, appUrl: string) {
  const body = `
    <div class="greeting">Yth. Sdr/i. ${name},</div>
    <p>Terima kasih atas persetujuan Anda terhadap Surat Penawaran Kerja resmi kami. Selamat datang di keluarga besar <strong>PT Indonesia Thai Summit Plastech</strong>!</p>
    <p>Anda diundang untuk hadir ke pabrik kami guna penandatanganan Kontrak Kerja Fisik (PKWT) serta pengambilan seragam & orientasi kerja awal:</p>
    
    <div class="info-box">
      <div class="info-item"><span class="info-label">Jadwal Kehadiran:</span> <span class="info-value"><strong>${signingDate}</strong></span></div>
      <div class="info-item"><span class="info-label">Lokasi Pabrik:</span> <span class="info-value">${plantLocation}</span></div>
      <div class="info-item"><span class="info-label">Pakaian:</span> <span class="info-value">Kemeja putih formal, celana panjang hitam bahan, dan sepatu kerja tertutup.</span></div>
      <div class="info-item"><span class="info-label">Dokumen Wajib:</span> <span class="info-value">KTP asli & fotokopi 2 lbr, NPWP, Buku Rekening Mandiri/BCA, Pasfoto 3x4 (2 lembar latar merah), Ijazah asli & SKCK aktif.</span></div>
    </div>

    <div style="text-align: center;">
      <a href="${appUrl}/portal/dashboard" class="btn-action">Lihat Panduan Kedatangan di Portal &rarr;</a>
    </div>
  `;
  return generateCorporateEmailWrapper("Undangan Penandatanganan Kontrak Kerja - PT ITSP", body);
}

// 9. Surat Penolakan Resmi (Bila Belum Memenuhi Syarat)
export function emailRejectionNotice(name: string, position: string, stageName: string) {
  const body = `
    <div class="greeting">Yth. Sdr/i. ${name},</div>
    <p>Terima kasih banyak atas waktu, dedikasi, serta minat yang Anda tunjukkan dalam mengikuti proses seleksi penerimaan karyawan di <strong>PT Indonesia Thai Summit Plastech</strong> untuk posisi <strong>${position}</strong>.</p>
    <p>Setelah mempertimbangkan secara seksama profil seluruh kandidat pada <strong>${stageName}</strong>, kami menginformasikan bahwa untuk saat ini kami belum dapat melanjutkan proses lamaran Anda ke tahapan berikutnya.</p>
    <p>Keputusan ini murni didasarkan pada kesesuaian profil teknis dan kebutuhan spesifik posisi yang saat ini dibuka, dan bukan merupakan refleksi dari kemampuan serta potensi Anda sebagai profesional.</p>
    <p>Data profil Anda akan tetap tersimpan secara rahasia dalam basis data talenta (*Talent Pool*) kami, dan kami tidak akan ragu untuk menghubungi Anda kembali apabila terdapat lowongan lain di masa mendatang yang sesuai dengan kualifikasi Anda.</p>
    <p>Kami mendoakan yang terbaik bagi kesuksesan karir dan masa depan profesional Anda.</p>
  `;
  return generateCorporateEmailWrapper("Pemberitahuan Status Seleksi - PT ITSP", body);
}
