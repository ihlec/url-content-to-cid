import { createHeliaHTTP } from "@helia/http";
import { unixfs } from "@helia/unixfs";
import * as nodefs from "node:fs";
import fetch from "node-fetch";
import { parse } from "csv-parse";
import pLimit from "p-limit";

// prevent rate limit errors with pLimit
const limit = pLimit(10);
const outputciddata = 'document, cid';
let failddownloadsstack = 'filename , url';

// TODO: Output to Redis with RedisDB for persistency
nodefs.writeFile('output.csv', outputciddata, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('File written successfully!');
  }
});
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
    console.log('Added data to IPFS with CID:', c.toString());

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
        //console.info("URL: ", url);
        const cid = limit(() => downloadPDFandCalcCID(url, filename));

        // pin file to node
        //await helia.pins.add(cid)

        // advertise the file on IPFS
        //await helia.routing.provide(cid);

        // save to output file
        nodefs.appendFile('output.csv', '\n' + filename + ',' + await cid, (err) => {
        });

      });
  } catch (error) {
    console.error("CSV read error", error);
  }
}

await processCSV("data.csv");








