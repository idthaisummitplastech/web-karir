'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Checkbox,
  TextField,
} from '@mui/material';
import {
  Timer as TimerIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  GridView as GridIcon,
} from '@mui/icons-material';
import QuestionNavigator, { countAnswered } from '@/components/QuestionNavigator';

const EXAM_DURATION_SECONDS = 20 * 60; // 20 minutes

export default function PsikotesExamPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  // Anti-Cheat Proctoring States
  const [violationsCount, setViolationsCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isLockedByAntiCheat, setIsLockedByAntiCheat] = useState(false);

  // Confirmation Submit Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [examMeta, setExamMeta] = useState<{ pgCount: number; essayCount: number } | null>(null);

  // Fetch Questions (paket acak unik per peserta, essay selalu akhir)
  useEffect(() => {
    fetch('/api/test/questions?category=psikotes')
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.questions) {
          setQuestions(data.questions);
          if (typeof data.pgCount === 'number' || typeof data.essayCount === 'number') {
            setExamMeta({ pgCount: data.pgCount || 0, essayCount: data.essayCount || 0 });
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Suppress browser / Google translation during exam session
  useEffect(() => {
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.classList.add('notranslate');

    let meta = document.querySelector('meta[name="google"][content="notranslate"]');
    let createdMeta = false;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'google');
      meta.setAttribute('content', 'notranslate');
      document.head.appendChild(meta);
      createdMeta = true;
    }

    try {
      document.cookie = 'googtrans=/id/id; path=/;';
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select && select.value !== 'id') {
        select.value = 'id';
        select.dispatchEvent(new Event('change'));
      }
    } catch (e) {}

    return () => {
      document.documentElement.removeAttribute('translate');
      document.documentElement.classList.remove('notranslate');
      if (createdMeta && meta?.parentNode) {
        meta.parentNode.removeChild(meta);
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (loading || isExamCompleted || isLockedByAntiCheat) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(true); // Auto-submit on time up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isExamCompleted, isLockedByAntiCheat]);

  // Anti-Cheat Listeners (Visibility Change strictly for tab/window switching)
  const lastViolationTimeRef = useRef(0);
  const isReportingViolationRef = useRef(false);

  useEffect(() => {
    if (loading || isExamCompleted || isLockedByAntiCheat) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loading, isExamCompleted, isLockedByAntiCheat, violationsCount]);

  // Trigger Violation Strike
  const triggerViolation = async () => {
    if (isExamCompleted || isLockedByAntiCheat || isReportingViolationRef.current) return;

    const now = Date.now();
    // 5-second cooldown to guarantee single tab switch only ever registers 1 strike
    if (now - lastViolationTimeRef.current < 5000) return;
    lastViolationTimeRef.current = now;
    isReportingViolationRef.current = true;

    try {
      const res = await fetch('/api/test/violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'psikotes' }),
      });

      const data = await res.json();
      const currentCount = data.violationsCount ?? (violationsCount + 1);
      setViolationsCount(currentCount);

      if (data.isLocked || currentCount >= 2) {
        // Strike 2: Lock exam & auto submit
        setIsLockedByAntiCheat(true);
        setShowWarningModal(false);
        handleSubmitExam(true);
      } else {
        // Strike 1: strictly show warning modal & DO NOT submit
        setShowWarningModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      isReportingViolationRef.current = false;
    }
  };

  // Submit Exam
  const handleSubmitExam = async (isForced = false) => {
    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'psikotes',
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsExamCompleted(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
        <CircularProgress sx={{ color: '#018730' }} />
      </Box>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = countAnswered(questions, answers);
  const pgTotal = examMeta?.pgCount ?? questions.filter((q: any) => (q.questionType || 'single_choice') !== 'essay').length;
  const essayTotal = examMeta?.essayCount ?? questions.filter((q: any) => (q.questionType || 'single_choice') === 'essay').length;

  return (
    <Box
      translate="no"
      className="notranslate"
      sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}
    >
      {/* Exam Header */}
      <Box sx={{ bgcolor: '#018730', color: '#FFFFFF', py: 2, px: 3, borderBottom: '3px solid #fc4509' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#FED7AA', fontWeight: 800, fontSize: 11 }}>
                UJIAN PSIKOTES & POTENSI AKADEMIK ONLINE
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                PT INDONESIA THAI SUMMIT PLASTECH
              </Typography>
            </Box>

            {!isExamCompleted && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  translate="no"
                  className="notranslate"
                  icon={<TimerIcon sx={{ color: timeLeft < 300 ? '#EF4444' : '#FFFFFF !important' }} />}
                  label={`Sisa Waktu: ${formatTime(timeLeft)}`}
                  sx={{
                    bgcolor: timeLeft < 300 ? '#FEE2E2' : 'rgba(255,255,255,0.2)',
                    color: timeLeft < 300 ? '#DC2626' : '#FFFFFF',
                    fontWeight: 800,
                    fontSize: 14,
                    px: 1,
                  }}
                />
                <Chip
                  translate="no"
                  className="notranslate"
                  label={`Pelanggaran: ${violationsCount}/2`}
                  sx={{
                    bgcolor: violationsCount > 0 ? '#FEF2F2' : 'rgba(255,255,255,0.15)',
                    color: violationsCount > 0 ? '#DC2626' : '#D1FAE5',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                />
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Exam Area */}
      <Container maxWidth="md" sx={{ py: 5, flex: 1 }}>
        {isExamCompleted ? (
          <Card sx={{ borderRadius: 3, border: '2px solid #86EFAC', p: 5, textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: '#16A34A', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
              Ujian Psikotes Selesai Dikirimkan!
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', maxWidth: 580, mx: 'auto', mb: 4, lineHeight: 1.6 }}>
              Jawaban Anda telah berhasil tersimpan dan sedang diverifikasi oleh Tim Human Capital PT ITSP. Status kelolosan resmi akan segera diperbarui di portal Anda.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/portal/dashboard')}
              sx={{ bgcolor: '#018730', color: '#FFFFFF', fontWeight: 700, px: 4, py: 1.3, borderRadius: 2 }}
            >
              Back to Applicant Dashboard &rarr;
            </Button>
          </Card>
        ) : (
          <Card
            key={`q-card-${currentQ?.id ?? currentIndex}`}
            translate="no"
            className="notranslate"
            sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
          >
            {/* Question Progress Header */}
            <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
              <Box>
                <Typography key={`q-hdr-${currentQ?.id ?? currentIndex}`} variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Soal Nomor {currentIndex + 1} dari {totalQuestions}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Pilihan Ganda {pgTotal} • Essay {essayTotal} • Urutan diacak unik untuk Anda
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#018730' }}>
                  Terjawab: {answeredCount} / {totalQuestions} Soal
                </Typography>
                <Button variant="outlined" size="small" startIcon={<GridIcon />} onClick={() => setShowNav(true)} sx={{ borderRadius: 2, fontWeight: 800, borderColor: '#018730', color: '#018730' }}>
                  Lihat Semua Soal
                </Button>
              </Box>
            </Box>

            <LinearProgress
              variant="determinate"
              value={((currentIndex + 1) / totalQuestions) * 100}
              sx={{ height: 4, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#018730' } }}
            />

            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              {currentQ && (
                <Box key={`q-body-${currentQ.id}`}>
                  <Typography key={`q-txt-${currentQ.id}`} variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 2, lineHeight: 1.6 }}>
                    {currentQ.question}
                  </Typography>

                  {currentQ.imageUrl && (
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                      <Box
                        component="img"
                        src={currentQ.imageUrl}
                        alt="Diagram Soal"
                        sx={{
                          maxHeight: 280,
                          maxWidth: '100%',
                          objectFit: 'contain',
                          borderRadius: 2,
                          border: '1.5px solid #CBD5E1',
                          bgcolor: '#F8FAFC',
                          p: 1,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }}
                      />
                    </Box>
                  )}

                  {/* RENDER OPTIONS BASED ON QUESTION TYPE */}
                  {currentQ.questionType === 'multi_choice' ? (
                    <Box>
                      <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: 2, border: '1px solid #FDE68A', mb: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E' }}>
                          👤 Pilihan Karakteristik Diri (Pilih Maksimal 2 Karakter)
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#78350F', mt: 0.5, fontSize: 13.5 }}>
                          Pilihlah <strong>maksimal 2 pilihan</strong> yang paling mencerminkan kepribadian atau cara kerja Anda. Soal ini tidak memiliki jawaban benar/salah dan akan dinilai langsung oleh tim HR PT ITSP. (Terpilih: {(Array.isArray(answers[currentQ.id]) ? answers[currentQ.id].length : 0)}/2)
                        </Typography>
                      </Box>

                      {currentQ.options?.map((opt: string, idx: number) => {
                        const optKey = String.fromCharCode(65 + idx); // A, B, C, D
                        const currentSelections: string[] = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : [];
                        const isChecked = currentSelections.includes(optKey);

                        const handleToggle = () => {
                          if (isChecked) {
                            setAnswers({
                              ...answers,
                              [currentQ.id]: currentSelections.filter((k) => k !== optKey),
                            });
                          } else {
                            if (currentSelections.length >= 2) {
                              alert('Anda sudah memilih 2 karakteristik. Hapus salah satu pilihan terlebih dahulu jika ingin menggantinya.');
                              return;
                            }
                            setAnswers({
                              ...answers,
                              [currentQ.id]: [...currentSelections, optKey],
                            });
                          }
                        };

                        return (
                          <Box
                            key={`mc-${currentQ.id}-${optKey}-${opt}`}
                            onClick={handleToggle}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: '1.5px solid',
                              borderColor: isChecked ? '#018730' : '#E2E8F0',
                              bgcolor: isChecked ? '#F0FDF4' : '#FFFFFF',
                              mb: 1.5,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              '&:hover': { borderColor: '#018730', bgcolor: '#F8FAFC' },
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isChecked}
                                  sx={{ color: '#018730', '&.Mui-checked': { color: '#018730' } }}
                                />
                              }
                              label={
                                <Typography key={`mc-txt-${currentQ.id}-${optKey}-${opt}`} variant="body1" sx={{ color: '#334155', fontWeight: isChecked ? 700 : 500 }}>
                                  <strong>{optKey}.</strong> <span>{opt}</span>
                                </Typography>
                              }
                              sx={{ width: '100%', m: 0 }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  ) : currentQ.questionType === 'essay' ? (
                    <Box>
                      <Box sx={{ p: 2, bgcolor: '#EFF6FF', borderRadius: 2, border: '1px solid #BFDBFE', mb: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E40AF' }}>
                          📝 Soal Uraian / Analisis Tertulis
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1E3A8A', mt: 0.5, fontSize: 13.5 }}>
                          Tuliskan uraian analisa, metode, atau solusi teknis Anda secara mendalam pada kolom di bawah. Jawaban Anda akan dievaluasi langsung oleh tim penguji.
                        </Typography>
                      </Box>
                      <TextField
                        key={`essay-${currentQ.id}`}
                        fullWidth
                        multiline
                        rows={6}
                        placeholder="Ketikkan uraian analisa dan jawaban teknis Anda di sini secara lengkap..."
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                        sx={{ bgcolor: '#FFFFFF', borderRadius: 2 }}
                      />
                    </Box>
                  ) : (
                    <RadioGroup
                      key={`rg-${currentQ.id}`}
                      value={typeof answers[currentQ.id] === 'string' ? answers[currentQ.id] : ''}
                      onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                    >
                      {currentQ.options?.map((opt: string, idx: number) => {
                        const optKey = String.fromCharCode(65 + idx); // A, B, C, D
                        return (
                          <Box
                            key={`sc-${currentQ.id}-${optKey}-${opt}`}
                            onClick={() => setAnswers({ ...answers, [currentQ.id]: optKey })}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: '1.5px solid',
                              borderColor: answers[currentQ.id] === optKey ? '#018730' : '#E2E8F0',
                              bgcolor: answers[currentQ.id] === optKey ? '#F0FDF4' : '#FFFFFF',
                              mb: 1.5,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              '&:hover': { borderColor: '#018730', bgcolor: '#F8FAFC' },
                            }}
                          >
                            <FormControlLabel
                              value={optKey}
                              control={<Radio sx={{ color: '#018730', '&.Mui-checked': { color: '#018730' } }} />}
                              label={
                                <Typography key={`sc-txt-${currentQ.id}-${optKey}-${opt}`} variant="body1" sx={{ color: '#334155', fontWeight: answers[currentQ.id] === optKey ? 700 : 500 }}>
                                  <strong>{optKey}.</strong> <span>{opt}</span>
                                </Typography>
                              }
                              sx={{ width: '100%', m: 0 }}
                            />
                          </Box>
                        );
                      })}
                    </RadioGroup>
                  )}
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Navigation Controls */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  startIcon={<ArrowBackIcon />}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  Sebelumnya
                </Button>

                {currentIndex < totalQuestions - 1 ? (
                  <Button
                    variant="contained"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ bgcolor: '#018730', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#005c21' } }}
                  >
                    Selanjutnya
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setShowConfirmModal(true)}
                    endIcon={<SendIcon />}
                    sx={{ bgcolor: '#fc4509', color: '#FFFFFF', fontWeight: 800, borderRadius: 2, px: 3, '&:hover': { bgcolor: '#e03a03' } }}
                  >
                    Kirim Lembar Ujian
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* ANTI-CHEAT STRIKE 1 WARNING MODAL */}
      <Dialog
        open={showWarningModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{ translate: 'no', className: 'notranslate' }}
      >
        <DialogTitle sx={{ color: '#DC2626', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ fontSize: 26 }} /> PERINGATAN KEAMANAN (STRIKE 1)
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, mb: 1.5 }}>
            Sistem proctoring mendeteksi Anda <strong>berpindah tab browser atau keluar dari jendela ujian</strong>.
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
            <strong>Peringatan 1 dari maksimal 2 kali!</strong> Jika Anda kembali beralih aplikasi/tab, ujian akan <strong>otomatis dihentikan dan disubmit secara paksa</strong>.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setShowWarningModal(false)}
            sx={{ bgcolor: '#DC2626', fontWeight: 700 }}
          >
            Saya Mengerti & Back to Exam
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUBMISSION CONFIRMATION MODAL */}
      <Dialog
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ translate: 'no', className: 'notranslate' }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A' }}>
          Konfirmasi Pengiriman Ujian
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Anda telah menjawab <strong>{answeredCount}</strong> dari total <strong>{totalQuestions}</strong> soal.
          </Typography>
          {answeredCount < totalQuestions && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 1.5 }}>
              Masih terdapat {totalQuestions - answeredCount} soal yang belum Anda jawab. Apakah Anda yakin ingin mengakhiri ujian?
            </Alert>
          )}
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Setelah dikirimkan, jawaban tidak dapat diubah kembali.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setShowConfirmModal(false)} sx={{ color: '#64748B' }}>
            Review Again
          </Button>
          <Button
            variant="contained"
            disabled={submitting}
            onClick={() => handleSubmitExam(false)}
            sx={{ bgcolor: '#018730', fontWeight: 700, '&:hover': { bgcolor: '#005c21' } }}
          >
            {submitting ? 'Mengirim...' : 'Ya, Kirim Sekarang'}
          </Button>
        </DialogActions>
      </Dialog>

      <QuestionNavigator
        open={showNav}
        onClose={() => setShowNav(false)}
        questions={questions}
        answers={answers}
        currentIndex={currentIndex}
        onJump={(idx) => setCurrentIndex(idx)}
        accent="#018730"
        title="Psychometric Question List (Random MCQ + Final Essay)"
      />

      <Footer />
    </Box>
  );
}
