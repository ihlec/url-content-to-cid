import * as nodefs from "node:fs";
import { createClient } from "redis";

// prevent rate limit errors with pLimit
let outputciddata = "document, cid";
let failddownloadsstack = "filename , url";

const client = createClient({ url: "redis://127.0.0.1:6379" }); // for execution on host machine NOT Docker

client.on("error", (err) =>
  console.log("Redis Client Error - start the Swarm with Redis first", err)
);
await client.connect();

console.log("connected to redis");

// Write Results File
for await (const key of client.scanIterator({ MATCH: "DONE:*" })) {
  const v = await client.get(key);
  console.log(key, v);
  outputciddata += "\n" + key + "," + v;
}

nodefs.writeFile("output.csv", outputciddata, (err) => {
  if (err) {
    console.error("Error writing file:", err);
  } else {
    console.log("File written successfully!");
  }
});

// Write Retrieval-Fails File
for await (const key of client.scanIterator({ MATCH: "TRY:*" })) {
    const v = await client.get(key);
    console.log(key, v);
    failddownloadsstack += "\n" + key + "," + v;
  }
  
  nodefs.writeFile("failed-retrievals.csv", failddownloadsstack, (err) => {
    if (err) {
      console.error("Error writing file:", err);
    } else {
      console.log("File written successfully!");
    }
  });

