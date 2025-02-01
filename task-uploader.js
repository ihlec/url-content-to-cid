import * as nodefs from "node:fs";
import { parse } from "csv-parse";
import pLimit from "p-limit";
import { createClient } from 'redis';

// prevent rate limit errors with pLimit
const limit = pLimit(10);
const outputciddata = 'document, cid';
let failddownloadsstack = 'filename , url';

// =============================================
// Output to Redis with RedisDB for persistency

const client = createClient({ url: 'redis://127.0.0.1:6379' }); // for execution on host machine NOT Docker

client.on('error', err => console.log('Redis Client Error - start the Swarm with Redis first', err));
await client.connect();

console.log('connected to redis');

async function processCSV(csvfilename) {
  try {
    nodefs
      .createReadStream(csvfilename)
      .pipe(parse({ columns: true }))
      .on("data", async (row) => {
        const url = row["source"];
        const filename = row["document"];

        // check redis
        if (await client.get(filename)) {
          console.log('CID already know');
          return;
        }

        // Add to TODO URLs to Redis    
        console.log("TODO:"+filename, url)
        await client.set("TODO:"+filename, url);
      });
  } catch (error) {
    console.error("CSV read error", error);
  }
}

await processCSV("data.csv"); 







