import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const jobs = await prisma.jobPosting.findMany({
      where: {
        isOpen: true,
        AND: [
          { OR: [{ openingDate: null }, { openingDate: { lte: now } }] },
          { OR: [{ closingDate: null }, { closingDate: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat lowongan." }, { status: 500 });
  }
}
