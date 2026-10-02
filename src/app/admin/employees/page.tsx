'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Badge as BadgeIcon,
  HowToReg as HowToRegIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  FamilyRestroom as FamilyIcon,
  Description as DocIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningIcon,
  UploadFile as UploadFileIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  History as HistoryIcon,
  PhotoCamera as PhotoCameraIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ExitToApp as ExitToAppIcon,
  PersonAdd as PersonAddIcon,
  ManageAccounts as ManageAccountsIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { KarirTablePagination } from '@/components/admin/KarirTablePagination';

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

const COMPANY_DEPARTMENTS = [
  'Assembly',
  'Quality Assurance',
  'Interseat',
  'Injection',
  'Painting',
  'Warehouse & Delivery',
  'Store',
  'Rack',
  'Production Engineering',
  'Maintenance',
  'Planning',
  'HR & GA',
  'Purchasing',
  'Accounting & Finance',
  'Marketing',
  'Production',
  'SYD & IT',
  'HQ Office',
  'Thai Manager',
  'Local Manager',
];

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState(''); // '' = aktif saja, 'resign' = keluar
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Compute available department options
  const departmentOptions = useMemo(() => {
    const set = new Set(COMPANY_DEPARTMENTS);
    employees.forEach((emp) => {
      if (emp.department) set.add(emp.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  // Admin Session
  const [adminSession, setAdminSession] = useState<{
    role: string;
    name: string;
    email: string;
    isAdmin: boolean;
  } | null>(null);

  // Detail Modal State
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailTab, setDetailTab] = useState(0);

  // Edit Employee Profile & Contract Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTab, setEditTab] = useState(0);
  const [editFullName, setEditFullName] = useState('');
  const [editNik, setEditNik] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBirthPlace, setEditBirthPlace] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editAge, setEditAge] = useState<number | string>('');
  const [editGender, setEditGender] = useState('Laki-laki');
  const [editReligion, setEditReligion] = useState('Islam');
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const [editAddressKtp, setEditAddressKtp] = useState('');
  const [editAddressDomicile, setEditAddressDomicile] = useState('');
  const [editPlant, setEditPlant] = useState('KIIC');
  const [editPayrollId, setEditPayrollId] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editSection, setEditSection] = useState('');
  const [editEmployeeType, setEditEmployeeType] = useState('Direct');
  const [editPtkp, setEditPtkp] = useState('TK');
  const [editNpwp, setEditNpwp] = useState('');
  const [editBpjsTk, setEditBpjsTk] = useState('');
  const [editAccountNo, setEditAccountNo] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editBankAcc, setEditBankAcc] = useState('');
  const [editFather, setEditFather] = useState('');
  const [editMother, setEditMother] = useState('');
  const [editSpouse, setEditSpouse] = useState('');
  const [editFamilyCount, setEditFamilyCount] = useState<number | string>(0);
  const [editEduLevel, setEditEduLevel] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [editSchool, setEditSchool] = useState('');
  const [editJoinDate, setEditJoinDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editContractStatus, setEditContractStatus] = useState('PKWT');
  const [editDept, setEditDept] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [updatingEmp, setUpdatingEmp] = useState(false);

  // Sequence Settings Modal State
  const [sequenceModalOpen, setSequenceModalOpen] = useState(false);
  const [lastSeqInput, setLastSeqInput] = useState<number>(0);
  const [currentDbSeq, setCurrentDbSeq] = useState<number>(0);
  const [seqSampleId, setSeqSampleId] = useState('');
  const [savingSeq, setSavingSeq] = useState(false);
  const [seqFeedback, setSeqFeedback] = useState<string | null>(null);

  // Import Excel Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [includeOut, setIncludeOut] = useState(false);
  const [replaceAll, setReplaceAll] = useState(false);
  const [importing, setImporting] = useState(false);

  // Sort state
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Delete All Employees Modal State
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [confirmDeleteAllText, setConfirmDeleteAllText] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);

  // Single Delete Employee Modal State
  const [deleteSingleModalOpen, setDeleteSingleModalOpen] = useState(false);
  const [empToDelete, setEmpToDelete] = useState<any | null>(null);
  const [deletingSingle, setDeletingSingle] = useState(false);

  // Terminate Employee Modal State
  const [terminateModalOpen, setTerminateModalOpen] = useState(false);
  const [empToTerminate, setEmpToTerminate] = useState<any | null>(null);
  const [terminateReason, setTerminateReason] = useState('Habis Kontrak (Tidak Diperpanjang)');
  const [terminateDate, setTerminateDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [terminateNotes, setTerminateNotes] = useState('');
  const [terminating, setTerminating] = useState(false);

  // Create Employee Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createTab, setCreateTab] = useState(0);
  const [createFullName, setCreateFullName] = useState('');
  const [createNik, setCreateNik] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createGender, setCreateGender] = useState('Laki-laki');
  const [createBirthPlace, setCreateBirthPlace] = useState('');
  const [createBirthDate, setCreateBirthDate] = useState('');
  const [createReligion, setCreateReligion] = useState('Islam');
  const [createContractStatus, setCreateContractStatus] = useState('PKWT');
  const [createDept, setCreateDept] = useState('');
  const [createJobTitle, setCreateJobTitle] = useState('');
  const [createLevel, setCreateLevel] = useState('');
  const [createSection, setCreateSection] = useState('');
  const [createEmployeeType, setCreateEmployeeType] = useState('Direct');
  const [createJoinDate, setCreateJoinDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [createEndDate, setCreateEndDate] = useState('');
  const [createLocation, setCreateLocation] = useState('Plant 1 KIIC Karawang');
  const [createPlant, setCreatePlant] = useState('KIIC');
  const [createSalary, setCreateSalary] = useState('');
  const [createNpwp, setCreateNpwp] = useState('');
  const [createBpjsTk, setCreateBpjsTk] = useState('');
  const [createAccountNo, setCreateAccountNo] = useState('');
  const [createBankName, setCreateBankName] = useState('');
  const [createBankAcc, setCreateBankAcc] = useState('');
  const [createNotes, setCreateNotes] = useState('');
  const [creating, setCreating] = useState(false);

  // Retention Settings Modal State
  const [retentionModalOpen, setRetentionModalOpen] = useState(false);
  const [retentionMonths, setRetentionMonths] = useState(12);
  const [retentionTotalExited, setRetentionTotalExited] = useState(0);
  const [retentionExpiredCount, setRetentionExpiredCount] = useState(0);
  const [savingRetention, setSavingRetention] = useState(false);
  const [cleaningRetention, setCleaningRetention] = useState(false);
  const [retentionFeedback, setRetentionFeedback] = useState<string | null>(null);

  // Full stats (unfiltered) from total count
  const [fullStats, setFullStats] = useState({ total: 0, pkwt: 0, pkwtt: 0, trainee: 0, expiringSoon: 0 });

  // General Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch Session
  useEffect(() => {
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) setAdminSession(data);
      })
      .catch((err) => console.error('Session error:', err));
  }, []);

  // Fetch Full Stats (unfiltered)
  const fetchFullStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/employees?_t=${Date.now()}`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.employees)) {
        const all = data.employees;
        const getDays = (endDateStr?: string | null) => {
          if (!endDateStr) return null;
          const diff = Math.ceil((new Date(endDateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return diff;
        };
        setFullStats({
          total: all.length,
          pkwt: all.filter((e: any) => String(e.contract_status || '').toUpperCase().startsWith('PKWT') && !String(e.contract_status || '').toUpperCase().includes('PKWTT')).length,
          pkwtt: all.filter((e: any) => String(e.contract_status || '').toUpperCase().includes('PKWTT') || String(e.contract_status || '').toLowerCase().includes('tetap')).length,
          trainee: all.filter((e: any) => String(e.contract_status || '').toLowerCase().startsWith('trainee')).length,
          expiringSoon: all.filter((e: any) => {
            const cs = String(e.contract_status || '').toUpperCase();
            if (cs.includes('PKWTT') || cs.startsWith('TRAINEE') || !e.contract_end_date) return false;
            const rem = getDays(e.contract_end_date);
            return rem !== null && rem > 0 && rem <= 30;
          }).length,
        });
      }
    } catch { /* ignore */ }
  }, []);

  // Fetch Employees List
  const fetchEmployees = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (deptFilter) params.append('department', deptFilter);
    if (contractFilter) params.append('contract_status', contractFilter);
    // Jika filter keluar dipilih, kirim employee_status=resign ke backend
    if (employeeStatusFilter) params.append('employee_status', employeeStatusFilter);
    params.append('sort', sortOrder);
    params.append('_t', Date.now().toString());

    fetch(`/api/admin/employees?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.employees)) {
          setEmployees(data.employees);
        } else {
          setEmployees([]);
        }
      })
      .catch((err) => {
        console.error('Fetch employees error:', err);
        setEmployees([]);
      })
      .finally(() => setLoading(false));
  }, [search, deptFilter, contractFilter, employeeStatusFilter, sortOrder]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchFullStats();
  }, [fetchFullStats]);

  // Fetch Current Sequence
  const fetchSequence = async () => {
    try {
      const res = await fetch('/api/admin/employees/sequence');
      const data = await res.json();
      if (data && data.success) {
        setCurrentDbSeq(data.last_sequence || 0);
        setLastSeqInput(data.last_sequence || 0);
        setSeqSampleId(data.preview_employee_id || '');
      }
    } catch (err) {
      console.error('Fetch sequence error:', err);
    }
  };

  const handleOpenSequenceModal = () => {
    setSeqFeedback(null);
    fetchSequence();
    setSequenceModalOpen(true);
  };

  const handleSaveSequence = async () => {
    setSavingSeq(true);
    setSeqFeedback(null);
    try {
      const res = await fetch('/api/admin/employees/sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_sequence: Number(lastSeqInput) }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSeqFeedback(`✓ Berhasil memperbarui nomor urut terakhir menjadi ${data.last_sequence}. ID berikutnya akan menggunakan awalan ${data.next_sequence}.`);
        setCurrentDbSeq(data.last_sequence);
      } else {
        setSeqFeedback(data.detail || data.error || 'Gagal menyimpan nomor urut.');
      }
    } catch (err: any) {
      setSeqFeedback(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSavingSeq(false);
    }
  };

  // Handle Photo Profile Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar. Maksimal 3 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Open Edit Profile & Contract Modal
  const handleOpenEditModal = (emp: any) => {
    setSelectedEmp(emp);
    setEditTab(0);
    setEditFullName(emp.full_name || '');
    setEditNik(emp.national_id || emp.nik || '');
    setEditPhone(emp.phone || '');
    setEditEmail(emp.email || '');
    setEditBirthPlace(emp.birth_place || '');
    setEditBirthDate(emp.birth_date ? emp.birth_date.substring(0, 10) : '');
    setEditAge(emp.age ?? '');
    setEditGender(emp.gender || 'Laki-laki');
    setEditReligion(emp.religion || 'Islam');
    setEditPhoto(emp.photo_profile || emp.photo_file || null);
    setEditAddressKtp(emp.ktp_street_address || emp.address_ktp || '');
    setEditAddressDomicile(emp.domicile_street_address || emp.address_domicile || '');
    setEditPlant(emp.plant || 'KIIC');
    setEditPayrollId(emp.payroll_id || '');
    setEditLevel(emp.level || '');
    setEditSection(emp.section || '');
    setEditEmployeeType(emp.employee_type || 'Direct');
    setEditPtkp(emp.ptkp_status || 'TK');
    setEditNpwp(emp.npwp || '');
    setEditBpjsTk(emp.bpjs_tk_no || '');
    setEditAccountNo(emp.account_no || '');
    setEditBankName(emp.bank_name || '');
    setEditBankAcc(emp.bank_account_no || '');
    setEditFather(emp.father_name || '');
    setEditMother(emp.mother_name || '');
    setEditSpouse(emp.spouse_name || '');
    setEditFamilyCount(emp.family_members_count ?? 0);
    setEditEduLevel(emp.education_level || emp.last_education || '');
    setEditMajor(emp.major || '');
    setEditSchool(emp.institution_name || emp.school_name || '');
    setEditJoinDate(emp.join_date ? emp.join_date.substring(0, 10) : (emp.contract_start_date ? emp.contract_start_date.substring(0, 10) : ''));
    setEditEndDate(emp.contract_end_date ? emp.contract_end_date.substring(0, 10) : '');
    setEditContractStatus(emp.contract_status || 'PKWT');
    setEditDept(emp.department || '');
    setEditJobTitle(emp.job_title || '');
    setEditLocation(emp.work_location || 'Plant 1 KIIC Karawang');
    setEditSalary(emp.agreed_salary || emp.salary || '');
    setEditNotes(emp.notes || '');
    setEditModalOpen(true);
  };

  // Save Complete Employee Profile Update
  const handleSaveEditContract = async () => {
    if (!selectedEmp) return;
    setUpdatingEmp(true);
    try {
      const res = await fetch(`/api/admin/employees/${selectedEmp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: editFullName,
          nik: editNik,
          phone: editPhone,
          email: editEmail,
          birth_place: editBirthPlace,
          birth_date: editBirthDate || null,
          age: editAge ? Number(editAge) : null,
          gender: editGender,
          religion: editReligion,
          photo_profile: editPhoto,
          address_ktp: editAddressKtp,
          address_domicile: editAddressDomicile,
          plant: editPlant,
          payroll_id: editPayrollId,
          level: editLevel,
          section: editSection,
          employee_type: editEmployeeType,
          ptkp_status: editPtkp,
          npwp: editNpwp,
          bpjs_tk_no: editBpjsTk,
          account_no: editAccountNo,
          bank_name: editBankName,
          bank_account_no: editBankAcc,
          father_name: editFather,
          mother_name: editMother,
          spouse_name: editSpouse,
          family_members_count: editFamilyCount ? Number(editFamilyCount) : 0,
          last_education: editEduLevel,
          major: editMajor,
          school_name: editSchool,
          join_date: editJoinDate || null,
          contract_start_date: editJoinDate || null,
          contract_end_date: editEndDate || null,
          contract_status: editContractStatus,
          department: editDept,
          job_title: editJobTitle,
          work_location: editLocation,
          agreed_salary: editSalary,
          notes: editNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: `Data profil & kontrak ${editFullName || selectedEmp.full_name} berhasil diperbarui.` });
        setEditModalOpen(false);
        fetchEmployees();
        // Update selectedEmp in case detail modal is open
        setSelectedEmp((prev: any) => prev ? {
          ...prev,
          full_name: editFullName,
          nik: editNik,
          national_id: editNik,
          phone: editPhone,
          email: editEmail,
          birth_place: editBirthPlace,
          birth_date: editBirthDate,
          age: editAge,
          gender: editGender,
          religion: editReligion,
          photo_profile: editPhoto || prev.photo_profile,
          photo_file: editPhoto || prev.photo_file,
          address_ktp: editAddressKtp,
          ktp_street_address: editAddressKtp,
          address_domicile: editAddressDomicile,
          domicile_street_address: editAddressDomicile,
          plant: editPlant,
          payroll_id: editPayrollId,
          level: editLevel,
          section: editSection,
          employee_type: editEmployeeType,
          ptkp_status: editPtkp,
          npwp: editNpwp,
          bpjs_tk_no: editBpjsTk,
          account_no: editAccountNo,
          bank_name: editBankName,
          bank_account_no: editBankAcc,
          father_name: editFather,
          mother_name: editMother,
          spouse_name: editSpouse,
          family_members_count: editFamilyCount,
          education_level: editEduLevel,
          last_education: editEduLevel,
          major: editMajor,
          institution_name: editSchool,
          school_name: editSchool,
          join_date: editJoinDate,
          contract_start_date: editJoinDate,
          contract_end_date: editEndDate,
          contract_status: editContractStatus,
          department: editDept,
          job_title: editJobTitle,
          work_location: editLocation,
          agreed_salary: editSalary,
          salary: editSalary,
          notes: editNotes,
        } : null);
      } else {
        alert(data.detail || data.error || 'Gagal memperbarui data karyawan.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setUpdatingEmp(false);
    }
  };

  // Handle Import Excel Master
  const handleImportExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      alert('Pilih file Excel (.xlsx atau .xls) terlebih dahulu.');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('include_out', String(includeOut));
      formData.append('replace_all', String(replaceAll));

      const res = await fetch('/api/admin/employees/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: data.message || 'Berhasil mengimpor data karyawan.',
        });
        setImportModalOpen(false);
        setImportFile(null);
        fetchEmployees();
      } else {
        alert(data.detail || data.error || 'Gagal mengimpor file Excel.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat mengunggah file.');
    } finally {
      setImporting(false);
    }
  };

  // Handle Delete All Employees
  const handleDeleteAllEmployees = async () => {
    if (confirmDeleteAllText !== 'HAPUS SEMUA') {
      alert('Ketik "HAPUS SEMUA" untuk mengonfirmasi penghapusan seluruh data.');
      return;
    }

    setDeletingAll(true);
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: data.message || 'Seluruh data karyawan berhasil dihapus.',
        });
        setDeleteAllModalOpen(false);
        setConfirmDeleteAllText('');
        fetchEmployees();
      } else {
        alert(data.detail || data.error || 'Gagal menghapus seluruh data karyawan.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setDeletingAll(false);
    }
  };

  // Handle Single Delete Employee
  const handleDeleteSingleEmployee = async () => {
    if (!empToDelete) return;

    setDeletingSingle(true);
    try {
      const res = await fetch(`/api/admin/employees/${empToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: data.message || `Data karyawan ${empToDelete.full_name} berhasil dihapus.`,
        });
        setDeleteSingleModalOpen(false);
        setEmpToDelete(null);
        fetchEmployees();
      } else {
        alert(data.detail || data.error || 'Gagal menghapus data karyawan.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setDeletingSingle(false);
    }
  };

  // Handle Terminate Employee
  const handleTerminateEmployee = async () => {
    if (!empToTerminate) return;
    setTerminating(true);
    try {
      const res = await fetch(`/api/admin/employees/${empToTerminate.id}/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exit_reason: terminateReason,
          exit_date: terminateDate || null,
          notes: terminateNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: data.message || `${empToTerminate.full_name} berhasil ditandai sebagai karyawan keluar.` });
        setTerminateModalOpen(false);
        setEmpToTerminate(null);
        setTerminateReason('Habis Kontrak (Tidak Diperpanjang)');
        setTerminateNotes('');
        fetchEmployees();
        fetchFullStats();
      } else {
        alert(data.detail || data.error || 'Gagal memproses permintaan.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setTerminating(false);
    }
  };

  // Handle Create Employee Manually
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFullName.trim()) { alert('Nama lengkap wajib diisi.'); return; }
    if (!createDept.trim()) { alert('Departemen wajib diisi.'); return; }
    if (!createJobTitle.trim()) { alert('Jabatan wajib diisi.'); return; }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: createFullName,
          nik: createNik || null,
          phone: createPhone || null,
          email: createEmail || null,
          gender: createGender,
          birth_place: createBirthPlace || null,
          birth_date: createBirthDate || null,
          religion: createReligion,
          contract_status: createContractStatus,
          department: createDept,
          job_title: createJobTitle,
          level: createLevel || null,
          section: createSection || null,
          employee_type: createEmployeeType,
          join_date: createJoinDate || null,
          contract_start_date: createJoinDate || null,
          contract_end_date: createContractStatus === 'PKWTT' ? null : (createEndDate || null),
          work_location: createLocation,
          plant: createPlant,
          salary: createSalary || null,
          npwp: createNpwp || null,
          bpjs_tk_no: createBpjsTk || null,
          account_no: createAccountNo || null,
          bank_name: createBankName || null,
          bank_account_no: createBankAcc || null,
          notes: createNotes || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: data.message || 'Karyawan baru berhasil ditambahkan.' });
        setCreateModalOpen(false);
        setCreateFullName(''); setCreateNik(''); setCreatePhone(''); setCreateEmail('');
        setCreateDept(''); setCreateJobTitle(''); setCreateNotes('');
        fetchEmployees();
        fetchFullStats();
      } else {
        alert(data.detail || data.error || 'Gagal menambahkan karyawan.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setCreating(false);
    }
  };

  // Handle Fetch & Open Retention Settings
  const handleOpenRetentionModal = async () => {
    setRetentionFeedback(null);
    try {
      const res = await fetch('/api/admin/employees-retention');
      const data = await res.json();
      if (data && data.success) {
        setRetentionMonths(data.retention_months ?? 12);
        setRetentionTotalExited(data.total_exited ?? 0);
        setRetentionExpiredCount(data.expired_count ?? 0);
      }
    } catch { /* ignore */ }
    setRetentionModalOpen(true);
  };

  const handleSaveRetention = async () => {
    setSavingRetention(true);
    setRetentionFeedback(null);
    try {
      const res = await fetch('/api/admin/employees-retention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retention_months: retentionMonths }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRetentionFeedback(`✓ ${data.message}`);
      } else {
        setRetentionFeedback(data.detail || data.error || 'Gagal menyimpan pengaturan retensi.');
      }
    } catch (err: any) {
      setRetentionFeedback(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSavingRetention(false);
    }
  };

  const handleCleanupRetention = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus permanen ${retentionExpiredCount} data karyawan keluar yang sudah melewati batas retensi?`)) return;
    setCleaningRetention(true);
    setRetentionFeedback(null);
    try {
      const res = await fetch('/api/admin/employees-retention/cleanup', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setRetentionFeedback(`✓ ${data.message}`);
        setRetentionExpiredCount(0);
        fetchEmployees();
        fetchFullStats();
      } else {
        setRetentionFeedback(data.detail || data.error || 'Gagal membersihkan data.');
      }
    } catch (err: any) {
      setRetentionFeedback(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setCleaningRetention(false);
    }
  };

  // Export Employees to CSV / Excel with UTF-8 BOM
  const handleExportEmployees = () => {
    if (employees.length === 0) {
      alert('Tidak ada data karyawan untuk diexport.');
      return;
    }

    const headers = [
      'No',
      'ID Karyawan',
      'Nama Lengkap',
      'NIK KTP',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Agama',
      'Status Pernikahan',
      'Nomor HP / WA',
      'Email',
      'Alamat KTP Lengkap',
      'RT/RW KTP',
      'Kelurahan KTP',
      'Kecamatan KTP',
      'Kota/Kabupaten KTP',
      'Provinsi KTP',
      'Alamat Domisili Lengkap',
      'Pendidikan Terakhir',
      'Nama Sekolah / Kampus',
      'Jurusan',
      'Tahun Lulus',
      'Nilai / IPK',
      'Departemen',
      'Jabatan / Posisi',
      'Lokasi Pabrik',
      'Status Kontrak (PKWT/PKWTT)',
      'Tanggal Mulai Kontrak (Join Date)',
      'Tanggal Selesai Kontrak (End Date)',
      'Gaji Disepakati',
      'Nama Kontak Darurat',
      'Hubungan Kontak Darurat',
      'No Telp Darurat',
      'No NPWP',
      'No BPJS Ketenagakerjaan',
      'No BPJS Kesehatan',
      'Catatan HR',
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${clean}"`;
    };

    const rows = employees.map((emp, idx) => [
      idx + 1,
      escapeCsv(emp.employee_id),
      escapeCsv(emp.full_name),
      escapeCsv(emp.national_id ? `'${emp.national_id}` : ''),
      escapeCsv(emp.gender),
      escapeCsv(emp.birth_place),
      escapeCsv(emp.birth_date),
      escapeCsv(emp.religion),
      escapeCsv(emp.marital_status),
      escapeCsv(emp.phone ? `'${emp.phone}` : ''),
      escapeCsv(emp.email),
      escapeCsv(emp.ktp_street_address),
      escapeCsv(emp.ktp_rt_rw),
      escapeCsv(emp.ktp_kelurahan),
      escapeCsv(emp.ktp_kecamatan),
      escapeCsv(emp.ktp_city),
      escapeCsv(emp.ktp_province),
      escapeCsv(emp.domicile_street_address || emp.ktp_street_address),
      escapeCsv(emp.education_level),
      escapeCsv(emp.institution_name),
      escapeCsv(emp.major),
      escapeCsv(emp.graduation_year),
      escapeCsv(emp.gpa_or_grade),
      escapeCsv(emp.department),
      escapeCsv(emp.job_title),
      escapeCsv(emp.work_location),
      escapeCsv(emp.contract_status),
      escapeCsv(emp.join_date),
      escapeCsv(emp.contract_end_date || 'TETAP'),
      escapeCsv(emp.agreed_salary),
      escapeCsv(emp.emergency_contact_name),
      escapeCsv(emp.emergency_contact_relation),
      escapeCsv(emp.emergency_contact_phone ? `'${emp.emergency_contact_phone}` : ''),
      escapeCsv(emp.npwp_number ? `'${emp.npwp_number}` : ''),
      escapeCsv(emp.bpjs_tk_number ? `'${emp.bpjs_tk_number}` : ''),
      escapeCsv(emp.bpjs_kes_number ? `'${emp.bpjs_kes_number}` : ''),
      escapeCsv(emp.notes),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const curDate = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `DATA_KARYAWAN_PT_ITSP_${curDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper remaining days calculation
  const getDaysRemaining = (endDateStr?: string | null) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Statistics - use unfiltered full stats (once loaded), fallback to current employees
  const statsSource = fullStats.total > 0 ? fullStats : null;

  const totalEmployees = statsSource ? statsSource.total : employees.length;
  const totalPkwt = statsSource
    ? statsSource.pkwt
    : employees.filter((e) => String(e.contract_status || '').toUpperCase().startsWith('PKWT') && !String(e.contract_status || '').toUpperCase().includes('PKWTT')).length;
  const totalPkwtt = statsSource
    ? statsSource.pkwtt
    : employees.filter((e) => String(e.contract_status || '').toUpperCase().includes('PKWTT') || String(e.contract_status || '').toLowerCase().includes('tetap')).length;
  const totalTrainee = statsSource
    ? statsSource.trainee
    : employees.filter((e) => String(e.contract_status || '').toLowerCase().startsWith('trainee')).length;
  const expiringSoon = statsSource
    ? statsSource.expiringSoon
    : employees.filter((e) => {
        const cs = String(e.contract_status || '').toUpperCase();
        if (cs.includes('PKWTT') || cs.startsWith('TRAINEE') || !e.contract_end_date) return false;
        const rem = getDaysRemaining(e.contract_end_date);
        return rem !== null && rem > 0 && rem <= 30;
      }).length;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Top Breadcrumb & Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <BadgeIcon sx={{ color: '#018730', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              Master Data Karyawan Resmi
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            PT Indonesia Thai Summit Plastech • Database Kepegawaian &amp; Riwayat Masa Kontrak
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={() => {
              setCreateTab(0);
              setCreateFullName(''); setCreateNik(''); setCreatePhone(''); setCreateEmail('');
              setCreateGender('Laki-laki'); setCreateBirthPlace(''); setCreateBirthDate('');
              setCreateReligion('Islam'); setCreateContractStatus('PKWT'); setCreateDept('');
              setCreateJobTitle(''); setCreateLevel(''); setCreateSection('');
              setCreateEmployeeType('Direct');
              setCreateJoinDate(new Date().toISOString().substring(0, 10));
              setCreateEndDate(''); setCreateLocation('Plant 1 KIIC Karawang'); setCreatePlant('KIIC');
              setCreateSalary(''); setCreateNpwp(''); setCreateBpjsTk('');
              setCreateAccountNo(''); setCreateBankName(''); setCreateBankAcc('');
              setCreateNotes('');
              setCreateModalOpen(true);
            }}
            startIcon={<PersonAddIcon />}
            sx={{
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2,
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.3)',
              '&:hover': { bgcolor: '#1E293B' },
            }}
          >
            Tambah Karyawan
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              setImportFile(null);
              setIncludeOut(false);
              setReplaceAll(false);
              setImportModalOpen(true);
            }}
            startIcon={<UploadFileIcon />}
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
            Import Excel Master
          </Button>

          <Button
            component="a"
            href="/api/admin/employees/template"
            download="Template_Master_Karyawan_ITSP.xlsx"
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              borderColor: '#86EFAC',
              color: '#15803D',
              bgcolor: '#F0FDF4',
              '&:hover': { bgcolor: '#DCFCE7', borderColor: '#16A34A' },
            }}
          >
            Unduh Template
          </Button>

          <Button
            variant="outlined"
            onClick={handleOpenSequenceModal}
            startIcon={<SettingsIcon />}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              borderColor: '#CBD5E1',
              color: '#334155',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            }}
          >
            Atur No. Urut
          </Button>

          <Button
            variant="outlined"
            onClick={handleOpenRetentionModal}
            startIcon={<TuneIcon />}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              borderColor: '#C4B5FD',
              color: '#7C3AED',
              bgcolor: '#F5F3FF',
              '&:hover': { bgcolor: '#EDE9FE', borderColor: '#8B5CF6' },
            }}
          >
            Retensi Keluar
          </Button>

          <Button
            variant="outlined"
            onClick={handleExportEmployees}
            startIcon={<DownloadIcon />}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              borderColor: '#CBD5E1',
              color: '#334155',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            }}
          >
            Export CSV
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              setConfirmDeleteAllText('');
              setDeleteAllModalOpen(true);
            }}
            startIcon={<DeleteSweepIcon />}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              borderColor: '#FECACA',
              color: '#DC2626',
              bgcolor: '#FEF2F2',
              '&:hover': { bgcolor: '#FEE2E2', borderColor: '#F87171' },
            }}
          >
            Hapus Semua
          </Button>

          <Tooltip title="Muat Ulang Data">
            <IconButton onClick={fetchEmployees} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 3 }}>
          {feedback.message}
        </Alert>
      )}

      {/* KPI Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Personel
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
                {totalEmployees}
              </Typography>
              <Typography variant="caption" sx={{ color: '#018730', fontWeight: 600, mt: 0.5, display: 'block' }}>
                Pegawai &amp; Trainee aktif
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #BBF7D0', bgcolor: '#F0FDF4', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                Karyawan Tetap (PKWTT)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803D', mt: 0.5 }}>
                {totalPkwtt}
              </Typography>
              <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 600, mt: 0.5, display: 'block' }}>
                Permanen PT ITSP
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #BAE6FD', bgcolor: '#F0F9FF', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 700, textTransform: 'uppercase' }}>
                Karyawan Kontrak (PKWT)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0284C7', mt: 0.5 }}>
                {totalPkwt}
              </Typography>
              <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 600, mt: 0.5, display: 'block' }}>
                Dengan masa kontrak
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #FDE68A', bgcolor: '#FFFBEB', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>
                Peserta Magang (Trainee)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#D97706', mt: 0.5 }}>
                {totalTrainee}
              </Typography>
              <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 600, mt: 0.5, display: 'block' }}>
                Program Pemagangan
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid #FECACA', bgcolor: expiringSoon > 0 ? '#FEF2F2' : '#FFFFFF', height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 700, textTransform: 'uppercase' }}>
                Kontrak Habis (&le; 30 Hari)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: expiringSoon > 0 ? '#DC2626' : '#64748B', mt: 0.5 }}>
                {expiringSoon}
              </Typography>
              <Typography variant="caption" sx={{ color: expiringSoon > 0 ? '#DC2626' : '#64748B', fontWeight: 600, mt: 0.5, display: 'block' }}>
                Perlu evaluasi perpanjangan
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter & Search Bar */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Cari nama karyawan, nomor ID (1530.09.26), NIK KTP, atau jabatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <TextField
              fullWidth
              select
              size="small"
              label="Filter Departemen"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <MenuItem value="">Semua Departemen</MenuItem>
              {departmentOptions.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
            <TextField
              fullWidth
              select
              size="small"
              label="Status Hubungan Kerja"
              value={contractFilter}
              onChange={(e) => setContractFilter(e.target.value)}
            >
              <MenuItem value="">Semua Karyawan Aktif</MenuItem>
              <MenuItem value="PKWTT">PKWTT (Karyawan Tetap)</MenuItem>
              <MenuItem value="PKWT">PKWT (Karyawan Kontrak)</MenuItem>
              <MenuItem value="Trainee">Trainee (Peserta Pemagangan)</MenuItem>
              <MenuItem value="Expatriate">Expatriate (Tenaga Asing)</MenuItem>
            </TextField>
          </Grid>
          {/* Filter: Status Karyawan (Aktif / Keluar) */}
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              fullWidth
              select
              size="small"
              label="Status Karyawan"
              value={employeeStatusFilter}
              onChange={(e) => {
                setEmployeeStatusFilter(e.target.value);
                setPage(0);
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  ...(employeeStatusFilter === 'resign' && {
                    '& fieldset': { borderColor: '#DC2626' },
                    bgcolor: '#FFF5F5',
                  }),
                },
              }}
            >
              <MenuItem value="">Karyawan Aktif</MenuItem>
              <MenuItem value="resign" sx={{ color: '#DC2626', fontWeight: 700 }}>⚠ Karyawan Keluar / Tidak Aktif</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Table */}
      <Paper elevation={0} className="notranslate" translate="no" sx={{ borderRadius: 2.5, border: '1px solid #E2E8F0', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <TableContainer>
          <Table sx={{ minWidth: 900 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#334155', py: 2, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setSortOrder((s) => s === 'asc' ? 'desc' : 'asc')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    ID Karyawan
                    {sortOrder === 'asc'
                      ? <ArrowUpwardIcon sx={{ fontSize: 15, color: '#018730' }} />
                      : <ArrowDownwardIcon sx={{ fontSize: 15, color: '#018730' }} />}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#334155', py: 2 }}>Nama &amp; Data Pribadi</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#334155', py: 2 }}>Jabatan &amp; Departemen</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#334155', py: 2 }}>Status Hubungan Kerja</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#334155', py: 2 }}>Masa Kontrak &amp; Masa Kerja</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#334155', py: 2 }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={36} sx={{ color: '#018730', mb: 1.5 }} />
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      Memuat daftar data karyawan...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <BadgeIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#475569' }}>
                      Belum Ada Data Karyawan
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8', maxWidth: 460, mx: 'auto', mt: 0.5 }}>
                      Saat calon karyawan menandatangani kontrak fisik di Tahap 7 pada halaman Pelamar, tekan tombol <strong>&quot;Sudah Tanda Tangan Kontrak&quot;</strong> untuk otomatis memasukkannya ke sini.
                    </Typography>
                    <Button
                      component={Link}
                      href="/admin/applicants"
                      variant="outlined"
                      sx={{ mt: 2, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                    >
                      Buka Kelola Pelamar
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                employees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((emp) => {
                  const rem = getDaysRemaining(emp.contract_end_date);
                  const isPermanent = emp.contract_status === 'PKWTT';
                  const isTrainee = emp.contract_status === 'Trainee';
                  const isExpat = emp.contract_status === 'Expatriate';
                  const isExpiring = !isPermanent && !isTrainee && rem !== null && rem <= 30;
                  const isResigned = emp.employee_status === 'resign';

                  return (
                    <TableRow key={emp.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* ID Karyawan Column */}
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.8,
                            bgcolor: isTrainee ? '#FFFBEB' : '#0F172A',
                            color: isTrainee ? '#B45309' : '#FFFFFF',
                            borderRadius: 1.5,
                            px: 1.2,
                            py: 0.6,
                            border: `1px solid ${isTrainee ? '#FCD34D' : '#334155'}`,
                          }}
                        >
                          {isTrainee ? (
                            <SchoolIcon sx={{ color: '#D97706', fontSize: 16 }} />
                          ) : (
                            <BadgeIcon sx={{ color: '#4ADE80', fontSize: 16 }} />
                          )}
                          <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.8px' }}>
                            {emp.employee_id}
                          </Typography>
                        </Box>
                        {emp.level && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#334155', fontWeight: 800, fontSize: 11, mt: 0.4 }}>
                            Level: <strong>{emp.level}</strong>
                          </Typography>
                        )}
                        {isTrainee && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#D97706', fontWeight: 800, fontSize: 10, mt: 0.2 }}>
                            PEMAGANGAN
                          </Typography>
                        )}
                      </TableCell>

                      {/* Nama & Data Pribadi */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={emp.photo_profile || emp.photo_file || undefined}
                            sx={{
                              width: 42,
                              height: 42,
                              bgcolor: isTrainee ? '#FEF3C7' : '#E2E8F0',
                              color: isTrainee ? '#B45309' : '#0F172A',
                              fontWeight: 800,
                              fontSize: 14,
                            }}
                          >
                            {emp.full_name?.charAt(0) || 'K'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                              {emp.full_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#475569', display: 'block' }}>
                              NIK: <strong>{emp.national_id || emp.nik || '-'}</strong> • <strong>{emp.age ? `${emp.age} Thn` : '-'}</strong> • {emp.gender === 'male' || emp.gender === 'Laki-laki' ? 'L' : 'P'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {emp.phone || emp.email || '-'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Jabatan & Departemen */}
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {emp.job_title || '-'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#475569', display: 'block' }}>
                          Divisi: <strong>{emp.department || '-'}</strong>{emp.section ? ` • Seksi: ${emp.section}` : ''}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {emp.employee_type ? `${emp.employee_type} • ` : ''}{emp.factory_office || emp.work_location || 'Plant 1 KIIC Karawang'}
                        </Typography>
                      </TableCell>

                      {/* Status Kontrak */}
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.4 }}>
                          {isResigned ? (
                            <Chip
                              size="small"
                              label="Keluar / Tidak Aktif"
                              sx={{
                                fontWeight: 800,
                                fontSize: 11,
                                bgcolor: '#FEE2E2',
                                color: '#B91C1C',
                                border: '1px solid #FECACA',
                              }}
                            />
                          ) : (
                            <Chip
                              size="small"
                              icon={isTrainee ? <SchoolIcon sx={{ fontSize: '13px !important', color: '#B45309' }} /> : undefined}
                              label={
                                isPermanent
                                  ? 'PKWTT (Tetap)'
                                  : isTrainee
                                  ? (emp.contract_status || 'Trainee')
                                  : isExpat
                                  ? 'Expatriate'
                                  : (emp.contract_status || 'PKWT')
                              }
                              sx={{
                                fontWeight: 800,
                                fontSize: 11,
                                bgcolor: isPermanent
                                  ? '#DCFCE7'
                                  : isTrainee
                                  ? '#FEF3C7'
                                  : isExpat
                                  ? '#F3E8FF'
                                  : '#E0F2FE',
                                color: isPermanent
                                  ? '#15803D'
                                  : isTrainee
                                  ? '#B45309'
                                  : isExpat
                                  ? '#7E22CE'
                                  : '#0369A1',
                                border: `1px solid ${
                                  isPermanent
                                    ? '#86EFAC'
                                    : isTrainee
                                    ? '#FCD34D'
                                    : isExpat
                                    ? '#DDD6FE'
                                    : '#BAE6FD'
                                }`,
                              }}
                            />
                          )}
                          {!isResigned && emp.contract_sequence && emp.contract_sequence > 1 && (
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: 10 }}>
                              Kontrak Ke-{emp.contract_sequence}
                            </Typography>
                          )}
                          {isResigned && emp.exit_reason && (
                            <Typography variant="caption" sx={{ color: '#B91C1C', fontWeight: 600, fontSize: 10, maxWidth: 160, whiteSpace: 'normal', lineHeight: 1.3 }}>
                              {emp.exit_reason}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* Masa Kontrak & Masa Kerja */}
                      <TableCell>
                        {isResigned ? (
                          <>
                            <Typography variant="caption" sx={{ color: '#334155', display: 'block', fontWeight: 600 }}>
                              Bergabung: <strong>{emp.join_date ? new Date(emp.join_date).toLocaleDateString('id-ID') : '-'}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#B91C1C', display: 'block', fontWeight: 700 }}>
                              Keluar: <strong>{emp.exit_date ? new Date(emp.exit_date).toLocaleDateString('id-ID') : (emp.contract_end_date ? new Date(emp.contract_end_date).toLocaleDateString('id-ID') : '-')}</strong>
                            </Typography>
                            {emp.years_of_service != null && (
                              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mt: 0.2 }}>
                                Masa Kerja: {emp.years_of_service} Thn
                              </Typography>
                            )}
                          </>
                        ) : (
                          <>
                            <Typography variant="caption" sx={{ color: '#334155', display: 'block', fontWeight: 600 }}>
                              Mulai: <strong>{emp.join_date ? new Date(emp.join_date).toLocaleDateString('id-ID') : (emp.contract_start_date ? new Date(emp.contract_start_date).toLocaleDateString('id-ID') : '-')}</strong>
                            </Typography>
                            {isPermanent ? (
                              <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 800, display: 'block' }}>
                                Karyawan Tetap
                              </Typography>
                            ) : isTrainee ? (
                              <Typography variant="caption" sx={{ color: '#B45309', fontWeight: 700, display: 'block' }}>
                                Selesai Magang: <strong>{emp.contract_end_date ? new Date(emp.contract_end_date).toLocaleDateString('id-ID') : '-'}</strong>
                              </Typography>
                            ) : (
                              <>
                                <Typography variant="caption" sx={{ color: '#334155', display: 'block' }}>
                                  Selesai: <strong>{emp.contract_end_date ? new Date(emp.contract_end_date).toLocaleDateString('id-ID') : '-'}</strong>
                                </Typography>
                                {rem !== null && (
                                  <Chip
                                    size="small"
                                    icon={isExpiring ? <WarningIcon sx={{ fontSize: '13px !important' }} /> : undefined}
                                    label={rem > 0 ? `${rem} Hari Tersisa` : 'Masa Kontrak Berakhir'}
                                    sx={{
                                      height: 20,
                                      fontSize: 10,
                                      fontWeight: 800,
                                      mt: 0.4,
                                      bgcolor: rem <= 0 ? '#FEE2E2' : isExpiring ? '#FEF3C7' : '#F1F5F9',
                                      color: rem <= 0 ? '#B91C1C' : isExpiring ? '#B45309' : '#475569',
                                    }}
                                  />
                                )}
                              </>
                            )}
                            {emp.years_of_service != null && (
                              <Typography variant="caption" sx={{ color: '#018730', fontWeight: 800, display: 'block', mt: 0.4 }}>
                                Masa Kerja: {emp.years_of_service} Thn
                              </Typography>
                            )}
                          </>
                        )}
                      </TableCell>

                      {/* Aksi */}
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                          <Tooltip title="Lihat Profil Lengkap & Dokumen Berkas">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedEmp(emp);
                                setDetailTab(0);
                                setDetailModalOpen(true);
                              }}
                              sx={{ color: '#0284C7' }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Perbarui / Perpanjang Masa Kontrak">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditModal(emp)}
                              sx={{ color: '#018730' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Tandai Karyawan Keluar / Habis Kontrak">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEmpToTerminate(emp);
                                setTerminateReason('Habis Kontrak (Tidak Diperpanjang)');
                                setTerminateDate(new Date().toISOString().substring(0, 10));
                                setTerminateNotes('');
                                setTerminateModalOpen(true);
                              }}
                              sx={{ color: '#D97706', '&:hover': { bgcolor: '#FEF3C7' } }}
                            >
                              <ExitToAppIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Hapus Karyawan Ini">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEmpToDelete(emp);
                                setDeleteSingleModalOpen(true);
                              }}
                              sx={{ color: '#DC2626', '&:hover': { bgcolor: '#FEE2E2' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <KarirTablePagination
          count={employees.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>

      {/* MODAL 1: ATUR NOMOR URUT TERAKHIR ID KARYAWAN */}
      <Dialog open={sequenceModalOpen} onClose={() => setSequenceModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#0F172A', color: '#FFFFFF', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon sx={{ color: '#4ADE80' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 17, color: '#FFFFFF' }}>
                Atur Nomor Urut Terakhir ID Karyawan
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setSequenceModalOpen(false)} sx={{ color: '#94A3B8' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, bgcolor: '#F8FAFC' }}>
          {seqFeedback && (
            <Alert severity={seqFeedback.startsWith('✓') ? 'success' : 'error'} sx={{ mb: 2 }}>
              {seqFeedback}
            </Alert>
          )}

          <Typography variant="body2" sx={{ color: '#334155', mb: 2 }}>
            Sistem penomoran ID Karyawan resmi PT ITSP menggunakan format <strong>{'{ID}.{Bulan}.{Tahun}'}</strong> (contoh: <code>1530.09.26</code>). Nomor ID diurutkan secara runut di database. Jika Anda ingin melanjutkan dari nomor urut tertentu dari sistem lama atau file Excel, Anda dapat mengubah angka counter terakhir di bawah:
          </Typography>

          <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.5 }}>
                Nomor Urut Terakhir di Database Saat Ini:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'monospace', color: '#018730' }}>
                {currentDbSeq}
              </Typography>
            </Box>

            <TextField
              fullWidth
              type="number"
              label="Ubah Nomor Urut Terakhir Menjadi"
              value={lastSeqInput}
              onChange={(e) => setLastSeqInput(parseInt(e.target.value) || 0)}
              helperText="Karyawan berikutnya yang ditambahkan akan otomatis mendapatkan nomor urut: (Nomor Terakhir + 1)."
            />
          </Paper>

          <Alert severity="info" sx={{ bgcolor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Typography variant="caption" sx={{ color: '#1E40AF', display: 'block', fontWeight: 600 }}>
              Contoh: Jika Anda memasukkan angka <strong>1529</strong>, maka calon karyawan berikutnya yang diangkat di bulan September 2026 akan otomatis menerima ID Karyawan: <strong>1530.09.26</strong>.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#F1F5F9' }}>
          <Button onClick={() => setSequenceModalOpen(false)}>Tutup</Button>
          <Button
            variant="contained"
            onClick={handleSaveSequence}
            disabled={savingSeq}
            sx={{ bgcolor: '#018730', fontWeight: 700, '&:hover': { bgcolor: '#005c21' } }}
          >
            {savingSeq ? 'Menyimpan...' : 'Simpan Penyesuaian'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 2: EDIT LENGKAP PROFIL, FOTO & KONTRAK KARYAWAN */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth className="notranslate" translate="no">
        <DialogTitle sx={{ bgcolor: '#0F172A', color: '#FFFFFF', pb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                src={editPhoto || selectedEmp?.photo_profile || undefined}
                sx={{ width: 44, height: 44, bgcolor: '#018730', fontWeight: 800, border: '2px solid #4ADE80' }}
              >
                {editFullName?.charAt(0) || selectedEmp?.full_name?.charAt(0) || 'K'}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 18, color: '#FFFFFF' }}>
                  Edit Data Karyawan: {editFullName || selectedEmp?.full_name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#4ADE80', fontFamily: 'monospace', fontWeight: 800 }}>
                  ID Karyawan: {selectedEmp?.employee_id} • Status: {editContractStatus}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setEditModalOpen(false)} sx={{ color: '#94A3B8' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#F8FAFC' }}>
          <Tabs
            value={editTab}
            onChange={(_, val) => setEditTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              px: 2,
              '& .MuiTabs-scrollButtons': {
                color: '#0F172A',
                '&.Mui-disabled': { opacity: 0.3 }
              }
            }}
          >
            <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Data Diri & Foto" />
            <Tab icon={<BusinessIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Kepegawaian & Kontrak" />
            <Tab icon={<HomeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Alamat & Pendidikan" />
            <Tab icon={<FamilyIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Pajak, Bank & Keluarga" />
          </Tabs>
        </Box>

        <DialogContent dividers sx={{ p: 3, maxHeight: '68vh', overflowY: 'auto', bgcolor: '#FFFFFF' }}>
          {/* TAB 0: DATA DIRI & FOTO */}
          {editTab === 0 && (
            <Stack spacing={2.5}>
              {/* Upload Foto Profil */}
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
                  <Avatar
                    src={editPhoto || undefined}
                    sx={{ width: 72, height: 72, bgcolor: '#018730', fontWeight: 800, fontSize: 24, border: '2px solid #CBD5E1' }}
                  >
                    {editFullName?.charAt(0) || 'K'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      Foto Profil Karyawan
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5 }}>
                      Format JPG/PNG/WEBP, maksimal ukuran 3 MB. Foto ini akan muncul pada kartu ID dan arsip dokumen resmi.
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        component="label"
                        size="small"
                        startIcon={<PhotoCameraIcon />}
                        sx={{ bgcolor: '#018730', fontWeight: 700, textTransform: 'none', borderRadius: 1.5, '&:hover': { bgcolor: '#005c21' } }}
                      >
                        Pilih / Ganti Foto
                        <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
                      </Button>
                      {editPhoto && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => setEditPhoto(null)}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                        >
                          Hapus Foto
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </Paper>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nama Lengkap Karyawan"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="NIK KTP (16 Digit)"
                    value={editNik}
                    onChange={(e) => setEditNik(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 16 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nomor Telepon / WhatsApp"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email Karyawan"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Tempat Lahir"
                    value={editBirthPlace}
                    onChange={(e) => setEditBirthPlace(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Tanggal Lahir"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Usia / Umur (Tahun)"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    select
                    label="Jenis Kelamin"
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                  >
                    <MenuItem value="Laki-laki">Laki-laki</MenuItem>
                    <MenuItem value="Perempuan">Perempuan</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    select
                    label="Agama"
                    value={editReligion}
                    onChange={(e) => setEditReligion(e.target.value)}
                  >
                    <MenuItem value="Islam">Islam</MenuItem>
                    <MenuItem value="Kristen Protestan">Kristen Protestan</MenuItem>
                    <MenuItem value="Katolik">Katolik</MenuItem>
                    <MenuItem value="Hindu">Hindu</MenuItem>
                    <MenuItem value="Buddha">Buddha</MenuItem>
                    <MenuItem value="Konghucu">Konghucu</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Stack>
          )}

          {/* TAB 1: KEPEGAWAIAN & KONTRAK */}
          {editTab === 1 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  disabled
                  label="ID Karyawan Resmi (Generate Sistem)"
                  value={selectedEmp?.employee_id || '-'}
                  helperText="Nomor urut resmi tidak dapat diubah sembarangan."
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Payroll ID / NIK Perusahaan"
                  value={editPayrollId}
                  onChange={(e) => setEditPayrollId(e.target.value)}
                  placeholder="Contoh: 1530"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="Lokasi Plant"
                  value={editPlant}
                  onChange={(e) => setEditPlant(e.target.value)}
                >
                  <MenuItem value="KIIC">KIIC (Karawang International Industry City)</MenuItem>
                  <MenuItem value="Suryacipta">Suryacipta City of Industry</MenuItem>
                  <MenuItem value="Head Office">Head Office</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Departemen"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  placeholder="Contoh: Information Technology"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Seksi / Section"
                  value={editSection}
                  onChange={(e) => setEditSection(e.target.value)}
                  placeholder="Contoh: SYD, Painting, Welding"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Level Karyawan"
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value)}
                  placeholder="Contoh: T9, T8, Staff, Supervisor"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Jabatan / Posisi"
                  value={editJobTitle}
                  onChange={(e) => setEditJobTitle(e.target.value)}
                  placeholder="Contoh: Operator, Leader, Staff"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  select
                  label="Tipe Karyawan"
                  value={editEmployeeType}
                  onChange={(e) => setEditEmployeeType(e.target.value)}
                >
                  <MenuItem value="Direct">Direct</MenuItem>
                  <MenuItem value="Indirect">Indirect</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Status Kontrak"
                  value={editContractStatus}
                  onChange={(e) => setEditContractStatus(e.target.value)}
                >
                  <MenuItem value="PKWT">PKWT (Kontrak Waktu Tertentu)</MenuItem>
                  <MenuItem value="PKWTT">PKWTT (Karyawan Tetap)</MenuItem>
                  <MenuItem value="Trainee">Trainee (Peserta Pemagangan)</MenuItem>
                  <MenuItem value="Expatriate">Expatriate (Tenaga Asing)</MenuItem>
                  <MenuItem value="Probation">Probation (Percobaan)</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Gaji Disepakati / Pokok"
                  value={editSalary}
                  onChange={(e) => setEditSalary(e.target.value)}
                  placeholder="Contoh: Rp 5.257.834"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Tanggal Mulai (Join Date)"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={editJoinDate}
                  onChange={(e) => setEditJoinDate(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Tanggal Berakhir Kontrak"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  helperText="Kosongkan jika Karyawan Tetap (PKWTT)"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Lokasi Penempatan Kerja"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Catatan Kontrak / Referensi Perpanjangan"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Catatan dari HRD mengenai evaluasi atau perpanjangan kontrak"
                />
              </Grid>
            </Grid>
          )}

          {/* TAB 2: ALAMAT & PENDIDIKAN */}
          {editTab === 2 && (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeIcon sx={{ color: '#018730', fontSize: 20 }} /> Alamat Tempat Tinggal
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Alamat Lengkap Sesuai KTP"
                      value={editAddressKtp}
                      onChange={(e) => setEditAddressKtp(e.target.value)}
                      placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Alamat Domisili Sekarang (Tempat Tinggal)"
                      value={editAddressDomicile}
                      onChange={(e) => setEditAddressDomicile(e.target.value)}
                      placeholder="Kosongkan atau ketik sama jika sesuai dengan alamat KTP"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon sx={{ color: '#0284C7', fontSize: 20 }} /> Pendidikan Terakhir
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Jenjang Pendidikan Terakhir"
                      value={editEduLevel}
                      onChange={(e) => setEditEduLevel(e.target.value)}
                      placeholder="Contoh: SMK, SMA, D3, S1"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Nama Sekolah / Perguruan Tinggi"
                      value={editSchool}
                      onChange={(e) => setEditSchool(e.target.value)}
                      placeholder="Contoh: SMKN 1 Karawang"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      label="Jurusan / Program Studi"
                      value={editMajor}
                      onChange={(e) => setEditMajor(e.target.value)}
                      placeholder="Contoh: Teknik Mesin, TKJ, dll"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          )}

          {/* TAB 3: PAJAK, BANK & KELUARGA */}
          {editTab === 3 && (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon sx={{ color: '#018730', fontSize: 20 }} /> Pajak, Jaminan Sosial & Rekening Payroll
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Status Pajak PTKP"
                      value={editPtkp}
                      onChange={(e) => setEditPtkp(e.target.value)}
                      placeholder="Contoh: TK, TK/0, K/0, K/1"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      fullWidth
                      label="Nomor Pokok Wajib Pajak (NPWP)"
                      value={editNpwp}
                      onChange={(e) => setEditNpwp(e.target.value)}
                      placeholder="16 digit NPWP"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Nomor BPJS TK (Jamsostek)"
                      value={editBpjsTk}
                      onChange={(e) => setEditBpjsTk(e.target.value)}
                      placeholder="11 digit BPJS TK"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Nomor Akun (Account No.)"
                      value={editAccountNo}
                      onChange={(e) => setEditAccountNo(e.target.value)}
                      placeholder="Nomor Akun dari Excel"
                      helperText="Data akun master dari file Excel"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Nama Bank Payroll"
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      placeholder="Contoh: BCA, Mandiri, BNI, BRI"
                      helperText="Disiapkan untuk bank penggajian"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Nomor Rekening Bank Payroll"
                      value={editBankAcc}
                      onChange={(e) => setEditBankAcc(e.target.value)}
                      placeholder="No. Rekening Bank"
                      helperText="Disiapkan untuk nomor rekening bank"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FamilyIcon sx={{ color: '#7C3AED', fontSize: 20 }} /> Data Keluarga & Tanggungan
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Nama Ayah Kandung"
                      value={editFather}
                      onChange={(e) => setEditFather(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Nama Ibu Kandung"
                      value={editMother}
                      onChange={(e) => setEditMother(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Nama Pasangan (Suami / Istri)"
                      value={editSpouse}
                      onChange={(e) => setEditSpouse(e.target.value)}
                      placeholder="Kosongkan jika belum menikah"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Jumlah Anggota Keluarga / Tanggungan"
                      value={editFamilyCount}
                      onChange={(e) => setEditFamilyCount(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#F1F5F9', justifyContent: 'space-between' }}>
          <Button onClick={() => setEditModalOpen(false)}>Batal</Button>
          <Button
            variant="contained"
            onClick={handleSaveEditContract}
            disabled={updatingEmp}
            sx={{ bgcolor: '#018730', fontWeight: 700, px: 3, '&:hover': { bgcolor: '#005c21' } }}
          >
            {updatingEmp ? 'Menyimpan...' : 'Simpan Seluruh Data Karyawan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 3: DETAIL PROFIL LENGKAP KARYAWAN (TABS) */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth className="notranslate" translate="no">
        <DialogTitle sx={{ pb: 1, bgcolor: '#0F172A', color: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                src={selectedEmp?.photo_profile || selectedEmp?.photo_file || undefined}
                sx={{ width: 44, height: 44, bgcolor: '#018730', fontWeight: 800 }}
              >
                {selectedEmp?.full_name?.charAt(0) || 'K'}
              </Avatar>
              <Box>
                <Typography variant="h6" className="notranslate" translate="no" sx={{ fontWeight: 800, fontSize: 18, color: '#FFFFFF' }}>
                  {selectedEmp?.full_name}
                </Typography>
                <Typography variant="caption" className="notranslate" translate="no" sx={{ color: '#4ADE80', fontFamily: 'monospace', fontWeight: 800, fontSize: 13 }}>
                  ID: {selectedEmp?.employee_id} • {selectedEmp?.job_title} ({selectedEmp?.department}{selectedEmp?.section ? ` - ${selectedEmp.section}` : ''}){selectedEmp?.level ? ` • Level ${selectedEmp.level}` : ''}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<EditIcon fontSize="small" />}
                onClick={() => {
                  setDetailModalOpen(false);
                  handleOpenEditModal(selectedEmp);
                }}
                sx={{ bgcolor: '#018730', fontWeight: 700, textTransform: 'none', borderRadius: 1.5, '&:hover': { bgcolor: '#005c21' } }}
              >
                Edit Data Lengkap
              </Button>
              <IconButton size="small" onClick={() => setDetailModalOpen(false)} sx={{ color: '#94A3B8' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#F8FAFC' }}>
          <Tabs
            value={detailTab}
            onChange={(_, val) => setDetailTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              px: 2,
              '& .MuiTabs-scrollButtons': {
                color: '#0F172A',
                '&.Mui-disabled': { opacity: 0.3 }
              }
            }}
          >
            <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Data Diri & Alamat" />
            <Tab icon={<BusinessIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Kepegawaian & Kontrak" />
            <Tab icon={<SchoolIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Pendidikan & Pengalaman" />
            <Tab icon={<FamilyIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Keluarga & Darurat" />
            <Tab icon={<DocIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Berkas Dokumen" />
          </Tabs>
        </Box>

        <DialogContent dividers sx={{ p: 3, maxHeight: '68vh', overflowY: 'auto' }}>
          {selectedEmp && (
            <>
              {/* TAB 0: BIODATA & ALAMAT */}
              {detailTab === 0 && (
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>NIK KTP</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedEmp.national_id || selectedEmp.nik || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Usia / Umur</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      {selectedEmp.age ? `${selectedEmp.age} Tahun` : '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Jenis Kelamin</Typography>
                    <Typography variant="body1">{selectedEmp.gender || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Tempat, Tanggal Lahir</Typography>
                    <Typography variant="body1">{selectedEmp.birth_place || '-'}, {selectedEmp.birth_date ? new Date(selectedEmp.birth_date).toLocaleDateString('id-ID') : '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Agama / Status Pernikahan</Typography>
                    <Typography variant="body1">{selectedEmp.religion || '-'} • {selectedEmp.marital_status || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Kontak (HP &amp; WhatsApp)</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#018730' }}>{selectedEmp.phone || '-'}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Email Resmi</Typography>
                    <Typography variant="body1">{selectedEmp.email || '-'}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HomeIcon fontSize="small" sx={{ color: '#018730' }} /> Alamat Sesuai KTP
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155' }}>
                      {selectedEmp.ktp_street_address || '-'} {selectedEmp.ktp_rt_rw && `RT/RW ${selectedEmp.ktp_rt_rw}`}, Kel. {selectedEmp.ktp_kelurahan || '-'}, Kec. {selectedEmp.ktp_kecamatan || '-'}, {selectedEmp.ktp_city || '-'}, {selectedEmp.ktp_province || '-'} {selectedEmp.ktp_postal_code}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HomeIcon fontSize="small" sx={{ color: '#0284C7' }} /> Alamat Domisili
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155' }}>
                      {selectedEmp.domicile_street_address || selectedEmp.ktp_street_address || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {/* TAB 1: KEPEGAWAIAN & KONTRAK */}
              {detailTab === 1 && (
                <Box>
                  {/* Top Key Performance & Career Stats */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                          Masa Kerja (Years of Service)
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#15803D', mt: 0.5 }}>
                          {selectedEmp.years_of_service != null ? `${selectedEmp.years_of_service} Tahun` : '-'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#166534', display: 'block', mt: 0.3 }}>
                          Akumulasi durasi pengabdian kerja
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 700, textTransform: 'uppercase' }}>
                          Status Hubungan Kerja
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0284C7', mt: 0.5 }}>
                          {selectedEmp.contract_status || 'PKWT'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#0369A1', display: 'block', mt: 0.3 }}>
                          {selectedEmp.contract_sequence ? `Tahapan Kontrak ke-${selectedEmp.contract_sequence}` : 'Status Hubungan Kerja'}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>
                          Level &amp; Seksi Penempatan
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#D97706', mt: 0.5 }}>
                          Level: {selectedEmp.level || '-'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#92400E', display: 'block', mt: 0.3 }}>
                          Seksi: {selectedEmp.section || '-'}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Detail Grid */}
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Nomor ID Karyawan</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'monospace', color: '#018730' }}>
                        {selectedEmp.employee_id}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Payroll ID</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#0284C7' }}>
                        {selectedEmp.payroll_id || selectedEmp.employee_id}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Kategori &amp; Lingkungan</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {selectedEmp.employee_type || 'Direct'} ({selectedEmp.factory_office || 'Factory'})
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Lokasi Plant Pabrik</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#D97706' }}>
                        {selectedEmp.plant ? `Plant ${selectedEmp.plant}` : (selectedEmp.work_location || 'Plant 1 KIIC Karawang')}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Jabatan Resmi</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedEmp.job_title || '-'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Departemen / Divisi</Typography>
                      <Typography variant="body1">{selectedEmp.department || '-'}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Status Pajak PTKP</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedEmp.ptkp_status || '-'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Gaji &amp; Kompensasi Disepakati</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: '#018730' }}>{selectedEmp.agreed_salary || selectedEmp.salary || '-'}</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Nomor Akun (Account No.)</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {selectedEmp.account_no || '-'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Rekening Bank Payroll</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: selectedEmp.bank_account_no ? '#018730' : '#64748B' }}>
                        {selectedEmp.bank_account_no ? `${selectedEmp.bank_name ? selectedEmp.bank_name + ' - ' : ''}${selectedEmp.bank_account_no}` : 'Belum diisi (Siap diinput)'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>NPWP &amp; Jamsostek (BPJS TK)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        NPWP: {selectedEmp.npwp || selectedEmp.npwp_number || '-'} <br />
                        BPJS TK: {selectedEmp.bpjs_tk_no || selectedEmp.bpjs_tk_number || '-'}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }}><Divider sx={{ my: 1 }} /></Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Tanggal Mulai Kontrak (Join Date)</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {selectedEmp.join_date ? new Date(selectedEmp.join_date).toLocaleDateString('id-ID', { dateStyle: 'full' }) : (selectedEmp.contract_start_date ? new Date(selectedEmp.contract_start_date).toLocaleDateString('id-ID', { dateStyle: 'full' }) : '-')}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Tanggal Akhir Kontrak</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {selectedEmp.contract_end_date ? new Date(selectedEmp.contract_end_date).toLocaleDateString('id-ID', { dateStyle: 'full' }) : 'Karyawan Tetap (PKWTT)'}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Catatan HR &amp; Registrasi SK</Typography>
                      <Typography variant="body2" sx={{ color: '#334155', bgcolor: '#F8FAFC', p: 1.5, borderRadius: 1.5, mt: 0.5 }}>
                        {selectedEmp.notes || 'Tidak ada catatan tambahan.'}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Contract History Table (K1 - Kn) */}
                  {(() => {
                    const historyList = parseJsonSafe(selectedEmp.contract_history, []);
                    if (!historyList || !Array.isArray(historyList) || historyList.length === 0) return null;
                    return (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HistoryIcon sx={{ color: '#018730', fontSize: 20 }} /> Riwayat Seluruh Tahapan Masa Kontrak (K1 - Kn)
                        </Typography>
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                          <Table size="small">
                            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Tahap Kontrak</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Tanggal Mulai</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Tanggal Selesai</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Status Tahap</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {historyList.map((item: any, idx: number) => {
                                const isCurrent = idx === historyList.length - 1;
                                return (
                                  <TableRow key={idx} sx={{ bgcolor: isCurrent ? '#F0FDF4' : 'inherit' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>
                                      {item.contract_name || `Kontrak ${item.sequence || idx + 1}`}
                                    </TableCell>
                                    <TableCell>
                                      {item.start_date ? new Date(item.start_date).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                                    </TableCell>
                                    <TableCell>
                                      {item.end_date ? new Date(item.end_date).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                                    </TableCell>
                                    <TableCell>
                                      {isCurrent ? (
                                        <Chip size="small" label="Kontrak Berjalan / Aktif" color="success" sx={{ fontWeight: 800, fontSize: 11 }} />
                                      ) : (
                                        <Chip size="small" label="Selesai" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 600, fontSize: 11 }} />
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    );
                  })()}
                </Box>
              )}

              {/* TAB 2: PENDIDIKAN & PENGALAMAN */}
              {detailTab === 2 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon fontSize="small" sx={{ color: '#018730' }} /> Pendidikan Terakhir
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Jenjang</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedEmp.education_level || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Sekolah / Universitas</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedEmp.institution_name || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Jurusan</Typography>
                        <Typography variant="body2">{selectedEmp.major || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Tahun Lulus</Typography>
                        <Typography variant="body2">{selectedEmp.graduation_year || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Nilai / IPK</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedEmp.gpa_or_grade || '-'}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon fontSize="small" sx={{ color: '#0284C7' }} /> Riwayat Pengalaman Kerja
                  </Typography>
                  {(() => {
                    const exps = parseJsonSafe(selectedEmp.work_experiences, []);
                    if (!exps || exps.length === 0) {
                      return <Typography variant="body2" sx={{ color: '#94A3B8' }}>Tidak ada riwayat pengalaman kerja (Fresh Graduate).</Typography>;
                    }
                    return (
                      <Stack spacing={1.5}>
                        {exps.map((e: any, idx: number) => (
                          <Paper key={idx} elevation={0} sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                              {e.company || e.company_name || 'Perusahaan'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#018730', fontWeight: 700, display: 'block' }}>
                              {e.position || e.job_title} ({e.duration || `${e.start_year || ''} - ${e.end_year || ''}`})
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#475569', mt: 0.5, fontSize: 13 }}>
                              {e.description || e.responsibilities || '-'}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    );
                  })()}
                </Box>
              )}

              {/* TAB 3: KELUARGA & KONTAK DARURAT */}
              {detailTab === 3 && (
                <Stack spacing={2.5}>
                  {/* Ringkasan Status Keluarga & PTKP */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                          Status Pajak PTKP
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803D', mt: 0.5 }}>
                          {selectedEmp.ptkp_status || selectedEmp.marital_status || '-'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#166534' }}>
                          Status perpajakan PPh 21
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#1E40AF', fontWeight: 700, textTransform: 'uppercase' }}>
                          Jumlah Anggota Keluarga
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1D4ED8', mt: 0.5 }}>
                          {selectedEmp.family_members_count != null ? `${selectedEmp.family_members_count} Jiwa` : '-'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#1E40AF' }}>
                          Total tanggungan keluarga
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>
                          Status Pernikahan
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5 }}>
                          {selectedEmp.marital_status || (selectedEmp.spouse_name ? 'Menikah' : 'Belum Menikah')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Sesuai kartu keluarga
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Orang Tua & Pasangan */}
                  <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FamilyIcon sx={{ color: '#018730', fontSize: 20 }} /> Data Orang Tua &amp; Pasangan (Suami / Istri)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Nama Ayah Kandung</Typography>
                        <Typography variant="body1" className="notranslate" translate="no" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {selectedEmp.father_name || '-'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Nama Ibu Kandung</Typography>
                        <Typography variant="body1" className="notranslate" translate="no" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          {selectedEmp.mother_name || '-'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Nama Pasangan (Suami / Istri)</Typography>
                        <Typography variant="body1" className="notranslate" translate="no" sx={{ fontWeight: 700, color: selectedEmp.spouse_name ? '#0284C7' : '#64748B' }}>
                          {selectedEmp.spouse_name || '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Anak-Anak Kandung */}
                  <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ color: '#0284C7', fontSize: 20 }} /> Data Anak Kandung
                    </Typography>
                    {(() => {
                      const children = parseJsonSafe(selectedEmp.family_children, []);
                      if (!Array.isArray(children) || children.length === 0) {
                        return (
                          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            Belum ada data anak kandung yang tercatat.
                          </Typography>
                        );
                      }
                      return (
                        <Grid container spacing={1.5}>
                          {children.map((child: any, idx: number) => {
                            const childName = typeof child === 'string' ? child : (child?.name || `Anak ke-${idx + 1}`);
                            return (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                                <Box sx={{ p: 1.5, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 1.5 }}>
                                  <Typography variant="caption" sx={{ color: '#0369A1', fontWeight: 800, textTransform: 'uppercase' }}>
                                    Anak ke-{idx + 1}
                                  </Typography>
                                  <Typography variant="body2" className="notranslate" translate="no" sx={{ fontWeight: 700, color: '#0F172A', mt: 0.2 }}>
                                    {childName}
                                  </Typography>
                                </Box>
                              </Grid>
                            );
                          })}
                        </Grid>
                      );
                    })()}
                  </Paper>

                  {/* Saudara Kandung */}
                  <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ color: '#7C3AED', fontSize: 20 }} /> Data Saudara Kandung (Kakak / Adik)
                    </Typography>
                    {(() => {
                      const siblings = parseJsonSafe(selectedEmp.family_siblings, []);
                      if (!Array.isArray(siblings) || siblings.length === 0) {
                        return (
                          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                            Tidak ada riwayat saudara kandung tercatat.
                          </Typography>
                        );
                      }
                      return (
                        <Grid container spacing={1.5}>
                          {siblings.map((sibling: any, idx: number) => {
                            const sibName = typeof sibling === 'string' ? sibling : (sibling?.name || `Saudara ke-${idx + 1}`);
                            return (
                              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
                                <Box sx={{ p: 1.5, bgcolor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 1.5 }}>
                                  <Typography variant="caption" sx={{ color: '#7E22CE', fontWeight: 800, textTransform: 'uppercase' }}>
                                    Saudara ke-{idx + 1}
                                  </Typography>
                                  <Typography variant="body2" className="notranslate" translate="no" sx={{ fontWeight: 700, color: '#0F172A', mt: 0.2 }}>
                                    {sibName}
                                  </Typography>
                                </Box>
                              </Grid>
                            );
                          })}
                        </Grid>
                      );
                    })()}
                  </Paper>

                  {/* Informasi Rekening Bank & Jaminan Sosial */}
                  <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5 }}>
                      Nomor Jaminan Sosial, Pajak &amp; Rekening Payroll
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Nomor Akun (Account No.)</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {selectedEmp.account_no || '-'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Rekening Bank Payroll</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: selectedEmp.bank_account_no ? '#018730' : '#64748B' }}>
                          {selectedEmp.bank_account_no ? `${selectedEmp.bank_name ? selectedEmp.bank_name + ' - ' : ''}${selectedEmp.bank_account_no}` : 'Belum diisi'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>Nomor NPWP</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedEmp.npwp || selectedEmp.npwp_number || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>BPJS TK (Jamsostek)</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedEmp.bpjs_tk_no || selectedEmp.bpjs_tk_number || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>BPJS Kesehatan</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedEmp.bpjs_kes_number || '-'}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Kontak Darurat */}
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#DC2626', mb: 1.5 }}>
                      Kontak Darurat Resmi
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 700 }}>Nama Kontak Darurat</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{selectedEmp.emergency_contact_name || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 700 }}>Hubungan</Typography>
                        <Typography variant="body2">{selectedEmp.emergency_contact_relation || '-'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 700 }}>Nomor Telepon Darurat</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#B91C1C' }}>{selectedEmp.emergency_contact_phone || '-'}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Stack>
              )}

              {/* TAB 4: BERKAS DOKUMEN PENDAFTARAN */}
              {detailTab === 4 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                    Arsip Dokumen Fisik / Digital (11 Berkas Pendaftaran):
                  </Typography>

                  <Grid container spacing={2}>
                    {[
                      { title: 'Foto Profil Resmi', file: selectedEmp.photo_profile },
                      { title: 'Scan KTP Asli', file: selectedEmp.ktp_file },
                      { title: 'Scan Kartu Keluarga (KK)', file: selectedEmp.kk_file },
                      { title: 'Ijazah Terakhir', file: selectedEmp.ijazah_file },
                      { title: 'Transkrip Nilai / SKHUN', file: selectedEmp.transcript_file },
                      { title: 'Kartu NPWP', file: selectedEmp.npwp_file },
                      { title: 'BPJS Ketenagakerjaan', file: selectedEmp.bpjs_tk_file },
                      { title: 'BPJS Kesehatan', file: selectedEmp.bpjs_kes_file },
                      { title: 'SKCK Aktif Kepolisian', file: selectedEmp.skck_file },
                      { title: 'Surat Keterangan Sehat / MCU', file: selectedEmp.health_cert_file },
                      { title: 'Sertifikat Keahlian / Pelatihan', file: selectedEmp.certificate_file },
                      { title: 'Berkas Offering & Kontrak TTD', file: selectedEmp.signed_contract_file },
                    ].map((item, idx) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: item.file ? '#BBF7D0' : '#E2E8F0',
                            bgcolor: item.file ? '#F0FDF4' : '#F8FAFC',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                          }}
                        >
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: item.file ? '#166534' : '#64748B', fontSize: 13 }}>
                              {item.title}
                            </Typography>
                            <Chip
                              size="small"
                              label={item.file ? 'Tersedia' : 'Tidak Ada / Null'}
                              sx={{
                                height: 20,
                                fontSize: 10,
                                fontWeight: 800,
                                mt: 0.5,
                                bgcolor: item.file ? '#DCFCE7' : '#E2E8F0',
                                color: item.file ? '#15803D' : '#64748B',
                              }}
                            />
                          </Box>

                          {item.file ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                const w = window.open('');
                                if (item.file.startsWith('data:image')) {
                                  w?.document.write(`<img src="${item.file}" style="max-width:100%;height:auto;display:block;margin:auto;" />`);
                                } else {
                                  w?.document.write(`<iframe src="${item.file}" style="width:100%;height:100%;border:none;"></iframe>`);
                                }
                              }}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: 11,
                                borderColor: '#86EFAC',
                                color: '#166534',
                                '&:hover': { bgcolor: '#DCFCE7' },
                              }}
                            >
                              Buka Dokumen
                            </Button>
                          ) : (
                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                              Tidak diunggah saat pendaftaran
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              setDetailModalOpen(false);
              handleOpenEditModal(selectedEmp);
            }}
            sx={{ bgcolor: '#018730', fontWeight: 700, textTransform: 'none', borderRadius: 1.5, '&:hover': { bgcolor: '#005c21' } }}
          >
            Edit Profil, Foto &amp; Kontrak Karyawan Ini
          </Button>
          <Button onClick={() => setDetailModalOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 3: IMPORT EXCEL MASTER KARYAWAN */}
      <Dialog open={importModalOpen} onClose={() => !importing && setImportModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleImportExcel}>
          <DialogTitle sx={{ bgcolor: '#018730', color: '#FFFFFF', pb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UploadFileIcon />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Import Data Master Karyawan
                </Typography>
              </Box>
              <IconButton onClick={() => setImportModalOpen(false)} sx={{ color: '#FFFFFF' }} disabled={importing}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            {/* Banner Unduh Template */}
            <Box
              sx={{
                p: 2,
                mb: 2.5,
                mt: 0.5,
                borderRadius: 2,
                bgcolor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box sx={{ maxWidth: { xs: '100%', sm: '65%' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
                  Belum memiliki format Excel yang sesuai?
                </Typography>
                <Typography variant="caption" sx={{ color: '#15803D', display: 'block' }}>
                  Unduh template resmi <code>.xlsx</code> yang sudah terkonfigurasi dengan sheet <strong>ITSP</strong> (Karyawan), <strong>Trainee</strong> (Magang), dan sheet <strong>PANDUAN</strong>.
                </Typography>
              </Box>
              <Button
                component="a"
                href="/api/admin/employees/template"
                download="Template_Master_Karyawan_ITSP.xlsx"
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  bgcolor: '#018730',
                  color: '#FFFFFF',
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#005c21' },
                }}
              >
                Unduh Template (.xlsx)
              </Button>
            </Box>

            <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
              Unggah file Excel master karyawan resmi (format <code>.xlsx</code> atau <code>.xls</code>). Sistem akan membaca sheet <strong>ITSP</strong> dan <strong>Trainee</strong> secara otomatis.
            </Typography>

            <Box
              sx={{
                border: '2px dashed #CBD5E1',
                borderRadius: 2.5,
                p: 3,
                textAlign: 'center',
                bgcolor: '#F8FAFC',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#018730', bgcolor: '#F0FDF4' },
              }}
              onClick={() => document.getElementById('excel-file-input')?.click()}
            >
              <input
                id="excel-file-input"
                type="file"
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImportFile(e.target.files[0]);
                  }
                }}
              />
              <UploadFileIcon sx={{ fontSize: 48, color: importFile ? '#018730' : '#94A3B8', mb: 1 }} />
              {importFile ? (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {importFile.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Ukuran: {(importFile.size / 1024 / 1024).toFixed(2)} MB • Klik untuk ganti file
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155' }}>
                    Klik untuk memilih file Excel (.xlsx)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Mendukung file Master Employee PT ITSP
                  </Typography>
                </>
              )}
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                Opsi Tambahan Import:
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeOut}
                    onChange={(e) => setIncludeOut(e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                      Sertakan Data Mantan Karyawan / Alumni (Sheet &quot;Out&quot;)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Status karyawan ini akan ditandai sebagai &quot;resign&quot; di sistem.
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start', mb: 1 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={replaceAll}
                    onChange={(e) => setReplaceAll(e.target.checked)}
                    color="error"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#DC2626' }}>
                      Bersihkan / Reset Semua Data Lama Terlebih Dahulu
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Pilih opsi ini jika Anda ingin mengosongkan database terlebih dahulu dan menimpa dengan file baru.
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: 'flex-start' }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, bgcolor: '#F1F5F9', justifyContent: 'space-between' }}>
            <Button onClick={() => setImportModalOpen(false)} disabled={importing} sx={{ color: '#64748B' }}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!importFile || importing}
              startIcon={importing ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <UploadFileIcon />}
              sx={{ bgcolor: '#018730', fontWeight: 800, '&:hover': { bgcolor: '#005c21' } }}
            >
              {importing ? 'Mengimpor Data...' : 'Mulai Import Data'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* MODAL 4: HAPUS SELURUH DATA KARYAWAN */}
      <Dialog open={deleteAllModalOpen} onClose={() => !deletingAll && setDeleteAllModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#DC2626', color: '#FFFFFF', pb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeleteSweepIcon />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Konfirmasi Hapus Seluruh Data Karyawan
              </Typography>
            </Box>
            <IconButton onClick={() => setDeleteAllModalOpen(false)} sx={{ color: '#FFFFFF' }} disabled={deletingAll}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2.5, mt: 1, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
              PERINGATAN KRUSIAL!
            </Typography>
            Tindakan ini akan <strong>menghapus permanen seluruh ({employees.length}) data karyawan</strong> dari database sistem. Data yang sudah dihapus tidak dapat dipulihkan.
          </Alert>

          <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
            Fitur ini digunakan jika Anda ingin mereset total database karyawan karena data tidak sesuai, atau ingin mengimpor ulang dari file Excel master yang baru.
          </Typography>

          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1 }}>
            Untuk mengonfirmasi, ketik teks: <strong style={{ color: '#DC2626' }}>HAPUS SEMUA</strong>
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="Ketik HAPUS SEMUA"
            value={confirmDeleteAllText}
            onChange={(e) => setConfirmDeleteAllText(e.target.value)}
            disabled={deletingAll}
            autoFocus
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', justifyContent: 'space-between' }}>
          <Button onClick={() => setDeleteAllModalOpen(false)} disabled={deletingAll} sx={{ color: '#64748B' }}>
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={confirmDeleteAllText !== 'HAPUS SEMUA' || deletingAll}
            onClick={handleDeleteAllEmployees}
            startIcon={deletingAll ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <DeleteSweepIcon />}
            sx={{ fontWeight: 800 }}
          >
            {deletingAll ? 'Menghapus Seluruh Data...' : 'Kosongkan Seluruh Data Karyawan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 5: HAPUS KARYAWAN TUNGGAL */}
      <Dialog open={deleteSingleModalOpen} onClose={() => !deletingSingle && setDeleteSingleModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: '#DC2626', color: '#FFFFFF', pb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Hapus Data Karyawan
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ color: '#0F172A', mb: 1, mt: 1 }}>
            Apakah Anda yakin ingin menghapus data karyawan berikut?
          </Typography>
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
              {empToDelete?.full_name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              ID: <code>{empToDelete?.employee_id}</code> • Dept: {empToDelete?.department}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              Jabatan: {empToDelete?.job_title}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 600 }}>
            Catatan: Data ini akan dihapus permanen dari daftar master karyawan.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', justifyContent: 'space-between' }}>
          <Button onClick={() => setDeleteSingleModalOpen(false)} disabled={deletingSingle} sx={{ color: '#64748B' }}>
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteSingleEmployee}
            disabled={deletingSingle}
            startIcon={deletingSingle ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <DeleteIcon />}
            sx={{ fontWeight: 800 }}
          >
            {deletingSingle ? 'Menghapus...' : 'Hapus Karyawan'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* MODAL: TANDAI KARYAWAN KELUAR */}
      <Dialog open={terminateModalOpen} onClose={() => !terminating && setTerminateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#92400E', color: '#FFFFFF', pb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ExitToAppIcon />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 17 }}>Tandai Karyawan Keluar</Typography>
            </Box>
            <IconButton size="small" onClick={() => setTerminateModalOpen(false)} sx={{ color: '#FDE68A' }} disabled={terminating}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {empToTerminate && (
            <Box sx={{ p: 2, mb: 2.5, mt: 1, bgcolor: '#FFFBEB', borderRadius: 2, border: '1px solid #FCD34D' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E' }}>{empToTerminate.full_name}</Typography>
              <Typography variant="caption" sx={{ color: '#78350F', display: 'block' }}>
                {empToTerminate.employee_id} • {empToTerminate.department} • {empToTerminate.job_title}
              </Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="Alasan Keluar *"
                size="small"
                value={terminateReason}
                onChange={(e) => setTerminateReason(e.target.value)}
              >
                <MenuItem value="Habis Kontrak (Tidak Diperpanjang)">Habis Kontrak (Tidak Diperpanjang)</MenuItem>
                <MenuItem value="Pengunduran Diri (Resign)">Pengunduran Diri (Resign)</MenuItem>
                <MenuItem value="PHK (Pemutusan Hubungan Kerja)">PHK (Pemutusan Hubungan Kerja)</MenuItem>
                <MenuItem value="Selesai Magang">Selesai Magang</MenuItem>
                <MenuItem value="Meninggal Dunia">Meninggal Dunia</MenuItem>
                <MenuItem value="Pensiun">Pensiun</MenuItem>
                <MenuItem value="Lainnya">Lainnya</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="date"
                label="Tanggal Keluar / Berakhir Kontrak *"
                size="small"
                value={terminateDate}
                onChange={(e) => setTerminateDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Catatan Tambahan (Opsional)"
                size="small"
                placeholder="Misal: Karyawan mengundurkan diri karena alasan pribadi..."
                value={terminateNotes}
                onChange={(e) => setTerminateNotes(e.target.value)}
              />
            </Grid>
          </Grid>

          <Alert severity="info" sx={{ mt: 2, bgcolor: '#FEF9C3', border: '1px solid #FDE047' }}>
            <Typography variant="caption" sx={{ color: '#78350F', fontWeight: 600 }}>
              Data karyawan ini akan ditandai sebagai <strong>Karyawan Keluar</strong> dan disimpan dalam riwayat sesuai pengaturan retensi. Karyawan tidak akan muncul lagi di daftar aktif.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', justifyContent: 'space-between' }}>
          <Button onClick={() => setTerminateModalOpen(false)} disabled={terminating} sx={{ color: '#64748B' }}>Batal</Button>
          <Button
            variant="contained"
            onClick={handleTerminateEmployee}
            disabled={terminating || !terminateReason || !terminateDate}
            startIcon={terminating ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <ExitToAppIcon />}
            sx={{ fontWeight: 800, bgcolor: '#92400E', '&:hover': { bgcolor: '#78350F' } }}
          >
            {terminating ? 'Memproses...' : 'Konfirmasi Karyawan Keluar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: TAMBAH KARYAWAN BARU */}
      <Dialog open={createModalOpen} onClose={() => !creating && setCreateModalOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleCreateEmployee}>
          <DialogTitle sx={{ bgcolor: '#0F172A', color: '#FFFFFF', pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAddIcon sx={{ color: '#4ADE80' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 17, color: '#FFFFFF' }}>Tambah Karyawan Baru</Typography>
              </Box>
              <IconButton size="small" onClick={() => setCreateModalOpen(false)} sx={{ color: '#94A3B8' }} disabled={creating}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#F8FAFC' }}>
            <Tabs value={createTab} onChange={(_, v) => setCreateTab(v)} sx={{ px: 2 }}>
              <Tab label="Data Pribadi" sx={{ fontWeight: 700, textTransform: 'none', fontSize: 13 }} />
              <Tab label="Data Kepegawaian" sx={{ fontWeight: 700, textTransform: 'none', fontSize: 13 }} />
              <Tab label="Data Keuangan" sx={{ fontWeight: 700, textTransform: 'none', fontSize: 13 }} />
            </Tabs>
          </Box>

          <DialogContent sx={{ p: 3, bgcolor: '#F8FAFC' }}>
            {createTab === 0 && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField required fullWidth size="small" label="Nama Lengkap *" value={createFullName} onChange={(e) => setCreateFullName(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="NIK KTP" value={createNik} onChange={(e) => setCreateNik(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="No. HP / WhatsApp" value={createPhone} onChange={(e) => setCreatePhone(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Email" type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth select size="small" label="Jenis Kelamin" value={createGender} onChange={(e) => setCreateGender(e.target.value)}>
                    <MenuItem value="Laki-laki">Laki-laki</MenuItem>
                    <MenuItem value="Perempuan">Perempuan</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth size="small" label="Tempat Lahir" value={createBirthPlace} onChange={(e) => setCreateBirthPlace(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth size="small" type="date" label="Tanggal Lahir" value={createBirthDate} onChange={(e) => setCreateBirthDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth select size="small" label="Agama" value={createReligion} onChange={(e) => setCreateReligion(e.target.value)}>
                    {['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
            )}

            {createTab === 1 && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField required fullWidth size="small" label="Departemen *" value={createDept} onChange={(e) => setCreateDept(e.target.value)}
                    select
                  >
                    {COMPANY_DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField required fullWidth size="small" label="Jabatan / Posisi *" value={createJobTitle} onChange={(e) => setCreateJobTitle(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth size="small" label="Level" value={createLevel} onChange={(e) => setCreateLevel(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth size="small" label="Seksi / Sub-Dept" value={createSection} onChange={(e) => setCreateSection(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth select size="small" label="Tipe Karyawan" value={createEmployeeType} onChange={(e) => setCreateEmployeeType(e.target.value)}>
                    <MenuItem value="Direct">Direct</MenuItem>
                    <MenuItem value="Indirect">Indirect</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth select size="small" label="Status Hubungan Kerja *" value={createContractStatus} onChange={(e) => setCreateContractStatus(e.target.value)}>
                    <MenuItem value="PKWT">PKWT (Kontrak)</MenuItem>
                    <MenuItem value="PKWTT">PKWTT (Tetap)</MenuItem>
                    <MenuItem value="Trainee">Trainee (Magang)</MenuItem>
                    <MenuItem value="Expatriate">Expatriate (Tenaga Asing)</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="Lokasi Kerja" value={createLocation} onChange={(e) => setCreateLocation(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth size="small" type="date" label="Tanggal Mulai / Join Date *" value={createJoinDate} onChange={(e) => setCreateJoinDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
                {createContractStatus !== 'PKWTT' && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth size="small" type="date" label="Tanggal Selesai Kontrak" value={createEndDate} onChange={(e) => setCreateEndDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                  </Grid>
                )}
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth size="small" label="Gaji Disepakati" value={createSalary} onChange={(e) => setCreateSalary(e.target.value)} placeholder="Misal: 4500000" />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth multiline rows={2} size="small" label="Catatan HR" value={createNotes} onChange={(e) => setCreateNotes(e.target.value)} />
                </Grid>
              </Grid>
            )}

            {createTab === 2 && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="No. NPWP" value={createNpwp} onChange={(e) => setCreateNpwp(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth size="small" label="No. BPJS Ketenagakerjaan" value={createBpjsTk} onChange={(e) => setCreateBpjsTk(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth size="small" label="Account No. (Nomor Karyawan Lama)" value={createAccountNo} onChange={(e) => setCreateAccountNo(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth size="small" label="Nama Bank" value={createBankName} onChange={(e) => setCreateBankName(e.target.value)} placeholder="Misal: BRI, BNI, Mandiri" />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth size="small" label="Nomor Rekening Bank" value={createBankAcc} onChange={(e) => setCreateBankAcc(e.target.value)} />
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2.5, bgcolor: '#F1F5F9', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {createTab > 0 && <Button onClick={() => setCreateTab((t) => t - 1)} sx={{ color: '#64748B' }}>← Sebelumnya</Button>}
              {createTab < 2 && <Button onClick={() => setCreateTab((t) => t + 1)} sx={{ color: '#018730', fontWeight: 700 }}>Selanjutnya →</Button>}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setCreateModalOpen(false)} disabled={creating} sx={{ color: '#64748B' }}>Batal</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={creating || !createFullName.trim() || !createDept || !createJobTitle.trim()}
                startIcon={creating ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <PersonAddIcon />}
                sx={{ fontWeight: 800, bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } }}
              >
                {creating ? 'Menyimpan...' : 'Simpan Karyawan Baru'}
              </Button>
            </Box>
          </DialogActions>
        </form>
      </Dialog>

      {/* MODAL: PENGATURAN RETENSI KARYAWAN KELUAR */}
      <Dialog open={retentionModalOpen} onClose={() => !savingRetention && !cleaningRetention && setRetentionModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#4C1D95', color: '#FFFFFF', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneIcon sx={{ color: '#C4B5FD' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 17, color: '#FFFFFF' }}>Pengaturan Retensi Riwayat Keluar</Typography>
            </Box>
            <IconButton size="small" onClick={() => setRetentionModalOpen(false)} sx={{ color: '#C4B5FD' }} disabled={savingRetention || cleaningRetention}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: '#F8FAFC' }}>
          {retentionFeedback && (
            <Alert severity={retentionFeedback.startsWith('✓') ? 'success' : 'error'} sx={{ mb: 2 }}>
              {retentionFeedback}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6 }}>
              <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>Total Riwayat Keluar</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#92400E' }}>{retentionTotalExited}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Card sx={{ borderRadius: 2, border: '1px solid #FECACA', bgcolor: retentionExpiredCount > 0 ? '#FEF2F2' : '#FFFFFF' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 700, display: 'block' }}>Melewati Batas Retensi</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: retentionExpiredCount > 0 ? '#DC2626' : '#64748B' }}>{retentionExpiredCount}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="body2" sx={{ color: '#334155', mb: 2 }}>
            Atur berapa lama riwayat karyawan keluar / habis kontrak disimpan. Setelah melewati batas ini, data dapat dihapus permanen menggunakan tombol <strong>Bersihkan Data Kedaluwarsa</strong>.
          </Typography>

          <TextField
            fullWidth
            select
            size="small"
            label="Masa Simpan Riwayat Keluar"
            value={retentionMonths}
            onChange={(e) => setRetentionMonths(Number(e.target.value))}
            sx={{ mb: 2 }}
          >
            <MenuItem value={1}>1 Bulan</MenuItem>
            <MenuItem value={3}>3 Bulan</MenuItem>
            <MenuItem value={6}>6 Bulan</MenuItem>
            <MenuItem value={12}>1 Tahun (Default)</MenuItem>
            <MenuItem value={24}>2 Tahun</MenuItem>
            <MenuItem value={0}>Selamanya (Tidak Pernah Dihapus)</MenuItem>
          </TextField>

          {retentionExpiredCount > 0 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Ada <strong>{retentionExpiredCount}</strong> data riwayat yang sudah melewati batas retensi dan siap dihapus.
              </Typography>
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#F1F5F9', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleCleanupRetention}
            disabled={retentionExpiredCount === 0 || cleaningRetention || savingRetention}
            startIcon={cleaningRetention ? <CircularProgress size={16} /> : <DeleteSweepIcon />}
            sx={{ fontWeight: 700, fontSize: 12 }}
          >
            {cleaningRetention ? 'Membersihkan...' : `Bersihkan ${retentionExpiredCount} Data Kedaluwarsa`}
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setRetentionModalOpen(false)} disabled={savingRetention || cleaningRetention} sx={{ color: '#64748B' }}>Tutup</Button>
            <Button
              variant="contained"
              onClick={handleSaveRetention}
              disabled={savingRetention || cleaningRetention}
              startIcon={savingRetention ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <SettingsIcon />}
              sx={{ fontWeight: 800, bgcolor: '#4C1D95', '&:hover': { bgcolor: '#3B0764' } }}
            >
              {savingRetention ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
