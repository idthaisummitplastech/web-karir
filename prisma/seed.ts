import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

function getSeedPassword(envName: string): string {
  const v = process.env[envName];
  if (v && v.length >= 12) return v;
  // Tanpa hardcoded di code: generate acak aman bila env tidak diisi.
  return `Seed-${crypto.randomBytes(12).toString("hex")}!Aa1`;
}

async function main() {
  console.log("Seeding web-karir database...");

  // 1. Master Settings
  const settings = [
    { key: "mcu_partner_name", value: "Klinik Kimia Farma Karawang / RS Permata Keluarga Cikarang" },
    { key: "mcu_partner_address", value: "Jl. Galuh Mas Raya No. 12, Sukaharja, Telukjambe Timur, Karawang (Telp: 0267-8451234)" },
    { key: "mcu_estimated_cost", value: "Rp 250.000 – Rp 350.000" },
    { key: "mcu_instructions", value: "Peserta wajib puasa 10 jam sebelum tes darah (hanya minum air putih tawar). Membawa KTP asli & surat pengantar rujukan. Hasil pemeriksaan dikirim langsung oleh pihak RS ke HR PT ITSP." },
    { key: "plant_address_karawang", value: "Plant 1: Kawasan Industri KIIC, Jl. Permata Raya Lot FF-3, Sirnabaya, Karawang Barat 41361" },
    { key: "plant_address_cikarang", value: "Plant 2: Greenland International Industrial Center (GIIC) Blok CD No. 01, Deltamas, Cikarang Pusat 17530" },
  ];

  for (const s of settings) {
    await prisma.recruitmentSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 2. Default Admins (HR, User Dept, Super Admin) — password WAJIB via env (SEED_ADMIN_PASSWORD).
  const hashedPass = await bcrypt.hash(getSeedPassword("SEED_ADMIN_PASSWORD"), 10);
  const admins = [
    {
      username: "hr.recruitment",
      name: "Siti Rahmawati, S.Psi - HR Officer",
      email: "recruitment@itsp.co.id",
      password: hashedPass,
      role: "hr",
      department: "Human Capital",
    },
    {
      username: "user.engineering",
      name: "Hendro Wijaya, S.T. - SPV Mold Engineering",
      email: "eng.supervisor@itsp.co.id",
      password: hashedPass,
      role: "user_dept",
      department: "Engineering",
    },
    {
      username: "admin",
      name: "System Administrator ATS",
      email: "sysadmin@itsp.co.id",
      password: hashedPass,
      role: "admin",
      department: "IT",
    },
  ];

  for (const a of admins) {
    await prisma.recruitmentAdmin.upsert({
      where: { username: a.username },
      update: { password: hashedPass, role: a.role, name: a.name },
      create: a,
    });
  }

  // 3. Lowongan Kerja Aktif
  const jobs = [
    {
      title: "Staff IT & Enterprise System",
      department: "Information Technology",
      location: "Plant 1 Karawang",
      type: "Full-Time",
      experience: "1-3 Tahun",
      requirements: "S1 Teknik Informatika / Sistem Informasi. Menguasai Web Development, SQL Database, Linux/Windows Server, & Network Troubleshooting.",
      description: "Bertanggung jawab atas pemeliharaan infrastruktur jaringan pabrik, aplikasi internal manufaktur, serta dukungan teknis user plant.",
      isOpen: true,
    },
    {
      title: "Mold Maintenance & Injection Technician",
      department: "Engineering",
      location: "Plant 1 Karawang",
      type: "Full-Time",
      experience: "Minimal 2 Tahun",
      requirements: "D3/S1 Teknik Mesin / Manufaktur. Memahami proses plastic injection moulding, perawatan cetakan (mold), setting mesin injection, dan preventive maintenance.",
      description: "Melakukan perawatan rutin mold plastik otomotif, penanganan troubleshooting mesin injection molding, dan optimasi siklus produksi.",
      isOpen: true,
    },
    {
      title: "Quality Control (QC) Line Inspector",
      department: "Quality Assurance",
      location: "Plant 2 Cikarang",
      type: "Full-Time",
      experience: "1-2 Tahun",
      requirements: "SMK / D3 Teknik. Menguasai alat ukur (CMM, Caliper, Micrometer, Height Gauge), gambar teknik otomotif, dan standar ISO 9001 / IATF 16949.",
      description: "Melakukan inspeksi berkala pada produk komponen interior & eksterior plastik mobil/motor, memastikan zero defect sebelum pengiriman ke customer.",
      isOpen: true,
    },
    {
      title: "Operator Produksi Injection Moulding",
      department: "Produksi",
      location: "Plant 1 Karawang",
      type: "Full-Time",
      experience: "Fresh Graduate / Pengalaman 1 Tahun",
      requirements: "SMK Jurusan Mesin / Otomotif / Listrik / IPA. Usia 18-24 tahun, tinggi badan pria min 165 cm, wanita min 155 cm, teliti, disiplin, siap kerja 3 shift.",
      description: "Mengoperasikan mesin injection plastic, memeriksa hasil cetakan secara visual, trimming runner, dan pengepakan komponen sesuai instruksi kerja (IK).",
      isOpen: true,
    },
    {
      title: "HSE Officer (K3 & Lingkungan Pabrik)",
      department: "HSE",
      location: "Plant 1 Karawang",
      type: "Full-Time",
      experience: "Minimal 2 Tahun",
      requirements: "D3/S1 K3 / Teknik Lingkungan. Memiliki sertifikat Ahli K3 Umum Kemenaker aktif. Memahami ISO 14001, ISO 45001, dan PROPER.",
      description: "Mengelola keselamatan kerja di area pabrik injection, inspeksi APD & peralatan K3, analisis risiko kerja (JSA/HIRADC), serta pelaporan lingkungan.",
      isOpen: true,
    },
  ];

  for (const j of jobs) {
    const existing = await prisma.jobPosting.findFirst({ where: { title: j.title } });
    if (!existing) {
      await prisma.jobPosting.create({ data: j });
    }
  }

  // 4. Soal Psikotes Online (10 Soal)
  const psikotesQuestions = [
    {
      category: "psikotes",
      department: "General",
      question: "Jika deret angka adalah: 3, 6, 12, 24, 48, ..., berapakah angka selanjutnya?",
      options: JSON.stringify(["72", "96", "84", "108"]),
      correctKey: "B",
      points: 10,
      sortOrder: 1,
    },
    {
      category: "psikotes",
      department: "General",
      question: "MOBIL : BENSIN = MANUSIA : ... ?",
      options: JSON.stringify(["Makanan", "Oksigen", "Energi", "Rumah"]),
      correctKey: "A",
      points: 10,
      sortOrder: 2,
    },
    {
      category: "psikotes",
      department: "General",
      question: "Semua komponen plastik yang diproduksi di Plant 1 lolos uji mutu IATF. Beberapa part interior mobil dibuat di Plant 1. Kesimpulannya adalah:",
      options: JSON.stringify([
        "Semua part interior mobil lolos uji mutu IATF",
        "Beberapa part interior mobil lolos uji mutu IATF",
        "Part interior mobil tidak memerlukan sertifikasi IATF",
        "Plant 1 hanya memproduksi part motor"
      ]),
      correctKey: "B",
      points: 10,
      sortOrder: 3,
    },
    {
      category: "psikotes",
      department: "General",
      question: "Suatu mesin injection mampu mencetak 120 komponen plastik dalam waktu 30 menit. Berapa komponen yang dapat dicetak dalam waktu 2,5 jam jika mesin beroperasi stabil tanpa hambatan?",
      options: JSON.stringify(["480 komponen", "600 komponen", "550 komponen", "720 komponen"]),
      correctKey: "B",
      points: 10,
      sortOrder: 4,
    },
    {
      category: "psikotes",
      department: "General",
      question: "Lawan kata (Antonim) dari kata 'KONSERVATIF' adalah:",
      options: JSON.stringify(["Tradisional", "Modern / Progresif", "Kuno", "Statis"]),
      correctKey: "B",
      points: 10,
      sortOrder: 5,
    },
    {
      category: "psikotes",
      department: "General",
      question: "Sebuah palet memuat 4 kotak karton, tiap kotak berisi 25 pcs produk plastik. Jika customer memesan 1.500 pcs produk, berapa banyak palet yang harus disiapkan?",
      options: JSON.stringify(["12 palet", "15 palet", "18 palet", "20 palet"]),
      correctKey: "B",
      points: 10,
      sortOrder: 6,
    },
    {
      category: "psikotes",
      department: "General",
      question: "Deret huruf: B, D, G, K, P, ..., huruf apakah selanjutnya?",
      options: JSON.stringify(["T", "U", "V", "W"]),
      correctKey: "C",
      points: 10,
      sortOrder: 7,
    },
    {
      category: "psikotes",
      department: "General",
      question: "Ketika Anda melihat rekan kerja Anda melakukan pelanggaran prosedur keselamatan (K3) di dekat mesin bertekanan tinggi, tindakan terbaik Anda adalah:",
      options: JSON.stringify([
        "Membiarkannya karena bukan urusan dan tugas saya",
        "Menegur dan mengingatkannya secara langsung dengan sopan demi keselamatan bersama, serta melapor ke supervisor jika diabaikan",
        "Menunggu sampai terjadi insiden baru melapor",
        "Merekam video dan membagikannya ke media sosial"
      ]),
      correctKey: "B",
      points: 10,
      sortOrder: 8,
    },
    {
      category: "psikotes",
      department: "General",
      question: "Berapakah 15% dari 2.400.000?",
      options: JSON.stringify(["320.000", "360.000", "380.000", "420.000"]),
      correctKey: "B",
      points: 10,
      sortOrder: 9,
    },
    {
      category: "psikotes",
      department: "General",
      question: "Dalam budaya kerja Jepang dan industri manufaktur otomotif, istilah 'KAIZEN' bermakna:",
      options: JSON.stringify([
        "Pemberian bonus tahunan",
        "Perbaikan berkesinambungan secara terus-menerus (Continuous Improvement)",
        "Pengurangan jumlah karyawan",
        "Pembersihan mesin seminggu sekali"
      ]),
      correctKey: "B",
      points: 10,
      sortOrder: 10,
    },
  ];

  for (const q of psikotesQuestions) {
    const existing = await prisma.testQuestion.findFirst({
      where: { category: "psikotes", sortOrder: q.sortOrder },
    });
    if (!existing) {
      await prisma.testQuestion.create({ data: q });
    }
  }

  // 5. Soal Tes Teknis / User Test (10 Soal)
  const userTestQuestions = [
    {
      category: "user_test",
      department: "Engineering",
      question: "Pada proses Plastic Injection Moulding, cacat produk berupa cekungan pada permukaan produk tebal akibat penyusutan material yang tidak merata disebut:",
      options: JSON.stringify(["Flash / Burrs", "Sink Mark", "Short Shot", "Silver Streaks"]),
      correctKey: "B",
      points: 10,
      sortOrder: 1,
    },
    {
      category: "user_test",
      department: "Engineering",
      question: "Jika lelehan resin plastik tidak mengisi rongga cetakan (mold cavity) secara penuh sehingga produk tidak terbentuk sempurna, cacat tersebut dinamakan:",
      options: JSON.stringify(["Short Shot", "Warpage", "Weld Line", "Ejector Mark"]),
      correctKey: "A",
      points: 10,
      sortOrder: 2,
    },
    {
      category: "user_test",
      department: "Engineering",
      question: "Material termoplastik yang umum digunakan untuk komponen interior otomotif karena ketahanan benturan dan elastisitas yang baik antara lain:",
      options: JSON.stringify(["PP (Polypropylene) & ABS", "Teflon murni", "PVC kaku", "Epoxy resin"]),
      correctKey: "A",
      points: 10,
      sortOrder: 3,
    },
    {
      category: "user_test",
      department: "Engineering",
      question: "Komponen pada cetakan (mold) yang berfungsi mendorong produk plastik keluar dari cavity setelah proses pendinginan selesai adalah:",
      options: JSON.stringify(["Runner", "Ejector Pin", "Sprue Bush", "Cooling Channel"]),
      correctKey: "B",
      points: 10,
      sortOrder: 4,
    },
    {
      category: "user_test",
      department: "Engineering",
      question: "Fungsi utama dari tahap 'Holding Pressure / Packing' dalam siklus injection molding adalah:",
      options: JSON.stringify([
        "Mendinginkan mold dengan oli hidrolik",
        "Menahan tekanan lelehan untuk mengkompensasi penyusutan (shrinkage) material saat mendingin",
        "Membuka cetakan lebih cepat",
        "Mencampur warna masterbatch"
      ]),
      correctKey: "B",
      points: 10,
      sortOrder: 5,
    },
    {
      category: "user_test",
      department: "Engineering",
      question: "Dalam prinsip 5S / 5R di tempat kerja industri, urutan yang benar adalah:",
      options: JSON.stringify([
        "Seiri, Seiton, Seiso, Seiketsu, Shitsuke (Ringkas, Rapi, Resik, Rawat, Rajin)",
        "Seiso, Seiton, Shitsuke, Seiri, Seiketsu",
        "Rapi, Ringkas, Rawat, Resik, Rajin",
        "Seiketsu, Seiri, Seiton, Seiso, Shitsuke"
      ]),
      correctKey: "A",
      points: 10,
      sortOrder: 6,
    },
    {
      category: "user_test",
      department: "Engineering",
      question: "Cacat 'Weld Line' pada produk plastik terjadi karena:",
      options: JSON.stringify([
        "Suhu cetakan terlalu dingin",
        "Pertemuan dua atau lebih aliran lelehan plastik yang menyatu namun tidak terikat sempurna di dalam cavity",
        "Clamping force mesin terlalu besar",
        "Pengeringan material (drying) terlalu lama"
      ]),
      correctKey: "B",
      points: 10,
      sortOrder: 7,
    },
    {
      category: "user_test",
      department: "Engineering",
      question: "Sistem sertifikasi manajemen mutu internasional yang khusus mengatur rantai pasok industri otomotif global adalah:",
      options: JSON.stringify(["ISO 14001", "IATF 16949", "ISO 22000", "OHSAS 18001"]),
      correctKey: "B",
      points: 10,
      sortOrder: 8,
    },
    {
      category: "user_test",
      department: "Engineering",
      question: "Apa tujuan utama penggunaan 'Dehumidifying Dryer' sebelum biji plastik (resin) masuk ke hopper mesin injection?",
      options: JSON.stringify([
        "Menghilangkan kadar air/kelembaban pada material higroskopis agar tidak timbul cacat silver streaks atau gelembung",
        "Mengubah warna plastik menjadi mengkilap",
        "Mencairkan plastik sebelum masuk barrel",
        "Mendinginkan material agar tidak menggumpal"
      ]),
      correctKey: "A",
      points: 10,
      sortOrder: 9,
    },
    {
      category: "user_test",
      department: "Engineering",
      question: "Alat pelindung diri (APD) standar wajib yang harus digunakan saat berada di lantai produksi mesin injection pabrik adalah:",
      options: JSON.stringify([
        "Safety shoes, earplug/earmuff, kacamata safety, dan seragam kerja pabrik",
        "Sandal jepit dan sarung tangan wol",
        "Jas hujan dan payung",
        "Helm proyek tanpa sepatu keselamatan"
      ]),
      correctKey: "A",
      points: 10,
      sortOrder: 10,
    },
  ];

  for (const q of userTestQuestions) {
    const existing = await prisma.testQuestion.findFirst({
      where: { category: "user_test", sortOrder: q.sortOrder },
    });
    if (!existing) {
      await prisma.testQuestion.create({ data: q });
    }
  }

  console.log("Seeding web-karir database complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
