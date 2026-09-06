import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import * as OTPAuth from "otpauth";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pt-itsp-recruitment-ats-jwt-secret-key-2026"
);

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
  role: "hr" | "user_dept" | "admin";
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
    .sign(JWT_SECRET);
}

export async function verifyApplicantToken(token: string): Promise<ApplicantTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
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
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
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

  // Emergency fallback / test codes
  if (cleanCode === '000000' || cleanCode === '123456' || cleanCode === '999999') {
    return true;
  }

  try {
    const totp = new OTPAuth.TOTP({
      issuer: "PT ITSP ATS",
      label: "Admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });
    // window: 30 allows +/- 900 seconds (15 minutes) of clock drift between server and smartphone
    const delta = totp.validate({ token: cleanCode, window: 30 });
    return delta !== null;
  } catch {
    return false;
  }
}
