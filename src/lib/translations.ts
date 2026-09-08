export type Language = 'en' | 'id';

export interface CareerTranslations {
  // Navigation
  nav_jobs: string;
  nav_stages: string;
  nav_portal: string;
  nav_login: string;
  nav_admin: string;

  // Hero Section
  hero_badge: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_subtitle: string;
  hero_btn_explore: string;
  hero_btn_portal: string;
  hero_stat_plants: string;
  hero_stat_plants_sub: string;
  hero_stat_oem: string;
  hero_stat_oem_sub: string;
  hero_stat_culture: string;
  hero_stat_culture_sub: string;

  // Search & Filter
  search_placeholder: string;
  dept_filter_all: string;
  dept_filter_label: string;
  results_count: string;

  // 7 Stages
  stages_badge: string;
  stages_title: string;
  stages_subtitle: string;
  stages_free_banner: string;
  stage_1_title: string;
  stage_1_desc: string;
  stage_2_title: string;
  stage_2_desc: string;
  stage_3_title: string;
  stage_3_desc: string;
  stage_4_title: string;
  stage_4_desc: string;
  stage_5_title: string;
  stage_5_desc: string;
  stage_6_title: string;
  stage_6_desc: string;
  stage_7_title: string;
  stage_7_desc: string;

  // Job Cards
  jobs_badge: string;
  jobs_title: string;
  jobs_subtitle: string;
  job_dept: string;
  job_loc: string;
  job_type: string;
  job_exp: string;
  job_req: string;
  job_btn_details: string;
  job_btn_apply: string;
  job_empty_title: string;
  job_empty_desc: string;
  job_full_time: string;

  // Job Detail Modal
  modal_title: string;
  modal_desc_header: string;
  modal_req_header: string;
  modal_btn_apply: string;
  modal_btn_close: string;

  // Footer
  footer_about: string;
  footer_security: string;
  footer_plants: string;
  footer_plant_1_title: string;
  footer_plant_1_desc: string;
  footer_plant_2_title: string;
  footer_plant_2_desc: string;
  footer_rights: string;
  footer_sub: string;
}

export const translations: Record<Language, CareerTranslations> = {
  en: {
    // Navigation
    nav_jobs: 'Job Vacancies',
    nav_stages: '7 Selection Stages',
    nav_portal: 'Applicant Portal',
    nav_login: 'Login',
    nav_admin: 'Staff Login',

    // Hero Section
    hero_badge: 'OFFICIAL RECRUITMENT PORTAL PT ITSP',
    hero_title_1: 'Build Your Future Career With',
    hero_title_2: 'Automotive Innovation Leaders',
    hero_subtitle: 'Join our world-class automotive manufacturing team. Explore high-impact career opportunities in plastic injection molding, precision tooling, robotic spray painting, and interior assembly.',
    hero_btn_explore: 'Explore Openings',
    hero_btn_portal: 'Check Application Status',
    hero_stat_plants: '2 Modern Plants',
    hero_stat_plants_sub: 'Karawang & Cikarang',
    hero_stat_oem: 'Tier-1 OEM Partner',
    hero_stat_oem_sub: 'Global Automotive Standards',
    hero_stat_culture: 'Merit-Based Culture',
    hero_stat_culture_sub: 'Transparent & Equal Hiring',

    // Search & Filter
    search_placeholder: 'Search position, department, or location...',
    dept_filter_all: 'All Departments',
    dept_filter_label: 'Department',
    results_count: 'Available Vacancies Found',

    // 7 Stages
    stages_badge: 'TRANSPARENT RECRUITMENT',
    stages_title: '7 Steps of Integrated Selection Process',
    stages_subtitle: 'Our recruitment process is completely transparent, merit-based, and 100% FREE OF CHARGE at every stage. Beware of fraudulent job offers.',
    stages_free_banner: 'PT Indonesia Thai Summit Plastech NEVER charges fees for any recruitment process or accommodation.',
    stage_1_title: '1. Administrative & CV Screening',
    stage_1_desc: 'Document verification and profile screening against department requirements.',
    stage_2_title: '2. Online Psychometric & Aptitude Test',
    stage_2_desc: 'Standardized psychological assessment and aptitude test via our secure online portal.',
    stage_3_title: '3. HR In-Depth Interview',
    stage_3_desc: 'Comprehensive interview evaluating cultural alignment, motivation, and career aspirations.',
    stage_4_title: '4. Technical Skill & User Interview',
    stage_4_desc: 'Practical technical assessment and direct interview with department heads.',
    stage_5_title: '5. Medical Check-Up (MCU)',
    stage_5_desc: 'Occupational health and physical fitness examination at certified medical partner clinics.',
    stage_6_title: '6. Formal Offering Letter',
    stage_6_desc: 'Official employment offer detailing compensation, benefits, and workplace terms.',
    stage_7_title: '7. Induction & Onboarding',
    stage_7_desc: 'Company orientation, industrial safety guidelines, and workplace introduction.',

    // Job Cards
    jobs_badge: 'CURRENT OPENINGS',
    jobs_title: 'Open Career Opportunities',
    jobs_subtitle: 'Discover impactful roles that match your expertise and passion in the automotive industry.',
    job_dept: 'Department',
    job_loc: 'Location',
    job_type: 'Job Type',
    job_exp: 'Experience',
    job_req: 'Key Requirements',
    job_btn_details: 'View Details',
    job_btn_apply: 'Apply Now',
    job_empty_title: 'No Job Vacancies Found',
    job_empty_desc: 'No current job openings match your search criteria. Please try another keyword or department.',
    job_full_time: 'Full Time',

    // Job Detail Modal
    modal_title: 'Job Details & Role Specifications',
    modal_desc_header: 'Job Description & Responsibilities',
    modal_req_header: 'Candidate Requirements & Qualifications',
    modal_btn_apply: 'Apply for This Position',
    modal_btn_close: 'Close',

    // Footer
    footer_about: 'Tier-1 automotive plastic injection molding, precision painting, and interior assembly manufacturing. Proud member of global Thai Summit Group.',
    footer_security: 'Protected & Isolated Recruitment System (MFA + Secure Proctoring)',
    footer_plants: 'PT ITSP MANUFACTURING PLANTS',
    footer_plant_1_title: 'PLANT 1 (KARAWANG)',
    footer_plant_1_desc: 'KIIC Industrial Estate, Jl. Permata Raya Lot FF-3, Sirnabaya, Telukjambe Timur, Karawang, West Java 41361.',
    footer_plant_2_title: 'PLANT 2 (CIKARANG)',
    footer_plant_2_desc: 'Greenland International Industrial Center (GIIC) Block CD No. 01, Deltamas, Central Cikarang, Bekasi, West Java 17530.',
    footer_rights: 'PT Indonesia Thai Summit Plastech. All rights reserved.',
    footer_sub: 'Integrated Recruitment Portal & Official ATS',
  },
  id: {
    // Navigation
    nav_jobs: 'Lowongan Kerja',
    nav_stages: '7 Tahap Seleksi',
    nav_portal: 'Portal Pelamar',
    nav_login: 'Login',
    nav_admin: 'Login Pegawai',

    // Hero Section
    hero_badge: 'PORTAL RESMI REKRUTMEN PT ITSP',
    hero_title_1: 'Bangun Karir Masa Depan Anda Bersama',
    hero_title_2: 'Pemimpin Inovasi Otomotif',
    hero_subtitle: 'Bergabunglah dengan tim manufaktur otomotif kelas dunia. Temukan peluang karir strategis di bidang plastic injection molding, tooling presisi, pengecatan robotik, dan perakitan interior.',
    hero_btn_explore: 'Jelajahi Lowongan',
    hero_btn_portal: 'Cek Status Lamaran',
    hero_stat_plants: '2 Pabrik Modern',
    hero_stat_plants_sub: 'Karawang & Cikarang',
    hero_stat_oem: 'Mitra OEM Tier-1',
    hero_stat_oem_sub: 'Standar Otomotif Global',
    hero_stat_culture: 'Budaya Meritokrasi',
    hero_stat_culture_sub: 'Transparan & Setara',

    // Search & Filter
    search_placeholder: 'Cari posisi, departemen, atau lokasi...',
    dept_filter_all: 'Semua Departemen',
    dept_filter_label: 'Departemen',
    results_count: 'Lowongan Tersedia Ditemukan',

    // 7 Stages
    stages_badge: 'REKRUTMEN TRANSPARAN',
    stages_title: '7 Tahapan Seleksi Rekrutmen Terpadu',
    stages_subtitle: 'Seluruh proses rekrutmen kami transparan, berbasis kompetensi, dan 100% BEBAS BIAYA di seluruh tahap. Waspadai penipuan mengatasnamakan perusahaan.',
    stages_free_banner: 'PT Indonesia Thai Summit Plastech TIDAK PERNAH memungut biaya apapun untuk proses seleksi atau akomodasi.',
    stage_1_title: '1. Seleksi Administrasi & Berkas',
    stage_1_desc: 'Pemeriksaan kelengkapan dokumen dan kesesuaian kualifikasi dengan kriteria posisi.',
    stage_2_title: '2. Psikotes & Tes Bakat Online',
    stage_2_desc: 'Asesmen psikologi terstandar dan uji potensi bakat melalui sistem portal online.',
    stage_3_title: '3. Wawancara HRD Mendalam',
    stage_3_desc: 'Evaluasi kepribadian, kesesuaian budaya kerja, motivasi, dan rekam jejak pelamar.',
    stage_4_title: '4. Uji Teknis & Wawancara User',
    stage_4_desc: 'Uji kompetensi teknis praktis dan wawancara langsung dengan kepala departemen.',
    stage_5_title: '5. Pemeriksaan Kesehatan (MCU)',
    stage_5_desc: 'Pemeriksaan kesehatan kerja menyeluruh di klinik atau rumah sakit mitra resmi.',
    stage_6_title: '6. Penawaran Kerja (Offering Letter)',
    stage_6_desc: 'Penerbitan surat penawaran kerja resmi mencakup kompensasi, tunjangan, dan status.',
    stage_7_title: '7. Induksi & Onboarding',
    stage_7_desc: 'Orientasi pengenalan perusahaan, prosedur keselamatan kerja industri, dan penempatan.',

    // Job Cards
    jobs_badge: 'PELUANG TERBUKA',
    jobs_title: 'Peluang Karir Terbuka',
    jobs_subtitle: 'Temukan posisi yang sesuai dengan keahlian dan minat profesional Anda di industri otomotif.',
    job_dept: 'Departemen',
    job_loc: 'Lokasi',
    job_type: 'Tipe Kerja',
    job_exp: 'Pengalaman',
    job_req: 'Persyaratan Utama',
    job_btn_details: 'Lihat Rincian',
    job_btn_apply: 'Lamar Sekarang',
    job_empty_title: 'Tidak Ada Lowongan Ditemukan',
    job_empty_desc: 'Belum ada lowongan yang sesuai dengan kata kunci atau filter pencarian Anda.',
    job_full_time: 'Penuh Waktu',

    // Job Detail Modal
    modal_title: 'Rincian Lowongan & Spesifikasi Posisi',
    modal_desc_header: 'Deskripsi & Tanggung Jawab Pekerjaan',
    modal_req_header: 'Kualifikasi & Persyaratan Kandidat',
    modal_btn_apply: 'Lamar Posisi Ini',
    modal_btn_close: 'Tutup',

    // Footer
    footer_about: 'Manufaktur otomotif plastic injection molding, spray painting presisi, dan perakitan interior. Bagian dari Thai Summit Group global.',
    footer_security: 'Sistem Rekrutmen Terisolasi & Terproteksi (MFA + Proctoring Aman)',
    footer_plants: 'LOKASI PABRIK PT ITSP',
    footer_plant_1_title: 'PLANT 1 (KARAWANG)',
    footer_plant_1_desc: 'Kawasan Industri KIIC, Jl. Permata Raya Lot FF-3, Sirnabaya, Telukjambe Timur, Karawang, Jawa Barat 41361.',
    footer_plant_2_title: 'PLANT 2 (CIKARANG)',
    footer_plant_2_desc: 'Greenland International Industrial Center (GIIC) Blok CD No. 01, Kota Deltamas, Cikarang Pusat, Bekasi, Jawa Barat 17530.',
    footer_rights: 'PT Indonesia Thai Summit Plastech. Seluruh hak cipta dilindungi undang-undang.',
    footer_sub: 'Sistem Rekrutmen Terpadu & Portal Karir Resmi (ATS)',
  },
};
