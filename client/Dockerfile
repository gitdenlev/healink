# ════════════════════════════════════════════════════════════════
# Stage 1 — deps: install only production dependencies
# ════════════════════════════════════════════════════════════════
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ════════════════════════════════════════════════════════════════
# Stage 2 — dev-deps: install ALL deps for build
# ════════════════════════════════════════════════════════════════
FROM node:22-alpine AS dev-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ════════════════════════════════════════════════════════════════
# Stage 3 — builder: compile Next.js
# ════════════════════════════════════════════════════════════════
FROM dev-deps AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GA_TRACKING_ID
ENV NEXT_PUBLIC_GA_TRACKING_ID=$NEXT_PUBLIC_GA_TRACKING_ID
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ════════════════════════════════════════════════════════════════
# Stage 4 — runner: lean production image
# ════════════════════════════════════════════════════════════════
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone output (see next.config.ts → output: 'standalone')
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static      ./.next/static
COPY --from=builder /app/public            ./public

EXPOSE 3000

CMD ["node", "server.js"]
