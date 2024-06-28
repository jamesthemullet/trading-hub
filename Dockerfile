# This file was created based on this vercel example https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile 
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# Required for healthcheck to work
RUN apk add --no-cache curl
COPY --from=builder /app/public ./public
# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js

FROM mcr.microsoft.com/playwright:v1.45.0-jammy AS e2e
WORKDIR /app
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci
COPY --from=builder /app/e2e ./e2e
COPY --from=builder /app/playwright.config.ts ./
# Our test looks for chrome in /opt/google/chrome/chrome where its not found, this is a workaround,
# otherwise you will get following error:
#   Error: browserType.launch: Chromium distribution 'chrome' is not found at /opt/google/chrome/chrome
#   Run "npx playwright install chrome"
RUN mkdir -p /opt/google/chrome \
  && ln -s /usr/bin/chromium /opt/google/chrome/chrome
CMD npm run test:e2e