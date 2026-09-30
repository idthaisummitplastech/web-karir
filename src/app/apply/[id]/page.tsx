'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  INDONESIAN_CITIES,
  PROVINCE_NAMES,
  getCitiesForProvince,
  getDistrictsForCity,
  getVillagesForDistrict,
  getPostalCode,
  matchIndonesianCity,
  parseDukcapilNik,
  INDONESIAN_ACADEMIC_INSTITUTIONS,
  INDONESIAN_MAJORS,
  YEAR_OPTIONS,
  OCCUPATION_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
} from '@/lib/indonesia-regions';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Autocomplete,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Send as SendIcon,
  MarkEmailRead as EmailSentIcon,
  Login as LoginIcon,
  Info as InfoIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  VerifiedUser as VerifiedUserIcon,
  Person as PersonIcon,
  Description as DocumentIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  FamilyRestroom as FamilyIcon,
  CheckCircleOutlined as CheckOutlineIcon,
} from '@mui/icons-material';

const MAX_CV_FILE_SIZE_BYTES = 100 * 1024; // 100 KB strictly for CV
const MAX_DOC_FILE_SIZE_BYTES = 100 * 1024; // 100 KB strictly for all documents

const STEPS = [
  'Unggah Berkas & KTP',
  'Data Pribadi & Alamat',
  'Pendidikan & Pengalaman',
  'Latar Belakang Keluarga',
  'Review & Kirim Lamaran',
];

const GENDER_OPTIONS = ['LAKI-LAKI', 'PEREMPUAN'];

const RELIGION_OPTIONS = [
  'ISLAM',
  'KRISTEN PROTESTAN',
  'KATOLIK',
  'HINDU',
  'BUDDHA',
  'KONGHUCU',
  'LAINNYA',
];

const ETHNIC_OPTIONS = [
  'SUNDA',
  'JAWA',
  'BATAK',
  'MINANG',
  'BETAWI',
  'BUGIS',
  'MELAYU',
  'DAYAK',
  'BALI',
  'MADURA',
  'LAINNYA',
];

const MARRIAGE_OPTIONS = [
  'BELUM MENIKAH',
  'MENIKAH',
  'CERAI HIDUP',
  'CERAI MATI',
];

const EDU_LEVEL_OPTIONS = ['SD', 'SMP', 'SMA/SMK', 'D3', 'D4', 'S1', 'S2', 'S3'];

interface UploadedDoc {
  file: File | null;
  base64: string;
  size: number;
  error?: string | null;
}

// -------------------------------------------------------------
// Dukcapil Official Province & City Codes Reference
// -------------------------------------------------------------
const DUKCAPIL_PROVINCE_MAP: Record<string, string> = {
  '11': 'ACEH', '12': 'SUMATERA UTARA', '13': 'SUMATERA BARAT', '14': 'RIAU', '15': 'JAMBI',
  '16': 'SUMATERA SELATAN', '17': 'BENGKULU', '18': 'LAMPUNG', '19': 'KEPULAUAN BANGKA BELITUNG',
  '21': 'KEPULAUAN RIAU', '31': 'DKI JAKARTA', '32': 'JAWA BARAT', '33': 'JAWA TENGAH',
  '34': 'DI YOGYAKARTA', '35': 'JAWA TIMUR', '36': 'BANTEN', '51': 'BALI',
  '52': 'NUSA TENGGARA BARAT', '53': 'NUSA TENGGARA TIMUR', '61': 'KALIMANTAN BARAT',
  '62': 'KALIMANTAN TENGAH', '63': 'KALIMANTAN SELATAN', '64': 'KALIMANTAN TIMUR',
  '65': 'KALIMANTAN UTARA', '71': 'SULAWESI UTARA', '72': 'SULAWESI TENGAH',
  '73': 'SULAWESI SELATAN', '74': 'SULAWESI TENGGARA', '75': 'GORONTALO',
  '76': 'SULAWESI BARAT', '81': 'MALUKU', '82': 'MALUKU UTARA', '91': 'PAPUA BARAT',
  '92': 'PAPUA BARAT DAYA', '94': 'PAPUA',
};

const DUKCAPIL_CITY_MAP: Record<string, string> = {
  '3201': 'BOGOR', '3202': 'SUKABUMI', '3203': 'CIANJUR', '3204': 'BANDUNG', '3205': 'GARUT',
  '3206': 'TASIKMALAYA', '3207': 'CIAMIS', '3208': 'KUNINGAN', '3209': 'CIREBON',
  '3210': 'MAJALENGKA', '3211': 'SUMEDANG', '3212': 'INDRAMAYU', '3213': 'SUBANG',
  '3214': 'PURWAKARTA', '3215': 'KARAWANG', '3216': 'BEKASI', '3217': 'BANDUNG BARAT',
  '3218': 'PANGANDARAN', '3271': 'KOTA BOGOR', '3272': 'KOTA SUKABUMI', '3273': 'KOTA BANDUNG',
  '3274': 'KOTA CIREBON', '3275': 'KOTA BEKASI', '3276': 'KOTA DEPOK', '3277': 'KOTA CIMAHI',
  '3278': 'KOTA TASIKMALAYA', '3279': 'KOTA BANJAR', '3171': 'JAKARTA SELATAN',
  '3172': 'JAKARTA TIMUR', '3173': 'JAKARTA PUSAT', '3174': 'JAKARTA BARAT',
  '3175': 'JAKARTA UTARA', '3601': 'PANDEGLANG', '3602': 'LEBAK', '3603': 'TANGERANG',
  '3604': 'SERANG', '3671': 'KOTA TANGERANG', '3672': 'KOTA CILEGON', '3673': 'KOTA SERANG',
  '3674': 'KOTA TANGERANG SELATAN',
};

interface ParsedKtpData {
  nik: string;
  fullName: string;
  firstName: string;
  lastName: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  religion: string;
  maritalStatus: string;
  address: string;
  street: string;
  rt: string;
  rw: string;
  village: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  ocrFound: boolean;
}

function parseKtpText(text: string): ParsedKtpData {
  const result: ParsedKtpData = {
    nik: '',
    fullName: '',
    firstName: '',
    lastName: '',
    birthPlace: '',
    birthDate: '',
    gender: '',
    religion: '',
    maritalStatus: '',
    address: '',
    street: '',
    rt: '',
    rw: '',
    village: '',
    district: '',
    city: '',
    province: '',
    postalCode: '',
    ocrFound: false,
  };

  if (!text) return result;

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. PROVINSI
  for (const line of lines) {
    if (/PROVINSI/i.test(line)) {
      const p = line.replace(/^[^A-Za-z0-9]*PROVINSI\s*/i, '').replace(/[^A-Za-z\s]/g, '').trim();
      if (p) result.province = p.toUpperCase();
      break;
    }
  }

  // 2. KABUPATEN / KOTA
  for (const line of lines) {
    if (/KABUPATEN|KOTA/i.test(line)) {
      const c = line.replace(/^[^A-Za-z0-9]*(?:KABUPATEN|KOTA)\s*[:;=.\s-]*/i, '').replace(/[^A-Za-z\s]/g, '').trim();
      if (c && !/PROVINSI/i.test(c)) {
        result.city = c.toUpperCase();
        break;
      }
    }
  }

  // 3. TEMPAT & TANGGAL LAHIR (Cari format tanggal DD-MM-YYYY)
  let extractedBirthDate = '';
  for (const line of lines) {
    const dateMatch = line.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
    if (dateMatch && /Tempa|Lahi|Tgl|Tgi/i.test(line)) {
      const day = dateMatch[1];
      const month = dateMatch[2];
      const year = dateMatch[3];
      extractedBirthDate = `${year}-${month}-${day}`;
      result.birthDate = extractedBirthDate;

      // PENTING: Gunakan master data kota Indonesia secara mutlak agar teks label 'TEMPAVTGILAHIR' tidak pernah masuk!
      const matchedCity = matchIndonesianCity(line) || matchIndonesianCity(text);
      if (matchedCity) {
        result.birthPlace = matchedCity.toUpperCase();
      }
      result.ocrFound = true;
      break;
    }
  }

  // Jika tempat lahir belum terdeteksi, scan seluruh teks OCR dengan master data kota
  if (!result.birthPlace) {
    const cityScan = matchIndonesianCity(text);
    if (cityScan) {
      result.birthPlace = cityScan.toUpperCase();
    }
  }

  // 4. JENIS KELAMIN AWAL
  if (/LAKI\s*-?\s*LAKI/i.test(text)) result.gender = 'LAKI-LAKI';
  else if (/PEREMPUAN/i.test(text)) result.gender = 'PEREMPUAN';

  // 5. NIK EXTRACTION & SINKRONISASI DUKCAPIL
  for (const line of lines) {
    if (/NIK|N1K|N!K|N\|K/i.test(line) || /\b\d{14,17}\b/.test(line)) {
      let rawCandidate = line.replace(/^.*?NIK[:;=.\s-]*/i, '').trim();
      rawCandidate = rawCandidate
        .replace(/%/g, '1')
        .replace(/[Oo]/g, '0')
        .replace(/[lI|!]/g, '1')
        .replace(/[Zz]/g, '2')
        .replace(/[Ss]/g, '5')
        .replace(/[Bb]/g, '8')
        .replace(/[gq]/g, '9')
        .replace(/\D/g, '');

      // Hapus angka 1 di depan jika titik dua ':' terbaca sebagai 1 (misal 132152... padahal Jawa Barat = 32)
      if (rawCandidate.startsWith('132') || rawCandidate.startsWith('131') || rawCandidate.startsWith('133') || rawCandidate.startsWith('135') || rawCandidate.startsWith('136')) {
        rawCandidate = rawCandidate.substring(1);
      }

      if (rawCandidate.length >= 14) {
        let potentialNik = rawCandidate.substring(0, 16);
        while (potentialNik.length < 16) {
          potentialNik += '1';
        }

        // Rekonsiliasi segmen tanggal lahir NIK jika tanggal lahir terbaca
        // Laki-laki: DDMMYY (hari <= 31), Perempuan: (DD+40)MMYY (hari > 40)
        if (extractedBirthDate) {
          const [by, bm, bd] = extractedBirthDate.split('-');
          let dayNum = parseInt(bd, 10);
          const isFemale = result.gender === 'PEREMPUAN';
          if (isFemale) dayNum += 40;

          if (potentialNik.length >= 12) {
            const dobSegment = `${String(dayNum).padStart(2, '0')}${bm}${by.substring(2, 4)}`;
            potentialNik = potentialNik.substring(0, 6) + dobSegment + potentialNik.substring(12);
          }
        }

        result.nik = potentialNik;
        result.ocrFound = true;

        // Parse melalui Master Dukcapil
        const dukcapil = parseDukcapilNik(potentialNik);
        if (dukcapil.valid) {
          result.gender = dukcapil.gender;
          if (!result.province && dukcapil.province) result.province = dukcapil.province;
          if (!result.city && dukcapil.city) result.city = dukcapil.city;
          if (!result.district && dukcapil.district) result.district = dukcapil.district;
        } else {
          const nDay = parseInt(potentialNik.substring(6, 8), 10);
          result.gender = nDay > 40 ? 'PEREMPUAN' : 'LAKI-LAKI';
        }
        break;
      }
    }
  }

  // 6. NAMA (Multi-line Support)
  let nameLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^Nama\s*[:;=.-]/i.test(lines[i]) || /Nama/i.test(lines[i])) {
      nameLineIdx = i;
      break;
    }
  }

  if (nameLineIdx !== -1) {
    let nameParts: string[] = [];
    let firstLine = lines[nameLineIdx]
      .replace(/^.*?Nama[:;=.\s-]*/i, '')
      .replace(/[^A-Za-z\s.,']/g, '')
      .trim();

    firstLine = firstLine.replace(/([A-Z]{3,})(AL|EL|BIN|BINTI)$/i, '$1 $2');
    if (firstLine) nameParts.push(firstLine);

    if (nameLineIdx + 1 < lines.length) {
      const nextLine = lines[nameLineIdx + 1];
      if (!/Tempa|Lahi|Tgl|Tgi|NIK|Jenis|Gol|Alamat|Agama/i.test(nextLine)) {
        const cleanedSecondLine = nextLine.replace(/[^A-Za-z\s.,']/g, '').trim();
        if (cleanedSecondLine && cleanedSecondLine.length > 1) {
          nameParts.push(cleanedSecondLine);
        }
      }
    }

    const full = nameParts.join(' ').replace(/\s+/g, ' ').toUpperCase().trim();
    if (full.length >= 2) {
      result.fullName = full;
      result.ocrFound = true;
      const tokens = full.split(' ');
      result.firstName = tokens[0] || '';
      result.lastName = tokens.slice(1).join(' ') || '';
    }
  }

  // 7. AGAMA
  if (/ISLAM/i.test(text)) result.religion = 'ISLAM';
  else if (/KRISTEN/i.test(text)) result.religion = 'KRISTEN PROTESTAN';
  else if (/KATOLIK/i.test(text)) result.religion = 'KATOLIK';
  else if (/HINDU/i.test(text)) result.religion = 'HINDU';
  else if (/BUD/i.test(text)) result.religion = 'BUDDHA';
  else if (/KONG/i.test(text)) result.religion = 'KONGHUCU';

  // 8. STATUS PERKAWINAN
  if (/BELUM\s*KAWIN/i.test(text)) result.maritalStatus = 'BELUM MENIKAH';
  else if (/KAWIN/i.test(text)) result.maritalStatus = 'MENIKAH';
  else if (/CERAI\s*HIDUP/i.test(text)) result.maritalStatus = 'CERAI HIDUP';
  else if (/CERAI\s*MATI/i.test(text)) result.maritalStatus = 'CERAI MATI';

  // 9. ALAMAT (Membersihkan noise K2Z -> K2, 43 X -> 43, dll)
  for (let i = 0; i < lines.length; i++) {
    if (/Alamat/i.test(lines[i])) {
      let streetLine = lines[i]
        .replace(/^.*?Alamat[:;=.\s~-]*/i, '')
        .replace(/^JL\.?\s*/i, 'JL. ')
        .replace(/BLOK/i, ' BLOK ')
        .replace(/NO\.?/i, ' NO. ')
        .replace(/K2Z/gi, 'K2')
        .replace(/\b([A-Z]\d+)[A-Z]\b/gi, '$1')
        .replace(/[^A-Za-z0-9\s.]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (i + 1 < lines.length && !/RT|RW|Kel|Desa|Kecamatan|Kabupaten|Agama/i.test(lines[i + 1])) {
        const nextClean = lines[i + 1].replace(/[^A-Za-z0-9\s]/g, '').trim();
        if (/REGENCY|mEaewcy|GRIYA|INDAH|ASRI|RESIDENCE/i.test(nextClean)) {
          streetLine += ' REGENCY';
        }
      }

      streetLine = streetLine.replace(/\s+[XZ=~-]\s*$/gi, '').trim();
      result.street = streetLine.toUpperCase();
      result.address = result.street;
      break;
    }
  }

  // 10. RT / RW
  const rtrwMatch = text.match(/RT\s*[\/]?[\s]*RW\s*[:;=.\s-]*(\d{1,3})\s*[\/]\s*(\d{1,3})/i);
  if (rtrwMatch) {
    result.rt = rtrwMatch[1].padStart(3, '0');
    result.rw = rtrwMatch[2].padStart(3, '0');
  } else {
    const slashDigits = text.match(/\b(\d{3})\s*[\/]\s*(\d{3})\b/);
    if (slashDigits) {
      result.rt = slashDigits[1];
      result.rw = slashDigits[2];
    }
  }

  // 11. KELURAHAN / DESA
  for (const line of lines) {
    if (/Kel[\/]?Desa|Kelurahan|Desa/i.test(line)) {
      let v = line.replace(/^.*?(?:Kel[\/]?Desa|Kelurahan|Desa)[:;=.\s-]*/i, '').replace(/[^A-Za-z\s]/g, '').trim();
      v = v.replace(/([A-Z]+)(UTARA|SELATAN|BARAT|TIMUR)$/i, '$1 $2');
      if (v) result.village = v.toUpperCase();
      break;
    }
  }

  // 12. KECAMATAN
  for (const line of lines) {
    if (/Kecamatan/i.test(line)) {
      const k = line.replace(/^.*?Kecamatan[:;=.\s-]*/i, '').replace(/[^A-Za-z\s]/g, '').trim();
      if (k) result.district = k.toUpperCase();
      break;
    }
  }

  // 13. KODE POS OTOMATIS
  result.postalCode = getPostalCode(result.district, result.village) || (result.district === 'KOTABARU' ? '41374' : '');

  return result;
}

function validateAndParseNik(nikVal: string) {
  return parseDukcapilNik(nikVal);
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [activeStep, setActiveStep] = useState(0);

  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(jobId || '');
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Status jika pengguna saat ini sudah login sebagai pelamar
  const [activeApplicant, setActiveApplicant] = useState<any | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // -------------------------------------------------------------
  // STEP 1: UPLOAD DOCUMENTS (9 Kategori Sesuai Permintaan)
  // -------------------------------------------------------------
  // 1. Foto
  const [photoDoc, setPhotoDoc] = useState<UploadedDoc>({ file: null, base64: '', size: 0 });
  // 2. KTP
  const [ktpDoc, setKtpDoc] = useState<UploadedDoc>({ file: null, base64: '', size: 0 });
  const [isVerifyingKtp, setIsVerifyingKtp] = useState(false);
  const [ktpVerified, setKtpVerified] = useState(false);
  const [ocrStatusMsg, setOcrStatusMsg] = useState<string | null>(null);
  const [ocrStatusSeverity, setOcrStatusSeverity] = useState<'info' | 'success' | 'warning'>('info');
  const [nikHelperText, setNikHelperText] = useState('16 Digit NIK KTP sesuai Dukcapil');
  const [nikError, setNikError] = useState(false);
  // 3. KK
  const [kkDoc, setKkDoc] = useState<UploadedDoc>({ file: null, base64: '', size: 0 });
  // 4. Cert: Formal (Ijazah + Transkrip) & Non-Formal
  const [ijazahDoc, setIjazahDoc] = useState<UploadedDoc>({ file: null, base64: '', size: 0 });
  const [transkripDoc, setTranskripDoc] = useState<UploadedDoc>({ file: null, base64: '', size: 0 });
  interface NonFormalCertItem {
    id: string;
    name: string;
    file?: File;
    base64: string;
    size: number;
  }
  const [certNonformalList, setCertNonformalList] = useState<NonFormalCertItem[]>([]);
  const [certNonformalError, setCertNonformalError] = useState<string | null>(null);
  // 5. BPJS: Kesehatan & Ketenagakerjaan (Optional)
  const [bpjsKesehatanDoc, setBpjsKesehatanDoc] = useState<UploadedDoc>({ file: null, base64: '', size: 0 });
  const [bpjsKetenagakerjaanDoc, setBpjsKetenagakerjaanDoc] = useState<UploadedDoc>({ file: null, base64: '', size: 0 });
  // 6. NPWP
  const [npwpDoc, setNpwpDoc] = useState<UploadedDoc>({ file: null, base64: '', size: 0 });
  // 7. Akta Kelahiran
  const [aktaDoc, setAktaDoc] = useState<UploadedDoc>({ file: null, base64: '', size: 0 });
  // 8. SKCK
  const [skckDoc, setSkckDoc] = useState<UploadedDoc>({ file: null, base64: '', size: 0 });
  // 9. CV (Strict 100 KB)
  const [cvDoc, setCvDoc] = useState<UploadedDoc>({ file: null, base64: '', size: 0 });

  // -------------------------------------------------------------
  // STEP 2: INPUT FORM DATA PRIBADI (Auto-fill dari KTP)
  // -------------------------------------------------------------
  const [nik, setNik] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('LAKI-LAKI');
  const [religion, setReligion] = useState('ISLAM');
  const [ethnic, setEthnic] = useState('SUNDA');
  const [heightCm, setHeightCm] = useState<number | ''>(168);
  const [weightKg, setWeightKg] = useState<number | ''>(62);
  const [marriageStatus, setMarriageStatus] = useState('BELUM MENIKAH');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState<number | ''>('');

  // Alamat KTP
  const [addressKtp, setAddressKtp] = useState('');
  const [provinceKtp, setProvinceKtp] = useState('JAWA BARAT');
  const [cityKtp, setCityKtp] = useState('KARAWANG');
  const [districtKtp, setDistrictKtp] = useState('');
  const [villageKtp, setVillageKtp] = useState('');
  const [rtKtp, setRtKtp] = useState('');
  const [rwKtp, setRwKtp] = useState('');
  const [streetKtp, setStreetKtp] = useState('');
  const [postalCodeKtp, setPostalCodeKtp] = useState('');

  // Checklist domisili beda
  const [domicileDifferent, setDomicileDifferent] = useState(false);
  const [addressDomicile, setAddressDomicile] = useState('');
  const [provinceDomicile, setProvinceDomicile] = useState('');
  const [cityDomicile, setCityDomicile] = useState('');
  const [districtDomicile, setDistrictDomicile] = useState('');
  const [villageDomicile, setVillageDomicile] = useState('');
  const [rtDomicile, setRtDomicile] = useState('');
  const [rwDomicile, setRwDomicile] = useState('');
  const [streetDomicile, setStreetDomicile] = useState('');
  const [postalCodeDomicile, setPostalCodeDomicile] = useState('');

  // -------------------------------------------------------------
  // STEP 3: RIWAYAT PENDIDIKAN & PENGALAMAN KERJA (Dynamic Add & Trash)
  // -------------------------------------------------------------
  const [educationList, setEducationList] = useState<
    Array<{ id: string; level: string; schoolName: string; major: string; entryYear: string; gradYear: string }>
  >([
    {
      id: '1',
      level: 'SMA/SMK',
      schoolName: '',
      major: '',
      entryYear: '2019',
      gradYear: '2022',
    },
  ]);

  const [workList, setWorkList] = useState<
    Array<{
      id: string;
      company: string;
      position: string;
      startYear: string;
      endYear: string;
      jobDescription: string;
      exitReason: string;
    }>
  >([]);

  const [englishSkill, setEnglishSkill] = useState('Intermediate');
  const [otherLanguages, setOtherLanguages] = useState('');

  // -------------------------------------------------------------
  // STEP 4: LATAR BELAKANG KELUARGA
  // -------------------------------------------------------------
  // Data Orang Tua Kandung
  const [fatherName, setFatherName] = useState('');
  const [fatherBirthYear, setFatherBirthYear] = useState('1970');
  const [fatherEducation, setFatherEducation] = useState('SMA / SMK / MA');
  const [fatherJob, setFatherJob] = useState('WIRASWASTA / PEDAGANG');

  const [motherName, setMotherName] = useState('');
  const [motherBirthYear, setMotherBirthYear] = useState('1975');
  const [motherEducation, setMotherEducation] = useState('SMA / SMK / MA');
  const [motherJob, setMotherJob] = useState('IBU RUMAH TANGGA');

  // Data Saudara Kandung (Kakak & Adik - Seluruh Pelamar)
  const [siblingList, setSiblingList] = useState<
    Array<{
      id: string;
      relation: 'KAKAK KANDUNG' | 'ADIK KANDUNG';
      name: string;
      birthYear: string;
      education: string;
      job: string;
    }>
  >([]);

  // Data Keluarga Sendiri (Pasangan & Anak - Khusus Menikah)
  const [spouseName, setSpouseName] = useState('');
  const [spouseBirthYear, setSpouseBirthYear] = useState('1999');
  const [spouseEducation, setSpouseEducation] = useState('SMA / SMK / MA');
  const [spouseJob, setSpouseJob] = useState('IBU RUMAH TANGGA');
  const [spousePhone, setSpousePhone] = useState('');

  const [childrenList, setChildrenList] = useState<
    Array<{
      id: string;
      name: string;
      birthYear: string;
      gender: 'LAKI-LAKI' | 'PEREMPUAN';
      education: string;
    }>
  >([]);

  // -------------------------------------------------------------
  // SUBMISSION STATE
  // -------------------------------------------------------------
  const [statementAgreed, setStatementAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<any | null>(null);

  // Periksa apakah browser sedang dalam sesi login pelamar aktif
  useEffect(() => {
    fetch('/api/applicant/status')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.applicant) {
          const app = data.applicant;
          const daysOld = (Date.now() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          const isStillActive = app.stageStatus === 'in_progress' && daysOld < 30;
          if (isStillActive) {
            setActiveApplicant(app);
          } else {
            setActiveApplicant(null);
            if (app.fullName) {
              const names = app.fullName.split(' ');
              setFirstName(names[0] || '');
              setLastName(names.slice(1).join(' ') || '');
            }
            if (app.email) setEmail(app.email);
            if (app.phone) setPhone(app.phone);
          }
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleLogoutExisting = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setActiveApplicant(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Jobs
  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs) {
          setJobs(data.jobs);
          if (!selectedJobId && data.jobs.length > 0) {
            setSelectedJobId(data.jobs[0].id.toString());
          }
        }
      })
      .finally(() => setLoadingJobs(false));
  }, []);

  // Hitung Umur dari Tanggal Lahir
  const handleBirthDateChange = (val: string) => {
    setBirthDate(val);
    if (val) {
      const birth = new Date(val);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge > 0 ? calculatedAge : 18);
    } else {
      setAge('');
    }
  };

  // Generic File Upload Handler
  const handleGenericFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<UploadedDoc>>,
    maxSizeBytes: number = MAX_DOC_FILE_SIZE_BYTES,
    isPdfOnly: boolean = false,
    onSuccess?: (file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isPdfOnly && !file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setter({
        file: null,
        base64: '',
        size: 0,
        error: 'Berkas harus dalam format PDF (.pdf). Format lain tidak diperbolehkan.',
      });
      return;
    }

    if (file.size > maxSizeBytes) {
      const maxKb = Math.round(maxSizeBytes / 1024);
      setter({
        file: null,
        base64: '',
        size: file.size,
        error: `Ukuran berkas (${(file.size / 1024).toFixed(1)} KB) melebihi batas maksimal ${maxKb} KB!`,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter({
        file,
        base64: reader.result as string,
        size: file.size,
        error: null,
      });
      if (onSuccess) onSuccess(file);
    };
    reader.readAsDataURL(file);
  };

  // Handler Multi-Upload Sertifikat Non-Formal (Bisa banyak, masing-masing maks 100 KB)
  const handleCertNonformalMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setCertNonformalError(null);

    const newItems: NonFormalCertItem[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_DOC_FILE_SIZE_BYTES) {
        errors.push(`${file.name} (${(file.size / 1024).toFixed(1)} KB) melebihi batas 100 KB`);
        continue;
      }

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newItems.push({
        id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        file,
        base64,
        size: file.size,
      });
    }

    if (errors.length > 0) {
      setCertNonformalError(errors.join(', '));
    }

    if (newItems.length > 0) {
      setCertNonformalList((prev) => [...prev, ...newItems]);
    }
    e.target.value = '';
  };

  const removeCertNonformal = (id: string) => {
    setCertNonformalList((prev) => prev.filter((item) => item.id !== id));
  };

  // Handler Input Manual / Edit NIK dengan Smart Dukcapil Calculator
  const handleNikChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    setNik(clean);

    if (clean.length === 16) {
      const parsed = validateAndParseNik(clean);
      if (parsed.valid && parsed.birthDate) {
        setNikError(false);
        setNikHelperText(`✓ NIK Dukcapil Valid (${parsed.gender}, Tgl Lahir: ${parsed.actualDay}/${parsed.month}/${parsed.year})`);
        
        // Auto set birth date & calculate age
        setBirthDate(parsed.birthDate);
        handleBirthDateChange(parsed.birthDate);
        
        // Auto set gender
        if (parsed.gender) setGender(parsed.gender);

        // Auto set province / city if empty
        if (parsed.province) setProvinceKtp(parsed.province);
        if (parsed.city) setCityKtp(parsed.city);
        if (parsed.district) setDistrictKtp(parsed.district);
      } else {
        setNikError(true);
        setNikHelperText(parsed.error || 'Format NIK tidak valid sesuai standar Dukcapil.');
      }
    } else if (clean.length > 0) {
      setNikError(false);
      setNikHelperText(`${clean.length}/16 digit NIK KTP`);
    } else {
      setNikError(false);
      setNikHelperText('16 Digit NIK KTP sesuai Dukcapil');
    }
  };

  // Handler Khusus Upload KTP dengan AI OCR & Validasi Dukcapil Nyata (Semua Huruf Kapital)
  const handleKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleGenericFileUpload(
      e,
      setKtpDoc,
      MAX_DOC_FILE_SIZE_BYTES,
      false,
      async (file: File) => {
        setIsVerifyingKtp(true);
        setKtpVerified(false);
        setOcrStatusMsg(null);

        // Jika file berupa gambar, jalankan OCR nyata dengan Tesseract
        if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp)$/i.test(file.name)) {
          try {
            const Tesseract = (await import('tesseract.js')).default;
            const res = await Tesseract.recognize(file, 'eng');
            const ocrText = res?.data?.text || '';
            const parsed = parseKtpText(ocrText);

            if (parsed.nik) {
              setNik(parsed.nik);
              setNikError(false);
              setNikHelperText(`✓ NIK Valid Dukcapil (${parsed.gender}, Lahir: ${parsed.birthDate})`);
              if (parsed.birthDate) {
                setBirthDate(parsed.birthDate);
                handleBirthDateChange(parsed.birthDate);
              }
              if (parsed.gender) setGender(parsed.gender.toUpperCase());
              if (parsed.province) setProvinceKtp(parsed.province.toUpperCase());
              if (parsed.city) setCityKtp(parsed.city.toUpperCase());
              if (parsed.district) setDistrictKtp(parsed.district.toUpperCase());
            }

            if (parsed.firstName) {
              setFirstName(parsed.firstName.toUpperCase());
              setLastName(parsed.lastName.toUpperCase());
            }
            if (parsed.birthPlace) setBirthPlace(parsed.birthPlace.toUpperCase());
            if (parsed.religion) setReligion(parsed.religion.toUpperCase());
            if (parsed.maritalStatus) setMarriageStatus(parsed.maritalStatus.toUpperCase());
            if (parsed.street) setStreetKtp(parsed.street.toUpperCase());
            if (parsed.rt) setRtKtp(parsed.rt);
            if (parsed.rw) setRwKtp(parsed.rw);
            if (parsed.village) setVillageKtp(parsed.village.toUpperCase());
            if (parsed.district) setDistrictKtp(parsed.district.toUpperCase());
            if (parsed.address) setAddressKtp(parsed.address.toUpperCase());
            if (parsed.postalCode) setPostalCodeKtp(parsed.postalCode);
            if (parsed.province && !parsed.nik) setProvinceKtp(parsed.province.toUpperCase());
            if (parsed.city && !parsed.nik) setCityKtp(parsed.city.toUpperCase());

            if (parsed.ocrFound) {
              setOcrStatusSeverity('success');
              setOcrStatusMsg('Data e-KTP berhasil dipindai dan dimasukkan otomatis ke formulir dalam huruf KAPITAL. Silakan periksa data Anda.');
            } else {
              setOcrStatusSeverity('info');
              setOcrStatusMsg('Foto e-KTP tersimpan. Silakan lengkapi atau periksa data diri Anda di formulir.');
            }
          } catch (ocrErr) {
            console.warn('Gagal membaca OCR KTP:', ocrErr);
            setOcrStatusSeverity('info');
            setOcrStatusMsg('Berkas e-KTP tersimpan. Silakan lengkapi data kependudukan Anda di formulir.');
          } finally {
            setIsVerifyingKtp(false);
            setKtpVerified(true);
          }
        } else {
          setOcrStatusSeverity('info');
          setOcrStatusMsg('Berkas e-KTP (PDF) tersimpan. Silakan lengkapi data identitas Anda di formulir.');
          setIsVerifyingKtp(false);
          setKtpVerified(true);
        }
      }
    );
  };

  // -------------------------------------------------------------
  // Dynamic List Actions: Pendidikan
  // -------------------------------------------------------------
  const handleAddEducation = () => {
    setEducationList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        level: 'SMA/SMK',
        schoolName: '',
        major: '',
        entryYear: '',
        gradYear: '',
      },
    ]);
  };

  const handleRemoveEducation = (id: string) => {
    if (educationList.length <= 1) {
      alert('Minimal 1 riwayat pendidikan terakhir wajib diisi.');
      return;
    }
    setEducationList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateEducation = (id: string, field: string, val: string) => {
    const finalVal = ['schoolName', 'major'].includes(field) ? val.toUpperCase() : val;
    setEducationList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: finalVal } : item))
    );
  };

  // -------------------------------------------------------------
  // Dynamic List Actions: Pengalaman Kerja
  // -------------------------------------------------------------
  const handleAddWork = () => {
    setWorkList((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        company: '',
        position: '',
        startYear: '2022',
        endYear: '2024',
        jobDescription: '',
        exitReason: '',
      },
    ]);
  };

  const handleRemoveWork = (id: string) => {
    setWorkList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateWork = (id: string, field: string, val: string) => {
    const finalVal = ['company', 'position', 'jobDescription', 'exitReason'].includes(field)
      ? val.toUpperCase()
      : val;
    setWorkList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: finalVal } : item))
    );
  };

  // -------------------------------------------------------------
  // Dynamic List Actions: Saudara Kandung (Kakak & Adik)
  // -------------------------------------------------------------
  const handleAddSibling = () => {
    setSiblingList((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        relation: 'ADIK KANDUNG',
        name: '',
        birthYear: '2002',
        education: 'SMA / SMK / MA',
        job: 'PELAJAR / MAHASISWA',
      },
    ]);
  };

  const handleRemoveSibling = (id: string) => {
    setSiblingList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateSibling = (id: string, field: string, val: string) => {
    const finalVal = ['name'].includes(field) ? val.toUpperCase() : val;
    setSiblingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: finalVal } : item))
    );
  };

  // -------------------------------------------------------------
  // Dynamic List Actions: Data Anak (Khusus Menikah)
  // -------------------------------------------------------------
  const handleAddChild = () => {
    setChildrenList((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: '',
        birthYear: String(new Date().getFullYear()),
        gender: 'LAKI-LAKI',
        education: 'BELUM SEKOLAH',
      },
    ]);
  };

  const handleRemoveChild = (id: string) => {
    setChildrenList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateChild = (id: string, field: string, val: string) => {
    const finalVal = ['name'].includes(field) ? val.toUpperCase() : val;
    setChildrenList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: finalVal } : item))
    );
  };

  // -------------------------------------------------------------
  // Navigation & Step Validation
  // -------------------------------------------------------------
  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 0) {
      if (!cvDoc.base64) {
        setErrorMessage('Berkas CV (.pdf) wajib diunggah (Maksimal 100 KB).');
        return false;
      }
      if (cvDoc.error) {
        setErrorMessage(cvDoc.error);
        return false;
      }
      return true;
    }

    if (step === 1) {
      const full = (firstName + ' ' + lastName).trim();
      if (!full || !email.trim() || !phone.trim() || !birthDate) {
        setErrorMessage('Mohon lengkapi Nama Lengkap, Email Aktif, Nomor HP/WA, dan Tanggal Lahir.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMessage('Format alamat email tidak valid.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      const primaryEdu = educationList[0];
      if (!primaryEdu || !primaryEdu.schoolName.trim()) {
        setErrorMessage('Mohon isi minimal 1 Nama Sekolah/Instansi pendidikan terakhir Anda.');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    setActiveStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // -------------------------------------------------------------
  // Submit Application
  // -------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const full = (firstName + ' ' + lastName).trim();
    if (!full || !email.trim() || !phone.trim() || !birthDate || !cvDoc.base64) {
      setErrorMessage('Mohon lengkapi seluruh data wajib yang bertanda bintang (*).');
      return;
    }

    setSubmitting(true);

    const primaryEdu = educationList[0] || {
      level: 'SMA/SMK',
      schoolName: '-',
      major: '-',
    };

    try {
      const payload = {
        jobPostingId: Number(selectedJobId),
        fullName: full,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        birthDate,
        age: Number(age) || 20,
        birthPlace: birthPlace.trim(),
        gender,
        religion,
        ethnic,
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        marriageStatus,
        lastEducation: primaryEdu.level,
        schoolName: primaryEdu.schoolName.trim() || '-',
        major: primaryEdu.major.trim() || '-',
        experience: workList.length > 0 ? `${workList[0].position} di ${workList[0].company}` : 'Fresh Graduate',
        englishSkill,
        otherLanguages: otherLanguages.trim() || '-',
        // Extended Address
        nik: nik.trim(),
        addressKtp: addressKtp.trim(),
        provinceKtp: provinceKtp.trim(),
        cityKtp: cityKtp.trim(),
        districtKtp: districtKtp.trim(),
        villageKtp: villageKtp.trim(),
        rtKtp: rtKtp.trim(),
        rwKtp: rwKtp.trim(),
        streetKtp: streetKtp.trim(),
        postalCodeKtp: postalCodeKtp.trim(),
        domicileSameAsKtp: !domicileDifferent,
        addressDomicile: domicileDifferent ? addressDomicile.trim() : '',
        provinceDomicile: domicileDifferent ? provinceDomicile.trim() : '',
        cityDomicile: domicileDifferent ? cityDomicile.trim() : '',
        districtDomicile: domicileDifferent ? districtDomicile.trim() : '',
        villageDomicile: domicileDifferent ? villageDomicile.trim() : '',
        rtDomicile: domicileDifferent ? rtDomicile.trim() : '',
        rwDomicile: domicileDifferent ? rwDomicile.trim() : '',
        streetDomicile: domicileDifferent ? streetDomicile.trim() : '',
        postalCodeDomicile: domicileDifferent ? postalCodeDomicile.trim() : postalCodeKtp.trim(),
        // Documents
        photoFile: photoDoc.base64,
        ktpFile: ktpDoc.base64,
        kkFile: kkDoc.base64,
        ijazahFile: ijazahDoc.base64,
        transkripFile: transkripDoc.base64,
        certNonformalFile: certNonformalList.length > 0
          ? JSON.stringify(certNonformalList.map((c) => ({ name: c.name, base64: c.base64, size: c.size })))
          : '',
        bpjsKesehatanFile: bpjsKesehatanDoc.base64,
        bpjsKetenagakerjaanFile: bpjsKetenagakerjaanDoc.base64,
        npwpFile: npwpDoc.base64,
        aktaFile: aktaDoc.base64,
        skckFile: skckDoc.base64,
        cvBase64: cvDoc.base64,
        cvFileSize: cvDoc.size,
        // Structured History & Family
        educationHistory: educationList,
        workHistory: workList,
        familyParents: {
          fatherName: fatherName.trim(),
          fatherBirthYear,
          fatherEducation,
          fatherJob: fatherJob.trim(),
          motherName: motherName.trim(),
          motherBirthYear,
          motherEducation,
          motherJob: motherJob.trim(),
        },
        familySiblings: siblingList,
        familySpouse: marriageStatus === 'MENIKAH' ? {
          name: spouseName.trim(),
          birthYear: spouseBirthYear,
          education: spouseEducation,
          job: spouseJob.trim(),
          phone: spousePhone.trim(),
        } : null,
        familyChildren: marriageStatus === 'MENIKAH' ? childrenList : [],
      };

      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirimkan berkas lamaran kerja.');
      }

      setSuccessInfo(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedJob = jobs.find((j) => j.id.toString() === selectedJobId);

  // Helper render file upload box
  const renderUploadCard = (
    title: string,
    subtitle: string,
    state: UploadedDoc,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    inputId: string,
    accept: string = '.pdf,.jpg,.jpeg,.png',
    isRequired: boolean = false,
    extraBadge?: React.ReactNode
  ) => {
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: '1.5px dashed',
          borderColor: state.error ? '#EF4444' : state.file ? '#10B981' : '#CBD5E1',
          bgcolor: state.error ? '#FEF2F2' : state.file ? '#F0FDF4' : '#FFFFFF',
          transition: 'all 0.2s',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }} className="notranslate" translate="no">
              {title} {isRequired && <span style={{ color: '#EF4444' }}>*</span>}
            </Typography>
            {extraBadge}
          </Box>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5, lineHeight: 1.4 }} className="notranslate" translate="no">
            {subtitle}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <input
            type="file"
            accept={accept}
            id={inputId}
            style={{ display: 'none' }}
            onChange={onChange}
          />
          <label htmlFor={inputId}>
            <Button
              variant={state.file ? 'contained' : 'outlined'}
              size="small"
              component="span"
              className="notranslate"
              translate="no"
              startIcon={<UploadIcon />}
              sx={{
                bgcolor: state.file ? '#10B981' : 'transparent',
                borderColor: state.file ? '#10B981' : '#018730',
                color: state.file ? '#FFFFFF' : '#018730',
                fontWeight: 700,
                borderRadius: 1.5,
                textTransform: 'none',
                fontSize: 13,
                '&:hover': {
                  bgcolor: state.file ? '#059669' : '#F0FDF4',
                  borderColor: state.file ? '#059669' : '#005c21',
                },
              }}
            >
              {state.file ? 'Ganti Berkas' : 'Pilih Berkas'}
            </Button>
          </label>

          {state.file && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, mt: 1 }}>
              <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
              <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 600, wordBreak: 'break-all' }}>
                {state.file.name} ({(state.size / 1024).toFixed(1)} KB)
              </Typography>
            </Box>
          )}

          {state.error && (
            <Typography variant="caption" sx={{ color: '#EF4444', display: 'block', mt: 1, fontWeight: 600 }}>
              {state.error}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 5, flex: 1 }}>
        <Button
          onClick={() => router.push('/#lowongan')}
          startIcon={<ArrowBackIcon />}
          className="notranslate"
          translate="no"
          sx={{ color: '#64748B', fontWeight: 600, mb: 3 }}
        >
          Kembali ke Daftar Lowongan
        </Button>

        {checkingAuth ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#018730' }} />
            <Typography variant="body2" sx={{ color: '#64748B', mt: 2 }}>
              Memeriksa status akun pendaftaran...
            </Typography>
          </Box>
        ) : activeApplicant ? (
          /* JIKA PELAMAR SEDANG LOGIN: TAMPILKAN BLOKIR 1 EMAIL 1 PELAMAR */
          <Card sx={{ borderRadius: 3, border: '2px solid #93C5FD', boxShadow: '0 12px 36px rgba(37, 99, 235, 0.12)' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2.5,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.2)',
                }}
              >
                <InfoIcon sx={{ fontSize: 44 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                Anda Sudah Memiliki Lamaran Terdaftar
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', maxWidth: 600, mx: 'auto', mb: 3, lineHeight: 1.6 }}>
                Halo, <strong>{activeApplicant.fullName}</strong>. Anda saat ini tercatat dalam sistem rekrutmen kami dengan email{' '}
                <strong>{activeApplicant.email}</strong> untuk posisi <strong>{activeApplicant.jobPosting?.title || 'Lamaran Kerja'}</strong>.
              </Typography>

              <Alert severity="info" sx={{ maxWidth: 580, mx: 'auto', textAlign: 'left', mb: 4, borderRadius: 2 }}>
                Sesuai kebijakan resmi rekrutmen PT Indonesia Thai Summit Plastech, <strong>1 alamat email hanya dapat digunakan untuk 1 berkas pelamar</strong>. Anda tidak perlu mendaftar ulang.
              </Alert>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/portal/dashboard')}
                  className="notranslate"
                  translate="no"
                  sx={{
                    bgcolor: '#018730',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    px: 3.5,
                    py: 1.3,
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#005c21' },
                  }}
                >
                  Buka Dashboard Progres Seleksi &rarr;
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={handleLogoutExisting}
                  startIcon={<LogoutIcon />}
                  className="notranslate"
                  translate="no"
                  sx={{ fontWeight: 600, px: 2.5, borderRadius: 2 }}
                >
                  Keluar / Gunakan Akun Lain
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : successInfo ? (
          /* JIKA BERHASIL MENDAFTAR: ALUR WAJIB CEK EMAIL */
          <Card sx={{ borderRadius: 3, border: '2px solid #86EFAC', boxShadow: '0 12px 36px rgba(1, 135, 48, 0.12)' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  bgcolor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2.5,
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
                }}
              >
                <EmailSentIcon sx={{ fontSize: 44 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                Lamaran Kerja Berhasil Dikirim!
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', maxWidth: 620, mx: 'auto', mb: 3.5, lineHeight: 1.6 }}>
                Terima kasih, <strong>{successInfo.applicant.fullName}</strong>. Berkas lamaran Anda untuk posisi{' '}
                <strong>{successInfo.applicant.jobTitle}</strong> telah resmi tercatat di sistem ATS PT Indonesia Thai Summit Plastech.
              </Typography>

              {/* Box Instruksi Cek Email */}
              <Box
                sx={{
                  bgcolor: '#F8FAFC',
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: 2.5,
                  maxWidth: 580,
                  mx: 'auto',
                  textAlign: 'left',
                  mb: 4,
                  border: '1.5px solid #CBD5E1',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <EmailSentIcon sx={{ color: '#018730', fontSize: 26 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Silakan Periksa Email Anda Untuk Kredensial Akun
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#334155', mb: 1.5, lineHeight: 1.6 }}>
                  Sistem kami telah mengirimkan detail kredensial dan <strong>Password Sementara</strong> resmi ke alamat email pendaftaran Anda:
                </Typography>
                <Box
                  sx={{
                    bgcolor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#1E40AF',
                    p: 1.5,
                    borderRadius: 1.5,
                    fontWeight: 700,
                    fontSize: 15,
                    textAlign: 'center',
                    mb: 2,
                    wordBreak: 'break-all',
                  }}
                >
                  {successInfo.applicant.email}
                </Box>
                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, fontSize: 13 }}>
                  • Buka kotak masuk (<strong>Inbox</strong>) email Anda untuk menyalin password sementara.<br />
                  • Jika belum muncul dalam 1–2 menit, mohon periksa folder <strong>Spam</strong> atau <strong>Promosi</strong>.<br />
                  • Gunakan email dan password tersebut untuk login ke Portal Pelamar dan memantau progres 7 tahap seleksi.
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/login')}
                startIcon={<LoginIcon />}
                className="notranslate"
                translate="no"
                sx={{
                  bgcolor: '#018730',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: 16,
                  boxShadow: '0 4px 14px rgba(1, 135, 48, 0.3)',
                  '&:hover': { bgcolor: '#005c21' },
                }}
              >
                Buka Halaman Login Pelamar &rarr;
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            {/* Header Form */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #018730 0%, #005c21 100%)',
                color: '#FFFFFF',
                p: { xs: 3, md: 4 },
                borderBottom: '4px solid #fc4509',
              }}
            >
              <Typography variant="overline" sx={{ color: '#FED7AA', fontWeight: 800, fontSize: 12 }}>
                FORMULIR LAMARAN PEKERJAAN RESMI
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: '-0.02em' }}>
                Formulir Pendaftaran Calon Karyawan
              </Typography>
              <Typography variant="body2" sx={{ color: '#D1FAE5', mt: 1 }}>
                PT Indonesia Thai Summit Plastech • Harap mengisi formulir pendaftaran secara lengkap dan sesuai dengan dokumen asli yang sah.
              </Typography>
            </Box>

            {/* Stepper Progress */}
            <Box sx={{ p: { xs: 2.5, md: 3 }, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {STEPS.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        '& .MuiStepLabel-label': {
                          fontWeight: activeStep === index ? 700 : 500,
                          color: activeStep === index ? '#018730' : '#64748B',
                          fontSize: { xs: 11, sm: 13 },
                        },
                        '& .Mui-active .MuiStepIcon-root': { color: '#018730' },
                        '& .Mui-completed .MuiStepIcon-root': { color: '#10B981' },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              {errorMessage && (
                <Alert
                  severity="error"
                  sx={{ mb: 4, borderRadius: 2 }}
                  action={
                    errorMessage.includes('sudah terdaftar') || errorMessage.includes('1 alamat email') ? (
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => router.push('/login')}
                        className="notranslate"
                        translate="no"
                        sx={{ fontWeight: 700, textDecoration: 'underline' }}
                      >
                        Login Sekarang
                      </Button>
                    ) : undefined
                  }
                >
                  {errorMessage}
                </Alert>
              )}

              {/* Posisi Lowongan (Always Visible at Top of Form) */}
              <Box sx={{ mb: 4, p: 2.5, bgcolor: '#EFF6FF', borderRadius: 2, border: '1px solid #BFDBFE' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E40AF', mb: 1 }}>
                  Posisi Pekerjaan yang Dilamar:
                </Typography>
                <TextField
                  select
                  fullWidth
                  required
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  helperText={selectedJob ? `Departemen: ${selectedJob.department} | Lokasi Penempatan: ${selectedJob.location}` : ''}
                  size="small"
                  sx={{ bgcolor: '#FFFFFF', borderRadius: 1 }}
                >
                  {jobs.map((j) => (
                    <MenuItem key={j.id} value={j.id.toString()}>
                      {j.title} ({j.department})
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <form onSubmit={handleSubmit}>
                {/* ------------------------------------------------------------- */}
                {/* LANGKAH 1: UNGGAH BERKAS DOKUMEN & KTP */}
                {/* ------------------------------------------------------------- */}
                {activeStep === 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <DocumentIcon sx={{ color: '#018730', fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        1. Unggah Dokumen Persyaratan & Scan KTP
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                      Pastikan dokumen yang diunggah jelas, terbaca, dan sah. Sistem akan otomatis memindai dan memverifikasi data kependudukan KTP Anda dengan Dukcapil.
                    </Typography>

                    {/* Banner Dukcapil KTP */}
                    {isVerifyingKtp && (
                      <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ mb: 3, borderRadius: 2 }}>
                        Memindai data e-KTP dengan AI OCR & memverifikasi standar Dukcapil RI...
                      </Alert>
                    )}

                    {ktpVerified && ocrStatusMsg && (
                      <Alert
                        severity={ocrStatusSeverity}
                        icon={ocrStatusSeverity === 'success' ? <VerifiedUserIcon /> : <InfoIcon />}
                        sx={{
                          mb: 3,
                          borderRadius: 2,
                          bgcolor: ocrStatusSeverity === 'success' ? '#ECFDF5' : '#F0F9FF',
                          border: `1px solid ${ocrStatusSeverity === 'success' ? '#86EFAC' : '#BAE6FD'}`,
                        }}
                      >
                        <strong>{ocrStatusSeverity === 'success' ? 'e-KTP Berhasil Terverifikasi!' : 'e-KTP Berhasil Diunggah!'}</strong> {ocrStatusMsg}
                      </Alert>
                    )}

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                      {/* 1. Upload Foto */}
                      {renderUploadCard(
                        '1. Pasfoto Formal (3x4 / 4x6)',
                        'Format JPG/PNG latar merah/biru, maks. 100 KB.',
                        photoDoc,
                        (e) => handleGenericFileUpload(e, setPhotoDoc, MAX_DOC_FILE_SIZE_BYTES, false),
                        'upload-foto-input',
                        'image/*'
                      )}

                      {/* 2. Upload KTP */}
                      {renderUploadCard(
                        '2. KTP Asli (e-KTP)',
                        'Scan/foto e-KTP asli. Auto-fill NIK & Alamat via Dukcapil, maks. 100 KB.',
                        ktpDoc,
                        handleKtpUpload,
                        'upload-ktp-input',
                        'image/*,application/pdf',
                        false,
                        ktpVerified ? (
                          <Chip label="Dukcapil Valid" size="small" color="success" sx={{ fontWeight: 700, height: 20 }} />
                        ) : null
                      )}

                      {/* 3. Kartu Keluarga (KK) */}
                      {renderUploadCard(
                        '3. Kartu Keluarga (KK)',
                        'Scan Kartu Keluarga terbaru resmi Dukcapil, maks. 100 KB.',
                        kkDoc,
                        (e) => handleGenericFileUpload(e, setKkDoc, MAX_DOC_FILE_SIZE_BYTES, false),
                        'upload-kk-input',
                        'image/*,application/pdf'
                      )}

                      {/* 4. Ijazah Terakhir */}
                      {renderUploadCard(
                        '4. Ijazah Terakhir (Diploma)',
                        'Scan Ijazah asli pendidikan terakhir, maks. 100 KB.',
                        ijazahDoc,
                        (e) => handleGenericFileUpload(e, setIjazahDoc, MAX_DOC_FILE_SIZE_BYTES, false),
                        'upload-ijazah-input',
                        'image/*,application/pdf'
                      )}

                      {/* 5. Transkrip Nilai / SKHUN */}
                      {renderUploadCard(
                        '5. Transkrip Nilai / SKHUN',
                        'Scan Transkrip Nilai / SKHUN resmi pendidikan terakhir, maks. 100 KB.',
                        transkripDoc,
                        (e) => handleGenericFileUpload(e, setTranskripDoc, MAX_DOC_FILE_SIZE_BYTES, false),
                        'upload-transkrip-input',
                        'image/*,application/pdf'
                      )}

                      {/* 6. Sertifikat Non-Formal (Bisa Unggah Banyak) */}
                      <Box
                        className="notranslate"
                        translate="no"
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          border: '1.5px dashed',
                          borderColor: certNonformalError ? '#EF4444' : certNonformalList.length > 0 ? '#10B981' : '#CBD5E1',
                          bgcolor: certNonformalError ? '#FEF2F2' : certNonformalList.length > 0 ? '#F0FDF4' : '#FFFFFF',
                          transition: 'all 0.2s',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              6. Sertifikat Pelatihan / Keahlian
                            </Typography>
                            {certNonformalList.length > 0 && (
                              <Chip
                                label={`${certNonformalList.length} Berkas`}
                                size="small"
                                color="success"
                                sx={{ fontWeight: 700, height: 20 }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5, lineHeight: 1.4 }}>
                            Pelatihan keahlian, sertifikasi kompetensi (Bisa tambah banyak sertifikat, maks. 100 KB/berkas, Opsional).
                          </Typography>

                          {certNonformalList.length > 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5, maxHeight: 150, overflowY: 'auto' }}>
                              {certNonformalList.map((item) => (
                                <Box
                                  key={item.id}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 0.8,
                                    bgcolor: '#FFFFFF',
                                    borderRadius: 1.5,
                                    border: '1px solid #E2E8F0',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, overflow: 'hidden' }}>
                                    <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981', flexShrink: 0 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#1E293B', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 130 }}>
                                      {item.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', flexShrink: 0 }}>
                                      ({(item.size / 1024).toFixed(1)} KB)
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={() => removeCertNonformal(item.id)}
                                    sx={{ color: '#EF4444', p: 0.3 }}
                                    title="Hapus berkas ini"
                                  >
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>
                              ))}
                            </Box>
                          )}

                          {certNonformalError && (
                            <Typography variant="caption" sx={{ color: '#EF4444', display: 'block', mb: 1, fontWeight: 600 }}>
                              {certNonformalError}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            id="upload-cert-nonformal-multi-input"
                            style={{ display: 'none' }}
                            multiple
                            onChange={handleCertNonformalMultiUpload}
                          />
                          <label htmlFor="upload-cert-nonformal-multi-input">
                            <Button
                              variant={certNonformalList.length > 0 ? 'contained' : 'outlined'}
                              size="small"
                              component="span"
                              className="notranslate"
                              translate="no"
                              startIcon={<AddIcon />}
                              sx={{
                                bgcolor: certNonformalList.length > 0 ? '#10B981' : 'transparent',
                                borderColor: certNonformalList.length > 0 ? '#10B981' : '#018730',
                                color: certNonformalList.length > 0 ? '#FFFFFF' : '#018730',
                                fontWeight: 700,
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontSize: 13,
                                '&:hover': {
                                  bgcolor: certNonformalList.length > 0 ? '#059669' : '#F0FDF4',
                                  borderColor: certNonformalList.length > 0 ? '#059669' : '#005c21',
                                },
                              }}
                            >
                              {certNonformalList.length > 0 ? '+ Tambah Sertifikat' : 'Pilih Berkas'}
                            </Button>
                          </label>
                        </Box>
                      </Box>

                      {/* 7. BPJS Kesehatan */}
                      {renderUploadCard(
                        '7. BPJS Kesehatan',
                        'Scan Kartu KIS / BPJS Kesehatan aktif, maks. 100 KB.',
                        bpjsKesehatanDoc,
                        (e) => handleGenericFileUpload(e, setBpjsKesehatanDoc, MAX_DOC_FILE_SIZE_BYTES, false),
                        'upload-bpjs-kes-input',
                        'image/*,application/pdf'
                      )}

                      {/* 8. BPJS Ketenagakerjaan (Optional) */}
                      {renderUploadCard(
                        '8. BPJS Ketenagakerjaan',
                        'Scan Kartu BPJS TK / Jamsostek (Opsional jika ada), maks. 100 KB.',
                        bpjsKetenagakerjaanDoc,
                        (e) => handleGenericFileUpload(e, setBpjsKetenagakerjaanDoc, MAX_DOC_FILE_SIZE_BYTES, false),
                        'upload-bpjs-tk-input',
                        'image/*,application/pdf'
                      )}

                      {/* 9. NPWP */}
                      {renderUploadCard(
                        '9. NPWP',
                        'Scan Kartu NPWP / bukti pendaftaran NPWP, maks. 100 KB.',
                        npwpDoc,
                        (e) => handleGenericFileUpload(e, setNpwpDoc, MAX_DOC_FILE_SIZE_BYTES, false),
                        'upload-npwp-input',
                        'image/*,application/pdf'
                      )}

                      {/* 10. Akta Kelahiran */}
                      {renderUploadCard(
                        '10. Akta Kelahiran',
                        'Scan Akta Kelahiran resmi dari Dukcapil, maks. 100 KB.',
                        aktaDoc,
                        (e) => handleGenericFileUpload(e, setAktaDoc, MAX_DOC_FILE_SIZE_BYTES, false),
                        'upload-akta-input',
                        'image/*,application/pdf'
                      )}

                      {/* 11. SKCK */}
                      {renderUploadCard(
                        '11. SKCK Aktif',
                        'Surat Keterangan Catatan Kepolisian yang masih berlaku, maks. 100 KB.',
                        skckDoc,
                        (e) => handleGenericFileUpload(e, setSkckDoc, MAX_DOC_FILE_SIZE_BYTES, false),
                        'upload-skck-input',
                        'image/*,application/pdf'
                      )}

                      {/* 12. CV (Strict 100 KB) */}
                      {renderUploadCard(
                        '12. Berkas CV (Curriculum Vitae)',
                        'Wajib format PDF (.pdf), ukuran MAKSIMAL 100 KB.',
                        cvDoc,
                        (e) => handleGenericFileUpload(e, setCvDoc, MAX_CV_FILE_SIZE_BYTES, true),
                        'upload-cv-input',
                        'application/pdf',
                        true,
                        <Chip label="Wajib Max 100KB" size="small" color="primary" sx={{ fontWeight: 700, height: 20 }} />
                      )}
                    </Box>

                    {cvDoc.size > 0 && (
                      <Box sx={{ mt: 3, p: 2, bgcolor: '#F1F5F9', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                            Ukuran File CV Terpilih: {cvDoc.file?.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: cvDoc.size > MAX_CV_FILE_SIZE_BYTES ? '#EF4444' : '#10B981' }}
                          >
                            {(cvDoc.size / 1024).toFixed(1)} KB / 100 KB
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (cvDoc.size / MAX_CV_FILE_SIZE_BYTES) * 100)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: cvDoc.size > MAX_CV_FILE_SIZE_BYTES ? '#EF4444' : '#10B981',
                            },
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                )}

                {/* ------------------------------------------------------------- */}
                {/* LANGKAH 2: DATA PRIBADI & ALAMAT */}
                {/* ------------------------------------------------------------- */}
                {activeStep === 1 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <PersonIcon sx={{ color: '#018730', fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        2. Identitas Pribadi & Alamat Kependudukan
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                      {ktpVerified && ocrStatusSeverity === 'success'
                        ? 'Data identitas di bawah ini telah terisi otomatis dari hasil scan e-KTP Anda. Anda dapat mengubah atau melengkapi jika ada koreksi.'
                        : 'Kolom isian di bawah ini dapat Anda lengkapi sesuai data kependudukan pada e-KTP asli Anda. NIK 16 digit akan memverifikasi tanggal lahir & jenis kelamin secara otomatis.'}
                    </Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2.5 }}>
                      {/* 1. NIK */}
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                        <TextField
                          fullWidth
                          label="1. NIK (Nomor Induk Kependudukan)"
                          placeholder="16 Digit NIK KTP"
                          value={nik}
                          onChange={(e) => handleNikChange(e.target.value)}
                          error={nikError}
                          helperText={nikHelperText}
                          slotProps={{ htmlInput: { maxLength: 16 } }}
                        />
                      </Box>

                      {/* 2. Nama Depan & Belakang */}
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
                        <TextField
                          fullWidth
                          required
                          label="2. Nama Depan"
                          placeholder="Nama depan"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value.toUpperCase())}
                          slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
                        <TextField
                          fullWidth
                          label="Nama Belakang"
                          placeholder="Nama belakang"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value.toUpperCase())}
                          slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
                        />
                      </Box>

                      {/* 3. Gender */}
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                        <TextField
                          select
                          fullWidth
                          required
                          label="3. Jenis Kelamin (Gender)"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        >
                          {GENDER_OPTIONS.map((g) => (
                            <MenuItem key={g} value={g}>
                              {g}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>

                      {/* 4. Religion */}
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                        <TextField
                          select
                          fullWidth
                          required
                          label="4. Agama (Religion)"
                          value={religion}
                          onChange={(e) => setReligion(e.target.value)}
                        >
                          {RELIGION_OPTIONS.map((r) => (
                            <MenuItem key={r} value={r}>
                              {r}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>

                      {/* 5. Ethnic */}
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                        <TextField
                          select
                          fullWidth
                          required
                          label="5. Suku Bangsa (Ethnic)"
                          value={ethnic}
                          onChange={(e) => setEthnic(e.target.value)}
                        >
                          {ETHNIC_OPTIONS.map((et) => (
                            <MenuItem key={et} value={et}>
                              {et}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>

                      {/* 6. Tinggi & Berat Badan */}
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="6. Tinggi Badan (cm)"
                          placeholder="Contoh: 170"
                          value={heightCm}
                          onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Berat Badan (kg)"
                          placeholder="Contoh: 65"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                        />
                      </Box>

                      {/* 7. Status Pernikahan */}
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                        <TextField
                          select
                          fullWidth
                          required
                          label="7. Status Pernikahan"
                          value={marriageStatus}
                          onChange={(e) => setMarriageStatus(e.target.value)}
                        >
                          {MARRIAGE_OPTIONS.map((m) => (
                            <MenuItem key={m} value={m}>
                              {m}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>

                      {/* 8. Email & No HP */}
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                        <TextField
                          fullWidth
                          required
                          type="email"
                          label="8. Alamat E-Mail Aktif"
                          placeholder="contoh@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          helperText="Kredensial login ATS akan dikirimkan ke email ini"
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                        <TextField
                          fullWidth
                          required
                          label="Nomor WhatsApp / HP"
                          placeholder="08123456789"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </Box>

                      {/* Tempat & Tanggal Lahir */}
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                        <Autocomplete
                          freeSolo
                          options={INDONESIAN_CITIES}
                          value={birthPlace}
                          onInputChange={(event, newInputValue) => {
                            setBirthPlace(newInputValue ? newInputValue.toUpperCase() : '');
                          }}
                          onChange={(event, newValue) => {
                            setBirthPlace(newValue ? (typeof newValue === 'string' ? newValue.toUpperCase() : '') : '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              label="Tempat Lahir"
                              placeholder="KOTA KELAHIRAN (PILIH / KETIK)"
                              sx={{ '& input': { textTransform: 'uppercase' } }}
                            />
                          )}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 5' } }}>
                        <TextField
                          fullWidth
                          required
                          type="date"
                          label="Tanggal Lahir"
                          slotProps={{ inputLabel: { shrink: true } }}
                          value={birthDate}
                          onChange={(e) => handleBirthDateChange(e.target.value)}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
                        <TextField
                          fullWidth
                          label="Usia"
                          value={age !== '' ? `${age} Tahun` : '-'}
                          disabled
                          helperText="Dihitung otomatis"
                        />
                      </Box>

                      {/* 9. Alamat Sesuai KTP */}
                      <Box sx={{ gridColumn: 'span 12' }}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5 }}>
                          9. Alamat Sesuai KTP (Auto-Terisi dari KTP)
                        </Typography>
                      </Box>

                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                        <Autocomplete
                          freeSolo
                          options={PROVINCE_NAMES}
                          value={provinceKtp}
                          onInputChange={(event, newInputValue) => {
                            setProvinceKtp(newInputValue ? newInputValue.toUpperCase() : '');
                          }}
                          onChange={(event, newValue) => {
                            setProvinceKtp(newValue ? (typeof newValue === 'string' ? newValue.toUpperCase() : '') : '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              label="10. Provinsi"
                              placeholder="PILIH / KETIK PROVINSI"
                              sx={{ '& input': { textTransform: 'uppercase' } }}
                            />
                          )}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                        <Autocomplete
                          freeSolo
                          options={getCitiesForProvince(provinceKtp)}
                          value={cityKtp}
                          onInputChange={(event, newInputValue) => {
                            setCityKtp(newInputValue ? newInputValue.toUpperCase() : '');
                          }}
                          onChange={(event, newValue) => {
                            setCityKtp(newValue ? (typeof newValue === 'string' ? newValue.toUpperCase() : '') : '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              label="Kabupaten / Kota"
                              placeholder="PILIH / KETIK KAB/KOTA"
                              sx={{ '& input': { textTransform: 'uppercase' } }}
                            />
                          )}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                        <Autocomplete
                          freeSolo
                          options={getDistrictsForCity(cityKtp)}
                          value={districtKtp}
                          onInputChange={(event, newInputValue) => {
                            setDistrictKtp(newInputValue ? newInputValue.toUpperCase() : '');
                          }}
                          onChange={(event, newValue) => {
                            setDistrictKtp(newValue ? (typeof newValue === 'string' ? newValue.toUpperCase() : '') : '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              label="Kecamatan"
                              placeholder="PILIH / KETIK KECAMATAN"
                              sx={{ '& input': { textTransform: 'uppercase' } }}
                            />
                          )}
                        />
                      </Box>

                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                        <Autocomplete
                          freeSolo
                          options={getVillagesForDistrict(districtKtp)}
                          value={villageKtp}
                          onInputChange={(event, newInputValue) => {
                            setVillageKtp(newInputValue ? newInputValue.toUpperCase() : '');
                          }}
                          onChange={(event, newValue) => {
                            setVillageKtp(newValue ? (typeof newValue === 'string' ? newValue.toUpperCase() : '') : '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              label="11. Kelurahan / Desa"
                              placeholder="PILIH / KETIK KELURAHAN"
                              sx={{ '& input': { textTransform: 'uppercase' } }}
                            />
                          )}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: 'span 6', sm: 'span 2' } }}>
                        <TextField
                          fullWidth
                          label="12. RT"
                          placeholder="001"
                          value={rtKtp}
                          onChange={(e) => setRtKtp(e.target.value)}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: 'span 6', sm: 'span 2' } }}>
                        <TextField
                          fullWidth
                          label="RW"
                          placeholder="002"
                          value={rwKtp}
                          onChange={(e) => setRwKtp(e.target.value)}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 8' } }}>
                        <TextField
                          fullWidth
                          label="13. Nama Jalan, Gang, No. Rumah"
                          placeholder="JL. GARNET BLOK K2 NO. 43 REGENCY"
                          value={streetKtp}
                          onChange={(e) => setStreetKtp(e.target.value.toUpperCase())}
                          slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
                        />
                      </Box>
                      <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                        <TextField
                          fullWidth
                          label="14. Kode Pos KTP"
                          placeholder="41374"
                          value={postalCodeKtp}
                          onChange={(e) => setPostalCodeKtp(e.target.value.replace(/\D/g, '').slice(0, 5))}
                          slotProps={{ htmlInput: { maxLength: 5 } }}
                          helperText="Kode Pos resmi Kemendagri (contoh: 41374)"
                        />
                      </Box>

                      {/* Checklist: Alamat Domisili Beda dari KTP */}
                      <Box sx={{ gridColumn: 'span 12' }}>
                        <Paper sx={{ p: 2, bgcolor: '#F1F5F9', borderRadius: 2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={domicileDifferent}
                                onChange={(e) => setDomicileDifferent(e.target.checked)}
                                sx={{ color: '#018730', '&.Mui-checked': { color: '#018730' } }}
                              />
                            }
                            label={
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                                Alamat tempat tinggal (domisili saat ini) TIDAK SAMA dengan alamat KTP
                              </Typography>
                            }
                          />

                          {domicileDifferent && (
                            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                                <Autocomplete
                                  freeSolo
                                  options={PROVINCE_NAMES}
                                  value={provinceDomicile}
                                  onInputChange={(event, newInputValue) => {
                                    setProvinceDomicile(newInputValue ? newInputValue.toUpperCase() : '');
                                  }}
                                  onChange={(event, newValue) => {
                                    setProvinceDomicile(newValue ? (typeof newValue === 'string' ? newValue.toUpperCase() : '') : '');
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      fullWidth
                                      size="small"
                                      label="Provinsi Domisili"
                                      placeholder="PILIH / KETIK PROVINSI"
                                      sx={{ '& input': { textTransform: 'uppercase' } }}
                                    />
                                  )}
                                />
                              </Box>
                              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                                <Autocomplete
                                  freeSolo
                                  options={getCitiesForProvince(provinceDomicile)}
                                  value={cityDomicile}
                                  onInputChange={(event, newInputValue) => {
                                    setCityDomicile(newInputValue ? newInputValue.toUpperCase() : '');
                                  }}
                                  onChange={(event, newValue) => {
                                    setCityDomicile(newValue ? (typeof newValue === 'string' ? newValue.toUpperCase() : '') : '');
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      fullWidth
                                      size="small"
                                      label="Kabupaten / Kota Domisili"
                                      placeholder="PILIH / KETIK KAB/KOTA"
                                      sx={{ '& input': { textTransform: 'uppercase' } }}
                                    />
                                  )}
                                />
                              </Box>
                              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                                <Autocomplete
                                  freeSolo
                                  options={getDistrictsForCity(cityDomicile)}
                                  value={districtDomicile}
                                  onInputChange={(event, newInputValue) => {
                                    setDistrictDomicile(newInputValue ? newInputValue.toUpperCase() : '');
                                  }}
                                  onChange={(event, newValue) => {
                                    setDistrictDomicile(newValue ? (typeof newValue === 'string' ? newValue.toUpperCase() : '') : '');
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      fullWidth
                                      size="small"
                                      label="Kecamatan Domisili"
                                      placeholder="PILIH / KETIK KECAMATAN"
                                      sx={{ '& input': { textTransform: 'uppercase' } }}
                                    />
                                  )}
                                />
                              </Box>
                              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                                <Autocomplete
                                  freeSolo
                                  options={getVillagesForDistrict(districtDomicile)}
                                  value={villageDomicile}
                                  onInputChange={(event, newInputValue) => {
                                    setVillageDomicile(newInputValue ? newInputValue.toUpperCase() : '');
                                  }}
                                  onChange={(event, newValue) => {
                                    setVillageDomicile(newValue ? (typeof newValue === 'string' ? newValue.toUpperCase() : '') : '');
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      fullWidth
                                      size="small"
                                      label="Kelurahan Domisili"
                                      placeholder="PILIH / KETIK KELURAHAN"
                                      sx={{ '& input': { textTransform: 'uppercase' } }}
                                    />
                                  )}
                                />
                              </Box>
                              <Box sx={{ gridColumn: { xs: 'span 6', sm: 'span 2' } }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="RT Domisili"
                                  value={rtDomicile}
                                  onChange={(e) => setRtDomicile(e.target.value)}
                                />
                              </Box>
                              <Box sx={{ gridColumn: { xs: 'span 6', sm: 'span 2' } }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="RW Domisili"
                                  value={rwDomicile}
                                  onChange={(e) => setRwDomicile(e.target.value)}
                                />
                              </Box>
                              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 8' } }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Jalan / Gang Domisili"
                                  value={streetDomicile}
                                  onChange={(e) => setStreetDomicile(e.target.value.toUpperCase())}
                                  slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
                                />
                              </Box>
                              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Kode Pos Domisili"
                                  placeholder="41374"
                                  value={postalCodeDomicile}
                                  onChange={(e) => setPostalCodeDomicile(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                  slotProps={{ htmlInput: { maxLength: 5 } }}
                                  helperText="5 digit angka kode pos domisili"
                                />
                              </Box>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* ------------------------------------------------------------- */}
                {/* LANGKAH 3: PENDIDIKAN & PENGALAMAN KERJA */}
                {/* ------------------------------------------------------------- */}
                {activeStep === 2 && (
                  <Box>
                    {/* 14. Riwayat Pendidikan */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <SchoolIcon sx={{ color: '#018730', fontSize: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          14. Riwayat Pendidikan Formal
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAddEducation}
                        className="notranslate"
                        translate="no"
                        sx={{
                          color: '#018730',
                          borderColor: '#018730',
                          fontWeight: 700,
                          borderRadius: 2,
                          '&:hover': { bgcolor: '#F0FDF4', borderColor: '#005c21' },
                        }}
                      >
                        Tambah Pendidikan
                      </Button>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                      Cantumkan riwayat pendidikan Anda dari jenjang tertinggi hingga dasar (SD, SMP, SMA/SMK, S1, dll).
                    </Typography>

                    {educationList.map((edu, idx) => (
                      <Paper
                        key={edu.id}
                        sx={{
                          p: 2.5,
                          mb: 2.5,
                          borderRadius: 2,
                          border: '1px solid #E2E8F0',
                          bgcolor: '#FFFFFF',
                          position: 'relative',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#018730' }}>
                            Jenjang #{idx + 1}
                          </Typography>
                          {educationList.length > 1 && (
                            <Tooltip title="Hapus baris pendidikan ini">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveEducation(edu.id)}
                                className="notranslate"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Jenjang Pendidikan"
                              value={edu.level}
                              onChange={(e) => handleUpdateEducation(edu.id, 'level', e.target.value)}
                            >
                              {EDU_LEVEL_OPTIONS.map((lvl) => (
                                <MenuItem key={lvl} value={lvl}>
                                  {lvl}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Box>

                          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 8' } }}>
                            <Autocomplete
                              freeSolo
                              options={INDONESIAN_ACADEMIC_INSTITUTIONS}
                              value={edu.schoolName}
                              onChange={(_, newValue) => {
                                handleUpdateEducation(edu.id, 'schoolName', (newValue || '').toUpperCase());
                              }}
                              onInputChange={(_, newInputValue) => {
                                handleUpdateEducation(edu.id, 'schoolName', (newInputValue || '').toUpperCase());
                              }}
                              sx={{
                                '& input': { textTransform: 'uppercase' },
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  label="Nama Sekolah / Universitas *"
                                  placeholder="PILIH / KETIK NAMA SEKOLAH ATAU UNIVERSITAS"
                                />
                              )}
                            />
                          </Box>

                          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                            <Autocomplete
                              freeSolo
                              options={INDONESIAN_MAJORS}
                              value={edu.major}
                              onChange={(_, newValue) => {
                                handleUpdateEducation(edu.id, 'major', (newValue || '').toUpperCase());
                              }}
                              onInputChange={(_, newInputValue) => {
                                handleUpdateEducation(edu.id, 'major', (newInputValue || '').toUpperCase());
                              }}
                              sx={{
                                '& input': { textTransform: 'uppercase' },
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  size="small"
                                  label="Jurusan / Program Studi *"
                                  placeholder="PILIH / KETIK JURUSAN (MISAL: TEKNIK KOMPUTER / IPA)"
                                />
                              )}
                            />
                          </Box>

                          <Box sx={{ gridColumn: { xs: 'span 6', sm: 'span 3' } }}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Tahun Masuk"
                              value={edu.entryYear}
                              onChange={(e) => handleUpdateEducation(edu.id, 'entryYear', e.target.value)}
                            >
                              {YEAR_OPTIONS.map((yr) => (
                                <MenuItem key={yr} value={yr}>
                                  {yr}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Box>

                          <Box sx={{ gridColumn: { xs: 'span 6', sm: 'span 3' } }}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Tahun Lulus"
                              value={edu.gradYear}
                              onChange={(e) => handleUpdateEducation(edu.id, 'gradYear', e.target.value)}
                            >
                              {YEAR_OPTIONS.map((yr) => (
                                <MenuItem key={yr} value={yr}>
                                  {yr}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Box>
                        </Box>
                      </Paper>
                    ))}

                    <Divider sx={{ my: 4 }} />

                    {/* 15. Pengalaman Kerja Terakhir */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <WorkIcon sx={{ color: '#018730', fontSize: 28 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          15. Pengalaman Kerja Terakhir (Work Experience)
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAddWork}
                        className="notranslate"
                        translate="no"
                        sx={{
                          color: '#018730',
                          borderColor: '#018730',
                          fontWeight: 700,
                          borderRadius: 2,
                          '&:hover': { bgcolor: '#F0FDF4', borderColor: '#005c21' },
                        }}
                      >
                        Tambah Pengalaman
                      </Button>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                      Bagi pelamar Fresh Graduate (lulusan baru) dapat mengosongkan bagian ini atau klik Tambah Pengalaman jika memiliki pengalaman kerja/magang.
                    </Typography>

                    {workList.length === 0 ? (
                      <Box
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          bgcolor: '#F8FAFC',
                          borderRadius: 2,
                          border: '1.5px dashed #CBD5E1',
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#64748B', mb: 1.5 }}>
                          Belum ada riwayat pengalaman kerja yang ditambahkan.
                        </Typography>
                        <Button
                          variant="text"
                          startIcon={<AddIcon />}
                          onClick={handleAddWork}
                          className="notranslate"
                          translate="no"
                          sx={{ color: '#018730', fontWeight: 700 }}
                        >
                          Klik di sini untuk menambah pengalaman kerja
                        </Button>
                      </Box>
                    ) : (
                      workList.map((work, idx) => (
                        <Paper
                          key={work.id}
                          sx={{
                            p: 2.5,
                            mb: 2.5,
                            borderRadius: 2,
                            border: '1px solid #E2E8F0',
                            bgcolor: '#FFFFFF',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#018730' }}>
                              Pengalaman #{idx + 1}
                            </Typography>
                            <Tooltip title="Hapus pengalaman ini">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveWork(work.id)}
                                className="notranslate"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>

                          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Nama Perusahaan"
                                placeholder="PT MANUFACTURING INDONESIA"
                                value={work.company}
                                onChange={(e) => handleUpdateWork(work.id, 'company', e.target.value.toUpperCase())}
                                sx={{ '& input': { textTransform: 'uppercase' } }}
                              />
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Posisi / Jabatan"
                                placeholder="OPERATOR INJECTION / QA STAFF"
                                value={work.position}
                                onChange={(e) => handleUpdateWork(work.id, 'position', e.target.value.toUpperCase())}
                                sx={{ '& input': { textTransform: 'uppercase' } }}
                              />
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
                              <TextField
                                select
                                fullWidth
                                size="small"
                                label="Tahun Masuk"
                                value={work.startYear}
                                onChange={(e) => handleUpdateWork(work.id, 'startYear', e.target.value)}
                              >
                                {YEAR_OPTIONS.map((yr) => (
                                  <MenuItem key={yr} value={yr}>
                                    {yr}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 3' } }}>
                              <TextField
                                select
                                fullWidth
                                size="small"
                                label="Tahun Keluar"
                                value={work.endYear}
                                onChange={(e) => handleUpdateWork(work.id, 'endYear', e.target.value)}
                              >
                                <MenuItem value="SEKARANG (MASIH BEKERJA)">SEKARANG (MASIH BEKERJA)</MenuItem>
                                {YEAR_OPTIONS.map((yr) => (
                                  <MenuItem key={yr} value={yr}>
                                    {yr}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Alasan Keluar / Resign"
                                placeholder="HABIS KONTRAK / MENCARI PENGALAMAN BARU"
                                value={work.exitReason}
                                onChange={(e) => handleUpdateWork(work.id, 'exitReason', e.target.value.toUpperCase())}
                                sx={{ '& input': { textTransform: 'uppercase' } }}
                              />
                            </Box>
                            <Box sx={{ gridColumn: 'span 12' }}>
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                size="small"
                                label="Deskripsi Pekerjaan / Job Description"
                                placeholder="JELASKAN TUGAS DAN TANGGUNG JAWAB UTAMA ANDA..."
                                value={work.jobDescription}
                                onChange={(e) => handleUpdateWork(work.id, 'jobDescription', e.target.value.toUpperCase())}
                                sx={{ '& textarea': { textTransform: 'uppercase' } }}
                              />
                            </Box>
                          </Box>
                        </Paper>
                      ))
                    )}

                    {/* Bahasa Inggris & Lainnya */}
                    <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Kemampuan Bahasa Inggris"
                        value={englishSkill}
                        onChange={(e) => setEnglishSkill(e.target.value)}
                      >
                        <MenuItem value="Beginner">Beginner (Pemula / Pasif)</MenuItem>
                        <MenuItem value="Intermediate">Intermediate (Cukup / Menengah)</MenuItem>
                        <MenuItem value="Advanced">Advanced (Lancar / Fasih)</MenuItem>
                      </TextField>
                      <TextField
                        fullWidth
                        size="small"
                        label="Bahasa Asing Lainnya (Opsional)"
                        placeholder="Contoh: Bahasa Jepang (N3), Thai, Mandarin"
                        value={otherLanguages}
                        onChange={(e) => setOtherLanguages(e.target.value.toUpperCase())}
                          slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
                      />
                    </Box>
                  </Box>
                )}

                {/* ------------------------------------------------------------- */}
                {/* LANGKAH 4: LATAR BELAKANG KELUARGA */}
                {/* ------------------------------------------------------------- */}
                {activeStep === 3 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <FamilyIcon sx={{ color: '#018730', fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        16, 17 & 18. Latar Belakang Keluarga (Family Background)
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                      Informasi susunan keluarga kandung dan keluarga inti diperlukan untuk administrasi ketenagakerjaan, tunjangan keluarga, dan kontak darurat resmi.
                    </Typography>

                    {/* 16. Data Orang Tua Kandung */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5 }}>
                      16. Data Orang Tua Kandung
                    </Typography>

                    <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#018730', mb: 2 }}>
                        Data Ayah Kandung
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1.5fr 1.5fr' }, gap: 2, mb: 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Nama Lengkap Ayah"
                          placeholder="MASUKKAN NAMA AYAH"
                          value={fatherName}
                          onChange={(e) => setFatherName(e.target.value.toUpperCase())}
                          sx={{ '& input': { textTransform: 'uppercase' } }}
                        />
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Tahun Lahir"
                          value={fatherBirthYear}
                          onChange={(e) => setFatherBirthYear(e.target.value)}
                        >
                          {YEAR_OPTIONS.map((yr) => (
                            <MenuItem key={yr} value={yr}>
                              {yr}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Pendidikan Terakhir"
                          value={fatherEducation}
                          onChange={(e) => setFatherEducation(e.target.value)}
                        >
                          {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                            <MenuItem key={lvl} value={lvl}>
                              {lvl}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Pekerjaan Ayah"
                          value={fatherJob}
                          onChange={(e) => setFatherJob(e.target.value)}
                        >
                          {OCCUPATION_OPTIONS.map((occ) => (
                            <MenuItem key={occ} value={occ}>
                              {occ}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>

                      <Divider sx={{ my: 2.5 }} />

                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#018730', mb: 2 }}>
                        Data Ibu Kandung
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1.5fr 1.5fr' }, gap: 2 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Nama Lengkap Ibu"
                          placeholder="MASUKKAN NAMA IBU"
                          value={motherName}
                          onChange={(e) => setMotherName(e.target.value.toUpperCase())}
                          sx={{ '& input': { textTransform: 'uppercase' } }}
                        />
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Tahun Lahir"
                          value={motherBirthYear}
                          onChange={(e) => setMotherBirthYear(e.target.value)}
                        >
                          {YEAR_OPTIONS.map((yr) => (
                            <MenuItem key={yr} value={yr}>
                              {yr}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Pendidikan Terakhir"
                          value={motherEducation}
                          onChange={(e) => setMotherEducation(e.target.value)}
                        >
                          {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                            <MenuItem key={lvl} value={lvl}>
                              {lvl}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Pekerjaan Ibu"
                          value={motherJob}
                          onChange={(e) => setMotherJob(e.target.value)}
                        >
                          {OCCUPATION_OPTIONS.map((occ) => (
                            <MenuItem key={occ} value={occ}>
                              {occ}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    </Paper>

                    {/* 17. Data Saudara Kandung (Kakak & Adik) - Seluruh Pelamar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          17. Data Saudara Kandung (Kakak & Adik)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Diisi untuk seluruh pelamar (kakak kandung maupun adik kandung)
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAddSibling}
                        sx={{
                          color: '#018730',
                          borderColor: '#018730',
                          fontWeight: 700,
                          borderRadius: 2,
                          '&:hover': { bgcolor: '#F0FDF4', borderColor: '#005c21' },
                        }}
                      >
                        Tambah Saudara Kandung
                      </Button>
                    </Box>

                    {siblingList.length === 0 ? (
                      <Box
                        sx={{
                          p: 3,
                          mb: 3.5,
                          textAlign: 'center',
                          bgcolor: '#F8FAFC',
                          borderRadius: 2,
                          border: '1.5px dashed #CBD5E1',
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
                          Belum ada data saudara kandung yang ditambahkan (Kosongkan jika Anda Anak Tunggal).
                        </Typography>
                        <Button
                          variant="text"
                          startIcon={<AddIcon />}
                          onClick={handleAddSibling}
                          sx={{ color: '#018730', fontWeight: 700 }}
                        >
                          Klik untuk menambah data kakak / adik kandung
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ mb: 3.5 }}>
                        {siblingList.map((sib, idx) => (
                          <Paper
                            key={sib.id}
                            sx={{
                              p: 2.5,
                              mb: 2,
                              borderRadius: 2,
                              border: '1px solid #E2E8F0',
                              bgcolor: '#FFFFFF',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#018730' }}>
                                Saudara Kandung #{idx + 1}
                              </Typography>
                              <Tooltip title="Hapus baris ini">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveSibling(sib.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.5fr 2fr 1fr 1.5fr 1.5fr' }, gap: 2 }}>
                              <TextField
                                select
                                fullWidth
                                size="small"
                                label="Hubungan"
                                value={sib.relation}
                                onChange={(e) => handleUpdateSibling(sib.id, 'relation', e.target.value)}
                              >
                                <MenuItem value="KAKAK KANDUNG">KAKAK KANDUNG</MenuItem>
                                <MenuItem value="ADIK KANDUNG">ADIK KANDUNG</MenuItem>
                              </TextField>
                              <TextField
                                fullWidth
                                size="small"
                                label="Nama Lengkap"
                                placeholder="NAMA SAUDARA KANDUNG"
                                value={sib.name}
                                onChange={(e) => handleUpdateSibling(sib.id, 'name', e.target.value.toUpperCase())}
                                sx={{ '& input': { textTransform: 'uppercase' } }}
                              />
                              <TextField
                                select
                                fullWidth
                                size="small"
                                label="Tahun Lahir"
                                value={sib.birthYear}
                                onChange={(e) => handleUpdateSibling(sib.id, 'birthYear', e.target.value)}
                              >
                                {YEAR_OPTIONS.map((yr) => (
                                  <MenuItem key={yr} value={yr}>
                                    {yr}
                                  </MenuItem>
                                ))}
                              </TextField>
                              <TextField
                                select
                                fullWidth
                                size="small"
                                label="Pendidikan Terakhir"
                                value={sib.education}
                                onChange={(e) => handleUpdateSibling(sib.id, 'education', e.target.value)}
                              >
                                {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                                  <MenuItem key={lvl} value={lvl}>
                                    {lvl}
                                  </MenuItem>
                                ))}
                              </TextField>
                              <TextField
                                select
                                fullWidth
                                size="small"
                                label="Pekerjaan"
                                value={sib.job}
                                onChange={(e) => handleUpdateSibling(sib.id, 'job', e.target.value)}
                              >
                                {OCCUPATION_OPTIONS.map((occ) => (
                                  <MenuItem key={occ} value={occ}>
                                    {occ}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    )}

                    {/* 18. Data Pasangan & Anak (KHUSUS STATUS MENIKAH) */}
                    {marriageStatus === 'MENIKAH' && (
                      <Box sx={{ mt: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            {gender === 'PEREMPUAN'
                              ? '18. Data Keluarga Sendiri (Suami & Anak)'
                              : '18. Data Keluarga Sendiri (Istri & Anak)'}
                          </Typography>
                        </Box>

                        {/* Data Pasangan */}
                        <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#018730', mb: 2 }}>
                            {gender === 'PEREMPUAN' ? 'Data Suami' : 'Data Istri'}
                          </Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1.5fr 1.5fr 1.5fr' }, gap: 2 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label={gender === 'PEREMPUAN' ? 'Nama Lengkap Suami' : 'Nama Lengkap Istri'}
                              placeholder="MASUKKAN NAMA LENGKAP PASANGAN"
                              value={spouseName}
                              onChange={(e) => setSpouseName(e.target.value.toUpperCase())}
                              sx={{ '& input': { textTransform: 'uppercase' } }}
                            />
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Tahun Lahir"
                              value={spouseBirthYear}
                              onChange={(e) => setSpouseBirthYear(e.target.value)}
                            >
                              {YEAR_OPTIONS.map((yr) => (
                                <MenuItem key={yr} value={yr}>
                                  {yr}
                                </MenuItem>
                              ))}
                            </TextField>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Pendidikan Terakhir"
                              value={spouseEducation}
                              onChange={(e) => setSpouseEducation(e.target.value)}
                            >
                              {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                                <MenuItem key={lvl} value={lvl}>
                                  {lvl}
                                </MenuItem>
                              ))}
                            </TextField>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Pekerjaan"
                              value={spouseJob}
                              onChange={(e) => setSpouseJob(e.target.value)}
                            >
                              {OCCUPATION_OPTIONS.map((occ) => (
                                <MenuItem key={occ} value={occ}>
                                  {occ}
                                </MenuItem>
                              ))}
                            </TextField>
                            <TextField
                              fullWidth
                              size="small"
                              label="No. WhatsApp / HP"
                              placeholder="0812xxxxxxxx"
                              value={spousePhone}
                              onChange={(e) => setSpousePhone(e.target.value)}
                            />
                          </Box>
                        </Paper>

                        {/* Data Anak Kandung */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            Data Anak Kandung
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={handleAddChild}
                            sx={{
                              color: '#018730',
                              borderColor: '#018730',
                              fontWeight: 700,
                              borderRadius: 2,
                              '&:hover': { bgcolor: '#F0FDF4', borderColor: '#005c21' },
                            }}
                          >
                            Tambah Data Anak
                          </Button>
                        </Box>

                        {childrenList.length === 0 ? (
                          <Box
                            sx={{
                              p: 3,
                              textAlign: 'center',
                              bgcolor: '#F8FAFC',
                              borderRadius: 2,
                              border: '1.5px dashed #CBD5E1',
                            }}
                          >
                            <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
                              Belum ada data anak yang ditambahkan (Kosongkan jika belum memiliki anak).
                            </Typography>
                            <Button
                              variant="text"
                              startIcon={<AddIcon />}
                              onClick={handleAddChild}
                              sx={{ color: '#018730', fontWeight: 700 }}
                            >
                              Klik untuk menambah data anak
                            </Button>
                          </Box>
                        ) : (
                          childrenList.map((child, idx) => (
                            <Paper
                              key={child.id}
                              sx={{
                                p: 2.5,
                                mb: 2,
                                borderRadius: 2,
                                border: '1px solid #E2E8F0',
                                bgcolor: '#FFFFFF',
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#018730' }}>
                                  Anak #{idx + 1}
                                </Typography>
                                <Tooltip title="Hapus anak ini">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveChild(child.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>

                              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1.5fr 1fr 1.5fr' }, gap: 2 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Nama Lengkap Anak"
                                  placeholder="NAMA ANAK"
                                  value={child.name}
                                  onChange={(e) => handleUpdateChild(child.id, 'name', e.target.value.toUpperCase())}
                                  sx={{ '& input': { textTransform: 'uppercase' } }}
                                />
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  label="Jenis Kelamin"
                                  value={child.gender}
                                  onChange={(e) => handleUpdateChild(child.id, 'gender', e.target.value)}
                                >
                                  <MenuItem value="LAKI-LAKI">LAKI-LAKI</MenuItem>
                                  <MenuItem value="PEREMPUAN">PEREMPUAN</MenuItem>
                                </TextField>
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  label="Tahun Lahir"
                                  value={child.birthYear}
                                  onChange={(e) => handleUpdateChild(child.id, 'birthYear', e.target.value)}
                                >
                                  {YEAR_OPTIONS.map((yr) => (
                                    <MenuItem key={yr} value={yr}>
                                      {yr}
                                    </MenuItem>
                                  ))}
                                </TextField>
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  label="Status / Pendidikan Anak"
                                  value={child.education}
                                  onChange={(e) => handleUpdateChild(child.id, 'education', e.target.value)}
                                >
                                  {EDUCATION_LEVEL_OPTIONS.map((lvl) => (
                                    <MenuItem key={lvl} value={lvl}>
                                      {lvl}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </Box>
                            </Paper>
                          ))
                        )}
                      </Box>
                    )}
                  </Box>
                )}

                {/* ------------------------------------------------------------- */}
                {/* LANGKAH 5: REVIEW & KIRIM LAMARAN */}
                {/* ------------------------------------------------------------- */}
                {activeStep === 4 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <CheckOutlineIcon sx={{ color: '#018730', fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        Review Berkas & Konfirmasi Pendaftaran
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                      Silakan periksa kembali ringkasan berkas dan data pendaftaran Anda sebelum menekan tombol kirim di bawah ini.
                    </Typography>

                    {/* Ringkasan Data */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mb: 3 }}>
                      {/* Kartu Profil */}
                      <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#018730', mb: 1.5 }}>
                          Ringkasan Identitas & Alamat:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, fontSize: 13, color: '#334155' }}>
                          <div><strong>Posisi Dilamar:</strong> {selectedJob?.title || '-'}</div>
                          <div><strong>Nama Lengkap:</strong> {firstName} {lastName}</div>
                          <div><strong>NIK:</strong> {nik || '-'} {ktpVerified && <span style={{ color: '#16A34A', fontWeight: 700 }}>(✓ Dukcapil)</span>}</div>
                          <div><strong>Email:</strong> {email}</div>
                          <div><strong>No. WhatsApp / HP:</strong> {phone}</div>
                          <div><strong>Jenis Kelamin / Agama:</strong> {gender} / {religion}</div>
                          <div><strong>Tinggi / Berat Badan:</strong> {heightCm ? `${heightCm} cm` : '-'} / {weightKg ? `${weightKg} kg` : '-'}</div>
                          <div><strong>Status Pernikahan:</strong> {marriageStatus}</div>
                          <div><strong>Alamat KTP:</strong> {streetKtp ? `${streetKtp}, ` : ''}{villageKtp ? `Desa ${villageKtp}, ` : ''}{districtKtp}, {cityKtp}, {provinceKtp}</div>
                          {domicileDifferent && (
                            <div><strong>Alamat Domisili:</strong> {streetDomicile}, {villageDomicile}, {districtDomicile}, {cityDomicile}, {provinceDomicile}</div>
                          )}
                        </Box>
                      </Paper>

                      {/* Kartu Berkas & Riwayat */}
                      <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#018730', mb: 1.5 }}>
                          Ringkasan Dokumen & Riwayat:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, fontSize: 13, color: '#334155' }}>
                          <div>
                            <strong>Curriculum Vitae (CV):</strong> {cvDoc.file?.name} ({(cvDoc.size / 1024).toFixed(1)} KB)
                          </div>
                          <div>
                            <strong>Pas Foto:</strong> {photoDoc.file ? '✓ Diunggah' : '- (Opsional)'}
                          </div>
                          <div>
                            <strong>KTP:</strong> {ktpDoc.file ? '✓ Diunggah' : '- (Opsional)'}
                          </div>
                          <div>
                            <strong>Kartu Keluarga:</strong> {kkDoc.file ? '✓ Diunggah' : '- (Opsional)'}
                          </div>
                          <div>
                            <strong>Ijazah & Transkrip:</strong> {ijazahDoc.file || transkripDoc.file ? '✓ Diunggah' : '- (Opsional)'}
                          </div>
                          <div>
                            <strong>Sertifikat Keahlian:</strong> {certNonformalList.length > 0 ? `✓ ${certNonformalList.length} Sertifikat Diunggah` : '- (Opsional)'}
                          </div>
                          <div>
                            <strong>Pendidikan Terakhir:</strong> {educationList[0]?.level} - {educationList[0]?.schoolName} ({educationList[0]?.major})
                          </div>
                          <div>
                            <strong>Pengalaman Kerja:</strong> {workList.length > 0 ? `${workList.length} Pengalaman Tercatat` : 'Fresh Graduate'}
                          </div>
                          <div>
                            <strong>Data Orang Tua:</strong> {fatherName || '-'} / {motherName || '-'}
                          </div>
                        </Box>
                      </Paper>
                    </Box>

                    {/* Checkbox Pernyataan */}
                    <Paper sx={{ p: 2.5, bgcolor: '#FEFCE8', border: '1px solid #FEF08A', borderRadius: 2, mb: 3 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={statementAgreed}
                            onChange={(e) => setStatementAgreed(e.target.checked)}
                            sx={{ color: '#CA8A04', '&.Mui-checked': { color: '#018730' } }}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#713F12' }}>
                            Saya menyatakan bahwa seluruh data dan dokumen yang saya berikan adalah benar, asli, dan sah. Jika di kemudian hari ditemukan ketidaksesuaian data, saya bersedia menerima konsekuensi pembatalan proses seleksi.
                          </Typography>
                        }
                      />
                    </Paper>
                  </Box>
                )}

                {/* ------------------------------------------------------------- */}
                {/* FOOTER BUTTONS: PREVIOUS / NEXT / SUBMIT */}
                {/* ------------------------------------------------------------- */}
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  {activeStep > 0 ? (
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      startIcon={<ArrowBackIcon />}
                      className="notranslate"
                      translate="no"
                      sx={{
                        color: '#64748B',
                        borderColor: '#CBD5E1',
                        fontWeight: 700,
                        borderRadius: 2,
                        px: 3,
                        py: 1.2,
                        '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                      }}
                    >
                      Sebelumnya
                    </Button>
                  ) : (
                    <Box />
                  )}

                  {activeStep < STEPS.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<ArrowForwardIcon />}
                      className="notranslate"
                      translate="no"
                      sx={{
                        bgcolor: '#018730',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        borderRadius: 2,
                        px: 4,
                        py: 1.2,
                        boxShadow: '0 4px 14px rgba(1,135,48,0.25)',
                        '&:hover': { bgcolor: '#005c21' },
                      }}
                    >
                      Selanjutnya &rarr;
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting || !statementAgreed || !cvDoc.file}
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      className="notranslate"
                      translate="no"
                      sx={{
                        bgcolor: '#018730',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: 16,
                        px: 4,
                        py: 1.3,
                        borderRadius: 2,
                        boxShadow: '0 6px 18px rgba(1,135,48,0.3)',
                        '&:hover': { bgcolor: '#005c21' },
                      }}
                    >
                      {submitting ? 'Mengirimkan Lamaran...' : 'Kirim Berkas Lamaran Lengkap'}
                    </Button>
                  )}
                </Box>
              </form>
            </CardContent>
          </Card>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
