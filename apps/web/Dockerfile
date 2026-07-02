FROM node:20-alpine

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

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app

EXPOSE 3000
WORKDIR /app/apps/web
USER app
CMD ["pnpm", "start"]
