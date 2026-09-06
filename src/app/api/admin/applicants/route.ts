import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Silakan login sebagai HR/User." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (stage) where.currentStage = parseInt(stage);
    if (status) where.stageStatus = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { schoolName: { contains: search, mode: "insensitive" } },
        { major: { contains: search, mode: "insensitive" } },
      ];
    }

    // Jika admin adalah user departemen tertentu, filter lowongan sesuai departemennya
    if (session.role === "user_dept" && session.department) {
      where.jobPosting = {
        department: { contains: session.department, mode: "insensitive" },
      };
    }

    const applicants = await prisma.applicant.findMany({
      where,
      include: {
        jobPosting: true,
        testSubmissions: true,
        interviews: { orderBy: { createdAt: "desc" } },
        karyawanData: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      total: applicants.length,
      applicants,
    });
  } catch (error: any) {
    console.error("Fetch applicants error:", error);
    return NextResponse.json({ error: "Gagal memuat daftar pelamar." }, { status: 500 });
  }
}
