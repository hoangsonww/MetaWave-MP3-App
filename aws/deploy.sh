#!/usr/bin/env bash
# aws/deploy.sh  -  deploy MetaWave infra + app container

set -euo pipefail

#######################
# Configuration
#######################

# Usage:
#   ./deploy.sh [env] [docker-tag]
# e.g.: ./deploy.sh dev latest
ENVIRONMENT="${1:-dev}"
IMAGE_TAG="${2:-latest}"

# You must export these or set in a .env file:
#   AWS_PROFILE         (optional, if you use named AWS profiles)
#   AWS_REGION          (e.g. us-east-1)
#   DB_PASSWORD         (the RDS master password)
#   SUPABASE_URL        (your Supabase URL)
#   SUPABASE_ANON_KEY   (your Supabase ANON key)
#
# Example .env file (aws/.env):
#   export AWS_REGION=us-east-1
#   export DB_PASSWORD="supersecret"
#   export SUPABASE_URL="https://xyz.supabase.co"
#   export SUPABASE_ANON_KEY="public-anon-key"
if [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
fi

: "${AWS_REGION:?Need to set AWS_REGION}"
: "${DB_PASSWORD:?Need to set DB_PASSWORD}"
: "${SUPABASE_URL:?Need to set SUPABASE_URL}"
: "${SUPABASE_ANON_KEY:?Need to set SUPABASE_ANON_KEY}"

#######################
# 1. Terraform deploy
#######################
echo "👉 [Terraform] Init"
terraform -chdir="$(dirname "$0")" init -input=false

echo "👉 [Terraform] Plan  (env=${ENVIRONMENT})"
terraform -chdir="$(dirname "$0")" plan \
  -var="db_password=${DB_PASSWORD}" \
  -var="app_image_tag=${IMAGE_TAG}" \
  -var="supabase_url=${SUPABASE_URL}" \
  -var="supabase_anon_key=${SUPABASE_ANON_KEY}" \
  -out=tfplan

echo "👉 [Terraform] Apply"
terraform -chdir="$(dirname "$0")" apply -input=false tfplan

#######################
# 2. Build & Push Docker image
#######################
echo "👉 [ECR] Logging in"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ENVIRONMENT}-metawave-repo"
aws ecr get-login-password --region "${AWS_REGION}" \
  | docker login --username AWS --password-stdin "${ECR_URL}"

echo "👉 [Docker] Build image"
docker build -t "${ECR_URL}:${IMAGE_TAG}" ..

echo "👉 [Docker] Push image"
docker push "${ECR_URL}:${IMAGE_TAG}"

#######################
# 3. Output info
#######################
ALB_DNS=$(terraform -chdir="$(dirname "$0")" output -raw alb_dns_name)
echo
echo "✅ Deployment complete!"
echo "  • Environment: ${ENVIRONMENT}"
echo "  • ALB URL:    http://${ALB_DNS}"
echo "  • Docker:     ${ECR_URL}:${IMAGE_TAG}"
echo
