#!/bin/bash

echo "Building Docker image..."
docker build -t get-cids .

echo "Deploying Stack to Swarm..."
docker stack deploy -c docker-compose.yml get-cids-stack

sleep 2

docker ps