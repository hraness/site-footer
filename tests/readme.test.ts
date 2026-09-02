import { describe, expect, test } from "bun:test";
import { parseHTML } from "linkedom";

import {
  HRANESS_MAILING_SUBSCRIBE_URL,
  HRANESS_TURNSTILE_SCRIPT_URL,
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
      "one Hraness home link and 10 specifically named social links",
    );
    expect(normalizedReadme).toContain(
      "no form, Turnstile script, request, cookie, or local storage",
    );
    expect(document.querySelector("form")).toBeNull();
    expect(document.querySelector("script")).toBeNull();
    expect(document.querySelectorAll("a")).toHaveLength(11);
  });

  test("states the mailing transport and product-versus-package authority", () => {
    for (const value of [
      HRANESS_MAILING_SUBSCRIBE_URL,
      HRANESS_TURNSTILE_SCRIPT_URL,
      "`email`",
      "`audience`",
      "`source=hraness-site-footer`",
      "`cf-turnstile-response`",
      "`credentials: \"omit\"`",
      "Package-owned",
      "Consumer-owned",
      "must not fork",
      "private Turnstile secret",
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
      "do not prove a consumer's CSP, live Turnstile hostname policy, Accounts delivery, or provider retention",
    );
  });
});
