import { resolve } from "node:path";

const repository = resolve(import.meta.dir, "..");

for (const command of [
  [resolve(repository, "node_modules/.bin/tsc"), "--noEmit", "--project", resolve(repository, "tsconfig.json")],
  ["bun", "run", "build"],
  ["bun", "run", "test"],
  ["bun", "run", "test:package"],
] as const) {
  const result = Bun.spawnSync([...command], {
    cwd: repository,
    stderr: "inherit",
    stdout: "inherit",
  });

  if (result.exitCode !== 0) {
    process.exit(result.exitCode);
  }
}
