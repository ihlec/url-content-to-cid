# url-content-to-cid
Fetches a files from URLs and saves the CID

## Get Started
npm install

npm start

Input file: data.csv
Output file: output.csv

## Experimental
Pinning and Provide currently removed

## Tips
tweak the pLimit value when running into rate limits
if all files are stored in the node's memory, much RAM is needed

## Run as Container
docker build -t get-cids .
docker run -p 3000:3000 get-cids

### Run in Docker Swarm with Redis Cache
docker swarm init
docker stack deploy -c docker-compose.yml get-cids-stack
docker service scale get-cids-stack_get-cids-service=5
docker ps
docker attach <ID>
docker stack rm get-cids-stack

### Swarm Workflow
sh runSwarm.sh
docker service scale get-cids-stack_get-cids-service=12
npm run results

#### Docker network overload
docker stop $(docker ps -aq)