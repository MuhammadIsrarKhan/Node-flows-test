const http = require("http");

const {
  fetchTitlePromise,
  renderHtml,
  getAddresses,
  isValidRoute,
  sendHtml,
  send404,
} = require("../lib/utils");

const PORT = 3002;

const server = http.createServer((req, res) => {
  if (!isValidRoute(req)) {
    return send404(res);
  }

  const addresses = getAddresses(req);

  Promise.all(addresses.map(fetchTitlePromise))
    .then((results) => {
      sendHtml(res, renderHtml(results));
    })
    .catch(() => {
      sendHtml(res, renderHtml([]));
    });
});

server.listen(PORT, () => {
  console.log(`Promise server running on http://localhost:${PORT}`);
});