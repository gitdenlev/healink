# ════════════════════════════════════════════════════════════════
# Stage 1 — deps: install only production dependencies
# ════════════════════════════════════════════════════════════════
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ════════════════════════════════════════════════════════════════
# Stage 2 — dev-deps: install ALL deps (needed to build)
# ════════════════════════════════════════════════════════════════
FROM node:22-alpine AS dev-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ════════════════════════════════════════════════════════════════
# Stage 3 — builder: compile TypeScript
# ════════════════════════════════════════════════════════════════
FROM dev-deps AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ════════════════════════════════════════════════════════════════
# Stage 4 — runner: lean production image
# ════════════════════════════════════════════════════════════════
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy compiled output + prod node_modules only
COPY --from=builder  /app/dist         ./dist
COPY --from=deps     /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3001

CMD ["node", "dist/main"]
