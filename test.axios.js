import Fs from "fs";
import Path from "path";
import Url from "url";
import Axios from "axios";
import CheerIO from "cheerio";
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

function testAxios(url) {
  let startDate = new Date();
  console.log(`testAxios started`);

  Axios
    .get(url)
    .then(function (response) {
      Fs.writeFileSync(urlToFile(url, "axios"), response.data);

      let $html = CheerIO.load(response.data);
      let pCount = $html("p").length;
      console.log("Total pCount =", pCount);
      setTimeout(final, 500);

      let stopDate = new Date();
      let deltaTime = humanFormat((stopDate - startDate) / 1000, {scale: timeScale});
      console.log(`testAxios stopped (${deltaTime})`);
    });
}

let maxUsage = 0;
let hd = new MemWatch.HeapDiff();

MemWatch.on("stats", function (stats) {
  if (stats.current_base > maxUsage) {
    maxUsage = stats.current_base;
  }
});

testAxios("http://localhost:3000/heavy");

let final = function () {
  MemWatch.gc();
  let diff = hd.end();
  console.log("Mem before:", diff.before.size);
  console.log("Mem after:", diff.after.size);
  console.log("Mem max:", humanFormat(maxUsage).toLowerCase() + "b");
};
