const http = require("http");

const {
  fetchTitleCallback,
  renderHtml,
  getAddresses,
  isValidRoute,
  sendHtml,
  send404,
} = require("../lib/utils");

const PORT = 3000;

function fetchAllTitlesWithCallbacks(addresses, finalCallback) {
  const results = [];
  let completed = 0;

  if (addresses.length === 0) {
    return finalCallback(null, results);
  }

  addresses.forEach((address, index) => { 
    fetchTitleCallback(address, (_err, result) => {
      results[index] = result;
      completed++;

      if (completed === addresses.length) {
        finalCallback(null, results);
      }
    });
  });
}

const server = http.createServer((req, res) => {
  if (!isValidRoute(req)) {
    return send404(res);
  }

  const addresses = getAddresses(req);

  fetchAllTitlesWithCallbacks(addresses,  (_err, results) => {
    sendHtml(res, renderHtml(results));
  });
});

server.listen(PORT, () => {
  console.log(`Callback server running on http://localhost:${PORT}`);
});