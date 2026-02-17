// Local server — runs API endpoints + optionally serves the built frontend
// Dev:  npm run start  (runs server.js + vite in parallel)
// Prod: npm run build && node server.js  (serves dist/ + API on one port)

import { createServer } from "http";
import { readFileSync, existsSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

config(); // Load .env

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST_DIR = join(__dirname, "dist");
const HAS_DIST = existsSync(join(DIST_DIR, "index.html"));

// MIME types for static file serving
const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

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

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.method === "GET" || req.method === "OPTIONS") return resolve(null);
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : null); }
      catch { resolve(null); }
    });
  });
}

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

// Serve a static file from dist/
function serveStatic(res, filePath) {
  try {
    const fullPath = join(DIST_DIR, filePath);
    if (!existsSync(fullPath)) return false;
    const ext = extname(fullPath);
    const mime = MIME[ext] || "application/octet-stream";
    const content = readFileSync(fullPath);
    res.writeHead(200, { "Content-Type": mime });
    res.end(content);
    return true;
  } catch {
    return false;
  }
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

  // API routes
  const loader = handlers[pathname];
  if (loader) {
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
    return;
  }

  // Static files from dist/ (production mode)
  if (HAS_DIST) {
    // Try exact file match first (e.g. /assets/index-xxx.js)
    if (pathname !== "/" && serveStatic(res, pathname.slice(1))) return;
    // SPA fallback — serve index.html for all non-API routes
    serveStatic(res, "index.html");
    return;
  }

  // No dist/ and not an API route — tell user to use Vite dev server
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found. Run 'npm run dev' for the frontend, or 'npm run build' first.");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`Keys: Anthropic=${!!process.env.ANTHROPIC_API_KEY} HubSpot=${!!process.env.HUBSPOT_PRIVATE_APP_TOKEN} Perplexity=${!!process.env.PERPLEXITY_API_KEY}`);
  if (HAS_DIST) {
    console.log(`Serving frontend from dist/`);
  } else {
    console.log(`No dist/ found — run "npm run dev" for the frontend`);
  }
});
