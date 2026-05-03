FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
# NOTICE: We point to chess-app for the package files
COPY chess-app/package.json chess-app/yarn.lock* chess-app/package-lock.json* chess-app/pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && npm install; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# NOTICE: Copy the chess-app contents into the builder
COPY chess-app/ .
# Prisma is already copied via 'COPY chess-app/ .' above

ENV NEXT_TELEMETRY_DISABLED 1
# ensure Prisma client exists and the DB file is included
ENV DATABASE_URL="file:./prisma/puzzle.db"
RUN npx prisma generate
# optional: create the DB file in image if not present
RUN npx prisma db push

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder 
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma DB and set DATABASE_URL for runtime
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
ENV DATABASE_URL="file:./prisma/puzzle.db"

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]