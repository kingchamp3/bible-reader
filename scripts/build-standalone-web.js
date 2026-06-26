const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const webRoot = path.join(root, "web");

const html = fs.readFileSync(path.join(webRoot, "index.html"), "utf8");
const css = fs.readFileSync(path.join(webRoot, "styles.css"), "utf8");
const data = fs.readFileSync(path.join(webRoot, "bibles-data.js"), "utf8");
const app = fs.readFileSync(path.join(webRoot, "app.js"), "utf8");

const standalone = html
  .replace('    <link rel="stylesheet" href="./styles.css" />', `    <style>\n${css}\n    </style>`)
  .replace('    <script src="./bibles-data.js"></script>', `    <script>\n${data}\n    </script>`)
  .replace('    <script src="./app.js"></script>', `    <script>\n${app}\n    </script>`);

const output = path.join(root, "malsseumgil-web-bible.html");
fs.writeFileSync(output, standalone, "utf8");
console.log(output);
