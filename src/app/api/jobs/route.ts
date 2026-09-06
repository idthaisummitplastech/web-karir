import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jobs = await prisma.jobPosting.findMany({
      where: { isOpen: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat lowongan." }, { status: 500 });
  }
}
