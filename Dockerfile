FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable pnpm

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/
RUN pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install pnpm
RUN corepack enable pnpm

# Environment variables must be present at build time

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma@5.17.0 generate
RUN npx contentlayer2 build
RUN npx tsc lib/yjs/server.ts --esModuleInterop --skipLibCheck || true
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/start_production.sh ./
COPY --from=builder --chown=nextjs:nodejs /app/lib/yjs/server.js ./lib/yjs/
COPY --from=builder --chown=nextjs:nodejs /app/lib/yjs/redis-adapter.js ./lib/yjs/
COPY package.json pnpm-lock.yaml* ./
RUN npm install pnpm -g && pnpm install --prod --frozen-lockfile

USER nextjs

EXPOSE 3000
EXPOSE 1234

ENV PORT=3000

# Run the validation script instead of starting node directly
CMD ["sh", "./start_production.sh"]
