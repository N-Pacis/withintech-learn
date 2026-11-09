# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# NEXT_PUBLIC_* vars must be baked in at build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_BRAND_NAME
ENV NEXT_PUBLIC_BRAND_NAME=$NEXT_PUBLIC_BRAND_NAME
ARG NEXT_PUBLIC_SUPPORT_PHONE
ENV NEXT_PUBLIC_SUPPORT_PHONE=$NEXT_PUBLIC_SUPPORT_PHONE
ARG NEXT_PUBLIC_SUPPORT_EMAIL
ENV NEXT_PUBLIC_SUPPORT_EMAIL=$NEXT_PUBLIC_SUPPORT_EMAIL
ARG NEXT_PUBLIC_SUPPORT_WEBSITE
ENV NEXT_PUBLIC_SUPPORT_WEBSITE=$NEXT_PUBLIC_SUPPORT_WEBSITE
ARG NEXT_PUBLIC_SOCIAL_HANDLE
ENV NEXT_PUBLIC_SOCIAL_HANDLE=$NEXT_PUBLIC_SOCIAL_HANDLE
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm install -g pnpm@10.30.3
WORKDIR /app

# Copy workspace manifests first for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

RUN pnpm install --frozen-lockfile

# Build shared package first so @withintech-learn/shared resolves correctly
RUN cd packages/shared && pnpm build

# next.config.ts sets output: "standalone", so this emits a self-contained
# server in .next/standalone with only the node_modules it actually needs.
RUN cd apps/web && pnpm build

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

WORKDIR /app
RUN addgroup -S app && adduser -S app -G app

COPY --from=builder --chown=app:app /app/apps/web/.next/standalone ./
COPY --from=builder --chown=app:app /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=app:app /app/apps/web/public ./apps/web/public

USER app
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
