#!/bin/bash
set -e

CONTAINER_NAME="spaceship-game"
IMAGE_NAME="spaceship-game"
PORT="5000:5000"

echo "Stopping existing container (if running)..."
docker stop $CONTAINER_NAME 2>/dev/null || true

echo "Removing existing container (if exists)..."
docker rm $CONTAINER_NAME 2>/dev/null || true

echo "Rebuilding Docker image..."
docker build -t $IMAGE_NAME .

echo "Starting new container..."
docker run -d --name $CONTAINER_NAME -p $PORT $IMAGE_NAME

echo "Container is running!"
docker ps | grep $CONTAINER_NAME
