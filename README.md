# url-content-to-cid
Fetches a files from URLs and saves the CID

Input file: `data.csv`

Output files: `output.csv`, `failed-retrievals.csv`

## Build the Container
`docker build -t get-cids .`

### Swarm Workflow / run Task with MULTIPLE (8) Container
`sh runSwarm.sh`

`npm run results`

`docker stack rm get-cids-stack`

### Scaling
You can use the following command at any point to increase the replicas/workers:

`docker service scale get-cids-stack_get-cids-service=12`

### Usefull commands for Docker Swarm
`docker swarm init`

`docker stack deploy -c docker-compose.yml get-cids-stack`

`docker service scale get-cids-stack_get-cids-service=5`

`docker ps`

`docker attach <ID>`

`docker stack rm get-cids-stack`

`docker stop $(docker ps -aq)`

## Experimental
Pinning currently removed
sleep 5 in `runSwarm.sh` because of `task-uploader.js` not exiting