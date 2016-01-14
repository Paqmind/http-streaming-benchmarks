import Fs from "fs";
import Path from "path";
import Url from "url";
import Request from "request";
import Parse5 from "parse5";
import MemWatch from "memwatch-next";
import humanFormat from "human-format";

process.on("unhandledRejection", function (reason, p) {
  throw reason;
});

let timeScale = new humanFormat.Scale({
  seconds: 1,
  minutes: 60,
  hours: 3600,
});

let urlToFile = function (url, suffix) {
  let path = Url.parse(url).path;
  return Path.join(__dirname, "static-dst", path) + "." + suffix + ".html";
};

function testRequest(url) {
  let startDate = new Date();
  console.log(`testRequest started`);

  let parser = new Parse5.SAXParser();
  let pCount = 0;
  parser.on("startTag", function (name, attrs) {
    if (name == "p") {
      pCount += 1;
      //console.log("p #" + pCount);
    }
  });
  parser.on("finish", function () {
    console.log("Total pCount =", pCount);
    setTimeout(final, 500);
  });

  Request(url)
    .on("end", function () {
      let stopDate = new Date();
      let deltaTime = humanFormat((stopDate - startDate) / 1000, {scale: timeScale});
      console.log(`testRequest stopped (${deltaTime})`);
    })
    .pipe(parser)
    .pipe(Fs.createWriteStream(urlToFile(url, "request")));
}

let maxUsage = 0;
let hd = new MemWatch.HeapDiff();

MemWatch.on("stats", function(stats) {
  if (stats.current_base > maxUsage) {
    maxUsage = stats.current_base;
  }
});

testRequest("http://localhost:3000/heavy");

let final = function () {
  MemWatch.gc();
  let diff = hd.end();
  console.log("Mem before:", diff.before.size);
  console.log("Mem after:", diff.after.size);
  console.log("Mem max:", humanFormat(maxUsage).toLowerCase() + "b");
};
