import { createHeliaHTTP } from "@helia/http";
import { unixfs } from "@helia/unixfs";
import * as nodefs from "node:fs";
import fetch from "node-fetch";
import redis from "redis";

const client = redis.createClient({ url: "redis://redis:6379" }); //Docker
// const client = redis.createClient({ url: 'redis://127.0.0.1:6379' });

client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect();

console.log("connected to redis");

while (true){
  await processTODOs();
  await processTRYs();
}

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
  } catch (error) {
    console.error(
      "Error fetching data for " + filename + " or adding to IPFS:",
      error
    );
  }

  return c;
}

// Iterate through TODOs
async function processTODOs() {
  for await (const key of client.scanIterator({ MATCH: "TODO:*" })) {
    const v = await client.get(key);
    if (v == null) {
      // some other client already delted it. Its in TRY now.
      continue;
    }
    console.log(key, v);

    // Add to TRY
    await client.set(key.replace("TODO", "TRY"), v);

    // Remove from TODO
    await client.del(key);

    // TRY Download
    const cid = await downloadPDFandCalcCID(v, key.slice(4)); //cut of try from filename
    if (cid == undefined) {
      continue;
    }
    console.log(cid.toString());

    // Add to DONE
    await client.set(key.replace("TODO", "DONE"), cid.toString());

    // Remove from TRY
    await client.del(key.replace("TODO", "TRY"));
  }
}

// Iterate through TRYs (clean-up and endless retry)
async function processTRYs() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0; // WE DO THIS BECAUSE SOME SOURCES HAVE BROKEN CERTS
  for await (const key of client.scanIterator({ MATCH: "TRY:*" })) {
    const v = await client.get(key);
    if (v == null) {
      // some other client already delted it. Its in DONE now.
      continue;
    }
    console.log(key, v);

    // TRY Download and Remove from TRY 
    await client.del(key);

    const cid = await downloadPDFandCalcCID(v, key.slice(4)); //cut of TRY from filename
    if (cid == undefined) {
      // Re-Add to TRY 
      await client.set(key, v);
      continue;
    }
    console.log(cid.toString());

    // Add to DONE
    await client.set(key.replace("TRY", "DONE"), cid.toString());


  }
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1; // WE DO THIS TO RETURN TO SECURE TLS
}
