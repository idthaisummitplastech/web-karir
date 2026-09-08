'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
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
  Divider,
} from '@mui/material';
import {
  Print as PrintIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  QrCode as QrIcon,
} from '@mui/icons-material';
import { KarirTablePagination, KarirTableToolbar } from '@/components/admin/KarirTablePagination';

export default function AdminIdCardsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchEmployees = () => {
    setLoading(true);
    fetch('/api/admin/id-cards')
      .then((res) => res.json())
      .then((data) => {
        if (data.employees) {
          setEmployees(data.employees);
          if (data.employees.length > 0 && !selectedEmp) {
            setSelectedEmp(data.employees[0]);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleTogglePrinted = async (employeeId: number, currentStatus: boolean) => {
    try {
      await fetch('/api/admin/id-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, idCardPrinted: !currentStatus }),
      });
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#018730' }} />
      </Box>
    );
  }

  const filteredEmployees = employees.filter((emp) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (emp.namaLengkap && emp.namaLengkap.toLowerCase().includes(q)) ||
      (emp.jabatan && emp.jabatan.toLowerCase().includes(q)) ||
      (emp.nikSementara && emp.nikSementara.toLowerCase().includes(q)) ||
      (emp.departemen && emp.departemen.toLowerCase().includes(q))
    );
  });

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Modul Cetak ID Card & Kartu Nama Karyawan
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Daftar calon karyawan yang telah menyelesaikan Tahap 7 (Offering & Kontrak), tersimpan di tabel <code>karyawan_sementara</code>, dan siap dicetak kartu identitasnya oleh tim GA/Perlengkapan.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' }, gap: 3 }}>
        {/* Table of Temporary Employees */}
        <Box>
          <KarirTableToolbar
            searchQuery={searchQuery}
            onSearchChange={(val) => {
              setSearchQuery(val);
              setPage(0);
            }}
            placeholder="Cari nama, NIK, jabatan, atau dept..."
            totalCount={employees.length}
            filteredCount={filteredEmployees.length}
          />
          <TableContainer component={Paper} sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Karyawan</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>NIK Sementara</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Departemen</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status Cetak</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748B' }}>
                      {searchQuery ? 'Tidak ada kandidat yang cocok dengan pencarian.' : 'Belum ada kandidat yang menyelesaikan Tahap 7. Setelah pelamar menerima Offering Letter, datanya otomatis tampil di sini.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEmployees.map((emp) => (
                    <TableRow key={emp.id} hover selected={selectedEmp?.id === emp.id}>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {emp.namaLengkap}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {emp.jabatan}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={emp.nikSementara}
                          size="small"
                          sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 700 }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{emp.departemen}</Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={emp.idCardPrinted ? 'Sudah Dicetak' : 'Belum Dicetak'}
                          size="small"
                          sx={{
                            bgcolor: emp.idCardPrinted ? '#DCFCE7' : '#FEF3C7',
                            color: emp.idCardPrinted ? '#15803D' : '#92400E',
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedEmp(emp);
                            setPreviewOpen(true);
                          }}
                          startIcon={<BadgeIcon />}
                          sx={{ borderColor: '#018730', color: '#018730', fontWeight: 700 }}
                        >
                          Preview Kartu
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <KarirTablePagination
              count={filteredEmployees.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={(newRpp) => {
                setRowsPerPage(newRpp);
                setPage(0);
              }}
            />
          </TableContainer>
        </Box>

        {/* Live ID Card Preview Widget */}
        <Box>
          {selectedEmp ? (
            <Card sx={{ borderRadius: 3, border: '1px solid #CBD5E1', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <Box sx={{ p: 2.5, bgcolor: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Standar ID Card PT ITSP (CR80)
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handlePrint}
                  startIcon={<PrintIcon />}
                  sx={{ bgcolor: '#018730', fontWeight: 700, '&:hover': { bgcolor: '#005c21' } }}
                >
                  Cetak (Print)
                </Button>
              </Box>

              <CardContent sx={{ p: 3 }}>
                {/* ID Card Front View Container */}
                <Box
                  id="id-card-print-area"
                  sx={{
                    width: 320,
                    height: 480,
                    mx: 'auto',
                    borderRadius: 3,
                    background: 'linear-gradient(180deg, #018730 0%, #004d1b 45%, #FFFFFF 45%, #FFFFFF 100%)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                    border: '1.5px solid #CBD5E1',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    textAlign: 'center',
                  }}
                >
                  {/* Top Company Banner */}
                  <Box sx={{ pt: 2.5, pb: 1, px: 2, color: '#FFFFFF' }}>
                    <Typography variant="overline" sx={{ fontSize: 9, letterSpacing: '0.12em', color: '#FED7AA', fontWeight: 800, display: 'block' }}>
                      THAI SUMMIT GROUP
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, fontSize: 13, lineHeight: 1.2 }}>
                      PT INDONESIA THAI SUMMIT PLASTECH
                    </Typography>
                  </Box>

                  {/* Employee Avatar / Photo */}
                  <Box sx={{ my: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 120,
                        borderRadius: 2,
                        bgcolor: '#CBD5E1',
                        border: '3px solid #FFFFFF',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748B',
                        fontWeight: 800,
                        fontSize: 24,
                        mb: 1.5,
                        background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                      }}
                    >
                      {selectedEmp.namaLengkap.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 16, lineHeight: 1.2 }}>
                      {selectedEmp.namaLengkap}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#018730', fontWeight: 700, fontSize: 12, display: 'block', mt: 0.3 }}>
                      {selectedEmp.jabatan}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: 11 }}>
                      Dept: {selectedEmp.departemen}
                    </Typography>

                    <Box sx={{ mt: 1.5, px: 2, py: 0.5, bgcolor: '#F1F5F9', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '0.1em' }}>
                        {selectedEmp.nikSementara}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Bottom Barcode / Plant identity */}
                  <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="caption" sx={{ fontSize: 9, color: '#64748B', display: 'block' }}>
                        PLANT 1 KARAWANG / PLANT 2 CIKARANG
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: 8, color: '#94A3B8' }}>
                        Tgl Gabung: {new Date(selectedEmp.tanggalBergabung).toLocaleDateString('id-ID')}
                      </Typography>
                    </Box>
                    <QrIcon sx={{ fontSize: 32, color: '#0F172A' }} />
                  </Box>
                </Box>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant={selectedEmp.idCardPrinted ? 'outlined' : 'contained'}
                    color={selectedEmp.idCardPrinted ? 'inherit' : 'success'}
                    onClick={() => handleTogglePrinted(selectedEmp.id, selectedEmp.idCardPrinted)}
                    startIcon={<CheckCircleIcon />}
                    sx={{ fontWeight: 700 }}
                  >
                    {selectedEmp.idCardPrinted ? 'Tandai Belum Dicetak' : 'Tandai Selesai Dicetak'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed #CBD5E1' }}>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Pilih salah satu karyawan sementara di tabel untuk melihat preview kartu nama.
              </Typography>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
}
