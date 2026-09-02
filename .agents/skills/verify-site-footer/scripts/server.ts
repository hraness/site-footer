import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";

interface ServerArguments {
  readonly host: "127.0.0.1";
  readonly ownershipToken: string;
  readonly pidFile: string;
  readonly port: number;
  readonly root: string;
}

const TOKEN_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;

function parseArguments(arguments_: readonly string[]): ServerArguments {
  const values = new Map<string, string>();
  for (let index = 0; index < arguments_.length; index += 2) {
    const key = arguments_[index];
    const value = arguments_[index + 1];
    if (key === undefined || value === undefined || !key.startsWith("--")) {
      throw new Error("The footer fixture server requires key-value arguments.");
    }
    if (values.has(key)) throw new Error(`Duplicate fixture server argument: ${key}`);
    values.set(key, value);
  }
  const allowed = new Set(["--host", "--ownership-token", "--pid-file", "--port", "--root"]);
  for (const key of values.keys()) {
    if (!allowed.has(key)) throw new Error(`Unknown fixture server argument: ${key}`);
  }
  const host = values.get("--host");
  const ownershipToken = values.get("--ownership-token") ?? "";
  const pidFile = values.get("--pid-file") ?? "";
  const port = Number(values.get("--port"));
  const root = values.get("--root") ?? "";
  if (host !== "127.0.0.1") throw new Error("The footer fixture server is loopback-only.");
  if (!TOKEN_PATTERN.test(ownershipToken)) throw new Error("Invalid fixture ownership token.");
  if (!isAbsolute(pidFile) || basename(pidFile) !== "server.json") {
    throw new Error("The fixture PID file must be an absolute server.json path.");
  }
  if (!Number.isInteger(port) || port < 1024 || port > 65_535) {
    throw new Error("The fixture server port must be an unprivileged TCP port.");
  }
  if (!isAbsolute(root)) throw new Error("The fixture bundle root must be absolute.");
  return { host, ownershipToken, pidFile, port, root: resolve(root) };
}

const arguments_ = parseArguments(process.argv.slice(2));
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>Hraness site footer browser fixture</title>
    <link rel="icon" href="data:,">
    <link rel="stylesheet" href="/fixture.css">
  </head>
  <body>
    <div id="fixture-root"></div>
    <script type="module" src="/fixture.js"></script>
  </body>
</html>`;

const contentTypes: Readonly<Record<string, string>> = {
  "/fixture.css": "text/css; charset=utf-8",
  "/fixture.js": "text/javascript; charset=utf-8",
  "/fixture.js.map": "application/json; charset=utf-8",
};

const temporaryPidFile = join(
  dirname(arguments_.pidFile),
  `.${process.pid}-server.json.tmp`,
);
await writeFile(temporaryPidFile, `${JSON.stringify({
  ownershipToken: arguments_.ownershipToken,
  pid: process.pid,
  root: arguments_.root,
  schema: "hraness.site-footer.fixture-server/v1",
})}\n`, { encoding: "utf8", mode: 0o600 });
await rename(temporaryPidFile, arguments_.pidFile);

const server = Bun.serve({
  fetch: async (request) => {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({
        ownershipToken: arguments_.ownershipToken,
        schema: "hraness.site-footer.fixture-health/v1",
      }, { headers: { "cache-control": "no-store" } });
    }
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(html, {
        headers: {
          "cache-control": "no-store",
          "content-security-policy": "default-src 'self'; connect-src 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
          "content-type": "text/html; charset=utf-8",
        },
      });
    }
    const contentType = contentTypes[url.pathname];
    if (contentType === undefined) return new Response("Not found", { status: 404 });
    const path = join(arguments_.root, url.pathname.slice(1));
    try {
      const body = Uint8Array.from(await readFile(path));
      return new Response(body, {
        headers: { "cache-control": "no-store", "content-type": contentType },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  },
  hostname: arguments_.host,
  port: arguments_.port,
});

let stopping = false;
async function stop(): Promise<void> {
  if (stopping) return;
  stopping = true;
  server.stop(true);
  await unlink(arguments_.pidFile).catch(() => undefined);
  process.exit(0);
}

process.on("SIGINT", () => void stop());
process.on("SIGTERM", () => void stop());
console.log(`site-footer fixture ready at ${server.url.origin}`);
