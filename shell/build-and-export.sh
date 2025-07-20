#!/usr/bin/env bash
set -euo pipefail

echo "🛠️  Installing dependencies..."
yarn install --frozen-lockfile

echo "🔨 Building Next.js..."
yarn build

echo "📦 Exporting static assets..."
yarn export

echo "✅ Build and export complete! Check ./out directory."
