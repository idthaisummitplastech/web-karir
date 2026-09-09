// cmsDb.ts - Deprecated. All CMS user queries now go through backend-api.
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

export async function findCmsUserByEmail(_emailOrUsername: string): Promise<CmsUserRow | null> {
  return null;
}
