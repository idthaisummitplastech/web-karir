import { PrismaClient } from "@prisma/client";

// Global singleton for connecting to central CMS Database (web_perusahaan)
const globalForCmsPrisma = globalThis as unknown as {
  cmsPrisma: PrismaClient | undefined;
};

export const cmsPrisma =
  globalForCmsPrisma.cmsPrisma ||
  new PrismaClient({
    datasources: {
      db: {
        url:
          process.env.CMS_DATABASE_URL ||
          "postgresql://sydit:syditsp@localhost:5432/web_perusahaan?schema=public",
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForCmsPrisma.cmsPrisma = cmsPrisma;

export interface CmsUserRow {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
  mfa_enabled: boolean;
  mfa_secret: string | null;
  backup_codes: string | null;
}

export async function findCmsUserByEmail(emailOrUsername: string): Promise<CmsUserRow | null> {
  try {
    const clean = emailOrUsername.trim().toLowerCase();
    const rows = await cmsPrisma.$queryRawUnsafe<CmsUserRow[]>(
      `SELECT id, email, password, name, role, mfa_enabled, mfa_secret, backup_codes 
       FROM users 
       WHERE LOWER(email) = $1 OR LOWER(email) = $2 LIMIT 1`,
      clean,
      clean.includes("@") ? clean : `${clean}@itsp.co.id`
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error finding user in CMS database:", error);
    return null;
  }
}
