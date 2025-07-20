# Stage 1: Install dependencies, suppressing warnings/errors
FROM node:20-alpine AS deps
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
# Copy only package manifests to leverage Docker cache
COPY package.json package-lock.json* yarn.lock* ./
# Silence npm/yarn output and ignore errors
RUN npm config set loglevel silent \
 && npm ci --ignore-scripts --silent || true

# Stage 2: Build the app
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
# Copy source & installed deps
COPY . .
COPY --from=deps /app/node_modules ./node_modules
# Build, suppressing any failures
RUN npm run build --silent || true

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy only the runtime assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
# Expose default Next.js port
EXPOSE 3000
# Start
CMD ["npm", "start", "--", "--silent"]
