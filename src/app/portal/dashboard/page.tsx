'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  PlayArrow as PlayIcon,
  VideoCall as VideoIcon,
  LocationOn as LocationIcon,
  LocalHospital as McuIcon,
  Description as DocIcon,
  AssignmentTurnedIn as OfferIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
  Schedule as ClockIcon,
} from '@mui/icons-material';
import { RECRUITMENT_STAGES } from '@/lib/constants';

export default function ApplicantDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active step view (0 to 6)
  const [activeStep, setActiveStep] = useState(0);

  // Token Modal
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [tokenTestType, setTokenTestType] = useState<'psikotes' | 'user_test'>('psikotes');
  const [examTokenInput, setExamTokenInput] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [verifyingToken, setVerifyingToken] = useState(false);

  // Accepting Offer
  const [acceptingOffer, setAcceptingOffer] = useState(false);

  const fetchStatus = () => {
    setLoading(true);
    fetch('/api/applicant/status')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((resData) => {
        if (resData && resData.applicant) {
          setData(resData);
          setActiveStep(Math.min(6, resData.applicant.currentStage - 1));
        }
      })
      .catch((err) => setError('Gagal memuat data status pelamar.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Open Token Modal
  const handleOpenExamModal = (type: 'psikotes' | 'user_test') => {
    setTokenTestType(type);
    setExamTokenInput('');
    setTokenError(null);
    setTokenModalOpen(true);
  };

  // Verify Token & Redirect to Exam
  const handleVerifyToken = async () => {
    if (!examTokenInput.trim()) {
      setTokenError('Password / Token sesi ujian wajib diisi.');
      return;
    }

    setVerifyingToken(true);
    setTokenError(null);

    try {
      const res = await fetch('/api/test/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: tokenTestType,
          token: examTokenInput,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Token tidak valid.');

      setTokenModalOpen(false);
      router.push(`/portal/test/${tokenTestType}`);
    } catch (err: any) {
      setTokenError(err.message);
    } finally {
      setVerifyingToken(false);
    }
  };

  // Handle Accept Offering Letter
  const handleAcceptOffer = async () => {
    setAcceptingOffer(true);
    try {
      const res = await fetch('/api/applicant/accept-offer', { method: 'POST' });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);
      fetchStatus();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAcceptingOffer(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
        <Navbar />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 12 }}>
          <CircularProgress sx={{ color: '#018730' }} />
        </Box>
        <Footer />
      </Box>
    );
  }

  const applicant = data?.applicant;
  const currentStageNum = applicant?.currentStage || 1;
  const isFailed = applicant?.stageStatus === 'failed';

  // Find submissions
  const psikotesSub = applicant?.testSubmissions?.find((s: any) => s.testType === 'psikotes');
  const userTestSub = applicant?.testSubmissions?.find((s: any) => s.testType === 'user_test');

  // Find interviews
  const hrInterview = applicant?.interviews?.find((i: any) => i.interviewType === 'hr');
  const userInterview = applicant?.interviews?.find((i: any) => i.interviewType === 'user');

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        {/* Candidate Header Profile Card */}
        <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', mb: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #018730 0%, #005c21 100%)',
              color: '#FFFFFF',
              p: 3.5,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              borderBottom: '4px solid #fc4509',
            }}
          >
            <Box>
              <Typography variant="overline" sx={{ color: '#FED7AA', fontWeight: 800, fontSize: 11 }}>
                PORTAL KANDIDAT RESMI
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mt: 0.5 }}>
                {applicant?.fullName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#D1FAE5', mt: 0.5 }}>
                Posisi: <strong>{applicant?.jobPosting?.title}</strong> ({applicant?.jobPosting?.department}) • {applicant?.email}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={fetchStatus}
                startIcon={<RefreshIcon />}
                sx={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(255,255,255,0.4)',
                  fontWeight: 700,
                  '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Segarkan
              </Button>
              <Button
                variant="contained"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{
                  bgcolor: '#0F172A',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#1E293B' },
                }}
              >
                Keluar
              </Button>
            </Box>
          </Box>

          {/* Status Alert Banner */}
          <Box sx={{ p: 2.5, bgcolor: isFailed ? '#FEF2F2' : '#F0FDF4', borderBottom: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isFailed ? (
                <>
                  <CancelIcon sx={{ color: '#DC2626', fontSize: 26 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#991B1B', fontWeight: 800 }}>
                      Status Seleksi: Belum Memenuhi Kualifikasi pada Tahap {applicant?.failedAtStage}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#7F1D1D' }}>
                      {applicant?.rejectionReason || 'Terima kasih atas partisipasi Anda. Profil Anda tersimpan dalam Talent Pool kami.'}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <CheckCircleIcon sx={{ color: '#16A34A', fontSize: 26 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#166534', fontWeight: 800 }}>
                      Status Seleksi: Aktif di Tahap {currentStageNum} ({RECRUITMENT_STAGES[currentStageNum - 1]?.name})
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#15803D' }}>
                      Pantau instruksi di bawah ini untuk menyelesaikan rangkaian tahapan seleksi Anda.
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Card>

        {/* 7-STAGE PROGRESS STEPPER */}
        <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', p: { xs: 2.5, md: 4 }, mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', mb: 3 }}>
            PROGRESS PELACAK SELEKSI 7 TAHAP
          </Typography>

          <Stepper nonLinear activeStep={activeStep} alternativeLabel>
            {RECRUITMENT_STAGES.map((stage, idx) => {
              const isPassed = currentStageNum > stage.number || (currentStageNum === 7 && applicant?.stageStatus === 'passed');
              const isCurrent = currentStageNum === stage.number;
              const isLocked = currentStageNum < stage.number;

              return (
                <Step key={stage.id} completed={isPassed}>
                  <StepButton onClick={() => setActiveStep(idx)}>
                    <StepLabel
                      slotProps={{
                        stepIcon: {
                          sx: {
                            '&.Mui-completed': { color: '#16A34A' },
                            '&.Mui-active': { color: isFailed && isCurrent ? '#DC2626' : '#018730' },
                          },
                        },
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#018730' : '#475569' }}>
                        {stage.shortName}
                      </Typography>
                    </StepLabel>
                  </StepButton>
                </Step>
              );
            })}
          </Stepper>
        </Card>

        {/* ACTIVE STAGE CONTENT CARD */}
        <Card sx={{ borderRadius: 3, border: '1.5px solid #018730', boxShadow: '0 8px 30px rgba(1, 135, 48, 0.08)', overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#018730', color: '#FFFFFF', px: 3.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 18 }}>
              Rincian: Tahap {activeStep + 1} — {RECRUITMENT_STAGES[activeStep]?.name}
            </Typography>
            <Chip
              label={
                currentStageNum > activeStep + 1
                  ? 'LOLOS'
                  : currentStageNum === activeStep + 1
                  ? isFailed
                    ? 'TIDAK LOLOS'
                    : 'SEDANG BERJALAN'
                  : 'TERKUNCI'
              }
              sx={{
                bgcolor:
                  currentStageNum > activeStep + 1
                    ? '#DCFCE7'
                    : currentStageNum === activeStep + 1
                    ? isFailed
                      ? '#FEE2E2'
                      : '#FEF3C7'
                    : '#E2E8F0',
                color:
                  currentStageNum > activeStep + 1
                    ? '#166534'
                    : currentStageNum === activeStep + 1
                    ? isFailed
                      ? '#991B1B'
                      : '#92400E'
                    : '#64748B',
                fontWeight: 800,
                fontSize: 11,
              }}
            />
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 4.5 } }}>
            {/* STAGE 1: SCREENING */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="body1" sx={{ color: '#334155', mb: 3, lineHeight: 1.65 }}>
                  Berkas Curriculum Vitae (CV) dan data 13 kolom pendaftaran Anda telah berhasil diunggah ke sistem ATS PT ITSP. Tim Human Capital Management saat ini sedang meninjau kesesuaian kualifikasi pendidikan, jurusan, dan pengalaman kerja Anda.
                </Typography>
                <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                    Informasi Berkas Anda:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    • Pendidikan: {applicant?.lastEducation} {applicant?.major} ({applicant?.schoolName})
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    • Berkas CV: Terverifikasi (Ukuran &lt; 100 KB PDF)
                  </Typography>
                  {applicant?.screeningNotes && (
                    <Typography variant="body2" sx={{ color: '#018730', fontWeight: 600, mt: 1 }}>
                      • Catatan HR: {applicant.screeningNotes}
                    </Typography>
                  )}
                </Box>
                {currentStageNum > 1 && (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Selamat! Berkas Anda telah disetujui oleh HR. Anda telah lolos ke Tahap 2 (Tes Psikotes Online).
                  </Alert>
                )}
              </Box>
            )}

            {/* STAGE 2: PSIKOTES ONLINE */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="body1" sx={{ color: '#334155', mb: 3, lineHeight: 1.65 }}>
                  Tes Psikotes & Potensi Akademik Online bertujuan untuk mengukur kemampuan logika, penalaran analitis, ketelitian kerja, dan pemahaman instruksi manufaktur standar PT ITSP.
                </Typography>

                <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
                    Ketentuan & Sistem Keamanan Ujian:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 0.5 }}>
                    • <strong>Jadwal Ujian:</strong>{' '}
                    {applicant?.psikotesScheduledAt
                      ? new Date(applicant.psikotesScheduledAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })
                      : 'Terbuka / Sesuai Jadwal Ruangan'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 0.5 }}>
                    • <strong>Tempat / Media Pelaksanaan:</strong>{' '}
                    <strong>{applicant?.psikotesLocation || 'Portal Karir Online PT ITSP'}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 0.5 }}>
                    • <strong>Token Sesi:</strong> Dibagikan oleh Tim HR sesaat sebelum tes dimulai di ruangan.
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#DC2626', fontWeight: 600 }}>
                    • <strong>Anti-Cheat Proctoring:</strong> Dilarang berpindah tab browser atau beralih ke aplikasi lain (AI/LLM). Pelanggaran 2 kali akan mengunci ujian secara otomatis!
                  </Typography>
                </Box>

                {/* Exam State */}
                {psikotesSub?.submittedAt ? (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Ujian Psikotes telah berhasil disubmit pada {new Date(psikotesSub.submittedAt).toLocaleString('id-ID')}. Hasil evaluasi sedang diverifikasi oleh Tim HR.
                    {psikotesSub.showScore && psikotesSub.score !== null && (
                      <Typography variant="body2" sx={{ fontWeight: 700, mt: 1 }}>
                        Skor Hasil Ujian: {psikotesSub.score} / 100
                      </Typography>
                    )}
                  </Alert>
                ) : psikotesSub?.isLocked ? (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    Sesi Ujian Terkunci karena pelanggaran batas perpindahan tab/jendela. Silakan melapor ke Tim HR untuk permintaan Reset Sesi bila terjadi kendala teknis.
                  </Alert>
                ) : currentStageNum === 2 ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayIcon />}
                      onClick={() => handleOpenExamModal('psikotes')}
                      sx={{
                        bgcolor: '#018730',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        px: 4,
                        py: 1.4,
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#005c21' },
                      }}
                    >
                      Mulai Ujian Psikotes Online
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Tahapan ini belum aktif atau sudah Anda selesaikan.
                  </Alert>
                )}
              </Box>
            )}

            {/* STAGE 3: USER TEST */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="body1" sx={{ color: '#334155', mb: 3, lineHeight: 1.65 }}>
                  Tes Teknis Departemen menguji pemahaman spesifik Anda terkait bidang kerja, proses plastic injection moulding, standar mutu otomotif (IATF 16949), dan pemeliharaan mold.
                </Typography>

                <Box sx={{ p: 2.5, bgcolor: '#FFFBEB', borderRadius: 2, border: '1px solid #FDE68A', mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400E', mb: 1 }}>
                    Ketentuan & Jadwal Pelaksanaan Ujian Teknis Kejuruan:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#78350F', mb: 0.5 }}>
                    • <strong>Jadwal Ujian:</strong>{' '}
                    {applicant?.userTestScheduledAt
                      ? new Date(applicant.userTestScheduledAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })
                      : 'Sesuai Jadwal di Dashboard'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#78350F', mb: 0.5 }}>
                    • <strong>Tempat / Media Pelaksanaan:</strong>{' '}
                    <strong>{applicant?.userTestLocation || 'Portal Karir Online PT ITSP'}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#78350F', mb: 0.5 }}>
                    • <strong>Token Sesi Ujian:</strong> Memerlukan Token Ujian User yang dibagikan oleh penilai/tim departemen terkait.
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#DC2626', fontWeight: 600 }}>
                    • <strong>Peringatan Proctoring:</strong> Dilarang berpindah tab browser atau menggunakan tools bantuan otomatis saat pengerjaan soal teknis.
                  </Typography>
                </Box>

                {userTestSub?.submittedAt ? (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Lembar Tes Teknis User telah berhasil dikirimkan. Penilai departemen sedang mengevaluasi lembar jawaban Anda.
                  </Alert>
                ) : userTestSub?.isLocked ? (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    Ujian terkunci karena sensor keamanan sistem mendeteksi aktivitas di luar halaman ujian.
                  </Alert>
                ) : currentStageNum === 3 ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayIcon />}
                      onClick={() => handleOpenExamModal('user_test')}
                      sx={{
                        bgcolor: '#fc4509',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        px: 4,
                        py: 1.4,
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#e03a03' },
                      }}
                    >
                      Mulai Tes Teknis Departemen
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Tahapan tes teknis belum aktif atau telah Anda selesaikan.
                  </Alert>
                )}
              </Box>
            )}

            {/* STAGE 4: INTERVIEW HR */}
            {activeStep === 3 && (
              <Box>
                <Typography variant="body1" sx={{ color: '#334155', mb: 3, lineHeight: 1.65 }}>
                  Wawancara bersama Tim Human Capital Management untuk menggali motivasi, kepribadian, integritas, dan kesiapan Anda bergabung di lingkungan manufaktur otomotif.
                </Typography>

                {hrInterview ? (
                  <Card sx={{ bgcolor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: 2.5, p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#018730', mb: 1.5 }}>
                      JADWAL INTERVIEW HR ANDA
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                          Waktu Pelaksanaan:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {new Date(hrInterview.scheduledAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                          Mode Pelaksanaan:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {hrInterview.locationMode === 'online' ? 'Online Video Meeting' : 'Onsite di Pabrik PT ITSP'}
                        </Typography>
                      </Box>
                    </Box>

                    {hrInterview.locationMode === 'online' ? (
                      <Box sx={{ p: 2.5, bgcolor: '#EFF6FF', borderRadius: 2, border: '1px solid #BFDBFE' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E40AF', mb: 1 }}>
                          Tautan Ruang Video Conference:
                        </Typography>
                        <Button
                          variant="contained"
                          href={hrInterview.meetingLink || '#'}
                          target="_blank"
                          startIcon={<VideoIcon />}
                          sx={{ bgcolor: '#2563EB', color: '#FFFFFF', fontWeight: 700, mb: 1 }}
                        >
                          Masuk ke Ruang Interview ({hrInterview.meetingPlatform?.toUpperCase() || 'TEAMS'})
                        </Button>
                        {hrInterview.meetingPasscode && (
                          <Typography variant="body2" sx={{ color: '#1E3A8A' }}>
                            Passcode / PIN Meeting: <code>{hrInterview.meetingPasscode}</code>
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ p: 2.5, bgcolor: '#FEF3C7', borderRadius: 2, border: '1px solid #FCD34D' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400E', mb: 1 }}>
                          Panduan Kedatangan Onsite ke Pabrik:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#78350F', mb: 0.5 }}>
                          • Alamat: {hrInterview.locationAddress || data?.plantConfig?.karawang}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#78350F', mb: 0.5 }}>
                          • Ruangan: {hrInterview.roomName || 'Ruang Meeting HCM Lt. 2'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#78350F' }}>
                          • Ketentuan: Lapor pos security dengan membawa KTP asli, kemeja putih formal, dan sepatu tertutup.
                        </Typography>
                      </Box>
                    )}
                  </Card>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Jadwal interview HR Anda sedang diatur oleh tim rekrutmen. Notifikasi resmi akan dikirimkan ke email Anda segera.
                  </Alert>
                )}
              </Box>
            )}

            {/* STAGE 5: INTERVIEW USER */}
            {activeStep === 4 && (
              <Box>
                <Typography variant="body1" sx={{ color: '#334155', mb: 3, lineHeight: 1.65 }}>
                  Wawancara teknis mendalam bersama Pimpinan Departemen & User Supervisor terkait.
                </Typography>

                {userInterview ? (
                  <Card sx={{ bgcolor: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: 2.5, p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fc4509', mb: 1.5 }}>
                      JADWAL INTERVIEW USER DEPARTEMEN
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Pewawancara: <strong>{userInterview.interviewerName || 'Kepala Departemen Terkait'}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Jadwal: <strong>{new Date(userInterview.scheduledAt).toLocaleString('id-ID')}</strong>
                    </Typography>
                    {userInterview.locationMode === 'online' ? (
                      <Button
                        variant="contained"
                        href={userInterview.meetingLink || '#'}
                        target="_blank"
                        startIcon={<VideoIcon />}
                        sx={{ bgcolor: '#018730', fontWeight: 700 }}
                      >
                        Buka Video Meeting User
                      </Button>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#475569' }}>
                        Lokasi Onsite: {userInterview.locationAddress || 'Pabrik PT ITSP'} ({userInterview.roomName})
                      </Typography>
                    )}
                  </Card>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Jadwal wawancara dengan Kepala Departemen sedang disinkronkan.
                  </Alert>
                )}
              </Box>
            )}

            {/* STAGE 6: MEDICAL CHECK-UP (MCU) */}
            {activeStep === 5 && (
              <Box>
                <Typography variant="body1" sx={{ color: '#334155', mb: 3, lineHeight: 1.65 }}>
                  Selamat! Anda telah lolos tahapan wawancara teknis dan berhak mengikuti <strong>Pemeriksaan Kesehatan Medis (MCU)</strong> di fasilitas kesehatan rekanan resmi PT ITSP.
                </Typography>

                {/* Surat Rujukan MCU Rekanan */}
                <Card sx={{ bgcolor: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 2.5, p: 3, mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#166534', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <McuIcon /> SURAT PENGANTAR RUJUKAN MCU RESMI
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700, display: 'block' }}>
                        KLINIK / RUMAH SAKIT REKANAN RESMI:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                        {data?.mcuConfig?.partnerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                        Alamat Rujukan:{' '}
                        {data?.mcuConfig?.mapsUrl ? (
                          <a href={data.mcuConfig.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#018730', fontWeight: 700 }}>
                            {data?.mcuConfig?.partnerAddress}
                          </a>
                        ) : (
                          data?.mcuConfig?.partnerAddress
                        )}
                      </Typography>
                      {data?.mcuConfig?.mapsUrl && (
                        <Button
                          variant="contained"
                          size="small"
                          href={data.mcuConfig.mapsUrl}
                          target="_blank"
                          startIcon={<LocationIcon />}
                          sx={{ mt: 1, bgcolor: '#018730', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#005c21' } }}
                        >
                          Buka Rute Google Maps Klinik &rarr;
                        </Button>
                      )}
                    </Box>

                    <Box>
                      <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700, display: 'block' }}>
                        ESTIMASI KISARAN BIAYA PEMERIKSAAN:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#018730', mb: 1 }}>
                        {data?.mcuConfig?.estimatedCost}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                        *Sesuai paket standar uji kelayakan kerja (Fit to Work) PT ITSP.
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2.5 }} />

                  {data?.mcuConfig?.embedUrl && (
                    <Box sx={{ mb: 2.5, borderRadius: 2, overflow: 'hidden', border: '1px solid #BBF7D0' }}>
                      <iframe
                        title="Peta Lokasi MCU"
                        src={data.mcuConfig.embedUrl}
                        width="100%"
                        height="280"
                        style={{ border: 0, display: 'block' }}
                        loading="lazy"
                      />
                    </Box>
                  )}

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#166534', mb: 0.8 }}>
                    Petunjuk Wajib Sebelum Pemeriksaan:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                    {data?.mcuConfig?.instructions}
                  </Typography>
                </Card>

                {/* Important Notice: Zero File Upload */}
                <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }}>
                  <strong>Informasi Penting Transparansi:</strong> Anda <em>tidak perlu mengunggah file bukti atau hasil apa pun</em>. Hasil pemeriksaan resmi dari klinik rekanan akan dikirimkan langsung dan rahasia ke Tim HR PT ITSP. Pembaruan status lolos MCU Anda akan tampil secara otomatis di halaman ini.
                </Alert>

                {applicant?.mcuNotes && (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    Status MCU: {applicant.mcuNotes}
                  </Alert>
                )}
              </Box>
            )}

            {/* STAGE 7: OFFERING LETTER */}
            {activeStep === 6 && (
              <Box>
                {applicant?.offeringStatus === 'accepted' ? (
                  <Card sx={{ bgcolor: '#ECFDF5', border: '2px solid #34D399', borderRadius: 2.5, p: 4, textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 56, color: '#10B981', mb: 1.5 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#065F46', mb: 1 }}>
                      Selamat! Penawaran Kerja Resmi Telah Disetujui
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#047857', maxWidth: 600, mx: 'auto', mb: 3 }}>
                      Selamat datang di keluarga besar PT Indonesia Thai Summit Plastech. Data kepegawaian Anda telah diproses ke sistem internal Human Capital.
                    </Typography>

                    <Box sx={{ bgcolor: '#FFFFFF', p: 2.5, borderRadius: 2, maxWidth: 450, mx: 'auto', textAlign: 'left', border: '1px solid #A7F3D0', mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#065F46', mb: 1 }}>
                        Identitas Karyawan Baru:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        • NIK Sementara: <strong>{applicant?.karyawanData?.nikSementara || 'TEMP-2026-001'}</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        • Posisi / Departemen: {applicant?.jobPosting?.title} ({applicant?.jobPosting?.department})
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        • Lokasi Pabrik: {applicant?.jobPosting?.location}
                      </Typography>
                    </Box>

                    <Alert severity="info" sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto', borderRadius: 2 }}>
                      Mohon hadir ke pabrik PT ITSP pada jadwal yang ditentukan untuk penandatanganan Kontrak Kerja Fisik (PKWT) dan pengambilan seragam & Kartu Tanda Pengenal (ID Card).
                    </Alert>
                  </Card>
                ) : applicant?.offeringStatus === 'issued' ? (
                  <Card sx={{ bgcolor: '#FFFBEB', border: '2px solid #FCD34D', borderRadius: 2.5, p: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#92400E', mb: 1.5 }}>
                      Surat Penawaran Resmi (Offering Letter) Telah Terbit!
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#78350F', mb: 3 }}>
                      Selamat! Anda telah lolos seluruh tahapan seleksi teknis dan uji kelayakan medis di PT ITSP. Berikut adalah rincian penawaran kerja resmi dari manajemen:
                    </Typography>

                    <Box sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #FDE68A', mb: 4 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400E', mb: 1 }}>
                        Paket Kompensasi & Penawaran:
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#018730', fontWeight: 800, mb: 1.5 }}>
                        {applicant?.offeringSalary || 'Gaji Pokok & Tunjangan Standar Manufaktur Otomotif'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.7 }}>
                        {applicant?.offeringLetter}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        size="large"
                        disabled={acceptingOffer}
                        onClick={handleAcceptOffer}
                        startIcon={acceptingOffer ? <CircularProgress size={20} color="inherit" /> : <OfferIcon />}
                        sx={{
                          bgcolor: '#018730',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: 16,
                          px: 5,
                          py: 1.5,
                          borderRadius: 2.5,
                          boxShadow: '0 8px 24px rgba(1, 135, 48, 0.3)',
                          '&:hover': { bgcolor: '#005c21' },
                        }}
                      >
                        {acceptingOffer ? 'Memproses Persetujuan...' : 'Setujui Penawaran Kerja (Accept Offer)'}
                      </Button>
                    </Box>
                  </Card>
                ) : (
                  <Card sx={{ bgcolor: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 2.5, p: 4, textAlign: 'center' }}>
                    <ClockIcon sx={{ fontSize: 50, color: '#94A3B8', mb: 1.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#334155', mb: 1 }}>
                      Tahap Offering: Menunggu Penerbitan Surat Resmi dari HR
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 540, mx: 'auto', lineHeight: 1.6 }}>
                      Selamat! Anda telah menyelesaikan seluruh rangkaian seleksi teknis dan medis. Saat ini berkas Anda sedang dalam proses finalisasi kompensasi oleh tim manajemen Human Capital PT ITSP. Surat penawaran resmi akan segera tampil di sini.
                    </Typography>
                  </Card>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* EXAM TOKEN MODAL DIALOG */}
      <Dialog open={tokenModalOpen} onClose={() => setTokenModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#018730', pb: 1 }}>
          Akses Ujian {tokenTestType === 'psikotes' ? 'Psikotes' : 'Teknis'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Masukkan <strong>Password / Token Sesi Ujian</strong> yang dibagikan oleh Tim HR / Pengawas di ruangan:
          </Typography>

          {tokenError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
              {tokenError}
            </Alert>
          )}

          <TextField
            autoFocus
            fullWidth
            placeholder="Contoh: PSIKO2026 / ITSP2026"
            value={examTokenInput}
            onChange={(e) => setExamTokenInput(e.target.value.toUpperCase())}
            slotProps={{
              htmlInput: {
                style: { letterSpacing: '0.15em', fontWeight: 800, textAlign: 'center', fontSize: 18 }
              }
            }}
          />
          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 1, textAlign: 'center' }}>
            Token Demo: <code>ITSP2026</code> atau <code>PSIKO2026</code>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setTokenModalOpen(false)} sx={{ color: '#64748B' }}>
            Batal
          </Button>
          <Button
            variant="contained"
            disabled={verifyingToken || !examTokenInput.trim()}
            onClick={handleVerifyToken}
            sx={{ bgcolor: '#018730', fontWeight: 700, '&:hover': { bgcolor: '#005c21' } }}
          >
            {verifyingToken ? <CircularProgress size={20} color="inherit" /> : 'Buka Lembar Ujian &rarr;'}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
}
