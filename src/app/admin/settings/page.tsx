'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  LocalHospital as McuIcon,
  LocationCity as PlantIcon,
} from '@mui/icons-material';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mcuPartnerName, setMcuPartnerName] = useState('');
  const [mcuPartnerAddress, setMcuPartnerAddress] = useState('');
  const [mcuEstimatedCost, setMcuEstimatedCost] = useState('');
  const [mcuInstructions, setMcuInstructions] = useState('');
  const [plantAddressKarawang, setPlantAddressKarawang] = useState('');
  const [plantAddressCikarang, setPlantAddressCikarang] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setMcuPartnerName(data.settings.mcu_partner_name || '');
          setMcuPartnerAddress(data.settings.mcu_partner_address || '');
          setMcuEstimatedCost(data.settings.mcu_estimated_cost || '');
          setMcuInstructions(data.settings.mcu_instructions || '');
          setPlantAddressKarawang(data.settings.plant_address_karawang || '');
          setPlantAddressCikarang(data.settings.plant_address_cikarang || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mcu_partner_name: mcuPartnerName,
          mcu_partner_address: mcuPartnerAddress,
          mcu_estimated_cost: mcuEstimatedCost,
          mcu_instructions: mcuInstructions,
          plant_address_karawang: plantAddressKarawang,
          plant_address_cikarang: plantAddressCikarang,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg('Pengaturan default MCU rekanan dan lokasi pabrik berhasil disimpan secara permanen!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#018730' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Pengaturan Master Default (MCU & Alamat Pabrik)
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          Data ini tersimpan permanen sebagai nilai default sistem, sehingga tim HR dan User tidak perlu mengetik ulang klinik rekanan, tarif estimasi, atau alamat pabrik di setiap tahapan.
        </Typography>
      </Box>

      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}

      <form onSubmit={handleSave}>
        {/* SECTION 1: MASTER DEFAULT MCU REKANAN */}
        <Card sx={{ borderRadius: 2.5, border: '1px solid #CBD5E1', mb: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <Box sx={{ p: 2.5, bgcolor: '#F0FDF4', borderBottom: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: 1 }}>
            <McuIcon sx={{ color: '#16A34A' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#166534', fontSize: 17 }}>
              Master Fasilitas Kesehatan Rekanan MCU
            </Typography>
          </Box>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <TextField
                fullWidth
                required
                label="Nama Klinik / RS Rekanan Default"
                value={mcuPartnerName}
                onChange={(e) => setMcuPartnerName(e.target.value)}
                helperText="Contoh: Klinik Kimia Farma Karawang / RS Permata Cikarang"
              />
              <TextField
                fullWidth
                required
                label="Estimasi Kisaran Biaya Pemeriksaan"
                value={mcuEstimatedCost}
                onChange={(e) => setMcuEstimatedCost(e.target.value)}
                helperText="Contoh: Rp 250.000 – Rp 350.000 (Paket Fit to Work ITSP)"
              />
              <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                <TextField
                  fullWidth
                  required
                  label="Alamat Lengkap & Nomor Kontak Rujukan"
                  value={mcuPartnerAddress}
                  onChange={(e) => setMcuPartnerAddress(e.target.value)}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2.5}
                  label="Petunjuk Medis & Puasa (Tampil di Dashboard & Email)"
                  value={mcuInstructions}
                  onChange={(e) => setMcuInstructions(e.target.value)}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* SECTION 2: MASTER DEFAULT ALAMAT PABRIK */}
        <Card sx={{ borderRadius: 2.5, border: '1px solid #CBD5E1', mb: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlantIcon sx={{ color: '#018730' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 17 }}>
              Master Alamat Pabrik PT ITSP (Interview Onsite & Kontrak)
            </Typography>
          </Box>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2.5 }}>
              <TextField
                fullWidth
                required
                label="Alamat Default Plant 1 (Karawang)"
                value={plantAddressKarawang}
                onChange={(e) => setPlantAddressKarawang(e.target.value)}
              />
              <TextField
                fullWidth
                required
                label="Alamat Default Plant 2 (Cikarang)"
                value={plantAddressCikarang}
                onChange={(e) => setPlantAddressCikarang(e.target.value)}
              />
            </Box>
          </CardContent>
        </Card>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={saving}
          startIcon={<SaveIcon />}
          sx={{
            bgcolor: '#018730',
            fontWeight: 800,
            px: 4,
            py: 1.4,
            borderRadius: 2,
            fontSize: 16,
            '&:hover': { bgcolor: '#005c21' },
          }}
        >
          {saving ? 'Menyimpan Perubahan...' : 'Simpan Pengaturan Default'}
        </Button>
      </form>
    </Box>
  );
}
