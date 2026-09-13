import { existsSync } from "node:fs";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { readStylexPackageManifest } from "@hraness/ui/stylex-build";

const repository = resolve(import.meta.dir, "..");
const CLIENT_COMPONENT_DIRECTIVE = '"use client";';
const packageJson = JSON.parse(await readFile(resolve(repository, "package.json"), "utf8")) as {
  exports?: Record<string, string | Record<string, string>>;
  files?: string[];
};

const requiredFiles = [
  "dist/index.js",
  "dist/index.js.map",
  "dist/index.d.ts",
  "dist/react.js",
  "dist/react.js.map",
  "dist/react.d.ts",
  "styles.css",
  "compiler-foundation.css",
  "dist/stylex.css",
  "dist/stylex-manifest.json",
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
  renderHranessSiteFooter?: (options: {
    mailingList:
      | { audience: string; kind: "signup" }
      | { kind: "none" };
    showBrand?: boolean;
    social?: Readonly<Partial<Record<"github" | "linkedin" | "substack" | "x", {
      href: string;
      label?: string;
    }>>>;
  }) => string;
};
const html = root.renderHranessSiteFooter?.({
  mailingList: {
    audience: "package-smoke",
    kind: "signup",
  },
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
  || !html.includes(`action="${root.HRANESS_MAILING_SUBSCRIBE_URL}"`)
  || !html.includes('name="audience" type="hidden" value="package-smoke"')
  || !html.includes('name="website"')
  || html.includes("turnstile")
  || /challenges\.cloudflare\.com/u.test(html)
  || html.includes("<script")
  || !html.includes('href="https://substack.com/@hraness"')
  || html.indexOf('href="https://substack.com/@hraness"')
    > html.indexOf('href="https://x.com/hraness"')
  || html.includes("bsky.app")
  || html.includes("bluesky")
  || (html.match(/class="[^"]*hraness-site-footer__social-link/gu) ?? []).length !== 4
) {
  throw new Error("The built root export lost its closed mailing-list contract.");
}
const aichartsHtml = root.renderHranessSiteFooter?.({
  mailingList: { kind: "none" },
  social: {
    github: {
      href: "https://github.com/hraness/aicharts",
      label: "AI Charts on GitHub",
    },
    x: {
      href: "https://x.com/aichartsio",
      label: "AI Charts on X",
    },
  },
});
if (
  aichartsHtml === undefined
  || !aichartsHtml.includes('href="https://x.com/aichartsio"')
  || !aichartsHtml.includes('href="https://github.com/hraness/aicharts"')
  || !aichartsHtml.includes('aria-label="AI Charts on X"')
  || aichartsHtml.includes('href="https://x.com/hraness"')
  || (aichartsHtml.match(/class="[^"]*hraness-site-footer__social-link/gu) ?? []).length !== 4
) {
  throw new Error("The built root export cannot retarget owned social destinations.");
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
const reactArtifactLines = reactArtifact.split("\n");
const clientDirectiveLines = reactArtifactLines.flatMap((line, index) =>
  line.trim() === CLIENT_COMPONENT_DIRECTIVE ? [index] : []
);
const firstImportLine = reactArtifactLines.findIndex((line) =>
  /^import(?:[\s{'"*]|$)/u.test(line.trim())
);
if (
  reactArtifactLines[0] !== CLIENT_COMPONENT_DIRECTIVE
  || clientDirectiveLines.length !== 1
  || clientDirectiveLines[0] !== 0
  || (firstImportLine >= 0 && clientDirectiveLines.some((line) => line > firstImportLine))
) {
  throw new Error(
    "The built React adapter must expose one client-component directive before every import.",
  );
}
if (reactArtifact.includes("jsxDEV") || reactArtifact.includes("jsx-dev-runtime")) {
  throw new Error("The built React adapter depends on development-only JSX helpers.");
}

// Exercise the actual packed boundary without any consumer dependencies. The
// static root must render with neither React nor the compiler installed beside it.
const temporary = await realpath(await mkdtemp(resolve(tmpdir(), "hraness-site-footer-package-")));
function run(command: string[], cwd: string): void {
  const result = Bun.spawnSync(command, { cwd, stderr: "pipe", stdout: "pipe" });
  assert.equal(result.exitCode, 0, `${command[1] ?? command[0]} failed: ${result.stderr.toString()}`);
}
try {
  const archive = resolve(temporary, "package.tgz");
  const consumer = resolve(temporary, "consumer");
  await mkdir(consumer);
  run([process.execPath, "pm", "pack", "--filename", archive, "--ignore-scripts", "--quiet"], repository);
  run(["tar", "-xzf", archive, "-C", consumer], repository);
  const packed = resolve(consumer, "package");
  for (const file of requiredFiles) assert.ok(existsSync(resolve(packed, file)), `Packed artifact is missing: ${file}`);
  assert.ok(!existsSync(resolve(packed, "node_modules")));
  assert.ok(!existsSync(resolve(packed, ".agents")));
  const packedManifest = await readStylexPackageManifest(resolve(packed, "dist/stylex-manifest.json"), packed);
  run([process.execPath, "-e", `
    const { renderHranessSiteFooter } = await import(${JSON.stringify(pathToFileURL(resolve(packed, "dist/index.js")).href)});
    const html = renderHranessSiteFooter({mailingList:{kind:"none"}});
    if (!html.includes('class="hraness-site-footer x') || !html.includes('Hraness on Substack')) throw new Error("Detached root render failed");
  `], consumer);
  const cssBuild = await Bun.build({ entrypoints: [resolve(packed, "styles.css")], target: "browser" });
  assert.ok(cssBuild.success, cssBuild.logs.map(String).join("\n"));
  const packedCss = (await Promise.all(cssBuild.outputs.map((output) => output.text()))).join("\n");
  for (const [key, rule] of packedManifest.rules) {
    if (rule.constKey === undefined) {
      const selector = rule.ltr.startsWith("@keyframes") ? `@keyframes ${key}` : `.${key}`;
      assert.ok(packedCss.includes(selector), `Packed CSS omits atomic class ${key}`);
    }
  }
  console.log("Packed SiteFooter renders without React or compiler dependencies and resolves every CSS rule");
} finally {
  await rm(temporary, { force: true, recursive: true });
}
