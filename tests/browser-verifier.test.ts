import { describe, expect, test } from "bun:test";

import {
  parseDirectNamedLayoutContract,
  parseDirectNamedLayoutSample,
  validateDirectNamedLayout,
} from "@hraness/direct/tooling/browser-verification";

import {
  assertAgentBrowserSocketBudget,
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

  test("builds compact rules around only selected non-overlap relationships", () => {
    const contract = parseDirectNamedLayoutContract(
      createLayoutContract("compact", boxes.map(({ name }) => name)),
    );
    expect(contract.ok).toBeTrue();
    if (!contract.ok) return;

    const noOverlapIds = contract.value.rules
      .filter(({ kind }) => kind === "no-overlap")
      .map(({ id }) => id);
    expect(noOverlapIds).toEqual([
      "compact.brand-mailing.clear",
      "compact.socials-mailing.clear",
    ]);
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
