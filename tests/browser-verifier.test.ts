import { describe, expect, test } from "bun:test";

import {
  parseDirectNamedLayoutContract,
  parseDirectNamedLayoutSample,
  validateDirectNamedLayout,
} from "@hraness/direct/tooling/browser-verification";

import {
  assertAgentBrowserSocketBudget,
  assertConsentFootprint,
  assertDisclosureSnapshot,
  assertFontCascade,
  browserConsoleErrors,
  createLayoutContract,
  isExactServerCommand,
  isRecoverableTabCloseRace,
  parseArguments,
} from "../.agents/skills/verify-site-footer/scripts/verify.js";

const boxes = [
  { height: 57, name: "footer", width: 1_280, x: 0, y: 843 },
  { height: 57, name: "inner", width: 1_280, x: 0, y: 843 },
  { height: 40, name: "brand", width: 96, x: 32, y: 851 },
  { height: 40, name: "mailing", width: 416, x: 432, y: 851 },
  { height: 40, name: "socials", width: 280, x: 968, y: 851 },
  { height: 40, name: "controls", width: 416, x: 432, y: 851 },
  { height: 40, name: "input", width: 328, x: 432, y: 851 },
  { height: 40, name: "submit", width: 88, x: 760, y: 851 },
  { height: 40, name: "social.0", width: 40, x: 968, y: 851 },
];

function parsedSample() {
  const result = parseDirectNamedLayoutSample({
    boxes,
    schema: "direct.named-layout-sample/v1",
    viewport: { height: 900, width: 1_280 },
  });
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

describe("site-footer browser verifier", () => {
  test("checks the native summary's name and expanded state independently of the submit button", () => {
    expect(() => assertDisclosureSnapshot({ snapshot: '- DisclosureTriangle "Feed the goblin , Subscribe by email" [expanded=false]' }, false, "Feed the goblin, Subscribe by email")).not.toThrow();
    expect(() => assertDisclosureSnapshot({ snapshot: '- DisclosureTriangle "Close email signup" [expanded=true]' }, true, "Close email signup")).not.toThrow();
    expect(() => assertDisclosureSnapshot({ snapshot: '- DisclosureTriangle "Feed the goblin" [expanded=true]\n- button "Close email signup"' }, true, "Close email signup")).toThrow();
    expect(() => assertDisclosureSnapshot({ snapshot: '- DisclosureTriangle "Close email signup" [expanded=false]' }, true, "Close email signup")).toThrow();
    expect(() => assertDisclosureSnapshot({ snapshot: '- DisclosureTriangle "Get email updates" [expanded=false]\n- DisclosureTriangle "Analytics preferences" [expanded=false]' }, false, "Get email updates")).not.toThrow();
    expect(() => assertDisclosureSnapshot({ snapshot: '- DisclosureTriangle "Get email updates" [expanded=false]\n- DisclosureTriangle "Get email updates" [expanded=false]' }, false, "Get email updates")).toThrow();
  });
  test("requires independent child palettes and inherited language on the real control samples", () => {
    const inherited = { language: '"TRK"', palette: "light" };
    const sample = {
      input: inherited,
      root: { language: '"TRK"', palette: "dark" },
      submit: inherited,
      supportsLanguage: true as const,
      supportsPalette: true as const,
    };
    for (const state of ["idle", "pending", "error"] as const) {
      expect(assertFontCascade(sample, state)).toEqual(sample);
      for (const control of ["input", "submit"] as const) {
        expect(() => assertFontCascade({
          ...sample, [control]: { ...inherited, palette: "dark" },
        }, state)).toThrow("explicit child palette");
        expect(() => assertFontCascade({
          ...sample, [control]: { ...inherited, language: '"SRB"' },
        }, state)).toThrow("did not inherit");
        expect(() => assertFontCascade({ ...sample, [control]: null }, state))
          .toThrow("must be an object");
      }
    }
    const accepted = { ...sample, input: null, submit: null };
    expect(assertFontCascade(accepted, "accepted")).toEqual(accepted);
    expect(() => assertFontCascade(sample, "accepted")).toThrow("retains");
    for (const support of ["supportsLanguage", "supportsPalette"] as const) {
      expect(() => assertFontCascade({ ...sample, [support]: false }, "idle"))
        .toThrow("requires");
    }
    expect(() => assertFontCascade({ ...sample, root: { ...sample.root, palette: "normal" } }, "idle"))
      .toThrow("parent canary");
    expect(() => assertFontCascade({ ...sample, extra: true }, "idle"))
      .toThrow("must contain exactly");
  });

  test("parses only the documented bounded commands", () => {
    expect(parseArguments([])).toEqual({ kind: "help" });
    expect(parseArguments(["doctor"])).toEqual({ kind: "doctor" });
    expect(parseArguments(["run"])).toEqual({ kind: "run" });
    expect(parseArguments(["cleanup", "--dry-run"])).toEqual({
      kind: "cleanup",
      mode: "dry-run",
    });
    expect(parseArguments(["cleanup", "--apply"])).toEqual({
      kind: "cleanup",
      mode: "apply",
    });
    expect(() => parseArguments(["cleanup"])).toThrow();
    expect(() => parseArguments(["run", "--base-url", "https://example.com"]))
      .toThrow();
  });

  test("builds an explicit wide Direct contract that passes two stable samples", () => {
    const contract = parseDirectNamedLayoutContract(
      createLayoutContract("wide", boxes.map(({ name }) => name)),
    );
    expect(contract.ok).toBeTrue();
    if (!contract.ok) return;

    expect(contract.value.rules.some(({ kind }) => kind === "center-y")).toBeTrue();
    expect(contract.value.rules.some(({ kind }) => kind === "minimum-size")).toBeTrue();
    expect(contract.value.rules.some(({ kind }) => kind === "stable")).toBeTrue();
    expect(validateDirectNamedLayout(contract.value, [parsedSample(), parsedSample()]))
      .toEqual({ ok: true, violations: [] });
  });

  test("builds compact stacked rules around only selected non-overlap relationships", () => {
    const contract = parseDirectNamedLayoutContract(
      createLayoutContract("compact", boxes.map(({ name }) => name)),
    );
    expect(contract.ok).toBeTrue();
    if (!contract.ok) return;

    const noOverlapIds = contract.value.rules
      .filter(({ kind }) => kind === "no-overlap")
      .map(({ id }) => id);
    expect(noOverlapIds).toEqual([
      "compact.brand-socials.clear",
      "compact.brand-mailing.clear",
      "compact.socials-mailing.clear",
    ]);
    // Stacked rows no longer share one centerline.
    expect(contract.value.rules.some(({ kind }) => kind === "center-y")).toBeFalse();
  });

  test("keeps visible status overlays clear of the footer row", () => {
    const contract = parseDirectNamedLayoutContract(
      createLayoutContract("wide", [...boxes.map(({ name }) => name), "status"]),
    );
    expect(contract.ok).toBeTrue();
    if (!contract.ok) return;

    expect(contract.value.rules).toContainEqual({
      first: "status",
      id: "wide.status-inner.clear",
      kind: "no-overlap",
      second: "inner",
      tolerance: 0,
    });
  });

  test("requires the complete interrupted-server command before cleanup", () => {
    const expected = [
      "/opt/bun",
      "/repo/server.ts",
      "--port",
      "4187",
      "--ownership-token",
      "fixture-token",
    ];
    expect(isExactServerCommand(expected.join(" "), expected)).toBeTrue();
    expect(isExactServerCommand(
      "/opt/bun /repo/server.ts --port 41870 --ownership-token fixture-token",
      expected,
    )).toBeFalse();
    expect(isExactServerCommand(
      "/opt/bun /repo/server.ts --port 4187 --ownership-token fixture-token-extra",
      expected,
    )).toBeFalse();
  });

  test("fails before launch when the browser socket path budget is unsafe", () => {
    expect(() => assertAgentBrowserSocketBudget("/private/tmp/sfv-123456/b/s", "sf-fbu-123456"))
      .not.toThrow();
    expect(() => assertAgentBrowserSocketBudget(
      "/var/folders/very-long-verifier-owned-runtime/browser/socket",
      "siteft-process-nonce",
    )).toThrow("socket path budget");
  });

  test("recognizes only the pinned driver's post-close target race", () => {
    expect(isRecoverableTabCloseRace(new Error(
      "agent-browser tab exited with 1: Failed to install browser network controls: CDP error (Target.attachToTarget): No target with given id found",
    ))).toBeTrue();
    expect(isRecoverableTabCloseRace(new Error("agent-browser tab exited with 1: denied")))
      .toBeFalse();
    expect(isRecoverableTabCloseRace(new Error(
      "agent-browser open exited with 1: Failed to install browser network controls: CDP error (Target.attachToTarget): No target with given id found",
    ))).toBeFalse();
  });

  test("fails closed on ambiguous console evidence and rejects error levels", () => {
    const error = { text: "boom", type: "error" };
    const assertion = { text: "asserted", type: "ASSERT" };
    expect(browserConsoleErrors({ messages: [
      { text: "ready", type: "log" },
      { text: "heads up", type: "warning" },
      error,
      assertion,
    ] })).toEqual([error, assertion]);
    expect(() => browserConsoleErrors({ messages: [{ text: "ambiguous" }] }))
      .toThrow("no explicit type");
    expect(() => browserConsoleErrors({ messages: "none" }))
      .toThrow("messages array");
  });
});

test("wide layout rejects a padded inline panel even when its inner form remains aligned", () => {
  const contract = parseDirectNamedLayoutContract(createLayoutContract("wide", [...boxes.map(({ name }) => name), "panel"]));
  expect(contract.ok).toBeTrue();
  if (!contract.ok) return;
  for (const padded of [false, true]) {
    const sample = parseDirectNamedLayoutSample({
      boxes: [...boxes, { name: "panel", width: 416, height: padded ? 64 : 40, x: 432, y: padded ? 839 : 851 }],
      schema: "direct.named-layout-sample/v1",
      viewport: { height: 900, width: 1_280 },
    });
    expect(sample.ok).toBeTrue();
    if (!sample.ok) return;
    expect(validateDirectNamedLayout(contract.value, [sample.value, sample.value]).ok).toBe(!padded);
  }
});

test("consent geometry requires a compact corner note that the in-flow footer clears", () => {
  // A 390x844 page scrolled to its end: 12px padding, a 28px control row, and
  // a 38px note 12px from the corner, cleared by 50px of extra bottom padding.
  const shown = { width:390, viewportHeight:844, shown:true, position:"fixed", footprint:115, height:115, top:729, bottom:844, paddingTop:62, paddingBottom:12, borderTop:1, borderBottom:0, controlTop:792, controlBottom:832, consentTop:742, consentBottom:780, consentLeft:168, consentRight:378 };
  expect(() => assertConsentFootprint(shown)).not.toThrow();
  expect(() => assertConsentFootprint({...shown, position:"static"})).toThrow("corner note");
  expect(() => assertConsentFootprint({...shown, consentLeft:0})).toThrow("never span");
  expect(() => assertConsentFootprint({...shown, consentLeft:12})).toThrow("never span");
  expect(() => assertConsentFootprint({...shown, consentLeft:160, consentRight:370})).toThrow("end corner");
  expect(() => assertConsentFootprint({...shown, paddingTop:12, footprint:65, height:65, top:779, controlTop:792, controlBottom:832})).toThrow("covers the footer controls");
  expect(() => assertConsentFootprint({...shown, paddingTop:70, footprint:123, height:123, top:721, controlTop:792, controlBottom:832})).toThrow("padding clearances");
  expect(() => assertConsentFootprint({...shown, footprint:160})).toThrow("footprint");
  expect(() => assertConsentFootprint({...shown, bottom:800, top:685})).toThrow("end of the page");
  const accepted = {...shown, shown:false, footprint:65, height:65, top:779, paddingTop:12, controlTop:792, controlBottom:832, consentTop:0, consentBottom:0, consentLeft:0, consentRight:0};
  expect(() => assertConsentFootprint(accepted)).not.toThrow();
  expect(() => assertConsentFootprint({...accepted, paddingTop:62, footprint:115, height:115, top:729, controlTop:792, controlBottom:832})).toThrow("padding clearances");
  const wide = {...shown, width:1280, consentLeft:1058, consentRight:1268};
  expect(() => assertConsentFootprint(wide)).not.toThrow();
});


import { assertPinnedChromePath, CHROME_VERSION, mergeChromeArguments } from "../.agents/skills/verify-site-footer/scripts/browser-launch.js";

test("browser selection rejects system Chrome, symlinks, and other versions", () => {
  const pinned = `/home/runner/.agent-browser/browsers/chrome-${CHROME_VERSION}/chrome`;
  expect(() => assertPinnedChromePath(pinned, pinned)).not.toThrow();
  for (const path of ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/tmp/chrome", pinned.replace(CHROME_VERSION, "1.2.3.4")]) {
    expect(() => assertPinnedChromePath(path, path)).toThrow();
    expect(() => assertPinnedChromePath(pinned, path)).toThrow();
  }
});

test("browser flags preserve driver features in one muted launch switch", () => {
  const args = mergeChromeArguments(["--headless=new", "--disable-features=Translate", "--disable-features=PaintHolding,Other", "--mute-audio"]);
  expect(args.filter((arg) => arg.startsWith("--disable-features="))).toEqual(["--disable-features=PaintHolding,MacAppCodeSignClone,Translate,Other"]);
  expect(args.filter((arg) => arg === "--mute-audio")).toHaveLength(1);
  expect(args).toContain("--headless=new");
});
