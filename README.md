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

## Known Issues
Failure on fetch 19983: 1949109,bafybeib6psc33ohgorrvxvhiy4lp2rm5bdcpadntqdczj7zqo7fugekvui -- unable to verify the first certificate

## Run as Container
docker build -t get-cids .
docker run -p 3000:3000 get-cids

## Run in Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml get-cids-stack
docker service scale get-cids-stack_get-cids-service=5  

