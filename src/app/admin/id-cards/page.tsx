'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  IconButton,
  Avatar,
  Stack,
  Checkbox,
  TextField,
  Tabs,
  Tab,
  Alert,
  Divider,
  Slider,
} from '@mui/material';
import {
  Print as PrintIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Draw as DrawIcon,
  CloudUpload as UploadIcon,
  Person as PersonIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  RestartAlt as ResetIcon,
  Visibility as ViewIcon,
  ContentPaste as ContentPasteIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Crop as CropIcon,
} from '@mui/icons-material';
import { KarirTablePagination, KarirTableToolbar } from '@/components/admin/KarirTablePagination';

// Struktur Konfigurasi Format ID Card yang dapat diedit oleh HR
export interface IdCardFormatConfig {
  companyName: string;
  kiicLine1: string;
  kiicLine2: string;
  giicLine1: string;
  giicLine2: string;
  labelEmployeeId: string;
  labelName: string;
  labelPosition: string;
  labelDepartment: string;
  labelAuthorizerSignature: string;
  hrmSignerTitle: string;
  hrmCompanyFooter: string;
  termsTitle: string;
  termsItem1: string;
  termsItem2: string;
  termsItem3: string;
  qualityTitleEn: string;
  qualityTextEn: string;
  qualityTitleId: string;
  qualityTextId: string;
  qualityPageEn: string;
  qualityPageId: string;
}

// Default Format Resmi Pabrik Sesuai Dokumen Excel User
const DEFAULT_IDCARD_FORMAT: IdCardFormatConfig = {
  companyName: 'PT. Indonesia Thai Summit Plastech',
  kiicLine1: 'Jln. Permata Raya Lot FF-5, Teluk Jambe Timur',
  kiicLine2: 'Kawasan KIIC, Karawang - 41361',
  giicLine1: 'Greenland International Industrial Center Block DC',
  giicLine2: 'No. 18 Kota Deltamas, Cikarang Bekasi',
  labelEmployeeId: 'Employee ID.',
  labelName: 'Name',
  labelPosition: 'Position',
  labelDepartment: 'Department',
  labelAuthorizerSignature: "Authorizer's Signature ....................",
  hrmSignerTitle: 'HRM',
  hrmCompanyFooter: 'PT. Indonesia Thai Summit Plastech',
  termsTitle: 'Ketentuan Penggunaan',
  termsItem1: 'ID Card harus selalu digunakan pada saat bekerja.',
  termsItem2: 'Apabila tidak membawa ID card pada saat bekerja, maka akan diberikan sanksi sesuai dengan aturan yang berlaku.',
  termsItem3: 'Apabila ID Card hilang diluar perusahaan, maka yang bersangkutan harus menunjukkan surat keterangan dari kepolisian.',
  qualityTitleEn: 'QUALITY POLICY STATEMENT',
  qualityTextEn: 'The company is commited to providing quality products, on-time delivery, professional services and compliance with applicable regulations regarding products and customer requirements to meet customer satisfaction through continous improvement of quality management system.',
  qualityTitleId: 'KEBIJAKAN MUTU PERUSAHAAN',
  qualityTextId: 'Perusahaan berkomitmen untuk menyediakan produk berkualitas, pengiriman tepat waktu, layanan profesional dan kepatuhan terhadap peraturan yang berlaku mengenai produk dan persyaratan pelanggan untuk memenuhi kepuasan pelanggan melalui perbaikan sistem manajemen mutu secara berkesinambungan.',
  qualityPageEn: 'Page 1',
  qualityPageId: 'Page 3',
};

// Default Sample Signature HR (Base64 safe SVG)
const DEFAULT_HR_SIGNATURE =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAxNDAgNjAiPjxwYXRoIGQ9Ik0gMTUgNDUgUSAyNSAxNSwgNDAgMzAgVCA2NSAyNSBUIDkwIDQwIFQgMTE1IDIwIFQgMTMwIDM1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwRjE3MkEiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNIDQ1IDM1USA1NSA1LCA1MCA0OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEYxNzJBIiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iOTUiIGN5PSIyMiIgcj0iMi41IiBmaWxsPSIjMEYxNzJBIi8+PC9zdmc=';

// Helper untuk auto-crop / trim background putih dan transparan kosong dari tanda tangan
// sehingga tanda tangan tersimpan hanya pada goresan aslinya tanpa batas kosong yang memperkecil atau memotong gambar
const trimSignatureImage = (sourceCanvas: HTMLCanvasElement): string => {
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) return sourceCanvas.toDataURL('image/png');
  const { width, height } = sourceCanvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const { data } = imgData;

  let minX = width, minY = height, maxX = -1, maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Goresan terdeteksi jika bukan transparan dan bukan putih murni / kertas putih terang
      const isStroke = a > 20 && !(r > 235 && g > 235 && b > 235);
      if (isStroke) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Jika kanvas kosong sama sekali
  if (maxX === -1 || maxY === -1) {
    return sourceCanvas.toDataURL('image/png');
  }

  // Berikan sedikit padding aman di sekeliling goresan tanda tangan
  const pad = 6;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, maxX - cropX + pad * 2);
  const cropH = Math.min(height - cropY, maxY - cropY + pad * 2);

  const trimmedCanvas = document.createElement('canvas');
  trimmedCanvas.width = cropW;
  trimmedCanvas.height = cropH;
  const trimmedCtx = trimmedCanvas.getContext('2d');
  if (!trimmedCtx) return sourceCanvas.toDataURL('image/png');

  trimmedCtx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  // Jadikan pixel putih / abu-abu terang menjadi transparan agar tanda tangan terlihat seperti tinta asli di atas kartu
  const tData = trimmedCtx.getImageData(0, 0, cropW, cropH);
  const pixels = tData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const pr = pixels[i];
    const pg = pixels[i + 1];
    const pb = pixels[i + 2];
    const pa = pixels[i + 3];
    if (pa > 0 && pr > 230 && pg > 230 && pb > 230) {
      pixels[i + 3] = 0; // Transparan
    }
  }
  trimmedCtx.putImageData(tData, 0, 0);

  return trimmedCanvas.toDataURL('image/png');
};

// Interactive Digital Signature Canvas for HR with Scratch, Upload, Copy & Paste support
const SignaturePad: React.FC<{
  value: string;
  onChange: (val: string) => void;
}> = ({ value, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const drawTrimmedToCanvas = (src: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new (window as any).Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const aspect = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
      const canvasAspect = canvas.width / canvas.height;
      let drawW, drawH;
      if (aspect > canvasAspect) {
        drawW = canvas.width * 0.85;
        drawH = drawW / aspect;
      } else {
        drawH = canvas.height * 0.85;
        drawW = drawH * aspect;
      }
      const drawX = (canvas.width - drawW) / 2;
      const drawY = (canvas.height - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    };
    img.src = src;
  };

  useEffect(() => {
    if (value) {
      drawTrimmedToCanvas(value);
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
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
        const img = new (window as any).Image();
        img.onload = () => {
          const tempC = document.createElement('canvas');
          tempC.width = img.naturalWidth || img.width || 500;
          tempC.height = img.naturalHeight || img.height || 160;
          const tempCtx = tempC.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(img, 0, 0);
            const trimmed = trimSignatureImage(tempC);
            drawTrimmedToCanvas(trimmed);
            onChange(trimmed);
            setFeedback('✓ Gambar tanda tangan berhasil ditempel (background dibersihkan & dipotong rapi)!');
            setTimeout(() => setFeedback(null), 3500);
          }
        };
        img.src = res;
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
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

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Auto trim batas kosong setelah selesai menggambar
    const trimmed = trimSignatureImage(canvas);
    onChange(trimmed);
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
          ✍️ Goreskan Mouse / Touchscreen atau Tempel (Paste) Gambar:
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
              startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
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
            startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
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
        height={160}
        style={{
          width: '100%',
          height: '145px',
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
          📋 <strong>Dukungan Copy-Paste:</strong> Salin gambar tanda tangan di mana saja, lalu tekan <strong>Ctrl + V</strong> atau klik tombol Paste.
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

export default function AdminIdCardsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Format Konfigurasi Template ID Card
  const [cardFormat, setCardFormat] = useState<IdCardFormatConfig>(DEFAULT_IDCARD_FORMAT);
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [tempFormat, setTempFormat] = useState<IdCardFormatConfig>(DEFAULT_IDCARD_FORMAT);
  const [formatTab, setFormatTab] = useState(0);
  const [formatSaveFeedback, setFormatSaveFeedback] = useState<string | null>(null);

  // Pilihan Alamat PT (KIIC atau GIIC)
  const [selectedPlant, setSelectedPlant] = useState<'GIIC' | 'KIIC'>('GIIC');

  // Mode Tampilan Cetak: 'all_panels' (4 Panel seperti gambar user) atau 'id_card_only' (Depan & Belakang Saja)
  const [printLayoutMode, setPrintLayoutMode] = useState<'all_panels' | 'id_card_only'>('all_panels');

  // Default Tanda Tangan Digital HR
  const [defaultHrSignature, setDefaultHrSignature] = useState<string>('');
  const [authorizerModalOpen, setAuthorizerModalOpen] = useState(false);
  const [tempSignature, setTempSignature] = useState<string>('');
  // Scale tanda tangan untuk preview cetak ID Card (30-250%, default 100)
  const [signatureScale, setSignatureScale] = useState<number>(100);
  const [tempSignatureScale, setTempSignatureScale] = useState<number>(100);

  // Load Saved Format & Signature from localStorage on Mount
  useEffect(() => {
    try {
      const savedSignature = localStorage.getItem('itsp_default_hr_signature');
      if (savedSignature) {
        setDefaultHrSignature(savedSignature);
      } else {
        setDefaultHrSignature(DEFAULT_HR_SIGNATURE);
      }

      const savedScale = localStorage.getItem('itsp_hr_signature_scale');
      if (savedScale) {
        const parsed = parseInt(savedScale, 10);
        if (!isNaN(parsed) && parsed >= 30 && parsed <= 250) {
          setSignatureScale(parsed);
          setTempSignatureScale(parsed);
        }
      }

      const savedFormat = localStorage.getItem('itsp_custom_idcard_format');
      if (savedFormat) {
        const parsed = JSON.parse(savedFormat);
        setCardFormat({ ...DEFAULT_IDCARD_FORMAT, ...parsed });
        setTempFormat({ ...DEFAULT_IDCARD_FORMAT, ...parsed });
      }
    } catch (e) {
      console.warn('Could not load localStorage settings:', e);
      setDefaultHrSignature(DEFAULT_HR_SIGNATURE);
    }
  }, []);

  const fetchEmployees = () => {
    setLoading(true);
    fetch('/api/admin/id-cards')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.employees && Array.isArray(data.employees)) {
          setEmployees(data.employees);
          if (data.employees.length > 0) {
            if (!selectedEmp) {
              setSelectedEmp(data.employees[0]);
              setSelectedIds([data.employees[0].id]);
              const loc = data.employees[0].workLocation?.toLowerCase() || '';
              if (loc.includes('kiic') || loc.includes('karawang')) {
                setSelectedPlant('KIIC');
              } else {
                setSelectedPlant('GIIC');
              }
            }
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Selection Checkbox Handlers
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      if (!prev.includes(id)) {
        const found = employees.find((e) => e.id === id);
        if (found) setSelectedEmp(found);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredEmployees.map((e) => e.id);
    setSelectedIds(allFilteredIds);
  };

  const handleDeselectAll = () => {
    if (selectedEmp) {
      setSelectedIds([selectedEmp.id]);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectTop2 = () => {
    const top2 = filteredEmployees.slice(0, 2).map((e) => e.id);
    setSelectedIds(top2);
    if (top2.length > 0) {
      const found = employees.find((e) => e.id === top2[0]);
      if (found) setSelectedEmp(found);
    }
  };

  const handleRowClick = (emp: any) => {
    setSelectedEmp(emp);
    if (!selectedIds.includes(emp.id)) {
      setSelectedIds((prev) => [...prev, emp.id]);
    }
    const loc = emp.workLocation?.toLowerCase() || '';
    if (loc.includes('kiic') || loc.includes('karawang')) {
      setSelectedPlant('KIIC');
    } else {
      setSelectedPlant('GIIC');
    }
  };

  const handleTogglePrinted = async (emp: any) => {
    try {
      await fetch('/api/admin/id-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emp.id, source: emp.source }),
      });
      setEmployees((prev) =>
        prev.map((item) =>
          item.id === emp.id ? { ...item, idCardPrinted: !item.idCardPrinted } : item
        )
      );
      if (selectedEmp && selectedEmp.id === emp.id) {
        setSelectedEmp((prev: any) => ({ ...prev, idCardPrinted: !prev.idCardPrinted }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Default HR Signature
  const handleSaveDefaultSignature = () => {
    if (tempSignature) {
      setDefaultHrSignature(tempSignature);
      try {
        localStorage.setItem('itsp_default_hr_signature', tempSignature);
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
    // Save signature scale
    setSignatureScale(tempSignatureScale);
    try {
      localStorage.setItem('itsp_hr_signature_scale', String(tempSignatureScale));
    } catch (e) {
      console.error('Failed to save scale to localStorage:', e);
    }
    setAuthorizerModalOpen(false);
  };

  const handleUpdateScale = (newScale: number) => {
    const clamped = Math.max(50, Math.min(220, newScale));
    setSignatureScale(clamped);
    setTempSignatureScale(clamped);
    try {
      localStorage.setItem('itsp_hr_signature_scale', String(clamped));
    } catch (e) {
      console.error('Failed to save scale to localStorage:', e);
    }
  };

  const handleUploadSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = evt.target?.result as string;
      if (res) {
        const img = new (window as any).Image();
        img.onload = () => {
          const tempC = document.createElement('canvas');
          tempC.width = img.naturalWidth || img.width || 500;
          tempC.height = img.naturalHeight || img.height || 160;
          const tempCtx = tempC.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(img, 0, 0);
            const trimmed = trimSignatureImage(tempC);
            setTempSignature(trimmed);
          }
        };
        img.src = res;
      }
    };
    reader.readAsDataURL(file);
  };

  // Format Template Editor Handlers
  const handleOpenFormatModal = () => {
    setTempFormat({ ...cardFormat });
    setFormatSaveFeedback(null);
    setFormatModalOpen(true);
  };

  const handleSaveCustomFormat = () => {
    setCardFormat({ ...tempFormat });
    try {
      localStorage.setItem('itsp_custom_idcard_format', JSON.stringify(tempFormat));
      setFormatSaveFeedback('✓ Format template ID Card berhasil disimpan dan langsung diterapkan.');
      setTimeout(() => {
        setFormatModalOpen(false);
        setFormatSaveFeedback(null);
      }, 1000);
    } catch (e) {
      console.error(e);
      setFormatSaveFeedback('Gagal menyimpan format ke local storage.');
    }
  };

  const handleResetToFactoryDefault = () => {
    setTempFormat({ ...DEFAULT_IDCARD_FORMAT });
    setCardFormat({ ...DEFAULT_IDCARD_FORMAT });
    try {
      localStorage.removeItem('itsp_custom_idcard_format');
    } catch {}
    setFormatSaveFeedback('✓ Format template berhasil dikembalikan ke default pabrik.');
  };

  // Trigger Native Print Dialog
  const handlePrint = () => {
    window.print();
  };

  const filteredEmployees = employees.filter((emp) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (emp.namaLengkap && emp.namaLengkap.toLowerCase().includes(q)) ||
      (emp.jabatan && emp.jabatan.toLowerCase().includes(q)) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(q)) ||
      (emp.departemen && emp.departemen.toLowerCase().includes(q))
    );
  });

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  // Helper Employee ID formatting: mencegah dobel ITSP.ITSP jika sudah berawalan ITSP
  const formatDisplayId = (idStr?: string) => {
    if (!idStr) return 'ITSP.----.--.--';
    let trimmed = idStr.trim();
    // Bersihkan jika ada dobel awalan ITSP (contoh: "ITSP. ITSP-..." atau "ITSP.ITSP-...")
    trimmed = trimmed.replace(/^ITSP[\.\s\-_]+ITSP[\.\s\-_]*/i, 'ITSP.');
    if (/^ITSP[\.\s\-_]/i.test(trimmed) || trimmed.toUpperCase() === 'ITSP') {
      return trimmed;
    }
    return `ITSP.${trimmed}`;
  };

  // Karyawan yang akan dicetak
  const employeesToPrint =
    selectedIds.length > 0
      ? employees.filter((e) => selectedIds.includes(e.id))
      : selectedEmp
      ? [selectedEmp]
      : [];

  // Pecah daftar karyawan menjadi kelompok 2 per lembar A4
  const a4Pages: any[][] = [];
  for (let i = 0; i < employeesToPrint.length; i += 2) {
    a4Pages.push(employeesToPrint.slice(i, i + 2));
  }

  // Alamat aktif berdasarkan format saat ini
  const plantLine1 = selectedPlant === 'GIIC' ? cardFormat.giicLine1 : cardFormat.kiicLine1;
  const plantLine2 = selectedPlant === 'GIIC' ? cardFormat.giicLine2 : cardFormat.kiicLine2;

  // Component Renderer untuk 1 Unit ID Card Lengkap (4 Panel dengan Dimensi Sama Persis 2x2)
  const renderSingleIdCard = (emp: any, customFmt: IdCardFormatConfig = cardFormat) => {
    const curLine1 = selectedPlant === 'GIIC' ? customFmt.giicLine1 : customFmt.kiicLine1;
    const curLine2 = selectedPlant === 'GIIC' ? customFmt.giicLine2 : customFmt.kiicLine2;

    return (
      <Box
        key={emp.id}
        className="notranslate itsp-idcard-card"
        translate="no"
        sx={{
          width: '100%',
          maxWidth: '710px',
          mx: 'auto',
          bgcolor: '#FFFFFF',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#000000',
          border: '1.5px solid #000000',
          boxSizing: 'border-box',
          mb: 2,
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: printLayoutMode === 'all_panels' ? '225px 225px' : '225px',
        }}
      >
        {/* Garis Lipat / Potong Putus-putus Biru di Tengah Sesuai Format Resmi Excel */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: '0px',
            borderRight: '1.5px dashed #2563EB',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* SISI 1: KARTU DEPAN (KIRI ATAS) */}
        <Box
          className="notranslate itsp-idcard-panel"
          translate="no"
          sx={{
            p: 1.2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid #000000',
            borderBottom: printLayoutMode === 'all_panels' ? '1.5px solid #000000' : 'none',
            height: '225px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          {/* Header: Logo PLASTECH + Nama PT & Alamat */}
          <Box
            className="notranslate"
            translate="no"
            sx={{
              display: 'flex',
              alignItems: 'center',
              pb: 0.4,
              borderBottom: '1.5px solid #000000',
              gap: 1,
            }}
          >
            <Box className="notranslate" translate="no" sx={{ width: 58, textAlign: 'center', flexShrink: 0 }}>
              <Box
                component="img"
                src="/logo-plastech.jpg"
                alt="PLASTECH"
                sx={{ height: 32, width: 'auto', objectFit: 'contain', mx: 'auto', display: 'block' }}
              />
              <Typography
                className="notranslate"
                translate="no"
                sx={{
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  fontSize: 9,
                  fontWeight: 900,
                  color: '#1E3A8A',
                  letterSpacing: '0.6px',
                  lineHeight: 1,
                  mt: 0.2,
                }}
              >
                PLASTECH
              </Typography>
            </Box>

            <Box className="notranslate" translate="no" sx={{ flexGrow: 1, textAlign: 'center', pr: 0.5 }}>
              <Typography
                className="notranslate"
                translate="no"
                sx={{
                  fontWeight: 800,
                  fontSize: 11.5,
                  color: '#000000',
                  lineHeight: 1.15,
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                {customFmt.companyName}
              </Typography>
              <Typography className="notranslate" translate="no" sx={{ fontSize: 8.5, color: '#000000', lineHeight: 1.15, mt: 0.2 }}>
                {curLine1}
              </Typography>
              <Typography className="notranslate" translate="no" sx={{ fontSize: 8.5, color: '#000000', lineHeight: 1.15 }}>
                {curLine2}
              </Typography>
            </Box>
          </Box>

          {/* Body: Pas Foto di Kiri + 4 Kolom Data di Kanan */}
          <Box sx={{ display: 'flex', gap: 1, py: 0.4, flexGrow: 1, alignItems: 'center' }}>
            {/* Kotak Pas Foto Resmi */}
            <Box
              sx={{
                width: 68,
                height: 80,
                border: '1.5px solid #1E40AF',
                p: 0.2,
                bgcolor: '#FFFFFF',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {emp.photoProfile ? (
                <Box
                  component="img"
                  src={emp.photoProfile}
                  alt={emp.namaLengkap}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: '#F1F5F9',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94A3B8',
                  }}
                >
                  <PersonIcon sx={{ fontSize: 34 }} />
                  <Typography sx={{ fontSize: 8, fontWeight: 700 }}>Pas Foto</Typography>
                </Box>
              )}
            </Box>

            {/* Tabel 4 Baris: Employee ID, Name, Position, Department */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }} className="notranslate" translate="no">
              <table className="notranslate" translate="no" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', color: '#000000', tableLayout: 'fixed' }}>
                <tbody className="notranslate" translate="no">
                  <tr className="notranslate" translate="no">
                    <td className="notranslate" translate="no" style={{ width: '78px', fontWeight: 700, padding: '1px 0', whiteSpace: 'nowrap' }}>{customFmt.labelEmployeeId}</td>
                    <td style={{ width: '6px', textAlign: 'center' }}>:</td>
                    <td className="notranslate" translate="no" style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '10.5px', wordBreak: 'break-word' }}>
                      {formatDisplayId(emp.employeeId)}
                    </td>
                  </tr>
                  <tr className="notranslate" translate="no">
                    <td className="notranslate" translate="no" style={{ fontWeight: 700, padding: '1px 0', whiteSpace: 'nowrap' }}>{customFmt.labelName}</td>
                    <td style={{ textAlign: 'center' }}>:</td>
                    <td className="notranslate" translate="no" style={{ fontWeight: 700, wordBreak: 'break-word', lineHeight: 1.15 }}>{emp.namaLengkap}</td>
                  </tr>
                  <tr className="notranslate" translate="no">
                    <td className="notranslate" translate="no" style={{ fontWeight: 700, padding: '1px 0', whiteSpace: 'nowrap' }}>{customFmt.labelPosition}</td>
                    <td style={{ textAlign: 'center' }}>:</td>
                    <td className="notranslate" translate="no" style={{ wordBreak: 'break-word', lineHeight: 1.15 }}>{emp.jabatan || '-'}</td>
                  </tr>
                  <tr className="notranslate" translate="no">
                    <td className="notranslate" translate="no" style={{ fontWeight: 700, padding: '1px 0', whiteSpace: 'nowrap' }}>{customFmt.labelDepartment}</td>
                    <td style={{ textAlign: 'center' }}>:</td>
                    <td className="notranslate" translate="no" style={{ wordBreak: 'break-word', lineHeight: 1.15 }}>{emp.departemen || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </Box>

          {/* Footer: Authorizer's Signature */}
          <Box
            className="notranslate"
            translate="no"
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              mt: 'auto',
              pt: 0.2,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Box
              className="notranslate"
              translate="no"
              sx={{
                textAlign: 'center',
                width: '160px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              {/* Wadah Tanda Tangan */}
              <Box
                sx={{
                  height: `${Math.min(46, Math.max(24, Math.round(30 * (signatureScale / 100))))}px`,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'visible', // JANGAN PERNAH POTONG TANDA TANGAN
                }}
              >
                {defaultHrSignature ? (
                  <Box
                    component="img"
                    src={defaultHrSignature}
                    alt="Authorizer's Signature"
                    sx={{
                      height: `${Math.round(28 * (signatureScale / 100))}px`,
                      maxWidth: `${Math.round(140 * (signatureScale / 100))}px`,
                      maxHeight: `${Math.round(52 * (signatureScale / 100))}px`,
                      objectFit: 'contain',
                      display: 'block',
                      position: signatureScale > 130 ? 'absolute' : 'relative',
                      bottom: signatureScale > 130 ? 0 : 'auto',
                      transformOrigin: 'bottom center',
                    }}
                  />
                ) : (
                  <Typography sx={{ color: '#94A3B8', fontSize: 8 }}>
                    [Tanda Tangan HR]
                  </Typography>
                )}
              </Box>
              <Typography
                className="notranslate"
                translate="no"
                sx={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: '#000000',
                  lineHeight: 1.1,
                  mt: 0.2,
                  whiteSpace: 'nowrap',
                }}
              >
                {customFmt.labelAuthorizerSignature}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* SISI 2: KETENTUAN PENGGUNAAN (KANAN ATAS) */}
        <Box
          className="notranslate itsp-idcard-panel"
          translate="no"
          sx={{
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderBottom: printLayoutMode === 'all_panels' ? '1.5px solid #000000' : 'none',
            height: '225px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <Box className="notranslate" translate="no">
            <Typography
              className="notranslate"
              translate="no"
              sx={{
                fontWeight: 800,
                fontSize: 11.5,
                textAlign: 'center',
                color: '#000000',
                mb: 1,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {customFmt.termsTitle}
            </Typography>

            <Box component="ol" className="notranslate" translate="no" sx={{ pl: 2, m: 0, fontSize: '9.5px', color: '#000000', lineHeight: 1.35 }}>
              <li className="notranslate" translate="no" style={{ marginBottom: '4px' }}>
                {customFmt.termsItem1}
              </li>
              <li className="notranslate" translate="no" style={{ marginBottom: '4px' }}>
                {customFmt.termsItem2}
              </li>
              <li className="notranslate" translate="no" style={{ marginBottom: '4px' }}>
                {customFmt.termsItem3}
              </li>
            </Box>
          </Box>

          <Box className="notranslate" translate="no" sx={{ textAlign: 'right', pt: 0.5 }}>
            <Typography className="notranslate" translate="no" sx={{ fontWeight: 800, fontSize: 10, color: '#000000' }}>
              {customFmt.hrmSignerTitle}
            </Typography>
            <Typography className="notranslate" translate="no" sx={{ fontWeight: 700, fontSize: 9, color: '#000000' }}>
              {customFmt.hrmCompanyFooter}
            </Typography>
          </Box>
        </Box>

        {/* SISI 3: QUALITY POLICY STATEMENT (ENGLISH - KIRI BAWAH) */}
        {printLayoutMode === 'all_panels' && (
          <Box
            className="notranslate itsp-idcard-panel"
            translate="no"
            sx={{
              p: 1.5,
              borderRight: '1px solid #000000',
              height: '225px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
            }}
          >
            <Box className="notranslate" translate="no">
              <Typography
                className="notranslate"
                translate="no"
                sx={{
                  fontWeight: 800,
                  fontSize: 10,
                  textAlign: 'center',
                  color: '#000000',
                  lineHeight: 1.15,
                }}
              >
                {customFmt.companyName.toUpperCase()}
              </Typography>
              <Typography
                className="notranslate"
                translate="no"
                sx={{
                  fontWeight: 800,
                  fontSize: 10,
                  textAlign: 'center',
                  color: '#000000',
                  mb: 0.8,
                  lineHeight: 1.15,
                }}
              >
                {customFmt.qualityTitleEn}
              </Typography>

              <Typography
                className="notranslate"
                translate="no"
                sx={{
                  fontSize: '9px',
                  color: '#000000',
                  textAlign: 'justify',
                  lineHeight: 1.32,
                }}
              >
                {customFmt.qualityTextEn}
              </Typography>
            </Box>

            <Typography className="notranslate" translate="no" sx={{ fontSize: 22, fontWeight: 900, color: 'rgba(0,0,0,0.16)', textAlign: 'center', my: 'auto' }}>
              {customFmt.qualityPageEn}
            </Typography>
          </Box>
        )}

        {/* SISI 4: KEBIJAKAN MUTU PERUSAHAAN (BAHASA INDONESIA - KANAN BAWAH) */}
        {printLayoutMode === 'all_panels' && (
          <Box
            className="notranslate itsp-idcard-panel"
            translate="no"
            sx={{
              p: 1.5,
              height: '225px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
            }}
          >
            <Box className="notranslate" translate="no">
              <Typography
                className="notranslate"
                translate="no"
                sx={{
                  fontWeight: 800,
                  fontSize: 10,
                  textAlign: 'center',
                  color: '#000000',
                  lineHeight: 1.15,
                }}
              >
                {customFmt.companyName.toUpperCase()}
              </Typography>
              <Typography
                className="notranslate"
                translate="no"
                sx={{
                  fontWeight: 800,
                  fontSize: 10,
                  textAlign: 'center',
                  color: '#000000',
                  mb: 0.8,
                  lineHeight: 1.15,
                }}
              >
                {customFmt.qualityTitleId}
              </Typography>

              <Typography
                className="notranslate"
                translate="no"
                sx={{
                  fontSize: '9px',
                  color: '#000000',
                  textAlign: 'justify',
                  lineHeight: 1.32,
                }}
              >
                {customFmt.qualityTextId}
              </Typography>
            </Box>

            <Typography className="notranslate" translate="no" sx={{ fontSize: 8.5, color: '#64748B', textAlign: 'right', mt: 0.5 }}>
              {customFmt.qualityPageId}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const printCss = `
    @media print {
      body * {
        visibility: hidden !important;
      }
      #itsp-idcard-printable-container,
      #itsp-idcard-printable-container * {
        visibility: visible !important;
      }
      #itsp-idcard-printable-container {
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 4mm 8mm !important;
        background: #ffffff !important;
      }
      .no-print {
        display: none !important;
      }
      .a4-print-sheet {
        page-break-after: always !important;
        break-after: page !important;
        min-height: 275mm !important;
        display: flex !important;
        flex-direction: column !important;
        justifyContent: flex-start !important;
        padding-bottom: 5mm !important;
      }
      .a4-print-sheet:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      .itsp-idcard-card {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        width: 171mm !important;
        max-width: 171mm !important;
        margin: 0 auto !important;
        display: grid !important;
        grid-template-columns: 85.5mm 85.5mm !important;
        grid-template-rows: 54mm 54mm !important;
        border: 1.5px solid #000000 !important;
        box-sizing: border-box !important;
      }
      .itsp-idcard-panel {
        width: 85.5mm !important;
        height: 54mm !important;
        max-height: 54mm !important;
        min-height: 54mm !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
      @page {
        size: A4 portrait;
        margin: 8mm 6mm;
      }
    }
  `;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Stylesheet Cetak Khusus Kertas A4 Portrait (1 Lembar Muat 2 ID Card) */}
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      {/* Header Halaman */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <BadgeIcon sx={{ color: '#018730', fontSize: 30 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              Modul Cetak ID Card &amp; Kartu Nama Karyawan
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Format resmi PT Indonesia Thai Summit Plastech • Kertas A4 muat 2 ID Card sekaligus, sesuaikan teks &amp; format template kartu secara bebas
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={handleOpenFormatModal}
            startIcon={<EditIcon />}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              borderColor: '#0284C7',
              color: '#0284C7',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F0F9FF', borderColor: '#0369A1' },
            }}
          >
            Edit Format Kartu &amp; Preview
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              setTempSignature(defaultHrSignature);
              setTempSignatureScale(signatureScale);
              setAuthorizerModalOpen(true);
            }}
            startIcon={<DrawIcon />}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              borderColor: '#CBD5E1',
              color: '#1E293B',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            }}
          >
            Atur Tanda Tangan HR
          </Button>

          <Button
            variant="contained"
            onClick={handlePrint}
            startIcon={<PrintIcon />}
            disabled={employeesToPrint.length === 0}
            sx={{
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2,
              bgcolor: '#018730',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(1, 135, 48, 0.3)',
              '&:hover': { bgcolor: '#005c21' },
            }}
          >
            Cetak {employeesToPrint.length} Kartu (A4 Print)
          </Button>

          <Tooltip title="Muat Ulang Data">
            <IconButton onClick={fetchEmployees} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Main Grid: Kolom Kiri Tabel Pilihan Karyawan, Kolom Kanan Preview ID Card */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.05fr 1.35fr' }, gap: 3 }}>
        {/* Kolom Kiri: Tabel Karyawan dengan Multi-Select Checkbox */}
        <Box>
          {/* Quick Selection Bar */}
          <Paper elevation={0} sx={{ p: 1.5, mb: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${selectedIds.length} Karyawan Terpilih`}
                size="small"
                color={selectedIds.length > 0 ? 'success' : 'default'}
                sx={{ fontWeight: 800 }}
              />
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                (1 Lembar A4 muat 2 kartu)
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleSelectTop2}
                sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none', py: 0.3 }}
              >
                Pilih 2 Teratas (1 Lembar A4)
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={handleSelectAll}
                startIcon={<SelectAllIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none', py: 0.3 }}
              >
                Pilih Semua
              </Button>
              {selectedIds.length > 1 && (
                <Button
                  size="small"
                  variant="text"
                  color="error"
                  onClick={handleDeselectAll}
                  startIcon={<DeselectIcon sx={{ fontSize: 14 }} />}
                  sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none', py: 0.3 }}
                >
                  Reset
                </Button>
              )}
            </Stack>
          </Paper>

          <KarirTableToolbar
            searchQuery={searchQuery}
            onSearchChange={(val) => {
              setSearchQuery(val);
              setPage(0);
            }}
            placeholder="Cari nama karyawan, nomor ID, jabatan, dept..."
            totalCount={employees.length}
            filteredCount={filteredEmployees.length}
          />

          <TableContainer component={Paper} sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ py: 1.5 }}>
                    <Checkbox
                      size="small"
                      checked={filteredEmployees.length > 0 && selectedIds.length === filteredEmployees.length}
                      indeterminate={selectedIds.length > 0 && selectedIds.length < filteredEmployees.length}
                      onChange={(e) => {
                        if (e.target.checked) handleSelectAll();
                        else handleDeselectAll();
                      }}
                      sx={{ color: '#018730', '&.Mui-checked': { color: '#018730' } }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>Karyawan</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>ID Karyawan</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>Departemen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={30} sx={{ color: '#018730', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#64748B' }}>
                        Memuat data karyawan...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#64748B' }}>
                      {searchQuery
                        ? 'Tidak ada karyawan yang cocok dengan pencarian.'
                        : 'Belum ada data karyawan. Angkat calon karyawan di menu Pelamar untuk otomatis memasukkannya ke sini.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((emp) => {
                    const isChecked = selectedIds.includes(emp.id);
                    const isCurrentActive = selectedEmp?.id === emp.id;

                    return (
                      <TableRow
                        key={emp.id}
                        hover
                        selected={isCurrentActive}
                        onClick={() => handleRowClick(emp)}
                        sx={{
                          cursor: 'pointer',
                          bgcolor: isChecked ? '#F0FDF4 !important' : 'inherit',
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            size="small"
                            checked={isChecked}
                            onChange={() => handleToggleSelect(emp.id)}
                            sx={{ color: '#018730', '&.Mui-checked': { color: '#018730' } }}
                          />
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Avatar
                              src={emp.photoProfile || undefined}
                              sx={{
                                width: 34,
                                height: 34,
                                fontSize: 13,
                                bgcolor: isChecked ? '#018730' : '#E2E8F0',
                                color: isChecked ? '#FFFFFF' : '#0F172A',
                                fontWeight: 800,
                              }}
                            >
                              {emp.namaLengkap?.charAt(0) || 'K'}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 13 }}>
                                {emp.namaLengkap}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                                {emp.jabatan || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={emp.employeeId || '-'}
                            size="small"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: 11,
                              bgcolor: '#F1F5F9',
                              color: '#0F172A',
                              border: '1px solid #CBD5E1',
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                            {emp.departemen || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <KarirTablePagination
              count={filteredEmployees.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={(r) => {
                setRowsPerPage(r);
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </TableContainer>
        </Box>

        {/* Kolom Kanan: Pengaturan Kartu & Live Print Preview */}
        <Box>
          {employeesToPrint.length > 0 ? (
            <Card sx={{ borderRadius: 2.5, border: '1px solid #CBD5E1', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              {/* Toolbar Pengaturan Kartu */}
              <Box sx={{ p: 2, bgcolor: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: 14 }}>
                    Pratinjau Cetak ({employeesToPrint.length} Kartu Terpilih)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    {a4Pages.length} Lembar Kertas A4 (Maksimal 2 kartu per lembar A4)
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleOpenFormatModal}
                    startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                    sx={{
                      color: '#4ADE80',
                      borderColor: '#4ADE80',
                      fontSize: 11.5,
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 1.5,
                      '&:hover': { borderColor: '#86EFAC', bgcolor: 'rgba(74, 222, 128, 0.1)' },
                    }}
                  >
                    Edit Format
                  </Button>

                  <Button
                    size="small"
                    variant="contained"
                    onClick={handlePrint}
                    startIcon={<PrintIcon />}
                    sx={{
                      bgcolor: '#018730',
                      fontWeight: 800,
                      fontSize: 12,
                      textTransform: 'none',
                      borderRadius: 1.5,
                      px: 2,
                      '&:hover': { bgcolor: '#005c21' },
                    }}
                  >
                    Cetak Sekarang (Print)
                  </Button>
                </Stack>
              </Box>

              {/* Selector Alamat Pabrik & Mode Cetak */}
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BusinessIcon sx={{ fontSize: 16, color: '#018730' }} /> Pilih Alamat Pabrik PT:
                  </Typography>

                  <RadioGroup
                    row
                    value={selectedPlant}
                    onChange={(e) => setSelectedPlant(e.target.value as 'GIIC' | 'KIIC')}
                    sx={{ gap: 1 }}
                  >
                    <FormControlLabel
                      value="GIIC"
                      control={<Radio size="small" sx={{ color: '#018730', '&.Mui-checked': { color: '#018730' } }} />}
                      label={
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          GIIC Cikarang Deltamas
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      value="KIIC"
                      control={<Radio size="small" sx={{ color: '#018730', '&.Mui-checked': { color: '#018730' } }} />}
                      label={
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          KIIC Karawang
                        </Typography>
                      }
                    />
                  </RadioGroup>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155' }}>
                    Format Cetak:
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant={printLayoutMode === 'all_panels' ? 'contained' : 'outlined'}
                      onClick={() => setPrintLayoutMode('all_panels')}
                      sx={{
                        fontSize: 11,
                        textTransform: 'none',
                        py: 0.3,
                        px: 1.2,
                        borderRadius: 1.5,
                        bgcolor: printLayoutMode === 'all_panels' ? '#0F172A' : 'transparent',
                        borderColor: '#0F172A',
                        color: printLayoutMode === 'all_panels' ? '#FFFFFF' : '#0F172A',
                      }}
                    >
                      4 Panel Lengkap (Format Excel User)
                    </Button>
                    <Button
                      size="small"
                      variant={printLayoutMode === 'id_card_only' ? 'contained' : 'outlined'}
                      onClick={() => setPrintLayoutMode('id_card_only')}
                      sx={{
                        fontSize: 11,
                        textTransform: 'none',
                        py: 0.3,
                        px: 1.2,
                        borderRadius: 1.5,
                        bgcolor: printLayoutMode === 'id_card_only' ? '#0F172A' : 'transparent',
                        borderColor: '#0F172A',
                        color: printLayoutMode === 'id_card_only' ? '#FFFFFF' : '#0F172A',
                      }}
                    >
                      Kartu Depan &amp; Belakang Saja
                    </Button>
                  </Stack>
                </Box>

                {/* Kontrol Ukuran / Scale Tanda Tangan Langsung di Live Print Preview */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    p: 1.5,
                    bgcolor: '#FFFBEB',
                    borderRadius: 2,
                    border: '1.5px solid #FDE68A',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#92400E', fontSize: 12, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      🔍 Ukuran Tanda Tangan di ID Card (Scale):
                    </Typography>
                    <Chip
                      size="small"
                      label={`${signatureScale}%`}
                      sx={{ fontWeight: 800, bgcolor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', height: 22 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: { xs: '100%', sm: 260 }, flexGrow: { xs: 1, sm: 0 } }}>
                    <IconButton
                      size="small"
                      onClick={() => handleUpdateScale(Math.max(50, signatureScale - 10))}
                      disabled={signatureScale <= 50}
                      title="Perkecil Ukuran Tanda Tangan"
                      sx={{ p: 0.5, bgcolor: '#FFFFFF', border: '1px solid #FDE68A', color: '#92400E' }}
                    >
                      <ZoomOutIcon sx={{ fontSize: 16 }} />
                    </IconButton>

                    <Slider
                      value={signatureScale}
                      onChange={(_, v) => handleUpdateScale(v as number)}
                      min={50}
                      max={220}
                      step={5}
                      size="small"
                      sx={{
                        color: '#D97706',
                        flexGrow: 1,
                        '& .MuiSlider-thumb': {
                          width: 16,
                          height: 16,
                          bgcolor: '#FFFFFF',
                          border: '2px solid #D97706',
                        },
                      }}
                    />

                    <IconButton
                      size="small"
                      onClick={() => handleUpdateScale(Math.min(220, signatureScale + 10))}
                      disabled={signatureScale >= 220}
                      title="Perbesar Ukuran Tanda Tangan"
                      sx={{ p: 0.5, bgcolor: '#FFFFFF', border: '1px solid #FDE68A', color: '#92400E' }}
                    >
                      <ZoomInIcon sx={{ fontSize: 16 }} />
                    </IconButton>

                    {signatureScale !== 100 && (
                      <Button
                        size="small"
                        onClick={() => handleUpdateScale(100)}
                        sx={{ fontSize: 10, py: 0.2, px: 0.8, color: '#B45309', fontWeight: 700, minWidth: 'auto', textTransform: 'none' }}
                      >
                        Reset (100%)
                      </Button>
                    )}
                  </Box>
                </Box>

                {/* Banner Aksi Cepat: Edit Format & Teks ID Card (Dengan Live Preview) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    p: 1.5,
                    bgcolor: '#EFF6FF',
                    borderRadius: 2,
                    border: '1.5px solid #93C5FD',
                    mt: 0.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditIcon sx={{ color: '#0284C7', fontSize: 22 }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E3A8A', display: 'block', fontSize: 12 }}>
                        Mau ubah teks, label, ketentuan, atau format kartu?
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#3B82F6', fontSize: 11 }}>
                        Tersedia fitur <strong>Live Preview</strong>: teks di kartu langsung berubah saat Anda mengetik di editor.
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleOpenFormatModal}
                    startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                    sx={{
                      bgcolor: '#0284C7',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: 11.5,
                      textTransform: 'none',
                      py: 0.6,
                      px: 2,
                      borderRadius: 1.5,
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                      '&:hover': { bgcolor: '#0369A1' },
                    }}
                  >
                    ✏️ Edit Format &amp; Preview
                  </Button>
                </Box>
              </Box>

              {/* AREA CETAK / PRINTABLE AREA: 1 LEMBAR A4 BERISI 2 KARTU */}
              <CardContent sx={{ p: 2.5, bgcolor: '#E2E8F0', maxHeight: '72vh', overflowY: 'auto' }}>
                <Box id="itsp-idcard-printable-container" className="notranslate" translate="no">
                  {a4Pages.map((pagePair, pageIndex) => (
                    <Box
                      key={pageIndex}
                      className="a4-print-sheet notranslate"
                      translate="no"
                      sx={{
                        bgcolor: '#FFFFFF',
                        p: 2.5,
                        mb: 3,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        border: '1px solid #CBD5E1',
                        borderRadius: 1.5,
                      }}
                    >
                      <Box className="no-print" sx={{ mb: 1.5, pb: 1, borderBottom: '1px dashed #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#018730' }}>
                          📄 Lembar Kertas A4 #{pageIndex + 1} (Muat {pagePair.length} Kartu)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Karyawan: {pagePair.map((p) => p.namaLengkap).join(' & ')}
                        </Typography>
                      </Box>

                      {/* Render Kartu Karyawan 1 (Atas) */}
                      {renderSingleIdCard(pagePair[0])}

                      {/* Garis Potong Horizontal Pemisah Lembar A4 */}
                      {pagePair.length > 1 ? (
                        <>
                          <Box
                            sx={{
                              my: 2,
                              borderTop: '1.5px dashed #94A3B8',
                              textAlign: 'center',
                              position: 'relative',
                            }}
                          >
                            <Typography
                              sx={{
                                position: 'absolute',
                                top: '-9px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                bgcolor: '#FFFFFF',
                                px: 1.5,
                                fontSize: '9px',
                                color: '#64748B',
                                fontWeight: 700,
                              }}
                            >
                              ✂️ Garis Potong Antar Kartu (Kertas A4)
                            </Typography>
                          </Box>

                          {/* Render Kartu Karyawan 2 (Bawah) */}
                          {renderSingleIdCard(pagePair[1])}
                        </>
                      ) : (
                        <Box
                          className="no-print"
                          sx={{
                            mt: 2,
                            p: 3,
                            border: '1.5px dashed #CBD5E1',
                            borderRadius: 2,
                            textAlign: 'center',
                            bgcolor: '#F8FAFC',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                            Sisi Bawah Lembar A4 Masih Kosong.
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: '#94A3B8', mt: 0.3 }}>
                            Centang 1 karyawan lagi di tabel sebelah kiri agar 1 lembar A4 ini memuat 2 kartu sekaligus.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>

              {/* Status Selesai Cetak Toggle */}
              {selectedEmp && (
                <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={selectedEmp.idCardPrinted ? 'Sudah Selesai Dicetak' : 'Belum Dicetak'}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: selectedEmp.idCardPrinted ? '#DCFCE7' : '#FEF3C7',
                        color: selectedEmp.idCardPrinted ? '#15803D' : '#B45309',
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Status untuk: <strong>{selectedEmp.namaLengkap}</strong>
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleTogglePrinted(selectedEmp)}
                    startIcon={<CheckCircleIcon />}
                    sx={{
                      fontWeight: 700,
                      textTransform: 'none',
                      borderColor: selectedEmp.idCardPrinted ? '#DC2626' : '#018730',
                      color: selectedEmp.idCardPrinted ? '#DC2626' : '#018730',
                      '&:hover': {
                        bgcolor: selectedEmp.idCardPrinted ? '#FEF2F2' : '#F0FDF4',
                      },
                    }}
                  >
                    {selectedEmp.idCardPrinted ? 'Batalkan Status Cetak' : 'Tandai Selesai Dicetak'}
                  </Button>
                </Box>
              )}
            </Card>
          ) : (
            <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #CBD5E1', bgcolor: '#FFFFFF' }}>
              <BadgeIcon sx={{ fontSize: 52, color: '#CBD5E1', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#475569' }}>
                Belum Ada Karyawan yang Dipilih
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 380, mx: 'auto', mt: 0.5 }}>
                Centang checkbox pada baris karyawan di tabel sebelah kiri (bisa 1 atau 2 orang sekaligus) untuk mencetaknya di 1 lembar A4.
              </Typography>
            </Card>
          )}
        </Box>
      </Box>

      {/* MODAL 1: EDITOR FORMAT ID CARD DENGAN LIVE PREVIEW REAL-TIME */}
      <Dialog
        open={formatModalOpen}
        onClose={() => setFormatModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#0F172A', color: '#FFFFFF', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EditIcon sx={{ color: '#4ADE80' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 18, color: '#FFFFFF' }}>
                Editor Format &amp; Template ID Card PT ITSP (Dengan Live Preview)
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setFormatModalOpen(false)} sx={{ color: '#94A3B8' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0, bgcolor: '#F8FAFC' }}>
          {formatSaveFeedback && (
            <Alert severity={formatSaveFeedback.startsWith('✓') ? 'success' : 'error'} sx={{ m: 2, mb: 0 }}>
              {formatSaveFeedback}
            </Alert>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.05fr 1.15fr' }, minHeight: '620px' }}>
            {/* Sisi Kiri: Form Input Format & Teks */}
            <Box sx={{ p: 3, borderRight: '1px solid #E2E8F0', bgcolor: '#FFFFFF', maxHeight: '70vh', overflowY: 'auto' }}>
              <Tabs
                value={formatTab}
                onChange={(_, val) => setFormatTab(val)}
                sx={{ mb: 2.5, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Identitas & Kartu Depan" sx={{ fontWeight: 700, fontSize: 12 }} />
                <Tab label="Ketentuan Penggunaan" sx={{ fontWeight: 700, fontSize: 12 }} />
                <Tab label="Kebijakan Mutu" sx={{ fontWeight: 700, fontSize: 12 }} />
              </Tabs>

              {/* TAB 0: IDENTITAS & KARTU DEPAN */}
              {formatTab === 0 && (
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nama Perusahaan (Header)"
                    value={tempFormat.companyName}
                    onChange={(e) => setTempFormat({ ...tempFormat, companyName: e.target.value })}
                  />

                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#018730', display: 'block', mt: 1 }}>
                    📍 Alamat Pabrik KIIC (Karawang):
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="KIIC Baris 1"
                    value={tempFormat.kiicLine1}
                    onChange={(e) => setTempFormat({ ...tempFormat, kiicLine1: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="KIIC Baris 2"
                    value={tempFormat.kiicLine2}
                    onChange={(e) => setTempFormat({ ...tempFormat, kiicLine2: e.target.value })}
                  />

                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#0284C7', display: 'block', mt: 1 }}>
                    📍 Alamat Pabrik GIIC (Cikarang Bekasi):
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="GIIC Baris 1"
                    value={tempFormat.giicLine1}
                    onChange={(e) => setTempFormat({ ...tempFormat, giicLine1: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="GIIC Baris 2"
                    value={tempFormat.giicLine2}
                    onChange={(e) => setTempFormat({ ...tempFormat, giicLine2: e.target.value })}
                  />

                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'block', mt: 1 }}>
                    🏷️ Label Kolom Informasi Karyawan:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Label Employee ID"
                    value={tempFormat.labelEmployeeId}
                    onChange={(e) => setTempFormat({ ...tempFormat, labelEmployeeId: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Label Nama"
                    value={tempFormat.labelName}
                    onChange={(e) => setTempFormat({ ...tempFormat, labelName: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Label Jabatan / Posisi"
                    value={tempFormat.labelPosition}
                    onChange={(e) => setTempFormat({ ...tempFormat, labelPosition: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Label Departemen"
                    value={tempFormat.labelDepartment}
                    onChange={(e) => setTempFormat({ ...tempFormat, labelDepartment: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Teks Authorizer's Signature"
                    value={tempFormat.labelAuthorizerSignature}
                    onChange={(e) => setTempFormat({ ...tempFormat, labelAuthorizerSignature: e.target.value })}
                  />
                </Stack>
              )}

              {/* TAB 1: KETENTUAN PENGGUNAAN */}
              {formatTab === 1 && (
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Judul Ketentuan"
                    value={tempFormat.termsTitle}
                    onChange={(e) => setTempFormat({ ...tempFormat, termsTitle: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Ketentuan Butir 1"
                    value={tempFormat.termsItem1}
                    onChange={(e) => setTempFormat({ ...tempFormat, termsItem1: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Ketentuan Butir 2"
                    value={tempFormat.termsItem2}
                    onChange={(e) => setTempFormat({ ...tempFormat, termsItem2: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Ketentuan Butir 3"
                    value={tempFormat.termsItem3}
                    onChange={(e) => setTempFormat({ ...tempFormat, termsItem3: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Jabatan Penandatangan Kanan Bawah (HRM)"
                    value={tempFormat.hrmSignerTitle}
                    onChange={(e) => setTempFormat({ ...tempFormat, hrmSignerTitle: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Nama Perusahaan Bawah (HRM PT. ITSP)"
                    value={tempFormat.hrmCompanyFooter}
                    onChange={(e) => setTempFormat({ ...tempFormat, hrmCompanyFooter: e.target.value })}
                  />
                </Stack>
              )}

              {/* TAB 2: KEBIJAKAN MUTU PERUSAHAAN */}
              {formatTab === 2 && (
                <Stack spacing={2}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E3A8A' }}>
                    🇬🇧 Kebijakan Mutu (Versi Bahasa Inggris - Kiri Bawah):
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Judul English"
                    value={tempFormat.qualityTitleEn}
                    onChange={(e) => setTempFormat({ ...tempFormat, qualityTitleEn: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    label="Teks Kebijakan Mutu English"
                    value={tempFormat.qualityTextEn}
                    onChange={(e) => setTempFormat({ ...tempFormat, qualityTextEn: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Label Halaman English"
                    value={tempFormat.qualityPageEn}
                    onChange={(e) => setTempFormat({ ...tempFormat, qualityPageEn: e.target.value })}
                  />

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534' }}>
                    🇮🇩 Kebijakan Mutu (Versi Bahasa Indonesia - Kanan Bawah):
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Judul Indonesia"
                    value={tempFormat.qualityTitleId}
                    onChange={(e) => setTempFormat({ ...tempFormat, qualityTitleId: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    label="Teks Kebijakan Mutu Indonesia"
                    value={tempFormat.qualityTextId}
                    onChange={(e) => setTempFormat({ ...tempFormat, qualityTextId: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Label Halaman Indonesia"
                    value={tempFormat.qualityPageId}
                    onChange={(e) => setTempFormat({ ...tempFormat, qualityPageId: e.target.value })}
                  />
                </Stack>
              )}
            </Box>

            {/* Sisi Kanan: LIVE PREVIEW REAL-TIME */}
            <Box sx={{ p: 2.5, bgcolor: '#E2E8F0', display: 'flex', flexDirection: 'column', maxHeight: '70vh', overflowY: 'auto' }}>
              <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ViewIcon fontSize="small" sx={{ color: '#018730' }} /> Pratinjau Langsung (Live Preview)
                </Typography>
                <Chip size="small" label="Tersinkron Realtime" color="success" sx={{ fontWeight: 800, fontSize: 10 }} />
              </Box>

              <Typography variant="caption" sx={{ color: '#64748B', mb: 2, display: 'block' }}>
                Setiap perubahan teks pada form di sebelah kiri langsung ter-update di kartu pratinjau ini:
              </Typography>

              {/* Render Preview dengan Konfigurasi tempFormat */}
              <Box sx={{ transform: 'scale(0.84)', transformOrigin: 'top center', mb: -6 }}>
                {renderSingleIdCard(selectedEmp || employees[0] || {
                  id: 999,
                  employeeId: '1530.09.26',
                  namaLengkap: 'CONTOH NAMA KARYAWAN',
                  jabatan: 'Staff IT & Sistem Perusahaan',
                  departemen: 'Teknologi Informasi',
                  photoProfile: null,
                }, tempFormat)}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#F1F5F9', justifyContent: 'space-between' }}>
          <Button
            color="error"
            startIcon={<ResetIcon />}
            onClick={handleResetToFactoryDefault}
            sx={{ fontWeight: 700, textTransform: 'none' }}
          >
            Kembalikan ke Default Excel
          </Button>

          <Stack direction="row" spacing={1.5}>
            <Button onClick={() => setFormatModalOpen(false)}>Batal</Button>
            <Button
              variant="contained"
              onClick={handleSaveCustomFormat}
              sx={{ bgcolor: '#018730', fontWeight: 800, px: 3, '&:hover': { bgcolor: '#005c21' } }}
            >
              Simpan Format Kartu
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* MODAL 2: PENGATURAN TANDA TANGAN DEFAULT HR */}
      <Dialog open={authorizerModalOpen} onClose={() => setAuthorizerModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#0F172A', color: '#FFFFFF', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DrawIcon sx={{ color: '#4ADE80' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 17, color: '#FFFFFF' }}>
                Atur Tanda Tangan Default HR (Authorizer&apos;s Signature)
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setAuthorizerModalOpen(false)} sx={{ color: '#94A3B8' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3, bgcolor: '#F8FAFC' }}>
          <Typography variant="body2" sx={{ color: '#334155', mb: 2 }}>
            Tanda tangan ini akan otomatis terpasang di seluruh ID Card karyawan pada kolom <strong>Authorizer&apos;s Signature</strong>, sehingga Anda tidak perlu menandatangani ulang setiap kali mencetak ID Card.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <SignaturePad value={tempSignature} onChange={(val) => setTempSignature(val)} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderColor: '#CBD5E1', color: '#334155' }}
              >
                Upload File Gambar (PNG/JPG)
                <input type="file" hidden accept="image/*" onChange={handleUploadSignature} />
              </Button>

              <Button
                variant="outlined"
                startIcon={<ContentPasteIcon />}
                onClick={async () => {
                  try {
                    if (!navigator.clipboard?.read) {
                      alert('Silakan gunakan pintasan keyboard: Tekan Ctrl + V untuk langsung menempelkan gambar tanda tangan.');
                      return;
                    }
                    const items = await navigator.clipboard.read();
                    for (const item of items) {
                      const imgType = item.types.find((t) => t.startsWith('image/'));
                      if (imgType) {
                        const blob = await item.getType(imgType);
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          if (evt.target?.result) {
                            setTempSignature(evt.target.result as string);
                          }
                        };
                        reader.readAsDataURL(blob);
                        return;
                      }
                    }
                    alert('Tidak ada gambar pada clipboard Anda. Silakan salin (Copy / Screenshot) gambar tanda tangan terlebih dahulu, lalu tekan tombol ini atau Ctrl + V.');
                  } catch (err) {
                    console.warn(err);
                    alert('Akses clipboard otomatis dibatasi oleh browser. Silakan langsung tekan pintasan keyboard: Ctrl + V untuk menempelkan gambar.');
                  }
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 12,
                  borderColor: '#0284C7',
                  color: '#0284C7',
                  bgcolor: '#F0F9FF',
                  '&:hover': { bgcolor: '#E0F2FE', borderColor: '#0369A1' },
                }}
              >
                Tempel dari Clipboard (Ctrl + V)
              </Button>
            </Stack>

            <Button
              size="small"
              color="inherit"
              onClick={() => setTempSignature(DEFAULT_HR_SIGNATURE)}
              sx={{ textTransform: 'none', fontSize: 11.5, color: '#64748B' }}
            >
              Gunakan Tanda Tangan Contoh
            </Button>
          </Box>

          {tempSignature && (
            <Box
              sx={{
                mt: 2.5,
                p: 2,
                bgcolor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#92400E', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 12 }}>
                  🔍 Ukuran Tanda Tangan di ID Card (Scale):
                </Typography>
                <Chip
                  size="small"
                  label={`${tempSignatureScale}%`}
                  sx={{ fontWeight: 800, bgcolor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', height: 22 }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setTempSignatureScale(Math.max(50, tempSignatureScale - 10))}
                  disabled={tempSignatureScale <= 50}
                  sx={{ p: 0.5, bgcolor: '#FFFFFF', border: '1px solid #FDE68A', color: '#92400E' }}
                >
                  <ZoomOutIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <Slider
                  value={tempSignatureScale}
                  onChange={(_, v) => setTempSignatureScale(v as number)}
                  min={50}
                  max={220}
                  step={5}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v}%`}
                  sx={{
                    flexGrow: 1,
                    color: '#D97706',
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20,
                      bgcolor: '#FFFFFF',
                      border: '2px solid #D97706',
                      '&:hover': { boxShadow: '0 0 0 6px rgba(217, 119, 6, 0.15)' },
                    },
                    '& .MuiSlider-track': { height: 6 },
                    '& .MuiSlider-rail': { height: 6, bgcolor: '#FDE68A' },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => setTempSignatureScale(Math.min(220, tempSignatureScale + 10))}
                  disabled={tempSignatureScale >= 220}
                  sx={{ p: 0.5, bgcolor: '#FFFFFF', border: '1px solid #FDE68A', color: '#92400E' }}
                >
                  <ZoomInIcon sx={{ fontSize: 18 }} />
                </IconButton>
                {tempSignatureScale !== 100 && (
                  <Button
                    size="small"
                    onClick={() => setTempSignatureScale(100)}
                    sx={{ fontSize: 11, fontWeight: 700, color: '#B45309', textTransform: 'none', minWidth: 'auto' }}
                  >
                    Reset
                  </Button>
                )}
              </Box>

              {/* Simulasi Card Footer Preview */}
              <Box sx={{ mt: 2, p: 2, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1px dashed #D97706', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 800, fontSize: 11, mb: 1, display: 'block' }}>
                  Simulasi Tampilan Tanda Tangan pada ID Card (Tidak Terpotong):
                </Typography>
                <Box
                  sx={{
                    height: `${Math.min(50, Math.max(26, Math.round(32 * (tempSignatureScale / 100))))}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'visible',
                    mx: 'auto',
                  }}
                >
                  <Box
                    component="img"
                    src={tempSignature}
                    alt="Scale Preview"
                    sx={{
                      height: `${Math.round(28 * (tempSignatureScale / 100))}px`,
                      maxWidth: `${Math.round(140 * (tempSignatureScale / 100))}px`,
                      maxHeight: `${Math.round(52 * (tempSignatureScale / 100))}px`,
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: 9, fontWeight: 700, color: '#000000', mt: 0.5 }}>
                  Authorizer&apos;s Signature ........................
                </Typography>

                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mt: 1.5 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopyIcon sx={{ fontSize: 13 }} />}
                    onClick={async () => {
                      try {
                        const res = await fetch(tempSignature);
                        const blob = await res.blob();
                        if (navigator.clipboard?.write) {
                          await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
                          alert('Gambar tanda tangan berhasil disalin (Copy) ke clipboard!');
                          return;
                        }
                      } catch (e) {
                        console.warn(e);
                      }
                      alert('Tanda tangan siap digunakan.');
                    }}
                    sx={{ textTransform: 'none', fontSize: 11, fontWeight: 700, color: '#475569', borderColor: '#CBD5E1' }}
                  >
                    Salin Gambar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setTempSignature('')}
                    sx={{ textTransform: 'none', fontSize: 11, fontWeight: 700 }}
                  >
                    Hapus Tanda Tangan
                  </Button>
                </Stack>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#F1F5F9' }}>
          <Button onClick={() => setAuthorizerModalOpen(false)}>Batal</Button>
          <Button
            variant="contained"
            onClick={handleSaveDefaultSignature}
            sx={{
              bgcolor: '#018730',
              fontWeight: 800,
              px: 3,
              '&:hover': { bgcolor: '#005c21' },
            }}
          >
            Simpan Tanda Tangan Default
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
