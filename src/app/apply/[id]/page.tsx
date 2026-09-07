'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  MarkEmailRead as EmailSentIcon,
  Login as LoginIcon,
  Info as InfoIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

const MAX_FILE_SIZE_BYTES = 100 * 1024; // 100 KB

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(jobId || '');
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Status jika pengguna saat ini sudah login sebagai pelamar
  const [activeApplicant, setActiveApplicant] = useState<any | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 13 Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [lastEducation, setLastEducation] = useState('SMK');
  const [schoolName, setSchoolName] = useState('');
  const [major, setMajor] = useState('');
  const [experience, setExperience] = useState('');
  const [englishSkill, setEnglishSkill] = useState('Intermediate');
  const [otherLanguages, setOtherLanguages] = useState('');

  // CV Upload (Max 100 KB)
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvBase64, setCvBase64] = useState<string>('');
  const [cvFileSize, setCvFileSize] = useState<number>(0);
  const [fileError, setFileError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<any | null>(null);

  // Periksa apakah browser sedang dalam sesi login pelamar aktif
  useEffect(() => {
    fetch('/api/applicant/status')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.applicant) {
          const app = data.applicant;
          const daysOld = (Date.now() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          const isStillActive = app.stageStatus === 'in_progress' && daysOld < 30;
          if (isStillActive) {
            setActiveApplicant(app);
          } else {
            // Jika lamaran sebelumnya sudah Gugur atau mangkir > 30 hari, izinkan daftar ulang!
            setActiveApplicant(null);
            if (app.fullName) setFullName(app.fullName);
            if (app.email) setEmail(app.email);
            if (app.phone) setPhone(app.phone);
          }
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleLogoutExisting = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setActiveApplicant(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Jobs
  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs) {
          setJobs(data.jobs);
          if (!selectedJobId && data.jobs.length > 0) {
            setSelectedJobId(data.jobs[0].id.toString());
          }
        }
      })
      .finally(() => setLoadingJobs(false));
  }, []);

  // Calculate Age automatically from birthDate
  const handleBirthDateChange = (val: string) => {
    setBirthDate(val);
    if (val) {
      const birth = new Date(val);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge > 0 ? calculatedAge : 18);
    } else {
      setAge('');
    }
  };

  // Handle PDF File Upload with STRICT 100 KB limit
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Format file harus berupa dokumen PDF (.pdf)! Format Word, gambar, atau ZIP tidak diizinkan.');
      setCvFile(null);
      setCvBase64('');
      setCvFileSize(0);
      return;
    }

    // Validate size (strictly 100 KB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeKb = (file.size / 1024).toFixed(1);
      setFileError(
        `Ukuran file Anda (${sizeKb} KB) melebihi batas maksimal 100 KB! Sistem menolak file ini. Silakan kompres PDF Anda terlebih dahulu.`
      );
      setCvFile(null);
      setCvBase64('');
      setCvFileSize(file.size);
      return;
    }

    setCvFile(file);
    setCvFileSize(file.size);

    // Read to Base64
    const reader = new FileReader();
    reader.onload = () => {
      setCvBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanSchoolName = schoolName.trim();
    const cleanMajor = major.trim();

    if (!cleanFullName || !cleanEmail || !cleanPhone || !birthDate || !cleanSchoolName || !cleanMajor) {
      setErrorMessage('Mohon lengkapi seluruh formulir pendaftaran 13 kolom yang bertanda bintang (*). Tidak boleh ada data yang dikosongkan.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Format alamat email tidak valid. Mohon masukkan email aktif dengan benar (contoh: nama@domain.com).');
      return;
    }

    if (!cvBase64) {
      setErrorMessage('Mohon unggah berkas CV Anda dalam format PDF dengan ukuran maksimal 100 KB.');
      return;
    }

    if (cvFileSize > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('Berkas CV Anda melebihi 100 KB. Mohon kompres file sebelum mengirim.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanFullName,
          email: cleanEmail,
          phone: cleanPhone,
          birthDate,
          age: Number(age),
          lastEducation,
          schoolName: cleanSchoolName,
          major: cleanMajor,
          jobPostingId: Number(selectedJobId),
          experience: experience.trim() || 'Fresh Graduate',
          englishSkill,
          otherLanguages: otherLanguages.trim() || '-',
          cvBase64,
          cvFileName: cvFile?.name || 'cv.pdf',
          cvFileSize,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirimkan lamaran kerja.');
      }

      setSuccessInfo(data);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedJob = jobs.find((j) => j.id.toString() === selectedJobId);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
      <Navbar />

      <Container maxWidth="md" sx={{ py: 6, flex: 1 }}>
        <Button
          onClick={() => router.push('/#lowongan')}
          startIcon={<ArrowBackIcon />}
          sx={{ color: '#64748B', fontWeight: 600, mb: 3 }}
        >
          Kembali ke Daftar Lowongan
        </Button>

        {checkingAuth ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#018730' }} />
            <Typography variant="body2" sx={{ color: '#64748B', mt: 2 }}>
              Memeriksa status akun pendaftaran...
            </Typography>
          </Box>
        ) : activeApplicant ? (
          /* JIKA PELAMAR SEDANG LOGIN: TAMPILKAN BLOKIR 1 EMAIL 1 PELAMAR */
          <Card sx={{ borderRadius: 3, border: '2px solid #93C5FD', boxShadow: '0 12px 36px rgba(37, 99, 235, 0.12)' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2.5,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)',
                }}
              >
                <InfoIcon sx={{ fontSize: 44 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                Anda Sudah Memiliki Lamaran Terdaftar
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', maxWidth: 600, mx: 'auto', mb: 3, lineHeight: 1.6 }}>
                Halo, <strong>{activeApplicant.fullName}</strong>. Anda saat ini tercatat dalam sistem rekrutmen kami dengan email{' '}
                <strong>{activeApplicant.email}</strong> untuk posisi <strong>{activeApplicant.jobPosting?.title || 'Lamaran Kerja'}</strong>.
              </Typography>

              <Alert severity="info" sx={{ maxWidth: 580, mx: 'auto', textAlign: 'left', mb: 4, borderRadius: 2 }}>
                Sesuai kebijakan resmi rekrutmen PT Indonesia Thai Summit Plastech, <strong>1 alamat email hanya dapat digunakan untuk 1 berkas pelamar</strong>. Anda tidak perlu mendaftar ulang.
              </Alert>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/portal/dashboard')}
                  sx={{
                    bgcolor: '#018730',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    px: 3.5,
                    py: 1.3,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#005c21' },
                  }}
                >
                  Buka Dashboard Progres Seleksi &rarr;
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={handleLogoutExisting}
                  startIcon={<LogoutIcon />}
                  sx={{ fontWeight: 600, px: 2.5, borderRadius: 2 }}
                >
                  Keluar / Gunakan Akun Lain
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : successInfo ? (
          /* JIKA BERHASIL MENDAFTAR: ALUR WAJIB CEK EMAIL */
          <Card sx={{ borderRadius: 3, border: '2px solid #86EFAC', boxShadow: '0 12px 36px rgba(1, 135, 48, 0.12)' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  bgcolor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2.5,
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
                }}
              >
                <EmailSentIcon sx={{ fontSize: 44 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                Lamaran Kerja Berhasil Dikirim!
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', maxWidth: 620, mx: 'auto', mb: 3.5, lineHeight: 1.6 }}>
                Terima kasih, <strong>{successInfo.applicant.fullName}</strong>. Berkas lamaran Anda untuk posisi{' '}
                <strong>{successInfo.applicant.jobTitle}</strong> telah resmi tercatat di sistem ATS PT Indonesia Thai Summit Plastech.
              </Typography>

              {/* Box Instruksi Cek Email */}
              <Box
                sx={{
                  bgcolor: '#F8FAFC',
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: 2.5,
                  maxWidth: 580,
                  mx: 'auto',
                  textAlign: 'left',
                  mb: 4,
                  border: '1.5px solid #CBD5E1',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <EmailSentIcon sx={{ color: '#018730', fontSize: 26 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Silakan Periksa Email Anda Untuk Kredensial Akun
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#334155', mb: 1.5, lineHeight: 1.6 }}>
                  Sistem kami telah mengirimkan detail kredensial dan <strong>Password Sementara</strong> resmi ke alamat email pendaftaran Anda:
                </Typography>
                <Box
                  sx={{
                    bgcolor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#1E40AF',
                    p: 1.5,
                    borderRadius: 1.5,
                    fontWeight: 700,
                    fontSize: 15,
                    textAlign: 'center',
                    mb: 2,
                    wordBreak: 'break-all',
                  }}
                >
                  {successInfo.applicant.email}
                </Box>
                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, fontSize: 13 }}>
                  • Buka kotak masuk (<strong>Inbox</strong>) email Anda untuk menyalin password sementara.<br />
                  • Jika belum muncul dalam 1–2 menit, mohon periksa folder <strong>Spam</strong> atau <strong>Promosi</strong>.<br />
                  • Gunakan email dan password tersebut untuk login ke Portal Pelamar dan memantau progres 7 tahap seleksi.
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/login')}
                startIcon={<LoginIcon />}
                sx={{
                  bgcolor: '#018730',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: 16,
                  boxShadow: '0 4px 14px rgba(1, 135, 48, 0.3)',
                  '&:hover': { bgcolor: '#005c21' },
                }}
              >
                Buka Halaman Login Pelamar &rarr;
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #018730 0%, #005c21 100%)',
                color: '#FFFFFF',
                p: { xs: 3, md: 4 },
                borderBottom: '4px solid #fc4509',
              }}
            >
              <Typography variant="overline" sx={{ color: '#FED7AA', fontWeight: 800, fontSize: 12 }}>
                FORMULIR LAMARAN PEKERJAAN RESMI
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: '-0.02em' }}>
                Formulir Pendaftaran Calon Karyawan
              </Typography>
              <Typography variant="body2" sx={{ color: '#D1FAE5', mt: 1 }}>
                PT Indonesia Thai Summit Plastech • Harap mengisi 13 kolom isian dengan data asli yang dapat dipertanggungjawabkan.
              </Typography>
            </Box>

            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              {errorMessage && (
                <Alert
                  severity="error"
                  sx={{ mb: 4, borderRadius: 2 }}
                  action={
                    (errorMessage.includes('sudah terdaftar') || errorMessage.includes('1 alamat email')) ? (
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => router.push('/login')}
                        sx={{ fontWeight: 700, textDecoration: 'underline' }}
                      >
                        Login Sekarang
                      </Button>
                    ) : undefined
                  }
                >
                  {errorMessage}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
                  {/* 1. Posisi Lowongan */}
                  <Box sx={{ gridColumn: 'span 12' }}>
                    <TextField
                      select
                      fullWidth
                      required
                      label="1. Posisi yang Dilamar"
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      helperText={selectedJob ? `Departemen: ${selectedJob.department} | Lokasi: ${selectedJob.location}` : ''}
                    >
                      {jobs.map((j) => (
                        <MenuItem key={j.id} value={j.id.toString()}>
                          {j.title} ({j.department})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  {/* 2. Nama Lengkap */}
                  <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <TextField
                      fullWidth
                      required
                      label="2. Nama Lengkap (Sesuai KTP)"
                      placeholder="Masukkan nama lengkap"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </Box>

                  {/* 3. Alamat Email */}
                  <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <TextField
                      fullWidth
                      required
                      type="email"
                      label="3. Alamat Email Aktif"
                      placeholder="contoh@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      helperText="Notifikasi kelolosan & jadwal tes akan dikirim ke email ini"
                    />
                  </Box>

                  {/* 4. Nomor Telepon / WA */}
                  <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <TextField
                      fullWidth
                      required
                      label="4. Nomor WhatsApp / Handphone"
                      placeholder="08123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Box>

                  {/* 5. Tanggal Lahir & Usia */}
                  <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                    <TextField
                      fullWidth
                      required
                      type="date"
                      label="5. Tanggal Lahir"
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={birthDate}
                      onChange={(e) => handleBirthDateChange(e.target.value)}
                    />
                  </Box>
                  <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 2' } }}>
                    <TextField
                      fullWidth
                      label="Usia"
                      value={age !== '' ? `${age} Tahun` : '-'}
                      disabled
                      helperText="Otomatis"
                    />
                  </Box>

                  {/* 6. Pendidikan Terakhir */}
                  <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                    <TextField
                      select
                      fullWidth
                      required
                      label="6. Pendidikan Terakhir"
                      value={lastEducation}
                      onChange={(e) => setLastEducation(e.target.value)}
                    >
                      <MenuItem value="SMK">SMK / SMA Sederajat</MenuItem>
                      <MenuItem value="D3">Diploma 3 (D3)</MenuItem>
                      <MenuItem value="D4">Diploma 4 (D4)</MenuItem>
                      <MenuItem value="S1">Sarjana (S1)</MenuItem>
                      <MenuItem value="S2">Magister (S2)</MenuItem>
                    </TextField>
                  </Box>

                  {/* 7. Nama Sekolah / Universitas */}
                  <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                    <TextField
                      fullWidth
                      required
                      label="7. Nama Sekolah / Universitas"
                      placeholder="Misal: SMKN 1 Karawang / Unsika"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                    />
                  </Box>

                  {/* 8. Jurusan */}
                  <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                    <TextField
                      fullWidth
                      required
                      label="8. Jurusan"
                      placeholder="Misal: Teknik Mesin / Informatika"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                    />
                  </Box>

                  {/* 9. Pengalaman Kerja */}
                  <Box sx={{ gridColumn: 'span 12' }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="9. Pengalaman Kerja Terakhir (Nama Perusahaan, Posisi, Masa Kerja)"
                      placeholder="Tuliskan Fresh Graduate jika belum pernah bekerja, atau sebutkan pengalaman kerja manufaktur Anda."
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                    />
                  </Box>

                  {/* 10. Kemampuan Bahasa Inggris */}
                  <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <TextField
                      select
                      fullWidth
                      required
                      label="10. Kemampuan Bahasa Inggris"
                      value={englishSkill}
                      onChange={(e) => setEnglishSkill(e.target.value)}
                    >
                      <MenuItem value="Beginner">Beginner (Pemula / Pasif)</MenuItem>
                      <MenuItem value="Intermediate">Intermediate (Cukup / Menengah)</MenuItem>
                      <MenuItem value="Advanced">Advanced (Lancar / Fasih)</MenuItem>
                    </TextField>
                  </Box>

                  {/* 11. Bahasa Asing Lainnya */}
                  <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                    <TextField
                      fullWidth
                      label="11. Bahasa Asing Lainnya (Opsional)"
                      placeholder="Misal: Bahasa Jepang (N3), Bahasa Thai, Mandarin"
                      value={otherLanguages}
                      onChange={(e) => setOtherLanguages(e.target.value)}
                    />
                  </Box>

                  {/* 12. Upload Berkas CV (STRICT MAX 100 KB) */}
                  <Box sx={{ gridColumn: 'span 12' }}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2.5,
                        border: '2px dashed',
                        borderColor: fileError ? '#EF4444' : cvFile ? '#10B981' : '#CBD5E1',
                        bgcolor: fileError ? '#FEF2F2' : cvFile ? '#ECFDF5' : '#F8FAFC',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      <UploadIcon
                        sx={{
                          fontSize: 44,
                          color: fileError ? '#EF4444' : cvFile ? '#10B981' : '#64748B',
                          mb: 1,
                        }}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                        12. Unggah Berkas CV (Curriculum Vitae)
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                        Wajib format <strong>PDF (.pdf)</strong> dengan ukuran <strong>MAKSIMAL 100 KB</strong>.
                      </Typography>

                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        id="cv-upload-input"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />
                      <label htmlFor="cv-upload-input">
                        <Button
                          variant="outlined"
                          component="span"
                          sx={{
                            borderColor: '#018730',
                            color: '#018730',
                            fontWeight: 700,
                            borderRadius: 2,
                            px: 3,
                            '&:hover': { borderColor: '#005c21', bgcolor: '#e8f5e9' },
                          }}
                        >
                          {cvFile ? 'Ganti File CV' : 'Pilih File PDF dari Komputer'}
                        </Button>
                      </label>

                      {/* File Size Indicator */}
                      {cvFileSize > 0 && (
                        <Box sx={{ mt: 2.5, maxWidth: 360, mx: 'auto' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8, fontSize: 13 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155' }}>
                              {cvFile ? cvFile.name : 'File terpilih'}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: cvFileSize > MAX_FILE_SIZE_BYTES ? '#EF4444' : '#10B981',
                              }}
                            >
                              {(cvFileSize / 1024).toFixed(1)} KB / 100 KB
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, (cvFileSize / MAX_FILE_SIZE_BYTES) * 100)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: '#E2E8F0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: cvFileSize > MAX_FILE_SIZE_BYTES ? '#EF4444' : '#10B981',
                              },
                            }}
                          />
                        </Box>
                      )}

                      {fileError && (
                        <Alert severity="error" sx={{ mt: 2, maxWidth: 500, mx: 'auto', borderRadius: 2 }}>
                          {fileError}
                        </Alert>
                      )}

                      {cvFile && !fileError && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2, color: '#16A34A', fontSize: 14, fontWeight: 600 }}>
                          <CheckCircleIcon sx={{ fontSize: 18 }} />
                          <span>File valid: {cvFile.name} ({(cvFileSize / 1024).toFixed(1)} KB)</span>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* 13. Submit Button */}
                  <Box sx={{ gridColumn: 'span 12' }}>
                    <Divider sx={{ my: 2 }} />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={submitting || !cvFile || Boolean(fileError)}
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      sx={{
                        bgcolor: '#018730',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: 16,
                        py: 1.5,
                        borderRadius: 2.5,
                        boxShadow: '0 6px 18px rgba(1,135,48,0.25)',
                        '&:hover': { bgcolor: '#005c21' },
                      }}
                    >
                      {submitting ? 'Mengirimkan Lamaran...' : 'Kirim Berkas Lamaran Pekerjaan'}
                    </Button>
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', textAlign: 'center', mt: 1.5 }}>
                      Dengan mengirimkan formulir ini, Anda menyatakan data yang Anda berikan adalah benar dan dapat dipertanggungjawabkan.
                    </Typography>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
