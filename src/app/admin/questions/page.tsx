'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  Image as ImageIcon,
  CheckCircle as CheckIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Psychology as PsychologyIcon,
  PrecisionManufacturing as EngineeringIcon,
  Visibility as ViewIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { KarirTablePagination } from '@/components/admin/KarirTablePagination';

interface QuestionItem {
  id: number;
  category: string;
  department: string | null;
  question: string;
  questionType?: string;
  imageUrl: string | null;
  options: string;
  correctKey: string | null;
  points: number;
  sortOrder: number;
  createdAt: string;
}

export default function AdminQuestionsPage() {
  const [activeTab, setActiveTab] = useState(0); // 0: Psikotes, 1: User Test
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dialog Add/Edit state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formCategory, setFormCategory] = useState<'psikotes' | 'user_test'>('psikotes');
  const [formDepartment, setFormDepartment] = useState('General');
  const [formQuestionType, setFormQuestionType] = useState<'single_choice' | 'multi_choice' | 'essay'>('single_choice');
  const [formQuestion, setFormQuestion] = useState('');
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null);
  const [formOptionA, setFormOptionA] = useState('');
  const [formOptionB, setFormOptionB] = useState('');
  const [formOptionC, setFormOptionC] = useState('');
  const [formOptionD, setFormOptionD] = useState('');
  const [formCorrectKey, setFormCorrectKey] = useState('A');
  const [formPoints, setFormPoints] = useState(10);
  const [formSortOrder, setFormSortOrder] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Custom Department Input Support
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [customDeptInput, setCustomDeptInput] = useState('');

  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin Session & Role
  const [adminSession, setAdminSession] = useState<{
    role: string;
    name: string;
    email: string;
    department: string | null;
    isAdmin: boolean;
  } | null>(null);

  // Pengaturan jumlah soal yang diujikan (PG acak unik + Essay akhir)
  const [examPsikotesPg, setExamPsikotesPg] = useState(10);
  const [examPsikotesEssay, setExamPsikotesEssay] = useState(5);
  const [examUserPg, setExamUserPg] = useState(10);
  const [examUserEssay, setExamUserEssay] = useState(5);
  const [savingExamCfg, setSavingExamCfg] = useState(false);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setAdminSession(data);
          if (data.role === 'user_dept') {
            setActiveTab(1); // User Dept default to Tab 1 (Tes Teknis)
            if (data.department) {
              setDepartmentFilter(data.department);
              setFormDepartment(data.department);
            }
          } else if (data.role === 'hr') {
            setActiveTab(0); // HR default to Tab 0 (Psikotes)
          }
        }
      })
      .catch((err) => console.error('Session fetch error in questions:', err));
  }, []);

  const fetchQuestions = () => {
    setLoading(true);
    const category = activeTab === 0 ? 'psikotes' : 'user_test';
    const params = new URLSearchParams({ category });
    if (departmentFilter !== 'All') params.append('department', departmentFilter);

    fetch(`/api/admin/questions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) setQuestions(data.questions);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(0);
    fetchQuestions();
  }, [activeTab, departmentFilter]);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        const s = d?.settings || {};
        if (s.exam_psikotes_pg_count) setExamPsikotesPg(Number(s.exam_psikotes_pg_count) || 10);
        if (s.exam_psikotes_essay_count !== undefined) setExamPsikotesEssay(Number(s.exam_psikotes_essay_count) || 0);
        if (s.exam_user_test_pg_count) setExamUserPg(Number(s.exam_user_test_pg_count) || 10);
        if (s.exam_user_test_essay_count !== undefined) setExamUserEssay(Number(s.exam_user_test_essay_count) || 0);
      })
      .catch(() => {});
  }, []);

  const handleSaveExamCfg = async () => {
    if (examPsikotesPg < 1 || examUserPg < 1) { alert('Jumlah PG minimal 1 soal.'); return; }
    if (examPsikotesEssay < 0 || examUserEssay < 0) { alert('Jumlah essay minimal 0.'); return; }
    setSavingExamCfg(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_psikotes_pg_count: String(examPsikotesPg),
          exam_psikotes_essay_count: String(examPsikotesEssay),
          exam_user_test_pg_count: String(examUserPg),
          exam_user_test_essay_count: String(examUserEssay),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeedback({ type: 'success', text: 'Jumlah soal ujian berhasil disimpan. Berlaku untuk peserta berikutnya (paket acak unik, essay selalu akhir).' });
    } catch (e: any) { alert(e.message); }
    finally { setSavingExamCfg(false); }
  };

  // Handle Image Upload & Convert to Base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingId(null);
    const category =
      adminSession?.role === 'user_dept'
        ? 'user_test'
        : activeTab === 0
        ? 'psikotes'
        : 'user_test';
    setFormCategory(category);
    const defaultDept =
      adminSession?.role === 'user_dept' && adminSession.department
        ? adminSession.department
        : category === 'psikotes'
        ? 'General'
        : 'Engineering';
    setFormDepartment(defaultDept);
    setFormQuestion('');
    setFormImageUrl(null);
    setFormQuestionType('single_choice');
    setFormOptionA('');
    setFormOptionB('');
    setFormOptionC('');
    setFormOptionD('');
    setFormCorrectKey('A');
    setFormPoints(10);
    setFormSortOrder(questions.length + 1);
    setIsCustomDept(false);
    setCustomDeptInput('');
    setDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (q: QuestionItem) => {
    let parsedOpts: string[] = ['', '', '', ''];
    try {
      parsedOpts = JSON.parse(q.options);
    } catch {
      parsedOpts = ['', '', '', ''];
    }

    setEditingId(q.id);
    setFormCategory(q.category as 'psikotes' | 'user_test');
    setFormDepartment(q.department || 'General');
    setFormQuestionType((q.questionType as any) || 'single_choice');
    setFormQuestion(q.question);
    setFormImageUrl(q.imageUrl);
    setFormOptionA(parsedOpts[0] || '');
    setFormOptionB(parsedOpts[1] || '');
    setFormOptionC(parsedOpts[2] || '');
    setFormOptionD(parsedOpts[3] || '');
    setFormCorrectKey(q.correctKey || 'A');
    setFormPoints(q.points);
    setFormSortOrder(q.sortOrder);
    setIsCustomDept(false);
    setCustomDeptInput('');
    setDialogOpen(true);
  };

  // Save (Create or Update) Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formQuestionType === 'single_choice' && (!formOptionA || !formOptionB || !formOptionC || !formOptionD)) {
      alert('Seluruh pilihan opsi (A, B, C, D) wajib diisi untuk pilihan ganda.');
      return;
    }
    if (formQuestionType === 'multi_choice' && (!formOptionA || !formOptionB)) {
      alert('Minimal opsi A dan B wajib diisi untuk pilihan kepribadian.');
      return;
    }

    setSubmitting(true);
    const optionsArray =
      formQuestionType === 'essay'
        ? []
        : [formOptionA.trim(), formOptionB.trim(), formOptionC.trim(), formOptionD.trim()].filter(Boolean);

    const resolvedDepartment =
      isCustomDept && customDeptInput.trim() ? customDeptInput.trim() : formDepartment.trim() || 'General';

    const payload = {
      id: editingId,
      category: formCategory,
      department: resolvedDepartment,
      question: formQuestion,
      questionType: formQuestionType,
      imageUrl: formImageUrl,
      options: optionsArray,
      correctKey: formQuestionType === 'single_choice' ? formCorrectKey : null,
      points: Number(formPoints),
      sortOrder: Number(formSortOrder),
    };

    try {
      const res = await fetch('/api/admin/questions', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback({ type: 'success', text: data.message });
      setDialogOpen(false);
      fetchQuestions();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ujian ini dari bank soal?')) return;

    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback({ type: 'success', text: data.message });
      fetchQuestions();
    } catch (err: any) {
      alert(err.message);
    }
  };

    const uniqueDepts: string[] = Array.from(
      new Set([
        'General',
        'Engineering',
        'IT',
        'Produksi',
        'Quality Assurance',
        'HSE',
        'Purchasing',
        ...questions.map((q) => q.department).filter((d): d is string => Boolean(d)),
      ])
    );
    const departmentsList = ['All', ...uniqueDepts];

  return (
    <Box sx={{ maxWidth: 1200 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Bank Soal & Pengaturan Ujian Online
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Kelola soal ujian psikotes & tes teknis departemen. Mendukung pertanyaan bergambar (diagram mesin, skema mold, pola logika) dan opsi jawaban berganda.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            bgcolor: '#018730',
            fontWeight: 700,
            px: 3,
            py: 1.2,
            borderRadius: 2,
            boxShadow: '0 4px 14px rgba(1, 135, 48, 0.25)',
            '&:hover': { bgcolor: '#005c21' },
          }}
        >
          Tambah Soal Baru
        </Button>
      </Box>
      {/* PENGATURAN JUMLAH SOAL YANG DIUJIKAN */}
      <Card sx={{ mb: 3, borderRadius: 2.5, border: '1.5px solid #BBF7D0', bgcolor: '#F0FDF4' }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#166534' }}>
            Jumlah Soal yang Diujikan (berlaku acak unik per peserta, essay selalu paling akhir)
          </Typography>
          <Typography variant="body2" sx={{ color: '#15803D', mb: 2 }}>
            Bank soal boleh banyak. Sistem mengambil PG secara acak + mengacak opsi A/B/C/D tiap peserta sehingga tidak ada paket yang sama.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
            <TextField fullWidth type="number" label="Psikotes: PG" value={examPsikotesPg} onChange={(e)=>setExamPsikotesPg(Number(e.target.value))} slotProps={{ htmlInput: { min: 1 } }} />
            <TextField fullWidth type="number" label="Psikotes: Essay" value={examPsikotesEssay} onChange={(e)=>setExamPsikotesEssay(Number(e.target.value))} slotProps={{ htmlInput: { min: 0 } }} />
            <TextField fullWidth type="number" label="Tes Teknis: PG" value={examUserPg} onChange={(e)=>setExamUserPg(Number(e.target.value))} slotProps={{ htmlInput: { min: 1 } }} />
            <TextField fullWidth type="number" label="Tes Teknis: Essay" value={examUserEssay} onChange={(e)=>setExamUserEssay(Number(e.target.value))} slotProps={{ htmlInput: { min: 0 } }} />
          </Box>
          <Box sx={{ mt: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" disabled={savingExamCfg} onClick={handleSaveExamCfg} sx={{ bgcolor: '#018730', fontWeight: 700 }}>
              {savingExamCfg ? 'Menyimpan...' : 'Simpan Jumlah Soal'}
            </Button>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Contoh: PG 10 + Essay 5. Bila bank kurang, dipakai semua yang ada.
            </Typography>
          </Box>
        </CardContent>
      </Card>


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
                    mb: 0.5,
                  }}
                >
                  {adminSession.role === 'admin'
                    ? '👑 Super Administrator: Akses Seluruh Bank Soal'
                    : adminSession.role === 'hr'
                    ? '👤 Bank Soal HR Recruitment: Psikotes & Profiling Karakteristik Diri'
                    : `🔧 Bank Soal User Departemen: Tes Teknis & Studi Kasus (${adminSession.department || 'Teknis'})`}
                </Typography>
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
                    'Anda dapat membuat, menyunting, atau menghapus seluruh jenis soal untuk Psikotes Umum maupun Tes Teknis seluruh departemen pabrik.'
                  ) : adminSession.role === 'hr' ? (
                    'HR berwenang membuat dan mengelola soal Psikotes Online serta Profiling Karakteristik Diri (soal kualitatif dengan pilihan maksimal 2 jawaban). Soal tes teknis kejuruan dikelola oleh masing-masing User Departemen.'
                  ) : (
                    <span>
                      Anda berwenang mengelola Bank Soal Tes Teknis Kejuruan (Pilihan Ganda & Soal Essay/Studi Kasus Teknis) untuk lowongan departemen <strong>{adminSession.department}</strong>. Soal psikotes dikelola secara independen oleh Tim HR.
                    </span>
                  )}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {feedback.text}
        </Alert>
      )}

      {/* Tabs for Category */}
      <Card sx={{ borderRadius: 2.5, border: '1px solid #CBD5E1', mb: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            if (adminSession?.role === 'user_dept' && val === 0) {
              alert('Soal Psikotes Online & Profiling Karakteristik Diri merupakan wewenang Tim HR Recruitment.');
              return;
            }
            setActiveTab(val);
            if (adminSession?.role === 'user_dept' && adminSession.department) {
              setDepartmentFilter(adminSession.department);
            } else {
              setDepartmentFilter('All');
            }
          }}
          sx={{
            bgcolor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            '& .Mui-selected': { color: '#018730 !important', fontWeight: 800 },
            '& .MuiTabs-indicator': { bgcolor: '#018730', height: 3 },
          }}
        >
          <Tab
            icon={<PsychologyIcon />}
            iconPosition="start"
            label={
              adminSession?.role === 'user_dept'
                ? '1. Soal Tes Psikotes Online (Wewenang HR)'
                : '1. Soal Tes Psikotes Online & Profiling Diri (Tahap 2)'
            }
            disabled={adminSession?.role === 'user_dept'}
          />
          <Tab
            icon={<EngineeringIcon />}
            iconPosition="start"
            label="2. Soal Tes Teknis Departemen (Tahap 3 - Pilihan Ganda & Essay)"
          />
        </Tabs>

        {/* Filters and Search Bar */}
        <Box sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
              Departemen:
            </Typography>
            <TextField
              select
              size="small"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {departmentsList.map((d) => (
                <MenuItem key={d} value={d}>
                  {d === 'All' ? 'Semua Departemen' : d}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Total {questions.length} soal aktif di bank soal
          </Typography>
        </Box>
      </Card>

      {/* Questions List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#018730' }} />
        </Box>
      ) : questions.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 2.5, border: '1px dashed #CBD5E1', bgcolor: '#F8FAFC' }}>
          <QuizIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
          <Typography variant="h6" sx={{ color: '#475569', fontWeight: 700 }}>
            Belum ada soal pada kategori ini.
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
            Klik tombol &quot;Tambah Soal Baru&quot; di atas untuk membuat pertanyaan pertama.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ bgcolor: '#018730' }}>
            Tambah Soal Sekarang
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {questions.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((q, idx) => {
            let options: string[] = [];
            try {
              options = JSON.parse(q.options);
            } catch {
              options = [];
            }

            return (
              <Card
                key={q.id}
                sx={{
                  borderRadius: 2.5,
                  border: '1.5px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#CBD5E1', boxShadow: '0 6px 16px rgba(0,0,0,0.07)' },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.5,
                          bgcolor: '#018730',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Chip
                        label={q.category === 'psikotes' ? 'Psikotes' : `Tes Teknis: ${q.department || 'General'}`}
                        size="small"
                        sx={{
                          bgcolor: q.category === 'psikotes' ? '#EFF6FF' : '#FEF3C7',
                          color: q.category === 'psikotes' ? '#1E40AF' : '#92400E',
                          fontWeight: 700,
                        }}
                      />
                      <Chip
                        label={
                          q.questionType === 'essay'
                            ? '📝 Essay / Uraian'
                            : q.questionType === 'multi_choice'
                            ? '👤 Profiling (Pilih 2)'
                            : '🔘 Pilihan Ganda'
                        }
                        size="small"
                        sx={{
                          bgcolor:
                            q.questionType === 'essay'
                              ? '#E0E7FF'
                              : q.questionType === 'multi_choice'
                              ? '#FCE7F3'
                              : '#F1F5F9',
                          color:
                            q.questionType === 'essay'
                              ? '#3730A3'
                              : q.questionType === 'multi_choice'
                              ? '#9D174D'
                              : '#334155',
                          fontWeight: 700,
                        }}
                      />
                      <Chip
                        label={`${q.points} Poin`}
                        size="small"
                        sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700 }}
                      />
                      {q.imageUrl && (
                        <Chip
                          icon={<ImageIcon sx={{ fontSize: 16 }} />}
                          label="Ada Gambar Diagram"
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Soal">
                        <IconButton size="small" onClick={() => handleOpenEdit(q)} sx={{ color: '#0F172A' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Hapus Soal">
                        <IconButton size="small" onClick={() => handleDeleteQuestion(q.id)} sx={{ color: '#EF4444' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Question Text */}
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2, fontSize: 16, lineHeight: 1.6 }}>
                    {q.question}
                  </Typography>

                  {/* Image Attachment (if exists) */}
                  {q.imageUrl && (
                    <Box sx={{ mb: 2.5 }}>
                      <Box
                        component="img"
                        src={q.imageUrl}
                        alt="Lampiran Soal"
                        onClick={() => setPreviewImage(q.imageUrl)}
                        sx={{
                          maxHeight: 220,
                          maxWidth: '100%',
                          objectFit: 'contain',
                          borderRadius: 2,
                          border: '1px solid #CBD5E1',
                          bgcolor: '#F8FAFC',
                          p: 1,
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.02)' },
                        }}
                      />
                      <Typography variant="caption" sx={{ display: 'block', color: '#64748B', mt: 0.5 }}>
                        *Klik gambar untuk memperbesar tampilan
                      </Typography>
                    </Box>
                  )}

                  {/* Options List / Essay Indicator */}
                  {q.questionType === 'essay' ? (
                    <Box sx={{ p: 2, bgcolor: '#F1F5F9', borderRadius: 2, border: '1px solid #CBD5E1' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 1 }}>
                        📝 Soal Uraian / Studi Kasus Teknis
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                        Pelamar mengetikkan uraian tertulis secara mandiri. Jawaban akan diperiksa dan dinilai langsung oleh tim departemen {q.department || 'User'}.
                      </Typography>
                    </Box>
                  ) : q.questionType === 'multi_choice' ? (
                    <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: 2, border: '1px solid #FDE68A' }}>
                      <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700, display: 'block', mb: 1 }}>
                        👤 Karakteristik Pilihan Diri (Pelamar Memilih 2 Karakter - Tanpa Kunci Benar/Salah, Direview HR):
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                        {options.map((opt: string, i: number) => (
                          <Box key={i} sx={{ p: 1, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1px solid #FCD34D' }}>
                            <Typography variant="body2" sx={{ color: '#451A03', fontWeight: 600 }}>
                              <strong>{String.fromCharCode(65 + i)}.</strong> {opt || '-'}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 1.5,
                        p: 2,
                        bgcolor: '#F8FAFC',
                        borderRadius: 2,
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      {['A', 'B', 'C', 'D'].map((key, i) => {
                        const isCorrect = q.correctKey === key;
                        return (
                          <Box
                            key={key}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.2,
                              p: 1,
                              borderRadius: 1.5,
                              bgcolor: isCorrect ? '#DCFCE7' : '#FFFFFF',
                              border: '1px solid',
                              borderColor: isCorrect ? '#86EFAC' : '#E2E8F0',
                            }}
                          >
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: 1,
                                bgcolor: isCorrect ? '#16A34A' : '#E2E8F0',
                                color: isCorrect ? '#FFFFFF' : '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 800,
                              }}
                            >
                              {key}
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                flex: 1,
                                color: isCorrect ? '#14532D' : '#334155',
                                fontWeight: isCorrect ? 700 : 500,
                              }}
                            >
                              {options[i] || '-'}
                            </Typography>
                            {isCorrect && <CheckIcon sx={{ color: '#16A34A', fontSize: 18 }} />}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {!loading && questions.length > 0 && (
        <Card sx={{ mt: 2, borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <KarirTablePagination
            count={questions.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={(newRpp) => {
              setRowsPerPage(newRpp);
              setPage(0);
            }}
          />
        </Card>
      )}

      {/* CREATE / EDIT QUESTION DIALOG */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSaveQuestion}>
          <DialogTitle sx={{ fontWeight: 800, color: '#018730' }}>
            {editingId ? 'Edit Soal Ujian' : 'Tambah Soal Ujian Baru'}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 2.5 }}>
              <TextField
                select
                fullWidth
                required
                label="Kategori Tes"
                value={formCategory}
                disabled={adminSession?.role === 'user_dept'}
                onChange={(e) => setFormCategory(e.target.value as any)}
                helperText={adminSession?.role === 'user_dept' ? 'User Dept mengelola Tes Teknis Kejuruan' : ''}
              >
                {adminSession?.role !== 'user_dept' && (
                  <MenuItem value="psikotes">Tes Psikotes Online (Tahap 2 - HR)</MenuItem>
                )}
                <MenuItem value="user_test">Tes Teknis Departemen / User (Tahap 3)</MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                required
                label="Bentuk / Tipe Soal"
                value={formQuestionType}
                onChange={(e) => setFormQuestionType(e.target.value as any)}
                helperText={
                  formQuestionType === 'single_choice'
                    ? 'Pilihan Ganda standar: 4 opsi (A, B, C, D) dengan 1 kunci jawaban pasti.'
                    : formQuestionType === 'multi_choice'
                    ? 'Pilihan Karakter Diri (Review HR): Pelamar memilih maksimal 2 karakter.'
                    : 'Soal Essay / Studi Kasus (Review User): Pelamar mengisi uraian teknis.'
                }
              >
                <MenuItem value="single_choice">Pilihan Ganda (1 Kunci Jawaban Benar - Otomatis)</MenuItem>
                {(adminSession?.role === 'hr' || adminSession?.role === 'admin' || formCategory === 'psikotes') && (
                  <MenuItem value="multi_choice">Pilihan Karakter Diri (Pilih Maks 2 - Review HR)</MenuItem>
                )}
                {(adminSession?.role === 'user_dept' || adminSession?.role === 'admin' || formCategory === 'user_test') && (
                  <MenuItem value="essay">Soal Essay / Uraian Studi Kasus (Review User Dept)</MenuItem>
                )}
              </TextField>

              {!isCustomDept ? (
                <TextField
                  select
                  fullWidth
                  required
                  label="Departemen Terkait"
                  value={uniqueDepts.includes(formDepartment) ? formDepartment : (formDepartment || 'General')}
                  disabled={Boolean(adminSession?.role === 'user_dept' && adminSession.department)}
                  onChange={(e) => {
                    if (e.target.value === '__NEW__') {
                      setIsCustomDept(true);
                      setCustomDeptInput('');
                    } else {
                      setFormDepartment(e.target.value);
                    }
                  }}
                  helperText={
                    adminSession?.role === 'user_dept' && adminSession.department
                      ? `Terkunci ke departemen Anda (${adminSession.department})`
                      : 'Pilih departemen yang ada atau ketik baru'
                  }
                >
                  {uniqueDepts.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                  {adminSession?.role !== 'user_dept' && (
                    <MenuItem value="__NEW__" sx={{ color: '#018730', fontWeight: 800, borderTop: '1px dashed #CBD5E1' }}>
                      + Tambah / Ketik Departemen Baru...
                    </MenuItem>
                  )}
                </TextField>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    required
                    autoFocus
                    label="Nama Departemen Baru"
                    placeholder="misal: Maintenance, PPIC, Moulding, dll"
                    value={customDeptInput}
                    onChange={(e) => {
                      setCustomDeptInput(e.target.value);
                      setFormDepartment(e.target.value);
                    }}
                    helperText="Ketik nama departemen baru yang akan ditambahkan"
                  />
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsCustomDept(false);
                      setFormDepartment('General');
                    }}
                    sx={{ textTransform: 'none', whiteSpace: 'nowrap', py: 1.8, borderRadius: 2 }}
                  >
                    Daftar
                  </Button>
                </Box>
              )}
            </Box>

            {/* Question Text */}
            <Box sx={{ mb: 2.5 }}>
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Isi Teks Pertanyaan / Soal"
                placeholder="Tuliskan pertanyaan ujian secara jelas..."
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
              />
            </Box>

            {/* IMAGE ATTACHMENT SECTION */}
            <Box sx={{ mb: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1.5px dashed #CBD5E1' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageIcon sx={{ color: '#018730' }} /> Lampiran Gambar Soal (Opsional)
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5 }}>
                Unggah gambar diagram mesin, cetakan mold plastik, sirkuit, grafik, atau pola logika visual (Format JPG/PNG/WebP, Maks. 2 MB).
              </Typography>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageFileChange}
              />

              {formImageUrl ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    component="img"
                    src={formImageUrl}
                    alt="Preview Soal"
                    sx={{ maxHeight: 100, borderRadius: 1.5, border: '1px solid #CBD5E1' }}
                  />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700, display: 'block' }}>
                      Gambar berhasil dilampirkan
                    </Typography>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setFormImageUrl(null)}
                      sx={{ textTransform: 'none', mt: 0.5 }}
                    >
                      Hapus Gambar
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ borderColor: '#CBD5E1', color: '#334155' }}
                >
                  Pilih / Upload Gambar dari Komputer
                </Button>
              )}
                 <Divider sx={{ my: 2 }} />

            {/* CONDITIONAL OPTIONS RENDERING BASED ON QUESTION TYPE */}
            {formQuestionType === 'essay' ? (
              <Box sx={{ p: 2.5, bgcolor: '#EFF6FF', borderRadius: 2.5, border: '1.5px solid #BFDBFE', mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E40AF', mb: 0.5 }}>
                  📝 Format Soal Essay / Studi Kasus Terbuka
                </Typography>
                <Typography variant="body2" sx={{ color: '#1E3A8A', lineHeight: 1.6 }}>
                  Soal ini tidak memerlukan opsi pilihan ganda maupun kunci jawaban benar/salah otomatis. Pelamar akan diberikan kolom teks luas (textarea) untuk mengetikkan analisa atau penjelasan solusi teknis. Hasil uraian tertulis akan dievaluasi secara manual oleh tim User Departemen.
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                  {formQuestionType === 'multi_choice'
                    ? 'Pilihan Karakteristik Diri (Opsi Sifat / Karakter):'
                    : 'Pilihan Jawaban (Opsi A s/d D):'}
                </Typography>
                {formQuestionType === 'multi_choice' && (
                  <Typography variant="caption" sx={{ color: '#92400E', bgcolor: '#FEF3C7', p: 1, borderRadius: 1.5, display: 'block', mb: 2 }}>
                    ℹ️ Pelamar akan memilih 2 karakteristik yang paling mewakili dirinya. Soal ini tidak memiliki benar/salah dan akan direview oleh HR.
                  </Typography>
                )}

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2.5 }}>
                  <TextField
                    fullWidth
                    required
                    label="Opsi A"
                    placeholder={formQuestionType === 'multi_choice' ? 'Karakteristik A (misal: Teliti & rapi)' : 'Jawaban A'}
                    value={formOptionA}
                    onChange={(e) => setFormOptionA(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    required
                    label="Opsi B"
                    placeholder={formQuestionType === 'multi_choice' ? 'Karakteristik B (misal: Cepat beradaptasi)' : 'Jawaban B'}
                    value={formOptionB}
                    onChange={(e) => setFormOptionB(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Opsi C"
                    placeholder={formQuestionType === 'multi_choice' ? 'Karakteristik C (misal: Suka tantangan & target)' : 'Jawaban C'}
                    value={formOptionC}
                    onChange={(e) => setFormOptionC(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Opsi D"
                    placeholder={formQuestionType === 'multi_choice' ? 'Karakteristik D (misal: Mampu memimpin tim)' : 'Jawaban D'}
                    value={formOptionD}
                    onChange={(e) => setFormOptionD(e.target.value)}
                  />
                </Box>
              </>
            )}

            {/* Answer Key, Points & Sort Order */}
            <Box sx={{ display: 'grid', gridTemplateColumns: formQuestionType === 'single_choice' ? { xs: '1fr', sm: '1fr 1fr 1fr' } : { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {formQuestionType === 'single_choice' && (
                <TextField
                  select
                  fullWidth
                  required
                  label="Kunci Jawaban Benar"
                  value={formCorrectKey}
                  onChange={(e) => setFormCorrectKey(e.target.value)}
                >
                  <MenuItem value="A">A</MenuItem>
                  <MenuItem value="B">B</MenuItem>
                  <MenuItem value="C">C</MenuItem>
                  <MenuItem value="D">D</MenuItem>
                </TextField>
              )}

              <TextField
                fullWidth
                required
                type="number"
                label="Bobot Poin"
                value={formPoints}
                onChange={(e) => setFormPoints(Number(e.target.value))}
              />

              <TextField
                fullWidth
                required
                type="number"
                label="Urutan Tampil"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(Number(e.target.value))}
              />
            </Box>         </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setDialogOpen(false)} sx={{ color: '#64748B' }}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ bgcolor: '#018730', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#005c21' } }}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Soal Ujian'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* FULL IMAGE PREVIEW MODAL */}
      <Dialog open={Boolean(previewImage)} onClose={() => setPreviewImage(null)} maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Tampilan Penuh Gambar Diagram Soal</span>
          <IconButton onClick={() => setPreviewImage(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 2 }}>
          {previewImage && (
            <img
              src={previewImage}
              alt="Lampiran Soal Penuh"
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
