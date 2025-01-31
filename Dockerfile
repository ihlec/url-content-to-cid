FROM node:18-alpine  

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY get-cid-from-url.js get-cid-from-url.js
COPY data.csv data.csv

EXPOSE 3000

CMD ["node", "get-cid-from-url.js"]