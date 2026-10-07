import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "templates", "Template_Master_Karyawan_ITSP.xlsx");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Template file not found." }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Template_Master_Karyawan_ITSP.xlsx"',
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Download employee template error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to download Excel template file." },
      { status: 500 }
    );
  }
}
