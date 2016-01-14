import Fs from "fs";
import Path from "path";
import Http from "http";

let port = process.argv[2] || 3000;

let requestNumber = 1;

let server = Http.createServer(function (req, resp) {
  if (req.url == "/light") {
    resp.writeHead(200, {"Content-Type": "text/html"});
    Fs.createReadStream(Path.resolve(__dirname, "static-src", "light.html")).pipe(resp);
  } else if (req.url == "/heavy") {
    resp.writeHead(200, {"Content-Type": "text/html"});
    Fs.createReadStream(Path.resolve(__dirname, "static-src", "heavy.html")).pipe(resp);
  } else if (req.url == "/bad") {
    if (requestNumber % 3 == 0) {
      console.log("request #" + requestNumber, " – 200");
      resp.writeHead(200, {"Content-Type": "text/plain"});
      resp.end("Found");
    } else {
      console.log("request #" + requestNumber, " – 500");
      resp.writeHead(500, {"Content-Type": "text/plain"});
      resp.end("Internal Server Error");
    }
    requestNumber = (requestNumber + 1) % 3;
  } else {
    resp.writeHead(200, {"Content-Type": "text/plain"});
    resp.end("Ok");
  }
});

server.listen(port, function () {
  console.log("Server listening on: http://localhost:%s", port);
});
