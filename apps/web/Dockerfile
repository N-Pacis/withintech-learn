FROM node:20-alpine

# NEXT_PUBLIC_API_URL must be baked in at build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm install -g pnpm
WORKDIR /app

# Copy workspace manifests first for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

RUN pnpm install --frozen-lockfile

# Build shared package first so @withintech-learn/shared resolves correctly
RUN cd packages/shared && pnpm build

RUN cd apps/web && pnpm build

EXPOSE 3000
WORKDIR /app/apps/web
CMD ["pnpm", "start"]
