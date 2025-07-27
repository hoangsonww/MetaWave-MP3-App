# Dockerfile for the MetaWave web application

# 1) Build stage: install all deps, build, prune devDeps
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build && npm prune --production

# 2) Runtime stage: copy over build + prod‑only node_modules
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .
EXPOSE 3000
CMD ["npm", "start"]
