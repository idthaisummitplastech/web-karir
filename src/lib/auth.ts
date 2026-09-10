import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import * as OTPAuth from "otpauth";
import { cookies } from "next/headers";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET belum diisi via env (min 32 karakter). Isi file .env — lihat .env.example. Dilarang fallback hardcoded di code.'
    );
  }
  return new TextEncoder().encode(secret);
}

export interface ApplicantTokenPayload {
  applicantId: number;
  email: string;
  fullName: string;
  role: "applicant";
}

export interface AdminTokenPayload {
  adminId: number;
  username: string;
  name: string;
  email: string;
  role: "hr" | "user_dept" | "admin" | "superadmin";
  department?: string | null;
  isMfaVerified: boolean;
}

// Passwords
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Applicant JWT
export async function signApplicantToken(payload: ApplicantTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyApplicantToken(token: string): Promise<ApplicantTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.role !== "applicant") return null;
    return payload as unknown as ApplicantTokenPayload;
  } catch {
    return null;
  }
}

// Admin JWT
export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(getJwtSecret());
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.adminId) return null;
    return payload as unknown as AdminTokenPayload;
  } catch {
    return null;
  }
}

// Current Session Retrieval from Next.js Cookies
export async function getApplicantSession(): Promise<ApplicantTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("applicant_session")?.value;
  if (!token) return null;
  return verifyApplicantToken(token);
}

export async function getAdminSession(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

// TOTP MFA Helpers (Google Authenticator / Microsoft Authenticator)
export function generateTotpSecret(username: string) {
  const totp = new OTPAuth.TOTP({
    issuer: "PT ITSP ATS",
    label: username,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret({ size: 20 }),
  });
  return {
    secret: totp.secret.base32,
    uri: totp.toString(),
  };
}

export function verifyTotpCode(secretBase32: string, code: string): boolean {
  if (!secretBase32 || !code) return false;
  const cleanCode = code.trim().replace(/\s+/g, '');

  // Hanya terima 6 digit angka (TOTP standar). Kode darurat sudah dihapus
  // agar tidak menjadi backdoor.
  if (!/^\d{6}$/.test(cleanCode)) return false;

  try {
    // Normalisasi secret (buang whitespace, uppercase: Base32 case-insensitive)
    const cleanSecret = secretBase32.trim().replace(/\s+/g, '').toUpperCase();
    const totp = new OTPAuth.TOTP({
      issuer: "PT ITSP ATS",
      label: "Admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(cleanSecret),
    });

    // TOTP memakai Unix epoch (UTC) — perbedaan zona waktu TIDAK perlu
    // offset manual ±7 jam / ±1 tahun. Offset besar justru membuka jendela
    // replay dan melemahkan keamanan tanpa memperbaiki clock-drift.
    const rawWindow = Number(process.env.MFA_WINDOW_STEPS ?? 12);
    const windowSteps =
      Number.isFinite(rawWindow) && rawWindow >= 1 && rawWindow <= 20
        ? Math.floor(rawWindow)
        : 12;

    const delta = totp.validate({
      token: cleanCode,
      timestamp: Date.now(),
      window: windowSteps,
    });
    return delta !== null;
  } catch {
    return false;
  }
}

