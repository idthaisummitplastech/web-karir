'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Button, TextField, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, Tooltip,
  CircularProgress, Alert, Switch, FormControlLabel, Collapse, List,
  ListItem, ListItemText, ListItemSecondaryAction, Divider, Badge,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Business as DeptIcon, AccountTree as SectionIcon,
  ExpandMore as ExpandIcon, ExpandLess as CollapseIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';

interface Section {
  id: number; name: string; description: string | null;
  is_active: boolean; sort_order: number; department_id: number;
}
interface Department {
  id: number; name: string; code: string | null; description: string | null;
  is_active: boolean; sort_order: number; sections: Section[];
}

type DialogMode = 'dept-create' | 'dept-edit' | 'section-create' | 'section-edit' | null;

export default function AdminDepartmentsPage() {
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  // Dialog state
  const [mode, setMode] = useState<DialogMode>(null);
  const [saving, setSaving] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  // Form fields – Dept
  const [fName, setFName] = useState('');
  const [fCode, setFCode] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fActive, setFActive] = useState(true);
  const [fOrder, setFOrder] = useState(0);

  // Form fields – Section
  const [fsName, setFsName] = useState('');
  const [fsDesc, setFsDesc] = useState('');
  const [fsActive, setFsActive] = useState(true);

  const fetch_depts = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/departments')
      .then((r) => r.json())
      .then((d) => { if (d.departmentsFull) setDepts(d.departmentsFull); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch_depts(); }, [fetch_depts]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  // ── Dept handlers ────────────────────────────────────────────────────────
  const openCreateDept = () => {
    setMode('dept-create'); setSelectedDept(null);
    setFName(''); setFCode(''); setFDesc(''); setFActive(true); setFOrder(depts.length);
  };
  const openEditDept = (d: Department) => {
    setMode('dept-edit'); setSelectedDept(d);
    setFName(d.name); setFCode(d.code || ''); setFDesc(d.description || '');
    setFActive(d.is_active); setFOrder(d.sort_order);
  };
  const saveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName.trim()) { alert('Nama departemen wajib diisi.'); return; }
    setSaving(true);
    try {
      const payload = { name: fName.trim(), code: fCode.trim() || null, description: fDesc.trim() || null, is_active: fActive, sort_order: fOrder };
      let res: Response;
      if (mode === 'dept-edit' && selectedDept) {
        res = await fetch('/api/admin/departments', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedDept.id, ...payload }) });
      } else {
        res = await fetch('/api/admin/departments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showFeedback('success', data.message || 'Berhasil disimpan.');
      setMode(null); fetch_depts();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };
  const deleteDept = async (d: Department) => {
    if (!confirm(`Hapus departemen "${d.name}"? Semua section di dalamnya juga akan dihapus.`)) return;
    try {
      const res = await fetch(`/api/admin/departments?id=${d.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showFeedback('success', data.message || 'Departemen dihapus.');
      fetch_depts();
    } catch (err: any) { alert(err.message); }
  };

  // ── Section handlers ──────────────────────────────────────────────────────
  const openCreateSection = (dept: Department) => {
    setMode('section-create'); setSelectedDept(dept); setSelectedSection(null);
    setFsName(''); setFsDesc(''); setFsActive(true);
  };
  const openEditSection = (dept: Department, sec: Section) => {
    setMode('section-edit'); setSelectedDept(dept); setSelectedSection(sec);
    setFsName(sec.name); setFsDesc(sec.description || ''); setFsActive(sec.is_active);
  };
  const saveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fsName.trim()) { alert('Nama section wajib diisi.'); return; }
    if (!selectedDept) return;
    setSaving(true);
    try {
      const payload = { name: fsName.trim(), description: fsDesc.trim() || null, is_active: fsActive, department_id: selectedDept.id };
      let res: Response;
      if (mode === 'section-edit' && selectedSection) {
        res = await fetch('/api/admin/sections', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selectedSection.id, ...payload }) });
      } else {
        res = await fetch('/api/admin/sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showFeedback('success', data.message || 'Section disimpan.');
      setMode(null); fetch_depts();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };
  const deleteSection = async (dept: Department, sec: Section) => {
    if (!confirm(`Hapus section "${sec.name}" dari ${dept.name}?`)) return;
    try {
      const res = await fetch(`/api/admin/sections?id=${sec.id}&department_id=${dept.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showFeedback('success', data.message || 'Section dihapus.');
      fetch_depts();
    } catch (err: any) { alert(err.message); }
  };

  const toggleExpand = (id: number) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  const isDeptDialog = mode === 'dept-create' || mode === 'dept-edit';
  const isSecDialog = mode === 'section-create' || mode === 'section-edit';

  return (
    <Box sx={{ maxWidth: 900 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>Kelola Departemen & Section</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Tambah / ubah departemen dan sub-bagian (section) yang digunakan pada lowongan pekerjaan.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDept}
          sx={{ bgcolor: '#018730', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#005c21' } }}>
          Tambah Departemen
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Card sx={{ borderRadius: 2.5, border: '1px solid #BBF7D0', bgcolor: '#F0FDF4' }}>
          <CardContent sx={{ py: '12px !important' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#15803D' }}>TOTAL DEPARTEMEN</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{depts.length}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 2.5, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF' }}>
          <CardContent sx={{ py: '12px !important' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#1D4ED8' }}>TOTAL SECTION</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{depts.reduce((a, d) => a + d.sections.length, 0)}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
          <CardContent sx={{ py: '12px !important' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569' }}>AKTIF</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{depts.filter((d) => d.is_active).length}</Typography>
          </CardContent>
        </Card>
      </Box>

      {feedback && <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 2 }}>{feedback.text}</Alert>}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress sx={{ color: '#018730' }} /></Box>
      ) : depts.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <DeptIcon sx={{ fontSize: 48, color: '#94A3B8' }} />
          <Typography variant="h6" sx={{ mt: 1 }}>Belum ada departemen</Typography>
          <Button variant="contained" onClick={openCreateDept} sx={{ mt: 2, bgcolor: '#018730' }}>Tambah Pertama</Button>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {depts.map((dept) => (
            <Card key={dept.id} sx={{ borderRadius: 2.5, border: '1.5px solid #E2E8F0', overflow: 'visible' }}>
              <CardContent sx={{ p: '16px !important' }}>
                {/* Dept row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <DeptIcon sx={{ color: '#018730', flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>{dept.name}</Typography>
                      {dept.code && <Chip label={dept.code} size="small" sx={{ bgcolor: '#F1F5F9', fontWeight: 700, fontSize: 11 }} />}
                      <Chip
                        label={dept.is_active ? 'Aktif' : 'Nonaktif'}
                        size="small"
                        sx={{ bgcolor: dept.is_active ? '#DCFCE7' : '#FEE2E2', color: dept.is_active ? '#15803D' : '#B91C1C', fontWeight: 800 }}
                      />
                      <Badge badgeContent={dept.sections.length} color="primary" sx={{ ml: 0.5 }}>
                        <SectionIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                      </Badge>
                    </Box>
                    {dept.description && <Typography variant="caption" sx={{ color: '#64748B' }}>{dept.description}</Typography>}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Tambah Section"><IconButton size="small" onClick={() => { openCreateSection(dept); setExpanded((p) => ({ ...p, [dept.id]: true })); }} sx={{ color: '#1D4ED8' }}><AddIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Edit Departemen"><IconButton size="small" onClick={() => openEditDept(dept)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Hapus Departemen"><IconButton size="small" color="error" onClick={() => deleteDept(dept)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    {dept.sections.length > 0 && (
                      <IconButton size="small" onClick={() => toggleExpand(dept.id)}>
                        {expanded[dept.id] ? <CollapseIcon /> : <ExpandIcon />}
                      </IconButton>
                    )}
                  </Box>
                </Box>

                {/* Sections */}
                {dept.sections.length > 0 && (
                  <Collapse in={!!expanded[dept.id]}>
                    <Divider sx={{ mt: 1.5, mb: 1 }} />
                    <Typography variant="overline" sx={{ color: '#64748B', fontSize: 11, fontWeight: 800 }}>SECTIONS</Typography>
                    <List dense disablePadding>
                      {dept.sections.map((sec) => (
                        <ListItem key={sec.id} disablePadding sx={{ py: 0.5, px: 1, borderRadius: 1, '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <SectionIcon sx={{ fontSize: 16, color: '#94A3B8', mr: 1 }} />
                          <ListItemText
                            primary={sec.name}
                            secondary={sec.description || undefined}
                            primaryTypographyProps={{ fontSize: 13.5, fontWeight: 600 }}
                          />
                          <Chip
                            label={sec.is_active ? 'Aktif' : 'Nonaktif'}
                            size="small"
                            sx={{ mr: 1, bgcolor: sec.is_active ? '#DCFCE7' : '#FEE2E2', color: sec.is_active ? '#15803D' : '#B91C1C', fontWeight: 800, fontSize: 10 }}
                          />
                          <ListItemSecondaryAction>
                            <Tooltip title="Edit Section"><IconButton size="small" onClick={() => openEditSection(dept, sec)}><EditIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                            <Tooltip title="Hapus Section"><IconButton size="small" color="error" onClick={() => deleteSection(dept, sec)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* ── Dialog: Department ─────────────────────────────────────────────── */}
      <Dialog open={isDeptDialog} onClose={() => setMode(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {mode === 'dept-edit' ? 'Edit Departemen' : 'Tambah Departemen Baru'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" id="dept-form" onSubmit={saveDept} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField fullWidth required label="Nama Departemen" value={fName} onChange={(e) => setFName(e.target.value)}
              placeholder="contoh: SYD & IT" />
            <TextField fullWidth label="Kode (Opsional)" value={fCode} onChange={(e) => setFCode(e.target.value)}
              placeholder="contoh: SYD_IT" helperText="Kode singkat untuk identifikasi" />
            <TextField fullWidth multiline rows={2} label="Deskripsi (Opsional)" value={fDesc} onChange={(e) => setFDesc(e.target.value)} />
            <TextField fullWidth type="number" label="Urutan Tampil" value={fOrder} onChange={(e) => setFOrder(Number(e.target.value))}
              helperText="Angka kecil tampil lebih atas" />
            <FormControlLabel control={<Switch checked={fActive} onChange={(e) => setFActive(e.target.checked)} color="success" />}
              label={fActive ? 'Aktif (tampil di dropdown lowongan)' : 'Nonaktif (tersembunyi)'} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setMode(null)}>Batal</Button>
          <Button variant="contained" type="submit" form="dept-form" disabled={saving}
            sx={{ bgcolor: '#018730', fontWeight: 700 }}>
            {saving ? 'Menyimpan...' : (mode === 'dept-edit' ? 'Simpan Perubahan' : 'Tambah Departemen')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog: Section ────────────────────────────────────────────────── */}
      <Dialog open={isSecDialog} onClose={() => setMode(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {mode === 'section-edit' ? 'Edit Section' : `Tambah Section — ${selectedDept?.name}`}
        </DialogTitle>
        <DialogContent>
          <Box component="form" id="sec-form" onSubmit={saveSection} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField fullWidth required label="Nama Section" value={fsName} onChange={(e) => setFsName(e.target.value)}
              placeholder="contoh: System Development" />
            <TextField fullWidth multiline rows={2} label="Deskripsi (Opsional)" value={fsDesc} onChange={(e) => setFsDesc(e.target.value)} />
            <FormControlLabel control={<Switch checked={fsActive} onChange={(e) => setFsActive(e.target.checked)} color="success" />}
              label={fsActive ? 'Aktif' : 'Nonaktif'} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setMode(null)}>Batal</Button>
          <Button variant="contained" type="submit" form="sec-form" disabled={saving}
            sx={{ bgcolor: '#1D4ED8', fontWeight: 700 }}>
            {saving ? 'Menyimpan...' : (mode === 'section-edit' ? 'Simpan Perubahan' : 'Tambah Section')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
