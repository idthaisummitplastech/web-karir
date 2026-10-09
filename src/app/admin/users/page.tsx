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
  Autocomplete,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  LockReset as ResetPasswordIcon,
  Security as SecurityIcon,
  PersonAdd as AddUserIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { KarirTablePagination, KarirTableToolbar } from '@/components/admin/KarirTablePagination';
import { useLanguage } from '@/lib/LanguageContext';

export default function AdminUsersPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset Password Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Add User Modal — Employee ID immutable (ITSP.004.02.16), email retained for audit, fallback 6 months
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('hr');
  const [newDepartment, setNewDepartment] = useState('Human Capital');
  const [newUserPassword, setNewUserPassword] = useState(`Itsp@${new Date().getFullYear()}`);
  const [newPortalAccess, setNewPortalAccess] = useState('both');
  const [newIsActive, setNewIsActive] = useState(true);

  // Edit User Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState<any | null>(null);
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('hr');
  const [editDepartment, setEditDepartment] = useState('Human Capital');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editPortalAccess, setEditPortalAccess] = useState('both');
  const [editIsActive, setEditIsActive] = useState(true);

  // Daftar Departemen Resmi dari Data Karyawan
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([
    'Accounting & Finance',
    'Assembly',
    'HQ Office',
    'HR & GA',
    'Injection',
    'Interseat',
    'Local Manager',
    'Maintenance',
    'Marketing',
    'Painting',
    'Planning',
    'Production',
    'Production Engineering',
    'Purchasing',
    'Quality Assurance',
    'Rack',
    'SYD & IT',
    'Store',
    'Thai Manager',
    'Warehouse & Delivery',
  ]);

  const normalize = (u: any) => ({
    ...u,
    employeeId: u.employeeId ?? u.employee_id ?? u.employeeID ?? '',
    employee_id: u.employee_id ?? u.employeeId ?? u.employeeID ?? '',
    isActive: u.isActive ?? u.is_active ?? true,
    portalAccess: u.portalAccess ?? u.portal_access ?? 'both',
  });
  const fetchUsers = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Failed to load users (HTTP ${res.status})`);
      const list = (Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : []).map(normalize);
      setUsers(list);
      if (data.departments && Array.isArray(data.departments) && data.departments.length > 0) {
        setAvailableDepartments(data.departments);
      }
    } catch (e: any) {
      setLoadError(e?.message || 'Failed to load user list. Periksa koneksi backend atau sesi login.');
      // Keep existing users (if any) rather than blanking to avoid layout crash
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch('/api/admin/session', { cache: 'no-store', signal: ctrl.signal });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data?.success) {
          setCurrentUserRole(data.role || null);
          if (data.role === 'admin' || data.role === 'superadmin' || data.isSuperAdmin) {
            await fetchUsers();
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
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
    if (!confirm(`${t('admin_users_confirmResetMfa')} ${userName}? ${t('admin_users_confirmResetMfaSuffix')}`)) return;

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
          employee_id: newEmployeeId.trim(),
          employeeId: newEmployeeId.trim(),
          username: newUsername,
          name: newName,
          email: newEmail,
          role: newRole,
          department: newDepartment,
          password: newUserPassword,
          portal_access: newPortalAccess,
          is_active: newIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      setAddModalOpen(false);
      setNewEmployeeId('');
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

  const handleOpenEdit = (user: any) => {
    setSelectedEditUser(user);
    setEditEmployeeId(user.employeeId ?? user.employee_id ?? '');
    setEditUsername(user.username);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditDepartment(user.department || '');
    setEditNewPassword('');
    setEditPortalAccess(user.portalAccess || user.portal_access || 'both');
    setEditIsActive(user.isActive ?? user.is_active ?? true);
    setEditModalOpen(true);
  };
  const handleToggleActiveRow = async (user: any) => {
    try {
      const next = !(user.isActive ?? user.is_active ?? true);
      const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id, is_active: next }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || t('admin_users_alertToggleFailed'));
      setUsers(prev => prev.map(x => x.id === user.id ? { ...x, isActive: next, is_active: next } : x));
    } catch (e: any) { alert(e.message); }
  };
  const handlePortalChangeRow = async (user: any, val: string) => {
    try {
      const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id, portal_access: val }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || t('admin_users_alertPortalFailed'));
      setUsers(prev => prev.map(x => x.id === user.id ? { ...x, portalAccess: val, portal_access: val } : x));
    } catch (e: any) { alert(e.message); }
  };

  const handleConfirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditUser) return;
    setProcessing(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEditUser.id,
          employee_id: editEmployeeId.trim(),
          employeeId: editEmployeeId.trim(),
          username: editUsername,
          name: editName,
          email: editEmail,
          role: editRole,
          department: editDepartment,
          newPassword: editNewPassword || undefined,
          portal_access: editPortalAccess,
          is_active: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResetFeedback(data.message);
      setEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (
      !confirm(
        `${t('admin_users_confirmDeleteDetail')} ${userName}? ${t('admin_users_confirmDeleteSuffix')}`
      )
    )
      return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
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

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#018730' }} />
        <Typography variant="body2" sx={{ color: '#64748B', mt: 2 }}>
          Memuat daftar akun...
        </Typography>
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ maxWidth: 680, mx: 'auto', mt: 4 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: 2, mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => fetchUsers()} sx={{ fontWeight: 800 }}>
              Coba Lagi
            </Button>
          }
        >
          {loadError}
        </Alert>
        <Card sx={{ p: 3, textAlign: 'center', borderRadius: 3, border: '1px solid #E2E8F0' }}>
          <SecurityIcon sx={{ fontSize: 42, color: '#94A3B8', mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Failed to load account data
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            Backend tidak merespons atau sesi Anda kedaluwarsa. Periksa koneksi ke <code>BACKEND_API_URL</code> dan coba login ulang.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 2.5, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => fetchUsers()} sx={{ bgcolor: '#018730', fontWeight: 700, '&:hover': { bgcolor: '#005c21' } }}>
              Muat Ulang
            </Button>
            <Button variant="outlined" onClick={() => router.push('/login')} sx={{ fontWeight: 700, borderColor: '#CBD5E1', color: '#334155' }}>
              Ke Login
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  // KHUSUS SUPER ADMIN ONLY
  if (currentUserRole !== 'admin' && currentUserRole !== 'superadmin') {
    return (
      <Box sx={{ maxWidth: 680, mx: 'auto', mt: 6 }}>
        <Card sx={{ borderRadius: 3, border: '2px solid #FCA5A5', p: 4, textAlign: 'center', boxShadow: '0 8px 30px rgba(239,68,68,0.1)' }}>
          <Box sx={{ width: 68, height: 68, borderRadius: '50%', bgcolor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <SecurityIcon sx={{ fontSize: 38 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#991B1B', mb: 1 }}>
            {t('admin_users_accessDeniedTitle')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#475569', mb: 3, lineHeight: 1.6 }}>
            {t('admin_users_accessDeniedDesc')} <code>{currentUserRole || 'Non-Admin'}</code>
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/admin/applicants')}
            sx={{ bgcolor: '#018730', color: '#FFFFFF', fontWeight: 700, px: 3.5, py: 1.2, borderRadius: 2, '&:hover': { bgcolor: '#005c21' } }}
          >
            {t('admin_users_backToApplicants')}
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2.1rem' },
            }}
          >
            {t('admin_users_title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            {t('admin_users_subtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddUserIcon />}
          onClick={() => setAddModalOpen(true)}
          sx={{
            bgcolor: '#018730',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            width: { xs: '100%', sm: 'auto' },
            py: { xs: 1.2, sm: 1 },
            px: 2.5,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(1, 135, 48, 0.25)',
            '&:hover': { bgcolor: '#005c21' },
          }}
        >
          {t('admin_users_btnAddUser')}
        </Button>
      </Box>

      {resetFeedback && (
        <Alert severity="success" onClose={() => setResetFeedback(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {resetFeedback}
        </Alert>
      )}

      {(() => {
        const filteredUsers = users.filter((u) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.username && u.username.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.employeeId && String(u.employeeId).toLowerCase().includes(q)) ||
            (u.employee_id && String(u.employee_id).toLowerCase().includes(q)) ||
            (u.role && u.role.toLowerCase().includes(q)) ||
            (u.department && u.department.toLowerCase().includes(q))
          );
        });

        const paginatedUsers = filteredUsers.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

        return (
          <>
            <Paper sx={{ mb: 2, borderRadius: 2.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <KarirTableToolbar
                searchQuery={searchQuery}
                onSearchChange={(val) => {
                  setSearchQuery(val);
                  setPage(0);
                }}
                placeholder={t('admin_users_searchPlaceholder')}
                totalCount={users.length}
                filteredCount={filteredUsers.length}
              />
            </Paper>

            {/* Tampilan Khusus Mobile: List Card Responsif */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2, mb: 3 }}>
              {filteredUsers.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', color: '#64748B', borderRadius: 2 }}>
                  {searchQuery ? t('admin_users_mobileEmptyFiltered') : t('admin_users_mobileEmptyAll')}
                </Paper>
              ) : (
                paginatedUsers.map((u) => (
                  <Paper
                    key={u.id}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Header Card: Nama & Role */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                          {u.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.3 }}>
                          Username: <code>{u.username}</code>
                        </Typography>
                      </Box>
                      <Chip
                        label={u.role === 'hr' ? 'HR Recruitment' : u.role === 'user_dept' ? 'User Dept' : 'Super Admin'}
                        size="small"
                        sx={{
                          bgcolor: u.role === 'hr' ? '#DCFCE7' : u.role === 'user_dept' ? '#FEF3C7' : '#E0F2FE',
                          color: u.role === 'hr' ? '#166534' : u.role === 'user_dept' ? '#92400E' : '#0369A1',
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      />
                    </Box>

                    <Box sx={{ fontSize: 13, color: '#475569', mb: 1.2 }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#018730' }}>🪪 {(u.employeeId || u.employee_id || '—')}</div>
                      <div>✉️ {u.email}</div>
                      <div>🏢 {t('admin_users_deptPrefix')} <strong>{u.department}</strong></div>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                      <Chip label={(u.isActive ?? u.is_active ?? true) ? t('admin_users_chipActive') : t('admin_users_chipInactive')} size="small" sx={{ bgcolor: (u.isActive ?? u.is_active ?? true) ? '#DCFCE7' : '#F1F5F9', color: (u.isActive ?? u.is_active ?? true) ? '#15803D' : '#64748B', fontWeight: 700, fontSize: 11 }} />
                      <Chip label={(u.portalAccess ?? u.portal_access ?? 'both') === 'both' ? t('admin_users_portalBoth') : (u.portalAccess ?? u.portal_access) === 'perusahaan' ? t('admin_users_portalCompany') : t('admin_users_portalKarir')} size="small" sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 700, fontSize: 11 }} />
                    </Box>

                   
                    {/* Status MFA */}
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={u.isMfaEnabled ? <CheckCircleIcon sx={{ fontSize: 15 }} /> : <SecurityIcon sx={{ fontSize: 15 }} />}
                        label={u.isMfaEnabled ? t('admin_users_mfaActiveLong') : t('admin_users_mfaInactiveLong')}
                        size="small"
                        sx={{
                          bgcolor: u.isMfaEnabled ? '#DCFCE7' : '#FEE2E2',
                          color: u.isMfaEnabled ? '#15803D' : '#991B1B',
                          fontWeight: 700,
                          fontSize: 11.5,
                        }}
                      />
                    </Box>

                    {/* Action Buttons Grid on Mobile */}
                    <Divider sx={{ mb: 1.5 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEdit(u)}
                        sx={{ borderColor: '#0284C7', color: '#0284C7', fontWeight: 700, flex: 1, minWidth: 90 }}
                      >
                        Edit
                      </Button>

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
                        sx={{ borderColor: '#CBD5E1', color: '#334155', fontWeight: 700, flex: 1, minWidth: 140 }}
                      >
                        {t('admin_users_btnResetPassword')}
                      </Button>

                      {u.isMfaEnabled && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handleResetMfa(u.id, u.name)}
                          sx={{ fontWeight: 700, flex: 1, minWidth: 110 }}
                        >
                          Reset MFA
                        </Button>
                      )}

                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        sx={{ color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: 1.5, p: 0.7 }}
                        title="Delete User Account"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))
              )}
            </Box>

            {/* Tampilan Desktop: Tabel Standar dengan Horizontal Scroll Protection */}
            <TableContainer
              component={Paper}
              sx={{
                display: { xs: 'none', md: 'block' },
                borderRadius: 2.5,
                border: '1px solid #E2E8F0',
                overflowX: 'auto',
                mb: 2,
              }}
            >
              <Table sx={{ minWidth: 1050 }}>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Employee ID</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{t('admin_users_tableUsername')}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{t('admin_users_tableRoleDept')}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{t('admin_users_tableMfa')}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{t('admin_users_tableActive')}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{t('admin_users_tablePortalAccess')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>{t('admin_users_tableAction')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748B' }}>
                        {searchQuery ? t('admin_users_mobileEmptyFiltered') : t('admin_users_mobileEmptyAll')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#018730', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                            {(u.employeeId || u.employee_id || '—')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: 10 }}>
                            {u.employeeId || u.employee_id ? 'immutable' : '—'}
                          </Typography>
                        </TableCell>
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
                            label={u.role === 'hr' ? t('admin_users_roleHr') : u.role === 'user_dept' ? t('admin_users_roleDept') : t('admin_users_roleAdmin')}
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
                            label={u.isMfaEnabled ? t('admin_users_mfaActive') : t('admin_users_mfaInactive')}
                            size="small"
                            sx={{ bgcolor: u.isMfaEnabled ? '#DCFCE7' : '#FEE2E2', color: u.isMfaEnabled ? '#15803D' : '#991B1B', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch size="small" checked={u.isActive ?? u.is_active ?? true} onChange={() => handleToggleActiveRow(u)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#018730' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#018730' } }} />
                            <Chip label={(u.isActive ?? u.is_active ?? true) ? t('admin_users_chipActive') : t('admin_users_chipOff')} size="small" sx={{ bgcolor: (u.isActive ?? u.is_active ?? true) ? '#DCFCE7' : '#F1F5F9', color: (u.isActive ?? u.is_active ?? true) ? '#15803D' : '#64748B', fontWeight: 700, fontSize: 11 }} />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <TextField select size="small" value={u.portalAccess ?? u.portal_access ?? 'both'} onChange={(e) => handlePortalChangeRow(u, e.target.value)} sx={{ minWidth: 130, '& .MuiInputBase-root': { fontSize: 12, fontWeight: 700 } }}>
                            <MenuItem value="perusahaan">{t('admin_users_portalCompany')}</MenuItem>
                            <MenuItem value="karir">{t('admin_users_portalKarir')}</MenuItem>
                            <MenuItem value="both">{t('admin_users_portalBoth')}</MenuItem>
                          </TextField>
                        </TableCell>

                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                            {/* Edit User Button */}
                            <Tooltip title={t('admin_users_tooltipEdit')}>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEdit(u)}
                                sx={{ color: '#0284C7' }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {/* {t('admin_users_btnResetPassword')} Button */}
                            <Tooltip title={t('admin_users_tooltipEdit')}>
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
                                {t('admin_users_btnResetPassword')}
                              </Button>
                            </Tooltip>

                            {/* Reset MFA Button */}
                            {u.isMfaEnabled && (
                              <Tooltip title={t('admin_users_tooltipResetMfa')}>
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

                            {/* Delete User Button */}
                            <Tooltip title={t('admin_users_tooltipDelete')}>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                sx={{ color: '#EF4444' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Component */}
            <Paper sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <KarirTablePagination
                count={filteredUsers.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={(newRpp) => {
                  setRowsPerPage(newRpp);
                  setPage(0);
                }}
              />
            </Paper>
          </>
        );
      })()}

      {/* RESET PASSWORD MODAL */}
      <Dialog open={resetModalOpen} onClose={() => setResetModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{t('admin_users_dialogResetTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            {t('admin_users_dialogResetUserLabel')} <strong>{selectedUser?.name}</strong> (<code>{selectedUser?.username}</code>)
          </Typography>

          <TextField
            fullWidth
            label={t('admin_users_dialogNewPasswordLabel')}
            placeholder={t('admin_users_dialogNewPasswordPlaceholder')}
            value={newPasswordInput}
            onChange={(e) => setNewPasswordInput(e.target.value)}
            helperText={t('admin_users_dialogNewPasswordHelper')}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setResetModalOpen(false)}>{t('admin_users_btnCancel')}</Button>
          <Button
            variant="contained"
            disabled={processing}
            onClick={handleConfirmResetPassword}
            sx={{ bgcolor: '#018730', fontWeight: 700 }}
          >
            {processing ? t('admin_users_btnResetting') : t('admin_users_btnSaveNewPassword')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD USER MODAL */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateUser}>
          <DialogTitle sx={{ fontWeight: 800 }}>{t('admin_users_dialogAddTitle')}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                required
                label="Employee ID *"
                placeholder="ITSP.004.02.16"
                value={newEmployeeId}
                onChange={(e) => setNewEmployeeId(e.target.value)}
                helperText="immutable — contoh: ITSP.004.02.16"
                slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontWeight: 700 } } }}
              />
              <TextField
                fullWidth
                required
                label={t('admin_users_fieldUsername')}
                placeholder="e.g. hr.staff"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <TextField
                fullWidth
                required
                label={t('admin_users_fieldFullName')}
                placeholder="e.g. John Doe, M.Psi"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <TextField
                fullWidth
                required
                type="email"
                label={t('admin_users_fieldEmail')}
                placeholder="name@itsp.co.id"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <TextField
                select
                fullWidth
                required
                label={t('admin_users_fieldRole')}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <MenuItem value="hr">HR Recruitment</MenuItem>
                <MenuItem value="user_dept">{t('admin_users_roleDept')}</MenuItem>
                <MenuItem value="admin">{t('admin_users_roleAdmin')}</MenuItem>
              </TextField>
              <Autocomplete
                freeSolo
                options={availableDepartments}
                value={newDepartment}
                onChange={(_, val) => setNewDepartment(val || '')}
                onInputChange={(_, val) => setNewDepartment(val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    label={t('admin_users_fieldDept')}
                    placeholder={t('admin_users_fieldDeptPlaceholder')}
                    helperText={t('admin_users_fieldDeptPlaceholder')}
                  />
                )}
              />
              <TextField
                fullWidth
                required
                label={t('admin_users_fieldPassword')}
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
              <TextField
                select
                fullWidth
                label={t('admin_users_fieldPortalAccess')}
                value={newPortalAccess}
                onChange={(e) => setNewPortalAccess(e.target.value)}
                helperText={`${t('admin_users_portalCompany')} / ${t('admin_users_portalKarir')} / ${t('admin_users_portalBoth')}`}
              >
                <MenuItem value="perusahaan">{t('admin_users_portalCompany')}</MenuItem>
                <MenuItem value="karir">{t('admin_users_portalKarir')}</MenuItem>
                <MenuItem value="both">{t('admin_users_portalBoth')}</MenuItem>
              </TextField>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newIsActive}
                      onChange={(e) => setNewIsActive(e.target.checked)}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#018730' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#018730' } }}
                    />
                  }
                  label={<Typography variant="body2" fontWeight={800}>{newIsActive ? t('admin_users_switchActive') : t('admin_users_switchInactive')}</Typography>}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setAddModalOpen(false)}>{t('admin_users_btnCancel')}</Button>
            <Button type="submit" variant="contained" disabled={processing} sx={{ bgcolor: '#018730', fontWeight: 700 }}>
              {processing ? t('admin_users_btnSaving') : t('admin_users_btnCreate')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* EDIT USER MODAL */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleConfirmEdit}>
          <DialogTitle sx={{ fontWeight: 800 }}>{t('admin_users_dialogEditTitle')}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
              {t('admin_users_dialogEditDescPrefix')} <strong>{selectedEditUser?.name}</strong>
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Employee ID"
                placeholder="ITSP.004.02.16"
                value={editEmployeeId}
                onChange={(e) => setEditEmployeeId(e.target.value)}
                helperText={(selectedEditUser?.employeeId || selectedEditUser?.employee_id) ? 'immutable — tidak dapat diubah (hubungi HR jika salah)' : 'Isi Employee ID (contoh: ITSP.004.02.16)'}
                disabled={Boolean(selectedEditUser?.employeeId || selectedEditUser?.employee_id)}
                slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontWeight: 700 } } }}
              />
              <TextField
                fullWidth
                required
                label={t('admin_users_fieldUsername')}
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
              />
              <TextField
                fullWidth
                required
                label={t('admin_users_fieldFullName')}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <TextField
                fullWidth
                required
                type="email"
                label={t('admin_users_fieldEmail')}
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
              <TextField
                select
                fullWidth
                required
                label={t('admin_users_fieldRole')}
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
              >
                <MenuItem value="hr">HR Recruitment</MenuItem>
                <MenuItem value="user_dept">{t('admin_users_roleDept')}</MenuItem>
                <MenuItem value="admin">{t('admin_users_roleAdmin')}</MenuItem>
              </TextField>
              <Autocomplete
                freeSolo
                options={availableDepartments}
                value={editDepartment}
                onChange={(_, val) => setEditDepartment(val || '')}
                onInputChange={(_, val) => setEditDepartment(val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    label={t('admin_users_fieldDept')}
                    placeholder={t('admin_users_fieldDeptPlaceholder')}
                  />
                )}
              />
              <TextField
                fullWidth
                label={t('admin_users_fieldNewPasswordOpt')}
                placeholder={t('admin_users_fieldNewPasswordPlaceholder')}
                value={editNewPassword}
                onChange={(e) => setEditNewPassword(e.target.value)}
                helperText={t('admin_users_fieldNewPasswordHelper')}
              />
              <TextField
                select
                fullWidth
                label={t('admin_users_fieldPortalAccess')}
                value={editPortalAccess}
                onChange={(e) => setEditPortalAccess(e.target.value)}
              >
                <MenuItem value="perusahaan">{t('admin_users_portalCompany')}</MenuItem>
                <MenuItem value="karir">{t('admin_users_portalKarir')}</MenuItem>
                <MenuItem value="both">{t('admin_users_portalBoth')}</MenuItem>
              </TextField>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#018730' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#018730' } }}
                    />
                  }
                  label={<Typography variant="body2" fontWeight={800}>{editIsActive ? t('admin_users_switchActive') : t('admin_users_switchInactive')}</Typography>}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setEditModalOpen(false)}>{t('admin_users_btnCancel')}</Button>
            <Button type="submit" variant="contained" disabled={processing} sx={{ bgcolor: '#018730', fontWeight: 700 }}>
              {processing ? t('admin_users_btnSaving') : t('admin_users_btnSaveChanges')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
