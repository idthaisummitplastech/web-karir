'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Checkbox,
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
  Download as DownloadIcon,
  CloudUpload as UploadIcon,
  PictureAsPdf as PdfIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
  Create as DrawIcon,
} from '@mui/icons-material';
import { RECRUITMENT_STAGES, getPlantMapsUrl } from '@/lib/constants';
import { generateOfferingLetterHtml, openOfferingLetterWindow } from '@/lib/offering-letter';
import { useSmartSync } from '@/lib/use-smart-sync';

// Interactive Digital Signature Canvas for Candidates
const CandidateSignatureCanvas: React.FC<{
  value: string;
  onChange: (val: string) => void;
}> = ({ value, onChange }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (value) {
      const img = new (window as any).Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [value]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    const mouseEvt = e as React.MouseEvent<HTMLCanvasElement>;
    return {
      x: (mouseEvt.clientX - rect.left) * scaleX,
      y: (mouseEvt.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0F172A';

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL('image/png'));
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <Box sx={{ border: '2px dashed #018730', borderRadius: 2.5, p: 2, bgcolor: '#FFFFFF', mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          ✍️ Area Kanvas Tanda Tangan (Gores dengan Mouse, Touchpad, atau Jari Anda):
        </Typography>
        <Button
          size="small"
          color="error"
          onClick={handleClear}
          sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none' }}
        >
          Hapus / Ulangi
        </Button>
      </Box>
      <canvas
        ref={canvasRef}
        width={560}
        height={140}
        style={{
          width: '100%',
          height: '140px',
          touchAction: 'none',
          background: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          cursor: 'crosshair',
          display: 'block',
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.8, textAlign: 'center' }}>
        *Gores tanda tangan di dalam kotak abu-abu di atas. Tanda tangan ini akan otomatis tertera pada Surat Penawaran Resmi Anda.
      </Typography>
    </Box>
  );
};

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
  const [signedContractFile, setSignedContractFile] = useState<{ name: string; size: number; base64: string } | null>(null);
  const [signingMethod, setSigningMethod] = useState<'digital' | 'upload'>('digital');
  const [digitalSignMode, setDigitalSignMode] = useState<'draw' | 'upload_img'>('draw');
  const [candidateSignatureData, setCandidateSignatureData] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);

  const dataRef = useRef<any>(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const fetchStatus = useCallback((silent: boolean = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    return fetch(`/api/applicant/status?_t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 404) {
          if (!silent) {
            // Sesi pelamar berakhir atau akun pelamar tidak ditemukan di sistem
            await fetch('/api/auth/logout?type=applicant', { method: 'POST' }).catch(() => {});
            router.push('/login');
          }
          return null;
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Gagal memuat status seleksi pelamar.');
        }
        return res.json();
      })
      .then((resData) => {
        if (!resData || !resData.applicant) {
          if (!silent) setError(resData?.error || 'Data pelamar tidak ditemukan.');
          return;
        }

        if (silent) {
          // Smart Diff Check untuk mencegah re-render & penumpukan RAM
          const prevApp = dataRef.current?.applicant;
          const nextApp = resData.applicant;
          const hasChanged =
            !prevApp ||
            prevApp.currentStage !== nextApp.currentStage ||
            prevApp.current_stage !== nextApp.current_stage ||
            prevApp.stageStatus !== nextApp.stageStatus ||
            prevApp.stage_status !== nextApp.stage_status ||
            prevApp.status !== nextApp.status ||
            prevApp.contractSignedAt !== nextApp.contractSignedAt ||
            prevApp.contract_signed_at !== nextApp.contract_signed_at ||
            prevApp.signedContractFile !== nextApp.signedContractFile ||
            prevApp.signed_contract_file !== nextApp.signed_contract_file ||
            prevApp.offeringSalary !== nextApp.offeringSalary ||
            prevApp.offering_salary !== nextApp.offering_salary ||
            prevApp.offeringJoinDate !== nextApp.offeringJoinDate ||
            prevApp.offering_join_date !== nextApp.offering_join_date ||
            prevApp.updatedAt !== nextApp.updatedAt ||
            prevApp.updated_at !== nextApp.updated_at ||
            JSON.stringify(prevApp.testSubmissions) !== JSON.stringify(nextApp.testSubmissions) ||
            JSON.stringify(prevApp.interviews) !== JSON.stringify(nextApp.interviews) ||
            JSON.stringify(prevApp.offeringClauses) !== JSON.stringify(nextApp.offeringClauses);

          if (hasChanged) {
            setData(resData);
            const stage = nextApp.currentStage || nextApp.current_stage || 1;
            setActiveStep((prev) => Math.max(prev, Math.min(6, stage - 1)));
          }
        } else {
          setData(resData);
          const stage = resData.applicant.currentStage || resData.applicant.current_stage || 1;
          setActiveStep(Math.min(6, stage - 1));
        }
      })
      .catch((err) => {
        if (!silent) setError(err.message || 'Gagal memuat data status pelamar.');
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    fetchStatus(false);
  }, [fetchStatus]);

  // Hook Auto-Refresh adaptif (10s aktif / 60s idle, zero-leak)
  const { isTabActive } = useSmartSync(() => fetchStatus(true), {
    activeIntervalMs: 10000,
    idleIntervalMs: 60000,
    enabled: true,
    isPaused: tokenModalOpen || acceptingOffer || Boolean(candidateSignatureData),
  });

  const handleLogout = async () => {
    await fetch('/api/auth/logout?type=applicant', { method: 'POST' });
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
      const testSlug = tokenTestType === 'user_test' ? 'user-test' : tokenTestType;
      router.push(`/portal/test/${testSlug}`);
    } catch (err: any) {
      setTokenError(err.message);
    } finally {
      setVerifyingToken(false);
    }
  };

  // Handle Accept Offering Letter
  const handleAcceptOffer = async () => {
    const signaturePayload =
      signingMethod === 'digital'
        ? candidateSignatureData
        : signedContractFile?.base64;

    if (!signaturePayload) {
      alert(
        signingMethod === 'digital'
          ? 'Mohon goreskan tanda tangan digital Anda pada area kanvas sebelum menyetujui penawaran.'
          : 'Mohon unggah berkas PDF yang telah ditandatangani sebelum menyetujui penawaran.'
      );
      return;
    }

    if (!agreeTerms) {
      alert('Mohon centang pernyataan persetujuan klausul penawaran kerja terlebih dahulu.');
      return;
    }

    setAcceptingOffer(true);
    try {
      const res = await fetch('/api/applicant/accept-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signed_contract_file: signaturePayload,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || resData.message || 'Gagal menyetujui penawaran.');
      fetchStatus();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAcceptingOffer(false);
    }
  };

  // Handle Open/Print Offering Document
  const handleOpenOfferingDocument = (autoPrint: boolean = false, previewWithSignature: boolean = false) => {
    const customPdf = applicant?.offeringAttachment || applicant?.offering_attachment;
    if (customPdf && !previewWithSignature) {
      const w = window.open('');
      if (w) {
        w.document.write(`<iframe src="${customPdf}" style="width:100%;height:100%;border:none;"></iframe>`);
      }
      return;
    }

    const currentSig =
      previewWithSignature && candidateSignatureData
        ? candidateSignatureData
        : applicant?.signedContractFile || applicant?.signed_contract_file;

    const isSigned = Boolean(applicant?.contractSignedAt || (previewWithSignature && candidateSignatureData));
    const signedDate = applicant?.contractSignedAt
      ? new Date(applicant.contractSignedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : isSigned
      ? new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : undefined;

    const html = generateOfferingLetterHtml({
      candidateName: applicant?.fullName || applicant?.full_name || 'Kandidat',
      candidateId: applicant?.id,
      position: applicant?.jobPosting?.title || 'Staff Operasional',
      department: applicant?.jobPosting?.department || 'Operasional',
      location: applicant?.jobPosting?.location || 'Plant PT ITSP Karawang',
      salary: applicant?.offeringSalary || applicant?.offering_salary || 'Sesuai Standar Kompensasi PT ITSP',
      joinDate: applicant?.offeringJoinDate || applicant?.offering_join_date,
      refNumber: applicant?.offeringRefNumber || applicant?.offering_ref_number,
      clauses: applicant?.offeringClauses || applicant?.offering_clauses,
      notes: applicant?.offeringLetter || applicant?.offering_letter,
      signerName: applicant?.offeringSignerName || applicant?.offering_signer_name,
      signerTitle: applicant?.offeringSignerTitle || applicant?.offering_signer_title,
      signerSignature: applicant?.offeringSignerSignature || applicant?.offering_signer_signature,
      candidateSignature: currentSig,
      signedAt: signedDate,
    });

    openOfferingLetterWindow(html, autoPrint);
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

  if (!loading && (!data || !applicant)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 12, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', width: '100%' }}>
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              {error || 'Sesi login pelamar telah berakhir atau akun belum terdaftar. Silakan login kembali.'}
            </Alert>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="outlined" onClick={fetchStatus} startIcon={<RefreshIcon />} sx={{ borderRadius: 2, fontWeight: 700 }}>
                Coba Lagi
              </Button>
              <Button variant="contained" onClick={handleLogout} sx={{ bgcolor: '#018730', '&:hover': { bgcolor: '#005c21' }, borderRadius: 2, fontWeight: 700 }}>
                Login Ulang
              </Button>
            </Box>
          </Card>
        </Container>
        <Footer />
      </Box>
    );
  }

  const currentStageNum = applicant?.currentStage || applicant?.current_stage || 1;
  const isFailed = (applicant?.stageStatus || applicant?.stage_status) === 'failed';

  const candidateName = applicant?.fullName || applicant?.full_name || 'Kandidat Pelamar';
  const jobTitle = applicant?.jobPosting?.title || applicant?.job_posting?.title || 'Posisi Terdaftar';
  const jobDept = applicant?.jobPosting?.department || applicant?.job_posting?.department || '';
  const candidateEmail = applicant?.email || '';

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
                {candidateName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#D1FAE5', mt: 0.5 }}>
                Posisi: <strong>{jobTitle}</strong>{jobDept ? ` (${jobDept})` : ''}{candidateEmail ? ` • ${candidateEmail}` : ''}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 0.8,
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: isTabActive ? '#4ADE80' : '#CBD5E1',
                    boxShadow: isTabActive ? '0 0 10px #4ADE80' : 'none',
                  }}
                />
                <Typography variant="caption" sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: 11.5 }}>
                  {isTabActive ? 'Sinkron Otomatis (Live)' : 'Siaga'}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                onClick={() => fetchStatus(false)}
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
                      Status Seleksi: Belum Memenuhi Qualifications pada Tahap {applicant?.failedAtStage}
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
                    • Pendidikan: {[applicant?.lastEducation || applicant?.last_education, applicant?.major].filter(Boolean).join(' ') || '-'}
                    {(applicant?.schoolName || applicant?.school_name) ? ` (${applicant?.schoolName || applicant?.school_name})` : ''}
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
                    Terms & Sistem Keamanan Ujian:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 0.5 }}>
                    • <strong>Waktu Mulai Ujian:</strong>{' '}
                    {applicant?.psikotesScheduledAt
                      ? new Date(applicant.psikotesScheduledAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) + ' WIB'
                      : 'Terbuka / Sesuai Jadwal Ruangan'}
                  </Typography>
                  {applicant?.psikotesScheduledAt && (
                    <Typography variant="body2" sx={{ color: '#64748B', mb: 0.5 }}>
                      • <strong>Batas Waktu Berakhir:</strong>{' '}
                      <span style={{ color: '#DC2626', fontWeight: 700 }}>
                        {new Date(new Date(applicant.psikotesScheduledAt).getTime() + (applicant.psikotesDurationMinutes || 60) * 60000).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB
                      </span>{' '}
                      (Durasi: {applicant.psikotesDurationMinutes || 60} Menit)
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 0.5 }}>
                    • <strong>Tempat / Media Pelaksanaan:</strong>{' '}
                    <strong>{applicant?.psikotesLocation || 'Portal Karir Online PT ITSP'}</strong>
                  </Typography>
                  {(() => {
                    const loc = applicant?.psikotesLocation || '';
                    const isOnline = !loc || loc.toLowerCase().includes('online') || loc.toLowerCase().includes('portal');
                    const mapsUrl = applicant?.psikotesMapsUrl || (!isOnline ? getPlantMapsUrl(loc) : '');
                    if (!mapsUrl) return null;
                    return (
                      <Box sx={{ mt: 1, mb: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<LocationIcon />}
                          className="notranslate"
                          translate="no"
                          sx={{
                            bgcolor: '#018730',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: 12,
                            textTransform: 'none',
                            borderRadius: 1.5,
                            boxShadow: '0 2px 8px rgba(1,135,48,0.25)',
                            '&:hover': { bgcolor: '#005c21' },
                          }}
                        >
                          🗺️ Buka Rute Lokasi Ujian di Google Maps &rarr;
                        </Button>
                      </Box>
                    );
                  })()}
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
                    Terms & Jadwal Pelaksanaan Ujian Teknis Kejuruan:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#78350F', mb: 0.5 }}>
                    • <strong>Waktu Mulai Ujian:</strong>{' '}
                    {applicant?.userTestScheduledAt
                      ? new Date(applicant.userTestScheduledAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) + ' WIB'
                      : 'Sesuai Jadwal di Dashboard'}
                  </Typography>
                  {applicant?.userTestScheduledAt && (
                    <Typography variant="body2" sx={{ color: '#78350F', mb: 0.5 }}>
                      • <strong>Batas Waktu Berakhir:</strong>{' '}
                      <span style={{ color: '#DC2626', fontWeight: 700 }}>
                        {new Date(new Date(applicant.userTestScheduledAt).getTime() + (applicant.userTestDurationMinutes || 60) * 60000).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB
                      </span>{' '}
                      (Durasi: {applicant.userTestDurationMinutes || 60} Menit)
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: '#78350F', mb: 0.5 }}>
                    • <strong>Tempat / Media Pelaksanaan:</strong>{' '}
                    <strong>{applicant?.userTestLocation || 'Portal Karir Online PT ITSP'}</strong>
                  </Typography>
                  {(() => {
                    const loc = applicant?.userTestLocation || '';
                    const isOnline = !loc || loc.toLowerCase().includes('online') || loc.toLowerCase().includes('portal');
                    const mapsUrl = applicant?.userTestMapsUrl || (!isOnline ? getPlantMapsUrl(loc) : '');
                    if (!mapsUrl) return null;
                    return (
                      <Box sx={{ mt: 1, mb: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<LocationIcon />}
                          className="notranslate"
                          translate="no"
                          sx={{
                            bgcolor: '#fc4509',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: 12,
                            textTransform: 'none',
                            borderRadius: 1.5,
                            boxShadow: '0 2px 8px rgba(252,69,9,0.25)',
                            '&:hover': { bgcolor: '#e03a03' },
                          }}
                        >
                          🗺️ Buka Rute Lokasi Ujian di Google Maps &rarr;
                        </Button>
                      </Box>
                    );
                  })()}
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
                          • Alamat: {hrInterview.locationAddress || data?.plantConfig?.karawang || 'Kawasan Industri KIIC, Karawang'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#78350F', mb: 0.5 }}>
                          • Ruangan: {hrInterview.roomName || 'Ruang Meeting HCM Lt. 2'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#78350F', mb: 1.5 }}>
                          • Terms: Lapor pos security dengan membawa KTP asli, kemeja putih formal, dan sepatu tertutup.
                        </Typography>
                        {(() => {
                          const mapsUrl = hrInterview.mapsUrl || getPlantMapsUrl(hrInterview.locationAddress || data?.plantConfig?.karawang);
                          return mapsUrl ? (
                            <Button
                              variant="contained"
                              size="medium"
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<LocationIcon />}
                              className="notranslate"
                              translate="no"
                              sx={{
                                bgcolor: '#018730',
                                color: '#FFFFFF',
                                fontWeight: 700,
                                textTransform: 'none',
                                borderRadius: 2,
                                boxShadow: '0 3px 10px rgba(1,135,48,0.25)',
                                '&:hover': { bgcolor: '#005c21' },
                              }}
                            >
                              🗺️ Buka Rute Lokasi Pabrik di Google Maps &rarr;
                            </Button>
                          ) : null;
                        })()}
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
                      <Box sx={{ p: 2.5, bgcolor: '#FEF3C7', borderRadius: 2, border: '1px solid #FCD34D' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400E', mb: 1 }}>
                          Panduan Kedatangan Onsite Interview User:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#78350F', mb: 0.5 }}>
                          • Alamat Pabrik: {userInterview.locationAddress || data?.plantConfig?.karawang || 'Pabrik PT ITSP'}
                        </Typography>
                        {userInterview.roomName && (
                          <Typography variant="body2" sx={{ color: '#78350F', mb: 0.5 }}>
                            • Ruangan: {userInterview.roomName}
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ color: '#78350F', mb: 1.5 }}>
                          • Terms: Lapor pos security dengan membawa KTP asli, berkas portofolio teknis, kemeja rapi formal, dan sepatu safety/tertutup.
                        </Typography>
                        {(() => {
                          const mapsUrl = userInterview.mapsUrl || getPlantMapsUrl(userInterview.locationAddress || data?.plantConfig?.karawang);
                          return mapsUrl ? (
                            <Button
                              variant="contained"
                              size="medium"
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<LocationIcon />}
                              className="notranslate"
                              translate="no"
                              sx={{
                                bgcolor: '#fc4509',
                                color: '#FFFFFF',
                                fontWeight: 700,
                                textTransform: 'none',
                                borderRadius: 2,
                                boxShadow: '0 3px 10px rgba(252,69,9,0.25)',
                                '&:hover': { bgcolor: '#e03a03' },
                              }}
                            >
                              🗺️ Buka Rute Lokasi Pabrik di Google Maps &rarr;
                            </Button>
                          ) : null;
                        })()}
                      </Box>
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

                    {/* DOWNLOAD ARSIP DOKUMEN OFFERING & KONTRAK */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DocIcon sx={{ color: '#018730' }} />}
                        onClick={() => handleOpenOfferingDocument(false)}
                        sx={{ fontWeight: 700, textTransform: 'none', color: '#065F46', borderColor: '#34D399', bgcolor: '#FFFFFF' }}
                      >
                        Lihat Surat Penawaran Resmi (Lengkap Bertanda Tangan)
                      </Button>
                      {Boolean(applicant?.signedContractFile || applicant?.signed_contract_file) && (() => {
                        const sigFile = applicant?.signedContractFile || applicant?.signed_contract_file;
                        const isPdf = sigFile?.startsWith('data:application/pdf') || sigFile?.endsWith('.pdf');
                        if (isPdf) {
                          return (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<PdfIcon />}
                              onClick={() => {
                                const w = window.open('');
                                w?.document.write(`<iframe src="${sigFile}" style="width:100%;height:100%;border:none;"></iframe>`);
                              }}
                              sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, fontWeight: 700, textTransform: 'none' }}
                            >
                              Lihat Berkas PDF Bertanda Tangan
                            </Button>
                          );
                        }
                        return null;
                      })()}
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

                    <Box sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #FDE68A', mb: 3 }}>
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

                    {/* LANGKAH 1: DOKUMEN OFFERING RESMI DARI PERUSAHAAN (SELALU TAMPIL) */}
                    <Card sx={{ p: 3, bgcolor: '#FFFFFF', border: '2px solid #86EFAC', borderRadius: 2.5, mb: 3, boxShadow: '0 4px 16px rgba(1, 135, 48, 0.08)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ p: 1.5, bgcolor: '#FEE2E2', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PdfIcon sx={{ color: '#DC2626', fontSize: 32 }} />
                          </Box>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Chip label="LANGKAH 1: UNDUH DOKUMEN RESMI" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: 11 }} />
                              <Chip label="Resmi PT ITSP" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: 11 }} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                              Surat Penawaran Kerja Resmi (Offering Letter PT ITSP)
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {applicant?.offeringAttachment || applicant?.offering_attachment 
                                ? 'Lampiran PDF resmi diterbitkan langsung oleh Tim Human Capital PT ITSP'
                                : 'Dokumen Surat Resmi ber-kop PT ITSP lengkap dengan rincian kompensasi & klausul kerja'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                          <Button
                            variant="outlined"
                            startIcon={<OpenInNewIcon />}
                            onClick={() => handleOpenOfferingDocument(false)}
                            sx={{ fontWeight: 700, textTransform: 'none', color: '#018730', borderColor: '#018730', px: 2, '&:hover': { borderColor: '#005c21', bgcolor: '#F0FDF4' } }}
                          >
                            Lihat Dokumen
                          </Button>
                          {applicant?.offeringAttachment || applicant?.offering_attachment ? (
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              component="a"
                              href={applicant?.offeringAttachment || applicant?.offering_attachment}
                              download={`Offering_Letter_PT_ITSP_${applicant?.fullName || 'Kandidat'}.pdf`}
                              sx={{ bgcolor: '#018730', fontWeight: 700, textTransform: 'none', px: 2.5, '&:hover': { bgcolor: '#005c21' } }}
                            >
                              Unduh Dokumen PDF
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              onClick={() => handleOpenOfferingDocument(true)}
                              sx={{ bgcolor: '#018730', fontWeight: 700, textTransform: 'none', px: 2.5, '&:hover': { bgcolor: '#005c21' } }}
                            >
                              Unduh / Cetak Dokumen PDF
                            </Button>
                          )}
                        </Box>
                      </Box>
                      <Alert severity="info" sx={{ bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', py: 0.8, px: 2, borderRadius: 1.5, '& .MuiAlert-icon': { color: '#018730' } }}>
                        <strong>Wajib diunduh:</strong> Silakan buka atau unduh dokumen penawaran di atas terlebih dahulu untuk mempelajari seluruh hak, rincian gaji, dan klausul hubungan kerja sebelum menandatangani berkas.
                      </Alert>
                    </Card>

                    {/* LANGKAH 2: METODE PENANDATANGANAN RESMI */}
                    <Box sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 2.5, border: '2px solid #86EFAC', mb: 3, boxShadow: '0 4px 16px rgba(1, 135, 48, 0.08)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="LANGKAH 2: PENANDATANGANAN RESMI" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, fontSize: 11 }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Pilih metode yang paling mudah & nyaman bagi Anda di bawah ini
                        </Typography>
                      </Box>

                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5 }}>
                        ✍️ Bubuhkan Tanda Tangan Persetujuan Penawaran Kerja:
                      </Typography>

                      {/* TAB PILIHAN METODE */}
                      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
                        <Button
                          variant={signingMethod === 'digital' ? 'contained' : 'outlined'}
                          onClick={() => setSigningMethod('digital')}
                          startIcon={<DrawIcon />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 800,
                            borderRadius: 2,
                            px: 2.5,
                            py: 1,
                            bgcolor: signingMethod === 'digital' ? '#018730' : 'transparent',
                            color: signingMethod === 'digital' ? '#FFFFFF' : '#018730',
                            borderColor: '#018730',
                            '&:hover': { bgcolor: signingMethod === 'digital' ? '#005c21' : '#F0FDF4' },
                          }}
                        >
                          Tanda Tangan Digital Langsung (Praktis & Instan)
                        </Button>
                        <Button
                          variant={signingMethod === 'upload' ? 'contained' : 'outlined'}
                          onClick={() => setSigningMethod('upload')}
                          startIcon={<UploadIcon />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: 2,
                            px: 2.5,
                            py: 1,
                            bgcolor: signingMethod === 'upload' ? '#018730' : 'transparent',
                            color: signingMethod === 'upload' ? '#FFFFFF' : '#018730',
                            borderColor: '#018730',
                            '&:hover': { bgcolor: signingMethod === 'upload' ? '#005c21' : '#F0FDF4' },
                          }}
                        >
                          Unggah Berkas PDF Bertanda Tangan (Metode Manual)
                        </Button>
                      </Box>

                      {/* METODE 1: TANDA TANGAN DIGITAL LANGSUNG */}
                      {signingMethod === 'digital' && (
                        <Box sx={{ p: 2.5, bgcolor: '#F0FDF4', borderRadius: 2, border: '1px solid #BBF7D0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
                              E-Signature Digital Calon Karyawan
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant={digitalSignMode === 'draw' ? 'contained' : 'outlined'}
                                onClick={() => setDigitalSignMode('draw')}
                                sx={{
                                  fontSize: 11,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  bgcolor: digitalSignMode === 'draw' ? '#018730' : 'transparent',
                                  color: digitalSignMode === 'draw' ? '#FFFFFF' : '#018730',
                                  borderColor: '#018730',
                                  '&:hover': { bgcolor: digitalSignMode === 'draw' ? '#005c21' : '#DCFCE7' },
                                }}
                              >
                                ✍️ Gores di Layar
                              </Button>
                              <Button
                                size="small"
                                variant={digitalSignMode === 'upload_img' ? 'contained' : 'outlined'}
                                onClick={() => setDigitalSignMode('upload_img')}
                                sx={{
                                  fontSize: 11,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  bgcolor: digitalSignMode === 'upload_img' ? '#018730' : 'transparent',
                                  color: digitalSignMode === 'upload_img' ? '#FFFFFF' : '#018730',
                                  borderColor: '#018730',
                                  '&:hover': { bgcolor: digitalSignMode === 'upload_img' ? '#005c21' : '#DCFCE7' },
                                }}
                              >
                                📤 Unggah Gambar TTD (PNG/JPG)
                              </Button>
                            </Box>
                          </Box>

                          {digitalSignMode === 'draw' ? (
                            <CandidateSignatureCanvas
                              value={candidateSignatureData}
                              onChange={(sig) => setCandidateSignatureData(sig)}
                            />
                          ) : (
                            <Box sx={{ p: 2.5, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', mb: 1.5, textAlign: 'center' }}>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                id="candidate-sig-upload"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 2 * 1024 * 1024) {
                                    alert('Ukuran gambar maksimal 2 MB.');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setCandidateSignatureData(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                              <label htmlFor="candidate-sig-upload">
                                <Button
                                  variant="outlined"
                                  component="span"
                                  startIcon={<UploadIcon />}
                                  sx={{ color: '#018730', borderColor: '#018730', fontWeight: 700, textTransform: 'none' }}
                                >
                                  Pilih Foto / Scan Tanda Tangan Anda
                                </Button>
                              </label>
                              <Typography variant="caption" sx={{ display: 'block', color: '#64748B', mt: 1 }}>
                                Format PNG/JPG transparan atau latar putih bersih (Maks. 2 MB).
                              </Typography>
                            </Box>
                          )}

                          {candidateSignatureData && (
                            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2, border: '1.5px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                  component="img"
                                  src={candidateSignatureData}
                                  alt="Tanda Tangan Anda"
                                  sx={{ height: 42, maxWidth: 140, objectFit: 'contain', border: '1px dashed #94A3B8', borderRadius: 1, p: 0.3 }}
                                />
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#065F46' }}>
                                    ✓ Tanda Tangan Anda Berhasil Direkam
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#047857' }}>
                                    Nama: {applicant?.fullName || applicant?.full_name} • Siap disahkan ke surat resmi
                                  </Typography>
                                </Box>
                              </Box>

                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleOpenOfferingDocument(false, true)}
                                  startIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
                                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5, color: '#018730', borderColor: '#018730' }}
                                >
                                  👁️ Pratinjau Surat Resmi Bertanda Tangan Lengkap
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  onClick={() => setCandidateSignatureData('')}
                                  sx={{ fontSize: 11.5, fontWeight: 700, textTransform: 'none' }}
                                >
                                  Hapus Tanda Tangan
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* METODE 2: UNGGAH BERKAS PDF BERTANDA TANGAN */}
                      {signingMethod === 'upload' && (
                        <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1.5px dashed #94A3B8' }}>
                          <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7, mb: 2 }}>
                            1. <strong>Unduh dokumen</strong> Offering Letter resmi pada <strong>Langkah 1</strong> di atas.<br />
                            2. Cetak dan bubuhkan tanda tangan fisik di atas meterai/kolom penerima penawaran, lalu scan kembali menjadi file PDF.<br />
                            3. <strong>Unggah berkas PDF</strong> bertanda tangan Anda melalui tombol di bawah ini.
                          </Typography>

                          {signedContractFile ? (
                            <Box sx={{ p: 2, bgcolor: '#ECFDF5', borderRadius: 2, border: '1.5px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ p: 1, bgcolor: '#DCFCE7', borderRadius: 1 }}>
                                  <PdfIcon sx={{ color: '#166534', fontSize: 26 }} />
                                </Box>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#065F46' }}>
                                    ✓ {signedContractFile.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#047857' }}>
                                    {(signedContractFile.size / 1024).toFixed(1)} KB • Dokumen PDF Bertanda Tangan Siap Dikirim
                                  </Typography>
                                </Box>
                              </Box>

                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    const w = window.open('');
                                    w?.document.write(`<iframe src="${signedContractFile.base64}" style="width:100%;height:100%;border:none;"></iframe>`);
                                  }}
                                  startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderColor: '#10B981', color: '#065F46' }}
                                >
                                  Pratinjau
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  variant="text"
                                  onClick={() => setSignedContractFile(null)}
                                  startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12 }}
                                >
                                  Ganti / Hapus
                                </Button>
                              </Box>
                            </Box>
                          ) : (
                            <Box>
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                id="signed-pdf-upload"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                                    alert('Berkas harus berupa file PDF.');
                                    return;
                                  }
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert('Ukuran file maksimal 5 MB.');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setSignedContractFile({
                                      name: file.name,
                                      size: file.size,
                                      base64: reader.result as string,
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                              <label htmlFor="signed-pdf-upload">
                                <Button
                                  variant="outlined"
                                  component="span"
                                  startIcon={<UploadIcon />}
                                  sx={{
                                    color: '#018730',
                                    borderColor: '#018730',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1.2,
                                    borderRadius: 2,
                                    bgcolor: '#FFFFFF',
                                    '&:hover': { bgcolor: '#F0FDF4', borderColor: '#005c21' },
                                  }}
                                >
                                  Pilih Berkas PDF yang Telah Ditandatangani
                                </Button>
                              </label>
                              <Typography variant="caption" sx={{ display: 'block', color: '#64748B', mt: 1 }}>
                                Format file wajib berupa <strong>PDF</strong> (Maks. 5 MB).
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* LANGKAH 3: PERSETUJUAN FINAL */}
                    <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: 2.5, border: '1px solid #CBD5E1', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Chip label="LANGKAH 3: KONFIRMASI & PERSETUJUAN" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: 11 }} />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2.5 }}>
                        <Checkbox
                          id="agree-terms-checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          sx={{ color: '#018730', '&.Mui-checked': { color: '#018730' }, p: 0.5 }}
                        />
                        <Typography
                          component="label"
                          htmlFor="agree-terms-checkbox"
                          variant="body2"
                          sx={{ color: '#334155', lineHeight: 1.6, cursor: 'pointer', userSelect: 'none' }}
                        >
                          Saya menyatakan telah membaca, memahami, dan menyetujui seluruh klausul kerja, penempatan kerja, serta rincian paket kompensasi yang tercantum pada Surat Penawaran Kerja Resmi (Offering Letter) PT Indonesia Thai Summit Plastech. Tanda tangan yang saya bubuhkan adalah sah dan mengikat secara hukum.
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="large"
                          disabled={
                            acceptingOffer ||
                            !agreeTerms ||
                            (signingMethod === 'digital' ? !candidateSignatureData : !signedContractFile)
                          }
                          onClick={handleAcceptOffer}
                          startIcon={acceptingOffer ? <CircularProgress size={20} color="inherit" /> : <OfferIcon />}
                          sx={{
                            bgcolor: '#018730',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: 16,
                            px: 5,
                            py: 1.5,
                            borderRadius: 2.5,
                            boxShadow: '0 8px 24px rgba(1, 135, 48, 0.3)',
                            '&:hover': { bgcolor: '#005c21' },
                            '&.Mui-disabled': { bgcolor: '#CBD5E1', color: '#64748B' },
                          }}
                        >
                          {acceptingOffer ? 'Memproses Persetujuan...' : '✓ Konfirmasi & Terima Penawaran Kerja Resmi'}
                        </Button>
                        <Typography variant="caption" sx={{ color: '#64748B', textAlign: 'center' }}>
                          {!agreeTerms
                            ? '*Centang persetujuan pernyataan di atas untuk mengaktifkan tombol'
                            : signingMethod === 'digital' && !candidateSignatureData
                            ? '*Bubuhkan tanda tangan digital Anda pada Langkah 2 terlebih dahulu'
                            : signingMethod === 'upload' && !signedContractFile
                            ? '*Unggah file PDF bertanda tangan pada Langkah 2 terlebih dahulu'
                            : 'Dokumen akan disahkan secara resmi dan NIK Sementara karyawan baru akan diterbitkan otomatis'}
                        </Typography>
                      </Box>
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
      <Dialog
        open={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        maxWidth="xs"
        fullWidth
        className="notranslate"
        translate="no"
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#018730', pb: 1 }} className="notranslate" translate="no">
          Akses Ujian {tokenTestType === 'psikotes' ? 'Psikotes' : 'Teknis'}
        </DialogTitle>
        <DialogContent className="notranslate" translate="no">
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Masukkan <strong>Password / Token Sesi Ujian</strong> yang dibagikan oleh Tim HR / Pengawas di ruangan:
          </Typography>

          {tokenError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }} className="notranslate" translate="no">
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
                className: 'notranslate',
                translate: 'no',
                style: { letterSpacing: '0.15em', fontWeight: 800, textAlign: 'center', fontSize: 18 }
              }
            }}
          />
          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 1, textAlign: 'center' }}>
            Token Demo: <code>ITSP2026</code> atau <code>PSIKO2026</code>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }} className="notranslate" translate="no">
          <Button
            key="btn-cancel-token"
            onClick={() => setTokenModalOpen(false)}
            sx={{ color: '#64748B' }}
            className="notranslate"
            translate="no"
          >
            Cancel
          </Button>
          <Button
            key="btn-verify-token"
            variant="contained"
            disabled={verifyingToken || !examTokenInput.trim()}
            onClick={handleVerifyToken}
            className="notranslate"
            translate="no"
            sx={{ bgcolor: '#018730', fontWeight: 700, '&:hover': { bgcolor: '#005c21' } }}
          >
            <span key={verifyingToken ? 'state-loading' : 'state-ready'} className="notranslate" translate="no">
              {verifyingToken ? <CircularProgress size={20} color="inherit" /> : 'Buka Lembar Ujian →'}
            </span>
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
}
