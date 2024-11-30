import { createHeliaHTTP } from "@helia/http";
import { unixfs } from "@helia/unixfs";
import * as nodefs from "node:fs";
import fetch from "node-fetch";
import { parse } from "csv-parse";
import pLimit from "p-limit";

// prevent rate limit errors with pLimit
const limit = pLimit(10);
const outputciddata = 'document, cid';
nodefs.writeFile('output.csv', outputciddata, (err) => {
    if (err) {
        console.error('Error writing file:', err);
    } else {
        console.log('File written successfully!');
    }
});

async function downloadPDFandCalcCID(url, filename) {
  const helia = await createHeliaHTTP();
  const heliafs = unixfs(helia);

  let r;
  try {
    r = await fetch(url);
    if (!r.ok) {
      throw new Error(`HTTP error! status: ${r.status}`);   
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  const b = await r.blob();
  const ab = await b.arrayBuffer();

  // add a file and wrap in a directory
  const c = await heliafs.addFile({
    path: "./" + filename,
    content: new Uint8Array(ab),
    mode: 0x755,
    mtime: {
      secs: 10n,
      nsecs: 0,
    },
  });
  console.info("CID: ", c);
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
        nodefs.appendFile('output.csv', '\n' + filename  + ',' + await cid, (err) => {
          });

      });
  } catch (error) {
    console.error("CSV read error", error);
  }
}

processCSV("data.csv");


