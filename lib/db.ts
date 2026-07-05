import { PrismaClient } from '@prisma/client';
import { unstable_cache } from 'next/cache';

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

export const prisma = globalThis.cachedPrisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.cachedPrisma = prisma;
}

export const getSystemConfig = unstable_cache(
  async () => {
    let config = await prisma.systemConfig.findUnique({
      where: { id: "CURRENT_GLOBAL_CONFIG" },
    });
    if (!config) {
      config = await prisma.systemConfig.create({
        data: { id: "CURRENT_GLOBAL_CONFIG" },
      });
    }
    return config;
  },
  ['system-config'],
  { tags: ['system-config'], revalidate: 3600 }
);
