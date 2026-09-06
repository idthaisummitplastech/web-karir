'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  RestartAlt as ResetIcon,
  Videocam as InterviewIcon,
  Score as ScoreIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  LockReset as ResetPassIcon,
  Psychology as PsychologyIcon,
  PrecisionManufacturing as EngineeringIcon,
  CheckCircleOutlined as CheckIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  AssignmentTurnedIn as VerifiedIcon,
} from '@mui/icons-material';
import { RECRUITMENT_STAGES } from '@/lib/constants';

export default function AdminApplicantsPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Admin Session & Role
  const [adminSession, setAdminSession] = useState<{
    role: string;
    name: string;
    email: string;
    department: string | null;
    isAdmin: boolean;
  } | null>(null);

  // Questions Map (cache for reviewing personality profiling traits & technical essay answers)
  const [questionsMap, setQuestionsMap] = useState<Record<number, any>>({});

  // Modals state
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [advanceAction, setAdvanceAction] = useState<'approve' | 'reject'>('approve');
  const [advanceNotes, setAdvanceNotes] = useState('');
  const [advanceSchedule, setAdvanceSchedule] = useState('');
  const [advanceToken, setAdvanceToken] = useState('');
  const [advanceSalary, setAdvanceSalary] = useState('');

  // Interview Schedule Modal
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [interviewType, setInterviewType] = useState<'hr' | 'user'>('hr');
  const [locationMode, setLocationMode] = useState<'online' | 'onsite'>('online');
  const [meetingPlatform, setMeetingPlatform] = useState('teams');
  const [meetingLink, setMeetingLink] = useState('https://teams.microsoft.com/meet/itsp-interview');
  const [meetingPasscode, setMeetingPasscode] = useState('ITSP123');
  const [interviewDate, setInterviewDate] = useState('');

  // Score Modal
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [scoreTestType, setScoreTestType] = useState<'psikotes' | 'user_test'>('psikotes');
  const [scoreInput, setScoreInput] = useState<number | ''>('');
  const [showScoreToCandidate, setShowScoreToCandidate] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Reset Password Modal
  const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
  const [newApplicantPassInput, setNewApplicantPassInput] = useState('');
  const [resetApplicantFeedback, setResetApplicantFeedback] = useState<string | null>(null);

  // Load Session & Questions Map on Mount
  useEffect(() => {
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) setAdminSession(data);
      })
      .catch((err) => console.error('Session fetch error:', err));

    fetch('/api/admin/questions')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.questions) {
          const map: Record<number, any> = {};
          data.questions.forEach((q: any) => {
            map[q.id] = q;
          });
          setQuestionsMap(map);
        }
      })
      .catch((err) => console.error('Questions fetch error:', err));
  }, []);

  const fetchApplicants = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (stageFilter) params.append('stage', stageFilter);
    if (statusFilter) params.append('status', statusFilter);
    if (search) params.append('search', search);

    fetch(`/api/admin/applicants?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.applicants) setApplicants(data.applicants);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplicants();
  }, [stageFilter, statusFilter]);

  // Permission Logic per Role & Departemen:
  // - HR: Berwenang di Tahap 1 (Screening), 2 (Psikotes), 4 (Interview HR), 6 (MCU), 7 (Offering) untuk seluruh pelamar
  // - User Dept: HANYA berwenang di Tahap 3 (Tes Teknis) & 5 (Interview User) DAN pelamar harus melamar pada departemennya sendiri!
  // - Super Admin: Memiliki akses pengawasan dan kelolosan penuh di semua tahap & departemen
  const canManageApplicant = (applicant: any) => {
    if (!adminSession) return true;
    if (adminSession.role === 'admin') return true;

    const stageNum = applicant.currentStage;
    if (adminSession.role === 'hr') {
      return [1, 2, 4, 6, 7].includes(stageNum);
    }

    if (adminSession.role === 'user_dept') {
      if (![3, 5].includes(stageNum)) return false;

      // Wajib sesuai departemen yang dilamar
      const userDept = (adminSession.department || '').trim().toLowerCase();
      const jobDept = (applicant.jobPosting?.department || '').trim().toLowerCase();
      if (!userDept) return true;
      return jobDept.includes(userDept) || userDept.includes(jobDept);
    }

    return false;
  };

  const getStageOwnerInfo = (applicant: any) => {
    const stageNum = applicant.currentStage;
    const jobDept = applicant.jobPosting?.department || 'User Dept';

    if ([1, 2, 4, 6, 7].includes(stageNum)) {
      return { owner: 'hr', label: 'Wewenang HR Recruitment', color: '#0369A1', bg: '#E0F2FE' };
    }
    return { owner: 'user_dept', label: `Wewenang User Dept (${jobDept})`, color: '#B45309', bg: '#FEF3C7' };
  };

  // Generate Personalized Official Default Approval Message
  const generateDefaultAdvanceMessage = (applicant: any, nextStage: number) => {
    const name = applicant.fullName;
    const pos = applicant.jobPosting?.title || 'Posisi Terkait';
    const dept = applicant.jobPosting?.department || 'PT ITSP';

    switch (nextStage) {
      case 2:
        return `Selamat kepada Sdr/i ${name}, berkas lamaran Anda untuk posisi ${pos} telah ditinjau dan dinyatakan LOLOS Screening Dokumen. Anda berhak melanjutkan ke Tahap 2: Ujian Psikotes Online & Profiling Karakteristik Diri. Silakan login ke portal karir untuk memulai ujian sesuai instruksi dan token yang disediakan.`;
      case 3:
        return `Selamat kepada Sdr/i ${name}, Anda dinyatakan LOLOS Ujian Psikotes Online untuk posisi ${pos}. Berkas dan hasil evaluasi psikotes Anda telah dialihkan ke Tim User Departemen ${dept} untuk pelaksanaan Tahap 3: Tes Teknis Kejuruan & Uraian Studi Kasus.`;
      case 4:
        return `Selamat kepada Sdr/i ${name}, hasil evaluasi Tes Teknis Kejuruan & Uraian Studi Kasus Anda untuk posisi ${pos} telah diperiksa dan dinyatakan LOLOS oleh User Departemen ${dept}. Anda berhak melanjutkan ke Tahap 4: Interview HR Recruitment bersama tim Human Capital PT ITSP.`;
      case 5:
        return `Selamat kepada Sdr/i ${name}, Anda dinyatakan LOLOS sesi Interview HR Recruitment untuk posisi ${pos}. Tahapan seleksi berikutnya adalah Tahap 5: Interview Teknis User Departemen bersama jajaran supervisor/manager departemen ${dept}.`;
      case 6:
        return `Selamat kepada Sdr/i ${name}, Anda dinyatakan LOLOS sesi Interview User Departemen ${dept} untuk posisi ${pos}. Anda berhak melanjutkan ke Tahap 6: Medical Check-Up (MCU) di fasilitas kesehatan/rumah sakit rekanan resmi PT Indonesia Thai Summit Plastech.`;
      case 7:
        return `Selamat kepada Sdr/i ${name}, hasil Medical Check-Up (MCU) Anda dinyatakan FIT TO WORK (Memenuhi Syarat Kesehatan Kerja). PT Indonesia Thai Summit Plastech dengan bangga menerbitkan Surat Penawaran Kerja Resmi (Offering Letter) untuk posisi ${pos}. Silakan telaah rincian paket gaji dan konfirmasi persetujuan di portal karir.`;
      case 8:
        return `Selamat kepada Sdr/i ${name}, Anda telah resmi menandatangani kontrak kerja PT Indonesia Thai Summit Plastech. Data Anda telah disinkronkan ke sistem Karyawan Sementara untuk persiapan ID Card Karyawan dan program Onboarding.`;
      default:
        return `Selamat kepada Sdr/i ${name}, Anda dinyatakan lolos ke tahapan seleksi berikutnya untuk posisi ${pos} di PT Indonesia Thai Summit Plastech.`;
    }
  };

  // Generate Personalized Official Default Rejection Message
  const generateDefaultRejectMessage = (applicant: any, currentStage: number) => {
    const name = applicant.fullName;
    const pos = applicant.jobPosting?.title || 'Posisi Terkait';
    const stageObj = RECRUITMENT_STAGES.find((s) => s.number === currentStage);
    const stageName = stageObj ? stageObj.name : `Tahap ${currentStage}`;

    return `Terima kasih kepada Sdr/i ${name} atas partisipasi dan antusiasme Anda dalam mengikuti proses seleksi penerimaan karyawan untuk posisi ${pos} di PT Indonesia Thai Summit Plastech. Setelah melalui proses evaluasi komprehensif pada ${stageName}, saat ini kami belum dapat melanjutkan proses seleksi Anda ke tahapan berikutnya karena kualifikasi yang belum sesuai dengan kebutuhan spesifik posisi saat ini. Kami sangat mengapresiasi waktu serta dedikasi yang telah Anda berikan, dan mendoakan kesuksesan terbaik dalam perjalanan karir profesional Anda.`;
  };

  // Helper to extract applicant's personality profiling traits (Multi-Choice questions with up to 2 answers)
  const getProfilingReview = (applicant: any) => {
    if (!applicant) return [];
    const psikoSub = applicant.testSubmissions?.find((s: any) => s.testType === 'psikotes');
    if (!psikoSub?.answers) return [];
    try {
      const answersObj = JSON.parse(psikoSub.answers);
      const results: any[] = [];
      Object.keys(answersObj).forEach((qIdStr) => {
        const qId = Number(qIdStr);
        const q = questionsMap[qId];
        if (q && q.questionType === 'multi_choice') {
          let opts: string[] = [];
          try {
            opts = JSON.parse(q.options);
          } catch {}
          const userChoices: string[] = Array.isArray(answersObj[qId])
            ? answersObj[qId]
            : [answersObj[qId]];
          const selectedTraits = userChoices.map((key) => {
            const charCode = key.charCodeAt(0) - 65;
            return opts[charCode] ? `${key}. ${opts[charCode]}` : key;
          });
          results.push({
            questionText: q.question,
            selectedTraits,
          });
        }
      });
      return results;
    } catch {
      return [];
    }
  };

  // Helper to extract applicant's technical essay answers
  const getEssayReview = (applicant: any) => {
    if (!applicant) return [];
    const userSub = applicant.testSubmissions?.find((s: any) => s.testType === 'user_test');
    if (!userSub?.answers) return [];
    try {
      const answersObj = JSON.parse(userSub.answers);
      const results: any[] = [];
      Object.keys(answersObj).forEach((qIdStr) => {
        const qId = Number(qIdStr);
        const q = questionsMap[qId];
        if (q && q.questionType === 'essay') {
          results.push({
            questionText: q.question,
            essayText: typeof answersObj[qId] === 'string' ? answersObj[qId] : '',
          });
        }
      });
      return results;
    } catch {
      return [];
    }
  };

  // Handle Advance Stage (1-Click Approve / Reject)
  const handleConfirmAdvance = async () => {
    if (!selectedApplicant) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/admin/advance-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: selectedApplicant.id,
          action: advanceAction,
          notes: advanceNotes,
          scheduledAt: advanceSchedule || undefined,
          token: advanceToken || undefined,
          salaryOffer: advanceSalary || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedbackMessage(data.message);
      setAdvanceModalOpen(false);
      fetchApplicants();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Handle Reset Test Session (Bug Recovery)
  const handleResetTest = async (applicantId: number, testType: 'psikotes' | 'user_test') => {
    if (!confirm(`Reset sesi ujian ${testType.toUpperCase()} untuk pelamar ini agar dapat melanjutkan ujian?`)) return;

    try {
      const res = await fetch('/api/admin/reset-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId, testType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      fetchApplicants();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Schedule Interview
  const handleConfirmInterview = async () => {
    if (!selectedApplicant || !interviewDate) {
      alert('Mohon pilih tanggal dan jam pelaksanaan interview.');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/admin/schedule-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: selectedApplicant.id,
          interviewType,
          scheduledAt: interviewDate,
          locationMode,
          meetingPlatform,
          meetingLink: locationMode === 'online' ? meetingLink : undefined,
          meetingPasscode: locationMode === 'online' ? meetingPasscode : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      setInterviewModalOpen(false);
      fetchApplicants();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Handle Save Score
  const handleSaveScore = async () => {
    if (!selectedApplicant) return;

    try {
      const res = await fetch('/api/admin/update-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: selectedApplicant.id,
          testType: scoreTestType,
          score: scoreInput !== '' ? Number(scoreInput) : undefined,
          showScore: showScoreToCandidate,
          isPassed: scoreInput !== '' ? Number(scoreInput) >= 70 : true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert('Nilai evaluasi berhasil disimpan!');
      setScoreModalOpen(false);
      fetchApplicants();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Reset Applicant Password
  const handleConfirmResetApplicantPass = async () => {
    if (!selectedApplicant) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'applicant',
          targetId: selectedApplicant.id,
          newPassword: newApplicantPassInput || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResetApplicantFeedback(data.message);
      fetchApplicants();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const currentProfilingReview = getProfilingReview(selectedApplicant);
  const currentEssayReview = getEssayReview(selectedApplicant);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Manajemen Pelamar & Alur 7 Tahap Seleksi
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Evaluasi berkas CV, tinjau hasil psikotes & essay teknis, dan lakukan 1-Klik Kelolosan dengan pesan resmi otomatis.
          </Typography>
        </Box>
      </Box>

      {/* ROLE-AWARE WORKFLOW BANNER */}
      {adminSession && (
        <Card
          sx={{
            mb: 3,
            borderRadius: 2.5,
            border: '1.5px solid',
            borderColor:
              adminSession.role === 'admin'
                ? '#C7D2FE'
                : adminSession.role === 'hr'
                ? '#BAE6FD'
                : '#FDE68A',
            bgcolor:
              adminSession.role === 'admin'
                ? '#EEF2FF'
                : adminSession.role === 'hr'
                ? '#F0F9FF'
                : '#FFFBEB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  bgcolor:
                    adminSession.role === 'admin'
                      ? '#4338CA'
                      : adminSession.role === 'hr'
                      ? '#0284C7'
                      : '#D97706',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {adminSession.role === 'admin' ? (
                  <AdminIcon />
                ) : adminSession.role === 'hr' ? (
                  <PersonIcon />
                ) : (
                  <EngineeringIcon />
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 800,
                      color:
                        adminSession.role === 'admin'
                          ? '#312E81'
                          : adminSession.role === 'hr'
                          ? '#075985'
                          : '#92400E',
                    }}
                  >
                    {adminSession.role === 'admin'
                      ? '👑 Mode Pengawasan: Super Administrator'
                      : adminSession.role === 'hr'
                      ? '👤 Mode Kerja: Tim HR Recruitment'
                      : `🔧 Mode Kerja: User Departemen (${adminSession.department || 'Teknis'})`}
                  </Typography>
                  <Chip
                    size="small"
                    label={`Login: ${adminSession.name}`}
                    sx={{
                      fontWeight: 700,
                      fontSize: 11,
                      bgcolor: '#FFFFFF',
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color:
                      adminSession.role === 'admin'
                        ? '#4338CA'
                        : adminSession.role === 'hr'
                        ? '#0369A1'
                        : '#78350F',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {adminSession.role === 'admin' ? (
                    'Anda memiliki wewenang penuh pengawasan di seluruh 7 tahapan seleksi, kelola akun staf internal, reset MFA, dan penerbitan offering letter.'
                  ) : adminSession.role === 'hr' ? (
                    <span>
                      <strong>Wewenang HR:</strong> Screening Berkas (Tahap 1), Review Psikotes & Profiling Karakteristik Diri (Tahap 2), Interview HR (Tahap 4), Rujukan MCU (Tahap 6), dan Offering Letter & Kontrak (Tahap 7). Tahap Tes Teknis Kejuruan & Interview User dievaluasi dan diloloskan oleh User Departemen.
                    </span>
                  ) : (
                    <span>
                      <strong>Wewenang User Departemen:</strong> Anda berwenang mereview hasil Tes Teknis Kejuruan & Jawaban Essay (Tahap 3) dan Interview User (Tahap 5). Hanya User Departemen yang berhak meloloskan peserta pada tahapan teknis tersebut. Tahap lainnya dikelola oleh Tim HR.
                    </span>
                  )}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {feedbackMessage && (
        <Alert severity="success" onClose={() => setFeedbackMessage(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {feedbackMessage}
        </Alert>
      )}

      {resetApplicantFeedback && (
        <Alert severity="success" onClose={() => setResetApplicantFeedback(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {resetApplicantFeedback}
        </Alert>
      )}

      {/* Filter Bar */}
      <Card sx={{ borderRadius: 2.5, mb: 3, border: '1px solid #CBD5E1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, alignItems: 'center' }}>
            <Box sx={{ flex: '2 1 340px' }}>
              <TextField
                fullWidth
                size="small"
                label="Pencarian Pelamar"
                placeholder="Ketik nama lengkap, email, jurusan, atau sekolah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchApplicants()}
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon sx={{ color: '#94A3B8', mr: 1, fontSize: 20 }} />,
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 240px' }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter Tahap Seleksi"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <MenuItem value="">Semua Tahapan (1 s/d 7)</MenuItem>
                {RECRUITMENT_STAGES.map((s) => (
                  <MenuItem key={s.number} value={s.number.toString()}>
                    Tahap {s.number}: {s.shortName}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ flex: '1 1 220px' }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status Kelolosan"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Semua Status</MenuItem>
                <MenuItem value="in_progress">Sedang Berjalan</MenuItem>
                <MenuItem value="passed">Lolos Tahap Ini</MenuItem>
                <MenuItem value="failed">Tidak Lolos</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={fetchApplicants}
                sx={{ bgcolor: '#018730', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#005c21' } }}
              >
                Terapkan
              </Button>
              {(search || stageFilter || statusFilter) && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearch('');
                    setStageFilter('');
                    setStatusFilter('');
                    setTimeout(fetchApplicants, 50);
                  }}
                  sx={{ borderColor: '#CBD5E1', color: '#64748B' }}
                >
                  Reset
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Applicants Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#018730' }} />
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Kandidat & Posisi</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Pendidikan</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Tahap Saat Ini</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Status & Evaluasi Ujian</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#334155', minWidth: 200 }}>
                  Aksi Kelolosan & Wewenang
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applicants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748B' }}>
                    Tidak ada pelamar yang sesuai dengan kriteria filter.
                  </TableCell>
                </TableRow>
              ) : (
                applicants.map((a) => {
                  const stage = RECRUITMENT_STAGES.find((s) => s.number === a.currentStage);
                  const isFailed = a.stageStatus === 'failed';
                  const psikotesSub = a.testSubmissions?.find((s: any) => s.testType === 'psikotes');
                  const userTestSub = a.testSubmissions?.find((s: any) => s.testType === 'user_test');

                  const canManage = canManageApplicant(a);
                  const stageOwner = getStageOwnerInfo(a);

                  return (
                    <TableRow key={a.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          {a.fullName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                          {a.jobPosting?.title} • {a.jobPosting?.department}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#018730', fontWeight: 600 }}>
                          CV: {(a.cvFileSize / 1024).toFixed(1)} KB (PDF)
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                          {a.lastEducation} {a.major}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {a.schoolName} (Usia: {a.age} thn)
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={`Tahap ${a.currentStage}: ${stage?.shortName}`}
                          size="small"
                          sx={{
                            bgcolor: isFailed ? '#FEE2E2' : '#DCFCE7',
                            color: isFailed ? '#991B1B' : '#166534',
                            fontWeight: 700,
                            mb: 0.5,
                          }}
                        />
                        <Typography variant="caption" sx={{ display: 'block', color: stageOwner.color, fontWeight: 700, fontSize: 11 }}>
                          {stageOwner.label}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" sx={{ display: 'block', color: '#475569' }}>
                          Status: <strong>{a.stageStatus.toUpperCase()}</strong>
                        </Typography>
                        {psikotesSub && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 600 }}>
                              Psiko: Skor {psikotesSub.score ?? 0}/100 ({psikotesSub.submittedAt ? 'Submitted' : 'Aktif'})
                              {psikotesSub.isLocked && ' (TERKUNCI)'}
                            </Typography>
                            {psikotesSub.isLocked && (
                              <Tooltip title="Reset sesi ujian psikotes yang terkunci">
                                <IconButton
                                  size="small"
                                  onClick={() => handleResetTest(a.id, 'psikotes')}
                                  sx={{ color: '#EF4444', p: 0.2 }}
                                >
                                  <ResetIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                        {userTestSub && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 600 }}>
                              Teknis: Skor {userTestSub.score ?? 0}/100 ({userTestSub.submittedAt ? 'Submitted' : 'Aktif'})
                              {userTestSub.isLocked && ' (TERKUNCI)'}
                            </Typography>
                            {userTestSub.isLocked && (
                              <Tooltip title="Reset sesi ujian teknis yang terkunci">
                                <IconButton
                                  size="small"
                                  onClick={() => handleResetTest(a.id, 'user_test')}
                                  sx={{ color: '#EF4444', p: 0.2 }}
                                >
                                  <ResetIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                          {/* View Detail & CV */}
                          <Tooltip title="Lihat Profil 13 Kolom, Berkas CV & Evaluasi Ujian">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedApplicant(a);
                                setDetailModalOpen(true);
                              }}
                              sx={{ color: '#3B82F6' }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>

                          {/* 1-Click Approve to next stage */}
                          {!isFailed && a.currentStage < 7 && (
                            canManage ? (
                              <Tooltip title={`1-Klik Loloskan ke Tahap ${a.currentStage + 1} (Notifikasi Otomatis)`}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<ApproveIcon />}
                                  onClick={() => {
                                    setSelectedApplicant(a);
                                    setAdvanceAction('approve');
                                    setAdvanceNotes(generateDefaultAdvanceMessage(a, a.currentStage + 1));
                                    setAdvanceToken(a.currentStage === 1 ? 'PSIKO2026' : a.currentStage === 2 ? 'USER2026' : 'ITSP2026');
                                    setAdvanceModalOpen(true);
                                  }}
                                  sx={{
                                    bgcolor: '#018730',
                                    fontWeight: 700,
                                    fontSize: 12,
                                    whiteSpace: 'nowrap',
                                    '&:hover': { bgcolor: '#005c21' },
                                  }}
                                >
                                  Loloskan
                                </Button>
                              </Tooltip>
                            ) : (
                              <Tooltip title={`Kelolosan tahap ini dikelola oleh ${stageOwner.owner === 'hr' ? 'Tim HR Recruitment' : 'User Departemen'}`}>
                                <Chip
                                  size="small"
                                  label={stageOwner.owner === 'hr' ? 'Wewenang HR' : 'Wewenang User Dept'}
                                  sx={{
                                    bgcolor: stageOwner.bg,
                                    color: stageOwner.color,
                                    fontWeight: 700,
                                    fontSize: 11,
                                    border: `1px solid ${stageOwner.color}40`,
                                  }}
                                />
                              </Tooltip>
                            )
                          )}

                          {/* Schedule Interview: Tahap 4 (HR Interview) & Tahap 5 (User Interview) */}
                          {a.currentStage === 4 && canManage && (
                            <Tooltip title="Jadwalkan Interview HR (Teams / Onsite)">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedApplicant(a);
                                  setInterviewType('hr');
                                  setInterviewModalOpen(true);
                                }}
                                sx={{ color: '#0284C7' }}
                              >
                                <InterviewIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {a.currentStage === 5 && canManage && (
                            <Tooltip title="Jadwalkan Interview User Departemen (Teams / Onsite)">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedApplicant(a);
                                  setInterviewType('user');
                                  setInterviewModalOpen(true);
                                }}
                                sx={{ color: '#D97706' }}
                              >
                                <InterviewIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Score Input (Optional Manual Override) */}
                          {(a.currentStage === 2 || a.currentStage === 3) && canManage && (
                            <Tooltip title="Input Nilai Tes Manual (Opsional)">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedApplicant(a);
                                  setScoreTestType(a.currentStage === 2 ? 'psikotes' : 'user_test');
                                  setScoreInput('');
                                  setShowScoreToCandidate(false);
                                  setScoreModalOpen(true);
                                }}
                                sx={{ color: '#F59E0B' }}
                              >
                                <ScoreIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Reject (Only if canManage) */}
                          {!isFailed && canManage && (
                            <Tooltip title="Gugurkan Pelamar pada Tahap Ini">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedApplicant(a);
                                  setAdvanceAction('reject');
                                  setAdvanceNotes(generateDefaultRejectMessage(a, a.currentStage));
                                  setAdvanceModalOpen(true);
                                }}
                                sx={{ color: '#EF4444' }}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Reset Password Pelamar (Admin Only or Super Admin) */}
                          {adminSession?.isAdmin && (
                            <Tooltip title="Reset Password Akun Pelamar">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedApplicant(a);
                                  setNewApplicantPassInput('');
                                  setResetApplicantFeedback(null);
                                  setResetPassModalOpen(true);
                                }}
                                sx={{ color: '#0F172A' }}
                              >
                                <ResetPassIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* 1. DETAIL APPLICANT MODAL (13 FIELDS + CV + TEST REVIEWS) */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#018730' }}>
          Profil Lengkap 13 Kolom & Riwayat Evaluasi: {selectedApplicant?.fullName}
        </DialogTitle>
        <DialogContent dividers>
          {selectedApplicant && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 13 Kolom Data Pribadi & Lamaran */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>1. Posisi Dilamar:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {selectedApplicant.jobPosting?.title} ({selectedApplicant.jobPosting?.department})
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>2. Nama Lengkap:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedApplicant.fullName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>3. Email:</Typography>
                  <Typography variant="body2">{selectedApplicant.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>4. No. WhatsApp / HP:</Typography>
                  <Typography variant="body2">{selectedApplicant.phone}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>5. Tanggal Lahir & Usia:</Typography>
                  <Typography variant="body2">
                    {new Date(selectedApplicant.birthDate).toLocaleDateString('id-ID')} ({selectedApplicant.age} Tahun)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>6. Pendidikan Terakhir:</Typography>
                  <Typography variant="body2">{selectedApplicant.lastEducation}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>7. Nama Sekolah / Universitas:</Typography>
                  <Typography variant="body2">{selectedApplicant.schoolName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>8. Jurusan:</Typography>
                  <Typography variant="body2">{selectedApplicant.major}</Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>9. Pengalaman Kerja:</Typography>
                  <Typography variant="body2">{selectedApplicant.experience}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>10. Kemampuan Bahasa Inggris:</Typography>
                  <Typography variant="body2">{selectedApplicant.englishSkill}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>11. Bahasa Asing Lainnya:</Typography>
                  <Typography variant="body2">{selectedApplicant.otherLanguages || '-'}</Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>12. Berkas CV PDF (Maks 100 KB):</Typography>
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={`Ukuran: ${(selectedApplicant.cvFileSize / 1024).toFixed(1)} KB (Valid <= 100 KB)`}
                      color="success"
                      size="small"
                    />
                    {selectedApplicant.cvFile && (
                      <Button
                        variant="outlined"
                        size="small"
                        href={selectedApplicant.cvFile}
                        download={`CV_${selectedApplicant.fullName.replace(/\s+/g, '_')}.pdf`}
                      >
                        Unduh Berkas CV PDF
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Panel Evaluasi Psikotes & Profiling Diri (Wewenang HR) */}
              {currentProfilingReview.length > 0 && (
                <Box sx={{ p: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <PsychologyIcon sx={{ color: '#166534' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
                      Hasil Profiling Karakteristik Diri Pelamar (Review HR)
                    </Typography>
                  </Box>
                  {currentProfilingReview.map((item: any, idx: number) => (
                    <Box key={idx} sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1px solid #DCFCE7' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 0.8 }}>
                        {item.questionText}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {item.selectedTraits.map((trait: string, tIdx: number) => (
                          <Chip
                            key={tIdx}
                            icon={<CheckIcon sx={{ fontSize: '15px !important', color: '#15803D !important' }} />}
                            label={trait}
                            size="small"
                            sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 700, border: '1px solid #A7F3D0' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Panel Evaluasi Soal Uraian / Studi Kasus Teknis (Wewenang User Dept) */}
              {currentEssayReview.length > 0 && (
                <Box sx={{ p: 2, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <EngineeringIcon sx={{ color: '#92400E' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E' }}>
                      Hasil Jawaban Uraian / Studi Kasus Teknis (Review User Departemen)
                    </Typography>
                  </Box>
                  {currentEssayReview.map((item: any, idx: number) => (
                    <Box key={idx} sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1px solid #FDE68A' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#78350F', display: 'block', mb: 0.8 }}>
                        📝 {item.questionText}
                      </Typography>
                      <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1, border: '1px solid #E2E8F0', whiteSpace: 'pre-wrap' }}>
                        <Typography variant="body2" sx={{ color: '#1E293B', fontSize: 13, lineHeight: 1.6 }}>
                          {item.essayText || '(Pelamar belum mengisi uraian jawaban)'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>

      {/* 2. ADVANCE STAGE MODAL (1-CLICK APPROVAL WITH AUTO-PERSONALIZED MESSAGE & TEST REVIEWS) */}
      <Dialog open={advanceModalOpen} onClose={() => setAdvanceModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: advanceAction === 'approve' ? '#018730' : '#DC2626' }}>
          {advanceAction === 'approve'
            ? `1-Klik Loloskan ke Tahap ${selectedApplicant?.currentStage + 1}: ${
                RECRUITMENT_STAGES.find((s) => s.number === selectedApplicant?.currentStage + 1)?.shortName || ''
              }`
            : `Gugurkan Pelamar pada Tahap ${selectedApplicant?.currentStage}: ${
                RECRUITMENT_STAGES.find((s) => s.number === selectedApplicant?.currentStage)?.shortName || ''
              }`}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: '#334155', mb: 2 }}>
            Kandidat: <strong>{selectedApplicant?.fullName}</strong> — Posisi: <strong>{selectedApplicant?.jobPosting?.title}</strong> ({selectedApplicant?.jobPosting?.department})
          </Typography>

          {/* REVIEW PANELS SEBELUM APPROVE */}
          {advanceAction === 'approve' && (
            <>
              {/* TAHAP 2: REVIEW PSIKOTES & PROFILING KARAKTER DIRI (HR REVIEW) */}
              {selectedApplicant?.currentStage === 2 && (
                <Box sx={{ mb: 2.5, p: 2, bgcolor: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PsychologyIcon fontSize="small" /> Evaluasi Psikotes & Karakteristik Diri (HR Review)
                    </Typography>
                    <Chip
                      size="small"
                      label={`Skor Objektif: ${selectedApplicant?.testSubmissions?.find((s: any) => s.testType === 'psikotes')?.score ?? 0}/100`}
                      sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 800 }}
                    />
                  </Box>

                  {currentProfilingReview.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {currentProfilingReview.map((item: any, idx: number) => (
                        <Box key={idx} sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1px solid #DCFCE7' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
                            {item.questionText}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 0.5 }}>
                            {item.selectedTraits.map((trait: string, tIdx: number) => (
                              <Chip
                                key={tIdx}
                                icon={<CheckIcon sx={{ fontSize: '14px !important', color: '#15803D !important' }} />}
                                label={trait}
                                size="small"
                                sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 700, fontSize: 12, border: '1px solid #A7F3D0' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#64748B', fontStyle: 'italic', display: 'block' }}>
                      Peserta tidak memiliki data profiling karakteristik diri tambahan.
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#15803D', fontSize: 11.5 }}>
                    ✓ Bagian HR berhak mengevaluasi kesesuaian profil karakteristik di atas sebelum meloloskan ke Tes Teknis User.
                  </Typography>
                </Box>
              )}

              {/* TAHAP 3: REVIEW TES TEKNIS & ESSAY USER (USER DEPT REVIEW) */}
              {selectedApplicant?.currentStage === 3 && (
                <Box sx={{ mb: 2.5, p: 2, bgcolor: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EngineeringIcon fontSize="small" /> Evaluasi Kompetensi Teknis & Uraian Kasus (User Dept Review)
                    </Typography>
                    <Chip
                      size="small"
                      label={`Skor Pilihan Ganda: ${selectedApplicant?.testSubmissions?.find((s: any) => s.testType === 'user_test')?.score ?? 0}/100`}
                      sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 800 }}
                    />
                  </Box>

                  {currentEssayReview.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {currentEssayReview.map((item: any, idx: number) => (
                        <Box key={idx} sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1px solid #FDE68A' }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#78350F', display: 'block', mb: 0.8 }}>
                            📝 {item.questionText}
                          </Typography>
                          <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1, border: '1px solid #E2E8F0', whiteSpace: 'pre-wrap' }}>
                            <Typography variant="body2" sx={{ color: '#1E293B', fontSize: 13, lineHeight: 1.6 }}>
                              {item.essayText || '(Pelamar belum mengisi uraian jawaban)'}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#64748B', fontStyle: 'italic', display: 'block' }}>
                      Tidak ada uraian essay tambahan pada paket tes departemen ini.
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#B45309', fontSize: 11.5 }}>
                    ✓ User Departemen berhak memvalidasi analisa teknis pelamar di atas sebelum meloloskan ke Interview HR/User.
                  </Typography>
                </Box>
              )}
            </>
          )}

          <Alert severity={advanceAction === 'approve' ? 'info' : 'warning'} sx={{ mb: 2, borderRadius: 2 }}>
            Sistem secara otomatis akan memperbarui status pelamar dan <strong>mengirimkan notifikasi email resmi korporat</strong> kepada kandidat.
          </Alert>

          {advanceAction === 'approve' && selectedApplicant?.currentStage === 1 && (
            <TextField
              fullWidth
              label="Token Ujian Psikotes (Batch Token Ruangan)"
              value={advanceToken}
              onChange={(e) => setAdvanceToken(e.target.value.toUpperCase())}
              helperText="Default: PSIKO2026 atau ITSP2026"
              sx={{ mb: 2 }}
            />
          )}

          {advanceAction === 'approve' && selectedApplicant?.currentStage === 2 && (
            <TextField
              fullWidth
              label="Token Ujian Tes Teknis User (Batch Token Departemen)"
              value={advanceToken}
              onChange={(e) => setAdvanceToken(e.target.value.toUpperCase())}
              helperText="Default: USER2026 atau ENG2026"
              sx={{ mb: 2 }}
            />
          )}

          {advanceAction === 'approve' && selectedApplicant?.currentStage === 6 && (
            <TextField
              fullWidth
              label="Besaran Gaji Pokok & Tunjangan Offering"
              placeholder="Contoh: Rp 5.800.000 + Tunjangan Manufaktur Shift"
              value={advanceSalary}
              onChange={(e) => setAdvanceSalary(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label={advanceAction === 'approve' ? 'Pesan Resmi Notifikasi Kelolosan (Otomatis & Personalisasi)' : 'Alasan Penolakan Resmi'}
            value={advanceNotes}
            onChange={(e) => setAdvanceNotes(e.target.value)}
            helperText="Pesan default di atas telah dipersonalisasi dengan nama kandidat dan dapat Anda modifikasi bila diperlukan."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAdvanceModalOpen(false)}>Batal</Button>
          <Button
            variant="contained"
            disabled={processing}
            onClick={handleConfirmAdvance}
            sx={{
              bgcolor: advanceAction === 'approve' ? '#018730' : '#DC2626',
              fontWeight: 700,
              px: 3,
              '&:hover': { bgcolor: advanceAction === 'approve' ? '#005c21' : '#B91C1C' },
            }}
          >
            {processing ? 'Memproses...' : advanceAction === 'approve' ? 'Konfirmasi Loloskan & Kirim Notifikasi' : 'Konfirmasi Penolakan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3. INTERVIEW SCHEDULING MODAL */}
      <Dialog open={interviewModalOpen} onClose={() => setInterviewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#018730' }}>
          Jadwalkan Interview {interviewType === 'hr' ? 'HR Recruitment' : 'User Departemen'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Kandidat: <strong>{selectedApplicant?.fullName}</strong> ({selectedApplicant?.jobPosting?.title})
          </Typography>

          <TextField
            fullWidth
            required
            type="datetime-local"
            label="Jadwal Waktu Interview"
            slotProps={{ inputLabel: { shrink: true } }}
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            select
            fullWidth
            label="Mode Pelaksanaan"
            value={locationMode}
            onChange={(e) => setLocationMode(e.target.value as any)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="online">Online Video Meeting (MS Teams / Zoom)</MenuItem>
            <MenuItem value="onsite">Onsite di Pabrik PT ITSP (KIIC Karawang / GIIC Cikarang)</MenuItem>
          </TextField>

          {locationMode === 'online' ? (
            <>
              <TextField
                select
                fullWidth
                label="Platform Video Conference"
                value={meetingPlatform}
                onChange={(e) => setMeetingPlatform(e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="teams">Microsoft Teams</MenuItem>
                <MenuItem value="zoom">Zoom Meeting</MenuItem>
                <MenuItem value="google_meet">Google Meet</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Tautan Link Meeting"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Passcode / PIN Meeting (Opsional)"
                value={meetingPasscode}
                onChange={(e) => setMeetingPasscode(e.target.value)}
              />
            </>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Alamat default pabrik ({selectedApplicant?.jobPosting?.location || 'Plant 1 Karawang'}) akan otomatis dimuat ke dalam kartu kandidat & email resmi.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setInterviewModalOpen(false)}>Batal</Button>
          <Button
            variant="contained"
            disabled={processing || !interviewDate}
            onClick={handleConfirmInterview}
            sx={{ bgcolor: '#018730', fontWeight: 700 }}
          >
            Kirim Undangan Interview
          </Button>
        </DialogActions>
      </Dialog>

      {/* 4. OPTIONAL SCORE INPUT MODAL */}
      <Dialog open={scoreModalOpen} onClose={() => setScoreModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Input Nilai Hasil Tes (Opsional)</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Sesuai kebijakan privasi rekrutmen, nilai angka <strong>tidak ditampilkan ke kandidat</strong> secara default untuk mencegah salah tafsir jika nilai kecil namun tetap diloloskan oleh evaluator.
          </Typography>

          <TextField
            fullWidth
            type="number"
            label="Skor Tes (0 - 100)"
            placeholder="Misal: 75"
            value={scoreInput}
            onChange={(e) => setScoreInput(e.target.value ? Number(e.target.value) : '')}
            sx={{ mb: 2 }}
          />

          <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showScoreToCandidate}
                onChange={(e) => setShowScoreToCandidate(e.target.checked)}
              />
              <span>Tampilkan nilai angka ke dashboard kandidat (Default: Tidak)</span>
            </label>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setScoreModalOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSaveScore} sx={{ bgcolor: '#018730' }}>
            Simpan Nilai
          </Button>
        </DialogActions>
      </Dialog>

      {/* 5. RESET PASSWORD PELAMAR DIALOG (ADMIN ONLY) */}
      <Dialog open={resetPassModalOpen} onClose={() => setResetPassModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Reset Password Akun Pelamar</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Kandidat: <strong>{selectedApplicant?.fullName}</strong> ({selectedApplicant?.email})
          </Typography>

          <TextField
            fullWidth
            label="Password Baru Pelamar (Kosongkan untuk default tahun)"
            placeholder={`Misal: Itsp@${new Date().getFullYear()} atau tentukan sendiri`}
            value={newApplicantPassInput}
            onChange={(e) => setNewApplicantPassInput(e.target.value)}
            helperText={`Jika dikosongkan, otomatis menggunakan password standar: Itsp@${new Date().getFullYear()}`}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setResetPassModalOpen(false)}>Batal</Button>
          <Button
            variant="contained"
            disabled={processing}
            onClick={() => {
              handleConfirmResetApplicantPass();
              setResetPassModalOpen(false);
            }}
            sx={{ bgcolor: '#018730', fontWeight: 700 }}
          >
            {processing ? 'Memproses...' : 'Simpan & Terapkan Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
