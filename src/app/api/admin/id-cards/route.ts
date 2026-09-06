import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const employees = await prisma.karyawanSementara.findMany({
      include: {
        applicant: {
          select: {
            fullName: true,
            email: true,
            phone: true,
            schoolName: true,
            major: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      employees,
    });
  } catch (error: any) {
    console.error("Fetch ID cards error:", error);
    return NextResponse.json({ error: "Gagal memuat data ID Card." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { employeeId, idCardPrinted } = await req.json();

    const updated = await prisma.karyawanSementara.update({
      where: { id: Number(employeeId) },
      data: { idCardPrinted: Boolean(idCardPrinted) },
    });

    return NextResponse.json({
      success: true,
      employee: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memperbarui status kartu." }, { status: 500 });
  }
}
