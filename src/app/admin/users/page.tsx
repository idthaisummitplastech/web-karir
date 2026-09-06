'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LockReset as ResetPasswordIcon,
  Security as SecurityIcon,
  PersonAdd as AddUserIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reset Password Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Add User Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('hr');
  const [newDepartment, setNewDepartment] = useState('Human Capital');
  const [newUserPassword, setNewUserPassword] = useState('admin123');

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setUsers(data.users);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCurrentUserRole(data.role);
          if (data.role === 'admin') {
            fetchUsers();
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const handleConfirmResetPassword = async () => {
    if (!selectedUser) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'admin',
          targetId: selectedUser.id,
          newPassword: newPasswordInput || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResetFeedback(data.message);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleResetMfa = async (userId: number, userName: string) => {
    if (!confirm(`Reset pengaturan MFA Google Authenticator untuk akun ${userName}? Akun ini akan diwajibkan melakukan setup MFA ulang pada login berikutnya.`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_mfa', userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          name: newName,
          email: newEmail,
          role: newRole,
          department: newDepartment,
          password: newUserPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      setAddModalOpen(false);
      setNewUsername('');
      setNewName('');
      setNewEmail('');
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#018730' }} />
      </Box>
    );
  }

  // KHUSUS SUPER ADMIN ONLY
  if (currentUserRole !== 'admin') {
    return (
      <Box sx={{ maxWidth: 680, mx: 'auto', mt: 6 }}>
        <Card sx={{ borderRadius: 3, border: '2px solid #FCA5A5', p: 4, textAlign: 'center', boxShadow: '0 8px 30px rgba(239,68,68,0.1)' }}>
          <Box sx={{ width: 68, height: 68, borderRadius: '50%', bgcolor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <SecurityIcon sx={{ fontSize: 38 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#991B1B', mb: 1 }}>
            Akses Ditolak — Khusus Super Administrator
          </Typography>
          <Typography variant="body1" sx={{ color: '#475569', mb: 3, lineHeight: 1.6 }}>
            Menu <strong>Kelola Akun, Reset Password Staf, dan Reset MFA</strong> dibatasi secara ketat hanya untuk <strong>Super Administrator</strong> PT ITSP. Akun Anda (Role: <code>{currentUserRole || 'Non-Admin'}</code>) tidak memiliki wewenang administratif ini demi menjaga keamanan data perusahaan.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/admin/applicants')}
            sx={{ bgcolor: '#018730', color: '#FFFFFF', fontWeight: 700, px: 3.5, py: 1.2, borderRadius: 2, '&:hover': { bgcolor: '#005c21' } }}
          >
            Kembali ke Data Pelamar
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Kelola Akun HR & User Departemen
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Manajemen kredensial tim internal rekrutmen, reset password akun, dan reset MFA jika perangkat Authenticator hilang.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddUserIcon />}
          onClick={() => setAddModalOpen(true)}
          sx={{ bgcolor: '#018730', fontWeight: 700, '&:hover': { bgcolor: '#005c21' } }}
        >
          Tambah Akun Baru
        </Button>
      </Box>

      {resetFeedback && (
        <Alert severity="success" onClose={() => setResetFeedback(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {resetFeedback}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Nama Pengguna</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Role & Departemen</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status Keamanan MFA</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Aksi Manajemen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {u.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                    Username: <code>{u.username}</code> • {u.email}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={u.role === 'hr' ? 'HR Recruitment' : u.role === 'user_dept' ? 'User Departemen' : 'Super Admin'}
                    size="small"
                    sx={{
                      bgcolor: u.role === 'hr' ? '#DCFCE7' : u.role === 'user_dept' ? '#FEF3C7' : '#E0F2FE',
                      color: u.role === 'hr' ? '#166534' : u.role === 'user_dept' ? '#92400E' : '#0369A1',
                      fontWeight: 700,
                      mb: 0.5,
                      display: 'inline-block',
                    }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', color: '#64748B' }}>
                    {u.department}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    icon={u.isMfaEnabled ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <SecurityIcon sx={{ fontSize: 16 }} />}
                    label={u.isMfaEnabled ? 'MFA Aktif (Google Authenticator)' : 'MFA Belum Aktif'}
                    size="small"
                    sx={{
                      bgcolor: u.isMfaEnabled ? '#DCFCE7' : '#FEE2E2',
                      color: u.isMfaEnabled ? '#15803D' : '#991B1B',
                      fontWeight: 700,
                    }}
                  />
                </TableCell>

                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="Reset Password Akun Ini">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ResetPasswordIcon />}
                        onClick={() => {
                          setSelectedUser(u);
                          setNewPasswordInput('');
                          setResetFeedback(null);
                          setResetModalOpen(true);
                        }}
                        sx={{ borderColor: '#CBD5E1', color: '#334155', fontWeight: 700 }}
                      >
                        Reset Password
                      </Button>
                    </Tooltip>

                    {u.isMfaEnabled && (
                      <Tooltip title="Reset MFA jika ponsel hilang / ganti perangkat">
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handleResetMfa(u.id, u.name)}
                          sx={{ fontWeight: 700 }}
                        >
                          Reset MFA
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* RESET PASSWORD MODAL */}
      <Dialog open={resetModalOpen} onClose={() => setResetModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Reset Password Akun</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Pengguna: <strong>{selectedUser?.name}</strong> (<code>{selectedUser?.username}</code>)
          </Typography>

          <TextField
            fullWidth
            label="Password Baru (Kosongkan untuk acak otomatis)"
            placeholder="Misal: itsp2026! atau kosongkan"
            value={newPasswordInput}
            onChange={(e) => setNewPasswordInput(e.target.value)}
            helperText="Jika dikosongkan, sistem akan mengenerate password acak aman."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setResetModalOpen(false)}>Batal</Button>
          <Button
            variant="contained"
            disabled={processing}
            onClick={handleConfirmResetPassword}
            sx={{ bgcolor: '#018730', fontWeight: 700 }}
          >
            {processing ? 'Mereset...' : 'Simpan Password Baru'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD USER MODAL */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateUser}>
          <DialogTitle sx={{ fontWeight: 800 }}>Tambah Akun HR / User Baru</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                required
                label="Username Login"
                placeholder="misal: hr.staff"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <TextField
                fullWidth
                required
                label="Nama Lengkap & Gelar"
                placeholder="misal: Siti Nurhaliza, S.Psi"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <TextField
                fullWidth
                required
                type="email"
                label="Email Resmi"
                placeholder="nama@itsp.co.id"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <TextField
                select
                fullWidth
                required
                label="Role Akun"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <MenuItem value="hr">HR Recruitment</MenuItem>
                <MenuItem value="user_dept">User Departemen</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
              </TextField>
              <TextField
                fullWidth
                required
                label="Departemen"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
              />
              <TextField
                fullWidth
                required
                label="Password Awal"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setAddModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="contained" disabled={processing} sx={{ bgcolor: '#018730', fontWeight: 700 }}>
              {processing ? 'Menyimpan...' : 'Buat Akun'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
