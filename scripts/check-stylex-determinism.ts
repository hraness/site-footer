import assert from "node:assert/strict";
import { constants } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const repository = resolve(process.cwd());
const work = await mkdtemp(join(tmpdir(), "hraness-site-footer-determinism-"));
async function buildCopy(destination: string): Promise<void> {
  await mkdir(destination, { recursive: true });
  for (const path of ["src", "package.json", "tsconfig.json", "tsconfig.build.json", "styles.css", "compiler-foundation.css"]) {
    await cp(join(repository, path), join(destination, path), { recursive: true });
  }
  // A shared node_modules symlink makes Bun name bundled modules relative to
  // one canonical absolute target. The spelling then changes with fixture
  // depth even though the dependency bytes do not. A local copy-on-write clone
  // models an ordinary install and keeps dependency source identities rooted
  // at each isolated package copy.
  await cp(join(repository, "node_modules"), join(destination, "node_modules"), {
    mode: constants.COPYFILE_FICLONE,
    recursive: true,
    verbatimSymlinks: true,
  });
  const child = Bun.spawn([process.execPath, join(repository, "scripts/build.ts")], {
    cwd: destination, env: process.env, stdout: "pipe", stderr: "pipe",
  });
  const [exit, out, error] = await Promise.all([
    child.exited, new Response(child.stdout).text(), new Response(child.stderr).text(),
  ]);
  assert.equal(exit, 0, `Determinism build failed: ${out}\n${error}`);
}

try {
  const first = join(work, "first");
  const second = join(work, "nested", "second");
  await buildCopy(first);
  await buildCopy(second);
  const files = (await readdir(join(first, "dist"))).sort();
  assert.deepEqual(files, (await readdir(join(second, "dist"))).sort());
  assert.ok(files.includes("index.js") && files.includes("react.js") && files.includes("stylex-manifest.json") && files.includes("stylex.css"));
  for (const file of files) {
    assert.deepEqual(await readFile(join(first, "dist", file)), await readFile(join(second, "dist", file)),
      `Artifact differs across absolute roots: ${file}`);
  }
  console.log(`SiteFooter emits ${files.length} byte-identical artifacts across absolute roots`);
} finally {
  await rm(work, { force: true, recursive: true });
}
