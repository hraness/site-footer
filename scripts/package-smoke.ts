import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const repository = resolve(import.meta.dir, "..");
const packageJson = JSON.parse(await readFile(resolve(repository, "package.json"), "utf8")) as {
  exports?: Record<string, string | Record<string, string>>;
  files?: string[];
};

const requiredFiles = [
  "dist/index.js",
  "dist/index.d.ts",
  "dist/react.js",
  "dist/react.d.ts",
  "styles.css",
  "README.md",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
];

for (const file of requiredFiles) {
  if (!existsSync(resolve(repository, file))) {
    throw new Error(`Package artifact is missing: ${file}`);
  }
}

if (!packageJson.files?.includes("dist") || !packageJson.files.includes("styles.css")) {
  throw new Error("Package files do not include the built entrypoints and stylesheet.");
}

const rootExport = packageJson.exports?.["."];
const reactExport = packageJson.exports?.["./react"];
if (typeof rootExport !== "object" || rootExport.import !== "./dist/index.js") {
  throw new Error("The framework-neutral package export is not bound to dist/index.js.");
}
if (typeof reactExport !== "object" || reactExport.import !== "./dist/react.js") {
  throw new Error("The React package export is not bound to dist/react.js.");
}
if (packageJson.exports?.["./styles.css"] !== "./styles.css") {
  throw new Error("The stylesheet export is missing.");
}

const root = await import(pathToFileURL(resolve(repository, "dist/index.js")).href) as {
  renderHranessSiteFooter?: () => string;
};
const html = root.renderHranessSiteFooter?.();
if (html === undefined || !html.includes('data-slot="hraness-site-footer"')) {
  throw new Error("The built root export does not render the canonical footer.");
}

const react = await import(pathToFileURL(resolve(repository, "dist/react.js")).href) as {
  HranessSiteFooter?: unknown;
};
if (typeof react.HranessSiteFooter !== "function") {
  throw new Error("The built React adapter is missing.");
}

const reactArtifact = await readFile(resolve(repository, "dist/react.js"), "utf8");
if (reactArtifact.includes("jsxDEV") || reactArtifact.includes("jsx-dev-runtime")) {
  throw new Error("The built React adapter depends on development-only JSX helpers.");
}
