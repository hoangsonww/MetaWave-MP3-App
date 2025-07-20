#!/usr/bin/env bash
set -euo pipefail

# Ensure we're running from the ansible/ directory
cd "$(dirname "$0")"

# Default image tag
IMAGE_TAG="${1:-latest}"

echo "👉 Installing required Ansible collections..."
ansible-galaxy collection install \
  community.general \
  amazon.aws \
  community.docker >/dev/null

echo "✅ Collections installed."

echo "🌍 Using AWS region from group_vars/all.yml"
# Run the playbook
echo "🚀 Deploying MetaWave with Docker image tag: $IMAGE_TAG"
ansible-playbook playbook.yml --extra-vars "app_image_tag=$IMAGE_TAG"

echo "🎉 Deployment complete!"
