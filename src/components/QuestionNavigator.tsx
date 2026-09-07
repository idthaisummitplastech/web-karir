'use client';
import React from 'react';
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Divider } from '@mui/material';
import { GridView as GridIcon } from '@mui/icons-material';

export function isQuestionAnswered(q: any, answers: Record<number, any>): boolean {
  const v = answers?.[q.id];
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.trim().length > 0;
  return v !== undefined && v !== null && String(v).trim().length > 0;
}

export function countAnswered(questions: any[], answers: Record<number, any>): number {
  return questions.filter((q) => isQuestionAnswered(q, answers)).length;
}

interface Props {
  open: boolean;
  onClose: () => void;
  questions: any[];
  answers: Record<number, any>;
  currentIndex: number;
  onJump: (idx: number) => void;
  accent?: string;
  title?: string;
}

export default function QuestionNavigator({ open, onClose, questions, answers, currentIndex, onJump, accent = '#018730', title = 'Daftar Soal Ujian' }: Props) {
  const pgList = questions.map((q, i) => ({ q, i })).filter(({ q }) => (q.questionType || 'single_choice') !== 'essay');
  const essayList = questions.map((q, i) => ({ q, i })).filter(({ q }) => (q.questionType || 'single_choice') === 'essay');
  const renderGrid = (list: { q: any; i: number }[], label: string, badge: string, badgeBg: string, badgeFg: string) => {
    if (list.length === 0) return null;
    return (
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Chip label={`${label} (${list.length})`} size="small" sx={{ bgcolor: badgeBg, color: badgeFg, fontWeight: 800 }} />
          <Typography variant="caption" sx={{ color: '#64748B' }}>{badge}</Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))', gap: 1 }}>
          {list.map(({ q, i }) => {
            const done = isQuestionAnswered(q, answers);
            const active = i === currentIndex;
            return (
              <Button
                key={q.id}
                variant={active ? 'contained' : done ? 'contained' : 'outlined'}
                onClick={() => { onJump(i); onClose(); }}
                sx={{
                  minWidth: 44, height: 44, borderRadius: 1.5, fontWeight: 800,
                  bgcolor: active ? accent : done ? '#16A34A' : '#FFFFFF',
                  color: active || done ? '#FFFFFF' : '#334155',
                  borderColor: done && !active ? '#16A34A' : '#CBD5E1',
                  '&:hover': { bgcolor: active ? accent : done ? '#15803D' : '#F1F5F9' },
                }}
              >
                {i + 1}
              </Button>
            );
          })}
        </Box>
      </Box>
    );
  };
  const answered = countAnswered(questions, answers);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
        <GridIcon sx={{ color: accent }} /> {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
          Terjawab <strong style={{ color: accent }}>{answered}/{questions.length}</strong> soal. Klik nomor untuk lompat ke soal. Hijau = sudah dijawab, putih = belum.
        </Typography>
        {renderGrid(pgList, 'Pilihan Ganda', 'Urutan diacak unik per peserta', '#DCFCE7', '#15803D')}
        {essayList.length > 0 && <Divider sx={{ my: 2 }} />}
        {renderGrid(essayList, 'Essay / Uraian', 'Selalu di bagian paling akhir', '#DBEAFE', '#1E40AF')}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: accent, fontWeight: 700 }}>Kembali ke Soal</Button>
      </DialogActions>
    </Dialog>
  );
}
