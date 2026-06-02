const http = require("http");
const https = require("https");

const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 10000;

function normalizeAddress(address) {
  if (!/^https?:\/\//i.test(address)) {
    return `https://${address}`;
  }

  return address;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function extractTitle(html = "") {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  if (!match) return null;

  return match[1].replace(/\s+/g, " ").trim();
}

function fetchTitleCallback(
  originalAddress,
  callback,
  redirectCount = 0,
  currentUrl = null
) {
  let finished = false;

  function done(result) {
    if (finished) return;
    finished = true;
    callback(null, result);
  }

  let urlObj;

  try {
    urlObj = new URL(currentUrl || normalizeAddress(originalAddress));
  } catch {
    return done({
      address: originalAddress,
      title: "NO RESPONSE",
    });
  }

  const client = urlObj.protocol === "https:" ? https : http;

  const options = {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: urlObj.port || undefined,
    path: urlObj.pathname + urlObj.search,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Connection: "close",
    },
  };

  const req = client.get(options, (res) => {
    const isRedirect = [301, 302, 303, 307, 308].includes(res.statusCode);

    if (isRedirect && res.headers.location && redirectCount < MAX_REDIRECTS) {
      res.resume();

      const nextUrl = new URL(res.headers.location, urlObj).toString();

      return fetchTitleCallback(
        originalAddress,
        callback,
        redirectCount + 1,
        nextUrl
      );
    }

    if (res.statusCode < 200 || res.statusCode >= 400) {
      res.resume();

      return done({
        address: originalAddress,
        title: "NO RESPONSE",
      });
    }

    let html = "";

    res.setEncoding("utf8");

    res.on("data", (chunk) => {
      html += chunk;
    });

    res.on("end", () => {
      done({
        address: originalAddress,
        title: extractTitle(html) || "NO RESPONSE",
      });
    });

    res.on("error", () => {
      done({
        address: originalAddress,
        title: "NO RESPONSE",
      });
    });
  });

  req.setTimeout(TIMEOUT_MS, () => {
    req.destroy();
  });

  req.on("error", () => {
    done({
      address: originalAddress,
      title: "NO RESPONSE",
    });
  });
}

function fetchTitlePromise(address) {
  return new Promise((resolve) => {
    fetchTitleCallback(address, (_err, result) => {
      resolve(result);
    });
  });
}

function renderHtml(results) {
  if (results.length === 0) {
    return `<html>
    <head></head>
    <body>
        <h1> Please provide a valid website address </h1>
    </body>
    </html>`;
  }

  const listItems = results
    .map((item) => {
      const title =
        item.title === "NO RESPONSE"
          ? "NO RESPONSE"
          : `"${escapeHtml(item.title)}"`;

      return `       <li> ${escapeHtml(item.address)} - ${title} </li>`;
    })
    .join("\n");

  return `<html>
<head></head>
<body>

    <h1> Following are the titles of given websites: </h1>

    <ul>
${listItems}
    </ul>
</body>
</html>`;
}

function getAddresses(req) {
  const url = new URL(req.url, "http://localhost");

  return url.searchParams.getAll("address").filter(Boolean);
}

function isValidRoute(req) {
  const url = new URL(req.url, "http://localhost");

  return (
    req.method === "GET" &&
    (url.pathname === "/I/want/title" || url.pathname === "/I/want/title/")
  );
}

function sendHtml(res, html) {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
  });

  res.end(html);
}

function send404(res) {
  res.writeHead(404, {
    "Content-Type": "text/plain; charset=utf-8",
  });

  res.end("404 Not Found");
}

module.exports = {
  normalizeAddress,
  extractTitle,
  fetchTitleCallback,
  fetchTitlePromise,
  renderHtml,
  getAddresses,
  isValidRoute,
  sendHtml,
  send404,
};
