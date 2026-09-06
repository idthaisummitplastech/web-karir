import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Demo Applicant...");

  // Find job posting
  let job = await prisma.jobPosting.findFirst({
    where: { title: { contains: "Mold Maintenance" } },
  });

  if (!job) {
    job = await prisma.jobPosting.findFirst();
  }

  if (!job) {
    console.error("No job posting found to link demo applicant.");
    return;
  }

  const hashedPassword = await bcrypt.hash("password123", 10);

  const demoApplicant = await prisma.applicant.upsert({
    where: { email: "pelamar.demo@itsp.co.id" },
    update: {
      password: hashedPassword,
      currentStage: 2,
      stageStatus: "in_progress",
      psikotesToken: "PSI-8821",
      psikotesScheduledAt: new Date(),
    },
    create: {
      jobPostingId: job.id,
      fullName: "Ahmad Rifqi Pratama",
      email: "pelamar.demo@itsp.co.id",
      password: hashedPassword,
      phone: "081234567890",
      birthDate: new Date("1998-05-15"),
      age: 28,
      lastEducation: "S1",
      schoolName: "Universitas Singaperbangsa Karawang (UNSIKA)",
      major: "Teknik Mesin",
      experience: "2 Tahun di Industri Otomotif Plastic Injection Moulding",
      englishSkill: "Menengah (Intermediate)",
      otherLanguages: "Jepang Dasar (N5)",
      cvFile: "data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp...",
      cvFileSize: 45200,
      currentStage: 2,
      stageStatus: "in_progress",
      psikotesToken: "PSI-8821",
      psikotesScheduledAt: new Date(),
      screeningNotes: "Kualifikasi berkas administrasi dan CV sangat sesuai dengan spesifikasi teknisi mold injection.",
    },
  });

  console.log("Demo applicant created/updated successfully:", demoApplicant.fullName, demoApplicant.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
