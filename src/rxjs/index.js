const http = require("http");
const { from, forkJoin } = require("rxjs");

const {
  fetchTitlePromise,
  renderHtml,
  getAddresses,
  isValidRoute,
  sendHtml,
  send404,
} = require("../lib/utils");

const PORT = 3003;

const server = http.createServer((req, res) => {
  if (!isValidRoute(req)) {
    return send404(res);
  }

  const addresses = getAddresses(req);

  if (addresses.length === 0) {
    return sendHtml(res, renderHtml([]));
  }

  const titleStreams = addresses.map((address) => {
    return from(fetchTitlePromise(address));
  });

  forkJoin(titleStreams).subscribe({
    next: (results) => {
      sendHtml(res, renderHtml(results));
    },
    error: () => {
      sendHtml(res, renderHtml([]));
    },
  });
});

server.listen(PORT, () => {
  console.log(`RxJS server running on http://localhost:${PORT}`);
});