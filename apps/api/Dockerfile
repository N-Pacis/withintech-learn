FROM node:20-alpine
RUN apk add --no-cache openssl
RUN npm install -g pnpm
WORKDIR /app

# Copy workspace manifests first for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install all deps
RUN pnpm install --frozen-lockfile

# Build shared package first so the API can resolve @withintech-learn/shared
RUN cd packages/shared && pnpm build

# Generate Prisma client explicitly
RUN cd apps/api && npx prisma generate

# Build TypeScript
RUN cd apps/api && pnpm build

# Copy non-TS assets that tsc doesn't emit
RUN cp apps/api/swagger.json apps/api/dist/swagger.json

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app

EXPOSE 3001
WORKDIR /app/apps/api
USER app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/index.js"]
