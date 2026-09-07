'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  MenuItem,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  Save as SaveIcon,
  LocalHospital as McuIcon,
  LocationCity as PlantIcon,
  Email as EmailIcon,
  Send as SendIcon,
  Visibility as PreviewIcon,
  Code as VariableIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

// Master Template Email Default Per Tahapan
const DEFAULT_EMAIL_TEMPLATES: Record<
  string,
  { name: string; stage: string; subject: string; body: string; variables: string[] }
> = {
  account_created: {
    name: '1. Pendaftaran Akun Pelamar & Password Baru',
    stage: 'Tahap 1: Pendaftaran / Akun Baru',
    subject: '[PT ITSP] Konfirmasi Pendaftaran & Kredensial Akun - {posisi}',
    body: `Yth. Sdr/i. {nama},\n\nTerima kasih atas minat Anda untuk berkarir bersama PT Indonesia Thai Summit Plastech untuk posisi {posisi}.\n\nBerkas lamaran Anda telah berhasil tercatat dalam sistem e-Recruitment ATS kami. Anda dapat masuk ke Portal Pelamar untuk memantau status seleksi dengan kredensial berikut:\n\n• Email Login: {email}\n• Password Awal: {password}\n• Tautan Portal: {link_portal}\n\nMohon jaga kerahasiaan kredensial login Anda. Informasi hasil screening berkas akan kami perbarui sesegera mungkin.`,
    variables: ['{nama}', '{posisi}', '{email}', '{password}', '{link_portal}'],
  },
  screening_passed: {
    name: '2. Lolos Screening & Undangan Psikotes Online',
    stage: 'Tahap 2: Tes Psikotes Online',
    subject: '[PT ITSP] Hasil Screening & Undangan Tes Psikotes Online - {posisi}',
    body: `Yth. Sdr/i. {nama},\n\nBerdasarkan hasil verifikasi berkas administrasi dan kualifikasi untuk posisi {posisi}, Tim Human Capital Management PT Indonesia Thai Summit Plastech menyatakan bahwa Anda:\n\nLOLOS TAHAP SCREENING DOKUMEN & ADMINISTRASI\n\nSelanjutnya, Anda diundang untuk mengikuti Tahap 2: Ujian Psikotes Online & Profiling Karakteristik Diri pada:\n\n• Jadwal Pelaksanaan: {jadwal}\n• Lokasi Ujian: Portal Karir Resmi PT ITSP\n• Token Sesi Ujian: {token}\n\nSelama ujian berlangsung, peserta dilarang berpindah tab browser atau membuka aplikasi lain. Sistem dilengkapi sensor anti-kecurangan otomatis.`,
    variables: ['{nama}', '{posisi}', '{jadwal}', '{token}', '{link_portal}'],
  },
  psikotes_passed: {
    name: '3. Lolos Psikotes & Undangan Ujian Teknis Kejuruan',
    stage: 'Tahap 3: Tes Teknis User Departemen',
    subject: '[PT ITSP] Hasil Psikotes & Undangan Ujian Teknis Kejuruan - {posisi}',
    body: `Yth. Sdr/i. {nama},\n\nSelamat! Berdasarkan hasil evaluasi psikotes online, Anda dinyatakan LOLOS dan berhak melanjutkan ke Tahap 3: Ujian Teknis Kejuruan & Studi Kasus yang disiapkan langsung oleh Tim User Departemen terkait.\n\n• Jadwal Ujian: {jadwal}\n• Lokasi: Portal Karir PT ITSP\n• Token Sesi Ujian: {token}\n\nUjian teknis mencakup pemahaman spesifik kejuruan, studi kasus operasional, dan pertanyaan esai analitis. Harap persiapkan diri Anda dengan baik.`,
    variables: ['{nama}', '{posisi}', '{jadwal}', '{token}', '{link_portal}'],
  },
  interview_hr: {
    name: '4. Undangan Interview HR Recruitment',
    stage: 'Tahap 4: Interview HR',
    subject: '[PT ITSP] Undangan Sesi Wawancara HR Recruitment - {posisi}',
    body: `Yth. Sdr/i. {nama},\n\nTerima kasih atas partisipasi Anda dalam tahapan seleksi teknis. Kami mengundang Anda untuk menghadiri sesi Wawancara HR Recruitment (Human Capital Management) untuk posisi {posisi} pada:\n\n• Hari / Tanggal: {jadwal}\n• Media / Lokasi: {lokasi}\n• Kontak PIC: Tim Rekrutmen PT ITSP\n\nHarap hadir tepat waktu dan menyiapkan dokumen identitas diri serta berkas pendukung lainnya.`,
    variables: ['{nama}', '{posisi}', '{jadwal}', '{lokasi}', '{link_portal}'],
  },
  interview_user: {
    name: '5. Undangan Interview User Departemen',
    stage: 'Tahap 5: Interview User',
    subject: '[PT ITSP] Undangan Wawancara Teknis User Departemen - {posisi}',
    body: `Yth. Sdr/i. {nama},\n\nAnda dinyatakan lolos sesi wawancara HR dan berhak melanjutkan ke Tahap 5: Interview Teknis User Departemen bersama jajaran supervisor & manager divisi terkait untuk posisi {posisi}.\n\n• Hari / Tanggal: {jadwal}\n• Lokasi / Link: {lokasi}\n\nSesi ini bertujuan untuk mendalami kompetensi teknis, studi kasus praktis di lapangan industri manufaktur, dan kesiapan operasional pabrik.`,
    variables: ['{nama}', '{posisi}', '{jadwal}', '{lokasi}', '{link_portal}'],
  },
  mcu_referral: {
    name: '6. Surat Rujukan Medical Check-Up (MCU)',
    stage: 'Tahap 6: Medical Check-Up',
    subject: '[PT ITSP] Surat Pengantar Medical Check-Up (MCU) - {posisi}',
    body: `Yth. Sdr/i. {nama},\n\nSelamat atas keberhasilan Anda melalui tahapan interview user. Langkah selanjutnya adalah Tahap 6: Pemeriksaan Kesehatan Kerja (Medical Check-Up) untuk posisi {posisi}.\n\n• Fasilitas Kesehatan Rekanan: {klinik_mcu}\n• Alamat Fasilitas: {alamat_mcu}\n• Estimasi Tarif: {biaya_mcu}\n• Petunjuk Medis: Wajib berpuasa 10-12 jam sebelum pengambilan sampel darah. Minum air putih tetap diperbolehkan.\n\nHarap unggah bukti pembayaran kwitansi dan hasil rekam medis MCU Anda ke Portal Pelamar untuk diverifikasi oleh dokter okupasi perusahaan.`,
    variables: ['{nama}', '{posisi}', '{klinik_mcu}', '{alamat_mcu}', '{biaya_mcu}', '{link_portal}'],
  },
  offering_issued: {
    name: '7. Penerbitan Surat Penawaran Kerja (Offering Letter)',
    stage: 'Tahap 7: Offering Letter',
    subject: '[PT ITSP] Resmi: Surat Penawaran Kerja (Offering Letter) - {posisi}',
    body: `Yth. Sdr/i. {nama},\n\nBerdasarkan hasil evaluasi komprehensif dan status kesehatan FIT TO WORK, Manajemen PT Indonesia Thai Summit Plastech dengan bangga menawarkan posisi {posisi} kepada Anda.\n\n• Paket Kompensasi & Gaji: {gaji_offer}\n• Tunjangan: BPJS Kesehatan, BPJS Ketenagakerjaan, Transportasi & Makan Pabrik\n• Tautan Review Surat Penawaran: {link_portal}\n\nSilakan tinjau draf offering letter resmi dan bubuhkan tanda tangan persetujuan secara digital di portal karir sebelum batas waktu yang ditentukan.`,
    variables: ['{nama}', '{posisi}', '{gaji_offer}', '{link_portal}'],
  },
  contract_signed: {
    name: '8. Konfirmasi Kontrak Kerja & Hari Pertama Masuk',
    stage: 'Tahap 8: Hired / Onboarding',
    subject: '[PT ITSP] Selamat Bergabung & Jadwal Masuk Kerja Pertama - {posisi}',
    body: `Yth. Sdr/i. {nama},\n\nSelamat bergabung secara resmi di keluarga besar PT Indonesia Thai Summit Plastech (Thai Summit Group)!\n\nKontrak kerja digital Anda telah diverifikasi oleh Departemen HR. Informasi hari pertama kerja (Onboarding Program) Anda:\n\n• Tanggal Mulai Bekerja: {tanggal_masuk}\n• Lokasi Pabrik: {lokasi}\n• Kartu Identitas: ID Card Sementara dapat Anda unduh dari portal pelamar untuk ditunjukkan kepada petugas pos keamanan gerbang pabrik.\n\nSelamat berkarya dan mencapai prestasi terbaik bersama kami!`,
    variables: ['{nama}', '{posisi}', '{tanggal_masuk}', '{lokasi}', '{link_portal}'],
  },
  rejection_notice: {
    name: '9. Pemberitahuan Status Seleksi Santun (Rejection Letter)',
    stage: 'Status: Tidak Lolos',
    subject: '[PT ITSP] Pemberitahuan Status Seleksi - {posisi}',
    body: `Yth. Sdr/i. {nama},\n\nTerima kasih banyak atas waktu, dedikasi, serta minat yang Anda tunjukkan dalam mengikuti proses seleksi penerimaan karyawan di PT Indonesia Thai Summit Plastech untuk posisi {posisi}.\n\nSetelah mempertimbangkan secara seksama profil seluruh kandidat pada {tahap_gagal}, saat ini kami belum dapat melanjutkan proses lamaran Anda ke tahapan berikutnya karena kualifikasi yang belum sesuai dengan kebutuhan spesifik posisi saat ini.\n\nData profil Anda tetap tersimpan dalam Talent Pool kami, dan kami tidak akan ragu untuk menghubungi Anda kembali apabila terdapat lowongan lain di masa mendatang yang sesuai. Kami mendoakan yang terbaik bagi kesuksesan karir profesional Anda.`,
    variables: ['{nama}', '{posisi}', '{tahap_gagal}'],
  },
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState(1); // Default buka tab Email Template
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // MCU & Plant Settings
  const [mcuPartnerName, setMcuPartnerName] = useState('');
  const [mcuPartnerAddress, setMcuPartnerAddress] = useState('');
  const [mcuPartnerMaps, setMcuPartnerMaps] = useState('');
  const [mcuEstimatedCost, setMcuEstimatedCost] = useState('');
  const [mcuInstructions, setMcuInstructions] = useState('');
  const [plantAddressKarawang, setPlantAddressKarawang] = useState('');
  const [plantAddressCikarang, setPlantAddressCikarang] = useState('');

  // Email Template Settings
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('account_created');
  const [emailTemplates, setEmailTemplates] = useState<Record<string, { subject: string; body: string }>>({});
  const [testEmailTarget, setTestEmailTarget] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setMcuPartnerName(data.settings.mcu_partner_name || '');
          setMcuPartnerAddress(data.settings.mcu_partner_address || '');
          setMcuPartnerMaps(data.settings.mcu_partner_maps || '');
          setMcuEstimatedCost(data.settings.mcu_estimated_cost || '');
          setMcuInstructions(data.settings.mcu_instructions || '');
          setPlantAddressKarawang(data.settings.plant_address_karawang || '');
          setPlantAddressCikarang(data.settings.plant_address_cikarang || '');

          // Load email templates from DB or fallback to default
          const loadedTemplates: Record<string, { subject: string; body: string }> = {};
          Object.keys(DEFAULT_EMAIL_TEMPLATES).forEach((key) => {
            loadedTemplates[key] = {
              subject: data.settings[`email_tpl_${key}_subject`] || DEFAULT_EMAIL_TEMPLATES[key].subject,
              body: data.settings[`email_tpl_${key}_body`] || DEFAULT_EMAIL_TEMPLATES[key].body,
            };
          });
          setEmailTemplates(loadedTemplates);
        }
      })
      .finally(() => setLoading(false));

    // Get current session for test email placeholder
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.email) setTestEmailTarget(data.email);
      })
      .catch(() => {});
  }, []);

  const handleSaveMcuAndPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mcu_partner_name: mcuPartnerName,
          mcu_partner_address: mcuPartnerAddress,
          mcu_partner_maps: mcuPartnerMaps,
          mcu_estimated_cost: mcuEstimatedCost,
          mcu_instructions: mcuInstructions,
          plant_address_karawang: plantAddressKarawang,
          plant_address_cikarang: plantAddressCikarang,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg('Pengaturan default MCU rekanan dan lokasi pabrik berhasil disimpan secara permanen!');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmailTemplate = async () => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const payload: Record<string, string> = {};
      Object.keys(emailTemplates).forEach((key) => {
        payload[`email_tpl_${key}_subject`] = emailTemplates[key].subject;
        payload[`email_tpl_${key}_body`] = emailTemplates[key].body;
      });

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg('Seluruh Master Template Email Seleksi berhasil disimpan ke database!');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailTarget) {
      alert('Silakan masukkan alamat email tujuan uji coba.');
      return;
    }

    setTestingEmail(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const currentTpl = emailTemplates[selectedTemplateKey] || DEFAULT_EMAIL_TEMPLATES[selectedTemplateKey];
      // Format dummy preview
      const previewSubject = currentTpl.subject
        .replace('{posisi}', 'Staff IT & Enterprise System')
        .replace('{nama}', 'Muhammad Rifqi');

      const previewBody = currentTpl.body
        .replace(/{nama}/g, 'Muhammad Rifqi Alfaridzi')
        .replace(/{posisi}/g, 'Staff IT & Enterprise System')
        .replace(/{email}/g, 'alfaridzi.rifqi28@gmail.com')
        .replace(/{password}/g, `Itsp@${new Date().getFullYear()}`)
        .replace(/{jadwal}/g, 'Senin, 15 September 2026 pukul 09:00 WIB')
        .replace(/{token}/g, 'PSIKO-2026')
        .replace(/{lokasi}/g, 'Plant 1 KIIC Karawang Barat (Ruang Training HC)')
        .replace(/{klinik_mcu}/g, mcuPartnerName || 'Klinik Kimia Farma Karawang')
        .replace(/{alamat_mcu}/g, mcuPartnerAddress || 'Jl. Galuh Mas Raya, Karawang')
        .replace(/{biaya_mcu}/g, mcuEstimatedCost || 'Rp 300.000 (Paket Fit to Work)')
        .replace(/{gaji_offer}/g, 'Rp 6.500.000 / bulan + Tunjangan')
        .replace(/{tanggal_masuk}/g, '1 Oktober 2026')
        .replace(/{tahap_gagal}/g, 'Tahap Screening Dokumen')
        .replace(/{link_portal}/g, 'http://localhost:3001/login')
        .replace(/\n/g, '<br/>');

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_email',
          to: testEmailTarget,
          subject: previewSubject,
          bodyContent: `<div style="line-height: 1.7; font-size: 14px; color: #334155;">${previewBody}</div>`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(`Email uji coba template berhasil dikirimkan ke: ${testEmailTarget}! Silakan cek inbox/spam Anda.`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setTestingEmail(false);
    }
  };

  const handleResetCurrentTemplateToDefault = () => {
    if (confirm(`Kembalikan narasi template "${DEFAULT_EMAIL_TEMPLATES[selectedTemplateKey].name}" ke format standar pabrik?`)) {
      setEmailTemplates({
        ...emailTemplates,
        [selectedTemplateKey]: {
          subject: DEFAULT_EMAIL_TEMPLATES[selectedTemplateKey].subject,
          body: DEFAULT_EMAIL_TEMPLATES[selectedTemplateKey].body,
        },
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#018730' }} />
      </Box>
    );
  }

  const currentTemplateDef = DEFAULT_EMAIL_TEMPLATES[selectedTemplateKey] || DEFAULT_EMAIL_TEMPLATES.account_created;
  const currentTemplateVal = emailTemplates[selectedTemplateKey] || {
    subject: currentTemplateDef.subject,
    body: currentTemplateDef.body,
  };

  return (
    <Box sx={{ maxWidth: 1100 }}>
      {/* HEADER SECTION */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', mb: 0.5 }}>
          Pengaturan Sistem & Master Template Email
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          Atur master fasilitas klinik MCU, alamat pabrik, serta master template pesan email resmi korporat PT Indonesia Thai Summit Plastech.
        </Typography>
      </Box>

      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}

      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* TABS NAVIGATION */}
      <Paper sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="inherit"
          sx={{
            bgcolor: '#FFFFFF',
            '& .Mui-selected': { color: '#018730', fontWeight: 800 },
            '& .MuiTabs-indicator': { bgcolor: '#018730', height: 3 },
          }}
        >
          <Tab
            icon={<EmailIcon />}
            iconPosition="start"
            label="Master Template Email Seleksi (7 Tahap & Penolakan)"
            sx={{ textTransform: 'none', py: 2, px: 3, fontWeight: 600, fontSize: 14 }}
          />
          <Tab
            icon={<McuIcon />}
            iconPosition="start"
            label="Klinik Rekanan MCU & Alamat Pabrik"
            sx={{ textTransform: 'none', py: 2, px: 3, fontWeight: 600, fontSize: 14 }}
          />
        </Tabs>
      </Paper>

      {/* TAB 0: EMAIL TEMPLATES */}
      {activeTab === 0 && (
        <Box>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #CBD5E1', mb: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <Box sx={{ p: 2.5, bgcolor: '#F0FDF4', borderBottom: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ color: '#16A34A' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#166534', fontSize: 17 }}>
                  Master Template Email Korporat Berlogo
                </Typography>
              </Box>
              <Chip
                label="Super Admin Wewenang Penuh"
                size="small"
                sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700, border: '1px solid #86EFAC' }}
              />
            </Box>

            <CardContent sx={{ p: 3 }}>
              {/* Template Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
                  Pilih Tahapan Seleksi yang Ingin Disesuaikan:
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={selectedTemplateKey}
                  onChange={(e) => setSelectedTemplateKey(e.target.value)}
                  sx={{ bgcolor: '#F8FAFC' }}
                >
                  {Object.entries(DEFAULT_EMAIL_TEMPLATES).map(([key, tpl]) => (
                    <MenuItem key={key} value={key} sx={{ py: 1.2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {tpl.name}
                        </Typography>
                        <Chip label={tpl.stage} size="small" sx={{ fontSize: 11, bgcolor: '#E0F2FE', color: '#0369A1' }} />
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Edit Subject & Body */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3.5 }}>
                {/* Form Kolom Kiri: Input Editor */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SaveIcon sx={{ fontSize: 18, color: '#018730' }} /> Redaksi Template Surat
                  </Typography>

                  <TextField
                    fullWidth
                    label="Subjek Email Resmi"
                    value={currentTemplateVal.subject}
                    onChange={(e) =>
                      setEmailTemplates({
                        ...emailTemplates,
                        [selectedTemplateKey]: { ...currentTemplateVal, subject: e.target.value },
                      })
                    }
                    sx={{ mb: 2.5 }}
                    helperText="Mendukung variabel otomatis seperti {posisi} atau {nama}"
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    label="Isi Narasi Pesan / Surat Resmi"
                    value={currentTemplateVal.body}
                    onChange={(e) =>
                      setEmailTemplates({
                        ...emailTemplates,
                        [selectedTemplateKey]: { ...currentTemplateVal, body: e.target.value },
                      })
                    }
                    sx={{ mb: 2, fontFamily: 'monospace' }}
                  />

                  {/* Variable Chips Helper */}
                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', mb: 3 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <VariableIcon sx={{ fontSize: 14 }} /> Variabel Otomatis yang Didukung untuk Tahap Ini:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                      {currentTemplateDef.variables.map((v) => (
                        <Chip
                          key={v}
                          label={v}
                          size="small"
                          onClick={() => {
                            // Append variable to body
                            setEmailTemplates({
                              ...emailTemplates,
                              [selectedTemplateKey]: {
                                ...currentTemplateVal,
                                body: currentTemplateVal.body + ' ' + v,
                              },
                            });
                          }}
                          title="Klik untuk menyisipkan variabel ini ke pesan"
                          sx={{ bgcolor: '#FFFFFF', border: '1px solid #CBD5E1', cursor: 'pointer', '&:hover': { bgcolor: '#DCFCE7', borderColor: '#16A34A' } }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Actions Bar */}
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      onClick={handleSaveEmailTemplate}
                      disabled={saving}
                      startIcon={<SaveIcon />}
                      sx={{ bgcolor: '#018730', fontWeight: 700, px: 3, py: 1.2, '&:hover': { bgcolor: '#005c21' } }}
                    >
                      {saving ? 'Menyimpan...' : 'Simpan Semua Template'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleResetCurrentTemplateToDefault}
                      sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B' }}
                    >
                      Reset ke Format Standar Pabrik
                    </Button>
                  </Box>
                </Box>

                {/* Kolom Kanan: Live Preview Resmi */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PreviewIcon sx={{ fontSize: 18, color: '#0369A1' }} /> Pratinjau Tampilan Email di Inbox Pelamar:
                  </Typography>

                  {/* Mock Email Card Client */}
                  <Paper
                    elevation={3}
                    sx={{
                      borderRadius: 3,
                      border: '1px solid #CBD5E1',
                      overflow: 'hidden',
                      bgcolor: '#F1F5F9',
                      p: 2,
                    }}
                  >
                    <Box sx={{ maxWidth: 500, mx: 'auto', bgcolor: '#FFFFFF', borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
                      {/* Kop Surat Berlogo */}
                      <Box sx={{ background: 'linear-gradient(135deg, #018730 0%, #005c21 100%)', p: 2.5, borderBottom: '3px solid #FC4509' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                          <Box>
                            <Typography sx={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FED7AA', fontWeight: 700 }}>
                              Human Capital Management
                            </Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                              PT INDONESIA THAI SUMMIT PLASTECH
                            </Typography>
                            <Typography sx={{ fontSize: 10, color: '#D1FAE5' }}>
                              Sistem Rekrutmen Terpadu & Portal Karir Resmi
                            </Typography>
                          </Box>
                          <Box sx={{ bgcolor: '#FFFFFF', p: 0.6, borderRadius: 1.5, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
                            <Box
                              component="img"
                              src="/logo-plastech.jpg"
                              alt="PT ITSP Logo"
                              sx={{ height: 32, maxWidth: 85, objectFit: 'contain', display: 'block' }}
                            />
                          </Box>
                        </Box>
                      </Box>

                      {/* Isi Pesan */}
                      <Box sx={{ p: 2.5, fontSize: 13, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        <Typography variant="caption" sx={{ display: 'block', color: '#94A3B8', mb: 1, borderBottom: '1px dashed #CBD5E1', pb: 0.5 }}>
                          <strong>Subjek:</strong> {currentTemplateVal.subject.replace('{posisi}', 'Staff IT & Enterprise System')}
                        </Typography>

                        {currentTemplateVal.body
                          .replace(/{nama}/g, 'Muhammad Rifqi Alfaridzi')
                          .replace(/{posisi}/g, 'Staff IT & Enterprise System')
                          .replace(/{email}/g, 'alfaridzi.rifqi28@gmail.com')
                          .replace(/{password}/g, `Itsp@${new Date().getFullYear()}`)
                          .replace(/{jadwal}/g, 'Senin, 15 September 2026 pukul 09:00 WIB')
                          .replace(/{token}/g, 'PSIKO-2026')
                          .replace(/{lokasi}/g, 'Plant 1 KIIC Karawang Barat')
                          .replace(/{klinik_mcu}/g, mcuPartnerName || 'Klinik Kimia Farma Karawang')
                          .replace(/{alamat_mcu}/g, mcuPartnerAddress || 'Jl. Galuh Mas Raya, Karawang')
                          .replace(/{biaya_mcu}/g, mcuEstimatedCost || 'Rp 300.000')
                          .replace(/{gaji_offer}/g, 'Rp 6.500.000 / bulan')
                          .replace(/{tanggal_masuk}/g, '1 Oktober 2026')
                          .replace(/{tahap_gagal}/g, 'Tahap Screening Dokumen')
                          .replace(/{link_portal}/g, 'http://localhost:3001/login')}
                      </Box>

                      {/* Footer Pabrik */}
                      <Box sx={{ bgcolor: '#0F172A', p: 2, color: '#94A3B8', fontSize: 10, textAlign: 'center', lineHeight: 1.5 }}>
                        <strong style={{ color: '#F8FAFC' }}>PT Indonesia Thai Summit Plastech (Thai Summit Group)</strong><br />
                        Plant 1: Kawasan Industri KIIC, Karawang Barat 41361<br />
                        Plant 2: GIIC Deltamas, Cikarang Pusat 17530
                      </Box>
                    </Box>
                  </Paper>

                  {/* Uji Coba Pengiriman Langsung */}
                  <Box sx={{ mt: 3, p: 2.5, bgcolor: '#FFFFFF', borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SendIcon sx={{ fontSize: 16, color: '#018730' }} /> Kirim Email Uji Coba Pratinjau:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Alamat email penerima uji coba"
                        value={testEmailTarget}
                        onChange={(e) => setTestEmailTarget(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        onClick={handleSendTestEmail}
                        disabled={testingEmail}
                        sx={{ bgcolor: '#0F172A', fontWeight: 700, whiteSpace: 'nowrap', px: 2.5, '&:hover': { bgcolor: '#1E293B' } }}
                      >
                        {testingEmail ? 'Mengirim...' : 'Kirim Uji Coba'}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* TAB 1: MCU & PLANT SETTINGS */}
      {activeTab === 1 && (
        <form onSubmit={handleSaveMcuAndPlant}>
          {/* SECTION 1: MASTER DEFAULT MCU REKANAN */}
          <Card sx={{ borderRadius: 2.5, border: '1px solid #CBD5E1', mb: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Box sx={{ p: 2.5, bgcolor: '#F0FDF4', borderBottom: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 1 }}>
              <McuIcon sx={{ color: '#16A34A' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#166534', fontSize: 17 }}>
                Master Fasilitas Kesehatan Rekanan MCU
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                <TextField
                  fullWidth
                  required
                  label="Nama Klinik / RS Rekanan Default"
                  value={mcuPartnerName}
                  onChange={(e) => setMcuPartnerName(e.target.value)}
                  helperText="Contoh: Klinik Kimia Farma Karawang / RS Permata Cikarang"
                />
                <TextField
                  fullWidth
                  required
                  label="Estimasi Kisaran Biaya Pemeriksaan"
                  value={mcuEstimatedCost}
                  onChange={(e) => setMcuEstimatedCost(e.target.value)}
                  helperText="Contoh: Rp 250.000 – Rp 350.000 (Paket Fit to Work ITSP)"
                />
                <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                  <TextField
                    fullWidth
                    required
                    label="Alamat Lengkap & Nomor Kontak Rujukan"
                    value={mcuPartnerAddress}
                    onChange={(e) => setMcuPartnerAddress(e.target.value)}
                    helperText="Alamat ini otomatis menjadi tautan Google Maps yang bisa diklik di portal & email."
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                  <TextField
                    fullWidth
                    label="Link Google Maps Klinik / RS (Opsional - iframe atau URL)"
                    value={mcuPartnerMaps}
                    onChange={(e) => setMcuPartnerMaps(e.target.value)}
                    placeholder="Kosongkan untuk auto-deteksi dari alamat, atau paste link https://maps.google.com/... / tag <iframe ...>"
                    helperText="Link ini diprioritaskan sebagai tombol & alamat yang bisa diklik di dashboard portal dan email MCU."
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2.5}
                    label="Petunjuk Medis & Puasa (Tampil di Dashboard & Email)"
                    value={mcuInstructions}
                    onChange={(e) => setMcuInstructions(e.target.value)}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* SECTION 2: MASTER DEFAULT ALAMAT PABRIK */}
          <Card sx={{ borderRadius: 2.5, border: '1px solid #CBD5E1', mb: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlantIcon sx={{ color: '#018730' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 17 }}>
                Master Alamat Pabrik PT ITSP (Interview Onsite & Kontrak)
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2.5 }}>
                <TextField
                  fullWidth
                  required
                  label="Alamat Default Plant 1 (Karawang)"
                  value={plantAddressKarawang}
                  onChange={(e) => setPlantAddressKarawang(e.target.value)}
                />
                <TextField
                  fullWidth
                  required
                  label="Alamat Default Plant 2 (Cikarang)"
                  value={plantAddressCikarang}
                  onChange={(e) => setPlantAddressCikarang(e.target.value)}
                />
              </Box>
            </CardContent>
          </Card>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={saving}
            startIcon={<SaveIcon />}
            sx={{
              bgcolor: '#018730',
              fontWeight: 800,
              px: 4,
              py: 1.4,
              borderRadius: 2,
              fontSize: 16,
              '&:hover': { bgcolor: '#005c21' },
            }}
          >
            {saving ? 'Menyimpan Perubahan...' : 'Simpan Pengaturan Default'}
          </Button>
        </form>
      )}
    </Box>
  );
}
