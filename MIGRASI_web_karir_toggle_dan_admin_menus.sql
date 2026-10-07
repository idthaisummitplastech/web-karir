-- MIGRASI web_karir (DATABASE_URL)
-- Jalankan: psql "$DATABASE_URL" -f MIGRASI_web_karir_toggle_dan_admin_menus.sql
-- 1) recruitment_admins: toggle active + portal access
ALTER TABLE public.recruitment_admins ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE public.recruitment_admins ADD COLUMN IF NOT EXISTS portal_access TEXT DEFAULT 'both' NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='recruitment_admins_portal_access_check') THEN
    ALTER TABLE public.recruitment_admins ADD CONSTRAINT recruitment_admins_portal_access_check CHECK (portal_access IN ('perusahaan','karir','both'));
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS ix_recruitment_admins_is_active ON public.recruitment_admins(is_active);
CREATE INDEX IF NOT EXISTS ix_recruitment_admins_portal_access ON public.recruitment_admins(portal_access);
UPDATE public.recruitment_admins SET is_active = true WHERE is_active IS NULL;
UPDATE public.recruitment_admins SET portal_access = 'both' WHERE portal_access IS NULL OR portal_access = '';
COMMENT ON COLUMN public.recruitment_admins.is_active IS 'false = akun dinonaktifkan';
COMMENT ON COLUMN public.recruitment_admins.portal_access IS 'perusahaan | karir | both';

-- 2) admin_menus: menu admin dinamis (dipakai kedua portal, filter via portal+location)
CREATE TABLE IF NOT EXISTS public.admin_menus (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  portal TEXT NOT NULL DEFAULT 'karir' CHECK (portal IN ('perusahaan','karir','both')),
  location TEXT NOT NULL CHECK (location IN ('admin_sidebar','admin_top')),
  icon TEXT,
  section TEXT,
  sort_order integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  allowed_roles TEXT,
  parent_id integer REFERENCES public.admin_menus(id) ON DELETE CASCADE,
  created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_admin_menus_portal ON public.admin_menus(portal);
CREATE INDEX IF NOT EXISTS ix_admin_menus_location ON public.admin_menus(location);
CREATE INDEX IF NOT EXISTS ix_admin_menus_is_active ON public.admin_menus(is_active);

-- Seed awal (idempotent: hapus duplikat berdasarkan url+portal+location sebelum insert jika perlu)
INSERT INTO public.admin_menus (title,url,portal,location,icon,sort_order,is_active,allowed_roles) VALUES
 ('Applicant Data (7 Stages)','/admin/applicants','karir','admin_top','PeopleIcon',0,true,'admin,hr,user_dept'),
 ('Employee Data','/admin/employees','karir','admin_top','EmployeeIcon',10,true,'admin,hr'),
 ('Manage Job Vacancies','/admin/jobs','karir','admin_top','WorkIcon',20,true,'admin,hr'),
 ('Departments & Sections','/admin/departments','karir','admin_top','DeptIcon',30,true,'admin,hr'),
 ('Online Test Question Bank','/admin/questions','karir','admin_top','QuizIcon',40,true,'admin,hr,user_dept'),
 ('Print Employee ID Cards','/admin/id-cards','karir','admin_top','BadgeIcon',50,true,'admin,hr'),
 ('MCU Settings & Defaults','/admin/settings','karir','admin_top','SettingsIcon',60,true,'admin,hr'),
 ('Manage Accounts & Reset Password (Admin)','/admin/users','karir','admin_top','AdminPanelSettingsIcon',70,true,'admin')
ON CONFLICT DO NOTHING;


-- 3) Migrasi judul admin_menus ke default EN (bilingual via app translate map, but DB default EN)
UPDATE public.admin_menus SET title='Applicant Data (7 Stages)' WHERE title='Data Pelamar (7 Tahap)' AND portal='karir';
UPDATE public.admin_menus SET title='Employee Data' WHERE title='Data Karyawan' AND portal='karir';
UPDATE public.admin_menus SET title='Manage Job Vacancies' WHERE title='Kelola Lowongan' AND portal='karir';
UPDATE public.admin_menus SET title='Departments & Sections' WHERE title='Departemen & Section' AND portal='karir';
UPDATE public.admin_menus SET title='Online Test Question Bank' WHERE title='Bank Soal Ujian Online' AND portal='karir';
UPDATE public.admin_menus SET title='Print Employee ID Cards' WHERE title='Cetak ID Card Karyawan' AND portal='karir';
UPDATE public.admin_menus SET title='MCU Settings & Defaults' WHERE title='Pengaturan MCU & Default' AND portal='karir';
UPDATE public.admin_menus SET title='Manage Accounts & Reset Password (Admin)' WHERE title='Kelola Akun & Reset Password' AND portal='karir';
