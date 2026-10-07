// =============================================================
// Master Data Wilayah Administrasi Indonesia (Kemendagri & BPS)
// =============================================================

export interface ProvinceItem {
  code: string;
  name: string;
}

export interface CityItem {
  provinceCode: string;
  provinceName: string;
  code: string;
  name: string;
}

// 38 Provinsi di Indonesia
export const INDONESIAN_PROVINCES: ProvinceItem[] = [
  { code: '11', name: 'ACEH' },
  { code: '12', name: 'SUMATERA UTARA' },
  { code: '13', name: 'SUMATERA BARAT' },
  { code: '14', name: 'RIAU' },
  { code: '15', name: 'JAMBI' },
  { code: '16', name: 'SUMATERA SELATAN' },
  { code: '17', name: 'BENGKULU' },
  { code: '18', name: 'LAMPUNG' },
  { code: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
  { code: '21', name: 'KEPULAUAN RIAU' },
  { code: '31', name: 'DKI JAKARTA' },
  { code: '32', name: 'JAWA BARAT' },
  { code: '33', name: 'JAWA TENGAH' },
  { code: '34', name: 'DI YOGYAKARTA' },
  { code: '35', name: 'JAWA TIMUR' },
  { code: '36', name: 'BANTEN' },
  { code: '51', name: 'BALI' },
  { code: '52', name: 'NUSA TENGGARA BARAT' },
  { code: '53', name: 'NUSA TENGGARA TIMUR' },
  { code: '61', name: 'KALIMANTAN BARAT' },
  { code: '62', name: 'KALIMANTAN TENGAH' },
  { code: '63', name: 'KALIMANTAN SELATAN' },
  { code: '64', name: 'KALIMANTAN TIMUR' },
  { code: '65', name: 'KALIMANTAN UTARA' },
  { code: '71', name: 'SULAWESI UTARA' },
  { code: '72', name: 'SULAWESI TENGAH' },
  { code: '73', name: 'SULAWESI SELATAN' },
  { code: '74', name: 'SULAWESI TENGGARA' },
  { code: '75', name: 'GORONTALO' },
  { code: '76', name: 'SULAWESI BARAT' },
  { code: '81', name: 'MALUKU' },
  { code: '82', name: 'MALUKU UTARA' },
  { code: '91', name: 'PAPUA BARAT' },
  { code: '92', name: 'PAPUA BARAT DAYA' },
  { code: '93', name: 'PAPUA SELATAN' },
  { code: '94', name: 'PAPUA' },
  { code: '95', name: 'PAPUA TENGAH' },
  { code: '96', name: 'PAPUA PEGUNUNGAN' },
];

export const PROVINCE_NAMES: string[] = INDONESIAN_PROVINCES.map((p) => p.name);

// Daftar Komprehensif Kota & Kabupaten di Seluruh Indonesia (untuk Dropdown Tempat Lahir & Kab/Kota)
export const INDONESIAN_CITIES: string[] = [
  // Jawa Tengah
  'SRAGEN', 'KARANGANYAR', 'SURAKARTA (SOLO)', 'BOYOLALI', 'KLATEN', 'SUKOHARJO', 'WONOGIRI',
  'SEMARANG', 'KOTA SEMARANG', 'KOTA SALATIGA', 'KENDAL', 'DEMAK', 'GROBOGAN', 'BLORA',
  'KUDUS', 'PATI', 'JEPARA', 'REMBANG', 'TEMANGGUNG', 'WONOSOBO', 'MAGELANG', 'KOTA MAGELANG',
  'PURWOREJO', 'KEBUMEN', 'CILACAP', 'BANYUMAS', 'PURBALINGGA', 'BANJARNEGARA',
  'PEKALONGAN', 'KOTA PEKALONGAN', 'BATANG', 'PEMALANG', 'TEGAL', 'KOTA TEGAL', 'BREBES',

  // Jawa Barat
  'KARAWANG', 'BEKASI', 'KOTA BEKASI', 'PURWAKARTA', 'SUBANG', 'BOGOR', 'KOTA BOGOR',
  'DEPOK', 'BANDUNG', 'KOTA BANDUNG', 'BANDUNG BARAT', 'CIMAHI', 'CIANJUR', 'SUKABUMI',
  'KOTA SUKABUMI', 'GARUT', 'TASIKMALAYA', 'KOTA TASIKMALAYA', 'CIAMIS', 'BANJAR',
  'PANGANDARAN', 'KUNINGAN', 'CIREBON', 'KOTA CIREBON', 'MAJALENGKA', 'SUMEDANG', 'INDRAMAYU',

  // DKI Jakarta
  'JAKARTA PUSAT', 'JAKARTA UTARA', 'JAKARTA BARAT', 'JAKARTA SELATAN', 'JAKARTA TIMUR', 'KEPULAUAN SERIBU',

  // Banten
  'TANGERANG', 'KOTA TANGERANG', 'KOTA TANGERANG SELATAN', 'SERANG', 'KOTA SERANG', 'CILEGON', 'LEBAK', 'PANDEGLANG',

  // DI Yogyakarta
  'YOGYAKARTA', 'SLEMAN', 'BANTUL', 'GUNUNGKIDUL', 'KULON PROGO',

  // Jawa Timur
  'SURABAYA', 'SIDOARJO', 'GRESIK', 'MOJOKERTO', 'KOTA MOJOKERTO', 'JOMBANG', 'PASURUAN', 'KOTA PASURUAN',
  'PROBOLINGGO', 'KOTA PROBOLINGGO', 'MALANG', 'KOTA MALANG', 'BATU', 'LUMAJANG', 'JEMBER', 'BONDOWOSO',
  'SITUBONDO', 'BANYUWANGI', 'KEDIRI', 'KOTA KEDIRI', 'BLITAR', 'KOTA BLITAR', 'TULUNGAGUNG', 'TRENGGALEK',
  'NGANJUK', 'MADIUN', 'KOTA MADIUN', 'MAGETAN', 'NGAWI', 'PONOROGO', 'PACITAN', 'BOJONEGORO', 'TUBAN',
  'LAMONGAN', 'BANGKALAN', 'SAMPANG', 'PAMEKASAN', 'SUMENEP',

  // Sumatera Utara & Aceh
  'BANDA ACEH', 'SABANG', 'LHOKSEUMAWE', 'LANGSA', 'SUBULUSSALAM', 'ACEH BESAR', 'ACEH UTARA', 'ACEH TIMUR',
  'MEDAN', 'BINJAI', 'TEBING TINGGI', 'PEMATANGSIANTAR', 'TANJUNGBALAI', 'SIBOLGA', 'PADANGSIDIMPUAN', 'GUNUNGSITOLI',
  'DELI SERDANG', 'LANGKAT', 'KARO', 'SIMALUNGUN', 'ASAHAN', 'LABUHANBATU', 'TAPANULI UTARA', 'TAPANULI TENGAH',

  // Sumatera Barat, Riau, Kepri
  'PADANG', 'BUKITTINGGI', 'PAYAKUMBUH', 'PARIAMAN', 'SOLOK', 'SAWAHLUNTO', 'PADANG PANJANG', 'AGAM', 'PASAMAN',
  'PEKANBARU', 'DUMAI', 'BENGKALIS', 'KAMPAR', 'ROKAN HILIR', 'ROKAN HULU', 'SIAK', 'INDRAGIRI HILIR',
  'BATAM', 'TANJUNGPINANG', 'BINTAN', 'KARIMUN', 'NATUNA',

  // Jambi, Sumsel, Bengkulu, Lampung, Babel
  'JAMBI', 'SUNGAI PENUH', 'MUARO JAMBI', 'BATANGHARI', 'MERANGIN', 'BUNGO', 'TEBO', 'KERINCI',
  'PALEMBANG', 'PRABUMULIH', 'LUBUKLINGGAU', 'PAGAR ALAM', 'OGAN ILIR', 'OGAN KOMERING ILIR', 'BANYUASIN', 'MUARA ENIM',
  'BENGKULU', 'REJANG LEBONG', 'LEBONG', 'BENGKULU UTARA', 'MUKOMUKO',
  'BANDAR LAMPUNG', 'METRO', 'LAMPUNG SELATAN', 'LAMPUNG TENGAH', 'LAMPUNG UTARA', 'LAMPUNG TIMUR', 'PRINGSEWU',
  'PANGKALPINANG', 'BANGKA', 'BELITUNG', 'BELITUNG TIMUR',

  // Kalimantan
  'PONTIANAK', 'SINGKAWANG', 'SAMBAS', 'KETAPANG', 'SINTANG', 'KAPUAS HULU',
  'PALANGKARAYA', 'KAPUAS', 'KOTAWARINGIN TIMUR', 'KOTAWARINGIN BARAT',
  'BANJARMASIN', 'BANJARBARU', 'BANJAR', 'BARITO KUALA', 'TANAH LAUT', 'TABALONG',
  'SAMARINDA', 'BALIKPAPAN', 'BONTANG', 'KUTAI KARTANEGARA', 'KUTAI TIMUR', 'BERAU', 'PASER',
  'TARAKAN', 'NUNUKAN', 'BULUNGAN', 'MALINAU',

  // Bali & Nusa Tenggara
  'DENPASAR', 'BADUNG', 'GIANYAR', 'TABANAN', 'BULELENG', 'KARANGASEM', 'KLUNGKUNG', 'BANGLI', 'JEMBRANA',
  'MATARAM', 'BIMA', 'LOMBOK BARAT', 'LOMBOK TENGAH', 'LOMBOK TIMUR', 'SUMBAWA',
  'KUPANG', 'MANGGARAI', 'MANGGARAI BARAT', 'ENDE', 'SIKKA', 'TIMOR TENGAH SELATAN', 'SUMBA TIMUR',

  // Sulawesi
  'MAKASSAR', 'PALOPO', 'PAREPARE', 'GOWA', 'MAROS', 'BONE', 'WAJO', 'SIDRAP', 'PINRANG', 'LUWU', 'TORAJA',
  'MANADO', 'BITUNG', 'TOMOHON', 'KOTAMOBAGU', 'MINAHASA', 'BOLAANG MONGONDOW',
  'PALU', 'DONGGALA', 'PARIGI MOUTONG', 'POSO', 'BANGGAI', 'MOROWALI',
  'KENDARI', 'BAUBAU', 'KONAWE', 'KOLAKA', 'MUNA', 'BUTON',
  'GORONTALO', 'BONE BOLANGO', 'POHUWATO',
  'MAMUJU', 'POLEWALI MANDAR', 'MAJENE',

  // Maluku & Papua
  'AMBON', 'TUAL', 'MALUKU TENGAH', 'BURU', 'KEPULAUAN ARU',
  'TERNATE', 'TIDORE KEPULAUAN', 'HALMAHERA UTARA', 'HALMAHERA SELATAN',
  'JAYAPURA', 'KOTA JAYAPURA', 'KEEROM', 'SARMI', 'BIAK NUMFOR',
  'SORONG', 'KOTA SORONG', 'MANOKWARI', 'FAKFAK', 'RAJA AMPAT',
  'MERAUKE', 'BOVEN DIGOEL', 'MAPPI', 'ASMAT',
  'TIMIKA (MIMIKA)', 'NABIRE', 'PANIAI', 'PUNCAK JAYA',
  'JAYAWIJAYA (WAMENA)', 'YAHUKIMO', 'PEGUNUNGAN BINTANG',
];

// Pemetaan Kota per Provinsi
export const CITIES_BY_PROVINCE: Record<string, string[]> = {
  'JAWA BARAT': [
    'KARAWANG', 'BEKASI', 'KOTA BEKASI', 'PURWAKARTA', 'SUBANG', 'BOGOR', 'KOTA BOGOR',
    'DEPOK', 'BANDUNG', 'KOTA BANDUNG', 'BANDUNG BARAT', 'CIMAHI', 'CIANJUR', 'SUKABUMI',
    'KOTA SUKABUMI', 'GARUT', 'TASIKMALAYA', 'KOTA TASIKMALAYA', 'CIAMIS', 'BANJAR',
    'PANGANDARAN', 'KUNINGAN', 'CIREBON', 'KOTA CIREBON', 'MAJALENGKA', 'SUMEDANG', 'INDRAMAYU',
  ],
  'DKI JAKARTA': [
    'JAKARTA PUSAT', 'JAKARTA UTARA', 'JAKARTA BARAT', 'JAKARTA SELATAN', 'JAKARTA TIMUR', 'KEPULAUAN SERIBU',
  ],
  'BANTEN': [
    'TANGERANG', 'KOTA TANGERANG', 'KOTA TANGERANG SELATAN', 'SERANG', 'KOTA SERANG', 'CILEGON', 'LEBAK', 'PANDEGLANG',
  ],
  'JAWA TENGAH': [
    'SRAGEN', 'KARANGANYAR', 'SURAKARTA (SOLO)', 'BOYOLALI', 'KLATEN', 'SUKOHARJO', 'WONOGIRI',
    'SEMARANG', 'KOTA SEMARANG', 'KOTA SALATIGA', 'KENDAL', 'DEMAK', 'GROBOGAN', 'BLORA',
    'KUDUS', 'PATI', 'JEPARA', 'REMBANG', 'TEMANGGUNG', 'WONOSOBO', 'MAGELANG', 'KOTA MAGELANG',
    'PURWOREJO', 'KEBUMEN', 'CILACAP', 'BANYUMAS', 'PURBALINGGA', 'BANJARNEGARA',
    'PEKALONGAN', 'KOTA PEKALONGAN', 'BATANG', 'PEMALANG', 'TEGAL', 'KOTA TEGAL', 'BREBES',
  ],
  'DI YOGYAKARTA': [
    'YOGYAKARTA', 'SLEMAN', 'BANTUL', 'GUNUNGKIDUL', 'KULON PROGO',
  ],
  'JAWA TIMUR': [
    'SURABAYA', 'SIDOARJO', 'GRESIK', 'MOJOKERTO', 'KOTA MOJOKERTO', 'JOMBANG', 'PASURUAN', 'KOTA PASURUAN',
    'PROBOLINGGO', 'KOTA PROBOLINGGO', 'MALANG', 'KOTA MALANG', 'BATU', 'LUMAJANG', 'JEMBER', 'BONDOWOSO',
    'SITUBONDO', 'BANYUWANGI', 'KEDIRI', 'KOTA KEDIRI', 'BLITAR', 'KOTA BLITAR', 'TULUNGAGUNG', 'TRENGGALEK',
    'NGANJUK', 'MADIUN', 'KOTA MADIUN', 'MAGETAN', 'NGAWI', 'PONOROGO', 'PACITAN', 'BOJONEGORO', 'TUBAN',
    'LAMONGAN', 'BANGKALAN', 'SAMPANG', 'PAMEKASAN', 'SUMENEP',
  ],
};

// Pemetaan Kecamatan Karawang (30 Kecamatan Lengkap Kemendagri)
export const KARAWANG_DISTRICTS: string[] = [
  'KOTABARU',
  'TELUKJAMBE TIMUR',
  'TELUKJAMBE BARAT',
  'KLARI',
  'CIKAMPEK',
  'PURWASARI',
  'KARAWANG BARAT',
  'KARAWANG TIMUR',
  'CIAMPEL',
  'PANGKALAN',
  'TEGALWARU',
  'RENGASDENGKLOK',
  'KUTAWALUYA',
  'BATUJAYA',
  'TIRTAJAYA',
  'PEDES',
  'CIBUAYA',
  'PAKISJAYA',
  'JATISARI',
  'BANYUSARI',
  'CILAMAYA WETAN',
  'CILAMAYA KULON',
  'TIRTAMULYA',
  'TELAGASARI',
  'RAWAMERTA',
  'LEMAHABANG',
  'TEMPURAN',
  'MAJALAYA',
  'JAYAKERTA',
  'CILEBAR',
];

// Pemetaan Kelurahan / Desa Karawang
export const KARAWANG_VILLAGES: Record<string, string[]> = {
  'KOTABARU': [
    'CIKAMPEK UTARA',
    'PANGULAH UTARA',
    'PANGULAH SELATAN',
    'PANGULAH BARU',
    'WANCIMEKAR',
    'JOMIN BARAT',
    'JOMIN TIMUR',
    'SARIMULYA',
    'PUCUNG',
  ],
  'TELUKJAMBE TIMUR': [
    'SUKALUYU',
    'PINAYUNGAN',
    'PURWADANA',
    'SIRNABAYA',
    'TELUKJAMBE',
    'SUKAHARJA',
    'PUSERJAYA',
    'SUKAMAKMUR',
    'WADAS',
  ],
  'CIKAMPEK': [
    'CIKAMPEK KOTA',
    'CIKAMPEK TIMUR',
    'CIKAMPEK SELATAN',
    'CIKAMPEK BARAT',
    'DAWUAN TIMUR',
    'DAWUAN TENGAH',
    'DAWUAN BARAT',
    'KALANGSARI',
    'KAMOJING',
  ],
  'KLARI': [
    'DUREN',
    'GINTUNGKERTA',
    'PANCAMULYA',
    'ANGGADITA',
    'KLARI',
    'CIBALONGSARI',
    'BELENDUNG',
    'CURUG',
    'KARANGANYAR',
    'KIARAPAYUNG',
    'SUMURKONDANG',
    'WIRALAGA',
  ],
  'PURWASARI': [
    'PURWASARI',
    'MEKARJAYA',
    'DARAWOLONG',
    'CENGKONG',
    'PANGKALAN',
    'SUKASARI',
    'TEGALSARI',
    'TAMELANG',
  ],
  'KARAWANG BARAT': [
    'NAGASARI',
    'KARAWANG KULON',
    'TANJUNGPURA',
    'TUNGGAKJATI',
    'TANJUNGMEKAR',
    'MEKARJATI',
    'ADIARSA BARAT',
  ],
  'KARAWANG TIMUR': [
    'ADIARSA TIMUR',
    'PALUMBONSARI',
    'PLAWAD',
    'WARUNGBAMBU',
    'KONDANGJAYA',
    'MARGASARI',
    'KARAWANG WETAN',
    'TEGALSAWAH',
  ],
  'CIAMPEL': [
    'KUTAMEKAR',
    'MULYASEJATI',
    'MULYASARI',
    'PARUNGMULYA',
    'TEGALLEGA',
    'KUTANEGARA',
    'KARYAMUKTI',
  ],
};

// Helper Pencocokan Kota dari Teks OCR
export function matchIndonesianCity(ocrText: string): string | null {
  if (!ocrText) return null;
  const upper = ocrText.toUpperCase();

  const ttlMatch = upper.match(/(?:TEMPA[TL]|T[GQ]I?\s*LAHI?R|LAHI?R)\s*[:;=.\s-]*([A-Z\s]+?)(?:,|\d|\n|$)/i);
  if (ttlMatch && ttlMatch[1]) {
    const candidate = ttlMatch[1].replace(/[^A-Z\s]/g, '').trim();
    for (const city of INDONESIAN_CITIES) {
      if (candidate === city || candidate.includes(city) || city.includes(candidate)) {
        return city;
      }
    }
  }

  for (const city of INDONESIAN_CITIES) {
    if (city.length >= 4) {
      const regex = new RegExp(`\\b${city}\\b`, 'i');
      if (regex.test(upper)) {
        return city;
      }
    }
  }

  return null;
}

export interface DukcapilResolvedNik {
  valid: boolean;
  nik: string;
  provinceCode: string;
  cityCode: string;
  districtCode: string;
  province: string;
  city: string;
  district: string;
  birthDate: string;
  gender: 'LAKI-LAKI' | 'PEREMPUAN';
  actualDay: number;
  month: number;
  year: number;
  age: number;
  error?: string;
}

const DISTRICT_CODE_MAP: Record<string, { province: string; city: string; district: string }> = {
  '321525': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'KOTABARU' },
  '321501': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'KARAWANG BARAT' },
  '321502': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'PANGKALAN' },
  '321503': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'TELUKJAMBE TIMUR' },
  '321504': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'CIAMPEL' },
  '321505': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'KLARI' },
  '321506': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'RENGASDENGKLOK' },
  '321507': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'KUTAWALUYA' },
  '321508': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'BATUJAYA' },
  '321509': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'TIRTAJAYA' },
  '321510': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'PEDES' },
  '321511': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'CIBUAYA' },
  '321512': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'PAKISJAYA' },
  '321513': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'CIKAMPEK' },
  '321514': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'JATISARI' },
  '321515': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'CILAMAYA WETAN' },
  '321516': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'TIRTAMULYA' },
  '321517': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'TELAGASARI' },
  '321518': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'RAWAMERTA' },
  '321519': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'LEMAHABANG' },
  '321520': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'TEMPURAN' },
  '321521': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'MAJALAYA' },
  '321522': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'JAYAKERTA' },
  '321523': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'CILAMAYA KULON' },
  '321524': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'BANYUSARI' },
  '321526': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'PURWASARI' },
  '321527': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'TELUKJAMBE BARAT' },
  '321528': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'TEGALWARU' },
  '321529': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'CILEBAR' },
  '321530': { province: 'JAWA BARAT', city: 'KARAWANG', district: 'KARAWANG TIMUR' },

  '321601': { province: 'JAWA BARAT', city: 'BEKASI', district: 'TARUMAJAYA' },
  '321602': { province: 'JAWA BARAT', city: 'BEKASI', district: 'BABELAN' },
  '321606': { province: 'JAWA BARAT', city: 'BEKASI', district: 'TAMBUN SELATAN' },
  '321608': { province: 'JAWA BARAT', city: 'BEKASI', district: 'CIKARANG PUSAT' },
  '321609': { province: 'JAWA BARAT', city: 'BEKASI', district: 'CIKARANG SELATAN' },
  '321610': { province: 'JAWA BARAT', city: 'BEKASI', district: 'CIKARANG UTARA' },
  '321611': { province: 'JAWA BARAT', city: 'BEKASI', district: 'CIKARANG TIMUR' },
  '321612': { province: 'JAWA BARAT', city: 'BEKASI', district: 'CIKARANG BARAT' },

  '331401': { province: 'JAWA TENGAH', city: 'SRAGEN', district: 'KALIJAMBE' },
  '331402': { province: 'JAWA TENGAH', city: 'SRAGEN', district: 'PLUPUH' },
  '331408': { province: 'JAWA TENGAH', city: 'SRAGEN', district: 'SRAGEN' },
  '331410': { province: 'JAWA TENGAH', city: 'SRAGEN', district: 'MASARAN' },
};

const CITY_CODE_MAP: Record<string, { province: string; city: string }> = {
  '3215': { province: 'JAWA BARAT', city: 'KARAWANG' },
  '3216': { province: 'JAWA BARAT', city: 'BEKASI' },
  '3275': { province: 'JAWA BARAT', city: 'KOTA BEKASI' },
  '3201': { province: 'JAWA BARAT', city: 'BOGOR' },
  '3271': { province: 'JAWA BARAT', city: 'KOTA BOGOR' },
  '3276': { province: 'JAWA BARAT', city: 'DEPOK' },
  '3204': { province: 'JAWA BARAT', city: 'BANDUNG' },
  '3273': { province: 'JAWA BARAT', city: 'KOTA BANDUNG' },
  '3214': { province: 'JAWA BARAT', city: 'PURWAKARTA' },
  '3213': { province: 'JAWA BARAT', city: 'SUBANG' },
  '3314': { province: 'JAWA TENGAH', city: 'SRAGEN' },
  '3372': { province: 'JAWA TENGAH', city: 'SURAKARTA (SOLO)' },
  '3374': { province: 'JAWA TENGAH', city: 'KOTA SEMARANG' },
  '3171': { province: 'DKI JAKARTA', city: 'JAKARTA SELATAN' },
  '3172': { province: 'DKI JAKARTA', city: 'JAKARTA TIMUR' },
  '3173': { province: 'DKI JAKARTA', city: 'JAKARTA PUSAT' },
  '3174': { province: 'DKI JAKARTA', city: 'JAKARTA BARAT' },
  '3175': { province: 'DKI JAKARTA', city: 'JAKARTA UTARA' },
  '3671': { province: 'BANTEN', city: 'KOTA TANGERANG' },
  '3674': { province: 'BANTEN', city: 'KOTA TANGERANG SELATAN' },
  '3603': { province: 'BANTEN', city: 'TANGERANG' },
};

const PROV_CODE_MAP: Record<string, string> = {
  '11': 'ACEH', '12': 'SUMATERA UTARA', '13': 'SUMATERA BARAT', '14': 'RIAU', '15': 'JAMBI',
  '16': 'SUMATERA SELATAN', '17': 'BENGKULU', '18': 'LAMPUNG', '19': 'KEPULAUAN BANGKA BELITUNG',
  '21': 'KEPULAUAN RIAU', '31': 'DKI JAKARTA', '32': 'JAWA BARAT', '33': 'JAWA TENGAH',
  '34': 'DI YOGYAKARTA', '35': 'JAWA TIMUR', '36': 'BANTEN', '51': 'BALI',
  '52': 'NUSA TENGGARA BARAT', '53': 'NUSA TENGGARA TIMUR', '61': 'KALIMANTAN BARAT',
  '62': 'KALIMANTAN TENGAH', '63': 'KALIMANTAN SELATAN', '64': 'KALIMANTAN TIMUR',
  '65': 'KALIMANTAN UTARA', '71': 'SULAWESI UTARA', '72': 'SULAWESI TENGAH',
  '73': 'SULAWESI SELATAN', '74': 'SULAWESI TENGGARA', '75': 'GORONTALO',
  '76': 'SULAWESI BARAT', '81': 'MALUKU', '82': 'MALUKU UTARA', '91': 'PAPUA BARAT',
  '92': 'PAPUA BARAT DAYA', '93': 'PAPUA SELATAN', '94': 'PAPUA', '95': 'PAPUA TENGAH',
  '96': 'PAPUA PEGUNUNGAN',
};

export function parseDukcapilNik(nik: string): DukcapilResolvedNik {
  const clean = nik.replace(/\D/g, '');
  if (clean.length !== 16) {
    return {
      valid: false,
      nik: clean,
      provinceCode: '',
      cityCode: '',
      districtCode: '',
      province: '',
      city: '',
      district: '',
      birthDate: '',
      gender: 'LAKI-LAKI',
      actualDay: 0,
      month: 0,
      year: 0,
      age: 0,
      error: 'NIK harus terdiri dari 16 digit angka',
    };
  }

  const provCode = clean.substring(0, 2);
  const cityCode = clean.substring(0, 4);
  const districtCode = clean.substring(0, 6);

  const rawDay = parseInt(clean.substring(6, 8), 10);
  const rawMonth = parseInt(clean.substring(8, 10), 10);
  const rawYear = parseInt(clean.substring(10, 12), 10);

  const isFemale = rawDay > 40;
  const actualDay = isFemale ? rawDay - 40 : rawDay;

  if (actualDay < 1 || actualDay > 31) {
    return {
      valid: false,
      nik: clean,
      provinceCode: provCode,
      cityCode,
      districtCode,
      province: '',
      city: '',
      district: '',
      birthDate: '',
      gender: isFemale ? 'PEREMPUAN' : 'LAKI-LAKI',
      actualDay,
      month: rawMonth,
      year: 0,
      age: 0,
      error: `Digit tanggal lahir (${rawDay}) pada NIK tidak valid sesuai standar Dukcapil.`,
    };
  }

  if (rawMonth < 1 || rawMonth > 12) {
    return {
      valid: false,
      nik: clean,
      provinceCode: provCode,
      cityCode,
      districtCode,
      province: '',
      city: '',
      district: '',
      birthDate: '',
      gender: isFemale ? 'PEREMPUAN' : 'LAKI-LAKI',
      actualDay,
      month: rawMonth,
      year: 0,
      age: 0,
      error: `Digit bulan lahir (${rawMonth}) pada NIK tidak valid sesuai standar Dukcapil.`,
    };
  }

  const currentYear2Digit = new Date().getFullYear() % 100;
  const fullYear = rawYear > currentYear2Digit ? 1900 + rawYear : 2000 + rawYear;
  const birthDate = `${fullYear}-${String(rawMonth).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`;
  const gender: 'LAKI-LAKI' | 'PEREMPUAN' = isFemale ? 'PEREMPUAN' : 'LAKI-LAKI';

  const today = new Date();
  let age = today.getFullYear() - fullYear;
  const m = today.getMonth() + 1 - rawMonth;
  if (m < 0 || (m === 0 && today.getDate() < actualDay)) {
    age--;
  }

  let province = '';
  let city = '';
  let district = '';

  if (DISTRICT_CODE_MAP[districtCode]) {
    province = DISTRICT_CODE_MAP[districtCode].province;
    city = DISTRICT_CODE_MAP[districtCode].city;
    district = DISTRICT_CODE_MAP[districtCode].district;
  } else if (CITY_CODE_MAP[cityCode]) {
    province = CITY_CODE_MAP[cityCode].province;
    city = CITY_CODE_MAP[cityCode].city;
  } else if (PROV_CODE_MAP[provCode]) {
    province = PROV_CODE_MAP[provCode];
  }

  return {
    valid: true,
    nik: clean,
    provinceCode: provCode,
    cityCode,
    districtCode,
    province,
    city,
    district,
    birthDate,
    gender,
    actualDay,
    month: rawMonth,
    year: fullYear,
    age: Math.max(0, age),
  };
}

export function getCitiesForProvince(provName?: string): string[] {
  if (!provName) return INDONESIAN_CITIES;
  const upper = provName.toUpperCase();
  return CITIES_BY_PROVINCE[upper] || INDONESIAN_CITIES;
}

export function getDistrictsForCity(cityName?: string): string[] {
  if (!cityName) return [];
  const upper = cityName.toUpperCase();
  if (upper.includes('KARAWANG')) return KARAWANG_DISTRICTS;
  return [];
}

export function getVillagesForDistrict(districtName?: string): string[] {
  if (!districtName) return [];
  const upper = districtName.toUpperCase();
  return KARAWANG_VILLAGES[upper] || [];
}

// Mapping Kode Pos Karawang & Wilayah Sekitar
export const POSTAL_CODES: Record<string, string> = {
  'KOTABARU': '41374',
  'CIKAMPEK UTARA': '41374',
  'PANGULAH UTARA': '41374',
  'PANGULAH SELATAN': '41374',
  'PANGULAH BARU': '41374',
  'WANCIMEKAR': '41374',
  'JOMIN BARAT': '41374',
  'JOMIN TIMUR': '41374',
  'SARIMULYA': '41374',
  'PUCUNG': '41374',
  'CIKAMPEK': '41373',
  'CIKAMPEK KOTA': '41373',
  'DAWUAN TIMUR': '41373',
  'DAWUAN TENGAH': '41373',
  'DAWUAN BARAT': '41373',
  'KLARI': '41371',
  'DUREN': '41371',
  'GINTUNGKERTA': '41371',
  'TELUKJAMBE TIMUR': '41361',
  'SUKALUYU': '41361',
  'PINAYUNGAN': '41361',
  'SIRNABAYA': '41361',
  'TELUKJAMBE': '41361',
  'PURWASARI': '41373',
  'KARAWANG BARAT': '41311',
  'NAGASARI': '41312',
  'KARAWANG TIMUR': '41314',
  'CIAMPEL': '41363',
  'RENGASDENGKLOK': '41352',
};

export function getPostalCode(districtName?: string, villageName?: string): string {
  if (villageName && POSTAL_CODES[villageName.toUpperCase()]) {
    return POSTAL_CODES[villageName.toUpperCase()];
  }
  if (districtName && POSTAL_CODES[districtName.toUpperCase()]) {
    return POSTAL_CODES[districtName.toUpperCase()];
  }
  return '';
}

// =============================================================
// Master Data Pendidikan, Pekerjaan & Tahun Indonesia
// =============================================================

export const INDONESIAN_UNIVERSITIES: string[] = [
  'UNIVERSITAS INDONESIA (UI)',
  'INSTITUT TEKNOLOGI BANDUNG (ITB)',
  'UNIVERSITAS GADJAH MADA (UGM)',
  'UNIVERSITAS AIRLANGGA (UNAIR)',
  'UNIVERSITAS PADJADJARAN (UNPAD)',
  'INSTITUT PERTANIAN BOGOR (IPB)',
  'INSTITUT TEKNOLOGI SEPULUH NOPEMBER (ITS)',
  'UNIVERSITAS DIPONEGORO (UNDIP)',
  'UNIVERSITAS BRAWIJAYA (UB)',
  'UNIVERSITAS SEBELAS MARET (UNS)',
  'UNIVERSITAS HASANUDDIN (UNHAS)',
  'UNIVERSITAS SUMATERA UTARA (USU)',
  'UNIVERSITAS PENDIDIKAN INDONESIA (UPI)',
  'UNIVERSITAS NEGERI JAKARTA (UNJ)',
  'UNIVERSITAS NEGERI YOGYAKARTA (UNY)',
  'UNIVERSITAS NEGERI SEMARANG (UNNES)',
  'UNIVERSITAS NEGERI MALANG (UM)',
  'UNIVERSITAS NEGERI SURABAYA (UNESA)',
  'UNIVERSITAS SINGAPERBANGSA KARAWANG (UNSIKA)',
  'UNIVERSITAS TELKOM (TELKOM UNIVERSITY)',
  'UNIVERSITAS BINA NUSANTARA (BINUS)',
  'UNIVERSITAS MERCU BUANA (UMB)',
  'UNIVERSITAS GUNADARMA',
  'UNIVERSITAS TRISAKTI',
  'UNIVERSITAS TARUMANAGARA (UNTAR)',
  'UNIVERSITAS ATMA JAYA',
  'UNIVERSITAS PARAHYANGAN (UNPAR)',
  'UNIVERSITAS ISLAM INDONESIA (UII)',
  'UNIVERSITAS MUHAMMADIYAH SURAKARTA (UMS)',
  'UNIVERSITAS MUHAMMADIYAH YOGYAKARTA (UMY)',
  'UNIVERSITAS AHMAD DAHLAN (UAD)',
  'UNIVERSITAS KRISTEN PETRA',
  'UNIVERSITAS SURABAYA (UBAYA)',
  'UNIVERSITAS ISLAM NEGERI SYARIF HIDAYATULLAH (UIN JAKARTA)',
  'UNIVERSITAS ISLAM NEGERI SUNAN KALIJAGA (UIN JOGJA)',
  'UNIVERSITAS ISLAM NEGERI SUNAN GUNUNG DJATI (UIN BANDUNG)',
  'UNIVERSITAS ISLAM BANDUNG (UNISBA)',
  'UNIVERSITAS PASUNDAN (UNPAS)',
  'UNIVERSITAS WIDYATAMA',
  'UNIVERSITAS BUDI LUHUR',
  'UNIVERSITAS PAMULANG (UNPAM)',
  'UNIVERSITAS DIAN NUSWANTORO (UDINUS)',
  'UNIVERSITAS KRISTEN SATYA WACANA (UKSW)',
  'UNIVERSITAS SANATA DHARMA (USD)',
  'UNIVERSITAS BUANA PERJUANGAN KARAWANG (UBP)',
  'STMIK DHARMA NEGARA',
  'STMIK KHARISMA KARAWANG',
  'STMIK ROSMA KARAWANG',
  'POLITEKNIK MANUFAKTUR NEGERI BANDUNG (POLMAN)',
  'POLITEKNIK NEGERI JAKARTA (PNJ)',
  'POLITEKNIK NEGERI BANDUNG (POLBAN)',
  'POLITEKNIK NEGERI SEMARANG (POLINES)',
  'POLITEKNIK NEGERI MALANG (POLINEMA)',
  'POLITEKNIK NEGERI SRIWIJAYA (POLSRI)',
  'POLITEKNIK ASTRA',
  'POLITEKNIK GAJAH TUNGGAL',
  'POLITEKNIK STMI JAKARTA',
  'POLITEKNIK KESEHATAN KEMENKES',
  'UNIVERSITAS TERBUKA (UT)',
];

export const INDONESIAN_SCHOOLS_COMMON: string[] = [
  'SMAN 1 CIKAMPEK',
  'SMAN 2 CIKAMPEK',
  'SMKN 1 CIKAMPEK',
  'SMAN 1 KOTABARU',
  'SMKN 1 KOTABARU',
  'SMKN 1 KARAWANG',
  'SMKN 2 KARAWANG',
  'SMKN 3 KARAWANG',
  'SMAN 1 KARAWANG',
  'SMAN 2 KARAWANG',
  'SMAN 3 KARAWANG',
  'SMAN 4 KARAWANG',
  'SMAN 5 KARAWANG',
  'SMK TEKNOLOGI KARAWANG',
  'SMK TARUNA KARYA 1 KARAWANG',
  'SMK TARUNA KARYA 2 KARAWANG',
  'SMK BINA KARYA 1 KARAWANG',
  'SMK BINA KARYA 2 KARAWANG',
  'SMK TI MUHAMMADIYAH 1 CIKAMPEK',
  'SMK KARYA UTAMA KARAWANG',
  'SMK PGRI 1 KARAWANG',
  'SMK PGRI 2 KARAWANG',
  'SMK TEXMACO KARAWANG',
  'SMAN 1 PURWAKARTA',
  'SMKN 1 PURWAKARTA',
  'SMAN 1 SUBANG',
  'SMKN 1 SUBANG',
  'SMAN 1 BEKASI',
  'SMKN 1 BEKASI',
  'SMAN 1 SRAGEN',
  'SMAN 2 SRAGEN',
  'SMKN 1 SRAGEN',
  'SMKN 2 SRAGEN',
  'MAN 1 KARAWANG',
];

export const INDONESIAN_ACADEMIC_INSTITUTIONS: string[] = [
  ...INDONESIAN_UNIVERSITIES,
  ...INDONESIAN_SCHOOLS_COMMON,
];

const generatedYears: string[] = [];
for (let y = 2030; y >= 1960; y--) {
  generatedYears.push(String(y));
}
export const YEAR_OPTIONS: string[] = generatedYears;

export const OCCUPATION_OPTIONS: string[] = [
  'KARYAWAN SWASTA',
  'WIRASWASTA / PEDAGANG',
  'PNS / APARATUR SIPIL NEGARA (ASN)',
  'TNI / POLRI',
  'KARYAWAN BUMN / BUMD',
  'BURUH PABRIK / MANUFAKTUR',
  'PETANI / PETERNAK / NELAYAN',
  'GURU / DOSEN / TENAGA PENDIDIK',
  'DOKTER / TENAGA MEDIS / BIDAN / PERAWAT',
  'IBU RUMAH TANGGA',
  'PELAJAR / MAHASISWA',
  'PENSIUNAN',
  'BELUM / TIDAK BEKERJA',
  'LAINNYA',
];

export const EDUCATION_LEVEL_OPTIONS: string[] = [
  'BELUM SEKOLAH',
  'PAUD / TK',
  'SD / SEDERAJAT',
  'SMP / MTS',
  'SMA / SMK / MA',
  'D1',
  'D2',
  'D3',
  'D4',
  'S1',
  'S2',
  'S3',
];

export const INDONESIAN_MAJORS: string[] = [
  // SMA / MA
  'IPA (ILMU PENGETAHUAN ALAM)',
  'IPS (ILMU PENGETAHUAN SOSIAL)',
  'BAHASA DAN BUDAYA',
  'AGAMA',

  // SMK - IT, Komputer & Elektronika
  'TEKNIK KOMPUTER DAN JARINGAN (TKJ)',
  'REKAYASA PERANGKAT LUNAK (RPL)',
  'MULTIMEDIA',
  'DESAIN KOMUNIKASI VISUAL (DKV)',
  'SISTEM INFORMATIKA JARINGAN DAN APLIKASI (SIJA)',
  'TEKNIK ELEKTRONIKA INDUSTRI',
  'TEKNIK MEKATRONIKA',
  'TEKNIK KETENAGALISTRIKAN / LISTRIK',
  'TEKNIK OTOMASI INDUSTRI',

  // SMK - Mesin, Otomotif & Manufaktur
  'TEKNIK MESIN',
  'TEKNIK PEMESINAN',
  'TEKNIK KENDARAAN RINGAN (TKR)',
  'TEKNIK DAN BISNIS SEPEDA MOTOR (TBSM)',
  'TEKNIK ALAT BERAT',
  'TEKNIK PENGELASAN (WELDING)',
  'TEKNIK FABRIKASI LOGAM DAN MANUFAKTUR',
  'TEKNIK PENGECORAN LOGAM',
  'TEKNIK KIMIA INDUSTRI',
  'ANALISIS PENGUJIAN LABORATORIUM',

  // SMK - Bisnis, Administrasi & Services
  'AKUNTANSI DAN KEUANGAN LEMBAGA (AKL)',
  'OTOMATISASI DAN TATA KELOLA PERKANTORAN (OTKP)',
  'BISNIS DARING DAN PEMASARAN (BDP)',
  'MANAJEMEN LOGISTIK',
  'FARMASI KLINIS DAN KOMUNITAS',
  'KESEHATAN DAN LAYANAN SOSIAL',

  // Perguruan Tinggi - IT & Komputer (D3 / D4 / S1 / S2)
  'TEKNIK INFORMATIKA',
  'SISTEM INFORMASI',
  'TEKNIK KOMPUTER',
  'ILMU KOMPUTER',
  'TEKNOLOGI INFORMASI',
  'REKAYASA PERANGKAT LUNAK (SOFTWARE ENGINEERING)',
  'SAINS DATA (DATA SCIENCE)',
  'SISTEM KOMPUTER',
  'KEAMANAN SIBER (CYBER SECURITY)',
  'TEKNOLOGI REKAYASA INTERNET',

  // Perguruan Tinggi - Teknik & Manufaktur
  'TEKNIK INDUSTRI',
  'TEKNIK ELEKTRO',
  'TEKNIK MEKATRONIKA & ROBOTIKA',
  'TEKNIK MATERIAL & METALURGI',
  'TEKNIK KIMIA',
  'TEKNIK SIPIL',
  'TEKNIK LINGKUNGAN',
  'TEKNIK FISIKA',
  'TEKNIK OTOMOTIF',
  'MANUFAKTUR & TEKNOLOGI PROSES',

  // Perguruan Tinggi - Ekonomi, Bisnis & Manajemen
  'MANAJEMEN',
  'MANAJEMEN BISNIS',
  'AKUNTANSI',
  'EKONOMI PEMBANGUNAN',
  'KEUANGAN & PERBANKAN',
  'ADMINISTRASI BISNIS / NIAGA',
  'MANAJEMEN RANTAI PASOK (SUPPLY CHAIN & LOGISTICS)',
  'BISNIS DIGITAL',

  // Perguruan Tinggi - Sosial, Humaniora & Desain
  'ILMU KOMUNIKASI',
  'HUBUNGAN MASYARAKAT (PUBLIC RELATIONS)',
  'DESAIN PRODUK INDUSTRI',
  'HUKUM',
  'PSIKOLOGI',
  'ADMINISTRASI PUBLIK / NEGARA',
  'HUBUNGAN INTERNASIONAL',
  'SASTRA INGGRIS',
  'SASTRA JEPANG',

  // Perguruan Tinggi - Sains & Kesehatan
  'STATISTIKA',
  'MATEMATIKA',
  'FISIKA',
  'KIMIA',
  'BIOLOGI',
  'KESEHATAN DAN KESELAMATAN KERJA (K3)',
  'KESEHATAN MASYARAKAT',

  // Lainnya
  'SEMUA JURUSAN / LAINNYA',
];
