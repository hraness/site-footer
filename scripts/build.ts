import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const repository = resolve(import.meta.dir, "..");
const outputDirectory = resolve(repository, "dist");

await rm(outputDirectory, { force: true, recursive: true });

const build = await Bun.build({
  entrypoints: [
    resolve(repository, "src/index.ts"),
    resolve(repository, "src/react.tsx"),
  ],
  external: ["react", "react/jsx-runtime"],
  format: "esm",
  minify: false,
  outdir: outputDirectory,
  sourcemap: "external",
  target: "browser",
});

if (!build.success) {
  for (const log of build.logs) {
    console.error(log);
  }
  process.exit(1);
}

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

