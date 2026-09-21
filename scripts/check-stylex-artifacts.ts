import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  canonicalJson,
  compilerSha256,
  createStylexTransformCollector,
  readStylexPackageManifest,
  serializeStylexPackageRules,
  stylexRulesSha256,
} from "@hraness/ui/stylex-build";
import ts from "typescript";
import { STANDALONE_SERIALIZER } from "./build.js";
import { verifyStylexSourceMap } from "./stylex-transform.js";

/** Exact, path-specific boundary: there are no handwritten CSS exceptions. */
export function assertPresentationBoundary(path: string, css: string): void {
  const content = css.replace(/\/\*[\s\S]*?\*\//gu, "").trim();
  if (path === "styles.css") {
    assert.equal(content, '@import "./dist/stylex.css";', "Compatibility CSS must only import compiled presentation");
  } else if (path === "compiler-foundation.css") {
    assert.equal(content, "", "Compiler foundation must contain no standalone or handwritten presentation");
  } else {
    throw new Error(`Unregistered authored stylesheet: ${path}`);
  }
}

export function assertSourceBoundary(path: string, source: string): void {
  const parsed = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true,
    path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visit(node: ts.Node): void {
    if (ts.isJsxAttribute(node) && node.name.getText(parsed) === "style") {
      throw new Error(`Owned inline presentation is forbidden: ${path}`);
    }
    if (ts.isPropertyAssignment(node)) {
      const key = node.name.getText(parsed).replace(/^["']|["']$/gu, "");
      assert.notEqual(key, "style", `Owned style objects are forbidden: ${path}`);
    }
    if (ts.isPropertyAccessExpression(node)) {
      // The pointer controller may only update two numeric light inputs
      // consumed by compiled recipes. It cannot set CSS declarations, inject
      // styles or sheets, and it never rotates the material direction.
      const call = node.parent.parent;
      const foilInput = path === "src/foil.ts" && node.name.text === "style"
        && ts.isPropertyAccessExpression(node.parent)
        && ["setProperty", "removeProperty"].includes(node.parent.name.text)
        && ts.isCallExpression(call) && call.expression === node.parent
        && call.arguments[0] !== undefined && ts.isStringLiteral(call.arguments[0])
        && ["--hraness-foil-x", "--hraness-foil-y"].includes(call.arguments[0].text);
      // Native-dialog custody may supply two numeric viewport inputs and
      // preserve/restore only the document root's overflow while it is modal.
      const modalInput = path === "src/react.tsx" && node.name.text === "style"
        && ts.isIdentifier(node.expression) && ts.isPropertyAccessExpression(node.parent)
        && ts.isCallExpression(call) && call.expression === node.parent
        && call.arguments[0] !== undefined && ts.isStringLiteral(call.arguments[0])
        && ((node.expression.text === "dialog" && node.parent.name.text === "setProperty"
          && ["--hraness-signup-viewport-height", "--hraness-signup-viewport-top"].includes(call.arguments[0].text))
          || (node.expression.text === "root" && call.arguments[0].text === "overflow"
            && ["getPropertyValue", "getPropertyPriority", "setProperty", "removeProperty"].includes(node.parent.name.text)));
      assert.ok(foilInput || modalInput || !["style", "adoptedStyleSheets", "insertRule"].includes(node.name.text),
        `Owned runtime CSS mutation is forbidden: ${path}`);
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const first = node.arguments[0];
      if (["setAttribute", "createElement"].includes(node.expression.name.text)
        && first !== undefined && ts.isStringLiteral(first)) {
        assert.notEqual(first.text.toLowerCase(), "style", `Owned style injection is forbidden: ${path}`);
      }
    }
    if (ts.isCallExpression(node) && /(?:^|\.)create$/u.test(node.expression.getText(parsed))) {
      if (node.expression.getText(parsed) === "stylex.create") {
        assert.equal(path, "src/footer.stylex.ts", "Recipes must stay in the owned StyleX boundary");
      }
    }
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      assert.ok(!node.moduleSpecifier.text.endsWith(".css"), `Runtime source must not inject CSS: ${path}`);
    }
    if (ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      assert.ok(!/\bstyle\s*=\s*["']|<style\b/iu.test(node.text), `Owned HTML styles are forbidden: ${path}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
}

async function sourceFiles(directory: string, prefix = "src"): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    assert.ok(!entry.isSymbolicLink(), `Source must not contain symlinks: ${entry.name}`);
    const path = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) files.push(...await sourceFiles(join(directory, entry.name), path));
    else files.push(path);
  }
  return files.sort();
}

export async function checkStylexArtifacts(repository: string): Promise<void> {
  const manifest = await readStylexPackageManifest(join(repository, "dist/stylex-manifest.json"), repository);
  const pkg = JSON.parse(await readFile(join(repository, "package.json"), "utf8")) as {
    name: string; version: string; exports: Record<string, unknown>; files: string[]; sideEffects: string[];
  };
  assert.deepEqual(manifest.package, { name: pkg.name, version: pkg.version });
  assert.equal(manifest.compilerSha256, compilerSha256);
  assert.equal(manifest.compiler.transform.propertyValidationMode, "throw");
  assert.equal(compilerSha256, "9ac2c8448ec8f198047e824ce27a97657e05025918c01c204aa0399f94641049");
  assert.deepEqual(manifest.standaloneSerializer, STANDALONE_SERIALIZER);
  assert.deepEqual(manifest.runtime.map(({ path }) => path), ["dist/index.js", "dist/react.js"]);
  assert.deepEqual(manifest.stylesheets.map(({ path }) => path), ["compiler-foundation.css", "styles.css"]);
  assert.equal(manifest.compilerFoundation, "compiler-foundation.css");
  assert.equal(manifest.rulesSha256, stylexRulesSha256(manifest.rules));
  const css = await readFile(join(repository, "dist/stylex.css"), "utf8");
  assert.equal(css, serializeStylexPackageRules(manifest.rules, STANDALONE_SERIALIZER));
  for (const [entry, target] of Object.entries({
    "./styles.css": "./styles.css", "./compiler-foundation.css": "./compiler-foundation.css",
    "./stylex.css": "./dist/stylex.css", "./stylex-manifest.json": "./dist/stylex-manifest.json",
  })) assert.equal(pkg.exports[entry], target);
  for (const path of ["styles.css", "compiler-foundation.css"]) {
    assert.ok(pkg.files.includes(path));
    assertPresentationBoundary(path, await readFile(join(repository, path), "utf8"));
  }
  for (const path of (await readdir(repository)).filter((file) => file.endsWith(".css"))) {
    assertPresentationBoundary(path, await readFile(join(repository, path), "utf8"));
  }
  for (const path of ["./styles.css", "./compiler-foundation.css", "./dist/stylex.css"]) {
    assert.ok(pkg.sideEffects.includes(path), `CSS is not marked side-effectful: ${path}`);
  }
  const collector = createStylexTransformCollector(repository);
  const transformedSources = new Map<string, string>();
  for (const path of await sourceFiles(join(repository, "src"))) {
    const source = await readFile(join(repository, path), "utf8");
    if (path.endsWith(".css")) assertPresentationBoundary(path, source);
    else if (/\.[cm]?[jt]sx?$/u.test(path)) {
      assertSourceBoundary(path, source);
      const { code } = await collector.transform(source, join(repository, path));
      transformedSources.set(path.slice("src/".length), code);
    }
  }
  assert.equal(canonicalJson(collector.seal()), canonicalJson(manifest.rules), "Manifest must contain every owned source recipe");
  const sourceMapFiles = (await readdir(join(repository, "dist"))).filter((path) => path.endsWith(".js.map")).sort();
  assert.deepEqual(sourceMapFiles, ["index.js.map", "react.js.map"], "Package must emit exactly one external map per runtime");
  const mappedSources = new Set<string>();
  for (const path of sourceMapFiles) {
    for (const logical of verifyStylexSourceMap(
      await readFile(join(repository, "dist", path), "utf8"),
      `dist/${path}`,
      transformedSources,
      await readFile(join(repository, "dist", path.slice(0, -4)), "utf8"),
    )) mappedSources.add(logical);
  }
  assert.deepEqual([...mappedSources].sort(), [...transformedSources.keys()].sort(),
    "Published external maps must cover every transformed owned source");
  const runtimeFiles = (await readdir(join(repository, "dist"))).filter((path) => path.endsWith(".js")).sort();
  assert.deepEqual(runtimeFiles, ["index.js", "react.js"], "Manifest must inventory every emitted runtime");
  for (const path of runtimeFiles) {
    const runtime = await readFile(join(repository, "dist", path), "utf8");
    assert.ok(!/stylex\.create|stylex-inject|stylexInject|stylesheet-group|jsxDEV|jsx-dev-runtime/u.test(runtime), `Uncompiled or development runtime in ${path}`);
    const parsed = ts.createSourceFile(path, runtime, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    for (const statement of parsed.statements) {
      if (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) {
        const specifier = statement.moduleSpecifier;
        if (specifier === undefined) continue;
        assert.ok(ts.isStringLiteral(specifier));
        assert.ok(path === "react.js" && ["react", "react/jsx-runtime"].includes(specifier.text),
          `Unexpected package runtime import in ${path}: ${specifier.text}`);
      }
    }
    if (path === "index.js") assert.ok(!/react[./-](?:development|production|jsx)|__require\("react/u.test(runtime), "Root must remain framework-neutral");
  }
  console.log("SiteFooter StyleX artifacts, complete source inventory, and framework boundaries verified");
}

if (import.meta.main) await checkStylexArtifacts(resolve(process.cwd()));
