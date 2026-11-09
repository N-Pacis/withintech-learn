# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
RUN npm install -g pnpm@10.30.3
WORKDIR /app

# Copy workspace manifests first for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install all deps (dev deps are needed to compile)
RUN pnpm install --frozen-lockfile

# Build shared package first so the API can resolve @withintech-learn/shared
RUN cd packages/shared && pnpm build

# Generate Prisma client and build TypeScript (build also copies swagger.json)
RUN cd apps/api && npx prisma generate && pnpm build

# Drop dev dependencies, then regenerate the Prisma client into the pruned tree.
# prisma (CLI) is a runtime dependency because the container runs migrations.
RUN CI=true pnpm install --frozen-lockfile --prod --offline \
 && cd apps/api && npx prisma generate \
 && rm -rf src

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app

COPY --from=builder --chown=app:app /app ./

USER app
EXPOSE 3001
WORKDIR /app/apps/api
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/index.js"]
