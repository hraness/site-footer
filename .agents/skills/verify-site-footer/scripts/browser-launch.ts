#!/usr/bin/env bun
import { realpathSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const CHROME_VERSION = "151.0.7922.71";

export function assertPinnedChromePath(candidate: string, resolved: string): void {
  if (candidate !== resolved || !resolved.includes(`/browsers/chrome-${CHROME_VERSION}/`) ||
    !/(?:\/Google Chrome for Testing\.app\/Contents\/MacOS\/Google Chrome for Testing|\/chrome(?:\.exe)?)$/.test(resolved)) {
    throw new Error("Browser must be the pinned Chrome for Testing executable, without symlinks or system Chrome fallback.");
  }
}

export function pinnedChromeExecutable(): string {
  const root = join(homedir(), ".agent-browser", "browsers", `chrome-${CHROME_VERSION}`);
  const candidate = process.platform === "darwin"
    ? join(root, "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing")
    : join(root, process.platform === "win32" ? "chrome.exe" : "chrome");
  const resolved = realpathSync(candidate);
  assertPinnedChromePath(candidate, resolved);
  return resolved;
}

export function mergeChromeArguments(args: readonly string[]): readonly string[] {
  const features = new Set(["PaintHolding", "MacAppCodeSignClone"]);
  for (const arg of args) if (arg.startsWith("--disable-features=")) {
    for (const feature of arg.slice("--disable-features=".length).split(",")) if (feature) features.add(feature);
  }
  return [...args.filter((arg) => !arg.startsWith("--disable-features=") && arg !== "--mute-audio"),
    "--mute-audio", `--disable-features=${[...features].join(",")}`];
}

export function browserIdentity(): Readonly<{ executable: string; version: string }> {
  const executable = pinnedChromeExecutable();
  const result = Bun.spawnSync([executable, "--version"], { stdout: "pipe", stderr: "pipe" });
  const version = result.stdout.toString().trim();
  if (result.exitCode !== 0 || version !== `Google Chrome for Testing ${CHROME_VERSION}`) {
    throw new Error(`Expected Chrome for Testing ${CHROME_VERSION}; received ${version || "no version"}.`);
  }
  return { executable, version };
}

if (import.meta.main) {
  const { executable } = browserIdentity();
  const browser = Bun.spawn([executable, ...mergeChromeArguments(process.argv.slice(2))], {
    stdin: "inherit", stdout: "inherit", stderr: "inherit",
  });
  for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => { browser.kill(signal); });
  process.exit(await browser.exited);
}
