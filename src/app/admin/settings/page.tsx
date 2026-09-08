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
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Save as SaveIcon,
  LocalHospital as McuIcon,
  LocationCity as PlantIcon,
  Email as EmailIcon,
  Send as SendIcon,
  Visibility as PreviewIcon,
  VisibilityOff as VisibilityOffIcon,
  Code as VariableIcon,
  CheckCircle as CheckIcon,
  AdminPanelSettings as ShieldIcon,
  BarChart as GrafanaIcon,
  Dns as ServerIcon,
  Add as AddIcon,
  Launch as LaunchIcon,
  Refresh as RefreshIcon,
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
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Super Admin Authorization & State
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Server SMTP Induk (Khusus Super Admin)
  const [smtpServer, setSmtpServer] = useState({
    id: 1,
    name: 'Server Email Resmi PT ITSP',
    host: 'smtp.gmail.com',
    port: 587,
    username: 'rifqi.alfaridzi22@gmail.com',
    password: '',
    encryption: 'tls',
    isActive: true,
  });
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testSmtpTarget, setTestSmtpTarget] = useState('');
  const [testSmtpChannel, setTestSmtpChannel] = useState('web_karir');

  // Multi-Kanal Pengirim Email (Multi-Web)
  const [channels, setChannels] = useState<Array<{
    id?: number;
    appCode: string;
    appName: string;
    senderName: string;
    senderEmail: string;
    replyTo: string;
    isActive: boolean;
  }>>([
    {
      appCode: 'web_karir',
      appName: 'Portal Karir & Rekrutmen ATS',
      senderName: 'PT ITSP Recruitment',
      senderEmail: 'info.itsp@thaisummit.co.id',
      replyTo: 'recruitment@itsp.co.id',
      isActive: true,
    },
    {
      appCode: 'web_perusahaan',
      appName: 'Website Profil Perusahaan',
      senderName: 'PT ITSP Marketing',
      senderEmail: 'info.itsp@thaisummit.co.id',
      replyTo: 'marketing@itsp.co.id',
      isActive: true,
    },
  ]);

  // Dialog Tambah Kanal Baru
  const [dialogChannelOpen, setDialogChannelOpen] = useState(false);
  const [newChannel, setNewChannel] = useState({
    appCode: '',
    appName: '',
    senderName: '',
    senderEmail: 'info.itsp@thaisummit.co.id',
    replyTo: '',
  });

  // Observability Grafana Cloud
  const [observability, setObservability] = useState({
    grafanaOtlpUrl: 'https://otlp-gateway-prod-ap-southeast-2.grafana.net/otlp/v1/logs',
    grafanaAuthHeader: 'Basic MTgyMTkyOTpnbGNfZXlKdklqb2lNVGt3TXpRM01DSXNJbTRpT2lKcGRITndMV1Z0WVdsc0xXeHZaM01pTENKcklqb2lRMVp0VWt0Vk1VazFaVE0wT0RjMk1tVjFVM3B3VURrMUlpd2liU0k2ZXlKeUlqb2ljSEp2WkMxaGNDMXpiM1YwYUdWaGMzUXRNaUo5ZlE9PQ==',
    grafanaDashboardUrl: 'https://rubylake3285.grafana.net',
    isEnabled: true,
  });

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
        if (data.isSuperAdmin) {
          setIsSuperAdmin(true);
        }
        if (data.smtpServer) {
          setSmtpServer(data.smtpServer);
        }
        if (data.channels && data.channels.length > 0) {
          setChannels(data.channels);
        }
        if (data.observability) {
          setObservability(data.observability);
        }
        if (data.settings) {
          setMcuPartnerName(data.settings.mcu_partner_name || '');
          setMcuPartnerAddress(data.settings.mcu_partner_address || '');
          setMcuPartnerMaps(data.settings.mcu_partner_maps || '');
          setMcuEstimatedCost(data.settings.mcu_estimated_cost || '');
          setMcuInstructions(data.settings.mcu_instructions || '');
          setPlantAddressKarawang(data.settings.plant_address_karawang || '');
          setPlantAddressCikarang(data.settings.plant_address_cikarang || '');

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

    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.isSuperAdmin) setIsSuperAdmin(true);
        if (data.email) {
          setTestEmailTarget(data.email);
          setTestSmtpTarget(data.email);
        }
      })
      .catch(() => {});
  }, []);

  // Simpan Server SMTP & Multi-Kanal (Super Admin)
  const handleSaveSmtpAndChannels = async () => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_smtp_and_channels',
          smtpServer,
          channels,
          observability,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(data.message || 'Konfigurasi Server SMTP, Multi-Kanal Pengirim, dan Grafana Cloud berhasil disimpan!');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Uji Coba Server SMTP Langsung
  const handleTestSmtpConnection = async () => {
    if (!testSmtpTarget) {
      alert('Silakan masukkan alamat email tujuan uji coba.');
      return;
    }

    setTestingSmtp(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_smtp_connection',
          targetEmail: testSmtpTarget,
          channel: testSmtpChannel,
          smtpServer,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(data.message);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setTestingSmtp(false);
    }
  };

  // Tambah Kanal Baru ke Daftar
  const handleAddChannel = () => {
    if (!newChannel.appCode || !newChannel.senderName) {
      alert('Kode Aplikasi dan Nama Pengirim wajib diisi!');
      return;
    }
    const cleanCode = newChannel.appCode.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    setChannels([
      ...channels,
      {
        ...newChannel,
        appCode: cleanCode,
        isActive: true,
      },
    ]);
    setNewChannel({
      appCode: '',
      appName: '',
      senderName: '',
      senderEmail: smtpServer.username || 'info.itsp@thaisummit.co.id',
      replyTo: '',
    });
    setDialogChannelOpen(false);
  };

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
        .replace(/{link_portal}/g, 'http://localhost:3001/login');

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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', mb: 0.5 }}>
            Pengaturan Sistem, Server Email & Observability
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Konfigurasi master template seleksi, server SMTP multi-kanal resmi PT ITSP, dan monitoring log Grafana Cloud.
          </Typography>
        </Box>
        {isSuperAdmin && (
          <Chip
            icon={<ShieldIcon sx={{ color: '#FFFFFF !important' }} />}
            label="Super Admin Mode Active"
            sx={{ bgcolor: '#018730', color: '#FFFFFF', fontWeight: 700, px: 1, py: 0.5 }}
          />
        )}
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
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            bgcolor: '#FFFFFF',
            '& .Mui-selected': { color: '#018730', fontWeight: 800 },
            '& .MuiTabs-indicator': { bgcolor: '#018730', height: 3 },
          }}
        >
          <Tab
            icon={<EmailIcon />}
            iconPosition="start"
            label="Master Template Email Seleksi"
            sx={{ textTransform: 'none', py: 2, px: 3, fontWeight: 600, fontSize: 14 }}
          />
          <Tab
            icon={<McuIcon />}
            iconPosition="start"
            label="Klinik Rekanan MCU & Alamat Pabrik"
            sx={{ textTransform: 'none', py: 2, px: 3, fontWeight: 600, fontSize: 14 }}
          />
          {isSuperAdmin && (
            <Tab
              icon={<ServerIcon />}
              iconPosition="start"
              label="Server Email & Multi-Kanal (Super Admin)"
              sx={{ textTransform: 'none', py: 2, px: 3, fontWeight: 600, fontSize: 14 }}
            />
          )}
          {isSuperAdmin && (
            <Tab
              icon={<GrafanaIcon />}
              iconPosition="start"
              label="Monitoring & Log Grafana Cloud"
              sx={{ textTransform: 'none', py: 2, px: 3, fontWeight: 600, fontSize: 14 }}
            />
          )}
        </Tabs>
      </Paper>

      {/* TAB 0: TEMPLATE EMAIL SELEKSI */}
      {activeTab === 0 && (
        <Box>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #CBD5E1', mb: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ color: '#018730' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 17 }}>
                  Pilih Tahapan Seleksi yang Ingin Diatur Templat-nya
                </Typography>
              </Box>
              <Chip label={currentTemplateDef.stage} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <TextField
                  select
                  fullWidth
                  label="Pilih Template Berdasarkan Tahapan Seleksi"
                  value={selectedTemplateKey}
                  onChange={(e) => setSelectedTemplateKey(e.target.value)}
                  helperText="Pilih tahapan seleksi yang ingin Anda sesuaikan narasi subjek dan isi pesannya."
                >
                  {Object.entries(DEFAULT_EMAIL_TEMPLATES).map(([key, item]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{item.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', ml: 2 }}>{item.stage}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <VariableIcon sx={{ fontSize: 18, color: '#018730' }} /> Variabel Dinamis yang Tersedia untuk Tahapan Ini:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentTemplateDef.variables.map((v) => (
                    <Chip
                      key={v}
                      label={v}
                      size="small"
                      sx={{ bgcolor: '#EFF6FF', color: '#1E40AF', fontWeight: 600, fontFamily: 'monospace', border: '1px solid #BFDBFE' }}
                    />
                  ))}
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Subjek Email Resmi"
                value={currentTemplateVal.subject}
                onChange={(e) => {
                  setEmailTemplates({
                    ...emailTemplates,
                    [selectedTemplateKey]: {
                      ...currentTemplateVal,
                      subject: e.target.value,
                    },
                  });
                }}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                multiline
                rows={10}
                label="Badan Pesan Email (Body Message)"
                value={currentTemplateVal.body}
                onChange={(e) => {
                  setEmailTemplates({
                    ...emailTemplates,
                    [selectedTemplateKey]: {
                      ...currentTemplateVal,
                      body: e.target.value,
                    },
                  });
                }}
                helperText="Gunakan variabel di atas seperti {nama} atau {posisi} yang akan otomatis digantikan sesuai profil kandidat."
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                size="large"
                disabled={saving}
                onClick={handleSaveEmailTemplate}
                startIcon={<SaveIcon />}
                sx={{
                  bgcolor: '#018730',
                  fontWeight: 800,
                  px: 4,
                  py: 1.4,
                  borderRadius: 2,
                  fontSize: 15,
                  '&:hover': { bgcolor: '#005c21' },
                }}
              >
                {saving ? 'Menyimpan Template...' : 'Simpan Seluruh Template Email'}
              </Button>
            </CardContent>
          </Card>

          {/* TEST DISPATCH SECTION */}
          <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
              <SendIcon sx={{ color: '#018730' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16 }}>
                Uji Coba Pengiriman Template ke Email Pribadi
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  label="Alamat Email Tujuan Uji Coba"
                  value={testEmailTarget}
                  onChange={(e) => setTestEmailTarget(e.target.value)}
                  sx={{ minWidth: 320, flexGrow: 1, bgcolor: '#FFFFFF' }}
                />
                <Button
                  variant="outlined"
                  disabled={testingEmail}
                  onClick={handleSendTestEmail}
                  startIcon={testingEmail ? <CircularProgress size={16} /> : <SendIcon />}
                  sx={{ fontWeight: 700, borderColor: '#018730', color: '#018730', px: 3, py: 1 }}
                >
                  {testingEmail ? 'Mengirim...' : 'Kirim Email Uji Coba'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* TAB 1: MCU REKANAN & ALAMAT PABRIK */}
      {activeTab === 1 && (
        <form onSubmit={handleSaveMcuAndPlant}>
          <Card sx={{ borderRadius: 2.5, border: '1px solid #CBD5E1', mb: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
              <McuIcon sx={{ color: '#018730' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 17 }}>
                Master Fasilitas Kesehatan & MCU Rekanan PT ITSP
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mb: 2.5 }}>
                <TextField
                  fullWidth
                  required
                  label="Nama Rumah Sakit / Klinik Rekanan MCU"
                  value={mcuPartnerName}
                  onChange={(e) => setMcuPartnerName(e.target.value)}
                />
                <TextField
                  fullWidth
                  required
                  label="Estimasi Tarif Paket Pemeriksaan MCU"
                  value={mcuEstimatedCost}
                  onChange={(e) => setMcuEstimatedCost(e.target.value)}
                />
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={3}
                  label="Alamat Lengkap Fasilitas MCU"
                  value={mcuPartnerAddress}
                  onChange={(e) => setMcuPartnerAddress(e.target.value)}
                  sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}
                />
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={3}
                  label="Instruksi & Persiapan Medis Pelamar"
                  value={mcuInstructions}
                  onChange={(e) => setMcuInstructions(e.target.value)}
                  sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}
                />
              </Box>
            </CardContent>
          </Card>

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

      {/* TAB 2: SERVER EMAIL & MULTI-KANAL (SUPER ADMIN ONLY) */}
      {activeTab === 2 && isSuperAdmin && (
        <Box>
          {/* SECTION 1: SERVER SMTP INDUK */}
          <Card sx={{ borderRadius: 2.5, border: '1px solid #CBD5E1', mb: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Box sx={{ p: 2.5, bgcolor: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ServerIcon sx={{ color: '#10B981' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 17 }}>
                  1. Server Mail SMTP Induk (Zimbra / Gmail / Corporate Server)
                </Typography>
              </Box>
              <Chip label="Super Admin Only" size="small" sx={{ bgcolor: '#10B981', color: '#FFFFFF', fontWeight: 800 }} />
            </Box>

            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                Konfigurasikan akun server email induk perusahaan. Seluruh website (Web Karir, Web Perusahaan, dll.) akan mengirim email melalui server ini dengan identitas nama pengirim yang disesuaikan.
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2.5, mb: 2.5 }}>
                <TextField
                  fullWidth
                  required
                  label="Host Server SMTP"
                  placeholder="mail.thaisummit.co.id atau smtp.gmail.com"
                  value={smtpServer.host}
                  onChange={(e) => setSmtpServer({ ...smtpServer, host: e.target.value })}
                />
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Port SMTP"
                  placeholder="587 / 465 / 25"
                  value={smtpServer.port}
                  onChange={(e) => setSmtpServer({ ...smtpServer, port: Number(e.target.value) })}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mb: 3 }}>
                <TextField
                  fullWidth
                  required
                  label="Username Akun / Email Otentikasi"
                  placeholder="info.itsp@thaisummit.co.id"
                  value={smtpServer.username}
                  onChange={(e) => setSmtpServer({ ...smtpServer, username: e.target.value })}
                />
                <TextField
                  fullWidth
                  required
                  type={showSmtpPassword ? 'text' : 'password'}
                  label="Password / App Password Akun"
                  value={smtpServer.password}
                  onChange={(e) => setSmtpServer({ ...smtpServer, password: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowSmtpPassword(!showSmtpPassword)} edge="end">
                            {showSmtpPassword ? <VisibilityOffIcon /> : <PreviewIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 3 }}>
                <TextField
                  select
                  size="small"
                  label="Protokol Enkripsi"
                  value={smtpServer.encryption || 'tls'}
                  onChange={(e) => {
                    const enc = e.target.value;
                    let newPort = smtpServer.port;
                    if (enc === 'tls' && (!smtpServer.port || smtpServer.port === 465 || smtpServer.port === 25)) {
                      newPort = 587;
                    } else if (enc === 'ssl' && (!smtpServer.port || smtpServer.port === 587 || smtpServer.port === 25)) {
                      newPort = 465;
                    } else if (enc === 'none' && (!smtpServer.port || smtpServer.port === 587 || smtpServer.port === 465)) {
                      newPort = 25;
                    }
                    setSmtpServer({ ...smtpServer, encryption: enc, port: newPort });
                  }}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="tls">TLS / STARTTLS (Port 587)</MenuItem>
                  <MenuItem value="ssl">SSL Direct (Port 465)</MenuItem>
                  <MenuItem value="none">Tanpa Enkripsi (Port 25)</MenuItem>
                </TextField>
                <FormControlLabel
                  control={
                    <Switch
                      checked={smtpServer.isActive}
                      onChange={(e) => setSmtpServer({ ...smtpServer, isActive: e.target.checked })}
                      color="success"
                    />
                  }
                  label="Server Aktif"
                />
              </Box>

              {/* UJI COBA KONEKSI SMTP */}
              <Box sx={{ p: 2.5, bgcolor: '#F1F5F9', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                  Uji Koneksi Server Email (Verifikasi Langsung ke Inbox)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField
                    select
                    size="small"
                    label="Pilih Kanal Pengirim"
                    value={testSmtpChannel}
                    onChange={(e) => setTestSmtpChannel(e.target.value)}
                    sx={{ minWidth: 200, bgcolor: '#FFFFFF' }}
                  >
                    {channels.map((ch) => (
                      <MenuItem key={ch.appCode} value={ch.appCode}>
                        {ch.senderName} ({ch.appCode})
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    label="Email Tujuan Verifikasi"
                    value={testSmtpTarget}
                    onChange={(e) => setTestSmtpTarget(e.target.value)}
                    sx={{ minWidth: 280, flexGrow: 1, bgcolor: '#FFFFFF' }}
                  />
                  <Button
                    variant="contained"
                    disabled={testingSmtp}
                    onClick={handleTestSmtpConnection}
                    startIcon={testingSmtp ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SendIcon />}
                    sx={{ bgcolor: '#0F172A', color: '#fff', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#1E293B' } }}
                  >
                    {testingSmtp ? 'Menguji Koneksi...' : 'Tes Koneksi SMTP'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* SECTION 2: MULTI-KANAL IDENTITAS PENGIRIM */}
          <Card sx={{ borderRadius: 2.5, border: '1px solid #CBD5E1', mb: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ color: '#018730' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 17 }}>
                  2. Identitas Nama Pengirim Multi-Kanal (Per Aplikasi / Web)
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setDialogChannelOpen(true)}
                sx={{ fontWeight: 700, borderColor: '#018730', color: '#018730' }}
              >
                + Tambah Kanal Web Baru
              </Button>
            </Box>

            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                Satu akun server mail di atas dapat mengirim email dengan identitas nama pengirim (*Sender Display Name*) dan alamat balasan (*Reply-To*) yang berbeda sesuai website pemanggil.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {channels.map((ch, idx) => (
                  <Paper key={ch.appCode} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: ch.isActive ? '#FFFFFF' : '#F8FAFC' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Chip label={ch.appCode} size="small" className="notranslate" translate="no" sx={{ fontWeight: 800, bgcolor: '#EFF6FF', color: '#1E40AF' }} />
                        <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{ch.appName}</Typography>
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={ch.isActive}
                            onChange={(e) => {
                              const updated = [...channels];
                              updated[idx].isActive = e.target.checked;
                              setChannels(updated);
                            }}
                            color="success"
                          />
                        }
                        label="Kanal Aktif"
                      />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                      <TextField
                        size="small"
                        label="Nama Pengirim Resmi"
                        value={ch.senderName}
                        onChange={(e) => {
                          const updated = [...channels];
                          updated[idx].senderName = e.target.value;
                          setChannels(updated);
                        }}
                        helperText="Tampil di inbox (misal: PT ITSP Recruitment)"
                      />
                      <TextField
                        size="small"
                        label="Alamat Email Pengirim"
                        value={ch.senderEmail}
                        onChange={(e) => {
                          const updated = [...channels];
                          updated[idx].senderEmail = e.target.value;
                          setChannels(updated);
                        }}
                        helperText="Alamat email header pengirim"
                      />
                      <TextField
                        size="small"
                        label="Alamat Balasan (Reply-To)"
                        value={ch.replyTo}
                        onChange={(e) => {
                          const updated = [...channels];
                          updated[idx].replyTo = e.target.value;
                          setChannels(updated);
                        }}
                        helperText="Kemana penerima membalas pesan"
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* TOMBOL SIMPAN UTAMA */}
          <Button
            variant="contained"
            size="large"
            disabled={saving}
            onClick={handleSaveSmtpAndChannels}
            startIcon={<SaveIcon />}
            sx={{
              bgcolor: '#018730',
              fontWeight: 800,
              px: 5,
              py: 1.6,
              borderRadius: 2,
              fontSize: 16,
              '&:hover': { bgcolor: '#005c21' },
            }}
          >
            {saving ? 'Menyimpan Seluruh Konfigurasi...' : 'Simpan Seluruh Pengaturan Server & Multi-Kanal'}
          </Button>

          {/* DIALOG TAMBAH KANAL BARU */}
          <Dialog open={dialogChannelOpen} onClose={() => setDialogChannelOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, color: '#0F172A' }}>
              Tambah Kanal Identitas Pengirim Web Baru
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                required
                label="Kode Aplikasi Unik (app_code)"
                placeholder="misal: web_procurement atau mobile_app"
                value={newChannel.appCode}
                onChange={(e) => setNewChannel({ ...newChannel, appCode: e.target.value })}
                helperText="Hanya huruf kecil, angka, dan underscore."
              />
              <TextField
                required
                label="Nama Aplikasi / Web Tampilan"
                placeholder="misal: Portal Procurement & Supplier"
                value={newChannel.appName}
                onChange={(e) => setNewChannel({ ...newChannel, appName: e.target.value })}
              />
              <TextField
                required
                label="Nama Pengirim Resmi"
                placeholder="misal: PT ITSP Purchasing Center"
                value={newChannel.senderName}
                onChange={(e) => setNewChannel({ ...newChannel, senderName: e.target.value })}
              />
              <TextField
                label="Email Pengirim"
                value={newChannel.senderEmail}
                onChange={(e) => setNewChannel({ ...newChannel, senderEmail: e.target.value })}
              />
              <TextField
                label="Alamat Balasan (Reply-To)"
                placeholder="purchasing@itsp.co.id"
                value={newChannel.replyTo}
                onChange={(e) => setNewChannel({ ...newChannel, replyTo: e.target.value })}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setDialogChannelOpen(false)}>Batal</Button>
              <Button variant="contained" onClick={handleAddChannel} sx={{ bgcolor: '#018730', fontWeight: 700 }}>
                Tambahkan Kanal
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {/* TAB 3: MONITORING & LOG GRAFANA CLOUD (SUPER ADMIN ONLY) */}
      {activeTab === 3 && isSuperAdmin && (
        <Box>
          {/* BANNER OBSERVABILITY */}
          <Paper sx={{ p: 3, borderRadius: 2.5, bgcolor: '#0F172A', color: '#FFFFFF', mb: 3, border: '1px solid #1E293B' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#10B981', mb: 0.5 }}>
                  Observability & Live Log Pengiriman Email Terpusat (Grafana Cloud)
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  Seluruh log pengiriman email dialirkan secara asinkron (non-blocking) ke Grafana Cloud Loki. Database PostgreSQL tetap bersih tanpa beban log besar.
                </Typography>
              </Box>
              <Button
                variant="contained"
                target="_blank"
                href={observability.grafanaDashboardUrl || 'https://rubylake3285.grafana.net'}
                startIcon={<LaunchIcon />}
                sx={{ bgcolor: '#10B981', color: '#0F172A', fontWeight: 800, '&:hover': { bgcolor: '#059669', color: '#fff' } }}
              >
                Buka Dashboard Grafana
              </Button>
            </Box>
          </Paper>

          {/* QUICK CARDS */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', p: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <GrafanaIcon sx={{ color: '#018730', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 16 }}>
                    Live Log Ingestion (OTLP Stream)
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                  Setiap kali ada email terkirim atau gagal (baik otomatis maupun manual), record lengkap langsung masuk ke Grafana Loki dalam hitungan milidetik.
                </Typography>
                <Chip label="Status: Terhubung & Live Stream Aktif" color="success" size="small" sx={{ fontWeight: 700 }} />
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', p: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <ShieldIcon sx={{ color: '#018730', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 16 }}>
                    Grafana Alerting & Early Warning
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                  Peringatan otomatis aktif di Grafana Cloud untuk memantau jika ada error autentikasi SMTP atau server email mengalami down.
                </Typography>
                <Chip label="Auto-Purge 30 Hari: Aktif (Kapasitas Selalu Terjaga)" color="primary" size="small" sx={{ fontWeight: 700 }} />
              </CardContent>
            </Card>
          </Box>

          {/* EMBEDDED PREVIEW CONTAINER */}
          <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', overflow: 'hidden', mb: 3 }}>
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#334155' }}>
                Pratinjau Dashboard Grafana Cloud: {observability.grafanaDashboardUrl}
              </Typography>
              <Button
                size="small"
                variant="text"
                target="_blank"
                href={observability.grafanaDashboardUrl}
                endIcon={<LaunchIcon sx={{ fontSize: 16 }} />}
                sx={{ fontWeight: 700, color: '#018730' }}
              >
                Buka Tab Penuh
              </Button>
            </Box>
            <Box sx={{ width: '100%', height: 600, bgcolor: '#111217' }}>
              <iframe
                src={observability.grafanaDashboardUrl}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Grafana Observability Dashboard"
              />
            </Box>
          </Card>

          {/* FORM PENGATURAN KONEKSI GRAFANA */}
          <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
            <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>
                Konfigurasi Teknis Endpoint Grafana Cloud
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2.5, mb: 3 }}>
                <TextField
                  fullWidth
                  label="URL Endpoint OTLP Gateway Grafana"
                  value={observability.grafanaOtlpUrl}
                  onChange={(e) => setObservability({ ...observability, grafanaOtlpUrl: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Header Autentikasi Grafana (Basic Token)"
                  value={observability.grafanaAuthHeader}
                  onChange={(e) => setObservability({ ...observability, grafanaAuthHeader: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="URL Instance / Dashboard Grafana"
                  value={observability.grafanaDashboardUrl}
                  onChange={(e) => setObservability({ ...observability, grafanaDashboardUrl: e.target.value })}
                />
              </Box>

              <Button
                variant="contained"
                disabled={saving}
                onClick={handleSaveSmtpAndChannels}
                startIcon={<SaveIcon />}
                sx={{ bgcolor: '#018730', fontWeight: 800, px: 4, py: 1.2, '&:hover': { bgcolor: '#005c21' } }}
              >
                Simpan Endpoint Grafana
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
