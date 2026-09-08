import { Language } from './translations';

export interface JobItem {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  requirements: string;
  description: string;
}

// High-fidelity English translations for known job postings entered in Indonesian
const JOB_TRANSLATIONS: Record<number, Partial<JobItem>> = {
  5: {
    title: 'HSE Officer (Occupational Health, Safety & Environmental)',
    department: 'Health, Safety & Environment (HSE)',
    location: 'Plant 1 Karawang',
    type: 'Full-Time',
    experience: 'Minimum 2 Years',
    requirements: 'Associate / Bachelor Degree in Occupational Health & Safety (K3) or Environmental Engineering. Active General OHS Expert (Ahli K3 Umum Kemenaker) certification required. Proven knowledge of ISO 14001, ISO 45001, and PROPER compliance.',
    description: 'Manage occupational safety in plastic injection manufacturing facilities, oversee PPE and emergency equipment inspections, conduct Job Safety Analyses (JSA/HIRADC), and execute statutory environmental reporting.',
  },
  4: {
    title: 'Plastic Injection Molding Production Operator',
    department: 'Production',
    location: 'Plant 1 Karawang',
    type: 'Full-Time',
    experience: 'Fresh Graduate / 1 Year Experience',
    requirements: 'Vocational High School (SMK) in Mechanical / Automotive / Electrical Engineering or Science. Age 18-24, minimum height male 165 cm, female 155 cm. Detail-oriented, disciplined, and ready to work in 3 rotational shifts.',
    description: 'Operate high-tonnage plastic injection machines, inspect molded parts visually for quality defects, perform runner trimming, and package automotive components in accordance with Standard Work Instructions (SOP/IK).',
  },
  3: {
    title: 'Quality Control (QC) Line Inspector',
    department: 'Quality Assurance',
    location: 'Plant 2 Cikarang',
    type: 'Full-Time',
    experience: '1-2 Years',
    requirements: 'Vocational High School (SMK) / Associate Degree (D3) in Technical Engineering. Proficient with precision measuring instruments (CMM, Caliper, Micrometer, Height Gauge), automotive technical blueprints, and ISO 9001 / IATF 16949 standards.',
    description: 'Perform routine inspections on interior and exterior automotive plastic components, ensuring zero-defect quality control prior to OEM customer delivery.',
  },
  2: {
    title: 'Mold Maintenance & Injection Technician',
    department: 'Engineering & Tooling',
    location: 'Plant 1 Karawang',
    type: 'Full-Time',
    experience: 'Minimum 2 Years',
    requirements: 'Associate or Bachelor Degree (D3/S1) in Mechanical or Manufacturing Engineering. Strong understanding of plastic injection molding, precision mold maintenance, machine parameter setting, and preventive maintenance protocols.',
    description: 'Perform routine maintenance on automotive plastic injection molds, troubleshoot injection molding machinery errors, and optimize production cycle times.',
  },
  1: {
    title: 'IT & Enterprise Systems Staff',
    department: 'Information Technology',
    location: 'Plant 1 Karawang',
    type: 'Full-Time',
    experience: '1-3 Years',
    requirements: 'Bachelor Degree (S1) in Computer Science / Information Systems. Experienced in Web Development, SQL Database administration, Linux/Windows Servers, and Network Troubleshooting.',
    description: 'Responsible for maintaining manufacturing plant network infrastructure, internal ERP/production applications, and providing end-user technical support.',
  },
};

// Generic phrase translation dictionary for dynamic keywords
const PHRASE_DICTIONARY: [RegExp, string][] = [
  [/Minimal (\d+) Tahun/gi, 'Minimum $1 Years'],
  [/Pengalaman (\d+)-(\d+) Tahun/gi, '$1-$2 Years Experience'],
  [/Pengalaman (\d+) Tahun/gi, '$1 Years Experience'],
  [/Fresh Graduate/gi, 'Fresh Graduate'],
  [/Penuh Waktu/gi, 'Full-Time'],
  [/Kontrak/gi, 'Contract'],
  [/Tetap/gi, 'Permanent'],
  [/Produksi/gi, 'Production'],
  [/Kualifikasi Utama/gi, 'Key Qualifications'],
  [/Tanggung Jawab/gi, 'Responsibilities'],
];

export function translateJob(job: JobItem, lang: Language): JobItem {
  if (lang === 'id') {
    // Return original Indonesian text
    return job;
  }

  // Check if known curated English translation exists
  const curated = JOB_TRANSLATIONS[job.id];
  if (curated) {
    return {
      ...job,
      ...curated,
    };
  }

  // Fallback heuristic translator for custom jobs entered by HR in Indonesian
  let translatedExp = job.experience;
  let translatedType = job.type;
  let translatedDept = job.department;

  for (const [regex, replacement] of PHRASE_DICTIONARY) {
    translatedExp = translatedExp.replace(regex, replacement);
    translatedType = translatedType.replace(regex, replacement);
    translatedDept = translatedDept.replace(regex, replacement);
  }

  return {
    ...job,
    experience: translatedExp,
    type: translatedType,
    department: translatedDept,
  };
}
