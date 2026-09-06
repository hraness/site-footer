import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  STYLEX_PACKAGE_MANIFEST_SCHEMA_VERSION,
  artifactForFile,
  canonicalJson,
  compilerContract,
  compilerSha256,
  readStylexPackageManifest,
  serializeStylexPackageRules,
  stylexRulesSha256,
  validateStylexPackageManifest,
  type StylexStandaloneSerializerV1,
} from "@hraness/ui/stylex-build";
import { normalizeStylexSourceMap, packageStylexTransform } from "./stylex-transform.js";

const CLIENT_COMPONENT_DIRECTIVE = '"use client";';
export const STANDALONE_SERIALIZER = {
  before: ["components.hraness-site-footer.legacy"],
  prefix: "components.hraness-site-footer",
} as const satisfies StylexStandaloneSerializerV1;

export async function buildPackage(repository: string): Promise<void> {
  assert.equal(Bun.version, "1.3.14", "Package builds require Bun 1.3.14");
  repository = resolve(repository);
  const outputDirectory = join(repository, "dist");
  await rm(outputDirectory, { force: true, recursive: true });
  const previousDirectory = process.cwd();
  const previousEnvironment = process.env.NODE_ENV;
  process.chdir(repository);
  process.env.NODE_ENV = "production";
  try {
    const { collector, plugin, transformedSources } = packageStylexTransform(repository);
    // Both entry graphs contribute to one collector. Do not seal between builds
    // or race builds: React-only recipes must belong to the package manifest.
    for (const entry of ["index.ts", "react.tsx"]) {
      const result = await Bun.build({
        ...(entry === "react.tsx" ? { banner: CLIENT_COMPONENT_DIRECTIVE } : {}),
        conditions: ["production", "browser", "module"],
        define: { "process.env.NODE_ENV": JSON.stringify("production") },
        entrypoints: [join(repository, "src", entry)],
        env: "disable",
        external: ["react", "react/jsx-runtime"],
        format: "esm",
        minify: false,
        outdir: outputDirectory,
        plugins: [plugin],
        root: join(repository, "src"),
        sourcemap: "external",
        target: "browser",
      });
      if (!result.success) throw new Error(result.logs.map(String).join("\n"));
    }
    const rules = collector.seal();
    assert.ok(rules.length > 0, "Package build collected no StyleX rules");
    const reactOutput = join(outputDirectory, "react.js");
    const artifact = await readFile(reactOutput, "utf8");
    assert.ok(artifact.startsWith(CLIENT_COMPONENT_DIRECTIVE), "React banner must be first");
    // Retain every output line so Bun's external map keeps its generated line
    // positions. Only the banner keeps the directive; later copies become blank.
    const normalized = artifact.split("\n").map((line, index) =>
      line.trim() === CLIENT_COMPONENT_DIRECTIVE && index !== 0 ? "" : line
    ).join("\n");
    await writeFile(reactOutput, normalized);

    const mappedSources = new Set<string>();
    for (const entry of ["index", "react"]) {
      const mapPath = join(outputDirectory, `${entry}.js.map`);
      const normalizedMap = normalizeStylexSourceMap(
        await readFile(mapPath, "utf8"),
        `dist/${entry}.js.map`,
        transformedSources,
      );
      for (const logical of normalizedMap.logicalPaths) mappedSources.add(logical);
      await writeFile(mapPath, normalizedMap.source);
    }
    assert.deepEqual([...mappedSources].sort(), [...transformedSources.keys()].sort(),
      "External maps must cover every transformed source loaded by either entry graph");

    const tsc = Bun.spawnSync([
      join(repository, "node_modules/.bin/tsc"), "--project", join(repository, "tsconfig.build.json"),
    ], { cwd: repository, stderr: "inherit", stdout: "inherit" });
    if (tsc.exitCode !== 0) throw new Error("Declaration build failed");

    await writeFile(join(outputDirectory, "stylex.css"), serializeStylexPackageRules(rules, STANDALONE_SERIALIZER));
    const rawPackage: unknown = JSON.parse(await readFile(join(repository, "package.json"), "utf8"));
    assert.ok(typeof rawPackage === "object" && rawPackage !== null && !Array.isArray(rawPackage));
    const record = rawPackage as Record<string, unknown>;
    assert.equal(record.name, "@hraness/site-footer");
    assert.ok(typeof record.version === "string" && record.version.length > 0);
    const manifest = validateStylexPackageManifest({
      buildTools: [],
      compiler: compilerContract,
      compilerFoundation: "compiler-foundation.css",
      compilerSha256,
      kind: "hraness-stylex-package-manifest",
      package: { name: record.name, version: record.version },
      rules,
      rulesSha256: stylexRulesSha256(rules),
      runtime: await Promise.all(["dist/index.js", "dist/react.js"].map((path) => artifactForFile(repository, path))),
      schemaVersion: STYLEX_PACKAGE_MANIFEST_SCHEMA_VERSION,
      standaloneCss: await artifactForFile(repository, "dist/stylex.css"),
      standaloneSerializer: STANDALONE_SERIALIZER,
      stylesheets: await Promise.all(["compiler-foundation.css", "styles.css"].map((path) => artifactForFile(repository, path))),
    });
    const manifestPath = join(outputDirectory, "stylex-manifest.json");
    await writeFile(manifestPath, canonicalJson(manifest) + "\n");
    assert.deepEqual(await readStylexPackageManifest(manifestPath, repository), manifest);
  } finally {
    process.chdir(previousDirectory);
    if (previousEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnvironment;
  }
}

if (import.meta.main) await buildPackage(process.cwd());
