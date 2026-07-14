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

const fetchSystemConfig = async () => {
  let config = await prisma.systemConfig.findUnique({
    where: { id: "CURRENT_GLOBAL_CONFIG" },
  });
  if (!config) {
    config = await prisma.systemConfig.create({
      data: { id: "CURRENT_GLOBAL_CONFIG" },
    });
  }
  return config;
};

// Check if we are running in Next.js environment, otherwise bypass unstable_cache
const isNextJs = typeof process !== 'undefined' && process.env.__NEXT_PRIVATE_PREBUNDLED_REACT;
export const getSystemConfig = isNextJs
  ? unstable_cache(
      fetchSystemConfig,
      ['system-config'],
      { tags: ['system-config'], revalidate: 3600 }
    )
  : fetchSystemConfig;
