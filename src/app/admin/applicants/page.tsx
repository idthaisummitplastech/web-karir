'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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
  InputAdornment,
  Divider,
  Tabs,
  Tab,
  Avatar,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  ExpandMore as ExpandMoreIcon,
  Quiz as QuizIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  AssignmentTurnedIn as VerifiedIcon,
  VpnKey as KeyIcon,
  ContentCopy as CopyIcon,
  ContentPaste as ContentPasteIcon,
  Casino as DiceIcon,
  EventNote as ScheduleIcon,
  Map as MapIcon,
  Place as PlaceIcon,
  Business as FactoryIcon,
  Language as OnlineIcon,
  DeleteSweep as DeleteSweepIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  FamilyRestroom as FamilyIcon,
  Description as DocIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Wc as GenderIcon,
  Fingerprint as FingerprintIcon,
  Tune as TuneIcon,
  CloudUpload as UploadIcon,
  AttachFile as AttachFileIcon,
  Refresh as RefreshIcon,
  HowToReg as HowToRegIcon,
  Badge as BadgeIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from '@mui/icons-material';

// Helper function to safely parse stringified JSON arrays/objects from DB
const parseJsonSafe = (val: any, fallback: any) => {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    const parsed = JSON.parse(val);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};
import {
  RECRUITMENT_STAGES,
  PLANT_LOCATIONS,
  DEFAULT_MCU_LOCATION,
  getPlantMapsUrl,
  getEmbedMapsUrl,
} from '@/lib/constants';
import { KarirTablePagination } from '@/components/admin/KarirTablePagination';
import {
  DEFAULT_OFFERING_CLAUSES,
  generateOfferingLetterHtml,
  openOfferingLetterWindow,
} from '@/lib/offering-letter';
import { useSmartSync } from '@/lib/use-smart-sync';

// Interactive Digital Signature Canvas for HR/Admin
const DigitalSignatureCanvas: React.FC<{
  value: string;
  onChange: (val: string) => void;
}> = ({ value, onChange }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

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

  const processImageFile = (file: Blob | File) => {
    if (!file.type.startsWith('image/')) {
      alert('File atau konten clipboard yang ditempelkan harus berupa gambar (PNG/JPG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = evt.target?.result as string;
      if (res) {
        onChange(res);
        setFeedback('✓ Gambar tanda tangan berhasil ditempelkan (Paste)!');
        setTimeout(() => setFeedback(null), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  // Global Ctrl+V listener
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            e.preventDefault();
            processImageFile(blob);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onChange]);

  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard?.read) {
        alert('Browser Anda memerlukan pintasan keyboard: Silakan tekan Ctrl + V pada keyboard untuk menempelkan gambar tanda tangan.');
        return;
      }
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          processImageFile(blob);
          return;
        }
      }
      alert('Tidak ada gambar tanda tangan di clipboard. Silakan salin (Copy / Screenshot) gambar tanda tangan terlebih dahulu, lalu tekan tombol ini atau Ctrl + V.');
    } catch (err: any) {
      console.warn('Clipboard read error:', err);
      alert('Akses clipboard otomatis dibatasi oleh browser. Silakan langsung tekan pintasan keyboard: Ctrl + V untuk menempelkan gambar.');
    }
  };

  const handleCopySignature = async () => {
    if (!value) return;
    try {
      const res = await fetch(value);
      const blob = await res.blob();
      if (navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type || 'image/png']: blob }),
        ]);
        setFeedback('✓ Gambar tanda tangan berhasil disalin ke clipboard!');
        setTimeout(() => setFeedback(null), 3000);
        return;
      }
    } catch (e) {
      console.warn(e);
    }
    setFeedback('✓ Tanda tangan aktif siap digunakan.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

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
    setFeedback(null);
  };

  return (
    <Box
      tabIndex={0}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      sx={{
        border: '1.5px dashed #018730',
        borderRadius: 2,
        p: 2,
        bgcolor: '#FFFFFF',
        outline: 'none',
        '&:focus': { borderColor: '#15803D', boxShadow: '0 0 0 2px rgba(1, 135, 48, 0.15)' }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          ✍️ Area Kanvas Tanda Tangan (Gores atau Tempel/Paste Gambar):
        </Typography>
        <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
          <Button
            size="small"
            startIcon={<ContentPasteIcon sx={{ fontSize: 14 }} />}
            onClick={handlePasteFromClipboard}
            sx={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: '#EFF6FF',
              color: '#1D4ED8',
              border: '1px solid #BFDBFE',
              '&:hover': { bgcolor: '#DBEAFE' },
            }}
          >
            Paste (Ctrl + V)
          </Button>

          {value && (
            <Button
              size="small"
              startIcon={<CopyIcon sx={{ fontSize: 14 }} />}
              onClick={handleCopySignature}
              sx={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: '#F0FDF4',
                color: '#15803D',
                border: '1px solid #BBF7D0',
                '&:hover': { bgcolor: '#DCFCE7' },
              }}
            >
              Salin (Copy)
            </Button>
          )}

          <Button
            size="small"
            color="error"
            onClick={handleClear}
            sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none' }}
          >
            Hapus / Ulangi
          </Button>
        </Stack>
      </Box>

      <canvas
        ref={canvasRef}
        width={500}
        height={130}
        style={{
          width: '100%',
          height: '130px',
          touchAction: 'none',
          background: '#F8FAFC',
          borderRadius: '6px',
          border: '1px solid #E2E8F0',
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

      <Box sx={{ mt: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" sx={{ color: '#0369A1', bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', px: 1, py: 0.3, borderRadius: 1, display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 700, fontSize: 11 }}>
          📋 <strong>Dukungan Copy-Paste:</strong> Salin gambar tanda tangan lalu tekan <strong>Ctrl + V</strong> atau klik tombol Paste.
        </Typography>

        {feedback && (
          <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 800, fontSize: 11, bgcolor: '#DCFCE7', px: 1, py: 0.3, borderRadius: 1, border: '1px solid #86EFAC' }}>
            {feedback}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// Helper to format Date or date string to local "YYYY-MM-DDTHH:mm" for <input type="datetime-local"> without timezone drift
const formatToLocalDateTimeInput = (dateInput: Date | string | number | null | undefined): string => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function AdminApplicantsPage() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
  const [detailTab, setDetailTab] = useState(0);
  const [docPreview, setDocPreview] = useState<{ title: string; url: string; isPdf?: boolean } | null>(null);
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [advanceAction, setAdvanceAction] = useState<'approve' | 'reject'>('approve');
  const [advanceNotes, setAdvanceNotes] = useState('');
  const [advanceSchedule, setAdvanceSchedule] = useState('');
  const [advanceScheduleUntil, setAdvanceScheduleUntil] = useState('');
  const [advanceDuration, setAdvanceDuration] = useState<number>(60);
  const [advanceLocation, setAdvanceLocation] = useState('Portal Karir Online PT ITSP');
  const [advanceMapsInput, setAdvanceMapsInput] = useState('');
  const [advanceToken, setAdvanceToken] = useState('');
  const [advanceSalary, setAdvanceSalary] = useState('');
  const [advanceAllowance, setAdvanceAllowance] = useState('');
  const [advanceOfferingFile, setAdvanceOfferingFile] = useState<{ name: string; size: number; base64: string } | null>(null);

  // Stage 7: Offering Letter Format & Digital Signature States
  const [advanceOfferingRefNum, setAdvanceOfferingRefNum] = useState('');
  const [advanceOfferingJoinDate, setAdvanceOfferingJoinDate] = useState('');
  const [advanceOfferingClauses, setAdvanceOfferingClauses] = useState(DEFAULT_OFFERING_CLAUSES);
  const [advanceOfferingSignerName, setAdvanceOfferingSignerName] = useState('');
  const [advanceOfferingSignerTitle, setAdvanceOfferingSignerTitle] = useState('Human Capital & Recruitment Manager');
  const [advanceOfferingSignature, setAdvanceOfferingSignature] = useState('');
  const [advanceOfferingSignMode, setAdvanceOfferingSignMode] = useState<'draw' | 'upload'>('draw');
  const [isEditingOfferingOnly, setIsEditingOfferingOnly] = useState(false);

  // Stage 7: Pengangkatan Resmi Karyawan & Penandatanganan Kontrak Fisik
  const [hireContractModalOpen, setHireContractModalOpen] = useState(false);
  const [hiringApplicant, setHiringApplicant] = useState<any | null>(null);
  const [hireStartDate, setHireStartDate] = useState('');
  const [hireEndDate, setHireEndDate] = useState('');
  const [hireContractStatus, setHireContractStatus] = useState<'PKWT' | 'PKWTT' | 'Probation' | 'Internship'>('PKWT');
  const [hireDepartment, setHireDepartment] = useState('');
  const [hireJobTitle, setHireJobTitle] = useState('');
  const [hireWorkLocation, setHireWorkLocation] = useState('Plant 1 KIIC Karawang');
  const [hireSalary, setHireSalary] = useState('');
  const [hireNotes, setHireNotes] = useState('');
  const [hireSequenceNumber, setHireSequenceNumber] = useState<number>(1);
  const [hireLastSequence, setHireLastSequence] = useState<number>(0);
  const [hirePreviewId, setHirePreviewId] = useState('');
  const [submittingHire, setSubmittingHire] = useState(false);
  const [hireFeedback, setHireFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Direct Interview Scheduling fields inside Advance Modal (for Stage 3 -> 4 HR Interview & Stage 4 -> 5 User Interview)
  const [advanceInterviewMode, setAdvanceInterviewMode] = useState<'online' | 'onsite'>('online');
  const [advanceMeetingPlatform, setAdvanceMeetingPlatform] = useState('teams');
  const [advanceMeetingLink, setAdvanceMeetingLink] = useState('');
  const [advanceMeetingPasscode, setAdvanceMeetingPasscode] = useState('');
  const [advanceInterviewerName, setAdvanceInterviewerName] = useState('');
  const [advancePlantChoice, setAdvancePlantChoice] = useState<'kiic' | 'giic' | 'custom'>('kiic');
  const [advanceCustomAddress, setAdvanceCustomAddress] = useState('');
  const [advanceRoom, setAdvanceRoom] = useState('');

  // Super Admin Stage Override Modal (Maju / Mundurkan Tahap Seleksi Manual)
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideTargetStage, setOverrideTargetStage] = useState<number>(1);
  const [overrideStageStatus, setOverrideStageStatus] = useState<'in_progress' | 'passed' | 'failed'>('in_progress');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [overrideSendEmail, setOverrideSendEmail] = useState(false);

  // Test Session Schedule & Location Modal (for Stages 2 & 3 anytime update)
  const [testSessionModalOpen, setTestSessionModalOpen] = useState(false);
  const [testSessionDate, setTestSessionDate] = useState('');
  const [testSessionUntil, setTestSessionUntil] = useState('');
  const [testSessionDuration, setTestSessionDuration] = useState<number>(60);
  const [testSessionLocation, setTestSessionLocation] = useState('');
  const [testSessionMapsInput, setTestSessionMapsInput] = useState('');
  const [testSessionToken, setTestSessionToken] = useState('');

  // Interview Schedule Modal
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [interviewType, setInterviewType] = useState<'hr' | 'user'>('hr');
  const [locationMode, setLocationMode] = useState<'online' | 'onsite'>('online');
  const [meetingPlatform, setMeetingPlatform] = useState('teams');
  // 100% via input user/backend — tanpa link/passcode hardcoded di code (lihat .env.example).
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingPasscode, setMeetingPasscode] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewPlantChoice, setInterviewPlantChoice] = useState<'kiic' | 'giic' | 'custom'>('kiic');
  const [interviewCustomAddress, setInterviewCustomAddress] = useState('');
  const [interviewMapsInput, setInterviewMapsInput] = useState('');
  const [interviewRoom, setInterviewRoom] = useState('Ruang Meeting HCM Lt. 2 (Gedung Admin)');

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

  // Database Cleanup Modal State
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
  const [cleanupMode, setCleanupMode] = useState<'soft_cleanup' | 'hard_delete'>('soft_cleanup');
  const [cleaningUp, setCleaningUp] = useState(false);
  const [cleanupFeedback, setCleanupFeedback] = useState<string | null>(null);

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

  // Guarantee questionsMap is populated when candidate detail modal opens
  useEffect(() => {
    if (detailModalOpen && Object.keys(questionsMap).length === 0) {
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
    }
  }, [detailModalOpen, questionsMap]);

  const applicantsRef = useRef<any[]>(applicants);
  useEffect(() => {
    applicantsRef.current = applicants;
  }, [applicants]);

  const selectedApplicantRef = useRef<any | null>(selectedApplicant);
  useEffect(() => {
    selectedApplicantRef.current = selectedApplicant;
  }, [selectedApplicant]);

  const fetchApplicants = useCallback((opts?: boolean | { silent?: boolean } | any) => {
    const silent = typeof opts === 'boolean' ? opts : Boolean(opts?.silent);
    if (!silent) setLoading(true);

    const params = new URLSearchParams();
    if (stageFilter) params.append('stage', stageFilter);
    if (statusFilter) params.append('status', statusFilter);
    if (search) params.append('search', search);
    params.append('_t', Date.now().toString());

    fetch(`/api/admin/applicants?${params.toString()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data || !Array.isArray(data.applicants)) return;

        if (silent) {
          // Smart Diff Check untuk mencegah render berulang & penumpukan RAM
          const currentList = applicantsRef.current;
          const hasLengthChanged = currentList.length !== data.applicants.length;
          const hasItemChanged =
            !hasLengthChanged &&
            currentList.some((oldItem, idx) => {
              const newItem = data.applicants[idx];
              if (!newItem || oldItem.id !== newItem.id) return true;
              return (
                oldItem.currentStage !== newItem.currentStage ||
                oldItem.current_stage !== newItem.current_stage ||
                oldItem.stageStatus !== newItem.stageStatus ||
                oldItem.stage_status !== newItem.stage_status ||
                oldItem.status !== newItem.status ||
                oldItem.contractSignedAt !== newItem.contractSignedAt ||
                oldItem.contract_signed_at !== newItem.contract_signed_at ||
                oldItem.signedContractFile !== newItem.signedContractFile ||
                oldItem.signed_contract_file !== newItem.signed_contract_file ||
                oldItem.offeringSalary !== newItem.offeringSalary ||
                oldItem.offeringJoinDate !== newItem.offeringJoinDate ||
                oldItem.updatedAt !== newItem.updatedAt ||
                oldItem.updated_at !== newItem.updated_at
              );
            });

          if (hasLengthChanged || hasItemChanged) {
            setApplicants(data.applicants);
            // Perbarui data pelamar realtime jika modal detail sedang dilihat
            if (selectedApplicantRef.current) {
              const updated = data.applicants.find((a: any) => a.id === selectedApplicantRef.current.id);
              if (updated) setSelectedApplicant(updated);
            }
          }
        } else {
          setApplicants(data.applicants);
          if (selectedApplicantRef.current) {
            const updated = data.applicants.find((a: any) => a.id === selectedApplicantRef.current.id);
            if (updated) setSelectedApplicant(updated);
          }
        }
      })
      .catch((err) => {
        if (!silent) console.error(err);
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, [stageFilter, statusFilter, search]);

  useEffect(() => {
    fetchApplicants(false);
  }, [fetchApplicants]);

  // Hook Sinkronisasi Realtime Adaptif ATS Admin (10s foreground / 60s background, zero-leak)
  const { isTabActive } = useSmartSync(() => fetchApplicants(true), {
    activeIntervalMs: 10000,
    idleIntervalMs: 60000,
    enabled: true,
    isPaused:
      advanceModalOpen ||
      overrideModalOpen ||
      hireContractModalOpen ||
      testSessionModalOpen ||
      interviewModalOpen ||
      scoreModalOpen ||
      resetPassModalOpen ||
      cleanupModalOpen ||
      processing,
  });

  function isDeptMatch(deptA?: string | null, deptB?: string | null): boolean {
    if (!deptA || !deptB) return false;
    const a = deptA.trim().toLowerCase();
    const b = deptB.trim().toLowerCase();
    if (a === b) return true;

    const itAliases = [
      'it',
      'information technology',
      'teknologi informasi',
      'it & systems',
      'it & enterprise system',
      'sistem informasi',
      'ti',
    ];
    const aIsIt = itAliases.some((k) => a === k || ` ${a} `.includes(` ${k} `) || a.startsWith(k + ' ') || a.endsWith(' ' + k));
    const bIsIt = itAliases.some((k) => b === k || ` ${b} `.includes(` ${k} `) || b.startsWith(k + ' ') || b.endsWith(' ' + k));
    if (aIsIt && bIsIt) return true;

    const engAliases = ['engineering', 'rekayasa', 'teknik'];
    if (engAliases.some((k) => a.includes(k)) && engAliases.some((k) => b.includes(k))) return true;

    const prodAliases = ['produksi', 'production', 'manufaktur', 'manufacturing'];
    if (prodAliases.some((k) => a.includes(k)) && prodAliases.some((k) => b.includes(k))) return true;

    const qaAliases = ['quality', 'qa', 'qc', 'mutu'];
    if (qaAliases.some((k) => a.includes(k)) && qaAliases.some((k) => b.includes(k))) return true;

    const hseAliases = ['hse', 'k3', 'she', 'safety'];
    if (hseAliases.some((k) => a.includes(k)) && hseAliases.some((k) => b.includes(k))) return true;

    return a.includes(b) || b.includes(a);
  }

  // Permission Logic per Role & Departemen:
  // - Super Admin & HR: Berwenang penuh meloloskan, menolak, dan mengelola pelamar di SEMUA tahap seleksi (termasuk Tahap 3 & 5)
  // - User Dept: Berwenang di Tahap 3 (Tes Teknis) & 5 (Interview User) untuk pelamar yang melamar pada departemennya
  const canManageApplicant = (applicant: any) => {
    if (!adminSession) return true;
    if (adminSession.role === 'admin' || adminSession.role === 'hr') return true;

    const stageNum = applicant.currentStage;
    if (adminSession.role === 'user_dept') {
      if (![3, 5].includes(stageNum)) return false;

      // Wajib sesuai departemen yang dilamar (didukung normalisasi alias departemen)
      return isDeptMatch(adminSession.department, applicant.jobPosting?.department);
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

  // Dynamic Stage Action & Button Configuration (Labels, Colors, Icons, Tooltips)
  const getStageActionConfig = (currentStage: number, isAdminTakeover: boolean = false) => {
    const nextStage = currentStage + 1;
    const nextStageInfo = RECRUITMENT_STAGES.find((s) => s.number === nextStage);
    const nextShort = nextStageInfo?.shortName || `Tahap ${nextStage}`;

    if (isAdminTakeover) {
      return {
        label: `Ambil Alih ➔ T${nextStage}: ${nextShort}`,
        color: '#7C3AED',
        hoverColor: '#6D28D9',
        icon: <AdminIcon sx={{ fontSize: 16 }} />,
        tooltip: `Mode Super Admin: Ambil alih wewenang dan loloskan pelamar dari Tahap ${currentStage} ke Tahap ${nextStage} (${nextShort})`,
      };
    }

    switch (currentStage) {
      case 1:
        return {
          label: `Loloskan ke Tahap 2: Psikotes ➔`,
          color: '#059669',
          hoverColor: '#047857',
          icon: <PsychologyIcon sx={{ fontSize: 16 }} />,
          tooltip: `Validasi berkas administrasi dan loloskan ke Tahap 2 (Tes Psikotes Online)`,
        };
      case 2:
        return {
          label: `Loloskan ke Tahap 3: Tes Teknis ➔`,
          color: '#0284C7',
          hoverColor: '#0369A1',
          icon: <EngineeringIcon sx={{ fontSize: 16 }} />,
          tooltip: `Validasi hasil psikotes dan loloskan ke Tahap 3 (Ujian Teknis User Departemen)`,
        };
      case 3:
        return {
          label: `Loloskan ke Tahap 4: Interview HR ➔`,
          color: '#2563EB',
          hoverColor: '#1D4ED8',
          icon: <InterviewIcon sx={{ fontSize: 16 }} />,
          tooltip: `Validasi hasil tes teknis dan jadwalkan / loloskan ke Tahap 4 (Interview HR Recruitment)`,
        };
      case 4:
        return {
          label: `Loloskan ke Tahap 5: Interview User ➔`,
          color: '#7C3AED',
          hoverColor: '#6D28D9',
          icon: <InterviewIcon sx={{ fontSize: 16 }} />,
          tooltip: `Validasi hasil interview HR dan jadwalkan / loloskan ke Tahap 5 (Interview User Departemen)`,
        };
      case 5:
        return {
          label: `Loloskan ke Tahap 6: MCU ➔`,
          color: '#0D9488',
          hoverColor: '#0F766E',
          icon: <VerifiedIcon sx={{ fontSize: 16 }} />,
          tooltip: `Validasi hasil interview user dan terbitkan surat pengantar Tahap 6 (Medical Check-Up)`,
        };
      case 6:
        return {
          label: `Terbitkan Offering (Tahap 7) ➔`,
          color: '#D97706',
          hoverColor: '#B45309',
          icon: <ApproveIcon sx={{ fontSize: 16 }} />,
          tooltip: `Validasi hasil MCU dan terbitkan surat penawaran kerja resmi (Offering Letter & Kontrak)`,
        };
      default:
        return {
          label: `Loloskan ke Tahap ${nextStage} ➔`,
          color: '#018730',
          hoverColor: '#005c21',
          icon: <ApproveIcon sx={{ fontSize: 16 }} />,
          tooltip: `Loloskan pelamar ke Tahap ${nextStage}`,
        };
    }
  };

  // Stage Icon Helper
  const getStageIcon = (stageNum: number) => {
    switch (stageNum) {
      case 1: return <DocIcon sx={{ fontSize: 15 }} />;
      case 2: return <PsychologyIcon sx={{ fontSize: 15 }} />;
      case 3: return <EngineeringIcon sx={{ fontSize: 15 }} />;
      case 4: return <InterviewIcon sx={{ fontSize: 15 }} />;
      case 5: return <InterviewIcon sx={{ fontSize: 15 }} />;
      case 6: return <VerifiedIcon sx={{ fontSize: 15 }} />;
      case 7: return <WorkIcon sx={{ fontSize: 15 }} />;
      default: return <ApproveIcon sx={{ fontSize: 15 }} />;
    }
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

  // Comprehensive Test Review Extractor (Scores, Anti-cheat, MCQs, Profiling Traits, and Technical Essays)
  const getTestReviewDetails = (applicant: any, testType: 'psikotes' | 'user_test') => {
    if (!applicant) return null;
    const subs = applicant.testSubmissions || applicant.test_submissions || [];
    const sub = subs.find((s: any) => (s.testType || s.test_type) === testType);
    if (!sub) return null;

    let answersObj: Record<string, any> = {};
    if (sub.answers) {
      if (typeof sub.answers === 'string') {
        try {
          answersObj = JSON.parse(sub.answers);
        } catch {
          answersObj = {};
        }
      } else if (typeof sub.answers === 'object') {
        answersObj = sub.answers;
      }
    }

    const isSubmitted = Boolean(sub.submittedAt || sub.submitted_at || (sub.score !== null && sub.score !== undefined));
    const score = sub.score ?? null;
    const violationsCount = sub.violationsCount ?? sub.violations_count ?? 0;
    const isLocked = Boolean(sub.isLocked ?? sub.is_locked);
    const isPassed = sub.isPassed ?? sub.is_passed;
    const submittedAt = sub.submittedAt || sub.submitted_at;
    const startedAt = sub.startedAt || sub.started_at;

    const singleChoices: any[] = [];
    const profilingTraits: any[] = [];
    const essays: any[] = [];

    // Question order from questionSet if available
    let orderedQIds: number[] = [];
    const rawQSet = sub.questionSet || sub.question_set;
    if (rawQSet) {
      try {
        const parsed = typeof rawQSet === 'string' ? JSON.parse(rawQSet) : rawQSet;
        if (Array.isArray(parsed)) orderedQIds = parsed.map(Number);
      } catch {}
    }

    // Merge all keys from answersObj
    const answerKeys = Object.keys(answersObj).map(Number);
    answerKeys.forEach((id) => {
      if (!orderedQIds.includes(id)) orderedQIds.push(id);
    });

    orderedQIds.forEach((qId) => {
      const q = questionsMap[qId];
      const candidateAnswer = answersObj[String(qId)] ?? answersObj[qId];
      if (candidateAnswer === undefined && !q) return;

      let parsedOptions: string[] = [];
      if (q?.options) {
        if (Array.isArray(q.options)) {
          parsedOptions = q.options;
        } else if (typeof q.options === 'string') {
          try {
            parsedOptions = JSON.parse(q.options);
          } catch {}
        }
      }

      const qType = q?.questionType || q?.question_type || 'single_choice';

      if (qType === 'multi_choice') {
        const userChoices: string[] = Array.isArray(candidateAnswer) ? candidateAnswer : [candidateAnswer].filter(Boolean);
        const selectedTraits = userChoices.map((key) => {
          const charCode = typeof key === 'string' && key.length === 1 ? key.charCodeAt(0) - 65 : -1;
          return charCode >= 0 && parsedOptions[charCode] ? `${key}. ${parsedOptions[charCode]}` : key;
        });
        profilingTraits.push({
          qId,
          question: q?.question || `Pertanyaan Profiling #${qId}`,
          selectedTraits,
          rawChoices: userChoices,
        });
      } else if (qType === 'essay') {
        essays.push({
          qId,
          question: q?.question || `Soal Kasus / Uraian #${qId}`,
          essayText: typeof candidateAnswer === 'string' ? candidateAnswer : '',
          points: q?.points || 20,
        });
      } else {
        // single_choice
        const charCode = typeof candidateAnswer === 'string' && candidateAnswer.length === 1
          ? candidateAnswer.charCodeAt(0) - 65
          : -1;
        const candidateText = charCode >= 0 && parsedOptions[charCode]
          ? `${candidateAnswer}. ${parsedOptions[charCode]}`
          : String(candidateAnswer ?? '-');

        const correctKey = q?.correctKey || q?.correct_key;
        const correctCharCode = typeof correctKey === 'string' && correctKey.length === 1
          ? correctKey.charCodeAt(0) - 65
          : -1;
        const correctText = correctCharCode >= 0 && parsedOptions[correctCharCode]
          ? `${correctKey}. ${parsedOptions[correctCharCode]}`
          : String(correctKey ?? '-');

        const isCorrect = Boolean(candidateAnswer && correctKey && candidateAnswer === correctKey);

        singleChoices.push({
          qId,
          question: q?.question || `Soal Pilihan Ganda #${qId}`,
          imageUrl: q?.imageUrl || q?.image_url,
          candidateAnswer: candidateAnswer ?? null,
          candidateText,
          correctKey,
          correctText,
          isCorrect,
          points: q?.points || 10,
          allOptions: parsedOptions,
        });
      }
    });

    const correctCount = singleChoices.filter((s) => s.isCorrect).length;
    const wrongCount = singleChoices.filter((s) => !s.isCorrect && s.candidateAnswer !== null).length;

    return {
      sub,
      isSubmitted,
      score,
      violationsCount,
      isLocked,
      isPassed,
      submittedAt,
      startedAt,
      singleChoices,
      profilingTraits,
      essays,
      totalAnswered: answerKeys.length,
      correctCount,
      wrongCount,
    };
  };

  // Backward compatible helper for Profiling traits review
  const getProfilingReview = (applicant: any) => {
    const details = getTestReviewDetails(applicant, 'psikotes');
    return details?.profilingTraits || [];
  };

  // Backward compatible helper for Technical Essay review
  const getEssayReview = (applicant: any) => {
    const details = getTestReviewDetails(applicant, 'user_test');
    return details?.essays || [];
  };

  // Handle Advance Stage (1-Click Approve / Reject with Direct Interview Scheduling)
  const handleConfirmAdvance = async () => {
    if (!selectedApplicant) return;
    setProcessing(true);

    try {
      let resolvedLocation = advanceLocation;
      let resolvedMaps = advanceMapsInput;

      if (advanceAction === 'approve' && (selectedApplicant.currentStage === 3 || selectedApplicant.currentStage === 4)) {
        if (advanceInterviewMode === 'online') {
          resolvedLocation = `Online Video Conference (${advanceMeetingPlatform.toUpperCase()})`;
          resolvedMaps = '';
        } else {
          if (advancePlantChoice === 'giic') {
            resolvedLocation = `${PLANT_LOCATIONS.giic.address} - ${advanceRoom || 'Ruang Meeting'}`;
            resolvedMaps = advanceMapsInput.trim() ? getPlantMapsUrl(advanceMapsInput.trim()) : PLANT_LOCATIONS.giic.mapsUrl;
          } else if (advancePlantChoice === 'kiic') {
            resolvedLocation = `${PLANT_LOCATIONS.kiic.address} - ${advanceRoom || 'Ruang Meeting'}`;
            resolvedMaps = advanceMapsInput.trim() ? getPlantMapsUrl(advanceMapsInput.trim()) : PLANT_LOCATIONS.kiic.mapsUrl;
          } else {
            resolvedLocation = `${advanceCustomAddress || PLANT_LOCATIONS.kiic.address} - ${advanceRoom || 'Ruang Meeting'}`;
            resolvedMaps = advanceMapsInput.trim() ? getPlantMapsUrl(advanceMapsInput.trim()) : getPlantMapsUrl(resolvedLocation);
          }
        }
      } else if (advanceAction === 'approve') {
        if (advanceMapsInput.trim()) {
          resolvedMaps = getPlantMapsUrl(advanceMapsInput.trim()) || advanceMapsInput.trim();
        } else if (resolvedLocation) {
          resolvedMaps = getPlantMapsUrl(resolvedLocation);
        }
      }

      const res = await fetch('/api/admin/advance-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: selectedApplicant.id,
          action: isEditingOfferingOnly ? 'update_offering' : advanceAction,
          notes: advanceNotes,
          scheduledAt: advanceSchedule || undefined,
          scheduledUntil: advanceScheduleUntil || undefined,
          durationMinutes: advanceDuration || undefined,
          location: resolvedLocation || undefined,
          mapsUrl: resolvedMaps || undefined,
          token: advanceToken || undefined,
          salaryOffer: advanceSalary.trim()
            ? `Rp ${advanceSalary.trim()}${advanceAllowance.trim() ? ` ${advanceAllowance.trim().startsWith('+') ? advanceAllowance.trim() : `+ ${advanceAllowance.trim()}`}` : ''}`
            : undefined,
          offeringAttachment: advanceOfferingFile ? advanceOfferingFile.base64 : undefined,
          offeringRefNumber: advanceOfferingRefNum.trim() || undefined,
          offeringJoinDate: advanceOfferingJoinDate.trim() || undefined,
          offeringClauses: advanceOfferingClauses.trim() || undefined,
          offeringSignerName: advanceOfferingSignerName.trim() || undefined,
          offeringSignerTitle: advanceOfferingSignerTitle.trim() || undefined,
          offeringSignerSignature: advanceOfferingSignature.trim() || undefined,
          meetingPlatform:
            advanceAction === 'approve' && (selectedApplicant.currentStage === 3 || selectedApplicant.currentStage === 4) && advanceInterviewMode === 'online'
              ? advanceMeetingPlatform
              : undefined,
          meetingLink:
            advanceAction === 'approve' && (selectedApplicant.currentStage === 3 || selectedApplicant.currentStage === 4) && advanceInterviewMode === 'online'
              ? advanceMeetingLink
              : undefined,
          meetingPasscode:
            advanceAction === 'approve' && (selectedApplicant.currentStage === 3 || selectedApplicant.currentStage === 4) && advanceInterviewMode === 'online'
              ? advanceMeetingPasscode
              : undefined,
          interviewerName:
            advanceAction === 'approve' && (selectedApplicant.currentStage === 3 || selectedApplicant.currentStage === 4)
              ? advanceInterviewerName || adminSession?.name || undefined
              : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const currentShort = RECRUITMENT_STAGES.find((s) => s.number === selectedApplicant.currentStage)?.shortName || `Tahap ${selectedApplicant.currentStage}`;
      const nextShort = RECRUITMENT_STAGES.find((s) => s.number === selectedApplicant.currentStage + 1)?.shortName || `Tahap ${selectedApplicant.currentStage + 1}`;

      setFeedbackMessage(
        isEditingOfferingOnly
          ? `✓ Berhasil! Format surat resmi dan Tanda Tangan Digital Offering Letter untuk ${selectedApplicant.fullName} telah tersimpan dan siap diunduh.`
          : advanceAction === 'approve'
          ? (data.emailSent === false
              ? `✓ Berhasil! ${selectedApplicant.fullName} telah lolos Tahap ${selectedApplicant.currentStage} (${currentShort}) dan resmi masuk ke Tahap ${selectedApplicant.currentStage + 1} (${nextShort}). (Catatan: Pengiriman email tertunda: ${data.emailError || 'kesalahan SMTP'}. Gunakan ikon amplop di tabel untuk kirim ulang).`
              : `✓ Berhasil! ${selectedApplicant.fullName} telah resmi diloloskan dari Tahap ${selectedApplicant.currentStage} (${currentShort}) ke Tahap ${selectedApplicant.currentStage + 1} (${nextShort}). Email notifikasi resmi telah otomatis terkirim ke peserta.`)
          : `${data.message} (Email notifikasi penolakan telah terkirim ke email peserta).`
      );
      setAdvanceModalOpen(false);
      fetchApplicants();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Helper compute employee ID: {sequence}.{MM}.{YY} (e.g. 1530.09.26)
  const computeEmployeeId = (seq: number, dateStr: string) => {
    let monthStr = '01';
    let yearStr = '26';
    if (dateStr) {
      const parts = dateStr.split('-');
      if (parts.length >= 3) {
        yearStr = parts[0].slice(-2);
        monthStr = parts[1].padStart(2, '0');
      } else {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          monthStr = String(d.getMonth() + 1).padStart(2, '0');
          yearStr = String(d.getFullYear()).slice(-2);
        }
      }
    } else {
      const now = new Date();
      monthStr = String(now.getMonth() + 1).padStart(2, '0');
      yearStr = String(now.getFullYear()).slice(-2);
    }
    return `${seq}.${monthStr}.${yearStr}`;
  };

  // Open Hire Contract Modal
  const handleOpenHireContractModal = async (applicant: any) => {
    setHiringApplicant(applicant);
    setHireFeedback(null);

    // Initial Join Date dari offering letter jika ada, atau default hari ini
    const initialJoinDate = applicant.offeringJoinDate || applicant.offering_join_date || new Date().toISOString().split('T')[0];
    setHireStartDate(initialJoinDate);

    // Default End Date (1 tahun berikutnya minus 1 hari untuk PKWT)
    try {
      const joinD = new Date(initialJoinDate);
      const endD = new Date(joinD);
      endD.setFullYear(endD.getFullYear() + 1);
      endD.setDate(endD.getDate() - 1);
      setHireEndDate(!isNaN(endD.getTime()) ? endD.toISOString().split('T')[0] : '');
    } catch {
      setHireEndDate('');
    }

    setHireContractStatus('PKWT');
    setHireDepartment(applicant.jobPosting?.department || '');
    setHireJobTitle(applicant.jobPosting?.title || '');
    setHireWorkLocation(applicant.jobPosting?.location || 'Plant 1 KIIC Karawang');
    setHireSalary(applicant.offeringSalary || '');
    setHireNotes(`Pengangkatan resmi via Portal Karir ATS tanggal ${new Date().toLocaleDateString('id-ID')}`);

    // Fetch next sequence from API
    try {
      const res = await fetch(`/api/admin/employees/sequence?join_date=${initialJoinDate}`);
      const data = await res.json();
      if (data && data.success) {
        setHireLastSequence(data.last_sequence || 0);
        setHireSequenceNumber(data.next_sequence || 1);
        setHirePreviewId(data.preview_employee_id || computeEmployeeId(data.next_sequence || 1, initialJoinDate));
      } else {
        setHirePreviewId(computeEmployeeId(1, initialJoinDate));
      }
    } catch (err) {
      console.error('Error fetching sequence:', err);
      setHirePreviewId(computeEmployeeId(1, initialJoinDate));
    }

    setHireContractModalOpen(true);
  };

  // Update preview ID whenever sequence or join date changes
  const handleHireDateOrSeqChange = (newSeq: number, newDate: string) => {
    setHireSequenceNumber(newSeq);
    setHireStartDate(newDate);
    setHirePreviewId(computeEmployeeId(newSeq, newDate));
  };

  // Submit Konfirmasi Pengangkatan Karyawan Resmi
  const handleConfirmHireContract = async () => {
    if (!hiringApplicant) return;
    if (!hireStartDate) {
      alert('Please specify the Contract Start Date (Join Date).');
      return;
    }
    if (!hireSequenceNumber || Number(hireSequenceNumber) < 1) {
      alert('Nomor urut ID karyawan harus berupa angka positif.');
      return;
    }

    setSubmittingHire(true);
    setHireFeedback(null);
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: hiringApplicant.id,
          join_date: hireStartDate,
          contract_end_date: hireEndDate || null,
          sequence_number: Number(hireSequenceNumber),
          contract_status: hireContractStatus,
          department: hireDepartment,
          job_title: hireJobTitle,
          work_location: hireWorkLocation,
          agreed_salary: hireSalary,
          notes: hireNotes,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setFeedbackMessage(
          `✓ Selamat! ${hiringApplicant.fullName} resmi diangkat menjadi Karyawan PT ITSP dengan Nomor ID: ${
            result.employee_id || hirePreviewId
          }. Seluruh 68 kolom data diri, berkas dan riwayat pelamar telah otomatis masuk ke Data Karyawan.`
        );
        setHireContractModalOpen(false);
        fetchApplicants(false);
      } else {
        setHireFeedback({
          type: 'error',
          message: result.detail || result.error || 'Failed to save employee data. Please try again.',
        });
      }
    } catch (err: any) {
      console.error('Hire contract submit error:', err);
      setHireFeedback({
        type: 'error',
        message: err.message || 'A system error occurred while processing employee onboarding.',
      });
    } finally {
      setSubmittingHire(false);
    }
  };

  // Handle Super Admin Manual Stage Override (Maju / Mundurkan Tahap Manual)
  const handleConfirmOverrideStage = async () => {
    if (!selectedApplicant) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/admin/advance-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: selectedApplicant.id,
          action: 'override_stage',
          targetStage: Number(overrideTargetStage),
          stageStatus: overrideStageStatus,
          notes: overrideNotes || undefined,
          sendEmail: Boolean(overrideSendEmail),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedbackMessage(
        overrideSendEmail
          ? `${data.message} (Email notifikasi telah dikirim ke kandidat).`
          : `${data.message} (Perubahan tahap internal tanpa pengiriman email).`
      );
      setOverrideModalOpen(false);
      fetchApplicants();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Handle Resend Stage Email (recovery bila email kelolosan tidak diterima kandidat)
  const handleResendEmail = async (applicant: any) => {
    const stageLabel = RECRUITMENT_STAGES.find((s) => s.number === applicant.currentStage)?.shortName || `Tahap ${applicant.currentStage}`;
    if (!confirm(`Kirim ulang email notifikasi ${stageLabel} ke ${applicant.email}?`)) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId: applicant.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend email.');
      setFeedbackMessage(data.message);
      alert(data.message);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Handle Update Test Session (Reschedule / Relocate / Retoken for Stages 2 & 3)
  const handleConfirmTestSession = async () => {
    if (!selectedApplicant) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/admin/advance-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: selectedApplicant.id,
          action: 'update_test_session',
          scheduledAt: testSessionDate || undefined,
          scheduledUntil: testSessionUntil || undefined,
          durationMinutes: testSessionDuration || undefined,
          location: testSessionLocation || undefined,
          mapsUrl: getPlantMapsUrl(testSessionLocation) || undefined,
          token: testSessionToken || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedbackMessage(data.message || 'Jadwal dan sesi ujian berhasil disimpan.');
      setTestSessionModalOpen(false);
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
      alert('Please select interview date and time.');
      return;
    }

    setProcessing(true);
    try {
      let resolvedAddress = PLANT_LOCATIONS.kiic.address;
      let resolvedMaps = PLANT_LOCATIONS.kiic.mapsUrl;

      if (locationMode === 'onsite') {
        if (interviewPlantChoice === 'giic') {
          resolvedAddress = PLANT_LOCATIONS.giic.address;
          resolvedMaps = PLANT_LOCATIONS.giic.mapsUrl;
        } else if (interviewPlantChoice === 'custom') {
          resolvedAddress = interviewCustomAddress.trim() || PLANT_LOCATIONS.kiic.address;
          resolvedMaps = interviewMapsInput.trim() ? getPlantMapsUrl(interviewMapsInput.trim()) : getPlantMapsUrl(resolvedAddress);
        }

        if (interviewMapsInput.trim()) {
          resolvedMaps = getPlantMapsUrl(interviewMapsInput.trim()) || resolvedMaps;
        }
      }

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
          locationAddress: locationMode === 'onsite' ? resolvedAddress : undefined,
          mapsUrl: locationMode === 'onsite' ? resolvedMaps : undefined,
          roomName: locationMode === 'onsite' ? interviewRoom : undefined,
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

  // Handle Run Database Cleanup
  const handleRunCleanup = async () => {
    setCleaningUp(true);
    setCleanupFeedback(null);
    try {
      const res = await fetch('/api/admin/applicants/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: cleanupMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses pembersihan');
      setCleanupFeedback(data.message);
      fetchApplicants();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCleaningUp(false);
    }
  };

  const currentProfilingReview = getProfilingReview(selectedApplicant);
  const currentEssayReview = getEssayReview(selectedApplicant);
  const currentPsikoReview = getTestReviewDetails(selectedApplicant, 'psikotes');
  const currentUserReview = getTestReviewDetails(selectedApplicant, 'user_test');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Manajemen Pelamar & Alur 7 Tahap Seleksi
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Evaluasi berkas CV, tinjau hasil psikotes & essay teknis, dan lakukan 1-Klik Kelolosan dengan pesan resmi otomatis.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              bgcolor: isTabActive ? '#F0FDF4' : '#F8FAFC',
              border: `1px solid ${isTabActive ? '#BBF7D0' : '#E2E8F0'}`,
              borderRadius: 2,
              px: 1.5,
              py: 0.7,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: isTabActive ? '#22C55E' : '#94A3B8',
                boxShadow: isTabActive ? '0 0 8px rgba(34, 197, 94, 0.6)' : 'none',
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 700, color: isTabActive ? '#15803D' : '#64748B' }}>
              {isTabActive ? 'Sinkron Realtime (Live)' : 'Siaga'}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => fetchApplicants(false)}
            startIcon={<RefreshIcon />}
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2, borderColor: '#CBD5E1', color: '#334155' }}
          >
            Segarkan
          </Button>

          {(adminSession?.role === 'admin' || adminSession?.role === 'hr') && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<DeleteSweepIcon />}
              onClick={() => {
                setCleanupFeedback(null);
                setCleanupModalOpen(true);
              }}
              sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
            >
              Bersihkan Kedaluwarsa (&gt; 30 Hari)
            </Button>
          )}
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
      <TableContainer component={Paper} sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', overflowX: 'auto' }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#018730' }} />
          </Box>
        ) : (
          <>
            <Table sx={{ minWidth: 850 }}>
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
                applicants.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((a) => {
                  const stage = RECRUITMENT_STAGES.find((s) => s.number === a.currentStage);
                  const isFailed = a.stageStatus === 'failed';
                  const psikotesSub = a.testSubmissions?.find((s: any) => s.testType === 'psikotes' || s.test_type === 'psikotes');
                  const userTestSub = a.testSubmissions?.find((s: any) => s.testType === 'user_test' || s.test_type === 'user_test');

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

                      <TableCell sx={{ minWidth: 200 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                          <Chip
                            icon={getStageIcon(a.currentStage)}
                            label={`Tahap ${a.currentStage}: ${stage?.shortName || ''}`}
                            size="small"
                            sx={{
                              bgcolor: isFailed ? '#FEE2E2' : a.currentStage === 7 ? '#FEF3C7' : '#DCFCE7',
                              color: isFailed ? '#991B1B' : a.currentStage === 7 ? '#B45309' : '#166534',
                              fontWeight: 800,
                              fontSize: 12,
                              '& .MuiChip-icon': {
                                color: isFailed ? '#991B1B' : a.currentStage === 7 ? '#B45309' : '#166534',
                              },
                            }}
                          />
                        </Box>

                        {/* 7-Segment Visual Micro-Stepper Bar */}
                        <Box sx={{ mb: 0.8 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', mb: 0.4 }}>
                            {RECRUITMENT_STAGES.map((s) => {
                              const isCompleted = s.number < a.currentStage;
                              const isCurrent = s.number === a.currentStage;
                              return (
                                <Tooltip
                                  key={s.number}
                                  title={`Tahap ${s.number}: ${s.shortName} (${isCompleted ? '✓ Selesai' : isCurrent ? (isFailed ? 'Gagal' : 'Sedang Berjalan') : 'Belum Mulai'})`}
                                  arrow
                                >
                                  <Box
                                    sx={{
                                      flex: isCurrent ? 2 : 1,
                                      height: isCurrent ? 7 : 5,
                                      borderRadius: 4,
                                      transition: 'all 0.2s',
                                      bgcolor: isCompleted
                                        ? '#10B981'
                                        : isCurrent
                                        ? isFailed
                                          ? '#EF4444'
                                          : '#2563EB'
                                        : '#CBD5E1',
                                      boxShadow: isCurrent && !isFailed ? '0 0 6px rgba(37,99,235,0.4)' : 'none',
                                    }}
                                  />
                                </Tooltip>
                              );
                            })}
                          </Box>
                          <Typography variant="caption" sx={{ display: 'block', color: '#64748B', fontSize: 10.5, fontWeight: 600 }}>
                            {isFailed ? (
                              <span style={{ color: '#DC2626' }}>Terhenti di Tahap {a.currentStage} dari 7</span>
                            ) : (
                              <span>Langkah <strong>{a.currentStage}</strong> dari 7 ({Math.round((a.currentStage / 7) * 100)}%)</span>
                            )}
                          </Typography>
                        </Box>

                        <Typography variant="caption" sx={{ display: 'block', color: stageOwner.color, fontWeight: 700, fontSize: 11 }}>
                          {stageOwner.label}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ minWidth: 220 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                            Status:
                          </Typography>
                          <Chip
                            size="small"
                            label={a.stageStatus.toUpperCase()}
                            sx={{
                              height: 20,
                              fontSize: 10,
                              fontWeight: 800,
                              bgcolor: isFailed
                                ? '#FEE2E2'
                                : a.stageStatus === 'passed'
                                ? '#DCFCE7'
                                : '#E0F2FE',
                              color: isFailed
                                ? '#991B1B'
                                : a.stageStatus === 'passed'
                                ? '#166534'
                                : '#0369A1',
                            }}
                          />
                        </Box>

                        {/* Stage 2 & 3: Test Session details */}
                        {((a.currentStage === 2 && !isFailed) || (a.currentStage === 3 && !isFailed)) && (
                          <Box sx={{ mt: 0.8, p: 1, bgcolor: a.currentStage === 2 ? '#F0F9FF' : '#FFFBEB', borderRadius: 1.5, border: `1px solid ${a.currentStage === 2 ? '#BAE6FD' : '#FDE68A'}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                              <Chip
                                icon={<KeyIcon sx={{ fontSize: '13px !important' }} />}
                                label={`Token: ${a.currentStage === 2 ? (a.psikotesToken || 'PSIKO2026') : (a.userTestToken || 'USER2026')}`}
                                size="small"
                                onClick={() => {
                                  const t = a.currentStage === 2 ? (a.psikotesToken || 'PSIKO2026') : (a.userTestToken || 'USER2026');
                                  navigator.clipboard.writeText(t);
                                  alert(`Token Ujian [${t}] berhasil disalin ke clipboard!`);
                                }}
                                title="Klik untuk menyalin token ujian"
                                sx={{
                                  bgcolor: a.currentStage === 2 ? '#E0F2FE' : '#FEF3C7',
                                  color: a.currentStage === 2 ? '#0369A1' : '#92400E',
                                  fontWeight: 700,
                                  fontSize: 11,
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: a.currentStage === 2 ? '#BAE6FD' : '#FDE68A' },
                                }}
                              />
                              {(canManage || adminSession?.role === 'admin' || adminSession?.role === 'hr') && (
                                <Tooltip title={adminSession?.role === 'admin' && !canManage ? "Mode Super Admin: Ambil Alih & Atur Sesi Ujian" : "Atur / Ubah Jadwal, Batas Waktu & Token Ujian"}>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedApplicant(a);
                                      const sched = a.currentStage === 2 ? a.psikotesScheduledAt : a.userTestScheduledAt;
                                      const dur = (a.currentStage === 2 ? a.psikotesDurationMinutes : a.userTestDurationMinutes) || 60;
                                      const dateStr = sched ? formatToLocalDateTimeInput(sched) : '';
                                      setTestSessionDate(dateStr);
                                      setTestSessionDuration(dur);
                                      if (sched) {
                                        const untilDate = new Date(new Date(sched).getTime() + dur * 60000);
                                        setTestSessionUntil(formatToLocalDateTimeInput(untilDate));
                                      } else {
                                        setTestSessionUntil('');
                                      }
                                      setTestSessionLocation(
                                        (a.currentStage === 2 ? a.psikotesLocation : a.userTestLocation) || 'Portal Karir Online PT ITSP'
                                      );
                                      setTestSessionToken(
                                        (a.currentStage === 2 ? a.psikotesToken : a.userTestToken) ||
                                        (a.currentStage === 2 ? 'PSIKO2026' : 'USER2026')
                                      );
                                      setTestSessionModalOpen(true);
                                    }}
                                    sx={{ p: 0.3, color: adminSession?.role === 'admin' && !canManage ? '#7C3AED' : a.currentStage === 2 ? '#0284C7' : '#D97706' }}
                                  >
                                    <ScheduleIcon sx={{ fontSize: 17 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', color: '#475569', fontSize: 11, mt: 0.3 }}>
                              📅 <strong>Mulai:</strong> {
                                (a.currentStage === 2 ? a.psikotesScheduledAt : a.userTestScheduledAt)
                                  ? new Date(a.currentStage === 2 ? a.psikotesScheduledAt : a.userTestScheduledAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB'
                                  : 'Terbuka / Sesuai Portal'
                              }
                            </Typography>
                            {(a.currentStage === 2 ? a.psikotesScheduledAt : a.userTestScheduledAt) && (
                              <Typography variant="caption" sx={{ display: 'block', color: '#DC2626', fontSize: 11 }}>
                                ⏳ <strong>Batas Akhir:</strong> {
                                  new Date(new Date(a.currentStage === 2 ? a.psikotesScheduledAt : a.userTestScheduledAt).getTime() + ((a.currentStage === 2 ? a.psikotesDurationMinutes : a.userTestDurationMinutes) || 60) * 60000).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                                } WIB (Durasi: {((a.currentStage === 2 ? a.psikotesDurationMinutes : a.userTestDurationMinutes) || 60)} mnt)
                              </Typography>
                            )}
                            <Typography variant="caption" sx={{ display: 'block', color: '#475569', fontSize: 11 }}>
                              📍 <strong>Tempat:</strong> {(a.currentStage === 2 ? a.psikotesLocation : a.userTestLocation) || 'Portal Karir Online PT ITSP'}
                            </Typography>
                          </Box>
                        )}
                        {psikotesSub && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 600 }}>
                              Psiko: Skor {psikotesSub.score ?? 0}/100 ({psikotesSub.submittedAt || psikotesSub.submitted_at ? 'Submitted' : 'Aktif'})
                              {(psikotesSub.isLocked || psikotesSub.is_locked) && ' (TERKUNCI)'}
                            </Typography>
                            {(canManage || adminSession?.role === 'admin' || adminSession?.role === 'hr') && (
                              <Tooltip title="Reset Ujian Psikotes (Buka Kunci / Izinkan Ujian Ulang bila terjadi kendala teknis)">
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
                              Teknis: Skor {userTestSub.score ?? 0}/100 ({userTestSub.submittedAt || userTestSub.submitted_at ? 'Submitted' : 'Aktif'})
                              {(userTestSub.isLocked || userTestSub.is_locked) && ' (TERKUNCI)'}
                            </Typography>
                            {(canManage || adminSession?.role === 'admin' || adminSession?.role === 'hr') && (
                              <Tooltip title="Reset Ujian Teknis Departemen (Buka Kunci / Izinkan Ujian Ulang bila terjadi kendala teknis)">
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

                        {/* Stage 4: Interview HR details */}
                        {a.currentStage === 4 && !isFailed && (
                          <Box sx={{ mt: 0.8, p: 1, bgcolor: '#EFF6FF', borderRadius: 1.5, border: '1px solid #BFDBFE' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                              <Typography variant="caption" sx={{ color: '#1E40AF', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <InterviewIcon sx={{ fontSize: 14 }} /> Sesi Interview HR
                              </Typography>
                              {(canManage || adminSession?.role === 'admin') && (
                                <Tooltip title="Atur / Jadwalkan Ulang Interview HR">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedApplicant(a);
                                      setInterviewType('hr');
                                      const isCikarang = a.jobPosting?.location?.toLowerCase().includes('cikarang');
                                      setInterviewPlantChoice(isCikarang ? 'giic' : 'kiic');
                                      setInterviewRoom('Ruang Meeting HCM Lt. 2 (Gedung Admin)');
                                      setInterviewMapsInput('');
                                      setInterviewModalOpen(true);
                                    }}
                                    sx={{ p: 0.2, color: '#2563EB' }}
                                  >
                                    <ScheduleIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', color: '#334155', fontSize: 11 }}>
                              Siap dijadwalkan wawancara kepribadian & budaya kerja oleh Tim HR.
                            </Typography>
                          </Box>
                        )}

                        {/* Stage 5: Interview User details */}
                        {a.currentStage === 5 && !isFailed && (
                          <Box sx={{ mt: 0.8, p: 1, bgcolor: '#FFFBEB', borderRadius: 1.5, border: '1px solid #FDE68A' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                              <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <InterviewIcon sx={{ fontSize: 14 }} /> Sesi Interview User Dept
                              </Typography>
                              {(canManage || adminSession?.role === 'admin') && (
                                <Tooltip title="Atur / Jadwalkan Ulang Interview User">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedApplicant(a);
                                      setInterviewType('user');
                                      const isCikarang = a.jobPosting?.location?.toLowerCase().includes('cikarang');
                                      setInterviewPlantChoice(isCikarang ? 'giic' : 'kiic');
                                      setInterviewRoom(`Ruang Meeting Teknis Divisi ${a.jobPosting?.department || 'Terkait'}`);
                                      setInterviewMapsInput('');
                                      setInterviewModalOpen(true);
                                    }}
                                    sx={{ p: 0.2, color: '#D97706' }}
                                  >
                                    <ScheduleIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', color: '#334155', fontSize: 11 }}>
                              Wawancara teknis mendalam bersama Supervisor/Manager {a.jobPosting?.department || ''}.
                            </Typography>
                          </Box>
                        )}

                        {/* Stage 6: MCU details */}
                        {a.currentStage === 6 && !isFailed && (
                          <Box sx={{ mt: 0.8, p: 1, bgcolor: '#F0FDFA', borderRadius: 1.5, border: '1px solid #99F6E4' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                              <Typography variant="caption" sx={{ color: '#0F766E', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <VerifiedIcon sx={{ fontSize: 14 }} /> Medical Check-Up (MCU)
                              </Typography>
                              {(canManage || adminSession?.role === 'admin' || adminSession?.role === 'hr') && (
                                <Tooltip title="Buka Pengaturan Fasilitas Klinik & Peta MCU">
                                  <IconButton
                                    size="small"
                                    href="/admin/settings"
                                    target="_blank"
                                    sx={{ p: 0.2, color: '#0D9488' }}
                                  >
                                    <TuneIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', color: '#334155', fontSize: 11, mt: 0.3 }}>
                              {a.mcuNotes ? `Catatan: ${a.mcuNotes}` : 'Pemeriksaan fisik di RS/Klinik Rekanan Resmi PT ITSP.'}
                            </Typography>
                          </Box>
                        )}

                        {/* Stage 7: Offering details */}
                        {a.currentStage === 7 && !isFailed && (
                          <Box sx={{ mt: 0.8, p: 1, bgcolor: '#ECFDF5', borderRadius: 1.5, border: '1px solid #A7F3D0' }}>
                            <Typography variant="caption" sx={{ color: '#047857', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <WorkIcon sx={{ fontSize: 14 }} /> Offering Letter & Kontrak
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: '#334155', fontSize: 11, mt: 0.3 }}>
                              Status: <strong>{a.offeringStatus === 'accepted' ? '✓ Kontrak Telah Disetujui' : 'Menunggu TTD Calon Karyawan'}</strong>
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.8, mt: 0.6, flexWrap: 'wrap' }}>
                              <Chip
                                size="small"
                                icon={<DocIcon sx={{ fontSize: '13px !important' }} />}
                                label="Surat Resmi (Offering)"
                                onClick={() => {
                                  const html = generateOfferingLetterHtml({
                                    candidateName: a.fullName,
                                    candidateId: a.id,
                                    position: a.jobPosting?.title || 'Staff',
                                    department: a.jobPosting?.department || 'Operasional',
                                    location: a.jobPosting?.location || 'Plant PT ITSP Karawang',
                                    salary: a.offeringSalary || 'Sesuai Standar Kompensasi PT ITSP',
                                    joinDate: a.offeringJoinDate,
                                    refNumber: a.offeringRefNumber,
                                    clauses: a.offeringClauses,
                                    notes: a.offeringLetter,
                                    signerName: a.offeringSignerName,
                                    signerTitle: a.offeringSignerTitle,
                                    signerSignature: a.offeringSignerSignature,
                                    candidateSignature: a.signedContractFile,
                                    signedAt: a.contractSignedAt ? new Date(a.contractSignedAt).toLocaleDateString('id-ID') : undefined,
                                  });
                                  openOfferingLetterWindow(html, false);
                                }}
                                sx={{ height: 20, fontSize: 10, bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, cursor: 'pointer' }}
                              />
                              {Boolean(a.offeringAttachment || a.offering_attachment) && (
                                <Chip
                                  size="small"
                                  icon={<PdfIcon sx={{ fontSize: '13px !important' }} />}
                                  label="PDF Lampiran"
                                  onClick={() => {
                                    const pdfData = a.offeringAttachment || a.offering_attachment;
                                    const w = window.open('');
                                    w?.document.write(`<iframe src="${pdfData}" style="width:100%;height:100%;border:none;"></iframe>`);
                                  }}
                                  sx={{ height: 20, fontSize: 10, bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 700, cursor: 'pointer' }}
                                />
                              )}
                              {Boolean(a.signedContractFile || a.signed_contract_file) && (
                                <Chip
                                  size="small"
                                  icon={<CheckIcon sx={{ fontSize: '13px !important', color: '#15803D !important' }} />}
                                  label="PDF Bertanda Tangan"
                                  onClick={() => {
                                    const pdfData = a.signedContractFile || a.signed_contract_file;
                                    const w = window.open('');
                                    w?.document.write(`<iframe src="${pdfData}" style="width:100%;height:100%;border:none;"></iframe>`);
                                  }}
                                  sx={{ height: 20, fontSize: 10, bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 800, cursor: 'pointer' }}
                                />
                              )}
                            </Box>
                          </Box>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {(() => {
                          const isHiredEmployee = Boolean(
                            a.isEmployee ||
                            a.is_employee ||
                            a.stageStatus === 'hired' ||
                            a.stage_status === 'hired' ||
                            a.employeeId ||
                            a.employee_id
                          );
                          const employeeIdDisplay = a.employeeId || a.employee_id || '';

                          if (isHiredEmployee) {
                            return (
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5, flexWrap: 'nowrap' }}>
                                <Box
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    bgcolor: '#ECFDF5',
                                    border: '1.5px solid #10B981',
                                    borderRadius: 2,
                                    px: 1.5,
                                    py: 0.6,
                                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)',
                                  }}
                                >
                                  <BadgeIcon sx={{ color: '#059669', fontSize: 20 }} />
                                  <Box sx={{ textAlign: 'left' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#065F46', display: 'block', lineHeight: 1.1, fontSize: 10.5 }}>
                                      Karyawan Resmi PT ITSP
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#047857', fontFamily: 'monospace', fontSize: 12.5, letterSpacing: '0.5px' }}>
                                      ID: {employeeIdDisplay || '-'}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Button
                                  size="small"
                                  component={Link}
                                  href="/admin/employees"
                                  variant="contained"
                                  startIcon={<HowToRegIcon sx={{ fontSize: 16 }} />}
                                  sx={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    textTransform: 'none',
                                    bgcolor: '#059669',
                                    color: '#FFFFFF',
                                    borderRadius: 2,
                                    px: 1.5,
                                    py: 0.6,
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
                                    '&:hover': {
                                      bgcolor: '#047857',
                                    },
                                  }}
                                >
                                  Data Karyawan
                                </Button>

                                <Tooltip title="Lihat Berkas Lengkap & Arsip Pendaftaran Pelamar">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedApplicant(a);
                                      setDetailTab(0);
                                      setDetailModalOpen(true);
                                    }}
                                    sx={{ color: '#3B82F6' }}
                                  >
                                    <ViewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            );
                          }

                          return (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                          {/* View Detail & CV */}
                          <Tooltip title="Lihat Berkas Lengkap Pelamar, 11 Dokumen & Riwayat Evaluasi">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedApplicant(a);
                                setDetailTab(0);
                                setDetailModalOpen(true);
                              }}
                              sx={{ color: '#3B82F6' }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>

                          {/* 1-Click Action to Next Stage with Dynamic Label & Target */}
                          {!isFailed && a.currentStage < 7 && (() => {
                            const isTakeover = adminSession?.role === 'admin' && !canManage;
                            const actionConfig = getStageActionConfig(a.currentStage, isTakeover);

                            if (canManage || adminSession?.role === 'admin') {
                              return (
                                <Tooltip title={actionConfig.tooltip} arrow>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    className="notranslate"
                                    translate="no"
                                    startIcon={actionConfig.icon}
                                    onClick={() => {
                                      setSelectedApplicant(a);
                                      setAdvanceAction('approve');
                                      setAdvanceNotes(generateDefaultAdvanceMessage(a, a.currentStage + 1));
                                      const defaultDate = new Date();
                                      if (a.currentStage >= 3) {
                                        defaultDate.setDate(defaultDate.getDate() + 1);
                                        defaultDate.setHours(9, 0, 0, 0);
                                      }
                                      setAdvanceSchedule(formatToLocalDateTimeInput(defaultDate));
                                      setAdvanceScheduleUntil(formatToLocalDateTimeInput(new Date(defaultDate.getTime() + 60 * 60000)));
                                      setAdvanceDuration(60);
                                      setAdvanceInterviewMode('online');
                                      setAdvanceMeetingPlatform('teams');
                                      setAdvanceMeetingLink('');
                                      setAdvanceMeetingPasscode('');
                                      setAdvanceInterviewerName(adminSession?.name || '');
                                      setAdvanceRoom(a.currentStage === 3 ? 'Ruang Meeting HCM Lt. 2 (Gedung Admin)' : `Ruang Meeting Divisi ${a.jobPosting?.department || 'Terkait'}`);
                                      const isCikarang = a.jobPosting?.location?.toLowerCase().includes('cikarang');
                                      setAdvancePlantChoice(isCikarang ? 'giic' : 'kiic');
                                      setAdvanceCustomAddress('');
                                      setAdvanceLocation(
                                        a.currentStage === 1
                                          ? 'Portal Karir Online PT ITSP'
                                          : a.currentStage === 2
                                          ? 'Workshop Mold & Die Plant 1 KIIC'
                                          : 'Online Video Conference (TEAMS)'
                                      );
                                      setAdvanceMapsInput('');
                                      setAdvanceToken(a.currentStage === 1 ? 'PSIKO2026' : a.currentStage === 2 ? 'USER2026' : 'ITSP2026');
                                      // Inisialisasi format surat offering & tanda tangan digital
                                      const curYear = new Date().getFullYear();
                                      setAdvanceOfferingRefNum(a.offeringRefNumber || `ITSP/HRD-REC/OL/${curYear}/${String(a.id).padStart(4, '0')}`);
                                      setAdvanceOfferingJoinDate(a.offeringJoinDate || '');
                                      setAdvanceOfferingClauses(a.offeringClauses || DEFAULT_OFFERING_CLAUSES);
                                      setAdvanceOfferingSignerName(a.offeringSignerName || adminSession?.name || 'Budi Santoso, S.Psi.');
                                      setAdvanceOfferingSignerTitle(a.offeringSignerTitle || 'Human Capital & Recruitment Manager');
                                      setAdvanceOfferingSignature(a.offeringSignerSignature || '');
                                      setAdvanceOfferingSignMode('draw');
                                      setIsEditingOfferingOnly(false);

                                      // Parse salary and allowance if existing
                                      const salStr = a.offeringSalary || '';
                                      const match = salStr.match(/Rp\.?\s*([\d\.]+)/i);
                                      setAdvanceSalary(match ? match[1] : (salStr ? salStr.replace(/\D/g, '') : ''));
                                      setAdvanceAllowance(salStr.includes('+') ? salStr.substring(salStr.indexOf('+')).trim() : '');
                                      setAdvanceOfferingFile(null);
                                      setAdvanceModalOpen(true);
                                    }}
                                    sx={{
                                      bgcolor: actionConfig.color,
                                      fontWeight: 800,
                                      fontSize: 11.5,
                                      whiteSpace: 'nowrap',
                                      borderRadius: 2,
                                      px: 1.5,
                                      py: 0.6,
                                      textTransform: 'none',
                                      boxShadow: `0 2px 6px ${actionConfig.color}40`,
                                      '&:hover': {
                                        bgcolor: actionConfig.hoverColor,
                                        boxShadow: `0 4px 12px ${actionConfig.color}60`,
                                      },
                                    }}
                                  >
                                    <span className="notranslate" translate="no">
                                      {actionConfig.label}
                                    </span>
                                  </Button>
                                </Tooltip>
                              );
                            }

                            return (
                              <Tooltip title={`Kelolosan tahap ini adalah wewenang penuh ${stageOwner.label}. Mode Super Admin dapat mengambil alih jika diperlukan.`}>
                                <Chip
                                  size="small"
                                  className="notranslate"
                                  translate="no"
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
                            );
                          })()}

                          {/* Stage 7: Tombol Edit Format Offering & Tanda Tangan Digital HR */}
                          {!isFailed && a.currentStage === 7 && canManage && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => {
                                setSelectedApplicant(a);
                                setAdvanceAction('approve');
                                setIsEditingOfferingOnly(true);
                                const curYear = new Date().getFullYear();
                                setAdvanceOfferingRefNum(a.offeringRefNumber || `ITSP/HRD-REC/OL/${curYear}/${String(a.id).padStart(4, '0')}`);
                                setAdvanceOfferingJoinDate(a.offeringJoinDate || '');
                                setAdvanceOfferingClauses(a.offeringClauses || DEFAULT_OFFERING_CLAUSES);
                                setAdvanceOfferingSignerName(a.offeringSignerName || adminSession?.name || 'Budi Santoso, S.Psi.');
                                setAdvanceOfferingSignerTitle(a.offeringSignerTitle || 'Human Capital & Recruitment Manager');
                                setAdvanceOfferingSignature(a.offeringSignerSignature || '');
                                setAdvanceOfferingSignMode('draw');
                                setAdvanceNotes(a.offeringLetter || '');
                                const salStr = a.offeringSalary || '';
                                const match = salStr.match(/Rp\.?\s*([\d\.]+)/i);
                                setAdvanceSalary(match ? match[1] : (salStr ? salStr.replace(/\D/g, '') : ''));
                                setAdvanceAllowance(salStr.includes('+') ? salStr.substring(salStr.indexOf('+')).trim() : '');
                                setAdvanceOfferingFile(null);
                                setAdvanceModalOpen(true);
                              }}
                              startIcon={<DocIcon />}
                              sx={{
                                bgcolor: '#018730',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: 11.5,
                                whiteSpace: 'nowrap',
                                borderRadius: 2,
                                px: 1.5,
                                py: 0.6,
                                textTransform: 'none',
                                boxShadow: '0 2px 6px rgba(1, 135, 48, 0.3)',
                                '&:hover': { bgcolor: '#005c21' },
                              }}
                            >
                              Edit Format Offering & TTD
                            </Button>
                          )}

                          {/* Stage 7: Tombol SUDAH TANDA TANGAN KONTRAK (Pengangkatan Karyawan Resmi) */}
                          {!isFailed && a.currentStage === 7 && canManage && (
                            <Tooltip title="Calon karyawan telah hadir ke PT & menandatangani kontrak kerja fisik. Klik untuk input masa kontrak, sesuaikan nomor ID karyawan, dan masukkan otomatis ke Data Karyawan." arrow>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleOpenHireContractModal(a)}
                                startIcon={<HowToRegIcon />}
                                sx={{
                                  bgcolor: '#0F172A',
                                  color: '#FFFFFF',
                                  fontWeight: 800,
                                  fontSize: 11.5,
                                  whiteSpace: 'nowrap',
                                  borderRadius: 2,
                                  px: 1.5,
                                  py: 0.6,
                                  textTransform: 'none',
                                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.35)',
                                  '&:hover': {
                                    bgcolor: '#1E293B',
                                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.5)',
                                  },
                                }}
                              >
                                Sudah Tanda Tangan Kontrak
                              </Button>
                            </Tooltip>
                          )}

                          {/* Schedule Interview: Tahap 4 (HR Interview) & Tahap 5 (User Interview) */}
                          {a.currentStage === 4 && canManage && (
                            <Tooltip title="Jadwalkan Interview HR (Teams / Onsite di Pabrik)">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedApplicant(a);
                                  setInterviewType('hr');
                                  const isCikarang = a.jobPosting?.location?.toLowerCase().includes('cikarang');
                                  setInterviewPlantChoice(isCikarang ? 'giic' : 'kiic');
                                  setInterviewRoom('Ruang Meeting HCM Lt. 2 (Gedung Admin)');
                                  setInterviewMapsInput('');
                                  setInterviewModalOpen(true);
                                }}
                                sx={{ color: '#0284C7' }}
                              >
                                <InterviewIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {a.currentStage === 5 && canManage && (
                            <Tooltip title="Jadwalkan Interview User Departemen (Teams / Onsite di Pabrik)">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedApplicant(a);
                                  setInterviewType('user');
                                  const isCikarang = a.jobPosting?.location?.toLowerCase().includes('cikarang');
                                  setInterviewPlantChoice(isCikarang ? 'giic' : 'kiic');
                                  setInterviewRoom(`Ruang Meeting Teknis Divisi ${a.jobPosting?.department || 'Terkait'}`);
                                  setInterviewMapsInput('');
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

                          {/* Reset Test Session: Stage 2 (HR Psikotes) & Stage 3 (User Dept Teknis) */}
                          {(a.currentStage === 2 || a.currentStage === 3) && (canManage || adminSession?.role === 'admin') && (
                            <Tooltip title={`Reset Sesi Ujian ${a.currentStage === 2 ? 'Psikotes (HR)' : 'Teknis (User Dept)'} (Buka Kunci / Izinkan Ujian Ulang jika koneksi terputus, laptop mati, atau kendala teknis)`}>
                              <IconButton
                                size="small"
                                onClick={() => handleResetTest(a.id, a.currentStage === 2 ? 'psikotes' : 'user_test')}
                                sx={{ color: '#EF4444' }}
                              >
                                <ResetIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* Resend Stage Email (recovery bila kandidat tidak menerima email) */}
                          {!isFailed && canManage && (
                            <Tooltip title="Kirim Ulang Email Notifikasi Tahap Ini">
                              <IconButton
                                size="small"
                                onClick={() => handleResendEmail(a)}
                                sx={{ color: '#018730' }}
                              >
                                <EmailIcon />
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

                          {/* Menu Super Admin: Majukan / Mundurkan Tahap Seleksi Secara Bebas */}
                          {(adminSession?.isAdmin || adminSession?.role === 'admin') && (
                            <Tooltip title="Menu Super Admin: Majukan / Mundurkan Tahap Seleksi (Override Status)">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedApplicant(a);
                                  setOverrideTargetStage(a.currentStage);
                                  setOverrideStageStatus(a.stageStatus || 'in_progress');
                                  setOverrideNotes('');
                                  setOverrideSendEmail(false);
                                  setOverrideModalOpen(true);
                                }}
                                sx={{
                                  color: '#7C3AED',
                                  bgcolor: '#F5F3FF',
                                  border: '1px solid #DDD6FE',
                                  p: 0.6,
                                  '&:hover': { bgcolor: '#EDE9FE' },
                                }}
                              >
                                <TuneIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          </Box>
                        );
                      })()}
                    </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            </Table>
            <KarirTablePagination
              count={applicants.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); }}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </>
        )}
      </TableContainer>

      {/* 1. COMPREHENSIVE CANDIDATE BERKAS PELAMAR MODAL (ALL DATA & 11 DOCUMENTS) */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              maxHeight: '92vh',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            },
          },
        }}
      >
        <DialogTitle sx={{ p: 0, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          {/* Top Banner Accent */}
          <Box sx={{ height: 6, background: 'linear-gradient(90deg, #018730 0%, #10B981 50%, #059669 100%)' }} />

          <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Avatar
                src={selectedApplicant?.photoFile || selectedApplicant?.photo_file || undefined}
                alt={selectedApplicant?.fullName}
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 2.5,
                  bgcolor: '#018730',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 26,
                  boxShadow: '0 4px 12px rgba(1, 135, 48, 0.2)',
                  border: '2px solid #FFFFFF',
                }}
              >
                {selectedApplicant?.fullName ? selectedApplicant.fullName.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                    {selectedApplicant?.fullName}
                  </Typography>
                  {selectedApplicant?.nik && (
                    <Chip
                      icon={<VerifiedIcon sx={{ fontSize: '15px !important', color: '#059669 !important' }} />}
                      label={`NIK: ${selectedApplicant.nik} (Format Valid)`}
                      size="small"
                      sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 700, fontSize: 11, border: '1px solid #A7F3D0' }}
                    />
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: '#475569', mt: 0.3 }}>
                  Posisi Dilamar: <strong>{selectedApplicant?.jobPosting?.title}</strong> ({selectedApplicant?.jobPosting?.department || '-'})
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.8, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    label={`Tahap ${selectedApplicant?.currentStage}: ${
                      RECRUITMENT_STAGES.find((s) => s.number === selectedApplicant?.currentStage)?.shortName || ''
                    }`}
                    sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: 11 }}
                  />
                  <Chip
                    size="small"
                    label={
                      selectedApplicant?.stageStatus === 'failed'
                        ? 'Gugur'
                        : selectedApplicant?.stageStatus === 'passed'
                        ? 'Lolos'
                        : 'Dalam Proses'
                    }
                    sx={{
                      bgcolor:
                        selectedApplicant?.stageStatus === 'failed'
                          ? '#FEE2E2'
                          : selectedApplicant?.stageStatus === 'passed'
                          ? '#DCFCE7'
                          : '#FEF3C7',
                      color:
                        selectedApplicant?.stageStatus === 'failed'
                          ? '#991B1B'
                          : selectedApplicant?.stageStatus === 'passed'
                          ? '#166534'
                          : '#92400E',
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {(selectedApplicant?.cvFile || selectedApplicant?.cv_file) && (
                <Button
                  variant="outlined"
                  size="small"
                  component="a"
                  href={selectedApplicant.cvFile || selectedApplicant.cv_file}
                  download={`CV_${(selectedApplicant.fullName || 'Pelamar').replace(/\s+/g, '_')}.pdf`}
                  startIcon={<DownloadIcon />}
                  sx={{ textTransform: 'none', fontWeight: 700, borderColor: '#018730', color: '#018730' }}
                >
                  Unduh CV (PDF)
                </Button>
              )}
              <IconButton onClick={() => setDetailModalOpen(false)} sx={{ color: '#64748B' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Navigation Tabs */}
          <Tabs
            value={detailTab}
            onChange={(_, val) => setDetailTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: { xs: 1, sm: 2.5 },
              bgcolor: '#F1F5F9',
              borderTop: '1px solid #E2E8F0',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 13,
                minHeight: 46,
                gap: 0.8,
              },
              '& .Mui-selected': {
                color: '#018730 !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#018730',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Identitas & Domisili" />
            <Tab icon={<SchoolIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Pendidikan & Pengalaman" />
            <Tab icon={<FamilyIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Latar Belakang Keluarga" />
            <Tab icon={<DocIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Berkas Dokumen (11 Berkas)" />
            <Tab icon={<PsychologyIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Evaluasi & Hasil Tes" />
          </Tabs>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#FFFFFF' }}>
          {selectedApplicant && (
            <>
              {/* TAB 0: IDENTITAS & DOMISILI LENGKAP */}
              {detailTab === 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                    {/* Kolom Kiri: Biodata & Kependudukan */}
                    <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E2E8F0' }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <FingerprintIcon sx={{ color: '#018730', fontSize: 20 }} /> Data Kependudukan & Biodata
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Nomor Induk Kependudukan (NIK):</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: 0.5 }}>
                              {selectedApplicant.nik || '-'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Nama Lengkap Sesuai KTP:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              {selectedApplicant.fullName}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Tempat, Tanggal Lahir & Usia:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                              {selectedApplicant.birthPlace || selectedApplicant.birth_place || '-'},{' '}
                              {selectedApplicant.birthDate ? new Date(selectedApplicant.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}{' '}
                              ({selectedApplicant.age ?? '-'} Thn)
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Jenis Kelamin:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                              {selectedApplicant.gender || '-'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Agama:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                              {selectedApplicant.religion || '-'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Suku Bangsa:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                              {selectedApplicant.ethnic || '-'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Tinggi & Berat Badan:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                              {selectedApplicant.heightCm || selectedApplicant.height_cm ? `${selectedApplicant.heightCm || selectedApplicant.height_cm} cm` : '-'}{' '}
                              /{' '}
                              {selectedApplicant.weightKg || selectedApplicant.weight_kg ? `${selectedApplicant.weightKg || selectedApplicant.weight_kg} kg` : '-'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Status Pernikahan:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                              {selectedApplicant.marriageStatus || selectedApplicant.marriage_status || '-'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Email Address:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0284C7' }}>
                              <a href={`mailto:${selectedApplicant.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                {selectedApplicant.email}
                              </a>
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>No. WhatsApp / Telepon:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>
                              <a
                                href={`https://wa.me/${(selectedApplicant.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'inherit', textDecoration: 'underline' }}
                              >
                                {selectedApplicant.phone} ↗
                              </a>
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Kolom Kanan: Alamat KTP & Domisili */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Alamat KTP */}
                      <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E2E8F0', bgcolor: '#F8FAFC' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <HomeIcon sx={{ color: '#0369A1', fontSize: 18 }} /> Alamat Sesuai KTP
                            </Typography>
                            <Chip label="Data e-KTP" size="small" sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 700, fontSize: 10 }} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                            {selectedApplicant.streetKtp || selectedApplicant.street_ktp || selectedApplicant.addressKtp || selectedApplicant.address_ktp || '-'}
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mt: 1, bgcolor: '#FFFFFF', p: 1.2, borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              RT / RW: <strong>{selectedApplicant.rtKtp || selectedApplicant.rt_ktp || '-'} / {selectedApplicant.rwKtp || selectedApplicant.rw_ktp || '-'}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              Kel/Desa: <strong>{selectedApplicant.villageKtp || selectedApplicant.village_ktp || '-'}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              Kecamatan: <strong>{selectedApplicant.districtKtp || selectedApplicant.district_ktp || '-'}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              Kota/Kab: <strong>{selectedApplicant.cityKtp || selectedApplicant.city_ktp || '-'}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', gridColumn: 'span 2' }}>
                              Provinsi: <strong>{selectedApplicant.provinceKtp || selectedApplicant.province_ktp || '-'}</strong>
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Alamat Domisili */}
                      <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E2E8F0', bgcolor: '#F8FAFC' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <LocationIcon sx={{ color: '#D97706', fontSize: 18 }} /> Alamat Domisili Saat Ini
                            </Typography>
                            {(selectedApplicant.domicileSameAsKtp === false || selectedApplicant.domicile_same_as_ktp === false || selectedApplicant.streetDomicile || selectedApplicant.street_domicile) ? (
                              <Chip label="Domisili Berbeda" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: 10 }} />
                            ) : (
                              <Chip label="Sesuai KTP" size="small" sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: 10 }} />
                            )}
                          </Box>
                          {(selectedApplicant.domicileSameAsKtp === false || selectedApplicant.domicile_same_as_ktp === false || selectedApplicant.streetDomicile || selectedApplicant.street_domicile) ? (
                            <>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                                {selectedApplicant.streetDomicile || selectedApplicant.street_domicile || selectedApplicant.addressDomicile || selectedApplicant.address_domicile || '-'}
                              </Typography>
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mt: 1, bgcolor: '#FFFFFF', p: 1.2, borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  RT / RW: <strong>{selectedApplicant.rtDomicile || selectedApplicant.rt_domicile || '-'} / {selectedApplicant.rwDomicile || selectedApplicant.rw_domicile || '-'}</strong>
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  Kel/Desa: <strong>{selectedApplicant.villageDomicile || selectedApplicant.village_domicile || '-'}</strong>
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  Kecamatan: <strong>{selectedApplicant.districtDomicile || selectedApplicant.district_domicile || '-'}</strong>
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  Kota/Kab: <strong>{selectedApplicant.cityDomicile || selectedApplicant.city_domicile || '-'}</strong>
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B', gridColumn: 'span 2' }}>
                                  Provinsi: <strong>{selectedApplicant.provinceDomicile || selectedApplicant.province_domicile || '-'}</strong>
                                </Typography>
                              </Box>
                            </>
                          ) : (
                            <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic' }}>
                                Tempat tinggal / domisili kandidat sama persis dengan alamat yang tercantum pada e-KTP.
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* TAB 1: PENDIDIKAN & PENGALAMAN KERJA */}
              {detailTab === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Riwayat Pendidikan Formal */}
                  <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E2E8F0' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <SchoolIcon sx={{ color: '#018730', fontSize: 20 }} /> Riwayat Pendidikan Formal
                      </Typography>
                      {(() => {
                        const rawEdu = parseJsonSafe(selectedApplicant.educationHistory || selectedApplicant.education_history, []);
                        const eduList = Array.isArray(rawEdu) && rawEdu.length > 0 ? rawEdu : [
                          {
                            level: selectedApplicant.lastEducation || '-',
                            schoolName: selectedApplicant.schoolName || '-',
                            major: selectedApplicant.major || '-',
                            entryYear: '-',
                            gradYear: '-',
                          },
                        ];

                        return (
                          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                            <Table size="small">
                              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569', width: 50 }}>No</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Jenjang</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Nama Sekolah / Universitas</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Jurusan</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Tahun Masuk</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Tahun Lulus</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {eduList.map((edu: any, idx: number) => (
                                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                                    <TableCell sx={{ fontWeight: 600 }}>{idx + 1}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={edu.level || '-'}
                                        size="small"
                                        sx={{ bgcolor: '#F1F5F9', fontWeight: 700, fontSize: 11 }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{edu.schoolName || '-'}</TableCell>
                                    <TableCell>{edu.major || '-'}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{edu.entryYear || '-'}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', fontWeight: 700, color: '#018730' }}>{edu.gradYear || '-'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Pengalaman Kerja */}
                  <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E2E8F0' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <WorkIcon sx={{ color: '#0369A1', fontSize: 20 }} /> Riwayat Pengalaman Kerja
                      </Typography>
                      {(() => {
                        const rawWork = parseJsonSafe(selectedApplicant.workHistory || selectedApplicant.work_history, []);
                        const workList = Array.isArray(rawWork) ? rawWork : [];

                        if (workList.length === 0) {
                          return (
                            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                                Ringkasan Pengalaman:
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#475569' }}>
                                {selectedApplicant.experience || 'Fresh Graduate / Belum memiliki riwayat pengalaman kerja terstruktur.'}
                              </Typography>
                            </Box>
                          );
                        }

                        return (
                          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                            <Table size="small">
                              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569', width: 50 }}>No</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Nama Company</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Posisi / Jabatan</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Periode</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Deskripsi Tugas</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Alasan Keluar</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {workList.map((work: any, idx: number) => (
                                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                                    <TableCell sx={{ fontWeight: 600 }}>{idx + 1}</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>{work.company || '-'}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#0369A1' }}>{work.position || '-'}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                      {work.startYear || work.year || '-'} s/d {work.endYear || 'Sekarang'}
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 300, whiteSpace: 'pre-wrap', fontSize: 12 }}>
                                      {work.jobDescription || '-'}
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 200, fontSize: 12, color: '#B91C1C' }}>
                                      {work.exitReason || '-'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Kemampuan Bahasa */}
                  <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E2E8F0', bgcolor: '#F8FAFC' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <OnlineIcon sx={{ color: '#6366F1', fontSize: 20 }} /> Kemampuan Bahasa
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Kemampuan Bahasa Inggris:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', mt: 0.3 }}>
                            {selectedApplicant.englishSkill || selectedApplicant.english_skill || 'Intermediate'}
                          </Typography>
                        </Box>
                        <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Bahasa Asing Lainnya:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', mt: 0.3 }}>
                            {selectedApplicant.otherLanguages || selectedApplicant.other_languages || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* TAB 2: LATAR BELAKANG KELUARGA */}
              {detailTab === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Data Orang Tua */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                    {(() => {
                      const parents = parseJsonSafe(selectedApplicant.familyParents || selectedApplicant.family_parents, {});
                      return (
                        <>
                          {/* Kartu Ayah */}
                          <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E2E8F0', bgcolor: '#F8FAFC' }}>
                            <CardContent sx={{ p: 2.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#0369A1', width: 36, height: 36 }}>
                                  <PersonIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>Data Ayah Kandung</Typography>
                                  <Typography variant="caption" sx={{ color: '#64748B' }}>Informasi Kepala Keluarga / Orang Tua</Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                <Box sx={{ gridColumn: 'span 2' }}>
                                  <Typography variant="caption" sx={{ color: '#64748B' }}>Nama Ayah:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                    {parents.fatherName || parents.father_name || '-'}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" sx={{ color: '#64748B' }}>Tahun Lahir / Usia:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {parents.fatherBirthYear || parents.father_birth_year
                                      ? `${parents.fatherBirthYear || parents.father_birth_year} (${new Date().getFullYear() - parseInt(parents.fatherBirthYear || parents.father_birth_year)} Thn)`
                                      : '-'}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" sx={{ color: '#64748B' }}>Pendidikan Terakhir:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {parents.fatherEducation || parents.father_education || '-'}
                                  </Typography>
                                </Box>
                                <Box sx={{ gridColumn: 'span 2' }}>
                                  <Typography variant="caption" sx={{ color: '#64748B' }}>Pekerjaan Saat Ini:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#018730' }}>
                                    {parents.fatherJob || parents.father_job || '-'}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>

                          {/* Kartu Ibu */}
                          <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E2E8F0', bgcolor: '#F8FAFC' }}>
                            <CardContent sx={{ p: 2.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
                                <Avatar sx={{ bgcolor: '#BE185D', width: 36, height: 36 }}>
                                  <PersonIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>Data Ibu Kandung</Typography>
                                  <Typography variant="caption" sx={{ color: '#64748B' }}>Informasi Orang Tua Perempuan</Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                                <Box sx={{ gridColumn: 'span 2' }}>
                                  <Typography variant="caption" sx={{ color: '#64748B' }}>Nama Ibu:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                    {parents.motherName || parents.mother_name || '-'}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" sx={{ color: '#64748B' }}>Tahun Lahir / Usia:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {parents.motherBirthYear || parents.mother_birth_year
                                      ? `${parents.motherBirthYear || parents.mother_birth_year} (${new Date().getFullYear() - parseInt(parents.motherBirthYear || parents.mother_birth_year)} Thn)`
                                      : '-'}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" sx={{ color: '#64748B' }}>Pendidikan Terakhir:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {parents.motherEducation || parents.mother_education || '-'}
                                  </Typography>
                                </Box>
                                <Box sx={{ gridColumn: 'span 2' }}>
                                  <Typography variant="caption" sx={{ color: '#64748B' }}>Pekerjaan Saat Ini:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#BE185D' }}>
                                    {parents.motherJob || parents.mother_job || '-'}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </>
                      );
                    })()}
                  </Box>

                  {/* Saudara Kandung / Tanggungan */}
                  <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#E2E8F0' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <FamilyIcon sx={{ color: '#7C3AED', fontSize: 20 }} /> Susunan Saudara Kandung / Tanggungan
                      </Typography>
                      {(() => {
                        const rawSiblings = parseJsonSafe(selectedApplicant.familySiblings || selectedApplicant.family_siblings, []);
                        const siblings = Array.isArray(rawSiblings) ? rawSiblings : [];

                        if (siblings.length === 0) {
                          return (
                            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0', textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ color: '#64748B', fontStyle: 'italic' }}>
                                Tidak ada data saudara kandung / anak yang diinputkan.
                              </Typography>
                            </Box>
                          );
                        }

                        return (
                          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                            <Table size="small">
                              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569', width: 50 }}>No</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Hubungan</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Nama Lengkap</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Tahun Lahir / Usia</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Pendidikan</TableCell>
                                  <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Pekerjaan / Aktivitas</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {siblings.map((sib: any, idx: number) => (
                                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                                    <TableCell sx={{ fontWeight: 600 }}>{idx + 1}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={sib.relation || 'Saudara'}
                                        size="small"
                                        sx={{ bgcolor: '#F3E8FF', color: '#6B21A8', fontWeight: 700, fontSize: 11 }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{sib.name || '-'}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                      {sib.birthYear
                                        ? `${sib.birthYear} (${new Date().getFullYear() - parseInt(sib.birthYear)} Thn)`
                                        : sib.age ? `${sib.age} Thn` : '-'}
                                    </TableCell>
                                    <TableCell>{sib.education || '-'}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{sib.job || '-'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* TAB 3: BERKAS DOKUMEN (11 BERKAS + CV) */}
              {detailTab === 3 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DocIcon sx={{ color: '#018730', fontSize: 20 }} /> Seluruh Berkas & Dokumen Pendaftaran Pelamar
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Klik <strong>Lihat</strong> untuk pratinjau langsung di dalam aplikasi atau <strong>Unduh</strong> untuk menyimpan berkas.
                    </Typography>
                  </Box>

                  {(() => {
                    const docList = [
                      {
                        id: 'photo',
                        title: 'Pas Foto 3x4 / 4x6 Berwarna',
                        category: 'Foto Resmi',
                        file: selectedApplicant.photoFile || selectedApplicant.photo_file,
                        isImage: true,
                        required: true,
                      },
                      {
                        id: 'ktp',
                        title: 'KTP (Kartu Tanda Penduduk)',
                        category: 'Identitas',
                        file: selectedApplicant.ktpFile || selectedApplicant.ktp_file,
                        required: true,
                      },
                      {
                        id: 'kk',
                        title: 'Kartu Keluarga (KK)',
                        category: 'Identitas',
                        file: selectedApplicant.kkFile || selectedApplicant.kk_file,
                        required: true,
                      },
                      {
                        id: 'ijazah',
                        title: 'Ijazah Terakhir Formal',
                        category: 'Akademik',
                        file: selectedApplicant.ijazahFile || selectedApplicant.ijazah_file,
                        required: true,
                      },
                      {
                        id: 'transkrip',
                        title: 'Transkrip Nilai Akademik',
                        category: 'Akademik',
                        file: selectedApplicant.transkripFile || selectedApplicant.transkrip_file,
                        required: true,
                      },
                      {
                        id: 'cert_nonformal',
                        title: 'Sertifikat Pelatihan / Non-Formal',
                        category: 'Keahlian',
                        file: selectedApplicant.certNonformalFile || selectedApplicant.cert_nonformal_file,
                        required: false,
                      },
                      {
                        id: 'bpjs_kesehatan',
                        title: 'Kartu BPJS Kesehatan',
                        category: 'Ketenagakerjaan',
                        file: selectedApplicant.bpjsKesehatanFile || selectedApplicant.bpjs_kesehatan_file,
                        required: true,
                      },
                      {
                        id: 'bpjs_ketenagakerjaan',
                        title: 'BPJS Ketenagakerjaan',
                        category: 'Ketenagakerjaan',
                        file: selectedApplicant.bpjsKetenagakerjaanFile || selectedApplicant.bpjs_ketenagakerjaan_file,
                        required: false,
                      },
                      {
                        id: 'npwp',
                        title: 'Kartu NPWP (Pajak)',
                        category: 'Perpajakan',
                        file: selectedApplicant.npwpFile || selectedApplicant.npwp_file,
                        required: true,
                      },
                      {
                        id: 'akta',
                        title: 'Akta Kelahiran',
                        category: 'Kependudukan',
                        file: selectedApplicant.aktaFile || selectedApplicant.akta_file,
                        required: true,
                      },
                      {
                        id: 'skck',
                        title: 'SKCK Aktif Kepolisian',
                        category: 'Legalitas',
                        file: selectedApplicant.skckFile || selectedApplicant.skck_file,
                        required: true,
                      },
                      {
                        id: 'cv',
                        title: 'Curriculum Vitae (CV) PDF',
                        category: 'Resume',
                        file: selectedApplicant.cvFile || selectedApplicant.cv_file,
                        required: true,
                      },
                      {
                        id: 'offering',
                        title: 'Offering Letter Resmi HR (PDF)',
                        category: 'Tahap 7: Penawaran',
                        file: selectedApplicant.offeringAttachment || selectedApplicant.offering_attachment,
                        required: false,
                      },
                      {
                        id: 'signed_contract',
                        title: 'Kontrak Kerja Bertanda Tangan (PDF)',
                        category: 'Tahap 7: Kontrak Sah',
                        file: selectedApplicant.signedContractFile || selectedApplicant.signed_contract_file,
                        required: false,
                      },
                    ];

                    return (
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                        {docList.map((doc) => {
                          const hasFile = Boolean(doc.file);
                          const isPdf = hasFile && (doc.file.startsWith('data:application/pdf') || doc.file.toLowerCase().endsWith('.pdf'));

                          return (
                            <Card
                              key={doc.id}
                              variant="outlined"
                              sx={{
                                borderRadius: 2,
                                borderColor: hasFile ? '#BBF7D0' : '#E2E8F0',
                                bgcolor: hasFile ? '#FFFFFF' : '#F8FAFC',
                                transition: 'all 0.2s ease',
                                '&:hover': hasFile ? { boxShadow: '0 4px 12px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } : {},
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                              }}
                            >
                              <CardContent sx={{ p: 2, pb: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>
                                    {doc.category}
                                  </Typography>
                                  <Chip
                                    label={hasFile ? 'Tersedia' : doc.required ? 'Belum Diunggah' : 'Opsional'}
                                    size="small"
                                    sx={{
                                      bgcolor: hasFile ? '#DCFCE7' : doc.required ? '#FEE2E2' : '#F1F5F9',
                                      color: hasFile ? '#15803D' : doc.required ? '#B91C1C' : '#64748B',
                                      fontWeight: 700,
                                      fontSize: 10,
                                      height: 20,
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: hasFile ? '#0F172A' : '#94A3B8', minHeight: 40, lineHeight: 1.3 }}>
                                  {doc.title}
                                </Typography>

                                {/* Thumbnail / Box Preview */}
                                <Box
                                  sx={{
                                    my: 1.5,
                                    height: 100,
                                    borderRadius: 1.5,
                                    bgcolor: hasFile ? (isPdf ? '#EFF6FF' : '#F1F5F9') : '#F8FAFC',
                                    border: '1px dashed',
                                    borderColor: hasFile ? '#CBD5E1' : '#E2E8F0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    position: 'relative',
                                  }}
                                >
                                  {hasFile ? (
                                    isPdf ? (
                                      <Box sx={{ textAlign: 'center', color: '#1D4ED8' }}>
                                        <PdfIcon sx={{ fontSize: 36, color: '#DC2626' }} />
                                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mt: 0.3 }}>
                                          Dokumen PDF
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Box
                                        component="img"
                                        src={doc.file}
                                        alt={doc.title}
                                        sx={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                        }}
                                      />
                                    )
                                  ) : (
                                    <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>
                                      Tidak ada berkas
                                    </Typography>
                                  )}
                                </Box>
                              </CardContent>

                              <Box sx={{ p: 1.5, pt: 0, display: 'flex', gap: 1 }}>
                                {hasFile ? (
                                  <>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      fullWidth
                                      startIcon={<ViewIcon />}
                                      onClick={() => setDocPreview({ title: doc.title, url: doc.file, isPdf })}
                                      sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        fontSize: 11,
                                        py: 0.6,
                                        borderColor: '#CBD5E1',
                                        color: '#334155',
                                        '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
                                      }}
                                    >
                                      Lihat
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      fullWidth
                                      component="a"
                                      href={doc.file}
                                      download={`${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}_${(selectedApplicant.fullName || '').replace(/\s+/g, '_')}.${isPdf ? 'pdf' : 'jpg'}`}
                                      startIcon={<DownloadIcon />}
                                      sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        fontSize: 11,
                                        py: 0.6,
                                        bgcolor: '#018730',
                                        '&:hover': { bgcolor: '#005c21' },
                                      }}
                                    >
                                      Unduh
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="small"
                                    disabled
                                    fullWidth
                                    sx={{ textTransform: 'none', fontSize: 11 }}
                                  >
                                    Tidak Tersedia
                                  </Button>
                                )}
                              </Box>
                            </Card>
                          );
                        })}
                      </Box>
                    );
                  })()}
                </Box>
              )}

              {/* TAB 4: EVALUASI & HASIL TES */}
              {detailTab === 4 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* PANEL 1: EVALUASI PSIKOTES & POTENSI AKADEMIK (HR REVIEW) */}
                  <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: '#BBF7D0', bgcolor: '#F0FDF4', overflow: 'hidden' }}>
                    <Box sx={{ p: 2.5, bgcolor: '#DCFCE7', borderBottom: '1.5px solid #86EFAC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <PsychologyIcon sx={{ color: '#166534', fontSize: 28 }} />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#166534' }}>
                            Hasil Evaluasi Ujian Psikotes & Potensi Akademik Online
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 600 }}>
                            Wewenang Review: Tim Human Capital / HR Recruitment PT ITSP
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {currentPsikoReview?.isSubmitted ? (
                          <>
                            <Chip
                              size="medium"
                              label={`Skor Psikotes: ${currentPsikoReview.score ?? 0} / 100`}
                              sx={{
                                bgcolor: (currentPsikoReview.score ?? 0) >= 70 ? '#15803D' : '#DC2626',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: 13,
                              }}
                            />
                            <Chip
                              size="medium"
                              label={(currentPsikoReview.score ?? 0) >= 70 ? '✓ Lolos Standar (>= 70)' : '✕ Di Bawah Standar (< 70)'}
                              sx={{
                                bgcolor: (currentPsikoReview.score ?? 0) >= 70 ? '#ECFDF5' : '#FEF2F2',
                                color: (currentPsikoReview.score ?? 0) >= 70 ? '#065F46' : '#991B1B',
                                border: '1px solid',
                                borderColor: (currentPsikoReview.score ?? 0) >= 70 ? '#A7F3D0' : '#FECACA',
                                fontWeight: 700,
                              }}
                            />
                            {(canManageApplicant(selectedApplicant) || adminSession?.role === 'admin' || adminSession?.role === 'hr') && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<ResetIcon />}
                                onClick={async () => {
                                  await handleResetTest(selectedApplicant.id, 'psikotes');
                                  setDetailModalOpen(false);
                                }}
                                sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 1.5, bgcolor: '#FFFFFF', fontSize: 12 }}
                              >
                                Reset Ujian Psikotes
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            <Chip
                              size="medium"
                              label="Belum Mengikuti Ujian"
                              sx={{ bgcolor: '#E2E8F0', color: '#64748B', fontWeight: 700 }}
                            />
                            {(canManageApplicant(selectedApplicant) || adminSession?.role === 'admin' || adminSession?.role === 'hr') &&
                              (currentPsikoReview?.isLocked || (selectedApplicant.testSubmissions || selectedApplicant.test_submissions || []).some((s: any) => (s.testType || s.test_type) === 'psikotes' && (s.isLocked || s.is_locked))) && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<ResetIcon />}
                                onClick={async () => {
                                  await handleResetTest(selectedApplicant.id, 'psikotes');
                                  setDetailModalOpen(false);
                                }}
                                sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 1.5, bgcolor: '#FFFFFF', fontSize: 12 }}
                              >
                                Buka Kunci / Reset Ujian
                              </Button>
                            )}
                          </>
                        )}
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 2.5, bgcolor: '#FFFFFF' }}>
                      {currentPsikoReview?.isSubmitted ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          {/* Metadata Bar */}
                          <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                              <Typography variant="body2" sx={{ color: '#334155', fontWeight: 700 }}>
                                📅 Diserahkan:{' '}
                                <span style={{ fontWeight: 600, color: '#64748B' }}>
                                  {currentPsikoReview.submittedAt ? new Date(currentPsikoReview.submittedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                                </span>
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#334155', fontWeight: 700 }}>
                                🛡️ Anti-Cheat:{' '}
                                <span style={{ fontWeight: 800, color: currentPsikoReview.violationsCount > 0 ? '#D97706' : '#16A34A' }}>
                                  {currentPsikoReview.violationsCount} / 2 Pelanggaran Tab
                                </span>
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#334155', fontWeight: 700 }}>
                                🎯 Akurasi PG:{' '}
                                <span style={{ fontWeight: 800, color: '#16A34A' }}>
                                  {currentPsikoReview.correctCount} Benar
                                </span>
                                {' '}/{' '}
                                <span style={{ fontWeight: 800, color: '#DC2626' }}>
                                  {currentPsikoReview.wrongCount} Salah
                                </span>
                              </Typography>
                            </Box>
                            {currentPsikoReview.isLocked && (
                              <Chip size="small" label="Terkunci Sistem Anti-Cheat" sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 800 }} />
                            )}
                          </Box>

                          {/* 1. Hasil Profiling Karakteristik Diri */}
                          {currentPsikoReview.profilingTraits.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                👤 Hasil Profiling Karakteristik Kepribadian Diri:
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                                {currentPsikoReview.profilingTraits.map((item: any, idx: number) => (
                                  <Box key={idx} sx={{ p: 1.8, bgcolor: '#F0FDF4', borderRadius: 2, border: '1px solid #BBF7D0' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
                                      {item.question}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                      {item.selectedTraits.map((trait: string, tIdx: number) => (
                                        <Chip
                                          key={tIdx}
                                          icon={<CheckIcon sx={{ fontSize: '15px !important', color: '#15803D !important' }} />}
                                          label={trait}
                                          sx={{ bgcolor: '#FFFFFF', color: '#065F46', fontWeight: 700, border: '1.5px solid #86EFAC', py: 0.5 }}
                                        />
                                      ))}
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}

                          {/* 2. Rincian Lembar Jawaban Soal Pilihan Ganda */}
                          {currentPsikoReview.singleChoices.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.2, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <QuizIcon sx={{ color: '#018730', fontSize: 20 }} /> Lembar Jawaban Pilihan Ganda ({currentPsikoReview.singleChoices.length} Soal):
                              </Typography>

                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {currentPsikoReview.singleChoices.map((item: any, idx: number) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      p: 2,
                                      borderRadius: 2,
                                      border: '1.5px solid',
                                      borderColor: item.isCorrect ? '#86EFAC' : '#FECACA',
                                      bgcolor: item.isCorrect ? '#F0FDF4' : '#FEF2F2',
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                                        Soal #{idx + 1}:
                                      </Typography>
                                      <Chip
                                        size="small"
                                        label={item.isCorrect ? `✓ Benar (+${item.points} Poin)` : '✕ Salah (0 Poin)'}
                                        sx={{
                                          bgcolor: item.isCorrect ? '#16A34A' : '#DC2626',
                                          color: '#FFFFFF',
                                          fontWeight: 800,
                                          fontSize: 11,
                                        }}
                                      />
                                    </Box>

                                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600, mb: 1.5, lineHeight: 1.5 }}>
                                      {item.question}
                                    </Typography>

                                    {item.imageUrl && (
                                      <Box sx={{ mb: 1.5 }}>
                                        <Box component="img" src={item.imageUrl} alt={`Diagram Soal ${idx + 1}`} sx={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain', borderRadius: 1.5, border: '1px solid #CBD5E1', bgcolor: '#FFFFFF', p: 1 }} />
                                      </Box>
                                    )}

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.2 }}>
                                      <Box sx={{ p: 1.2, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1.5px solid', borderColor: item.isCorrect ? '#86EFAC' : '#FCA5A5' }}>
                                        <Typography variant="caption" sx={{ color: item.isCorrect ? '#15803D' : '#DC2626', fontWeight: 800, display: 'block' }}>
                                          Jawaban Calon Karyawan:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: item.isCorrect ? '#166534' : '#991B1B', mt: 0.3 }}>
                                          {item.candidateText}
                                        </Typography>
                                      </Box>

                                      <Box sx={{ p: 1.2, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1.5px solid #86EFAC' }}>
                                        <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 800, display: 'block' }}>
                                          Kunci Jawaban Benar:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#166534', mt: 0.3 }}>
                                          {item.correctText}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}

                          {/* 3. Soal Essay Psikotes (jika ada) */}
                          {currentPsikoReview.essays.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                                📝 Jawaban Soal Uraian / Essay Psikotes:
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {currentPsikoReview.essays.map((item: any, idx: number) => (
                                  <Box key={idx} sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #CBD5E1' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                                      {item.question}
                                    </Typography>
                                    <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1px solid #E2E8F0', whiteSpace: 'pre-wrap' }}>
                                      <Typography variant="body2" sx={{ color: '#1E293B', lineHeight: 1.6 }}>
                                        {item.essayText || '(Pelamar belum mengisi uraian jawaban)'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
                          <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 700, mb: 0.5 }}>
                            Pelamar Belum Mengikuti Ujian Psikotes Online
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 480, mx: 'auto' }}>
                            Ujian belum diselesaikan atau dikirimkan oleh kandidat. Pantau status pelamar pada Tahap 2 di tabel utama rekrutmen.
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  {/* PANEL 2: EVALUASI TES TEKNIS KEJURUAN & STUDI KASUS (USER DEPT REVIEW) */}
                  <Card variant="outlined" sx={{ borderRadius: 2.5, borderColor: '#FDE68A', bgcolor: '#FFFBEB', overflow: 'hidden' }}>
                    <Box sx={{ p: 2.5, bgcolor: '#FEF3C7', borderBottom: '1.5px solid #FCD34D', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <EngineeringIcon sx={{ color: '#92400E', fontSize: 28 }} />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#92400E' }}>
                            Hasil Evaluasi Ujian Teknis Kejuruan & Studi Kasus Departemen
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 600 }}>
                            Wewenang Review: Kepala Bagian / User Departemen ({selectedApplicant?.jobPosting?.department || 'Terkait'})
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {currentUserReview?.isSubmitted ? (
                          <>
                            <Chip
                              size="medium"
                              label={`Skor Teknis: ${currentUserReview.score ?? 0} / 100`}
                              sx={{
                                bgcolor: (currentUserReview.score ?? 0) >= 70 ? '#059669' : '#DC2626',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: 13,
                              }}
                            />
                            <Chip
                              size="medium"
                              label={(currentUserReview.score ?? 0) >= 70 ? '✓ Memenuhi Standar' : '✕ Di Bawah Standar'}
                              sx={{
                                bgcolor: (currentUserReview.score ?? 0) >= 70 ? '#ECFDF5' : '#FEF2F2',
                                color: (currentUserReview.score ?? 0) >= 70 ? '#065F46' : '#991B1B',
                                border: '1px solid',
                                borderColor: (currentUserReview.score ?? 0) >= 70 ? '#A7F3D0' : '#FECACA',
                                fontWeight: 700,
                              }}
                            />
                            {(canManageApplicant(selectedApplicant) || adminSession?.role === 'admin' || adminSession?.role === 'hr') && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<ResetIcon />}
                                onClick={async () => {
                                  await handleResetTest(selectedApplicant.id, 'user_test');
                                  setDetailModalOpen(false);
                                }}
                                sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 1.5, bgcolor: '#FFFFFF', fontSize: 12 }}
                              >
                                Reset Ujian Teknis
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            <Chip
                              size="medium"
                              label="Belum Mengikuti Ujian Teknis"
                              sx={{ bgcolor: '#E2E8F0', color: '#64748B', fontWeight: 700 }}
                            />
                            {(canManageApplicant(selectedApplicant) || adminSession?.role === 'admin' || adminSession?.role === 'hr') &&
                              (currentUserReview?.isLocked || (selectedApplicant.testSubmissions || selectedApplicant.test_submissions || []).some((s: any) => (s.testType || s.test_type) === 'user_test' && (s.isLocked || s.is_locked))) && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<ResetIcon />}
                                onClick={async () => {
                                  await handleResetTest(selectedApplicant.id, 'user_test');
                                  setDetailModalOpen(false);
                                }}
                                sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 1.5, bgcolor: '#FFFFFF', fontSize: 12 }}
                              >
                                Buka Kunci / Reset Ujian
                              </Button>
                            )}
                          </>
                        )}
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 2.5, bgcolor: '#FFFFFF' }}>
                      {currentUserReview?.isSubmitted ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                          {/* Metadata Bar */}
                          <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                              <Typography variant="body2" sx={{ color: '#334155', fontWeight: 700 }}>
                                📅 Diserahkan:{' '}
                                <span style={{ fontWeight: 600, color: '#64748B' }}>
                                  {currentUserReview.submittedAt ? new Date(currentUserReview.submittedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                                </span>
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#334155', fontWeight: 700 }}>
                                🛡️ Anti-Cheat:{' '}
                                <span style={{ fontWeight: 800, color: currentUserReview.violationsCount > 0 ? '#D97706' : '#16A34A' }}>
                                  {currentUserReview.violationsCount} / 2 Pelanggaran Tab
                                </span>
                              </Typography>
                              {currentUserReview.singleChoices.length > 0 && (
                                <Typography variant="body2" sx={{ color: '#334155', fontWeight: 700 }}>
                                  🎯 Akurasi PG:{' '}
                                  <span style={{ fontWeight: 800, color: '#16A34A' }}>
                                    {currentUserReview.correctCount} Benar
                                  </span>
                                  {' '}/{' '}
                                  <span style={{ fontWeight: 800, color: '#DC2626' }}>
                                    {currentUserReview.wrongCount} Salah
                                  </span>
                                </Typography>
                              )}
                            </Box>
                            {currentUserReview.isLocked && (
                              <Chip size="small" label="Terkunci Sistem Anti-Cheat" sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 800 }} />
                            )}
                          </Box>

                          {/* 1. Uraian Studi Kasus Teknis (Essay) */}
                          {currentUserReview.essays.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                📝 Hasil Jawaban Studi Kasus Teknis & Analisa Kejuruan:
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                                {currentUserReview.essays.map((item: any, idx: number) => (
                                  <Box key={idx} sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: 2, border: '1.5px solid #FDE68A' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#78350F' }}>
                                        Studi Kasus #{idx + 1}:
                                      </Typography>
                                      <Chip size="small" label={`Bobot: ${item.points} Poin`} sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800 }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', mb: 1.5, lineHeight: 1.5 }}>
                                      {item.question}
                                    </Typography>
                                    <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1.5px solid #CBD5E1', whiteSpace: 'pre-wrap' }}>
                                      <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 800, display: 'block', mb: 0.5 }}>
                                        Jawaban Uraian Teknis Pelamar:
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: '#1E293B', lineHeight: 1.7, fontSize: 13.5 }}>
                                        {item.essayText || '(Pelamar belum mengisi uraian jawaban)'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}

                          {/* 2. Rincian Lembar Jawaban Soal Pilihan Ganda Teknis */}
                          {currentUserReview.singleChoices.length > 0 && (
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.2, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <QuizIcon sx={{ color: '#D97706', fontSize: 20 }} /> Lembar Jawaban Pilihan Ganda Teknis ({currentUserReview.singleChoices.length} Soal):
                              </Typography>

                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {currentUserReview.singleChoices.map((item: any, idx: number) => (
                                  <Box
                                    key={idx}
                                    sx={{
                                      p: 2,
                                      borderRadius: 2,
                                      border: '1.5px solid',
                                      borderColor: item.isCorrect ? '#86EFAC' : '#FECACA',
                                      bgcolor: item.isCorrect ? '#F0FDF4' : '#FEF2F2',
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                                        Soal Teknis #{idx + 1}:
                                      </Typography>
                                      <Chip
                                        size="small"
                                        label={item.isCorrect ? `✓ Benar (+${item.points} Poin)` : '✕ Salah (0 Poin)'}
                                        sx={{
                                          bgcolor: item.isCorrect ? '#16A34A' : '#DC2626',
                                          color: '#FFFFFF',
                                          fontWeight: 800,
                                          fontSize: 11,
                                        }}
                                      />
                                    </Box>

                                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600, mb: 1.5, lineHeight: 1.5 }}>
                                      {item.question}
                                    </Typography>

                                    {item.imageUrl && (
                                      <Box sx={{ mb: 1.5 }}>
                                        <Box component="img" src={item.imageUrl} alt={`Diagram Soal ${idx + 1}`} sx={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain', borderRadius: 1.5, border: '1px solid #CBD5E1', bgcolor: '#FFFFFF', p: 1 }} />
                                      </Box>
                                    )}

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.2 }}>
                                      <Box sx={{ p: 1.2, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1.5px solid', borderColor: item.isCorrect ? '#86EFAC' : '#FCA5A5' }}>
                                        <Typography variant="caption" sx={{ color: item.isCorrect ? '#15803D' : '#DC2626', fontWeight: 800, display: 'block' }}>
                                          Jawaban Calon Karyawan:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: item.isCorrect ? '#166534' : '#991B1B', mt: 0.3 }}>
                                          {item.candidateText}
                                        </Typography>
                                      </Box>

                                      <Box sx={{ p: 1.2, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1.5px solid #86EFAC' }}>
                                        <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 800, display: 'block' }}>
                                          Kunci Jawaban Benar:
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#166534', mt: 0.3 }}>
                                          {item.correctText}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
                          <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 700, mb: 0.5 }}>
                            Pelamar Belum Mengikuti Ujian Teknis Kejuruan / Studi Kasus
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 480, mx: 'auto' }}>
                            Ujian teknis departemen belum diselesaikan oleh kandidat. Pantau status pelamar pada Tahap 3 di tabel utama rekrutmen.
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              ID Pelamar: <strong>#{selectedApplicant?.id}</strong> | Terdaftar:{' '}
              {selectedApplicant?.createdAt ? new Date(selectedApplicant.createdAt).toLocaleDateString('id-ID') : '-'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setDetailModalOpen(false)}
            sx={{ bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' }, textTransform: 'none', fontWeight: 700 }}
          >
            Tutup Berkas
          </Button>
        </DialogActions>
      </Dialog>

      {/* IN-APP DOCUMENT PREVIEW MODAL */}
      {docPreview && (
        <Dialog
          open={Boolean(docPreview)}
          onClose={() => setDocPreview(null)}
          maxWidth="md"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: 2.5, overflow: 'hidden' } } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {docPreview.isPdf ? <PdfIcon sx={{ color: '#DC2626' }} /> : <ImageIcon sx={{ color: '#0284C7' }} />}
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Pratinjau Berkas: {docPreview.title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                component="a"
                href={docPreview.url}
                download={`${docPreview.title.replace(/\s+/g, '_')}.${docPreview.isPdf ? 'pdf' : 'jpg'}`}
                startIcon={<DownloadIcon />}
                sx={{ textTransform: 'none', fontWeight: 700, borderColor: '#CBD5E1', color: '#334155' }}
              >
                Unduh Berkas
              </Button>
              <IconButton size="small" onClick={() => setDocPreview(null)} sx={{ color: '#64748B' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#0F172A0A', minHeight: 450 }}>
            {docPreview.isPdf ? (
              <iframe
                src={docPreview.url}
                title={docPreview.title}
                style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 8, backgroundColor: '#FFFFFF' }}
              />
            ) : (
              <Box
                component="img"
                src={docPreview.url}
                alt={docPreview.title}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: 2,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* 2. ADVANCE STAGE MODAL (1-CLICK APPROVAL WITH AUTO-PERSONALIZED MESSAGE & TEST REVIEWS) */}
      <Dialog open={advanceModalOpen} onClose={() => setAdvanceModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: isEditingOfferingOnly ? '#018730' : advanceAction === 'approve' ? '#018730' : '#DC2626' }}>
          {isEditingOfferingOnly
            ? `📄 Edit Format Dokumen Surat Resmi & Tanda Tangan Digital Offering Letter`
            : advanceAction === 'approve'
            ? `✓ Konfirmasi Loloskan ke Tahap ${selectedApplicant?.currentStage + 1}: ${
                RECRUITMENT_STAGES.find((s) => s.number === selectedApplicant?.currentStage + 1)?.name || ''
              }`
            : `✕ Konfirmasi Gugurkan Pelamar pada Tahap ${selectedApplicant?.currentStage}: ${
                RECRUITMENT_STAGES.find((s) => s.number === selectedApplicant?.currentStage)?.name || ''
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
            <Box sx={{ mb: 2.5, p: 2, bgcolor: '#F0FDF4', borderRadius: 2, border: '1px solid #BBF7D0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PsychologyIcon fontSize="small" /> Pengaturan Jadwal, Tempat & Token Ujian Psikotes
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Waktu Mulai Ujian (Start Time)"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={advanceSchedule}
                    onChange={(e) => {
                      setAdvanceSchedule(e.target.value);
                      if (e.target.value) {
                        const start = new Date(e.target.value);
                        const end = new Date(start.getTime() + advanceDuration * 60000);
                        setAdvanceScheduleUntil(formatToLocalDateTimeInput(end));
                      }
                    }}
                    helperText="Ujian baru dapat dibuka mulai tanggal & jam ini"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Batas Waktu Berakhir (End Time / Selesai)"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={advanceScheduleUntil}
                    onChange={(e) => {
                      setAdvanceScheduleUntil(e.target.value);
                      if (e.target.value && advanceSchedule) {
                        const start = new Date(advanceSchedule).getTime();
                        const end = new Date(e.target.value).getTime();
                        if (end > start) {
                          setAdvanceDuration(Math.round((end - start) / 60000));
                        }
                      }
                    }}
                    helperText={`Durasi Pengerjaan: ${advanceDuration} Menit`}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700 }}>
                      Pilihan Durasi Cepat:
                    </Typography>
                    {[
                      { label: '60 Menit (1 Jam)', min: 60 },
                      { label: '90 Menit', min: 90 },
                      { label: '120 Menit (2 Jam)', min: 120 },
                      { label: '1 Hari (24 Jam)', min: 1440 },
                    ].map((d) => (
                      <Chip
                        key={d.min}
                        label={d.label}
                        size="small"
                        clickable
                        onClick={() => {
                          setAdvanceDuration(d.min);
                          if (advanceSchedule) {
                            const start = new Date(advanceSchedule);
                            const end = new Date(start.getTime() + d.min * 60000);
                            setAdvanceScheduleUntil(formatToLocalDateTimeInput(end));
                          }
                        }}
                        sx={{
                          fontSize: 11,
                          bgcolor: advanceDuration === d.min ? '#018730' : '#DCFCE7',
                          color: advanceDuration === d.min ? '#FFFFFF' : '#166534',
                          fontWeight: 700,
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Token Sesi Psikotes"
                      value={advanceToken}
                      onChange={(e) => setAdvanceToken(e.target.value.toUpperCase())}
                      helperText="Default: PSIKO2026 atau acak"
                    />
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
                        setAdvanceToken(`PSIKO-${rnd}`);
                      }}
                      startIcon={<DiceIcon />}
                      sx={{ whiteSpace: 'nowrap', fontWeight: 700, textTransform: 'none', px: 1.5, height: 54, color: '#0369A1', borderColor: '#BAE6FD' }}
                    >
                      Acak
                    </Button>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    Pilihan Lokasi Pelaksanaan Ujian Psikotes:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    <Button
                      size="small"
                      variant={advanceLocation.includes('Portal Karir Online') ? 'contained' : 'outlined'}
                      onClick={() => {
                        setAdvanceLocation('Portal Karir Online PT ITSP');
                        setAdvanceMapsInput('');
                      }}
                      startIcon={<OnlineIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: 11.5,
                        bgcolor: advanceLocation.includes('Portal Karir Online') ? '#018730' : '#FFFFFF',
                        color: advanceLocation.includes('Portal Karir Online') ? '#FFFFFF' : '#018730',
                        borderColor: '#018730',
                      }}
                    >
                      Online Portal Karir
                    </Button>
                    <Button
                      size="small"
                      variant={advanceLocation.includes('KIIC') ? 'contained' : 'outlined'}
                      onClick={() => {
                        setAdvanceLocation('Lab Komputer Plant 1 KIIC Karawang');
                        setAdvanceMapsInput(PLANT_LOCATIONS.kiic.mapsUrl);
                      }}
                      startIcon={<FactoryIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: 11.5,
                        bgcolor: advanceLocation.includes('KIIC') ? '#018730' : '#FFFFFF',
                        color: advanceLocation.includes('KIIC') ? '#FFFFFF' : '#018730',
                        borderColor: '#018730',
                      }}
                    >
                      Onsite: Plant 1 (KIIC Karawang)
                    </Button>
                    <Button
                      size="small"
                      variant={advanceLocation.includes('GIIC') ? 'contained' : 'outlined'}
                      onClick={() => {
                        setAdvanceLocation('Ruang Training Plant 2 GIIC Cikarang');
                        setAdvanceMapsInput(PLANT_LOCATIONS.giic.mapsUrl);
                      }}
                      startIcon={<FactoryIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: 11.5,
                        bgcolor: advanceLocation.includes('GIIC') ? '#018730' : '#FFFFFF',
                        color: advanceLocation.includes('GIIC') ? '#FFFFFF' : '#018730',
                        borderColor: '#018730',
                      }}
                    >
                      Onsite: Plant 2 (GIIC Cikarang)
                    </Button>
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label="Tempat / Lokasi Pelaksanaan Ujian"
                    value={advanceLocation}
                    onChange={(e) => setAdvanceLocation(e.target.value)}
                    placeholder="Contoh: Portal Karir Online PT ITSP atau Lab Komputer Plant 1"
                    sx={{ mb: 1, bgcolor: '#FFFFFF' }}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="Link Google Maps / Tag Maps (<iframe ...>)"
                    value={advanceMapsInput}
                    onChange={(e) => setAdvanceMapsInput(e.target.value)}
                    placeholder="Kosongkan untuk memakai peta resmi PT ITSP, atau paste link/tag iframe kustom"
                    helperText="Peta rute maps ini akan disematkan ke email undangan & dashboard portal pelamar bila ujian dilakukan di pabrik."
                    sx={{ mb: 1, bgcolor: '#FFFFFF' }}
                  />

                  {(() => {
                    const resolvedMaps = advanceMapsInput.trim() ? getPlantMapsUrl(advanceMapsInput.trim()) : getPlantMapsUrl(advanceLocation);
                    if (!resolvedMaps) return null;
                    return (
                      <Box sx={{ p: 1, bgcolor: '#DCFCE7', borderRadius: 1.5, border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700 }}>
                          🗺️ Google Maps Terhubung: {advanceLocation.includes('GIIC') ? 'Plant 2 GIIC' : advanceLocation.includes('KIIC') ? 'Plant 1 KIIC' : 'Peta Kustom'}
                        </Typography>
                        <Button size="small" href={resolvedMaps} target="_blank" sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none', color: '#166534', py: 0.2 }}>
                          Uji Buka Maps &rarr;
                        </Button>
                      </Box>
                    );
                  })()}
                </Grid>
              </Grid>
            </Box>
          )}

          {advanceAction === 'approve' && selectedApplicant?.currentStage === 2 && (
            <Box sx={{ mb: 2.5, p: 2, bgcolor: '#FFFBEB', borderRadius: 2, border: '1px solid #FDE68A' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EngineeringIcon fontSize="small" /> Pengaturan Jadwal, Tempat & Token Tes Teknis User
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Waktu Mulai Ujian Teknis (Start Time)"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={advanceSchedule}
                    onChange={(e) => {
                      setAdvanceSchedule(e.target.value);
                      if (e.target.value) {
                        const start = new Date(e.target.value);
                        const end = new Date(start.getTime() + advanceDuration * 60000);
                        setAdvanceScheduleUntil(formatToLocalDateTimeInput(end));
                      }
                    }}
                    helperText="Ujian baru dapat dibuka mulai tanggal & jam ini"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Batas Waktu Berakhir (End Time / Selesai)"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={advanceScheduleUntil}
                    onChange={(e) => {
                      setAdvanceScheduleUntil(e.target.value);
                      if (e.target.value && advanceSchedule) {
                        const start = new Date(advanceSchedule).getTime();
                        const end = new Date(e.target.value).getTime();
                        if (end > start) {
                          setAdvanceDuration(Math.round((end - start) / 60000));
                        }
                      }
                    }}
                    helperText={`Durasi Pengerjaan: ${advanceDuration} Menit`}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700 }}>
                      Pilihan Durasi Cepat:
                    </Typography>
                    {[
                      { label: '60 Menit (1 Jam)', min: 60 },
                      { label: '90 Menit', min: 90 },
                      { label: '120 Menit (2 Jam)', min: 120 },
                      { label: '1 Hari (24 Jam)', min: 1440 },
                    ].map((d) => (
                      <Chip
                        key={d.min}
                        label={d.label}
                        size="small"
                        clickable
                        onClick={() => {
                          setAdvanceDuration(d.min);
                          if (advanceSchedule) {
                            const start = new Date(advanceSchedule);
                            const end = new Date(start.getTime() + d.min * 60000);
                            setAdvanceScheduleUntil(formatToLocalDateTimeInput(end));
                          }
                        }}
                        sx={{
                          fontSize: 11,
                          bgcolor: advanceDuration === d.min ? '#D97706' : '#FEF3C7',
                          color: advanceDuration === d.min ? '#FFFFFF' : '#92400E',
                          fontWeight: 700,
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Token Ujian Teknis User"
                      value={advanceToken}
                      onChange={(e) => setAdvanceToken(e.target.value.toUpperCase())}
                      helperText="Default: USER2026 atau TECH2026"
                    />
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
                        setAdvanceToken(`TECH-${rnd}`);
                      }}
                      startIcon={<DiceIcon />}
                      sx={{ whiteSpace: 'nowrap', fontWeight: 700, textTransform: 'none', px: 1.5, height: 54, color: '#92400E', borderColor: '#FDE68A' }}
                    >
                      Acak
                    </Button>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700, display: 'block', mb: 0.5 }}>
                    Pilihan Lokasi Pelaksanaan Ujian Teknis User:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    <Button
                      size="small"
                      variant={advanceLocation.includes('Portal Karir Online') ? 'contained' : 'outlined'}
                      onClick={() => {
                        setAdvanceLocation('Portal Karir Online PT ITSP');
                        setAdvanceMapsInput('');
                      }}
                      startIcon={<OnlineIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: 11.5,
                        bgcolor: advanceLocation.includes('Portal Karir Online') ? '#D97706' : '#FFFFFF',
                        color: advanceLocation.includes('Portal Karir Online') ? '#FFFFFF' : '#D97706',
                        borderColor: '#D97706',
                      }}
                    >
                      Online Portal Karir
                    </Button>
                    <Button
                      size="small"
                      variant={advanceLocation.includes('KIIC') ? 'contained' : 'outlined'}
                      onClick={() => {
                        setAdvanceLocation('Workshop Mold & Die Plant 1 KIIC Karawang');
                        setAdvanceMapsInput(PLANT_LOCATIONS.kiic.mapsUrl);
                      }}
                      startIcon={<FactoryIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: 11.5,
                        bgcolor: advanceLocation.includes('KIIC') ? '#D97706' : '#FFFFFF',
                        color: advanceLocation.includes('KIIC') ? '#FFFFFF' : '#D97706',
                        borderColor: '#D97706',
                      }}
                    >
                      Onsite: Plant 1 (KIIC Karawang)
                    </Button>
                    <Button
                      size="small"
                      variant={advanceLocation.includes('GIIC') ? 'contained' : 'outlined'}
                      onClick={() => {
                        setAdvanceLocation('Ruang Engineering Plant 2 GIIC Cikarang');
                        setAdvanceMapsInput(PLANT_LOCATIONS.giic.mapsUrl);
                      }}
                      startIcon={<FactoryIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: 11.5,
                        bgcolor: advanceLocation.includes('GIIC') ? '#D97706' : '#FFFFFF',
                        color: advanceLocation.includes('GIIC') ? '#FFFFFF' : '#D97706',
                        borderColor: '#D97706',
                      }}
                    >
                      Onsite: Plant 2 (GIIC Cikarang)
                    </Button>
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    label="Tempat / Lokasi Pelaksanaan Ujian Teknis"
                    value={advanceLocation}
                    onChange={(e) => setAdvanceLocation(e.target.value)}
                    placeholder="Contoh: Portal Karir Online PT ITSP atau Workshop Mold & Die Plant 1"
                    sx={{ mb: 1, bgcolor: '#FFFFFF' }}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    label="Link Google Maps / Tag Maps (<iframe ...>)"
                    value={advanceMapsInput}
                    onChange={(e) => setAdvanceMapsInput(e.target.value)}
                    placeholder="Kosongkan untuk memakai peta resmi PT ITSP, atau paste link/tag iframe kustom"
                    helperText="Peta rute maps ini akan disematkan ke email undangan & dashboard portal pelamar bila ujian dilakukan di pabrik."
                    sx={{ mb: 1, bgcolor: '#FFFFFF' }}
                  />

                  {(() => {
                    const resolvedMaps = advanceMapsInput.trim() ? getPlantMapsUrl(advanceMapsInput.trim()) : getPlantMapsUrl(advanceLocation);
                    if (!resolvedMaps) return null;
                    return (
                      <Box sx={{ p: 1, bgcolor: '#FEF3C7', borderRadius: 1.5, border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700 }}>
                          🗺️ Google Maps Terhubung: {advanceLocation.includes('GIIC') ? 'Plant 2 GIIC' : advanceLocation.includes('KIIC') ? 'Plant 1 KIIC' : 'Peta Kustom'}
                        </Typography>
                        <Button size="small" href={resolvedMaps} target="_blank" sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none', color: '#92400E', py: 0.2 }}>
                          Uji Buka Maps &rarr;
                        </Button>
                      </Box>
                    );
                  })()}
                </Grid>
              </Grid>
            </Box>
          )}

          {/* TAHAP 3 -> 4: ATUR JADWAL INTERVIEW HR LANGSUNG */}
          {advanceAction === 'approve' && selectedApplicant?.currentStage === 3 && (
            <Box sx={{ mb: 2.5, p: 2, bgcolor: '#F0FDF4', borderRadius: 2, border: '1.5px solid #86EFAC' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InterviewIcon fontSize="small" /> Atur Jadwal Interview HR Recruitment (Tahap 4)
                </Typography>
                <Chip size="small" label="Undangan Otomatis Email" sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700 }} />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Tanggal & Waktu Interview HR"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={advanceSchedule}
                    onChange={(e) => setAdvanceSchedule(e.target.value)}
                    helperText="Kandidat wajib hadir/terhubung pada waktu ini"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nama Pewawancara / Tim HR"
                    value={advanceInterviewerName}
                    onChange={(e) => setAdvanceInterviewerName(e.target.value)}
                    placeholder="Contoh: HR Recruitment Team PT ITSP"
                    helperText="Ditampilkan pada surat undangan kandidat"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, display: 'block', mb: 0.8 }}>
                    Mode Pelaksanaan Interview HR:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                    <Button
                      size="small"
                      variant={advanceInterviewMode === 'online' ? 'contained' : 'outlined'}
                      onClick={() => setAdvanceInterviewMode('online')}
                      startIcon={<OnlineIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: advanceInterviewMode === 'online' ? '#018730' : '#FFFFFF',
                        color: advanceInterviewMode === 'online' ? '#FFFFFF' : '#018730',
                        borderColor: '#018730',
                      }}
                    >
                      Online Video Conference (Teams / Zoom / Meet)
                    </Button>
                    <Button
                      size="small"
                      variant={advanceInterviewMode === 'onsite' ? 'contained' : 'outlined'}
                      onClick={() => setAdvanceInterviewMode('onsite')}
                      startIcon={<FactoryIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: advanceInterviewMode === 'onsite' ? '#018730' : '#FFFFFF',
                        color: advanceInterviewMode === 'onsite' ? '#FFFFFF' : '#018730',
                        borderColor: '#018730',
                      }}
                    >
                      Onsite Tatap Muka di Pabrik
                    </Button>
                  </Stack>
                </Grid>

                {advanceInterviewMode === 'online' ? (
                  <>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Platform Meeting"
                        value={advanceMeetingPlatform}
                        onChange={(e) => setAdvanceMeetingPlatform(e.target.value)}
                        sx={{ bgcolor: '#FFFFFF' }}
                      >
                        <MenuItem value="teams">Microsoft Teams</MenuItem>
                        <MenuItem value="zoom">Zoom Meeting</MenuItem>
                        <MenuItem value="google_meet">Google Meet</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Link URL Virtual Meeting"
                        placeholder="https://teams.microsoft.com/l/meetup-join/... atau link Zoom"
                        value={advanceMeetingLink}
                        onChange={(e) => setAdvanceMeetingLink(e.target.value)}
                        sx={{ bgcolor: '#FFFFFF' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Meeting ID / Passcode (Opsional)"
                        placeholder="Meeting ID: 123 456 789 | Passcode: ITSP2026"
                        value={advanceMeetingPasscode}
                        onChange={(e) => setAdvanceMeetingPasscode(e.target.value)}
                        sx={{ bgcolor: '#FFFFFF' }}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Lokasi Pabrik ITSP"
                        value={advancePlantChoice}
                        onChange={(e: any) => {
                          setAdvancePlantChoice(e.target.value);
                          if (e.target.value === 'kiic') {
                            setAdvanceMapsInput(PLANT_LOCATIONS.kiic.mapsUrl);
                          } else if (e.target.value === 'giic') {
                            setAdvanceMapsInput(PLANT_LOCATIONS.giic.mapsUrl);
                          } else {
                            setAdvanceMapsInput('');
                          }
                        }}
                        sx={{ bgcolor: '#FFFFFF' }}
                      >
                        <MenuItem value="kiic">Plant 1 (KIIC Karawang Barat)</MenuItem>
                        <MenuItem value="giic">Plant 2 (GIIC Cikarang Pusat)</MenuItem>
                        <MenuItem value="custom">Lokasi Kantor / Alamat Kustom</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Nama Ruangan Meeting"
                        value={advanceRoom}
                        onChange={(e) => setAdvanceRoom(e.target.value)}
                        placeholder="Contoh: Ruang Meeting HCM Lt. 2 (Gedung Admin)"
                        sx={{ bgcolor: '#FFFFFF' }}
                      />
                    </Grid>
                    {advancePlantChoice === 'custom' && (
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Alamat Lengkap Kustom"
                          value={advanceCustomAddress}
                          onChange={(e) => setAdvanceCustomAddress(e.target.value)}
                          sx={{ bgcolor: '#FFFFFF' }}
                        />
                      </Grid>
                    )}
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Link Google Maps Lokasi Pabrik"
                        value={advanceMapsInput}
                        onChange={(e) => setAdvanceMapsInput(e.target.value)}
                        placeholder="Biarkan default atau paste link Google Maps kustom"
                        sx={{ bgcolor: '#FFFFFF' }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}

          {/* TAHAP 4 -> 5: ATUR JADWAL INTERVIEW USER LANGSUNG */}
          {advanceAction === 'approve' && selectedApplicant?.currentStage === 4 && (
            <Box sx={{ mb: 2.5, p: 2, bgcolor: '#FFFBEB', borderRadius: 2, border: '1.5px solid #FCD34D' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InterviewIcon fontSize="small" /> Atur Jadwal Interview Teknis User Departemen (Tahap 5)
                </Typography>
                <Chip size="small" label="Undangan Otomatis Email" sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 700 }} />
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Tanggal & Waktu Interview User"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={advanceSchedule}
                    onChange={(e) => setAdvanceSchedule(e.target.value)}
                    helperText="Kandidat wajib hadir/terhubung pada waktu ini"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nama Pewawancara (User Dept Supervisor/Manager)"
                    value={advanceInterviewerName}
                    onChange={(e) => setAdvanceInterviewerName(e.target.value)}
                    placeholder={`Pimpinan User Departemen ${selectedApplicant?.jobPosting?.department || ''}`}
                    helperText="Ditampilkan pada surat undangan kandidat"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700, display: 'block', mb: 0.8 }}>
                    Mode Pelaksanaan Interview User:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                    <Button
                      size="small"
                      variant={advanceInterviewMode === 'online' ? 'contained' : 'outlined'}
                      onClick={() => setAdvanceInterviewMode('online')}
                      startIcon={<OnlineIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: advanceInterviewMode === 'online' ? '#D97706' : '#FFFFFF',
                        color: advanceInterviewMode === 'online' ? '#FFFFFF' : '#D97706',
                        borderColor: '#D97706',
                      }}
                    >
                      Online Video Conference (Teams / Zoom / Meet)
                    </Button>
                    <Button
                      size="small"
                      variant={advanceInterviewMode === 'onsite' ? 'contained' : 'outlined'}
                      onClick={() => setAdvanceInterviewMode('onsite')}
                      startIcon={<FactoryIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: advanceInterviewMode === 'onsite' ? '#D97706' : '#FFFFFF',
                        color: advanceInterviewMode === 'onsite' ? '#FFFFFF' : '#D97706',
                        borderColor: '#D97706',
                      }}
                    >
                      Onsite Tatap Muka di Pabrik
                    </Button>
                  </Stack>
                </Grid>

                {advanceInterviewMode === 'online' ? (
                  <>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Platform Meeting"
                        value={advanceMeetingPlatform}
                        onChange={(e) => setAdvanceMeetingPlatform(e.target.value)}
                        sx={{ bgcolor: '#FFFFFF' }}
                      >
                        <MenuItem value="teams">Microsoft Teams</MenuItem>
                        <MenuItem value="zoom">Zoom Meeting</MenuItem>
                        <MenuItem value="google_meet">Google Meet</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Link URL Virtual Meeting"
                        placeholder="https://teams.microsoft.com/l/meetup-join/... atau link Zoom"
                        value={advanceMeetingLink}
                        onChange={(e) => setAdvanceMeetingLink(e.target.value)}
                        sx={{ bgcolor: '#FFFFFF' }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Meeting ID / Passcode (Opsional)"
                        placeholder="Meeting ID: 123 456 789 | Passcode: ITSP2026"
                        value={advanceMeetingPasscode}
                        onChange={(e) => setAdvanceMeetingPasscode(e.target.value)}
                        sx={{ bgcolor: '#FFFFFF' }}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Lokasi Pabrik ITSP"
                        value={advancePlantChoice}
                        onChange={(e: any) => {
                          setAdvancePlantChoice(e.target.value);
                          if (e.target.value === 'kiic') {
                            setAdvanceMapsInput(PLANT_LOCATIONS.kiic.mapsUrl);
                          } else if (e.target.value === 'giic') {
                            setAdvanceMapsInput(PLANT_LOCATIONS.giic.mapsUrl);
                          } else {
                            setAdvanceMapsInput('');
                          }
                        }}
                        sx={{ bgcolor: '#FFFFFF' }}
                      >
                        <MenuItem value="kiic">Plant 1 (KIIC Karawang Barat)</MenuItem>
                        <MenuItem value="giic">Plant 2 (GIIC Cikarang Pusat)</MenuItem>
                        <MenuItem value="custom">Lokasi Kantor / Alamat Kustom</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Nama Ruangan Meeting"
                        value={advanceRoom}
                        onChange={(e) => setAdvanceRoom(e.target.value)}
                        placeholder={`Contoh: Ruang Meeting Divisi ${selectedApplicant?.jobPosting?.department || 'Terkait'}`}
                        sx={{ bgcolor: '#FFFFFF' }}
                      />
                    </Grid>
                    {advancePlantChoice === 'custom' && (
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Alamat Lengkap Kustom"
                          value={advanceCustomAddress}
                          onChange={(e) => setAdvanceCustomAddress(e.target.value)}
                          sx={{ bgcolor: '#FFFFFF' }}
                        />
                      </Grid>
                    )}
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Link Google Maps Lokasi Pabrik"
                        value={advanceMapsInput}
                        onChange={(e) => setAdvanceMapsInput(e.target.value)}
                        placeholder="Biarkan default atau paste link Google Maps kustom"
                        sx={{ bgcolor: '#FFFFFF' }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}

          {advanceAction === 'approve' && selectedApplicant?.currentStage === 5 && (
            <Box sx={{ mb: 2.5, p: 2.5, bgcolor: '#F0FDFA', borderRadius: 2, border: '1.5px solid #5EEAD4' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F766E', display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <VerifiedIcon fontSize="small" /> Surat Rujukan Medical Check-Up (Tahap 6: MCU)
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  href="/admin/settings"
                  target="_blank"
                  startIcon={<TuneIcon sx={{ fontSize: 14 }} />}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5, borderColor: '#0D9488', color: '#0D9488' }}
                >
                  ⚙️ Pengaturan Klinik MCU & Peta &rarr;
                </Button>
              </Box>
              <Typography variant="body2" sx={{ color: '#134E4A', fontSize: 13 }}>
                Kandidat akan menerima surat pengantar rujukan resmi ke fasilitas kesehatan rekanan PT ITSP. Rincian nama klinik, alamat rujukan, estimasi biaya, petunjuk puasa, dan tombol rute Google Maps klinik dimuat secara otomatis dari master pengaturan.
              </Typography>
            </Box>
          )}

          {/* STAGE 6 -> 7 / EDIT OFFERING: EDITOR FORMAT OFFERING & TANDA TANGAN DIGITAL HR */}
          {(isEditingOfferingOnly || (advanceAction === 'approve' && selectedApplicant?.currentStage === 6)) && (
            <Box sx={{ mb: 3 }}>
              {/* HEADER INFO & PREVIEW BUTTON */}
              <Box sx={{ p: 2, bgcolor: '#ECFDF5', border: '1.5px solid #10B981', borderRadius: 2, mb: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#065F46', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DocIcon sx={{ color: '#018730' }} /> Format Dokumen Surat Penawaran Resmi & Tanda Tangan Digital HR
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#047857' }}>
                    Dokumen ber-kop resmi PT ITSP akan diterbitkan otomatis. Anda dapat mengatur nomor surat, kompensasi, tanggal join, klausul kerja, serta membubuhkan tanda tangan digital HR yang sah.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={() => {
                    const html = generateOfferingLetterHtml({
                      candidateName: selectedApplicant?.fullName || 'Kandidat',
                      candidateId: selectedApplicant?.id,
                      position: selectedApplicant?.jobPosting?.title || 'Staff Operasional',
                      department: selectedApplicant?.jobPosting?.department || 'Operasional',
                      location: selectedApplicant?.jobPosting?.location || 'Plant PT ITSP Karawang',
                      salary: advanceSalary.trim()
                        ? `Rp. ${advanceSalary.trim()}${advanceAllowance.trim() ? ` ${advanceAllowance.trim().startsWith('+') ? advanceAllowance.trim() : `+ ${advanceAllowance.trim()}`}` : ''}`
                        : 'Sesuai Standar Kompensasi PT ITSP',
                      joinDate: advanceOfferingJoinDate.trim() || undefined,
                      refNumber: advanceOfferingRefNum.trim() || undefined,
                      clauses: advanceOfferingClauses.trim() || undefined,
                      notes: advanceNotes.trim() || undefined,
                      signerName: advanceOfferingSignerName.trim() || undefined,
                      signerTitle: advanceOfferingSignerTitle.trim() || undefined,
                      signerSignature: advanceOfferingSignature.trim() || undefined,
                    });
                    openOfferingLetterWindow(html, false);
                  }}
                  sx={{ bgcolor: '#018730', fontWeight: 800, textTransform: 'none', borderRadius: 1.5, boxShadow: '0 2px 8px rgba(1,135,48,0.25)', '&:hover': { bgcolor: '#005c21' } }}
                >
                  👁️ Pratinjau Surat Resmi
                </Button>
              </Box>

              {/* 1. NOMOR SURAT & JADWAL MULAI BEKERJA */}
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  📋 1. Administrasi Surat & Tanggal Masuk Kerja (Join Date):
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nomor Registrasi Surat Resmi (Korporat)"
                    value={advanceOfferingRefNum}
                    onChange={(e) => setAdvanceOfferingRefNum(e.target.value)}
                    placeholder="Contoh: ITSP/HRD-REC/OL/2026/0001"
                    helperText="Nomor surat korporat tercetak pada kop surat resmi"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Tanggal Mulai Bekerja (Join Date)"
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <ScheduleIcon sx={{ color: '#018730', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    value={
                      /^\d{4}-\d{2}-\d{2}$/.test(advanceOfferingJoinDate)
                        ? advanceOfferingJoinDate
                        : ''
                    }
                    onChange={(e) => setAdvanceOfferingJoinDate(e.target.value)}
                    helperText={
                      advanceOfferingJoinDate && /^\d{4}-\d{2}-\d{2}$/.test(advanceOfferingJoinDate)
                        ? `📅 Terpilih: ${new Date(`${advanceOfferingJoinDate}T00:00:00`).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}`
                        : 'Pilih tanggal kalender mulai aktif bekerja di PT ITSP'
                    }
                  />
                  {/* Preset Pilihan Tanggal Cepat */}
                  <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mt: 0.8 }}>
                    {[
                      {
                        label: 'Senin Depan',
                        getDate: () => {
                          const d = new Date();
                          const day = d.getDay();
                          const diff = (day === 0 ? 1 : 8 - day);
                          d.setDate(d.getDate() + diff);
                          return d.toISOString().split('T')[0];
                        },
                      },
                      {
                        label: 'Awal Bulan Depan',
                        getDate: () => {
                          const d = new Date();
                          d.setMonth(d.getMonth() + 1, 1);
                          return d.toISOString().split('T')[0];
                        },
                      },
                      {
                        label: '2 Minggu Lagi',
                        getDate: () => {
                          const d = new Date();
                          d.setDate(d.getDate() + 14);
                          return d.toISOString().split('T')[0];
                        },
                      },
                    ].map((p) => (
                      <Chip
                        key={p.label}
                        size="small"
                        icon={<ScheduleIcon sx={{ fontSize: '13px !important' }} />}
                        label={p.label}
                        clickable
                        onClick={() => setAdvanceOfferingJoinDate(p.getDate())}
                        sx={{ fontSize: 10.5, bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#DCFCE7', color: '#166534' } }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>

              {/* 2. PAKET KOMPENSASI GAJI & TUNJANGAN */}
              <Box sx={{ mt: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
                  💵 2. Paket Kompensasi Gaji Pokok & Tunjangan (Format Rupiah Otomatis):
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 1.5 }}>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <TextField
                    fullWidth
                    label="Penawaran Gaji Pokok (Nominal Rupiah)"
                    placeholder="Ketik angka, misal: 6000000"
                    value={advanceSalary}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      if (!digits) {
                        setAdvanceSalary('');
                        return;
                      }
                      const formatted = new Intl.NumberFormat('id-ID').format(Number(digits));
                      setAdvanceSalary(formatted);
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography sx={{ fontWeight: 900, color: '#018730', fontSize: 15, mr: 0.5 }}>
                              Rp.
                            </Typography>
                          </InputAdornment>
                        ),
                      },
                    }}
                    helperText={advanceSalary ? `Terbaca: Rp. ${advanceSalary},-` : 'Ketik nominal angka, tanda baca Rp. dan titik ribuan diformat otomatis'}
                  />
                  {/* Preset Nominal Cepat */}
                  <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mt: 0.8 }}>
                    {['5.500.000', '6.000.000', '6.500.000', '7.000.000'].map((val) => (
                      <Chip
                        key={val}
                        size="small"
                        label={`Rp. ${val}`}
                        clickable
                        onClick={() => setAdvanceSalary(val)}
                        sx={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          bgcolor: advanceSalary === val ? '#DCFCE7' : '#F8FAFC',
                          color: advanceSalary === val ? '#166534' : '#475569',
                          border: '1px solid #E2E8F0',
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    fullWidth
                    label="Tunjangan Tambahan (Opsional)"
                    placeholder="Contoh: + Tunjangan Shift"
                    value={advanceAllowance}
                    onChange={(e) => setAdvanceAllowance(e.target.value)}
                    helperText="Keterangan tunjangan tambahan"
                  />
                </Grid>
              </Grid>

              {/* CHIP TUNJANGAN CEPAT */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Pilihan Cepat:
                </Typography>
                {[
                  '+ Tunjangan Shift & Transport',
                  '+ BPJS & Fasilitas Makan',
                  'Nett (Gaji Bersih)',
                  'Gross (Sebelum Pajak)',
                ].map((txt) => (
                  <Chip
                    key={txt}
                    size="small"
                    label={txt}
                    clickable
                    onClick={() => {
                      if (!advanceAllowance) {
                        setAdvanceAllowance(txt);
                      } else if (!advanceAllowance.includes(txt)) {
                        setAdvanceAllowance(`${advanceAllowance}, ${txt}`);
                      }
                    }}
                    sx={{
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: advanceAllowance.includes(txt) ? '#DCFCE7' : '#F1F5F9',
                      color: advanceAllowance.includes(txt) ? '#15803D' : '#475569',
                      border: advanceAllowance.includes(txt) ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                      '&:hover': { bgcolor: '#E2E8F0' },
                    }}
                  />
                ))}
              </Box>

              {advanceSalary && (
                <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700 }}>
                    Tampilan Paket Kompensasi Resmi:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#018730', fontWeight: 800 }}>
                    Rp. {advanceSalary} {advanceAllowance ? `(${advanceAllowance})` : ''}
                  </Typography>
                </Box>
              )}

              {/* 3. KLAUSUL & KETENTUAN POKOK HUBUNGAN KERJA (DAPAT DIEDIT HR) */}
              <Box sx={{ mb: 2.5, p: 2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    ⚖️ Terms Pokok Hubungan Kerja / Klausul Perjanjian (Dapat Diedit):
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setAdvanceOfferingClauses(DEFAULT_OFFERING_CLAUSES)}
                    sx={{ textTransform: 'none', fontSize: 11, fontWeight: 700, color: '#64748B' }}
                  >
                    Reset ke Klausul Standar PT ITSP
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1 }}>
                  Tiap baris nomor akan diubah menjadi poin klausul resmi pada dokumen cetak PDF korporat.
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  value={advanceOfferingClauses}
                  onChange={(e) => setAdvanceOfferingClauses(e.target.value)}
                  placeholder="Ketik klausul-klausul perjanjian kerja..."
                />
              </Box>

              {/* 4. TANDA TANGAN DIGITAL RESMI HR (E-SIGNATURE & STEMPEL RESMI) */}
              <Box sx={{ p: 2.5, bgcolor: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 2.5, mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🖋️ Tanda Tangan Digital Resmi HR (Digital Signature & Pengesahan Dokumen):
                </Typography>
                <Typography variant="body2" sx={{ color: '#14532D', fontSize: 13, mb: 2 }}>
                  Tanda tangan digital ini akan disematkan secara resmi pada kolom Pihak Pertama (Pemberi Penawaran) di surat penawaran kerja korporat PT ITSP.
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Nama Pejabat HR Penandatangan"
                      value={advanceOfferingSignerName}
                      onChange={(e) => setAdvanceOfferingSignerName(e.target.value)}
                      placeholder="Contoh: Budi Santoso, S.Psi."
                      helperText="Nama lengkap pejabat yang bertanda tangan"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Jabatan / Departemen Penandatangan"
                      value={advanceOfferingSignerTitle}
                      onChange={(e) => setAdvanceOfferingSignerTitle(e.target.value)}
                      placeholder="Contoh: Human Capital & Recruitment Manager"
                      helperText="Jabatan struktural penandatangan"
                    />
                  </Grid>
                </Grid>

                {/* PILIHAN METODE TANDA TANGAN DIGITAL */}
                <Box sx={{ mb: 1.5, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant={advanceOfferingSignMode === 'draw' ? 'contained' : 'outlined'}
                    onClick={() => setAdvanceOfferingSignMode('draw')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      bgcolor: advanceOfferingSignMode === 'draw' ? '#018730' : 'transparent',
                      color: advanceOfferingSignMode === 'draw' ? '#FFFFFF' : '#018730',
                      borderColor: '#018730',
                      '&:hover': { bgcolor: advanceOfferingSignMode === 'draw' ? '#005c21' : '#DCFCE7' },
                    }}
                  >
                    ✍️ Gores di Kanvas
                  </Button>
                  <Button
                    size="small"
                    variant={advanceOfferingSignMode === 'upload' ? 'contained' : 'outlined'}
                    onClick={() => setAdvanceOfferingSignMode('upload')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      bgcolor: advanceOfferingSignMode === 'upload' ? '#018730' : 'transparent',
                      color: advanceOfferingSignMode === 'upload' ? '#FFFFFF' : '#018730',
                      borderColor: '#018730',
                      '&:hover': { bgcolor: advanceOfferingSignMode === 'upload' ? '#005c21' : '#DCFCE7' },
                    }}
                  >
                    📤 Unggah Gambar Tanda Tangan / Stempel
                  </Button>
                </Box>

                {advanceOfferingSignMode === 'draw' ? (
                  <DigitalSignatureCanvas
                    value={advanceOfferingSignature}
                    onChange={(sigData) => setAdvanceOfferingSignature(sigData)}
                  />
                ) : (
                  <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      id="hr-signature-upload"
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
                          setAdvanceOfferingSignature(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <label htmlFor="hr-signature-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadIcon />}
                        sx={{ color: '#018730', borderColor: '#018730', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#F0FDF4' } }}
                      >
                        Pilih Gambar Scan Tanda Tangan / Stempel (PNG/JPG)
                      </Button>
                    </label>
                    <Typography variant="caption" sx={{ display: 'block', color: '#64748B', mt: 0.8 }}>
                      Disarankan menggunakan gambar PNG transparan (Maks. 2 MB).
                    </Typography>
                  </Box>
                )}

                {/* PRATINJAU STATUS TANDA TANGAN DIGITAL AKTIF */}
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 0.5, px: 1, bgcolor: '#DCFCE7', borderRadius: 1, border: '1px solid #86EFAC' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534' }}>
                        ✓ Tanda Tangan Elektronik HR
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      {advanceOfferingSignerName || 'Pejabat HR'} ({advanceOfferingSignerTitle})
                    </Typography>
                  </Box>

                  {advanceOfferingSignature ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        component="img"
                        src={advanceOfferingSignature}
                        alt="Signature Preview"
                        sx={{ height: 42, maxWidth: 120, objectFit: 'contain', border: '1px dashed #94A3B8', borderRadius: 1, p: 0.3 }}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setAdvanceOfferingSignature('')}
                        sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none' }}
                      >
                        Hapus Tanda Tangan
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 600 }}>
                      *Belum ada goresan/gambar tanda tangan (akan menggunakan cap validasi sistem resmi jika kosong).
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* 5. ATTACHMENT PDF TAMBAHAN (OPSIONAL) */}
              <Accordion sx={{ border: '1px solid #E2E8F0', borderRadius: '8px !important', '&:before': { display: 'none' }, boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PdfIcon sx={{ color: '#EF4444', fontSize: 18 }} /> Lampiran Berkas PDF Fisik Tambahan (Opsional)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5 }}>
                    Jika HR memiliki berkas PDF terpisah dari luar yang ingin dilampirkan langsung ke calon karyawan, Anda dapat mengunggahnya di sini.
                  </Typography>

                  {advanceOfferingFile ? (
                    <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        📄 {advanceOfferingFile.name} ({(advanceOfferingFile.size / 1024).toFixed(1)} KB)
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            const w = window.open('');
                            w?.document.write(`<iframe src="${advanceOfferingFile.base64}" style="width:100%;height:100%;border:none;"></iframe>`);
                          }}
                          sx={{ textTransform: 'none', fontSize: 11 }}
                        >
                          Lihat
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => setAdvanceOfferingFile(null)}
                          sx={{ textTransform: 'none', fontSize: 11 }}
                        >
                          Hapus
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        id="offering-pdf-upload"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            alert('Ukuran file maksimal 5 MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => {
                            setAdvanceOfferingFile({
                              name: file.name,
                              size: file.size,
                              base64: reader.result as string,
                            });
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <label htmlFor="offering-pdf-upload">
                        <Button
                          variant="outlined"
                          size="small"
                          component="span"
                          startIcon={<UploadIcon />}
                          sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                          Unggah Lampiran PDF Khusus (Opsional)
                        </Button>
                      </label>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            </Box>
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
            className="notranslate"
            translate="no"
            sx={{
              bgcolor: isEditingOfferingOnly ? '#018730' : advanceAction === 'approve' ? '#018730' : '#DC2626',
              fontWeight: 700,
              px: 3,
              '&:hover': {
                bgcolor: isEditingOfferingOnly ? '#005c21' : advanceAction === 'approve' ? '#005c21' : '#B91C1C',
              },
            }}
          >
            <span className="notranslate" translate="no">
              {processing
                ? 'Memproses...'
                : isEditingOfferingOnly
                ? '💾 Simpan Format & Tanda Tangan Dokumen Offering'
                : advanceAction === 'approve'
                ? selectedApplicant?.currentStage === 6
                  ? '✓ Loloskan & Terbitkan Offering Letter Resmi'
                  : `✓ Loloskan ke Tahap ${selectedApplicant?.currentStage + 1} & Kirim Notifikasi Email`
                : '✕ Konfirmasi Gugurkan Pelamar'}
            </span>
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2c. SUPER ADMIN STAGE OVERRIDE MODAL (MAJU / MUNDURKAN TAHAP MANUAL) */}
      <Dialog open={overrideModalOpen} onClose={() => setOverrideModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#7C3AED', display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneIcon /> Menu Super Admin: Maju / Mundurkan Tahap Seleksi
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2, p: 2, bgcolor: '#F5F3FF', borderRadius: 2, border: '1px solid #DDD6FE' }}>
            <Typography variant="body2" sx={{ color: '#4C1D95', fontWeight: 700, mb: 0.5 }}>
              Kandidat: {selectedApplicant?.fullName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6D28D9', display: 'block', mb: 1 }}>
              Posisi: {selectedApplicant?.jobPosting?.title} ({selectedApplicant?.jobPosting?.department || 'Umum'})
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" sx={{ color: '#4C1D95', fontWeight: 600 }}>
                Tahap Saat Ini:
              </Typography>
              <Chip
                size="small"
                label={`Tahap ${selectedApplicant?.currentStage}: ${
                  RECRUITMENT_STAGES.find((s) => s.number === selectedApplicant?.currentStage)?.shortName || ''
                } (${selectedApplicant?.stageStatus || 'in_progress'})`}
                sx={{ bgcolor: '#7C3AED', color: '#FFFFFF', fontWeight: 700, fontSize: 11 }}
              />
            </Stack>
          </Box>

          <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2, fontSize: 12.5 }}>
            <strong>Perhatian Super Admin:</strong> Menu ini mengizinkan Anda memindahkan status pelamar secara bebas ke tahap mana pun (Tahap 1 s/d 7), baik memajukan maupun memundurkan tahapan. Nilai tes dan riwayat pengerjaan kandidat sebelumnya tetap aman tersimpan.
          </Alert>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <TextField
                select
                fullWidth
                label="Pindah ke Target Tahap"
                value={overrideTargetStage}
                onChange={(e) => setOverrideTargetStage(Number(e.target.value))}
                helperText="Pilih tahap baru untuk pelamar ini"
              >
                {RECRUITMENT_STAGES.map((s) => (
                  <MenuItem key={s.number} value={s.number}>
                    Tahap {s.number}: {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                select
                fullWidth
                label="Status Tahap"
                value={overrideStageStatus}
                onChange={(e: any) => setOverrideStageStatus(e.target.value)}
                helperText="Status kelolosan pada tahap target"
              >
                <MenuItem value="in_progress">Sedang Berjalan (Aktif)</MenuItem>
                <MenuItem value="passed">Lolos (Passed)</MenuItem>
                <MenuItem value="failed">Gugur (Failed)</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Alasan / Catatan Internal Perubahan Tahap"
                placeholder="Contoh: Koreksi status karena salah klik / Pengaturan ulang jadwal interview / Evaluasi ulang"
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                helperText="Catatan ini akan tersimpan sebagai riwayat administrasi"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="checkbox"
                    id="overrideSendEmailCheck"
                    checked={overrideSendEmail}
                    onChange={(e) => setOverrideSendEmail(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="overrideSendEmailCheck" style={{ fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    Kirim email resmi pemberitahuan perubahan tahap ke kandidat ({selectedApplicant?.email})
                  </label>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5, ml: 3 }}>
                  Biarkan <strong>tidak dicentang</strong> jika perubahan tahap dilakukan secara diam-diam (misal perbaikan salah klik atau rollback teknis tanpa membuat kandidat bingung).
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOverrideModalOpen(false)}>Batal</Button>
          <Button
            variant="contained"
            disabled={processing}
            onClick={handleConfirmOverrideStage}
            sx={{
              bgcolor: '#7C3AED',
              fontWeight: 700,
              px: 3,
              '&:hover': { bgcolor: '#6D28D9' },
            }}
          >
            {processing ? 'Memproses...' : 'Terapkan Perubahan Tahap'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2b. TEST SESSION SCHEDULE & LOCATION MODAL (EDIT ANYTIME FOR STAGE 2 & 3) */}
      <Dialog open={testSessionModalOpen} onClose={() => setTestSessionModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#018730' }}>
          Atur Jadwal, Tempat & Token Ujian {selectedApplicant?.currentStage === 2 ? 'Psikotes (HR)' : 'Teknis Kejuruan (User)'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Kandidat: <strong>{selectedApplicant?.fullName}</strong> ({selectedApplicant?.jobPosting?.title})
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Waktu Mulai Ujian (Start Time)"
                slotProps={{ inputLabel: { shrink: true } }}
                value={testSessionDate}
                onChange={(e) => {
                  setTestSessionDate(e.target.value);
                  if (e.target.value) {
                    const start = new Date(e.target.value);
                    const end = new Date(start.getTime() + testSessionDuration * 60000);
                    setTestSessionUntil(formatToLocalDateTimeInput(end));
                  }
                }}
                helperText="Ujian baru dapat dibuka mulai tanggal & jam ini"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Batas Waktu Berakhir (End Time / Selesai)"
                slotProps={{ inputLabel: { shrink: true } }}
                value={testSessionUntil}
                onChange={(e) => {
                  setTestSessionUntil(e.target.value);
                  if (e.target.value && testSessionDate) {
                    const start = new Date(testSessionDate).getTime();
                    const end = new Date(e.target.value).getTime();
                    if (end > start) {
                      setTestSessionDuration(Math.round((end - start) / 60000));
                    }
                  }
                }}
                helperText={`Durasi Pengerjaan: ${testSessionDuration} Menit`}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: '#018730', fontWeight: 700 }}>
                  Pilihan Durasi Cepat:
                </Typography>
                {[
                  { label: '60 Menit (1 Jam)', min: 60 },
                  { label: '90 Menit', min: 90 },
                  { label: '120 Menit (2 Jam)', min: 120 },
                  { label: '1 Hari (24 Jam)', min: 1440 },
                ].map((d) => (
                  <Chip
                    key={d.min}
                    label={d.label}
                    size="small"
                    clickable
                    onClick={() => {
                      setTestSessionDuration(d.min);
                      if (testSessionDate) {
                        const start = new Date(testSessionDate);
                        const end = new Date(start.getTime() + d.min * 60000);
                        setTestSessionUntil(formatToLocalDateTimeInput(end));
                      }
                    }}
                    sx={{
                      fontSize: 11,
                      bgcolor: testSessionDuration === d.min ? '#018730' : '#DCFCE7',
                      color: testSessionDuration === d.min ? '#FFFFFF' : '#166534',
                      fontWeight: 700,
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Tempat / Lokasi / Ruangan Ujian"
            value={testSessionLocation}
            onChange={(e) => setTestSessionLocation(e.target.value)}
            placeholder="Contoh: Portal Karir Online PT ITSP atau Lab Komputer Plant 1"
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', alignSelf: 'center', mr: 0.5 }}>
              Pilihan Cepat:
            </Typography>
            {[
              'Portal Karir Online PT ITSP',
              'Lab Komputer Plant 1 KIIC Karawang',
              'Workshop Mold & Die Plant 1 KIIC',
              'Ruang Training Plant 2 GIIC Cikarang',
            ].map((loc) => (
              <Chip
                key={loc}
                label={loc}
                size="small"
                clickable
                onClick={() => setTestSessionLocation(loc)}
                sx={{ fontSize: 11, bgcolor: testSessionLocation === loc ? '#DCFCE7' : '#F8FAFC', border: '1px solid #CBD5E1' }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              label="Kode Token Ujian"
              value={testSessionToken}
              onChange={(e) => setTestSessionToken(e.target.value.toUpperCase())}
              helperText="Token yang wajib dimasukkan kandidat untuk memulai ujian"
            />
            <Button
              variant="outlined"
              onClick={() => {
                const prefix = selectedApplicant?.currentStage === 2 ? 'PSIKO' : 'TECH';
                const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
                setTestSessionToken(`${prefix}-${rnd}`);
              }}
              startIcon={<DiceIcon />}
              sx={{ whiteSpace: 'nowrap', fontWeight: 700, textTransform: 'none', px: 2, height: 54 }}
            >
              Acak Token
            </Button>
          </Box>

          <Alert severity="info" sx={{ mt: 2.5, borderRadius: 2 }}>
            <strong>Solusi Kendala Ujian:</strong> Jika peserta mengalami laptop mati, wifi terputus, atau tidak sengaja keluar/pindah tab sehingga ujian terhenti, Tim {selectedApplicant?.currentStage === 2 ? 'HR Recruitment' : 'User Departemen'} dapat menekan tombol <strong>Reset Ujian & Buka Kunci</strong> di bawah ini agar peserta dapat kembali masuk dan melanjutkan/mengulang ujian.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            color="error"
            variant="outlined"
            startIcon={<ResetIcon />}
            disabled={processing}
            onClick={async () => {
              if (!selectedApplicant) return;
              const testType = selectedApplicant.currentStage === 2 ? 'psikotes' : 'user_test';
              const testName = selectedApplicant.currentStage === 2 ? 'Psikotes (HR)' : 'Teknis Kejuruan (User Departemen)';
              if (!confirm(`Reset sesi ujian ${testName} untuk ${selectedApplicant.fullName}?\n\nKunci anti-cheat dan status pengumpulan akan dibatalkan, sehingga kandidat dapat login kembali ke portal dan mengikuti ujian (misal karena wifi putus, laptop mati, atau kendala browser).`)) return;
              await handleResetTest(selectedApplicant.id, testType);
              setTestSessionModalOpen(false);
            }}
            sx={{ fontWeight: 700, textTransform: 'none', borderColor: '#EF4444', color: '#DC2626', '&:hover': { bgcolor: '#FEF2F2', borderColor: '#DC2626' } }}
          >
            Reset Ujian & Buka Kunci Peserta
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setTestSessionModalOpen(false)}>Batal</Button>
            <Button
              variant="contained"
              disabled={processing}
              onClick={handleConfirmTestSession}
              sx={{ bgcolor: '#018730', fontWeight: 700, '&:hover': { bgcolor: '#005c21' } }}
            >
              {processing ? 'Saving...' : 'Simpan Pengaturan Sesi'}
            </Button>
          </Box>
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
            <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: 2, border: '1px solid #BBF7D0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FactoryIcon fontSize="small" /> Penentuan Pabrik PT ITSP & Peta Rute Google Maps
              </Typography>

              <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 1 }}>
                Pilih lokasi pabrik untuk pelaksanaan wawancara tatap muka (Onsite):
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                <Button
                  variant={interviewPlantChoice === 'kiic' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setInterviewPlantChoice('kiic');
                    setInterviewRoom(interviewType === 'hr' ? 'Ruang Meeting HCM Lt. 2 (Gedung Admin)' : 'Ruang Meeting Teknis Plant 1 KIIC');
                  }}
                  startIcon={<PlaceIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 12,
                    py: 1,
                    bgcolor: interviewPlantChoice === 'kiic' ? '#018730' : '#FFFFFF',
                    color: interviewPlantChoice === 'kiic' ? '#FFFFFF' : '#018730',
                    borderColor: '#018730',
                    '&:hover': { bgcolor: interviewPlantChoice === 'kiic' ? '#005c21' : '#F0FDF4' },
                  }}
                >
                  Plant 1 (KIIC Karawang)
                </Button>

                <Button
                  variant={interviewPlantChoice === 'giic' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setInterviewPlantChoice('giic');
                    setInterviewRoom(interviewType === 'hr' ? 'Ruang Meeting Lt. 1 Gedung Plant 2 GIIC' : 'Ruang Meeting Teknis Plant 2 GIIC');
                  }}
                  startIcon={<PlaceIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: 12,
                    py: 1,
                    bgcolor: interviewPlantChoice === 'giic' ? '#018730' : '#FFFFFF',
                    color: interviewPlantChoice === 'giic' ? '#FFFFFF' : '#018730',
                    borderColor: '#018730',
                    '&:hover': { bgcolor: interviewPlantChoice === 'giic' ? '#005c21' : '#F0FDF4' },
                  }}
                >
                  Plant 2 (GIIC Cikarang)
                </Button>
              </Box>

              <TextField
                fullWidth
                size="small"
                label="Nama Ruangan Pertemuan"
                value={interviewRoom}
                onChange={(e) => setInterviewRoom(e.target.value)}
                placeholder="Misal: Ruang Meeting HCM Lt. 2"
                sx={{ mb: 1.5, bgcolor: '#FFFFFF' }}
              />

              <TextField
                fullWidth
                size="small"
                label="Alamat Pabrik"
                value={
                  interviewPlantChoice === 'kiic'
                    ? PLANT_LOCATIONS.kiic.address
                    : interviewPlantChoice === 'giic'
                    ? PLANT_LOCATIONS.giic.address
                    : interviewCustomAddress
                }
                onChange={(e) => {
                  setInterviewPlantChoice('custom');
                  setInterviewCustomAddress(e.target.value);
                }}
                helperText="Otomatis terisi sesuai pabrik yang dipilih atau dapat disesuaikan."
                sx={{ mb: 1.5, bgcolor: '#FFFFFF' }}
              />

              <TextField
                fullWidth
                size="small"
                label="Link Google Maps / Tag Maps (<iframe ...>)"
                value={interviewMapsInput}
                onChange={(e) => setInterviewMapsInput(e.target.value)}
                placeholder="Kosongkan untuk memakai peta resmi PT ITSP, atau paste link/tag iframe kustom"
                helperText="Link atau tag embed maps ini akan otomatis dikirimkan ke email kandidat & dashboard portal."
                sx={{ mb: 1.5, bgcolor: '#FFFFFF' }}
              />

              {/* Live Preview Google Maps Badge */}
              {(() => {
                const mapsUrl = interviewMapsInput.trim()
                  ? getPlantMapsUrl(interviewMapsInput.trim())
                  : interviewPlantChoice === 'giic'
                  ? PLANT_LOCATIONS.giic.mapsUrl
                  : PLANT_LOCATIONS.kiic.mapsUrl;

                return (
                  <Box sx={{ p: 1.5, bgcolor: '#DCFCE7', borderRadius: 1.5, border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MapIcon sx={{ color: '#166534', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700 }}>
                        Peta Terhubung: {interviewPlantChoice === 'giic' ? 'Plant 2 (GIIC Cikarang)' : 'Plant 1 (KIIC Karawang)'}
                      </Typography>
                    </Box>
                    {mapsUrl && (
                      <Button
                        size="small"
                        href={mapsUrl}
                        target="_blank"
                        sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none', color: '#166534', py: 0.2 }}
                      >
                        Uji Buka Maps &rarr;
                      </Button>
                    )}
                  </Box>
                );
              })()}
            </Box>
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

      {/* 6. CLEANUP & OPTIMIZE DATABASE MODAL */}
      <Dialog open={cleanupModalOpen} onClose={() => setCleanupModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteSweepIcon color="warning" /> Pembersihan & Optimalisasi Database Pelamar
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', mb: 2.5, lineHeight: 1.6 }}>
            Fitur ini secara otomatis memproses pelamar yang tidak melanjutkan seleksi (mangkir) lebih dari 30 hari dan membersihkan berkas berat di database.
          </Typography>

          {cleanupFeedback && (
            <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
              {cleanupFeedback}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              onClick={() => setCleanupMode('soft_cleanup')}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '2px solid',
                borderColor: cleanupMode === 'soft_cleanup' ? '#018730' : '#E2E8F0',
                bgcolor: cleanupMode === 'soft_cleanup' ? '#F0FDF4' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                1. Optimalisasi Penyimpanan (Rekomendasi)
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: 13 }}>
                Otomatis ubah status pelamar mangkir &gt; 30 hari menjadi <strong>Gugur</strong>, dan kosongkan file CV Base64 dari pelamar gugur lama untuk menghemat kapasitas database hingga 95% tanpa menghapus riwayat nama &amp; nilai.
              </Typography>
            </Box>

            <Box
              onClick={() => setCleanupMode('hard_delete')}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '2px solid',
                borderColor: cleanupMode === 'hard_delete' ? '#EF4444' : '#E2E8F0',
                bgcolor: cleanupMode === 'hard_delete' ? '#FEF2F2' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#991B1B', mb: 0.5 }}>
                2. Hapus Permanen Data Kedaluwarsa
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: 13 }}>
                Hapus tuntas seluruh data pelamar yang berstatus gugur atau tidak aktif &gt; 30 hari beserta seluruh riwayat tesnya dari database.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setCleanupModalOpen(false)}>Tutup</Button>
          <Button
            variant="contained"
            disabled={cleaningUp}
            onClick={handleRunCleanup}
            sx={{
              bgcolor: cleanupMode === 'hard_delete' ? '#EF4444' : '#018730',
              fontWeight: 700,
              '&:hover': { bgcolor: cleanupMode === 'hard_delete' ? '#DC2626' : '#005c21' },
            }}
          >
            {cleaningUp ? 'Memproses...' : 'Jalankan Pembersihan Sekarang'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 8. MODAL KONFIRMASI TANDA TANGAN KONTRAK FISIK & PENGANGKATAN KARYAWAN RESMI */}
      <Dialog
        open={hireContractModalOpen}
        onClose={() => !submittingHire && setHireContractModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, bgcolor: '#0F172A', color: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#018730', width: 42, height: 42 }}>
                <HowToRegIcon sx={{ color: '#FFFFFF' }} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 18, color: '#FFFFFF', lineHeight: 1.2 }}>
                  Konfirmasi Tanda Tangan Kontrak Fisik
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 12 }}>
                  Pengangkatan Resmi Karyawan Baru PT Indonesia Thai Summit Plastech
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setHireContractModalOpen(false)}
              disabled={submittingHire}
              sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3, bgcolor: '#F8FAFC' }}>
          {hireFeedback && (
            <Alert severity={hireFeedback.type} sx={{ mb: 2.5 }}>
              {hireFeedback.message}
            </Alert>
          )}

          {/* Banner Info Kandidat */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Calon Karyawan Terpilih
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                {hiringApplicant?.fullName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569' }}>
                NIK: <strong>{hiringApplicant?.nationalId || '-'}</strong> • Telp: <strong>{hiringApplicant?.phone || '-'}</strong>
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Chip
                label={hiringApplicant?.jobPosting?.title || 'Posisi Terpilih'}
                color="primary"
                size="small"
                sx={{ fontWeight: 800, mb: 0.5, bgcolor: '#018730' }}
              />
              <Typography variant="caption" sx={{ display: 'block', color: '#64748B' }}>
                Divisi: <strong>{hiringApplicant?.jobPosting?.department || '-'}</strong> • {hiringApplicant?.jobPosting?.location || 'Plant 1 KIIC'}
              </Typography>
            </Box>
          </Paper>

          {/* Card Preview ID Karyawan Resmi */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2.5,
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              border: '2px solid #018730',
              boxShadow: '0 4px 14px rgba(1, 135, 48, 0.2)',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ color: '#4ADE80', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Format ID Karyawan PT ITSP: {'{ID}.{Bulan}.{Tahun}'}
                </Typography>
                <Box sx={{ mt: 0.8, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      color: '#FFFFFF',
                      letterSpacing: '2px',
                    }}
                  >
                    {hirePreviewId || '----.--.--'}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
                  Bulan dan tahun otomatis disesuaikan secara real-time dari Tanggal Mulai Kontrak (Join Date).
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.06)', p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block', mb: 1, fontWeight: 700 }}>
                    Penyesuaian Nomor Urut Terakhir:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      size="small"
                      type="number"
                      label="Nomor Urut ID"
                      value={hireSequenceNumber}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        handleHireDateOrSeqChange(val, hireStartDate);
                      }}
                      InputProps={{
                        sx: {
                          color: '#FFFFFF',
                          bgcolor: 'rgba(0,0,0,0.3)',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                        },
                      }}
                      InputLabelProps={{ sx: { color: '#94A3B8' } }}
                      sx={{ flexGrow: 1 }}
                    />
                    <Tooltip title="Nomor urut terakhir yang saat ini tersimpan di database">
                      <Chip
                        size="small"
                        label={`Terakhir: ${hireLastSequence}`}
                        sx={{ bgcolor: 'rgba(74, 222, 128, 0.2)', color: '#4ADE80', fontWeight: 800 }}
                      />
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11, mt: 0.5, display: 'block' }}>
                    *Anda dapat mengubah angka urut ini jika ingin melanjutkan dari urutan tertentu.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Form Pengisian Kontrak */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon fontSize="small" sx={{ color: '#018730' }} /> Periode Masa Kontrak &amp; Hubungan Kerja
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Tanggal Mulai Kontrak (Join Date)"
                  InputLabelProps={{ shrink: true }}
                  value={hireStartDate}
                  onChange={(e) => handleHireDateOrSeqChange(hireSequenceNumber, e.target.value)}
                  helperText="Default dari offering letter; sesuaikan jika calon karyawan hadir lebih awal/mundur."
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Tanggal Berakhir Kontrak (End Date)"
                  InputLabelProps={{ shrink: true }}
                  value={hireEndDate}
                  onChange={(e) => setHireEndDate(e.target.value)}
                  helperText="Kosongkan jika status adalah Karyawan Tetap (PKWTT)."
                />
              </Grid>

              {/* Preset Tombol Cepat Masa Kontrak */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                    Preset Durasi:
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (!hireStartDate) return;
                      const d = new Date(hireStartDate);
                      d.setMonth(d.getMonth() + 6);
                      d.setDate(d.getDate() - 1);
                      setHireEndDate(d.toISOString().split('T')[0]);
                      setHireContractStatus('PKWT');
                    }}
                    sx={{ textTransform: 'none', fontSize: 11.5 }}
                  >
                    +6 Bulan (PKWT)
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (!hireStartDate) return;
                      const d = new Date(hireStartDate);
                      d.setFullYear(d.getFullYear() + 1);
                      d.setDate(d.getDate() - 1);
                      setHireEndDate(d.toISOString().split('T')[0]);
                      setHireContractStatus('PKWT');
                    }}
                    sx={{ textTransform: 'none', fontSize: 11.5 }}
                  >
                    +1 Tahun (PKWT Default)
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      if (!hireStartDate) return;
                      const d = new Date(hireStartDate);
                      d.setFullYear(d.getFullYear() + 2);
                      d.setDate(d.getDate() - 1);
                      setHireEndDate(d.toISOString().split('T')[0]);
                      setHireContractStatus('PKWT');
                    }}
                    sx={{ textTransform: 'none', fontSize: 11.5 }}
                  >
                    +2 Tahun (PKWT)
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setHireEndDate('');
                      setHireContractStatus('PKWTT');
                    }}
                    sx={{ textTransform: 'none', fontSize: 11.5 }}
                  >
                    PKWTT (Tetap / Tanpa End Date)
                  </Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Status Kontrak"
                  value={hireContractStatus}
                  onChange={(e: any) => setHireContractStatus(e.target.value)}
                >
                  <MenuItem value="PKWT">PKWT (Kontrak Waktu Tertentu)</MenuItem>
                  <MenuItem value="PKWTT">PKWTT (Karyawan Tetap)</MenuItem>
                  <MenuItem value="Probation">Probation (Percobaan 3 Bulan)</MenuItem>
                  <MenuItem value="Internship">Magang / Internship</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Gaji &amp; Kompensasi Disepakati"
                  value={hireSalary}
                  onChange={(e) => setHireSalary(e.target.value)}
                  placeholder="Contoh: Rp 5.800.000 / Bulan"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Departemen / Divisi"
                  value={hireDepartment}
                  onChange={(e) => setHireDepartment(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Jabatan / Posisi Resmi"
                  value={hireJobTitle}
                  onChange={(e) => setHireJobTitle(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Lokasi Penempatan Pabrik"
                  value={hireWorkLocation}
                  onChange={(e) => setHireWorkLocation(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nomor Referensi SK / Catatan Kontrak"
                  value={hireNotes}
                  onChange={(e) => setHireNotes(e.target.value)}
                  placeholder="Catatan tambahan HR atau nomor registrasi SK fisik"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Alert Informasi Otomasi */}
          <Alert severity="success" icon={<VerifiedIcon />} sx={{ mt: 2.5, bgcolor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
            <Typography variant="body2" sx={{ color: '#065F46', fontSize: 13, lineHeight: 1.5 }}>
              <strong>Otomatisasi Data Karyawan:</strong> Saat Anda menekan tombol konfirmasi di bawah, seluruh data diri lengkap (NIK, nama, alamat KTP, domisili, kontak darurat, keluarga, pendidikan, riwayat kerja, foto, dan 11 berkas dokumen pendaftaran) akan otomatis disalin ke <strong>Tabel Data Karyawan</strong>. Calon karyawan ini resmi menjadi karyawan aktif dan seluruh tombol aksi seleksi di tabel pelamar akan dinonaktifkan.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#F1F5F9', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
          <Button
            onClick={() => setHireContractModalOpen(false)}
            disabled={submittingHire}
            sx={{ color: '#64748B', fontWeight: 700 }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmHireContract}
            disabled={submittingHire}
            startIcon={submittingHire ? <CircularProgress size={18} color="inherit" /> : <HowToRegIcon />}
            sx={{
              bgcolor: '#018730',
              color: '#FFFFFF',
              fontWeight: 800,
              px: 3,
              py: 1,
              boxShadow: '0 4px 12px rgba(1, 135, 48, 0.3)',
              '&:hover': { bgcolor: '#005c21' },
            }}
          >
            {submittingHire ? 'Menyimpan ke Data Karyawan...' : '✓ Konfirmasi & Masukkan ke Data Karyawan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
