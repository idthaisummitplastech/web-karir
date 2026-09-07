'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, MenuItem, Chip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, CircularProgress, Alert, Switch, FormControlLabel } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Work as WorkIcon, Link as LinkIcon } from '@mui/icons-material';

interface Job { id: number; title: string; department: string; location: string; type: string; experience: string; requirements: string; description: string; isOpen: boolean; openingDate: string|null; closingDate: string|null; createdAt: string; effectiveOpen?: boolean; statusLabel?: string; _count?: { applicants: number }; }
const DEPTS = ['Information Technology','Engineering','Produksi','Quality Assurance','HSE','Purchasing','Human Capital','Finance','Logistik'];
const LOCS = ['Plant 1 Karawang','Plant 2 Cikarang','Karawang / Cikarang'];
const TYPES = ['Full-Time','Kontrak','Magang','Shift'];
const EXPS = ['Fresh Graduate','Fresh Graduate / Pengalaman 1 Tahun','1-3 Tahun','1-2 Tahun','Minimal 2 Tahun'];
const toInputDate = (iso: string|null) => { if(!iso) return ''; const d=new Date(iso); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const fmtDate = (iso: string|null) => { if(!iso) return '-'; return new Date(iso).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}); };

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [feedback, setFeedback] = useState<{type:'success'|'error';text:string}|null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Job|null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number|null>(null);
  const [fTitle, setFTitle] = useState('');
  const [fDept, setFDept] = useState(DEPTS[0]);
  const [fCustomDept, setFCustomDept] = useState('');
  const [fIsCustom, setFIsCustom] = useState(false);
  const [fLoc, setFLoc] = useState(LOCS[0]);
  const [fType, setFType] = useState(TYPES[0]);
  const [fExp, setFExp] = useState(EXPS[2]);
  const [fReq, setFReq] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fOpen, setFOpen] = useState(true);
  const [fOpening, setFOpening] = useState('');
  const [fClosing, setFClosing] = useState('');
  const fetchJobs = () => { setLoading(true); fetch('/api/admin/jobs').then((r)=>r.json()).then((d)=>{ if(d.jobs) setJobs(d.jobs); }).catch(()=>{}).finally(()=>setLoading(false)); };
  useEffect(()=>{ fetchJobs(); },[]);
  const openCreate = () => { setEditing(null); setFTitle(''); setFDept(DEPTS[0]); setFIsCustom(false); setFCustomDept(''); setFLoc(LOCS[0]); setFType(TYPES[0]); setFExp(EXPS[2]); setFReq(''); setFDesc(''); setFOpen(true); setFOpening(''); setFClosing(''); setDialogOpen(true); };
  const openEdit = (j: Job) => { setEditing(j); setFTitle(j.title); if (DEPTS.includes(j.department)) { setFDept(j.department); setFIsCustom(false); } else { setFIsCustom(true); setFCustomDept(j.department); } setFLoc(j.location); setFType(j.type); setFExp(j.experience); setFReq(j.requirements); setFDesc(j.description); setFOpen(j.isOpen); setFOpening(toInputDate(j.openingDate)); setFClosing(toInputDate(j.closingDate)); setDialogOpen(true); };
  const handleSave = async (e: React.FormEvent) => { e.preventDefault(); const dept = fIsCustom ? fCustomDept.trim() : fDept; if (!fTitle.trim()||!dept||!fReq.trim()||!fDesc.trim()) { alert('Judul, departemen, kualifikasi & deskripsi wajib diisi.'); return; } if (fOpening && fClosing && new Date(fOpening).getTime() > new Date(fClosing).getTime()) { alert('Tanggal buka tidak boleh sesudah tanggal tutup.'); return; } setSaving(true); try { const payload:any={title:fTitle.trim(),department:dept,location:fLoc,type:fType,experience:fExp,requirements:fReq.trim(),description:fDesc.trim(),isOpen:fOpen,openingDate:fOpening||null,closingDate:fClosing||null}; let res; if(editing) res=await fetch('/api/admin/jobs',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,id:editing.id})}); else res=await fetch('/api/admin/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); const data=await res.json(); if(!res.ok) throw new Error(data.error); setFeedback({type:'success',text:data.message}); setDialogOpen(false); fetchJobs(); } catch(err:any){ alert(err.message); } finally{ setSaving(false); } };
  const handleToggle = async (j: Job) => { setTogglingId(j.id); try{ const res=await fetch('/api/admin/jobs',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:j.id,isOpen:!j.isOpen})}); const data=await res.json(); if(!res.ok) throw new Error(data.error); setFeedback({type:'success',text:`Lowongan "${j.title}" ${!j.isOpen?'DIBUKA':'DITUTUP'}.`}); fetchJobs(); }catch(err:any){ alert(err.message);} finally{ setTogglingId(null);} };
  const handleDelete = async (j: Job) => { if(!confirm(`Hapus lowongan "${j.title}"?`)) return; try{ const res=await fetch(`/api/admin/jobs?id=${j.id}`,{method:'DELETE'}); const data=await res.json(); if(!res.ok) throw new Error(data.error); setFeedback({type:'success',text:data.message}); fetchJobs(); }catch(err:any){ alert(err.message);} };
  const filtered = jobs.filter((j)=>{ const s=search.toLowerCase(); const mS=!s||j.title.toLowerCase().includes(s)||j.department.toLowerCase().includes(s); if(!mS) return false; if(filter==='All') return true; if(filter==='Dibuka') return j.effectiveOpen; if(filter==='Ditutup') return !j.effectiveOpen; return (j.statusLabel||'')===filter; });
  const cOpen = jobs.filter((j)=>j.effectiveOpen).length;
  const cClosed = jobs.length - cOpen;
  const cAppl = jobs.reduce((a,j)=>a+(j._count?.applicants||0),0);
  const statusColor = (j: Job) => j.effectiveOpen ? {bg:'#DCFCE7',fg:'#15803D'} : j.statusLabel==='Terjadwal' ? {bg:'#E0F2FE',fg:'#0369A1'} : j.statusLabel==='Kedaluwarsa' ? {bg:'#FEF3C7',fg:'#92400E'} : {bg:'#FEE2E2',fg:'#B91C1C'};

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A' }}>Kelola Lowongan Pekerjaan</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>Buka / tutup manual dengan saklar, atau otomatis lewat tanggal pembukaan & penutupan.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ bgcolor: '#018730', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#005c21' } }}>Buat Lowongan</Button>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Card sx={{ borderRadius: 2.5, border: '1px solid #BBF7D0', bgcolor: '#F0FDF4' }}><CardContent><Typography variant="caption" sx={{ fontWeight: 800, color: '#15803D' }}>DIBUKA</Typography><Typography variant="h4" sx={{ fontWeight: 800 }}>{cOpen}</Typography></CardContent></Card>
        <Card sx={{ borderRadius: 2.5, border: '1px solid #FECACA', bgcolor: '#FEF2F2' }}><CardContent><Typography variant="caption" sx={{ fontWeight: 800, color: '#B91C1C' }}>DITUTUP / JADWAL</Typography><Typography variant="h4" sx={{ fontWeight: 800 }}>{cClosed}</Typography></CardContent></Card>
        <Card sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0' }}><CardContent><Typography variant="caption" sx={{ fontWeight: 800, color: '#475569' }}>TOTAL PELAMAR</Typography><Typography variant="h4" sx={{ fontWeight: 800 }}>{cAppl}</Typography></CardContent></Card>
      </Box>
      {feedback && <Alert severity={feedback.type} onClose={()=>setFeedback(null)} sx={{ mb: 2 }}>{feedback.text}</Alert>}
      <Card sx={{ borderRadius: 2.5, mb: 3 }}><CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField size="small" label="Cari judul / departemen" value={search} onChange={(e)=>setSearch(e.target.value)} sx={{ minWidth: 240 }} />
        <TextField size="small" select label="Status" value={filter} onChange={(e)=>setFilter(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="All">Semua</MenuItem><MenuItem value="Dibuka">Dibuka</MenuItem><MenuItem value="Ditutup">Ditutup</MenuItem>
          <MenuItem value="Terjadwal">Terjadwal</MenuItem><MenuItem value="Kedaluwarsa">Kedaluwarsa</MenuItem><MenuItem value="Ditutup Manual">Ditutup Manual</MenuItem>
        </TextField>
      </CardContent></Card>
      {loading ? <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress sx={{ color: '#018730' }} /></Box> : filtered.length===0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}><WorkIcon sx={{ fontSize: 48, color: '#94A3B8' }} /><Typography variant="h6">Belum ada lowongan.</Typography><Button variant="contained" onClick={openCreate} sx={{ mt: 2, bgcolor: '#018730' }}>Buat Sekarang</Button></Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
          {filtered.map((j)=>{ const c=statusColor(j); return (
            <Card key={j.id} sx={{ borderRadius: 2.5, border: '1.5px solid #E2E8F0' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                  <Chip label={j.statusLabel||'-'} size="small" sx={{ bgcolor: c.bg, color: c.fg, fontWeight: 800 }} />
                  <Chip label={`${j._count?.applicants||0} pelamar`} size="small" variant="outlined" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{j.title}</Typography>
                <Typography variant="body2" sx={{ color: '#018730', fontWeight: 700 }}>{j.department} • {j.location} • {j.type}</Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 1 }}>Buka: {fmtDate(j.openingDate)} | Tutup: {fmtDate(j.closingDate)} {j.closingDate?' (otomatis tutup 23:59)':'(tanpa batas)'}</Typography>
                <Typography variant="body2" sx={{ color: '#475569', mt: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{j.description}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, p: 1.5, bgcolor: j.isOpen?'#F0FDF4':'#FEF2F2', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                  <FormControlLabel control={<Switch checked={j.isOpen} disabled={togglingId===j.id} onChange={()=>handleToggle(j)} color="success" />} label={<Typography variant="body2" sx={{ fontWeight: 800 }}>{j.isOpen?'TERBUKA':'TERTUTUP'}</Typography>} />
                  {togglingId===j.id && <CircularProgress size={18} />}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={()=>openEdit(j)}>Ubah</Button>
                  <Tooltip title="Salin tautan lamar"><IconButton size="small" onClick={()=>{ navigator.clipboard?.writeText(`${window.location.origin}/apply/${j.id}`); setFeedback({type:'success',text:'Tautan lamaran disalin.'}); }}><LinkIcon /></IconButton></Tooltip>
                  <Box sx={{ flex: 1 }} />
                  <Tooltip title="Hapus (bila belum ada pelamar)"><span><IconButton size="small" color="error" onClick={()=>handleDelete(j)} disabled={(j._count?.applicants||0)>0}><DeleteIcon /></IconButton></span></Tooltip>
                </Box>
                {(j._count?.applicants||0)>0 && <Typography variant="caption" sx={{ color: '#B91C1C' }}>* Tidak dapat dihapus karena sudah ada pelamar — gunakan saklar Tutup.</Typography>}
              </CardContent>
            </Card>
          ); })}
        </Box>
      )}


      <Dialog open={dialogOpen} onClose={()=>setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editing?'Ubah Lowongan':'Buat Lowongan Baru'}</DialogTitle>
        <DialogContent>
          <Box component="form" id="job-form" onSubmit={handleSave} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
            <TextField fullWidth required label="Judul Posisi" value={fTitle} onChange={(e)=>setFTitle(e.target.value)} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }} />
            <TextField fullWidth select label="Departemen" value={fIsCustom?'__custom__':fDept} onChange={(e)=>{ if(e.target.value==='__custom__') setFIsCustom(true); else { setFIsCustom(false); setFDept(e.target.value); } }}>
              {DEPTS.map((d)=><MenuItem key={d} value={d}>{d}</MenuItem>)}
              <MenuItem value="__custom__">+ Departemen lain</MenuItem>
            </TextField>
            {fIsCustom ? <TextField fullWidth required label="Departemen Baru" value={fCustomDept} onChange={(e)=>setFCustomDept(e.target.value)} /> : <TextField fullWidth select label="Lokasi" value={fLoc} onChange={(e)=>setFLoc(e.target.value)}>{LOCS.map((d)=><MenuItem key={d} value={d}>{d}</MenuItem>)}</TextField>}
            {fIsCustom && <TextField fullWidth select label="Lokasi" value={fLoc} onChange={(e)=>setFLoc(e.target.value)}>{LOCS.map((d)=><MenuItem key={d} value={d}>{d}</MenuItem>)}</TextField>}
            <TextField fullWidth select label="Tipe" value={fType} onChange={(e)=>setFType(e.target.value)}>{TYPES.map((d)=><MenuItem key={d} value={d}>{d}</MenuItem>)}</TextField>
            <TextField fullWidth select label="Pengalaman" value={fExp} onChange={(e)=>setFExp(e.target.value)}>{EXPS.map((d)=><MenuItem key={d} value={d}>{d}</MenuItem>)}</TextField>
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' }, p: 2, bgcolor: '#F0FDF4', borderRadius: 2, border: '1px solid #BBF7D0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#15803D' }}>MEKANISME 1 — Saklar Manual</Typography>
              <FormControlLabel control={<Switch checked={fOpen} onChange={(e)=>setFOpen(e.target.checked)} color="success" />} label={fOpen?'TERBUKA':'TERTUTUP'} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' }, p: 2, bgcolor: '#EFF6FF', borderRadius: 2, border: '1px solid #BFDBFE' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E40AF', mb: 1 }}>MEKANISME 2 — Otomatis by Tanggal</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField fullWidth type="date" label="Tanggal Dibuka" value={fOpening} onChange={(e)=>setFOpening(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText="Kosong = langsung dibuka" />
                <TextField fullWidth type="date" label="Tanggal Tutup Otomatis" value={fClosing} onChange={(e)=>setFClosing(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText="Tutup 23:59 di tanggal tsb" />
              </Box>
            </Box>
            <TextField fullWidth multiline rows={3} required label="Kualifikasi" value={fReq} onChange={(e)=>setFReq(e.target.value)} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }} />
            <TextField fullWidth multiline rows={3} required label="Deskripsi" value={fDesc} onChange={(e)=>setFDesc(e.target.value)} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={()=>setDialogOpen(false)}>Batal</Button>
          <Button variant="contained" type="submit" form="job-form" disabled={saving} sx={{ bgcolor: '#018730', fontWeight: 700 }}>{saving?'Menyimpan...':(editing?'Simpan':'Publikasikan')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
