# Build stage: copy Next.js build output (assumes you've run `next export` or built to /.next)
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build && yarn export

# Runtime stage: Nginx serves the exported static files
FROM nginx:stable-alpine
LABEL maintainer="MetaWave Team <dev@metawave.app>"

# Remove default config, add ours
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY sites/default.conf /etc/nginx/conf.d/

# Copy exported static output
COPY --from=build /app/out /usr/share/nginx/html

# (Optional) If you need SSL certs in the container:
# COPY certs/fullchain.pem /etc/ssl/certs/ssl-cert.pem
# COPY certs/privkey.pem   /etc/ssl/private/ssl-key.pem

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
