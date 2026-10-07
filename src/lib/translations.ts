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

  // Admin — Users (ATS)
  admin_users_accessDeniedTitle: string;
  admin_users_accessDeniedDesc: string;
  admin_users_backToApplicants: string;
  admin_users_title: string;
  admin_users_subtitle: string;
  admin_users_searchPlaceholder: string;
  admin_users_mobileEmptyFiltered: string;
  admin_users_mobileEmptyAll: string;
  admin_users_deptPrefix: string;
  admin_users_chipActive: string;
  admin_users_chipInactive: string;
  admin_users_chipOff: string;
  admin_users_portalBoth: string;
  admin_users_portalCompany: string;
  admin_users_portalKarir: string;
  admin_users_mfaActiveLong: string;
  admin_users_mfaInactiveLong: string;
  admin_users_mfaActive: string;
  admin_users_mfaInactive: string;
  admin_users_tableUsername: string;
  admin_users_tableRoleDept: string;
  admin_users_tableMfa: string;
  admin_users_tableActive: string;
  admin_users_tablePortalAccess: string;
  admin_users_tableAction: string;
  admin_users_roleHr: string;
  admin_users_roleDept: string;
  admin_users_roleAdmin: string;
  admin_users_tooltipEdit: string;
  admin_users_tooltipResetMfa: string;
  admin_users_tooltipDelete: string;
  admin_users_btnResetPassword: string;
  admin_users_btnResetMfa: string;
  admin_users_tableEmptyFiltered: string;
  admin_users_tableEmptyAll: string;
  admin_users_dialogResetTitle: string;
  admin_users_dialogResetUserLabel: string;
  admin_users_dialogNewPasswordLabel: string;
  admin_users_dialogNewPasswordPlaceholder: string;
  admin_users_dialogNewPasswordHelper: string;
  admin_users_btnCancel: string;
  admin_users_btnSaving: string;
  admin_users_btnSaveNewPassword: string;
  admin_users_btnResetting: string;
  admin_users_dialogAddTitle: string;
  admin_users_dialogAddDesc: string;
  admin_users_fieldUsername: string;
  admin_users_fieldFullName: string;
  admin_users_fieldEmail: string;
  admin_users_fieldRole: string;
  admin_users_fieldDept: string;
  admin_users_fieldDeptPlaceholder: string;
  admin_users_fieldPassword: string;
  admin_users_fieldPasswordHelper: string;
  admin_users_fieldPortalAccess: string;
  admin_users_switchActive: string;
  admin_users_switchInactive: string;
  admin_users_btnAddUser: string;
  admin_users_btnCreate: string;
  admin_users_btnCreating: string;
  admin_users_dialogEditTitle: string;
  admin_users_dialogEditDescPrefix: string;
  admin_users_fieldNewPasswordOpt: string;
  admin_users_fieldNewPasswordPlaceholder: string;
  admin_users_fieldNewPasswordHelper: string;
  admin_users_btnSaveChanges: string;
  admin_users_confirmResetMfa: string;
  admin_users_confirmResetMfaSuffix: string;
  admin_users_confirmDelete: string;
  admin_users_confirmDeleteDetail: string;
  admin_users_confirmDeleteSuffix: string;
  admin_users_alertToggleFailed: string;
  admin_users_alertPortalFailed: string;

  // Admin — Layout
  admin_layout_roleSuperAdmin: string;
  admin_layout_roleHr: string;
  admin_layout_roleDept: string;
  admin_layout_signOut: string;
  admin_layout_ariaOpenMenu: string;
  admin_layout_menuTitle: string;
  admin_layout_verifiedAccount: string;
  admin_layout_defaultUser: string;
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

    // Admin — Users (ATS)
    admin_users_accessDeniedTitle: 'Access Restricted — Super Administrator Only',
    admin_users_accessDeniedDesc: 'The Account Management, Staff Password Reset, and MFA Reset menu is strictly limited to Super Administrator PT ITSP. Your account does not have this administrative privilege to protect corporate data.',
    admin_users_backToApplicants: 'Back to Applicant Data',
    admin_users_title: 'Manage HR & Department User Accounts',
    admin_users_subtitle: 'Internal recruitment credential management, account password reset, and MFA reset if Authenticator device is lost.',
    admin_users_searchPlaceholder: 'Search name, username, email, role, or dept...',
    admin_users_mobileEmptyFiltered: 'No user accounts match your search criteria.',
    admin_users_mobileEmptyAll: 'No user account data yet.',
    admin_users_deptPrefix: 'Department:',
    admin_users_chipActive: 'Active',
    admin_users_chipInactive: 'Inactive',
    admin_users_chipOff: 'Off',
    admin_users_portalBoth: 'Both',
    admin_users_portalCompany: 'Company',
    admin_users_portalKarir: 'Career',
    admin_users_mfaActiveLong: 'MFA Enabled (Authenticator)',
    admin_users_mfaInactiveLong: 'MFA Not Enabled',
    admin_users_mfaActive: 'MFA Enabled',
    admin_users_mfaInactive: 'MFA Not Enabled',
    admin_users_tableUsername: 'Username',
    admin_users_tableRoleDept: 'Role & Department',
    admin_users_tableMfa: 'MFA',
    admin_users_tableActive: 'Active',
    admin_users_tablePortalAccess: 'Portal Access',
    admin_users_tableAction: 'Management Action',
    admin_users_roleHr: 'HR Recruitment',
    admin_users_roleDept: 'Department User',
    admin_users_roleAdmin: 'Super Admin',
    admin_users_tooltipEdit: 'Edit Account Data, Role & Department',
    admin_users_tooltipResetMfa: 'Reset MFA if phone lost / device changed',
    admin_users_tooltipDelete: 'Delete User Account',
    admin_users_btnResetPassword: 'Reset Password',
    admin_users_btnResetMfa: 'Reset MFA',
    admin_users_tableEmptyFiltered: 'No user accounts match your search criteria.',
    admin_users_tableEmptyAll: 'No user account data yet.',
    admin_users_dialogResetTitle: 'Reset Account Password',
    admin_users_dialogResetUserLabel: 'User:',
    admin_users_dialogNewPasswordLabel: 'New Password (leave blank for auto-generated)',
    admin_users_dialogNewPasswordPlaceholder: 'e.g. itsp2026! or leave blank',
    admin_users_dialogNewPasswordHelper: 'If left blank, the system will generate a secure random password.',
    admin_users_btnCancel: 'Cancel',
    admin_users_btnSaving: 'Saving...',
    admin_users_btnSaveNewPassword: 'Save New Password',
    admin_users_btnResetting: 'Resetting...',
    admin_users_dialogAddTitle: 'Add HR / Department User Account',
    admin_users_dialogAddDesc: 'Create credentials for HR or Department User with portal access control.',
    admin_users_fieldUsername: 'Login Username',
    admin_users_fieldFullName: 'Full Name & Title',
    admin_users_fieldEmail: 'Official Email',
    admin_users_fieldRole: 'Account Role',
    admin_users_fieldDept: 'Department',
    admin_users_fieldDeptPlaceholder: 'Select or type department',
    admin_users_fieldPassword: 'Initial Password',
    admin_users_fieldPasswordHelper: 'Default: Itsp@YYYY — user must change on first login if MFA not set.',
    admin_users_fieldPortalAccess: 'Portal Access',
    admin_users_switchActive: 'Active Account',
    admin_users_switchInactive: 'Inactive Account',
    admin_users_btnAddUser: 'Add User Account',
    admin_users_btnCreate: 'Create Account',
    admin_users_btnCreating: 'Creating...',
    admin_users_dialogEditTitle: 'Edit HR / Department User Account',
    admin_users_dialogEditDescPrefix: 'Update profile details, role, department, or password for:',
    admin_users_fieldNewPasswordOpt: 'New Password (Optional)',
    admin_users_fieldNewPasswordPlaceholder: 'Leave blank if not changing',
    admin_users_fieldNewPasswordHelper: 'Leave blank to keep the current password.',
    admin_users_btnSaveChanges: 'Save Changes',
    admin_users_confirmResetMfa: 'Reset Google Authenticator MFA settings for account',
    admin_users_confirmResetMfaSuffix: 'This account will be required to set up MFA again on next login.',
    admin_users_confirmDelete: 'Delete account',
    admin_users_confirmDeleteDetail: 'Are you sure you want to delete the account',
    admin_users_confirmDeleteSuffix: 'This account will be permanently deleted from the recruitment system and user database.',
    admin_users_alertToggleFailed: 'Failed to toggle active status',
    admin_users_alertPortalFailed: 'Failed to update portal access',

    // Admin — Layout
    admin_layout_roleSuperAdmin: '👑 Super Administrator',
    admin_layout_roleHr: '👤 HR Recruitment',
    admin_layout_roleDept: '🔧 Department User',
    admin_layout_signOut: 'Sign Out',
    admin_layout_ariaOpenMenu: 'Open navigation menu',
    admin_layout_menuTitle: 'ATS MANAGEMENT MENU',
    admin_layout_verifiedAccount: 'Verified Account',
    admin_layout_defaultUser: 'Internal ATS User',
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

    // Admin — Users (ATS)
    admin_users_accessDeniedTitle: 'Akses Ditolak — Khusus Super Administrator',
    admin_users_accessDeniedDesc: 'Menu Kelola Akun, Reset Password Staf, dan Reset MFA dibatasi secara ketat hanya untuk Super Administrator PT ITSP. Akun Anda tidak memiliki wewenang administratif ini demi menjaga keamanan data perusahaan.',
    admin_users_backToApplicants: 'Kembali ke Data Pelamar',
    admin_users_title: 'Kelola Akun HR & User Departemen',
    admin_users_subtitle: 'Manajemen kredensial tim internal rekrutmen, reset password akun, dan reset MFA jika perangkat Authenticator hilang.',
    admin_users_searchPlaceholder: 'Cari nama, username, email, role, atau dept...',
    admin_users_mobileEmptyFiltered: 'Tidak ada akun pengguna yang sesuai kriteria pencarian.',
    admin_users_mobileEmptyAll: 'Belum ada data akun pengguna.',
    admin_users_deptPrefix: 'Departemen:',
    admin_users_chipActive: 'Aktif',
    admin_users_chipInactive: 'Non-aktif',
    admin_users_chipOff: 'Off',
    admin_users_portalBoth: 'Keduanya',
    admin_users_portalCompany: 'Company',
    admin_users_portalKarir: 'Karir',
    admin_users_mfaActiveLong: 'MFA Aktif (Authenticator)',
    admin_users_mfaInactiveLong: 'MFA Belum Aktif',
    admin_users_mfaActive: 'MFA Aktif',
    admin_users_mfaInactive: 'MFA Belum Aktif',
    admin_users_tableUsername: 'Nama Pengguna',
    admin_users_tableRoleDept: 'Role & Departemen',
    admin_users_tableMfa: 'MFA',
    admin_users_tableActive: 'Aktif',
    admin_users_tablePortalAccess: 'Portal Access',
    admin_users_tableAction: 'Aksi Manajemen',
    admin_users_roleHr: 'HR Recruitment',
    admin_users_roleDept: 'User Departemen',
    admin_users_roleAdmin: 'Super Admin',
    admin_users_tooltipEdit: 'Edit Data, Role & Departemen Akun',
    admin_users_tooltipResetMfa: 'Reset MFA jika ponsel hilang / ganti perangkat',
    admin_users_tooltipDelete: 'Hapus Akun Pengguna',
    admin_users_btnResetPassword: 'Reset Password',
    admin_users_btnResetMfa: 'Reset MFA',
    admin_users_tableEmptyFiltered: 'Tidak ada akun pengguna yang sesuai kriteria pencarian.',
    admin_users_tableEmptyAll: 'Belum ada data akun pengguna.',
    admin_users_dialogResetTitle: 'Reset Password Akun',
    admin_users_dialogResetUserLabel: 'Pengguna:',
    admin_users_dialogNewPasswordLabel: 'Password Baru (Kosongkan untuk acak otomatis)',
    admin_users_dialogNewPasswordPlaceholder: 'Misal: itsp2026! atau kosongkan',
    admin_users_dialogNewPasswordHelper: 'Jika dikosongkan, sistem akan mengenerate password acak aman.',
    admin_users_btnCancel: 'Batal',
    admin_users_btnSaving: 'Menyimpan...',
    admin_users_btnSaveNewPassword: 'Simpan Password Baru',
    admin_users_btnResetting: 'Mereset...',
    admin_users_dialogAddTitle: 'Tambah Akun HR / User Departemen',
    admin_users_dialogAddDesc: 'Buat kredensial untuk HR atau User Departemen dengan kontrol akses portal.',
    admin_users_fieldUsername: 'Username Login',
    admin_users_fieldFullName: 'Nama Lengkap & Gelar',
    admin_users_fieldEmail: 'Email Resmi',
    admin_users_fieldRole: 'Role Akun',
    admin_users_fieldDept: 'Departemen',
    admin_users_fieldDeptPlaceholder: 'Pilih atau ketik departemen',
    admin_users_fieldPassword: 'Password Awal',
    admin_users_fieldPasswordHelper: 'Default: Itsp@YYYY — pengguna wajib ganti saat login pertama jika MFA belum diatur.',
    admin_users_fieldPortalAccess: 'Portal Access',
    admin_users_switchActive: 'Akun Aktif',
    admin_users_switchInactive: 'Akun Non-aktif',
    admin_users_btnAddUser: 'Tambah Akun Pengguna',
    admin_users_btnCreate: 'Buat Akun',
    admin_users_btnCreating: 'Membuat...',
    admin_users_dialogEditTitle: 'Ubah Akun HR / User Departemen',
    admin_users_dialogEditDescPrefix: 'Ubah rincian profil, role wewenang, departemen, atau password akun:',
    admin_users_fieldNewPasswordOpt: 'Password Baru (Opsional)',
    admin_users_fieldNewPasswordPlaceholder: 'Kosongkan jika tidak diubah',
    admin_users_fieldNewPasswordHelper: 'Kosongkan untuk mempertahankan password saat ini.',
    admin_users_btnSaveChanges: 'Simpan Perubahan',
    admin_users_confirmResetMfa: 'Reset pengaturan MFA Google Authenticator untuk akun',
    admin_users_confirmResetMfaSuffix: 'Akun ini akan diwajibkan melakukan setup MFA ulang pada login berikutnya.',
    admin_users_confirmDelete: 'Hapus akun',
    admin_users_confirmDeleteDetail: 'Apakah Anda yakin ingin menghapus akun',
    admin_users_confirmDeleteSuffix: 'Akun ini akan dihapus permanen dari sistem rekrutmen dan database pengguna.',
    admin_users_alertToggleFailed: 'Gagal mengubah status aktif',
    admin_users_alertPortalFailed: 'Gagal mengubah akses portal',

    // Admin — Layout
    admin_layout_roleSuperAdmin: '👑 Super Administrator',
    admin_layout_roleHr: '👤 HR Recruitment',
    admin_layout_roleDept: '🔧 User Departemen',
    admin_layout_signOut: 'Keluar',
    admin_layout_ariaOpenMenu: 'Buka menu navigasi',
    admin_layout_menuTitle: 'MENU MANAJEMEN ATS',
    admin_layout_verifiedAccount: 'Akun Terverifikasi',
    admin_layout_defaultUser: 'User Internal ATS',
  },
};
