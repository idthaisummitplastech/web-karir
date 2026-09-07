export interface StageInfo {
  number: number;
  id: string;
  name: string;
  shortName: string;
  description: string;
}

export const RECRUITMENT_STAGES: StageInfo[] = [
  {
    number: 1,
    id: "screening",
    name: "Screening Dokumen & CV",
    shortName: "Screening",
    description: "Verifikasi berkas administrasi dan riwayat kualifikasi oleh Tim HR PT ITSP.",
  },
  {
    number: 2,
    id: "psikotes",
    name: "Tes Psikotes Online",
    shortName: "Psikotes",
    description: "Ujian psikotes dan potensi akademik online dengan token sesi & pengawasan sistem anti-kecurangan.",
  },
  {
    number: 3,
    id: "user_test",
    name: "Tes Teknis / User Test",
    shortName: "Tes Teknis",
    description: "Uji kompetensi teknis dan spesialisasi sesuai departemen yang dilamar.",
  },
  {
    number: 4,
    id: "hr_interview",
    name: "Interview HR (Online / Onsite)",
    shortName: "Interview HR",
    description: "Wawancara kompetensi kepribadian & budaya kerja bersama Tim HRD PT ITSP.",
  },
  {
    number: 5,
    id: "user_interview",
    name: "Interview User Departemen",
    shortName: "Interview User",
    description: "Wawancara teknis mendalam bersama Kepala Departemen & Supervisor terkait.",
  },
  {
    number: 6,
    id: "mcu",
    name: "Medical Check-Up (MCU Rekanan)",
    shortName: "MCU",
    description: "Pemeriksaan kesehatan fisik di Klinik / RS Rekanan resmi PT ITSP. Laporan dikirimkan pihak RS langsung ke HR.",
  },
  {
    number: 7,
    id: "offering",
    name: "Offering Letter & Kontrak Kerja",
    shortName: "Offering",
    description: "Penerbitan surat penawaran kerja resmi, kompensasi & benefit, serta penandatanganan kontrak kerja fisik di pabrik.",
  },
];

export const DEFAULT_SETTINGS = {
  mcuPartnerName: "Klinik Kimia Farma Galuh Mas Karawang / RS Permata Keluarga Cikarang",
  mcuPartnerAddress: "Jl. Galuh Mas Raya No. 12, Sukaharja, Telukjambe Timur, Karawang (Telp: 0267-8451234)",
  mcuEstimatedCost: "Rp 250.000 – Rp 350.000 (Disesuaikan dengan paket standar PT ITSP)",
  mcuInstructions: "Peserta wajib berpuasa selama 10 jam sebelum tes darah (hanya diperbolehkan minum air putih tanpa gula). Datang sebelum pukul 09.00 WIB dengan membawa KTP dan surat pengantar rujukan ini. Hasil tes akan dikirimkan langsung oleh pihak klinik/RS ke HR PT ITSP.",
  plantAddressKarawang: "Plant 1: Kawasan Industri KIIC, Jl. Permata Raya Lot FF-3, Sirnabaya, Telukjambe Timur, Karawang, Jawa Barat 41361",
  plantAddressCikarang: "Plant 2: Kawasan Greenland International Industrial Center (GIIC) Blok CD No. 01, Deltamas, Cikarang Pusat, Bekasi, Jawa Barat 17530",
};

export interface PlantLocationDetail {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  address: string;
  mapsUrl: string;
  embedUrl: string;
}

export const PLANT_LOCATIONS: Record<string, PlantLocationDetail> = {
  kiic: {
    id: "kiic",
    name: "Plant 1 (KIIC Karawang)",
    shortName: "Plant 1 KIIC",
    badge: "Pabrik Utama Karawang",
    address: "Kawasan Industri KIIC, Jl. Permata Raya Lot FF-3, Sirnabaya, Telukjambe Timur, Karawang, Jawa Barat 41361",
    mapsUrl: "https://maps.google.com/?q=PT+Indonesia+Thai+Summit+Plastech+KIIC+Karawang",
    embedUrl: "https://maps.google.com/maps?q=PT+Indonesia+Thai+Summit+Plastech+KIIC+Karawang&t=&z=15&ie=UTF8&iwloc=&output=embed",
  },
  giic: {
    id: "giic",
    name: "Plant 2 (GIIC Cikarang)",
    shortName: "Plant 2 GIIC",
    badge: "Pabrik Baru Cikarang",
    address: "Kawasan Greenland International Industrial Center (GIIC) Blok CD No. 01, Kota Deltamas, Cikarang Pusat, Bekasi, Jawa Barat 17530",
    mapsUrl: "https://maps.google.com/?q=PT+Indonesia+Thai+Summit+Plastech+GIIC+Cikarang",
    embedUrl: "https://maps.google.com/maps?q=PT+Indonesia+Thai+Summit+Plastech+GIIC+Cikarang&t=&z=15&ie=UTF8&iwloc=&output=embed",
  },
  online: {
    id: "online",
    name: "Portal Karir Online PT ITSP",
    shortName: "Portal Online",
    badge: "Sistem ATS Online",
    address: "Online via Portal Karir & Rekrutmen PT ITSP",
    mapsUrl: "",
    embedUrl: "",
  },
};

export const DEFAULT_MCU_LOCATION = {
  name: "Klinik Kimia Farma Galuh Mas Karawang / RS Rekanan Resmi PT ITSP",
  address: "Jl. Galuh Mas Raya No. 12, Sukaharja, Telukjambe Timur, Karawang (Telp: 0267-8451234)",
  mapsUrl: "https://maps.google.com/?q=Klinik+Kimia+Farma+Galuh+Mas+Karawang",
  embedUrl: "https://maps.google.com/maps?q=Klinik+Kimia+Farma+Galuh+Mas+Karawang&t=&z=15&ie=UTF8&iwloc=&output=embed",
};

/**
 * Helper untuk mengekstrak URL rute peta Google Maps dari string lokasi, tautan langsung, atau tag iframe embed.
 */
export function getPlantMapsUrl(locationOrInput?: string | null): string {
  if (!locationOrInput) return "";
  const str = locationOrInput.trim();

  // 1. Jika input mengandung tag <iframe ... src="..."> ekstrak src-nya
  if (str.includes("<iframe") && str.includes("src=")) {
    const match = str.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      const embedSrc = match[1];
      const qMatch = embedSrc.match(/q=([^&]+)/);
      if (qMatch && qMatch[1]) {
        return `https://maps.google.com/?q=${qMatch[1]}`;
      }
      return embedSrc;
    }
  }

  // 2. Jika terdapat URL Google Maps di dalam teks (misal https://maps.app.goo.gl/... atau https://maps.google.com/...)
  const urlMatch = str.match(/(https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.com|www\.google\.com\/maps)[^\s"'>]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  // 3. Jika input adalah URL biasa
  if (str.startsWith("http://") || str.startsWith("https://")) {
    return str;
  }

  // 4. Deteksi kata kunci nama pabrik / klinik (klinik/MCU diprioritaskan agar alamat MCU tidak tertukar ke peta pabrik)
  const s = str.toLowerCase();
  if (s.includes("kimia farma") || s.includes("galuh mas") || s.includes("klinik") || s.includes("mcu") || s.includes("rumah sakit") || s.includes("rs ") || s.includes(" hospital")) {
    return DEFAULT_MCU_LOCATION.mapsUrl;
  }
  if (s.includes("kiic") || s.includes("karawang") || s.includes("plant 1")) {
    return PLANT_LOCATIONS.kiic.mapsUrl;
  }
  if (s.includes("giic") || s.includes("cikarang") || s.includes("deltamas") || s.includes("plant 2")) {
    return PLANT_LOCATIONS.giic.mapsUrl;
  }

  return "";
}

/**
 * Helper untuk mendapatkan URL Embed iframe (untuk ditanam di dashboard calon karyawan)
 */
export function getEmbedMapsUrl(locationOrInput?: string | null): string {
  if (!locationOrInput) return "";
  const str = locationOrInput.trim();

  // 1. Jika ada iframe tag
  if (str.includes("<iframe") && str.includes("src=")) {
    const match = str.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) return match[1];
  }

  // 2. Jika ada URL embed langsung
  const embedMatch = str.match(/(https?:\/\/(?:www\.)?google\.com\/maps\/embed[^\s"'>]+)/i);
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1];
  }

  const s = str.toLowerCase();
  if (s.includes("kimia farma") || s.includes("galuh mas") || s.includes("klinik") || s.includes("mcu") || s.includes("rumah sakit") || s.includes("rs ") || s.includes(" hospital")) {
    return DEFAULT_MCU_LOCATION.embedUrl;
  }
  if (s.includes("kiic") || s.includes("karawang") || s.includes("plant 1")) {
    return PLANT_LOCATIONS.kiic.embedUrl;
  }
  if (s.includes("giic") || s.includes("cikarang") || s.includes("deltamas") || s.includes("plant 2")) {
    return PLANT_LOCATIONS.giic.embedUrl;
  }

  // Jika berupa URL maps biasa, ubah ke query embed
  if (str.startsWith("https://maps.google.com/?q=")) {
    const query = str.replace("https://maps.google.com/?q=", "");
    return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  return "";
}

