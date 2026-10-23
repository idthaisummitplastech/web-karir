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

// ID Card Format Config Structure (editable by HR)
export interface IdCardFormatConfig {
  templateVersion?: number;
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
  environmentalTitleEn: string;
  environmentalItem1En: string;
  environmentalItem2En: string;
  environmentalItem3En: string;
  environmentalTitleId: string;
  environmentalItem1Id: string;
  environmentalItem2Id: string;
  environmentalItem3Id: string;
  qualityPageEn?: string;
  qualityPageId?: string;
}

// Default Official Factory Format as per User Excel Document
const DEFAULT_IDCARD_FORMAT: IdCardFormatConfig = {
  templateVersion: 3,
  companyName: 'PT. Indonesia Thai Summit Plastech',
  kiicLine1: 'Jl. Permata Raya Lot FF-5, Telukjambe Timur,',
  kiicLine2: 'Kawasan KIIC, Karawang - 41361',
  giicLine1: 'Jl. Edelveis Block DC-1B, Sukamukti Bojongmangu,',
  giicLine2: 'Kawasan GIIC, Kabupaten Bekasi - 17350',
  labelEmployeeId: 'Employee ID.',
  labelName: 'Name',
  labelPosition: 'Position',
  labelDepartment: 'Department',
  labelAuthorizerSignature: "Authorizer's Signature  ........................",
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
  environmentalTitleEn: 'ENVIROMENTAL POLICY STATEMENT',
  environmentalItem1En: '1. Comply with laws and regulations and other',
  environmentalItem2En: '2. Conduct environmental protection with pollution prevention, use of sustainable resources and mitigation of climate change adaptation.',
  environmentalItem3En: '3. Make continuous improvement of enviromental management system to improve enviromental performance.',
  environmentalTitleId: 'KEBIJAKAN LINGKUNGAN PERUSAHAAN',
  environmentalItem1Id: '1. Mematuhi peraturan perundangan dan persyaratan',
  environmentalItem2Id: '2. Melakukan perlindungan lingkungan dengan pencegahan pencemaran, penggunaan sumberdaya berkelanjutan dan mitigasi adaptasi perubahan iklim.',
  environmentalItem3Id: '3. Melakukan peningkatan berkesinambungan sistem manajemen lingkungan guna meningkatkan kinerja lingkungan.',
};

// Default Sample HR Signature (Base64 safe SVG)
const DEFAULT_HR_SIGNATURE =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAxNDAgNjAiPjxwYXRoIGQ9Ik0gMTUgNDUgUSAyNSAxNSwgNDAgMzAgVCA2NSAyNSBUIDkwIDQwIFQgMTE1IDIwIFQgMTMwIDM1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwRjE3MkEiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNIDQ1IDM1USA1NSA1LCA1MCA0OCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEYxNzJBIiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iOTUiIGN5PSIyMiIgcj0iMi41IiBmaWxsPSIjMEYxNzJBIi8+PC9zdmc=';

// Helper to auto-crop / trim white and transparent empty background from signature
// so the signature is saved only on its actual strokes without empty bounds that would shrink or clip it
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

      // Stroke detected if not transparent and not pure white / bright paper white
      const isStroke = a > 20 && !(r > 235 && g > 235 && b > 235);
      if (isStroke) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If canvas is completely empty
  if (maxX === -1 || maxY === -1) {
    return sourceCanvas.toDataURL('image/png');
  }

  // Add safe padding around signature strokes
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

  // Make white / light-gray pixels transparent so the signature looks like real ink on the card
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
      alert('Pasted file or clipboard content must be an image (PNG/JPG).');
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
            setFeedback('✓ Signature image pasted successfully (background cleaned & neatly cropped)!');
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
        alert('Your browser requires a keyboard shortcut: Please press Ctrl + V to paste the signature image.');
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
      alert('No signature image in clipboard. Please copy (Copy / Screenshot) the signature image first, then press this button or Ctrl + V.');
    } catch (err: any) {
      console.warn('Clipboard read error:', err);
      alert('Automatic clipboard access is limited by the browser. Please directly press the keyboard shortcut: Ctrl + V to paste the image.');
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
        setFeedback('✓ Signature image copied to clipboard!');
        setTimeout(() => setFeedback(null), 3000);
        return;
      }
    } catch (e) {
      console.warn(e);
    }
    setFeedback('✓ Active signature ready to use.');
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
    // Auto-trim empty bounds after drawing completes
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
          ✍️ Draw with Mouse / Touchscreen or Paste Image:
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
              Copy
            </Button>
          )}

          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
            onClick={handleClear}
            sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none' }}
          >
            Remove / Retry
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

  // PT Address Choice (KIIC or GIIC)
  const [selectedPlant, setSelectedPlant] = useState<'GIIC' | 'KIIC'>('GIIC');

  // Print Display Mode: 'mutu_only' (4 panels — Front, Back, Quality EN, Quality ID) | 'id_card_only' (Front & Back only)
  const [printLayoutMode, setPrintLayoutMode] = useState<'mutu_only' | 'id_card_only'>('mutu_only');

  // Default Digital HR Signature
  const [defaultHrSignature, setDefaultHrSignature] = useState<string>('');
  const [authorizerModalOpen, setAuthorizerModalOpen] = useState(false);
  const [tempSignature, setTempSignature] = useState<string>('');
  // Signature scale for ID Card print preview (30-250%, default 100)
  const [signatureScale, setSignatureScale] = useState<number>(100);
  const [tempSignatureScale, setTempSignatureScale] = useState<number>(100);

  // Inline photo upload state
  const [photoUploadingId, setPhotoUploadingId] = useState<number | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const [photoUploadTarget, setPhotoUploadTarget] = useState<any | null>(null);

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
        if (parsed && parsed.templateVersion === 3) {
          setCardFormat({ ...DEFAULT_IDCARD_FORMAT, ...parsed });
          setTempFormat({ ...DEFAULT_IDCARD_FORMAT, ...parsed });
        } else {
          // Auto-upgrade to Version 3 (Official Excel Layout & Gap Format)
          setCardFormat(DEFAULT_IDCARD_FORMAT);
          setTempFormat(DEFAULT_IDCARD_FORMAT);
          localStorage.setItem('itsp_custom_idcard_format', JSON.stringify(DEFAULT_IDCARD_FORMAT));
        }
      } else {
        setCardFormat(DEFAULT_IDCARD_FORMAT);
        setTempFormat(DEFAULT_IDCARD_FORMAT);
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

  // Inline Photo Upload Handler — uploads directly and syncs to employee data
  const handlePhotoUploadClick = (emp: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoUploadTarget(emp);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
      photoInputRef.current.click();
    }
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photoUploadTarget) return;
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG/PNG/WEBP).');
      return;
    }
    // Compress and convert to base64
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const src = evt.target?.result as string;
      if (!src) return;
      const img = new (window as any).Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX = 400;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.82);

        setPhotoUploadingId(photoUploadTarget.id);
        try {
          const source: string = photoUploadTarget.source || 'employee';
          const empId: number = photoUploadTarget.id;
          let endpoint = `/api/admin/employees/${empId}`;
          if (source === 'applicant') {
            endpoint = `/api/admin/applicants/${empId}`;
          }
          const res = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photoProfile: base64 }),
          });
          if (res.ok) {
            // Update local state immediately so preview refreshes
            setEmployees((prev) =>
              prev.map((item) =>
                item.id === empId ? { ...item, photoProfile: base64 } : item
              )
            );
            if (selectedEmp?.id === empId) {
              setSelectedEmp((prev: any) => ({ ...prev, photoProfile: base64 }));
            }
          } else {
            const err = await res.json().catch(() => ({}));
            alert('Gagal menyimpan foto: ' + (err?.error || res.statusText));
          }
        } catch (err: any) {
          alert('Error upload foto: ' + err.message);
        } finally {
          setPhotoUploadingId(null);
          setPhotoUploadTarget(null);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
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
      setFormatSaveFeedback('✓ ID Card template format saved and applied instantly.');
      setTimeout(() => {
        setFormatModalOpen(false);
        setFormatSaveFeedback(null);
      }, 1000);
    } catch (e) {
      console.error(e);
      setFormatSaveFeedback('Failed to save format to local storage.');
    }
  };

  const handleResetToFactoryDefault = () => {
    setTempFormat({ ...DEFAULT_IDCARD_FORMAT });
    setCardFormat({ ...DEFAULT_IDCARD_FORMAT });
    try {
      localStorage.removeItem('itsp_custom_idcard_format');
    } catch {}
    setFormatSaveFeedback('✓ Card format has been reset to factory default.');
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
    // Clean up duplicate ITSP prefix if present (e.g.: "ITSP. ITSP-..." or "ITSP.ITSP-...")
    trimmed = trimmed.replace(/^ITSP[\.\s\-_]+ITSP[\.\s\-_]*/i, 'ITSP.');
    if (/^ITSP[\.\s\-_]/i.test(trimmed) || trimmed.toUpperCase() === 'ITSP') {
      return trimmed;
    }
    return `ITSP.${trimmed}`;
  };

  // Employees to be printed
  const employeesToPrint =
    selectedIds.length > 0
      ? employees.filter((e) => selectedIds.includes(e.id))
      : selectedEmp
      ? [selectedEmp]
      : [];

  // Split employee list to A4 sheets
  // Exactly 2 employees per A4 sheet (both 4-panel sets fit on 1 sheet with cutting line between them).
  const a4Pages: any[][] = [];
  const employeesPerSheet = 2;
  for (let i = 0; i < employeesToPrint.length; i += employeesPerSheet) {
    a4Pages.push(employeesToPrint.slice(i, i + employeesPerSheet));
  }

  // Component renderer for 1 employee's ID Card kit
  const renderSingleIdCard = (emp: any, customFmt: IdCardFormatConfig = cardFormat) => {
    return (
      <Box key={emp.id} className="notranslate itsp-employee-card-kit" translate="no" sx={{ width: '100%', maxWidth: '720px', mx: 'auto' }}>
        {/* ROW 1: FRONT & BACK ID CARD (2 Separate Boxes With Gap) */}
        <Box
          className="notranslate itsp-idcard-row-pair"
          translate="no"
          sx={{
            width: '100%',
            maxWidth: '720px',
            mx: 'auto',
            fontFamily: 'Arial, Helvetica, sans-serif',
            color: '#000000',
            boxSizing: 'border-box',
            mb: { xs: 1.5, sm: 2 },
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: { xs: 1.5, sm: 2 },
            height: { xs: 'auto', sm: '228px' },
          }}
        >
          {/* PANEL 1: FRONT ID CARD (LEFT) */}
          <Box
            className="notranslate itsp-idcard-panel"
            translate="no"
            sx={{
              border: '1.5px solid #000000',
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              overflow: 'hidden',
              height: '100%',
            }}
          >
            {/* Header: Exact Excel Table Layout with Grid Borders */}
            <Box
              sx={{
                display: 'flex',
                borderBottom: '1.5px solid #000000',
                height: '84px',
                flexShrink: 0,
              }}
            >
              {/* Left Logo Box: bordered cell */}
              <Box
                sx={{
                  width: '88px',
                  borderRight: '1.5px solid #000000',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0.5,
                  flexShrink: 0,
                  bgcolor: '#FFFFFF',
                }}
              >
                <Box
                  component="img"
                  src="/logo-plastech.jpg"
                  alt="PLASTECH"
                  sx={{ height: 38, width: 'auto', objectFit: 'contain', display: 'block' }}
                />
                <Typography
                  sx={{
                    fontFamily: 'Impact, Arial Black, sans-serif',
                    fontSize: 9.5,
                    fontWeight: 900,
                    color: '#1E3A8A',
                    letterSpacing: '0.8px',
                    lineHeight: 1,
                    mt: 0.4,
                  }}
                >
                  PLASTECH
                </Typography>
              </Box>

              {/* Right Address Table: 3 rows separated by borders */}
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minWidth: 0,
                }}
              >
                {/* Row 1: Company Name */}
                <Box
                  sx={{
                    p: '2px 4px',
                    textAlign: 'center',
                    borderBottom: '1px solid #000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexGrow: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 11,
                      color: '#000000',
                      lineHeight: 1.15,
                      fontFamily: 'Arial, sans-serif',
                    }}
                  >
                    {customFmt.companyName}
                  </Typography>
                </Box>

                {/* Row 2: Plan 1 (KIIC) */}
                <Box
                  sx={{
                    p: '1.5px 5px',
                    borderBottom: '1px solid #000000',
                    display: 'flex',
                    alignItems: 'flex-start',
                    fontSize: '7.8px',
                    lineHeight: 1.15,
                    fontFamily: 'Arial, sans-serif',
                    color: '#000000',
                    flexGrow: 1,
                  }}
                >
                  <span style={{ fontWeight: 700, width: '38px', flexShrink: 0 }}>Plan 1 :</span>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ whiteSpace: 'nowrap' }}>{customFmt.kiicLine1.replace(/^Plan\s*1\s*:\s*/i, '')}</div>
                    <div style={{ whiteSpace: 'nowrap' }}>{customFmt.kiicLine2}</div>
                  </Box>
                </Box>

                {/* Row 3: Plan 2 (GIIC) */}
                <Box
                  sx={{
                    p: '1.5px 5px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    fontSize: '7.8px',
                    lineHeight: 1.15,
                    fontFamily: 'Arial, sans-serif',
                    color: '#000000',
                    flexGrow: 1,
                  }}
                >
                  <span style={{ fontWeight: 700, width: '38px', flexShrink: 0 }}>Plan 2 :</span>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ whiteSpace: 'nowrap' }}>{customFmt.giicLine1.replace(/^Plan\s*2\s*:\s*/i, '')}</div>
                    <div style={{ whiteSpace: 'nowrap' }}>{customFmt.giicLine2}</div>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Body: Photo on Left + 4 Data Columns on Right */}
            <Box sx={{ display: 'flex', gap: 1, p: 0.8, alignItems: 'stretch', flexGrow: 1 }}>
              {/* Official Photo Box with sharp 1px solid border */}
              <Box
                sx={{
                  width: 72,
                  height: 94,
                  border: '1px solid #000000',
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
                      bgcolor: '#F8FAFC',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94A3B8',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 32 }} />
                    <Typography sx={{ fontSize: 7.5, fontWeight: 700 }}>Photo</Typography>
                  </Box>
                )}
              </Box>

              {/* Table 4 Rows + Signature */}
              <Box sx={{ flexGrow: 1, minWidth: 0, pl: 0.6, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', color: '#000000', tableLayout: 'fixed', fontFamily: 'Arial, sans-serif' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '74px', fontWeight: 700, padding: '1px 0', whiteSpace: 'nowrap' }}>{customFmt.labelEmployeeId}</td>
                      <td style={{ width: '8px', textAlign: 'center' }}>:</td>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '9.5px', wordBreak: 'break-word' }}>
                        {formatDisplayId(emp.employeeId)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, padding: '1px 0', whiteSpace: 'nowrap' }}>{customFmt.labelName}</td>
                      <td style={{ textAlign: 'center' }}>:</td>
                      <td style={{ fontWeight: 700, wordBreak: 'break-word', lineHeight: 1.15 }}>{emp.namaLengkap}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, padding: '1px 0', whiteSpace: 'nowrap' }}>{customFmt.labelPosition}</td>
                      <td style={{ textAlign: 'center' }}>:</td>
                      <td style={{ wordBreak: 'break-word', lineHeight: 1.15 }}>{emp.jabatan || '-'}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700, padding: '1px 0', whiteSpace: 'nowrap' }}>{customFmt.labelDepartment}</td>
                      <td style={{ textAlign: 'center' }}>:</td>
                      <td style={{ wordBreak: 'break-word', lineHeight: 1.15 }}>{emp.departemen || '-'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Authorizer's Signature directly below department, matching Excel rows 11-13 */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pr: 0.5, mt: 'auto' }}>
                  <Box
                    sx={{
                      height: `${Math.min(36, Math.max(18, Math.round(22 * (signatureScale / 100))))}px`,
                      width: '120px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      overflow: 'visible',
                      mb: '-5px',
                      zIndex: 1,
                    }}
                  >
                    {defaultHrSignature ? (
                      <Box
                        component="img"
                        src={defaultHrSignature}
                        alt="Authorizer's Signature"
                        sx={{
                          height: `${Math.round(22 * (signatureScale / 100))}px`,
                          maxWidth: `${Math.round(110 * (signatureScale / 100))}px`,
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    ) : null}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '7.5px',
                      fontWeight: 700,
                      color: '#000000',
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                      letterSpacing: '-0.2px',
                    }}
                  >
                    {customFmt.labelAuthorizerSignature}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* PANEL 2: KETENTUAN PENGGUNAAN (RIGHT) */}
          <Box
            className="notranslate itsp-idcard-panel"
            translate="no"
            sx={{
              p: 1.4,
              border: '1.5px solid #000000',
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              overflow: 'hidden',
              height: '100%',
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 11,
                  textAlign: 'center',
                  color: '#000000',
                  mb: 1.2,
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                {customFmt.termsTitle}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, fontSize: '8.8px', color: '#000000', lineHeight: 1.35, fontFamily: 'Arial, sans-serif' }}>
                <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 700, flexShrink: 0 }}>1.</span>
                  <span>{customFmt.termsItem1.replace(/^[0-9]+[\.\s]*/, '')}</span>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 700, flexShrink: 0 }}>2.</span>
                  <span>{customFmt.termsItem2.replace(/^[0-9]+[\.\s]*/, '')}</span>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 700, flexShrink: 0 }}>3.</span>
                  <span>{customFmt.termsItem3.replace(/^[0-9]+[\.\s]*/, '')}</span>
                </Box>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'right', pr: 1, pb: 0.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 10, color: '#000000', lineHeight: 1.2 }}>
                {customFmt.hrmSignerTitle}
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 8.8, color: '#000000', lineHeight: 1.2 }}>
                {customFmt.hrmCompanyFooter}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ROW 2: QUALITY POLICY STATEMENT (2 Separate Boxes With Gap) */}
        {printLayoutMode !== 'id_card_only' && (
          <Box
            className="notranslate itsp-idcard-row-pair"
            translate="no"
            sx={{
              width: '100%',
              maxWidth: '720px',
              mx: 'auto',
              fontFamily: 'Arial, Helvetica, sans-serif',
              color: '#000000',
              boxSizing: 'border-box',
              mb: { xs: 1.5, sm: 2 },
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: { xs: 1.5, sm: 2 },
              height: { xs: 'auto', sm: '228px' },
            }}
          >
            {/* Panel 3: Quality Policy Statement (English - Left) */}
            <Box
              className="notranslate itsp-idcard-panel"
              translate="no"
              sx={{
                p: 1.4,
                border: '1.5px solid #000000',
                bgcolor: '#FFFFFF',
                height: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                overflow: 'hidden',
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: 9.5, textAlign: 'center', color: '#000000', lineHeight: 1.2 }}>
                {customFmt.companyName.toUpperCase()}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 9.5, textAlign: 'center', color: '#000000', mt: 0.3, mb: 1, lineHeight: 1.2 }}>
                {customFmt.qualityTitleEn}
              </Typography>
              <Typography sx={{ fontSize: '8.6px', color: '#000000', textAlign: 'justify', lineHeight: 1.45, wordBreak: 'break-word' }}>
                {customFmt.qualityTextEn}
              </Typography>
            </Box>

            {/* Panel 4: Kebijakan Mutu Perusahaan (Indonesian - Right) */}
            <Box
              className="notranslate itsp-idcard-panel"
              translate="no"
              sx={{
                p: 1.4,
                border: '1.5px solid #000000',
                bgcolor: '#FFFFFF',
                height: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                overflow: 'hidden',
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: 9.5, textAlign: 'center', color: '#000000', lineHeight: 1.2 }}>
                {customFmt.companyName.toUpperCase()}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 9.5, textAlign: 'center', color: '#000000', mt: 0.3, mb: 1, lineHeight: 1.2 }}>
                {customFmt.qualityTitleId}
              </Typography>
              <Typography sx={{ fontSize: '8.6px', color: '#000000', textAlign: 'justify', lineHeight: 1.45, wordBreak: 'break-word' }}>
                {customFmt.qualityTextId}
              </Typography>
            </Box>
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
        padding: 0 !important;
        background: #ffffff !important;
      }
      .no-print {
        display: none !important;
      }
      .a4-print-sheet {
        page-break-after: always !important;
        break-after: page !important;
        width: 210mm !important;
        min-height: 297mm !important;
        max-height: 297mm !important;
        padding: 10mm 15mm !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-start !important;
        align-items: center !important;
        background: #ffffff !important;
        border: none !important;
        box-shadow: none !important;
        margin: 0 auto !important;
      }
      .a4-print-sheet:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      .itsp-employee-card-kit {
        width: 178mm !important;
        max-width: 178mm !important;
        min-width: 178mm !important;
        margin: 0 auto !important;
        box-sizing: border-box !important;
      }
      .itsp-idcard-row-pair {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        width: 178mm !important;
        max-width: 178mm !important;
        min-width: 178mm !important;
        height: 54mm !important;
        max-height: 54mm !important;
        min-height: 54mm !important;
        margin: 0 auto 3.5mm auto !important;
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-between !important;
        gap: 6mm !important;
        border: none !important;
        box-sizing: border-box !important;
        background: transparent !important;
      }
      .itsp-idcard-row-pair:last-child {
        margin-bottom: 0 !important;
      }
      .itsp-idcard-panel {
        width: 86mm !important;
        max-width: 86mm !important;
        min-width: 86mm !important;
        height: 54mm !important;
        max-height: 54mm !important;
        min-height: 54mm !important;
        border: 1.5px solid #000000 !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        background: #ffffff !important;
      }
      .itsp-cutting-line {
        width: 178mm !important;
        margin: 4mm auto !important;
        border-top: 1px dashed #94A3B8 !important;
        position: relative !important;
        text-align: center !important;
      }
      @page {
        size: A4 portrait;
        margin: 0mm;
      }
    }
  `;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Special A4 Portrait Print Stylesheet (1 Sheet Fits 2 ID Cards) */}
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <BadgeIcon sx={{ color: '#018730', fontSize: 30 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              ID Card &amp; Business Card Printing Module
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Official PT Indonesia Thai Summit Plastech format • A4 sheet fits 2 ID cards at once — customize template text &amp; format freely
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
            Edit Card Format &amp; Preview
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
            Configure HR Signature
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
            Print {employeesToPrint.length} Cards (A4 Print)
          </Button>

          <Tooltip title="Reload Data">
            <IconButton onClick={fetchEmployees} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Main Grid: Left Column Employee Selection Table, Right Column ID Card Preview */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.05fr 1.35fr' }, gap: 3 }}>
        {/* Left Column: Employee Table with Multi-Select Checkbox */}
        <Box>
          {/* Quick Selection Bar */}
          <Paper elevation={0} sx={{ p: 1.5, mb: 2, border: '1px solid #E2E8F0', borderRadius: 2, bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${selectedIds.length} Selected Employees`}
                size="small"
                color={selectedIds.length > 0 ? 'success' : 'default'}
                sx={{ fontWeight: 800 }}
              />
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                (1 A4 sheet fits 2 cards)
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleSelectTop2}
                sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none', py: 0.3 }}
              >
                Select Top 2 (1 A4 Sheet)
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={handleSelectAll}
                startIcon={<SelectAllIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none', py: 0.3 }}
              >
                Select All
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
            placeholder="Search employee name, ID, position, dept..."
            totalCount={employees.length}
            filteredCount={filteredEmployees.length}
          />

          {/* Hidden file input for photo upload */}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoFileChange}
          />

          <TableContainer component={Paper} sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 760 }}>
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
                  <TableCell sx={{ fontWeight: 800, py: 1.5, width: 72 }}>Foto</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>ID Employee</TableCell>
                  <TableCell sx={{ fontWeight: 800, py: 1.5 }}>Department</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={30} sx={{ color: '#018730', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: '#64748B' }}>
                        Loading employee data...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#64748B' }}>
                      {searchQuery
                        ? 'No employees match your search.'
                        : 'No employee data yet. Promote applicants in the Applicants menu to automatically add them here.'}
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

                        {/* Foto column with inline upload */}
                        <TableCell onClick={(e) => e.stopPropagation()} sx={{ width: 72, textAlign: 'center' }}>
                          <Tooltip title={emp.photoProfile ? 'Ganti Foto' : 'Upload Foto'} placement="top">
                            <Box
                              onClick={(e) => handlePhotoUploadClick(emp, e)}
                              sx={{
                                position: 'relative',
                                width: 44,
                                height: 44,
                                mx: 'auto',
                                cursor: 'pointer',
                                borderRadius: '50%',
                                border: emp.photoProfile ? '2px solid #018730' : '2px dashed #CBD5E1',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#F8FAFC',
                                transition: 'all 0.15s',
                                '&:hover': {
                                  borderColor: '#018730',
                                  bgcolor: '#F0FDF4',
                                  '& .photo-upload-overlay': { opacity: 1 },
                                },
                              }}
                            >
                              {photoUploadingId === emp.id ? (
                                <CircularProgress size={20} sx={{ color: '#018730' }} />
                              ) : emp.photoProfile ? (
                                <>
                                  <Box
                                    component="img"
                                    src={emp.photoProfile}
                                    alt={emp.namaLengkap}
                                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  />
                                  <Box
                                    className="photo-upload-overlay"
                                    sx={{
                                      position: 'absolute',
                                      inset: 0,
                                      bgcolor: 'rgba(0,0,0,0.45)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      opacity: 0,
                                      transition: 'opacity 0.15s',
                                    }}
                                  >
                                    <UploadIcon sx={{ fontSize: 18, color: '#FFFFFF' }} />
                                  </Box>
                                </>
                              ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.2 }}>
                                  <UploadIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                                  <Typography sx={{ fontSize: 7, color: '#94A3B8', fontWeight: 700, lineHeight: 1 }}>Foto</Typography>
                                </Box>
                              )}
                            </Box>
                          </Tooltip>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
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

        {/* Right Column: Card Settings & Live Print Preview */}
        <Box>
          {employeesToPrint.length > 0 ? (
            <Card sx={{ borderRadius: 2.5, border: '1px solid #CBD5E1', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              {/* Card Settings Toolbar */}
              <Box sx={{ p: 2, bgcolor: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: 14 }}>
                    Print Preview ({employeesToPrint.length} Cards Selected)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    {a4Pages.length} A4 Sheets (Max 2 cards per A4 sheet)
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
                    Print Now
                  </Button>
                </Stack>
              </Box>

              {/* Plant Address & Print Mode Selector */}
              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <BusinessIcon sx={{ fontSize: 16, color: '#018730' }} /> Select Company Plant Address:
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
                    Print Format:
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant={printLayoutMode === 'mutu_only' ? 'contained' : 'outlined'}
                      onClick={() => setPrintLayoutMode('mutu_only')}
                      sx={{
                        fontSize: 11,
                        textTransform: 'none',
                        py: 0.3,
                        px: 1.2,
                        borderRadius: 1.5,
                        bgcolor: printLayoutMode === 'mutu_only' ? '#0F172A' : 'transparent',
                        borderColor: '#0F172A',
                        color: printLayoutMode === 'mutu_only' ? '#FFFFFF' : '#0F172A',
                      }}
                    >
                      4 Full Panels (User Excel Format)
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
                      Front &amp; Back Only
                    </Button>
                  </Stack>
                </Box>

                {/* Live Signature Size / Scale Control in Print Preview */}
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
                      🔍 Signature Size on ID Card (Scale):
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
                      title="Decrease Signature Size"
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
                      title="Increase Signature Size"
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

                {/* Quick Action Banner: Edit ID Card Format & Text (With Live Preview) */}
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
                        Want to change text, labels, terms or card format?
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#3B82F6', fontSize: 11 }}>
                        <strong>Live Preview</strong> available: card text updates instantly as you type in the editor.
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

              {/* PRINTABLE AREA: 1 A4 SHEET HOLDS 2 CARDS */}
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
                          📄 A4 Sheet #{pageIndex + 1} (Holds {pagePair.length} Cards)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Employee: {pagePair.map((p) => p.namaLengkap).join(' & ')}
                        </Typography>
                      </Box>

                      {/* Render Employee Card 1 (Top) */}
                      {renderSingleIdCard(pagePair[0])}

                      {/* Horizontal Cutting Line Separating A4 Sheets */}
                      {pagePair.length > 1 ? (
                        <>
                          <Box
                            className="itsp-cutting-line"
                            sx={{
                              my: 2.5,
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
                              ✂️ Garis Potong Antar Kartu / Cutting Line (Kertas A4)
                            </Typography>
                          </Box>

                          {/* Render Employee Card 2 (Bottom) */}
                          {renderSingleIdCard(pagePair[1])}
                        </>
                      ) : (
                        <Box
                          className="no-print"
                          sx={{
                            mt: 2.5,
                            p: 3,
                            border: '1.5px dashed #CBD5E1',
                            borderRadius: 2,
                            textAlign: 'center',
                            bgcolor: '#F8FAFC',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>
                            Slot Bawah Lembar A4 Masih Kosong (Muat 2 Karyawan per Lembar)
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', color: '#94A3B8', mt: 0.3 }}>
                            Centang 1 karyawan lagi di tabel sebelah kiri agar lembar A4 ini langsung mencetak 2 kartu sekaligus.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>

              {/* Print Completion Status Toggle */}
              {selectedEmp && (
                <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={selectedEmp.idCardPrinted ? 'Already Printed' : 'Not Yet Printed'}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: selectedEmp.idCardPrinted ? '#DCFCE7' : '#FEF3C7',
                        color: selectedEmp.idCardPrinted ? '#15803D' : '#B45309',
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Status for: <strong>{selectedEmp.namaLengkap}</strong>
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
                    {selectedEmp.idCardPrinted ? 'Cancel Print Status' : 'Mark as Printed'}
                  </Button>
                </Box>
              )}
            </Card>
          ) : (
            <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #CBD5E1', bgcolor: '#FFFFFF' }}>
              <BadgeIcon sx={{ fontSize: 52, color: '#CBD5E1', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#475569' }}>
                No Employee Selected
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 380, mx: 'auto', mt: 0.5 }}>
                Check the checkbox on an employee row in the left table (select 1 or 2 at once) to print on 1 A4 sheet.
              </Typography>
            </Card>
          )}
        </Box>
      </Box>

      {/* MODAL 1: ID CARD FORMAT EDITOR WITH REAL-TIME LIVE PREVIEW */}
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
                ID Card Format &amp; Template Editor - PT ITSP (With Live Preview)
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
            {/* Left Side: Format & Text Input Form */}
            <Box sx={{ p: 3, borderRight: '1px solid #E2E8F0', bgcolor: '#FFFFFF', maxHeight: '70vh', overflowY: 'auto' }}>
              <Tabs
                value={formatTab}
                onChange={(_, val) => setFormatTab(val)}
                sx={{ mb: 2.5, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Identity & Front Card" sx={{ fontWeight: 700, fontSize: 12 }} />
                <Tab label="Terms of Use" sx={{ fontWeight: 700, fontSize: 12 }} />
                <Tab label="Quality Policy" sx={{ fontWeight: 700, fontSize: 12 }} />
              </Tabs>

              {/* TAB 0: IDENTITY & FRONT CARD */}
              {formatTab === 0 && (
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Company Name (Header)"
                    value={tempFormat.companyName}
                    onChange={(e) => setTempFormat({ ...tempFormat, companyName: e.target.value })}
                  />

                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#018730', display: 'block', mt: 1 }}>
                    📍 Factory Address KIIC (Karawang):
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="KIIC Line 1"
                    value={tempFormat.kiicLine1}
                    onChange={(e) => setTempFormat({ ...tempFormat, kiicLine1: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="KIIC Line 2"
                    value={tempFormat.kiicLine2}
                    onChange={(e) => setTempFormat({ ...tempFormat, kiicLine2: e.target.value })}
                  />

                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#0284C7', display: 'block', mt: 1 }}>
                    📍 Factory Address GIIC (Cikarang Bekasi):
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="GIIC Line 1"
                    value={tempFormat.giicLine1}
                    onChange={(e) => setTempFormat({ ...tempFormat, giicLine1: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="GIIC Line 2"
                    value={tempFormat.giicLine2}
                    onChange={(e) => setTempFormat({ ...tempFormat, giicLine2: e.target.value })}
                  />

                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'block', mt: 1 }}>
                    🏷️ Employee Info Column Labels:
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
                    label="Label Name"
                    value={tempFormat.labelName}
                    onChange={(e) => setTempFormat({ ...tempFormat, labelName: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Label Position"
                    value={tempFormat.labelPosition}
                    onChange={(e) => setTempFormat({ ...tempFormat, labelPosition: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Label Department"
                    value={tempFormat.labelDepartment}
                    onChange={(e) => setTempFormat({ ...tempFormat, labelDepartment: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Authorizer's Signature Text"
                    value={tempFormat.labelAuthorizerSignature}
                    onChange={(e) => setTempFormat({ ...tempFormat, labelAuthorizerSignature: e.target.value })}
                  />
                </Stack>
              )}

              {/* TAB 1: TERMS OF USE */}
              {formatTab === 1 && (
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Terms Title"
                    value={tempFormat.termsTitle}
                    onChange={(e) => setTempFormat({ ...tempFormat, termsTitle: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Terms Item 1"
                    value={tempFormat.termsItem1}
                    onChange={(e) => setTempFormat({ ...tempFormat, termsItem1: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Terms Item 2"
                    value={tempFormat.termsItem2}
                    onChange={(e) => setTempFormat({ ...tempFormat, termsItem2: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Terms Item 3"
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
                    label="Company Footer Name (HRM PT. ITSP)"
                    value={tempFormat.hrmCompanyFooter}
                    onChange={(e) => setTempFormat({ ...tempFormat, hrmCompanyFooter: e.target.value })}
                  />
                </Stack>
              )}

              {/* TAB 2: COMPANY QUALITY POLICY (INDONESIAN) */}
              {formatTab === 2 && (
                <Stack spacing={2}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E3A8A' }}>
                    🇬🇧 Quality Policy (English Version - Bottom Left):
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Title (English)"
                    value={tempFormat.qualityTitleEn}
                    onChange={(e) => setTempFormat({ ...tempFormat, qualityTitleEn: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    label="Quality Policy Text English"
                    value={tempFormat.qualityTextEn}
                    onChange={(e) => setTempFormat({ ...tempFormat, qualityTextEn: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Page Label English"
                    value={tempFormat.qualityPageEn}
                    onChange={(e) => setTempFormat({ ...tempFormat, qualityPageEn: e.target.value })}
                  />

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534' }}>
                    🇮🇩 Quality Policy (Indonesian Version - Bottom Right):
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Indonesian Title"
                    value={tempFormat.qualityTitleId}
                    onChange={(e) => setTempFormat({ ...tempFormat, qualityTitleId: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    label="Quality Policy Text Indonesian"
                    value={tempFormat.qualityTextId}
                    onChange={(e) => setTempFormat({ ...tempFormat, qualityTextId: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Page Label Indonesian"
                    value={tempFormat.qualityPageId}
                    onChange={(e) => setTempFormat({ ...tempFormat, qualityPageId: e.target.value })}
                  />
                </Stack>
              )}
            </Box>

            {/* Right Side: LIVE PREVIEW */}
            <Box sx={{ p: 2.5, bgcolor: '#E2E8F0', display: 'flex', flexDirection: 'column', maxHeight: '70vh', overflowY: 'auto' }}>
              <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ViewIcon fontSize="small" sx={{ color: '#018730' }} /> Live Preview
                </Typography>
                <Chip size="small" label="Synced in Realtime" color="success" sx={{ fontWeight: 800, fontSize: 10 }} />
              </Box>

              <Typography variant="caption" sx={{ color: '#64748B', mb: 2, display: 'block' }}>
                Any text change on the left form instantly updates this preview card:
              </Typography>

              {/* Render Preview with tempFormat Config */}
              <Box sx={{ transform: 'scale(0.84)', transformOrigin: 'top center', mb: -6 }}>
                {renderSingleIdCard(selectedEmp || employees[0] || {
                  id: 999,
                  employeeId: '1530.09.26',
                  namaLengkap: 'SAMPLE EMPLOYEE NAME',
                  jabatan: 'IT & Company Systems Staff',
                  departemen: 'Information Technology',
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
            Restore Factory Default
          </Button>

          <Stack direction="row" spacing={1.5}>
            <Button onClick={() => setFormatModalOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveCustomFormat}
              sx={{ bgcolor: '#018730', fontWeight: 800, px: 3, '&:hover': { bgcolor: '#005c21' } }}
            >
              Save Card Format
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* MODAL 2: DEFAULT HR SIGNATURE SETTINGS */}
      <Dialog open={authorizerModalOpen} onClose={() => setAuthorizerModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#0F172A', color: '#FFFFFF', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DrawIcon sx={{ color: '#4ADE80' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 17, color: '#FFFFFF' }}>
                Configure Default HR Signature (Authorizer&apos;s Signature)
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setAuthorizerModalOpen(false)} sx={{ color: '#94A3B8' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3, bgcolor: '#F8FAFC' }}>
          <Typography variant="body2" sx={{ color: '#334155', mb: 2 }}>
            This signature will be automatically applied to all employee ID cards in the <strong>Authorizer&apos;s Signature</strong>, so you don\'t need to sign again each time you print.
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
                Upload Image File (PNG/JPG)
                <input type="file" hidden accept="image/*" onChange={handleUploadSignature} />
              </Button>

              <Button
                variant="outlined"
                startIcon={<ContentPasteIcon />}
                onClick={async () => {
                  try {
                    if (!navigator.clipboard?.read) {
                      alert('Please use the keyboard shortcut: Press Ctrl + V to paste the signature image directly.');
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
                    alert('No image on your clipboard. Please copy (Copy / Screenshot) the signature image first, then press this button or Ctrl + V.');
                  } catch (err) {
                    console.warn(err);
                    alert('Automatic clipboard access is limited by the browser. Please directly press the keyboard shortcut: Ctrl + V to paste the image.');
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
                Paste from Clipboard (Ctrl + V)
              </Button>
            </Stack>

            <Button
              size="small"
              color="inherit"
              onClick={() => setTempSignature(DEFAULT_HR_SIGNATURE)}
              sx={{ textTransform: 'none', fontSize: 11.5, color: '#64748B' }}
            >
              Use Sample Signature
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
                  🔍 Signature Size on ID Card (Scale):
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

              {/* Card Footer Preview Simulation */}
              <Box sx={{ mt: 2, p: 2, bgcolor: '#FFFFFF', borderRadius: 1.5, border: '1px dashed #D97706', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 800, fontSize: 11, mb: 1, display: 'block' }}>
                  Signature Preview on ID Card (Not Cropped):
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
                          alert('Signature image copied to clipboard!');
                          return;
                        }
                      } catch (e) {
                        console.warn(e);
                      }
                      alert('Signature ready to use.');
                    }}
                    sx={{ textTransform: 'none', fontSize: 11, fontWeight: 700, color: '#475569', borderColor: '#CBD5E1' }}
                  >
                    Copy Image
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setTempSignature('')}
                    sx={{ textTransform: 'none', fontSize: 11, fontWeight: 700 }}
                  >
                    Remove Signature
                  </Button>
                </Stack>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#F1F5F9' }}>
          <Button onClick={() => setAuthorizerModalOpen(false)}>Cancel</Button>
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
            Save Default Signature
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
