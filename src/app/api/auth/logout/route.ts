import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  if (type === "applicant") {
    cookieStore.delete("applicant_session");
  } else if (type === "admin") {
    cookieStore.delete("admin_session");
  } else {
    // Default fallback if not specified: delete both
    cookieStore.delete("applicant_session");
    cookieStore.delete("admin_session");
  }
  return NextResponse.json({ success: true });
}
