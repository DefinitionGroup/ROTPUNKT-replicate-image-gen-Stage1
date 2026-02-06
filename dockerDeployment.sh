#!/bin/bash
set -euo pipefail

# Trap for error handling - ensures Jenkins gets proper exit code (cg)
trap 'echo "ERROR: Deployment failed at line $LINENO with exit code $?" >&2; exit 1' ERR

# Variables
IMAGE_NAME="rotpunkt-image-gen"
CONTAINER_NAME="my-rotpunkt-image-gen"
DOCKERFILE_PATH="."
PORT_MAPPING="7000:7000"

# Function to remove old images (optional)
cleanup_images() {
  echo "Cleaning up old images..."
  docker image prune -a -f
  echo "Image cleanup complete."
}

cleanup_build_cache() {
  echo "Cleaning build cache"
  docker builder prune -f
  docker system prune -af --filter "until=$((30*24))h"
}

# Function to stop and remove the old container if it exists
clean_up() {
    echo "Stopping and removing old container if it exists..."
    # These may fail if container doesn't exist - that's OK
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
    cleanup_images
    cleanup_build_cache
}

# Function to build the Docker image
build_image() {
    echo "Building new Docker image..."
    DOCKER_BUILDKIT=1 docker build -t "$IMAGE_NAME" "$DOCKERFILE_PATH"
}

# Function to run the Docker container
run_container() {
    echo "Running new Docker container..."
    docker run -d --restart always -p "$PORT_MAPPING" -e PORT=7000 -e HOST=0.0.0.0 --name "$CONTAINER_NAME" "$IMAGE_NAME"
}

# Main script execution
echo "Starting deployment process..."

# Clean up old container
clean_up

# Build new image
build_image

# Run new container
run_container

echo "Deployment completed successfully."
