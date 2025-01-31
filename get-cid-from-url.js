import { createHeliaHTTP } from "@helia/http";
import { unixfs } from "@helia/unixfs";
import * as nodefs from "node:fs";
import fetch from "node-fetch";
import { parse } from "csv-parse";
import pLimit from "p-limit";
import { createClient } from 'redis';

// prevent rate limit errors with pLimit
const limit = pLimit(10);
const outputciddata = 'document, cid';
let failddownloadsstack = 'filename , url';

// =============================================
// Output to Redis with RedisDB for persistency

const client = createClient({ url: 'redis://redis:6379' });
//const client = createClient({ url: 'redis://127.0.0.1:6379' });

client.on('error', err => console.log('Redis Client Error', err));
await client.connect();

console.log('connected to redis');



/* nodefs.writeFile('output.csv', outputciddata, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('File written successfully!');
  }
}); */
nodefs.writeFile('faildstack.csv', failddownloadsstack, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('File written successfully!');
  }
});

async function downloadPDFandCalcCID(url, filename) {
  const helia = await createHeliaHTTP();
  const heliafs = unixfs(helia);
  let c;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    c = await heliafs.addByteStream(response.body);
    console.info("CID: ", c);
    console.log('Added CID to Redis:', c.toString());

  } catch (error) {
    console.error("Error fetching data for " + filename + " or adding to IPFS:", error);
    nodefs.appendFile('faildstack.csv', "\n" + filename + ", " + url, (err) => {
    });
  }

  return c;
}

async function processCSV(csvfilename) {
  try {
    nodefs
      .createReadStream(csvfilename)
      .pipe(parse({ columns: true }))
      .on("data", async (row) => {
        // EVENT IS SPAMMING ==> set limiter
        // console.log(row);
        const url = row["source"];
        const filename = row["document"];

        // check redis
        if (await client.get(filename)) {
          console.log('CID already know');
          return;
        }

        //console.info("URL: ", url);
        const cid = limit(() => downloadPDFandCalcCID(url, filename));

        // pin file to node
        //await helia.pins.add(cid)

        // advertise the file on IPFS
        //await helia.routing.provide(cid);

        // save to output file
        // nodefs.appendFile('output.csv', '\n' + filename + ',' + await cid, (err) => {
        //});
        
        // put on redis
        await client.set(filename, await (await cid).toString(), (err) => {});
      });
  } catch (error) {
    console.error("CSV read error", error);
  }
}

await processCSV("data.csv"); 







