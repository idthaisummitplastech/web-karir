// prisma.ts - Deprecated. All database operations now go through backend-api.
export const prisma: any = new Proxy({}, {
  get(_target, prop) {
    throw new Error(`Direct Prisma database access (${String(prop)}) is disabled in frontend. All requests must go through backend-api.`);
  }
});
