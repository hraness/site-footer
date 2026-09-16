import { expect, test } from "bun:test";
import { transformSync, type PluginObj } from "@babel/core";
import { readFile } from "node:fs/promises";

function unicodePropertyLiterals(source: string): string[] {
  const patterns: string[] = [];
  const inspect = (): PluginObj => ({
    visitor: {
      RegExpLiteral(path) {
        const { flags, pattern } = path.node;
        if (/[uv]/u.test(flags) && /\\[pP]\{/u.test(pattern)) patterns.push(pattern);
      },
    },
  });
  transformSync(source, { configFile: false, babelrc: false, plugins: [inspect] });
  return patterns;
}

test("recognizes the Unicode literal syntax that downstream Babel must rewrite", () => {
  expect(unicodePropertyLiterals(String.raw`const unsafe = /[\p{Cc}\p{Cf}]/u;`)).toHaveLength(1);
  expect(unicodePropertyLiterals(String.raw`const unsafe = new RegExp("[\\p{Cc}\\p{Cf}]", "u");`)).toEqual([]);
});

test("both shipped entry graphs avoid downstream Unicode-property table rewrites", async () => {
  // Next 16.3.3's compiled Babel omits tables needed to rewrite these literals.
  // Runtime RegExp construction preserves the package's modern-browser semantics.
  for (const entry of ["index.js", "react.js"]) {
    const source = await readFile(new URL(`../dist/${entry}`, import.meta.url), "utf8");
    expect(source.length).toBeGreaterThan(1_000);
    expect(unicodePropertyLiterals(source)).toEqual([]);
  }
});
