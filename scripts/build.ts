import { readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repository = resolve(import.meta.dir, "..");
const outputDirectory = resolve(repository, "dist");
const reactOutput = resolve(outputDirectory, "react.js");
const CLIENT_COMPONENT_DIRECTIVE = '"use client";';

async function normalizeReactClientDirective(): Promise<void> {
  const artifact = await readFile(reactOutput, "utf8");
  const lines = artifact.split("\n");

  if (lines[0] !== CLIENT_COMPONENT_DIRECTIVE) {
    throw new Error("The React build banner must be the first output line.");
  }

  let directiveCount = 0;
  const normalized = lines.map((line, index) => {
    if (line.trim() !== CLIENT_COMPONENT_DIRECTIVE) return line;
    directiveCount += 1;
    return index === 0 ? CLIENT_COMPONENT_DIRECTIVE : "";
  }).join("\n");

  if (directiveCount === 0) {
    throw new Error("The React build lost its client-component directive.");
  }

  await writeFile(reactOutput, normalized);
}

await rm(outputDirectory, { force: true, recursive: true });

const builds = await Promise.all([
  Bun.build({
    entrypoints: [resolve(repository, "src/index.ts")],
    format: "esm",
    minify: false,
    outdir: outputDirectory,
    sourcemap: "external",
    target: "browser",
  }),
  Bun.build({
    banner: '"use client";',
    entrypoints: [resolve(repository, "src/react.tsx")],
    external: ["react", "react/jsx-runtime"],
    format: "esm",
    minify: false,
    outdir: outputDirectory,
    sourcemap: "external",
    target: "browser",
  }),
]);

for (const build of builds) {
  if (build.success) continue;
  for (const log of build.logs) {
    console.error(log);
  }
  process.exit(1);
}

await normalizeReactClientDirective();

const tsc = Bun.spawnSync([
  resolve(repository, "node_modules/.bin/tsc"),
  "--project",
  resolve(repository, "tsconfig.build.json"),
], {
  cwd: repository,
  stderr: "inherit",
  stdout: "inherit",
});

if (tsc.exitCode !== 0) {
  process.exit(tsc.exitCode);
}
