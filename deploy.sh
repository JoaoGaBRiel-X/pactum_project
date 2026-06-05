#!/bin/bash

# Exit on error
set -e

# Default to 'dev' if no argument is provided
ENV=${1:-dev}

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
  echo "Error: Environment must be 'dev' or 'prod'"
  echo "Usage: ./deploy.sh [dev|prod]"
  exit 1
fi

echo "======================================"
echo "Starting deployment for: $ENV"
echo "======================================"

# Check if .env file exists
if [ ! -f "deploy/.env.$ENV" ]; then
  echo "Warning: deploy/.env.$ENV does not exist."
  echo "Creating one from deploy/.env.$ENV.example..."
  cp "deploy/.env.$ENV.example" "deploy/.env.$ENV"
  echo "Please edit deploy/.env.$ENV and run deploy.sh again if you need to change passwords."
fi

# Load variables to get the project name
source "deploy/.env.$ENV"

# Ensure Traefik network exists
if ! docker network ls | grep -q traefik_network; then
  echo "Creating traefik_network..."
  docker network create traefik_network
fi

# Start Traefik (if not already running)
echo "Ensuring global Traefik proxy is running..."
docker compose -f deploy/docker-compose.traefik.yml up -d

# Start the specific environment
echo "Building and starting containers for $ENV (Project: $PROJECT_NAME)..."
docker compose --env-file "deploy/.env.$ENV" -p "$PROJECT_NAME" -f deploy/docker-compose.env.yml up -d --build

echo "======================================"
echo "Deployment for $ENV completed!"
echo "Frontend: http://$FRONTEND_DOMAIN"
echo "Backend:  http://$BACKEND_DOMAIN"
echo "======================================"
