/**
 * Offering Letter Generator & Corporate Template Helper
 * PT Indonesia Thai Summit Plastech (PT ITSP)
 */

export const DEFAULT_OFFERING_CLAUSES = `1. Hubungan kerja dituangkan dalam Perjanjian Kerja Waktu Tertentu (PKWT) sesuai dengan peraturan perundang-undangan ketenagakerjaan yang berlaku di Republik Indonesia.
2. Calon karyawan berhak atas jaminan sosial ketenagakerjaan dan kesehatan (BPJS Ketenagakerjaan & BPJS Kesehatan) terhitung sejak tanggal efektif bergabung.
3. Fasilitas kerja meliputi fasilitas makan kantin pabrik, tunjangan shift kerja manufaktur, serta perlengkapan Alat Pelindung Diri (APD) dan seragam kerja standar PT ITSP.
4. Masa orientasi dan evaluasi performa kerja (probationary review) berlaku selama 3 (tiga) bulan pertama masa penempatan.
5. Calon karyawan wajib mematuhi seluruh Tata Tertib & Peraturan Perusahaan (PP) PT Indonesia Thai Summit Plastech serta menjaga kerahasiaan informasi korporat (Strictly Confidential).`;

export interface OfferingLetterData {
  candidateName: string;
  candidateId?: number | string;
  position: string;
  department: string;
  location: string;
  salary: string;
  joinDate?: string;
  refNumber?: string;
  clauses?: string;
  notes?: string;
  signerName?: string;
  signerTitle?: string;
  signerSignature?: string; // Data URL Base64 image
  candidateSignature?: string; // Data URL Base64 image if already signed
  signedAt?: string;
}

export const generateOfferingLetterHtml = (data: OfferingLetterData): string => {
  const candidateName = data.candidateName || 'Kandidat Terpilih';
  const position = data.position || 'Staff Operasional';
  const dept = data.department || 'Manufaktur & Produksi';
  const location = data.location || 'Kawasan Industri KIIC Karawang Barat, Jawa Barat';
  const salary = data.salary || 'Sesuai Standar Kompensasi PT ITSP';
  let joinDate = data.joinDate?.trim() ? data.joinDate.trim() : 'Ditetapkan Sesuai Jadwal Orientasi';
  if (joinDate && /^\d{4}-\d{2}-\d{2}$/.test(joinDate)) {
    const [y, m, d] = joinDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (!isNaN(dateObj.getTime())) {
      joinDate = dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }
  const curYear = new Date().getFullYear();
  const refNum = data.refNumber?.trim()
    ? data.refNumber.trim()
    : `ITSP/HRD-REC/OL/${curYear}/${String(data.candidateId || 1).padStart(4, '0')}`;

  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const signerName = data.signerName || 'Budi Santoso, S.Psi.';
  const signerTitle = data.signerTitle || 'Human Capital & Recruitment Manager';
  const clausesText = data.clauses?.trim() ? data.clauses.trim() : DEFAULT_OFFERING_CLAUSES;

  // Split clauses by newline if numbered or convert to list items
  const clauseLines = clausesText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const clausesHtml = clauseLines
    .map((line) => {
      // Clean leading numbering like "1. ", "2) ", etc
      const cleaned = line.replace(/^\d+[\.\)]\s*/, '');
      return `<li>${cleaned}</li>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Surat Penawaran Resmi (Offering Letter) - ${candidateName} - PT ITSP</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 13px;
      margin: 0;
      padding: 24px;
      background: #ffffff;
    }
    .print-bar {
      background: #0f172a;
      color: white;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      border-radius: 6px;
      margin-bottom: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 100;
    }
    .print-btn {
      background: #10b981;
      color: #0f172a;
      border: none;
      padding: 8px 18px;
      border-radius: 4px;
      font-weight: 800;
      cursor: pointer;
      font-size: 12.5px;
      transition: all 0.2s;
    }
    .print-btn:hover {
      background: #059669;
      color: white;
    }
    .header {
      border-bottom: 3px double #018730;
      padding-bottom: 12px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .company-title {
      font-size: 18px;
      font-weight: 800;
      color: #018730;
      letter-spacing: 0.5px;
    }
    .company-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
      line-height: 1.35;
    }
    .doc-badge {
      display: inline-block;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 800;
      margin-top: 4px;
      letter-spacing: 0.5px;
    }
    .doc-title {
      text-align: center;
      margin: 14px 0 16px 0;
    }
    .doc-title h2 {
      margin: 0;
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      text-decoration: underline;
    }
    .doc-title p {
      margin: 3px 0 0 0;
      font-size: 11.5px;
      color: #64748b;
      font-weight: 600;
    }
    table.meta {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    table.meta td {
      padding: 4px 0;
      font-size: 12.5px;
      vertical-align: top;
    }
    table.meta td.label {
      width: 250px;
      font-weight: 700;
      color: #334155;
      white-space: nowrap;
    }
    table.meta td.separator {
      width: 16px;
      text-align: left;
      font-weight: 700;
      color: #334155;
      padding-right: 4px;
      white-space: nowrap;
    }
    table.meta td.value {
      color: #1e293b;
    }
    .salary-box {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      border-radius: 6px;
      padding: 12px 16px;
      margin: 12px 0 16px 0;
    }
    .salary-label {
      font-size: 11px;
      font-weight: 800;
      color: #166534;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .salary-amount {
      font-size: 18px;
      font-weight: 800;
      color: #018730;
      margin-top: 3px;
    }
    .salary-desc {
      font-size: 11.5px;
      color: #475569;
      margin-top: 4px;
    }
    .section-title {
      font-weight: 800;
      font-size: 12.5px;
      color: #0f172a;
      margin: 12px 0 6px 0;
    }
    ol.clauses {
      padding-left: 20px;
      margin: 6px 0 14px 0;
    }
    ol.clauses li {
      margin-bottom: 5px;
      text-align: justify;
      line-height: 1.45;
      font-size: 12.5px;
    }
    .notes-box {
      background: #f8fafc;
      border-left: 3px solid #018730;
      padding: 8px 12px;
      margin: 10px 0 16px 0;
      font-size: 12px;
      color: #334155;
      font-style: italic;
    }
    .signatures {
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sign-col {
      width: 46%;
      text-align: center;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 8px;
      background: #fcfcfc;
    }
    .sign-role-title {
      margin: 0 0 2px 0;
      font-weight: 800;
      font-size: 12px;
      color: #0f172a;
    }
    .sign-role-sub {
      margin: 0;
      font-size: 10.5px;
      color: #64748b;
    }
    .sign-space {
      height: 75px;
      margin: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .sign-img {
      max-height: 70px;
      max-width: 170px;
      object-fit: contain;
    }
    .stamp-badge {
      display: inline-block;
      border: 1.5px solid #018730;
      color: #018730;
      font-size: 9.5px;
      font-weight: 800;
      padding: 3px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(1, 135, 48, 0.05);
    }
    .sign-name {
      margin: 0;
      font-weight: 800;
      font-size: 12.5px;
      color: #0f172a;
      border-top: 1px solid #94a3b8;
      padding-top: 4px;
      display: inline-block;
      min-width: 160px;
    }
    .sign-date {
      margin: 3px 0 0 0;
      font-size: 10.5px;
      color: #64748b;
    }
    @media print {
      .print-bar {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <div style="font-weight:700; font-size:13px; display:flex; align-items:center; gap:8px;">
      <span>📄 Dokumen Surat Penawaran Resmi (Offering Letter PT ITSP)</span>
      <span style="background:#1e293b; padding:2px 8px; border-radius:4px; font-size:11px; color:#a7f3d0;">
        E-Signature Terverifikasi HR
      </span>
    </div>
    <button class="print-btn" onclick="window.print()">🖨️ Cetak / Simpan sebagai PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="company-title">PT INDONESIA THAI SUMMIT PLASTECH</div>
      <div class="company-sub">Manufaktur Komponen Plastik Otomotif Berstandar Internasional</div>
      <div class="company-sub">Kawasan Industri KIIC, Jl. Maligi Raya Kav. 1-1A, Karawang Barat 41361, Jawa Barat - Indonesia</div>
      <div class="doc-badge">DOCUMENT VERIFIED • HC MANAGEMENT SYSTEM</div>
    </div>
    <div style="text-align: right; font-size: 11px; color: #64748b;">
      <strong style="color:#018730; font-size:12px;">STRICTLY CONFIDENTIAL</strong><br>
      Division: Human Capital & General Affairs<br>
      Ref: ${refNum}
    </div>
  </div>

  <div class="doc-title">
    <h2>SURAT PENAWARAN KERJA (OFFERING LETTER)</h2>
    <p>Nomor Registrasi Korporat: ${refNum}</p>
  </div>

  <table class="meta">
    <tr>
      <td class="label">Tanggal Terbit</td>
      <td class="separator">:</td>
      <td class="value">${dateStr}</td>
    </tr>
    <tr>
      <td class="label">Nama Lengkap Kandidat</td>
      <td class="separator">:</td>
      <td class="value"><strong>${candidateName}</strong></td>
    </tr>
    <tr>
      <td class="label">Posisi Jabatan</td>
      <td class="separator">:</td>
      <td class="value"><strong>${position}</strong></td>
    </tr>
    <tr>
      <td class="label">Departemen / Divisi</td>
      <td class="separator">:</td>
      <td class="value">${dept}</td>
    </tr>
    <tr>
      <td class="label">Lokasi Penempatan</td>
      <td class="separator">:</td>
      <td class="value">${location}</td>
    </tr>
    <tr>
      <td class="label">Tanggal Mulai Bekerja (Join Date)</td>
      <td class="separator">:</td>
      <td class="value"><strong>${joinDate}</strong></td>
    </tr>
  </table>

  <p>Dengan hormat,</p>
  <p>Berdasarkan seluruh hasil rangkaian proses seleksi rekrutmen dan uji kelayakan medis (Medical Check-Up) yang telah Anda selesaikan, Manajemen <strong>PT INDONESIA THAI SUMMIT PLASTECH</strong> dengan bangga menerbitkan Surat Penawaran Kerja Resmi kepada Anda dengan rincian kompensasi berikut:</p>

  <div class="salary-box">
    <div class="salary-label">Rincian Paket Kompensasi & Penawaran:</div>
    <div class="salary-amount">${salary}</div>
    <div class="salary-desc">*Paket kompensasi resmi yang ditetapkan oleh Tim Human Capital Management PT ITSP sesuai standar industri manufaktur otomotif.</div>
  </div>

  ${data.notes ? `<div class="notes-box"><strong>Catatan Khusus dari HR:</strong><br>${data.notes}</div>` : ''}

  <div class="section-title">Ketentuan Pokok Hubungan Kerja:</div>
  <ol class="clauses">
    ${clausesHtml}
  </ol>

  <p style="margin-top: 14px; font-size: 12px; color: #475569;">
    Apabila Anda menyetujui seluruh ketentuan dan rincian penawaran kerja di atas, silakan bubuhkan tanda tangan Anda pada kolom yang disediakan di bawah ini dan unggah kembali berkas ke Portal Karir PT ITSP.
  </p>

  <div class="signatures">
    <!-- Pihak Pertama (HR PT ITSP) -->
    <div class="sign-col">
      <p class="sign-role-title">PT INDONESIA THAI SUMMIT PLASTECH</p>
      <p class="sign-role-sub">Pihak Pemberi Penawaran Kerja</p>
      <div class="sign-space">
        ${
          data.signerSignature
            ? `<img src="${data.signerSignature}" alt="Tanda Tangan Digital HR" class="sign-img" />`
            : `<div class="stamp-badge">✓ E-SIGNATURE RESMI TERVALIDASI HR</div>`
        }
      </div>
      <p class="sign-name">( ${signerName} )</p>
      <p class="sign-date">${signerTitle}</p>
      <p class="sign-date" style="color:#018730; font-weight:700;">Tertanda Tangan Digital Resmi</p>
    </div>

    <!-- Pihak Kedua (Calon Karyawan) -->
    <div class="sign-col">
      <p class="sign-role-title">Penerima Penawaran Kerja</p>
      <p class="sign-role-sub">Menyatakan Setuju & Menerima</p>
      <div class="sign-space">
        ${
          data.candidateSignature
            ? `<img src="${data.candidateSignature}" alt="Tanda Tangan Pelamar" class="sign-img" />`
            : `<span style="color:#94a3b8; font-size:11px; font-style:italic;">(Tanda Tangan Penerima Penawaran)</span>`
        }
      </div>
      <p class="sign-name">( ${candidateName} )</p>
      <p class="sign-date">Calon Karyawan PT ITSP</p>
      <p class="sign-date">${data.signedAt ? `Ditandatangani pada: ${data.signedAt}` : 'Tanggal: ....................'}</p>
    </div>
  </div>
</body>
</html>`;
};

export const openOfferingLetterWindow = (htmlContent: string, autoPrint = false) => {
  const w = window.open('', '_blank');
  if (w) {
    w.document.open();
    w.document.write(htmlContent);
    w.document.close();
    if (autoPrint) {
      setTimeout(() => {
        try {
          w.print();
        } catch (e) {
          console.error('Auto print error:', e);
        }
      }, 500);
    }
  }
};
