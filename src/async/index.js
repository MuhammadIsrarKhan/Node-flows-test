const http = require("http");
const async = require("async");

const {
  fetchTitleCallback,
  renderHtml,
  getAddresses,
  isValidRoute,
  sendHtml,
  send404,
} = require("../lib/utils");

const PORT = 3001;

const server = http.createServer((req, res) => {
  if (!isValidRoute(req)) {
    return send404(res);
  }

  const addresses = getAddresses(req);

  async.map(addresses, fetchTitleCallback, (_err, results) => {
    sendHtml(res, renderHtml(results));
  });
});

server.listen(PORT, () => {
  console.log(`Async.js server running on http://localhost:${PORT}`);
});
