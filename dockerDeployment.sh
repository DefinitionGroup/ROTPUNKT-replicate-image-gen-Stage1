#!/bin/bash
set -euo pipefail

# Trap for error handling - ensures Jenkins gets proper exit code (cg)
trap 'echo "ERROR: Deployment failed at line $LINENO with exit code $?" >&2; exit 1' ERR

# Variables
IMAGE_NAME="rotpunkt-image-gen"
IMAGE_NEW="${IMAGE_NAME}:new"
CONTAINER_NAME="my-rotpunkt-image-gen"
DOCKERFILE_PATH="."
PORT_MAPPING="7000:7000"

# Function to remove dangling/unused images
cleanup_images() {
    echo "Cleaning up unused images..."
    docker image prune -f
    echo "Image cleanup complete."
}

cleanup_build_cache() {
    echo "Cleaning build cache (older than 7 days)..."
    docker builder prune -f --filter "until=168h"
}

# Function to build the Docker image (tagged as :new first)
build_image() {
    echo "Building new Docker image as ${IMAGE_NEW}..."
    DOCKER_BUILDKIT=1 docker build -t "$IMAGE_NEW" "$DOCKERFILE_PATH"
}

# Function to swap: stop old container, retag image, start new container
swap_containers() {
    echo "Build succeeded — swapping containers..."

    # Stop and remove the old container (if running)
    echo "Stopping old container..."
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true

    # Remove old image tag and promote the new one
    docker rmi "$IMAGE_NAME" 2>/dev/null || true
    docker tag "$IMAGE_NEW" "$IMAGE_NAME"
    docker rmi "$IMAGE_NEW" 2>/dev/null || true

    # Start the new container
    echo "Starting new container..."
    docker run -d --restart always \
        -p "$PORT_MAPPING" \
        -e PORT=7000 \
        -e HOST=0.0.0.0 \
        --name "$CONTAINER_NAME" \
        "$IMAGE_NAME"
}

# Main script execution
echo "Starting deployment process..."

# 1) Build new image — old container keeps running during build
build_image

# 2) Build succeeded → stop old, start new
swap_containers

# 3) Clean up
cleanup_images
cleanup_build_cache

echo "Deployment completed successfully."
