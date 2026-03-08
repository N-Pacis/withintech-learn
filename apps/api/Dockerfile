FROM node:20-alpine
RUN npm install -g pnpm
WORKDIR /app

# Copy workspace manifests first for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install all deps
RUN pnpm install --frozen-lockfile

# Generate Prisma client explicitly
RUN cd apps/api && npx prisma generate

# Build TypeScript
RUN cd apps/api && pnpm build

EXPOSE 3001
WORKDIR /app/apps/api
CMD ["node", "dist/index.js"]
