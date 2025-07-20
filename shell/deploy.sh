#!/usr/bin/env bash
set -euo pipefail

# -- CONFIGURATION --
REGISTRY="ghcr.io/your-org/metawave"
NGINX_IMAGE="$REGISTRY/nginx:latest"
WEB_IMAGE="$REGISTRY/web:latest"
SSH_HOST="user@your.server.com"
SSH_SHELL="bash -l"
TARGET_PATH="~/metawave"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# -- SCRIPT START --
echo "📦 Building Docker images..."
# Build web (assumes Dockerfile in root)
docker build -t "$WEB_IMAGE" .
# Build Nginx (assumes nginx/Dockerfile)
docker build -t "$NGINX_IMAGE" ./nginx

echo "🔃 Pushing images to registry..."
docker push "$WEB_IMAGE"
docker push "$NGINX_IMAGE"

echo "🚀 Deploying to $SSH_HOST..."
ssh "$SSH_HOST" "$SSH_SHELL" <<EOF
  set -e
  cd $TARGET_PATH
  echo "Pulling latest images..."
  docker-compose -f $DOCKER_COMPOSE_FILE pull
  echo "Recreating containers..."
  docker-compose -f $DOCKER_COMPOSE_FILE up -d
  echo "Clearing old images..."
  docker image prune -f
EOF

echo "✅ Deployment complete!"
