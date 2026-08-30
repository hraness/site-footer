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
  HRANESS_MAILING_SUBSCRIBE_URL?: string;
  HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL?: string;
  HRANESS_TURNSTILE_SCRIPT_URL?: string;
  renderHranessSiteFooter?: (options: {
    mailingList:
      | { audience: string; kind: "signup"; turnstileSitekey: string }
      | { kind: "none" };
    showBrand?: boolean;
    turnstileScriptNonce?: string;
  }) => string;
};
const html = root.renderHranessSiteFooter?.({
  mailingList: {
    audience: "package-smoke",
    kind: "signup",
    turnstileSitekey: "1x00000000000000000000AA",
  },
  turnstileScriptNonce: "cGFja2FnZS1zbW9rZS0x",
});
if (
  html === undefined
  || !html.includes('data-slot="hraness-site-footer"')
  || !html.includes('id="hraness-site-footer"')
) {
  throw new Error("The built root export does not render the canonical footer.");
}
if (
  root.HRANESS_MAILING_SUBSCRIBE_URL
    !== "https://account.hraness.com/api/mailing/subscribe"
  || root.HRANESS_TURNSTILE_EXPLICIT_SCRIPT_URL
    !== "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
  || root.HRANESS_TURNSTILE_SCRIPT_URL
    !== "https://challenges.cloudflare.com/turnstile/v0/api.js"
  || !html.includes(`action="${root.HRANESS_MAILING_SUBSCRIBE_URL}"`)
  || !html.includes('name="audience" type="hidden" value="package-smoke"')
  || !html.includes('data-action="mailing_package_smoke"')
  || !html.includes('data-response-field-name="cf-turnstile-response"')
  || !html.includes(`src="${root.HRANESS_TURNSTILE_SCRIPT_URL}"`)
  || !html.includes('nonce="cGFja2FnZS1zbW9rZS0x"')
  || html.includes("substack.com")
) {
  throw new Error("The built root export lost its closed mailing-list contract.");
}
const unbrandedHtml = root.renderHranessSiteFooter?.({
  mailingList: { kind: "none" },
  showBrand: false,
});
if (unbrandedHtml === undefined || unbrandedHtml.includes('data-slot="hraness-mark"')) {
  throw new Error("The built root export cannot omit duplicate Hraness branding.");
}

const react = await import(pathToFileURL(resolve(repository, "dist/react.js")).href) as {
  HranessSiteFooter?: unknown;
};
if (typeof react.HranessSiteFooter !== "function") {
  throw new Error("The built React adapter is missing.");
}

const reactArtifact = await readFile(resolve(repository, "dist/react.js"), "utf8");
if (!reactArtifact.startsWith('"use client";')) {
  throw new Error("The built React adapter lost its client-component directive.");
}
if (reactArtifact.includes("jsxDEV") || reactArtifact.includes("jsx-dev-runtime")) {
  throw new Error("The built React adapter depends on development-only JSX helpers.");
}
