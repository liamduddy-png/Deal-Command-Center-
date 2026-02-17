// Local dev server — runs the API endpoints on port 3000
// Vite proxies /api/* to this server (see vite.config.js)
// Usage: node server.js (then run `npm run dev` in another terminal)

import { createServer } from "http";
import { parse } from "url";
import { config } from "dotenv";

config(); // Load .env

// Lazy-import API handlers
const handlers = {
  "/api/health": () => import("./api/health.js"),
  "/api/generate": () => import("./api/generate.js"),
  "/api/chat": () => import("./api/chat.js"),
  "/api/deal": () => import("./api/deal.js"),
  "/api/hubspot": () => import("./api/hubspot.js"),
  "/api/deep-research": () => import("./api/deep-research.js"),
  "/api/properties": () => import("./api/properties.js").catch(() => null),
  "/api/mapping": () => import("./api/mapping.js").catch(() => null),
};

// Parse JSON body from request
function parseBody(req) {
  return new Promise((resolve) => {
    if (req.method === "GET" || req.method === "OPTIONS") return resolve(null);
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : null);
      } catch {
        resolve(null);
      }
    });
  });
}

// Adapt Node http req/res to Vercel-style handler signature
function adaptRequest(req, parsedUrl, body) {
  req.query = Object.fromEntries(parsedUrl.searchParams || []);
  req.body = body;
  return req;
}

function adaptResponse(res) {
  const original = res;
  return new Proxy(res, {
    get(target, prop) {
      if (prop === "status") {
        return (code) => {
          original.statusCode = code;
          return {
            json: (data) => {
              original.setHeader("Content-Type", "application/json");
              original.end(JSON.stringify(data));
            },
            end: () => original.end(),
          };
        };
      }
      if (prop === "json") {
        return (data) => {
          original.setHeader("Content-Type", "application/json");
          original.end(JSON.stringify(data));
        };
      }
      return typeof target[prop] === "function"
        ? target[prop].bind(target)
        : target[prop];
    },
  });
}

const server = createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:3000`);
  const pathname = parsedUrl.pathname;

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Match route
  const loader = handlers[pathname];
  if (!loader) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  try {
    const mod = await loader();
    if (!mod || !mod.default) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Handler not found" }));
      return;
    }

    const body = await parseBody(req);
    const adaptedReq = adaptRequest(req, parsedUrl, body);
    const adaptedRes = adaptResponse(res);

    await mod.default(adaptedReq, adaptedRes);
  } catch (err) {
    console.error(`[server] Error handling ${pathname}:`, err.message);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
});

const PORT = process.env.API_PORT || 3000;
server.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Keys loaded: Anthropic=${!!process.env.ANTHROPIC_API_KEY} HubSpot=${!!process.env.HUBSPOT_PRIVATE_APP_TOKEN} Perplexity=${!!process.env.PERPLEXITY_API_KEY}`);
  console.log(`\nRun "npm run dev" in another terminal for the frontend.`);
});
