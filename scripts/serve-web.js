const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "web");
const port = 8090;

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("파일을 찾을 수 없습니다.");
      return;
    }

    res.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url || "/", `http://localhost:${port}`).pathname);
  const cleanPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(root, cleanPath));

  if (!filePath.startsWith(root)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("접근할 수 없습니다.");
    return;
  }

  sendFile(res, filePath);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.log(`이미 열려 있습니다: http://127.0.0.1:${port}`);
    return;
  }

  console.error(error.message);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`말씀길 웹 성경: http://127.0.0.1:${port}`);
});
