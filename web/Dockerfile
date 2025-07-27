# Stage 1: Build with dummy NEXT_PUBLIC_* env
FROM node:20-alpine AS builder
WORKDIR /app

# inject dummy env so Next.js build sees them
ENV NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_dummy_key

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Prod image
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["npm","start"]
