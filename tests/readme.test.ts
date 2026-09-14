import { describe, expect, test } from "bun:test";
import { parseHTML } from "linkedom";

import {
  HRANESS_MAILING_SUBSCRIBE_URL,
  renderHranessSiteFooter,
} from "../src/index.js";

const readme = await Bun.file(new URL("../README.md", import.meta.url)).text();
const normalizedReadme = readme.replace(/\s+/gu, " ");
const manifest = await Bun.file(new URL("../package.json", import.meta.url)).json() as {
  readonly exports: Readonly<Record<string, unknown>>;
  readonly packageManager: string;
  readonly peerDependencies: Readonly<Record<string, string>>;
  readonly scripts: Readonly<Record<string, string>>;
  readonly version: string;
};

function headingOffset(heading: string) {
  const offset = readme.indexOf(`## ${heading}`);
  expect(offset).toBeGreaterThan(-1);
  return offset;
}

describe("README product contract", () => {
  test("moves from first render through interfaces, authority, evidence, questions, and action", () => {
    const headings = [
      "Install and first render",
      "Choose an interface",
      "Configure one mailing-list mode",
      "Retarget owned social destinations",
      "Ownership boundary",
      "Trust and privacy boundary",
      "Compatibility and layout",
      "Content Security Policy",
      "Evidence",
      "Questions",
      "Verify a checkout",
    ];
    const offsets = headings.map(headingOffset);

    expect(offsets).toEqual([...offsets].sort((left, right) => left - right));
  });

  test("pins installation, compatibility, and every public interface to the manifest", () => {
    expect(readme).toContain(
      `bun add github:hraness/site-footer#v${manifest.version}`,
    );
    expect(normalizedReadme).toContain(
      `Bun ${manifest.packageManager.replace("bun@", "")}`,
    );
    expect(normalizedReadme).toContain(
      `React ${manifest.peerDependencies.react}`,
    );

    for (const entry of Object.keys(manifest.exports)) {
      expect(readme).toContain(`\`@hraness/site-footer${entry === "." ? "" : entry.slice(1)}\``);
    }
  });

  test("describes an observable no-network first render", () => {
    const html = renderHranessSiteFooter({ mailingList: { kind: "none" } });
    const { document } = parseHTML(html);

    expect(readme).toContain("mailingList={{ kind: \"none\" }}");
    expect(normalizedReadme).toContain(
      "one Hraness home link, four specifically named social links, and one hidden geo-gated cookie-consent note",
    );
    expect(normalizedReadme).toContain(
      "The first render issues no request, sets no cookie, and writes no local storage",
    );
    expect(document.querySelector("form")).toBeNull();
    expect(document.querySelector("script")).toBeNull();
    expect(document.querySelectorAll("a")).toHaveLength(6);
    expect(document.querySelector('[data-slot="hraness-cookie-consent"]')?.hasAttribute("hidden"))
      .toBeTrue();
  });

  test("documents the shared Hraness.com signup experiment", () => {
    expect(normalizedReadme).toContain(
      "Hraness.com uses the same shared `hraness` audience and experiment",
    );
    expect(readme).toContain("mailingList={{ kind: \"none\" }}");
    expect(readme).toContain('audience: "hraness"');
    expect(readme).not.toContain("Do not configure the Accounts `hraness` audience");
  });

  test("documents owned social overrides for AI Charts without restoring Bluesky", () => {
    expect(readme).toContain('href: "https://x.com/aichartsio"');
    expect(readme).toContain('href: "https://github.com/hraness/aicharts"');
    expect(readme).not.toContain("bsky.app");
    expect(readme).not.toContain("Hraness on Bluesky");
    expect(normalizedReadme).not.toContain("Ben Guo on LinkedIn");
    expect(normalizedReadme).toContain("Hraness on LinkedIn");
    expect(readme).toContain("https://www.linkedin.com/company/hraness");
    expect(readme).not.toContain("https://www.linkedin.com/in/hraness");
  });

  test("states the mailing transport and product-versus-package authority", () => {
    for (const value of [
      HRANESS_MAILING_SUBSCRIBE_URL,
      "`email`",
      "`audience`",
      "`source=hraness-site-footer`",
      "`website`",
      "`credentials: \"omit\"`",
      "Package-owned",
      "Consumer-owned",
      "must not fork",
      "double opt-in",
    ]) {
      expect(readme).toContain(value);
    }
  });

  test("documents only checked repository commands and explicit evidence limits", () => {
    const documentedScripts = [...readme.matchAll(/bun run ([\w:-]+)/gu)]
      .flatMap((match) => match[1] === undefined ? [] : [match[1]]);

    expect(documentedScripts.length).toBeGreaterThan(0);
    for (const script of documentedScripts) {
      expect(manifest.scripts[script]).toBeTruthy();
    }
    expect(normalizedReadme).toContain(
      "do not prove a consumer's CSP, Accounts delivery, or provider retention",
    );
  });
});
