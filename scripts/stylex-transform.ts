import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import { createStylexTransformCollector } from "@hraness/ui/stylex-build";

export const GENERATED_STYLEX_SOURCE_PREFIX = "stylex-generated:///src/";

type ExternalSourceMap = Record<string, unknown> & {
  sources: string[];
  sourcesContent: string[];
};

function externalSourceMap(source: string, label: string): ExternalSourceMap {
  const parsed: unknown = JSON.parse(source);
  assert.ok(typeof parsed === "object" && parsed !== null && !Array.isArray(parsed), `${label} must be an object`);
  const map = parsed as Record<string, unknown>;
  assert.equal(map.version, 3, `${label} must use source-map version 3`);
  assert.ok(Array.isArray(map.sources) && map.sources.every((value) => typeof value === "string"),
    `${label} sources must be strings`);
  assert.ok(Array.isArray(map.sourcesContent) && map.sourcesContent.every((value) => typeof value === "string"),
    `${label} sourcesContent must embed every source`);
  assert.equal(map.sourcesContent.length, map.sources.length, `${label} must pair every source with its content`);
  assert.ok(typeof map.mappings === "string" && map.mappings.length > 0, `${label} mappings must be non-empty`);
  assert.ok(typeof map.debugId === "string" && /^[A-F0-9]{32}$/u.test(map.debugId),
    `${label} must contain its Bun debug ID`);
  return map as ExternalSourceMap;
}

function generatedLogicalPath(source: string, label: string): string {
  const logical = source.slice(GENERATED_STYLEX_SOURCE_PREFIX.length);
  assert.ok(logical.length > 0 && !logical.startsWith("/") && !logical.startsWith("../")
    && !logical.includes("/../") && !logical.includes("\\"), `${label} has an invalid generated source path`);
  return logical;
}

/**
 * Bun's plugin API cannot accept Babel's input map. Its external map therefore
 * maps to the exact transformed source returned by onLoad, not to the original
 * TypeScript. Relabel only those proven embedded intermediates so published
 * maps remain useful without claiming provenance that the toolchain lacks.
 */
export function normalizeStylexSourceMap(
  source: string,
  label: string,
  transformedSources: ReadonlyMap<string, string>,
): Readonly<{ logicalPaths: readonly string[]; source: string }> {
  const map = externalSourceMap(source, label);
  const logicalPaths: string[] = [];
  map.sources = map.sources.map((mappedSource, index) => {
    assert.ok(!mappedSource.startsWith(GENERATED_STYLEX_SOURCE_PREFIX),
      `${label} must not arrive with a pre-normalized generated source`);
    if (!mappedSource.startsWith("../src/")) return mappedSource;
    const logical = mappedSource.slice("../src/".length);
    assert.ok(logical.length > 0 && !logical.startsWith("/") && !logical.startsWith("../")
      && !logical.includes("/../") && !logical.includes("\\"), `${label} has an invalid owned source path`);
    const expected = transformedSources.get(logical);
    assert.notEqual(expected, undefined, `${label} contains an unexpected owned source: ${mappedSource}`);
    assert.equal(map.sourcesContent[index], expected,
      `${label} does not embed the exact transformed source for src/${logical}`);
    assert.ok(!logicalPaths.includes(logical), `${label} duplicates the owned source src/${logical}`);
    logicalPaths.push(logical);
    return `${GENERATED_STYLEX_SOURCE_PREFIX}${logical}`;
  });
  assert.ok(logicalPaths.length > 0, `${label} contains no owned transformed sources`);
  return Object.freeze({ logicalPaths: Object.freeze(logicalPaths), source: `${JSON.stringify(map, null, 2)}\n` });
}

export function verifyStylexSourceMap(
  source: string,
  label: string,
  transformedSources: ReadonlyMap<string, string>,
  runtime: string,
): readonly string[] {
  const map = externalSourceMap(source, label);
  const runtimeIds = [...runtime.matchAll(/^\/\/# debugId=(\S+)\s*$/gmu)].map((match) => match[1]);
  assert.deepEqual(runtimeIds, [map.debugId], `${label} debug ID must match exactly one sibling runtime marker`);
  const logicalPaths: string[] = [];
  for (const [index, mappedSource] of map.sources.entries()) {
    assert.ok(!mappedSource.startsWith("../src/"), `${label} falsely claims an original TypeScript source`);
    if (!mappedSource.startsWith(GENERATED_STYLEX_SOURCE_PREFIX)) continue;
    const logical = generatedLogicalPath(mappedSource, label);
    const expected = transformedSources.get(logical);
    assert.notEqual(expected, undefined, `${label} contains an unexpected generated source: ${mappedSource}`);
    assert.equal(map.sourcesContent[index], expected,
      `${label} does not embed the exact transformed source for src/${logical}`);
    assert.ok(!logicalPaths.includes(logical), `${label} duplicates the generated source src/${logical}`);
    logicalPaths.push(logical);
  }
  assert.ok(logicalPaths.length > 0, `${label} contains no generated StyleX sources`);
  return Object.freeze(logicalPaths);
}

/** Adapt Bun's loader to the published compiler; extraction and policy stay upstream. */
export function packageStylexTransform(repository: string) {
  const collector = createStylexTransformCollector(repository);
  const absoluteSourceRoot = resolve(repository, "src");
  const sourceRoot = absoluteSourceRoot.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const transformedSources = new Map<string, string>();
  const plugin: Bun.BunPlugin = {
    name: "hraness-site-footer-stylex",
    setup(build) {
      build.onLoad({ filter: new RegExp(`^${sourceRoot}/.*\\.[cm]?[jt]sx?$`, "u") }, async ({ path }) => {
        const source = await readFile(path, "utf8");
        const { code } = await collector.transform(source, path);
        const logical = relative(absoluteSourceRoot, resolve(path)).split(sep).join("/");
        assert.ok(logical.length > 0 && !logical.startsWith("../") && !logical.includes("/../"),
          `StyleX transformed a source outside src: ${path}`);
        const previous = transformedSources.get(logical);
        if (previous === undefined) transformedSources.set(logical, code);
        else assert.equal(code, previous, `StyleX transform changed between entry graphs: src/${logical}`);
        const extension = extname(path);
        const loader = extension === ".tsx" ? "tsx" : extension === ".ts" ? "ts" : extension === ".jsx" ? "jsx" : "js";
        return { contents: code, loader };
      });
    },
  };
  return { collector, plugin, transformedSources };
}
