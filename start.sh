#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <environment>"
    echo "Example: $0 dev"
    echo "Available environments: dev, prod"
    exit 1
fi

ENV=$(echo "$1" | tr '[:upper:]' '[:lower:]')

case "$ENV" in
    "dev")
        COMPOSE_FILE="compose.dev.yaml"
        ;;
    "prod")
        COMPOSE_FILE="compose.prod.yaml"
        ;;
    *)
        echo "Invalid environment: $ENV"
        echo "Available environments: dev, prod"
        exit 1
        ;;
esac

echo "Starting services in $ENV environment using $COMPOSE_FILE..."
docker-compose -f "$COMPOSE_FILE" up -d --build

docker ps