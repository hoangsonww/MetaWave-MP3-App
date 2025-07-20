# ┌─────────────────────────────────────────────────────────────────────────┐
# │                           MetaWave Makefile                             │
# └─────────────────────────────────────────────────────────────────────────┘

# Variables
WEB_DIR       := web
NODE          := npm
YARN          := yarn
SHELL_SCRIPT  := shell

# Docker
REGISTRY      := ghcr.io/your-org/metawave
WEB_IMAGE     := $(REGISTRY)/web:latest
NGINX_IMAGE   := $(REGISTRY)/nginx:latest
COMPOSE_FILE  := docker-compose.prod.yml

# Supabase
SUPABASE_DIR  := supabase

# Backup
BACKUP_SCRIPT := $(SHELL_SCRIPT)/backup-db.sh
ROTATE_SCRIPT := $(SHELL_SCRIPT)/rotate-logs.sh

# Helpers
.PHONY: help

help:
	@echo ""
	@echo "MetaWave Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  dev                Start local dev (Supabase + Next.js)"
	@echo "  build              Build & export Next.js static (web/)"
	@echo "  docker-build       Build Docker images (web & nginx)"
	@echo "  docker-push        Push Docker images to registry"
	@echo "  deploy             Build, push, & deploy via SSH"
	@echo "  lint               Run ESLint in web/"
	@echo "  format             Run Prettier in web/"
	@echo "  test               Run Jest tests (once)"
	@echo "  test-watch         Run Jest in watch mode"
	@echo "  backup             Dump Postgres database"
	@echo "  rotate-backups     Prune old database backups"
	@echo "  backup-all         backup + rotate-backups"
	@echo "  clean              Remove build artifacts"
	@echo ""

# ──────────────────────────────────────────────────────────────────────────
# Development
# ──────────────────────────────────────────────────────────────────────────

.PHONY: dev
dev:
ifeq ($(USE_LOCAL_SUPABASE),true)
	@echo "Starting local Supabase..."
	@cd $(SUPABASE_DIR) && supabase start &
	@sleep 5
endif
	@echo "Starting Next.js dev server..."
	@cd $(WEB_DIR) && $(YARN) dev

# ──────────────────────────────────────────────────────────────────────────
# Build / Export
# ──────────────────────────────────────────────────────────────────────────

.PHONY: build
build:
	@echo "Installing dependencies..."
	@cd $(WEB_DIR) && $(YARN) install --frozen-lockfile
	@echo "Building Next.js..."
	@cd $(WEB_DIR) && $(YARN) build
	@echo "Exporting static..."
	@cd $(WEB_DIR) && $(YARN) export

# ──────────────────────────────────────────────────────────────────────────
# Docker
# ──────────────────────────────────────────────────────────────────────────

.PHONY: docker-build
docker-build:
	@echo "Building web image..."
	@docker build -t $(WEB_IMAGE) -f Dockerfile .
	@echo "Building nginx image..."
	@docker build -t $(NGINX_IMAGE) -f nginx/Dockerfile nginx

.PHONY: docker-push
docker-push:
	@echo "Pushing images..."
	@docker push $(WEB_IMAGE)
	@docker push $(NGINX_IMAGE)

.PHONY: deploy
deploy: docker-build docker-push
	@echo "Deploying to production server..."
	@./$(SHELL_SCRIPT)/deploy.sh

# ──────────────────────────────────────────────────────────────────────────
# Lint, Format & Test
# ──────────────────────────────────────────────────────────────────────────

.PHONY: lint
lint:
	@echo "Running ESLint..."
	@cd $(WEB_DIR) && $(YARN) lint

.PHONY: format
format:
	@echo "Running Prettier..."
	@cd $(WEB_DIR) && $(YARN) format

.PHONY: test
test:
	@echo "Running Jest tests..."
	@cd $(WEB_DIR) && $(YARN) test --passWithNoTests

.PHONY: test-watch
test-watch:
	@echo "Starting Jest in watch mode..."
	@cd $(WEB_DIR) && $(YARN) test --watch

# ──────────────────────────────────────────────────────────────────────────
# Database Backups
# ──────────────────────────────────────────────────────────────────────────

.PHONY: backup
backup:
	@echo "Backing up database..."
	@bash $(BACKUP_SCRIPT)

.PHONY: rotate-backups
rotate-backups:
	@echo "Rotating database backups..."
	@bash $(ROTATE_SCRIPT)

.PHONY: backup-all
backup-all: backup rotate-backups

# ──────────────────────────────────────────────────────────────────────────
# Cleanup
# ──────────────────────────────────────────────────────────────────────────

.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf $(WEB_DIR)/.next
	@rm -rf $(WEB_DIR)/out
	@echo "Done."

