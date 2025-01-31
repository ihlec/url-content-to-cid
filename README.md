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

## Known Issues

1. Every worker has a copy of the data.csv -- this is bad, as already found cids are not removed from the todo list -- therefore the worker spamms redis at the beginning to catch up on the list.
2. There is no locking or semaphore -- workers may attempt to download files in parallel
3. There is no retry on filed downloads yet -- only logging of fails in faildstack.csv
4. I want to introduce pseudo namespaces to the redis keys to seperate TODO, DONE, and TRY entries.
