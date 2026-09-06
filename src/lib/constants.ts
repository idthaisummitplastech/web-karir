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
  mcuPartnerName: "Klinik Kimia Farma Karawang / RS Permata Keluarga Cikarang",
  mcuPartnerAddress: "Jl. Galuh Mas Raya No. 12, Sukaharja, Telukjambe Timur, Karawang (Telp: 0267-8451234)",
  mcuEstimatedCost: "Rp 250.000 – Rp 350.000 (Disesuaikan dengan paket standar PT ITSP)",
  mcuInstructions: "Peserta wajib berpuasa selama 10 jam sebelum tes darah (hanya diperbolehkan minum air putih tanpa gula). Datang sebelum pukul 09.00 WIB dengan membawa KTP dan surat pengantar rujukan ini. Hasil tes akan dikirimkan langsung oleh pihak klinik/RS ke HR PT ITSP.",
  plantAddressKarawang: "Plant 1: Kawasan Industri KIIC, Jl. Permata Raya Lot FF-3, Sirnabaya, Telukjambe Timur, Karawang, Jawa Barat 41361",
  plantAddressCikarang: "Plant 2: Kawasan Greenland International Industrial Center (GIIC) Blok CD No. 01, Deltamas, Cikarang Pusat, Bekasi, Jawa Barat 17530",
};
