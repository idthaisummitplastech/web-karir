'use client';

import React, { useState, useEffect } from 'react';
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
  Checkbox,
  TextField,
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
} from '@mui/material';
import {
  Timer as TimerIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
} from '@mui/icons-material';

const EXAM_DURATION_SECONDS = 25 * 60; // 25 minutes

export default function UserTestExamPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [isExamCompleted, setIsExamCompleted] = useState(false);

  // Anti-Cheat
  const [violationsCount, setViolationsCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isLockedByAntiCheat, setIsLockedByAntiCheat] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetch('/api/test/questions?category=user_test')
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
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Timer countdown
  useEffect(() => {
    if (loading || isExamCompleted || isLockedByAntiCheat) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isExamCompleted, isLockedByAntiCheat]);

  // Anti-cheat detection
  useEffect(() => {
    if (loading || isExamCompleted || isLockedByAntiCheat) return;

    const handleVisibilityChange = () => {
      if (document.hidden) triggerViolation();
    };

    const handleWindowBlur = () => {
      triggerViolation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [loading, isExamCompleted, isLockedByAntiCheat, violationsCount]);

  const triggerViolation = async () => {
    if (isExamCompleted || isLockedByAntiCheat) return;

    try {
      const res = await fetch('/api/test/violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'user_test' }),
      });

      const data = await res.json();
      const currentCount = data.violationsCount || violationsCount + 1;
      setViolationsCount(currentCount);

      if (data.isLocked || currentCount >= 2) {
        setIsLockedByAntiCheat(true);
        handleSubmitExam(true);
      } else {
        setShowWarningModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitExam = async (isForced = false) => {
    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'user_test',
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
  const answeredCount = Object.keys(answers).length;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
      {/* Exam Header */}
      <Box sx={{ bgcolor: '#018730', color: '#FFFFFF', py: 2, px: 3, borderBottom: '3px solid #fc4509' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#FED7AA', fontWeight: 800, fontSize: 11 }}>
                UJIAN TEKNIS & KOMPETENSI USER DEPARTEMEN
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                PT INDONESIA THAI SUMMIT PLASTECH
              </Typography>
            </Box>

            {!isExamCompleted && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
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

      {/* Main Area */}
      <Container maxWidth="md" sx={{ py: 5, flex: 1 }}>
        {isExamCompleted ? (
          <Card sx={{ borderRadius: 3, border: '2px solid #86EFAC', p: 5, textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: '#16A34A', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
              Ujian Teknis Berhasil Dikirimkan!
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', maxWidth: 580, mx: 'auto', mb: 4, lineHeight: 1.6 }}>
              Hasil jawaban teknis Anda sedang dievaluasi oleh Tim Kepala Departemen & Human Capital PT ITSP. Pantau status perkembangan Anda di dashboard pelamar.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/portal/dashboard')}
              sx={{ bgcolor: '#018730', color: '#FFFFFF', fontWeight: 700, px: 4, py: 1.3, borderRadius: 2 }}
            >
              Kembali ke Dashboard Pelamar &rarr;
            </Button>
          </Card>
        ) : (
          <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Soal Nomor {currentIndex + 1} dari {totalQuestions}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#fc4509' }}>
                Terjawab: {answeredCount} / {totalQuestions} Soal
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={((currentIndex + 1) / totalQuestions) * 100}
              sx={{ height: 4, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#fc4509' } }}
            />

            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              {currentQ && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 2, lineHeight: 1.6 }}>
                    {currentQ.question}
                  </Typography>

                  {currentQ.imageUrl && (
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                      <Box
                        component="img"
                        src={currentQ.imageUrl}
                        alt="Diagram Soal Teknis"
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
                          Pilihlah <strong>maksimal 2 pilihan</strong> yang paling mencerminkan cara kerja dan profil Anda. Soal ini dinilai langsung oleh tim departemen. (Terpilih: {(Array.isArray(answers[currentQ.id]) ? answers[currentQ.id].length : 0)}/2)
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
                              alert('Anda sudah memilih 2 pilihan. Batalkan salah satu pilihan terlebih dahulu jika ingin menggantinya.');
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
                            key={optKey}
                            onClick={handleToggle}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: '1.5px solid',
                              borderColor: isChecked ? '#fc4509' : '#E2E8F0',
                              bgcolor: isChecked ? '#FFF7ED' : '#FFFFFF',
                              mb: 1.5,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              '&:hover': { borderColor: '#fc4509', bgcolor: '#F8FAFC' },
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isChecked}
                                  sx={{ color: '#fc4509', '&.Mui-checked': { color: '#fc4509' } }}
                                />
                              }
                              label={
                                <Typography variant="body1" sx={{ color: '#334155', fontWeight: isChecked ? 700 : 500 }}>
                                  <strong>{optKey}.</strong> {opt}
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
                          📝 Soal Uraian / Studi Kasus Teknis
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#1E3A8A', mt: 0.5, fontSize: 13.5 }}>
                          Tuliskan uraian analisa teknis, langkah penyelesaian masalah (troubleshooting), atau metode pengerjaan Anda secara lengkap pada kolom di bawah. Jawaban akan diperiksa dan dinilai langsung oleh User Departemen.
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        placeholder="Ketikkan uraian jawaban teknis atau analisa kasus Anda secara rinci di sini..."
                        value={typeof answers[currentQ.id] === 'string' ? answers[currentQ.id] : ''}
                        onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                        sx={{ bgcolor: '#FFFFFF', borderRadius: 2 }}
                      />
                    </Box>
                  ) : (
                    <RadioGroup
                      value={typeof answers[currentQ.id] === 'string' ? answers[currentQ.id] : ''}
                      onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                    >
                      {currentQ.options?.map((opt: string, idx: number) => {
                        const optKey = String.fromCharCode(65 + idx);
                        return (
                          <Box
                            key={optKey}
                            onClick={() => setAnswers({ ...answers, [currentQ.id]: optKey })}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: '1.5px solid',
                              borderColor: answers[currentQ.id] === optKey ? '#fc4509' : '#E2E8F0',
                              bgcolor: answers[currentQ.id] === optKey ? '#FFF7ED' : '#FFFFFF',
                              mb: 1.5,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              '&:hover': { borderColor: '#fc4509', bgcolor: '#F8FAFC' },
                            }}
                          >
                            <FormControlLabel
                              value={optKey}
                              control={<Radio sx={{ color: '#fc4509', '&.Mui-checked': { color: '#fc4509' } }} />}
                              label={
                                <Typography variant="body1" sx={{ color: '#334155', fontWeight: answers[currentQ.id] === optKey ? 700 : 500 }}>
                                  <strong>{optKey}.</strong> {opt}
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
                    sx={{ bgcolor: '#fc4509', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#e03a03' } }}
                  >
                    Selanjutnya
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setShowConfirmModal(true)}
                    endIcon={<SendIcon />}
                    sx={{ bgcolor: '#018730', color: '#FFFFFF', fontWeight: 800, borderRadius: 2, px: 3, '&:hover': { bgcolor: '#005c21' } }}
                  >
                    Kirim Lembar Ujian
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Warning Modal */}
      <Dialog open={showWarningModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#DC2626', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ fontSize: 26 }} /> PERINGATAN KEAMANAN (STRIKE 1)
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, mb: 1.5 }}>
            Terdeteksi perpindahan jendela atau tab browser saat ujian teknis berlangsung.
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
            Dilarang membuka tab baru / referensi AI. Pelanggaran kedua akan mengunci ujian Anda secara permanen!
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" fullWidth onClick={() => setShowWarningModal(false)} sx={{ bgcolor: '#DC2626' }}>
            Kembali ke Ujian
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit Confirm Modal */}
      <Dialog open={showConfirmModal} onClose={() => setShowConfirmModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Konfirmasi Kirim Ujian Teknis</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Anda telah menjawab {answeredCount} dari {totalQuestions} soal. Kirim lembar ujian sekarang?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setShowConfirmModal(false)}>Batal</Button>
          <Button variant="contained" onClick={() => handleSubmitExam(false)} sx={{ bgcolor: '#018730' }}>
            Kirim Ujian
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
}
