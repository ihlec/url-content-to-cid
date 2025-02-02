#!/bin/bash

echo "Building Docker image..."
docker build -t get-cids .

echo "Deploying Stack to Swarm..."
docker stack deploy -c docker-compose.yml get-cids-stack

sleep 3

npm run upload

sleep 2

docker service scale get-cids-stack_get-cids-service=8 