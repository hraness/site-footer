import { createHash, randomUUID } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readlinkSync,
} from "node:fs";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, readStylexPackageManifest } from "@hraness/ui/stylex-build";
import { packageStylexTransform } from "../../../../scripts/stylex-transform.js";

import {
  DIRECT_NAMED_LAYOUT_CONTRACT_SCHEMA,
  DIRECT_NAMED_LAYOUT_SAMPLE_SCHEMA,
  acquireVerificationServer,
  agentBrowserProcessTimeoutMs,
  boundedAgentBrowserSessionName,
  createArtifactRun,
  isolatedAgentBrowserEnvironment,
  parseAgentBrowserEnvelope,
  parseDirectNamedLayoutContract,
  parseDirectNamedLayoutSample,
  renderUnknown,
  spawnVerificationServer,
  stopVerificationServer,
  tail,
  validateDirectNamedLayout,
  writeJsonAtomically,
  type DirectNamedLayoutSample,
  type ManagedVerificationServer,
  type ServerLease,
} from "@hraness/direct/tooling/browser-verification";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = resolve(SCRIPT_DIRECTORY, "../../../..");
const FIXTURE_ENTRY = join(SCRIPT_DIRECTORY, "fixture.tsx");
const SERVER_ENTRY = join(SCRIPT_DIRECTORY, "server.ts");
const ACTIVE_DIRECTORY = join(REPOSITORY_ROOT, ".tmp/site-footer-verifier");
const ACTIVE_RECORD_PATH = join(ACTIVE_DIRECTORY, "active-run.json");
const ARTIFACT_ROOT = join(
  REPOSITORY_ROOT,
  "artifacts/site-footer/browser-verification",
);
const DEFAULT_BASE_URL = "http://127.0.0.1:4187";
const RUNTIME_ROOT = process.platform === "darwin" ? "/private/tmp" : tmpdir();
const BROWSER_VERSION = "0.32.3";
const DIRECT_VERSION = "0.7.18";
const TEST_EMAIL = "footer-fixture@example.test";
const SCREENSHOT_MINIMUM_BYTES = 5_000;
const BROWSER_TIMEOUT_MS = 25_000;
const AGENT_BROWSER_SOCKET_PATH_MAX_BYTES = 103;
const ALLOWED_DOMAINS = ["127.0.0.1"] as const;

const fixtureStates = [
  "idle",
  "pending",
  "accepted",
  "error",
] as const;
type FixtureState = typeof fixtureStates[number];
type ViewportKind = "compact" | "wide";

export type VerifierArguments =
  | Readonly<{ kind: "cleanup"; mode: "apply" | "dry-run" }>
  | Readonly<{ kind: "doctor" }>
  | Readonly<{ kind: "help" }>
  | Readonly<{ kind: "run" }>;

interface BrowserDriver {
  readonly close: (allowMissing?: boolean) => Promise<void>;
  readonly evaluate: (expression: string) => Promise<unknown>;
  readonly run: (arguments_: readonly string[]) => Promise<unknown>;
  readonly session: string;
}

interface ActiveRunRecord {
  readonly browser: Readonly<{
    readonly configPath: string;
    readonly session: string;
    readonly socketDirectory: string;
  }>;
  readonly ownershipToken: string;
  readonly repositoryRoot: string;
  readonly runtimeDirectory: string;
  readonly schema: "hraness.site-footer.active-verifier/v1";
  readonly serverCommand: readonly string[];
  readonly serverPidFile: string;
}

interface FixtureSnapshot {
  readonly domState: string;
  readonly errors: readonly string[];
  readonly expectedEmail: string;
  readonly requests: readonly Readonly<{
    audience: string | null;
    credentials: string | null;
    email: string | null;
    honeypot: string | null;
    method: string | null;
    source: string | null;
    url: string;
  }>[];
  readonly schema: "hraness.site-footer.browser-fixture/v1";
  readonly selectedState: FixtureState;
}

interface ManualGeometry {
  readonly bodyScrollWidth: number;
  readonly controlsHeight: number | null;
  readonly documentScrollWidth: number;
  readonly footerHeight: number;
  readonly footerPosition: string;
  readonly footerTop: number;
  readonly formHeight: number | null;
  readonly innerHeight: number;
  readonly innerPosition: string;
  readonly innerTop: number;
  readonly inputHeight: number | null;
  readonly mailingHeight: number;
  readonly statusOpacity: number | null;
  readonly statusPosition: string | null;
  readonly statusVisibility: string | null;
  readonly submitHeight: number | null;
  readonly viewportWidth: number;
  readonly visibleSocialTargets: readonly Readonly<{
    height: number;
    width: number;
  }>[];
}

interface FooterSpacing {
  readonly bottomClearance: number;
  readonly bottomPadding: number;
  readonly expectedHeight: number;
  readonly innerHeight: number;
  readonly safeAreaInset: number;
  readonly topClearance: number;
  readonly topPadding: number;
}

interface FontCascadeValues {
  readonly language: string;
  readonly palette: string;
}

interface FontCascadeEvidence {
  readonly input: FontCascadeValues | null;
  readonly root: FontCascadeValues;
  readonly submit: FontCascadeValues | null;
  readonly supportsLanguage: true;
  readonly supportsPalette: true;
}

interface ViewportEvidence {
  readonly fontCascade: FontCascadeEvidence;
  readonly geometry: ManualGeometry;
  readonly spacing: FooterSpacing;
  readonly layout: Readonly<{
    samples: readonly unknown[];
    ok: boolean;
    ruleCount: number;
    violations: readonly unknown[];
  }>;
  readonly screenshot: string;
  readonly viewport: Readonly<{ height: number; width: number }>;
}

interface ScenarioEvidence {
  readonly additionalWidths: readonly ViewportEvidence[];
  readonly browserConsole: unknown;
  readonly browserErrors: unknown;
  readonly closeAttempt: unknown;
  readonly compact: ViewportEvidence;
  readonly context: unknown;
  readonly fixture: FixtureSnapshot;
  readonly postCloseInventory: unknown;
  readonly preCloseInventory: unknown;
  readonly returnToBootstrap: unknown;
  readonly state: FixtureState;
  readonly wide: ViewportEvidence;
}

interface SourceIdentity {
  readonly contentSha256: string;
  readonly dirty: boolean;
  readonly headSha: string;
}

function usage(): string {
  return [
    "Usage: bun run ./.agents/skills/verify-site-footer/scripts/verify.ts <command>",
    "",
    "Commands:",
    "  doctor                 Read-only readiness and ownership checks",
    "  run                    Build, drive, capture, validate, and clean up",
    "  cleanup --dry-run      Inspect one interrupted verifier-owned run",
    "  cleanup --apply        Clean only the validated recorded run",
  ].join("\n");
}

export function parseArguments(arguments_: readonly string[]): VerifierArguments {
  if (arguments_.length === 0 || arguments_[0] === "--help" || arguments_[0] === "-h") {
    return { kind: "help" };
  }
  if (arguments_.length === 1 && arguments_[0] === "doctor") return { kind: "doctor" };
  if (arguments_.length === 1 && arguments_[0] === "run") return { kind: "run" };
  if (arguments_[0] === "cleanup" && arguments_.length === 2) {
    if (arguments_[1] === "--dry-run") return { kind: "cleanup", mode: "dry-run" };
    if (arguments_[1] === "--apply") return { kind: "cleanup", mode: "apply" };
  }
  throw new Error(`Invalid site-footer verifier arguments.\n\n${usage()}`);
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactRecord(
  value: unknown,
  keys: readonly string[],
  label: string,
): Readonly<Record<string, unknown>> {
  if (!isRecord(value)) throw new Error(`${label} must be an object.`);
  const found = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (JSON.stringify(found) !== JSON.stringify(expected)) {
    throw new Error(`${label} must contain exactly: ${expected.join(", ")}.`);
  }
  return value;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 4_096) {
    throw new Error(`${label} must be a bounded nonempty string.`);
  }
  return value;
}

function nullableString(value: unknown, label: string): string | null {
  return value === null ? null : requiredString(value, label);
}

function finiteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be finite.`);
  }
  return value;
}

function nonnegativeInteger(value: unknown, label: string): number {
  const found = finiteNumber(value, label);
  if (!Number.isInteger(found) || found < 0) throw new Error(`${label} must be nonnegative.`);
  return found;
}

function fixtureState(value: unknown, label: string): FixtureState {
  if (typeof value === "string" && (fixtureStates as readonly string[]).includes(value)) {
    return value as FixtureState;
  }
  throw new Error(`${label} is not a known fixture state.`);
}

function isWithin(parent: string, child: string): boolean {
  const path = relative(resolve(parent), resolve(child));
  return path !== ""
    && path !== ".."
    && !path.startsWith(`..${sep}`)
    && !isAbsolute(path);
}

function fixtureServerCommand(options: {
  readonly ownershipToken: string;
  readonly runtimeDirectory: string;
  readonly serverPidFile: string;
}): readonly string[] {
  return Object.freeze([
    process.execPath,
    SERVER_ENTRY,
    "--host",
    "127.0.0.1",
    "--ownership-token",
    options.ownershipToken,
    "--pid-file",
    options.serverPidFile,
    "--port",
    "4187",
    "--root",
    join(options.runtimeDirectory, "bundle"),
  ]);
}

export function isExactServerCommand(
  liveCommand: string,
  expectedArguments: readonly string[],
): boolean {
  return liveCommand === expectedArguments.join(" ");
}

export function assertAgentBrowserSocketBudget(
  socketDirectory: string,
  session: string,
): void {
  const conservativeBytes = Buffer.byteLength(socketDirectory)
    + (2 * Buffer.byteLength(session))
    + 32;
  if (conservativeBytes > AGENT_BROWSER_SOCKET_PATH_MAX_BYTES) {
    throw new Error(
      `The verifier browser socket path budget is ${String(conservativeBytes)} bytes; maximum ${String(AGENT_BROWSER_SOCKET_PATH_MAX_BYTES)}.`,
    );
  }
}

export function createLayoutContract(
  viewport: ViewportKind,
  boxNames: readonly string[],
): unknown {
  const names = new Set(boxNames);
  const rules: Array<Record<string, unknown>> = [];
  const add = (rule: Record<string, unknown>) => rules.push(rule);
  for (const name of boxNames) {
    add({
      box: name,
      id: `${viewport}.${name}.visible`,
      kind: "not-clipped",
      tolerance: 0.5,
    });
    add({
      box: name,
      id: `${viewport}.${name}.stable`,
      kind: "stable",
      tolerance: 0.25,
    });
  }
  for (const name of ["brand", "mailing", "support", "socials", ...(viewport === "wide" ? ["panel", "attribution"] : [])]) {
    if (names.has(name)) {
      add({
        id: `${viewport}.${name}.inside`,
        inner: name,
        kind: "inside",
        outer: "inner",
        tolerance: 0.5,
      });
    }
  }
  if (names.has("status")) {
    add({
      first: "status",
      id: `${viewport}.status-inner.clear`,
      kind: "no-overlap",
      second: "inner",
      tolerance: 0,
    });
  }
  if (viewport === "wide" && names.has("controls")) {
    add({
      id: `${viewport}.controls.inside`,
      inner: "controls",
      kind: "inside",
      outer: "mailing",
      tolerance: 0.5,
    });
  }
  for (const name of ["input", "submit"] as const) {
    if (names.has(name)) {
      add({
        id: `${viewport}.${name}.inside`,
        inner: name,
        kind: "inside",
        outer: "controls",
        tolerance: 0.5,
      });
      add({
        box: name,
        id: `${viewport}.${name}.minimum`,
        kind: "minimum-size",
        minimumHeight: 28,
        minimumWidth: name === "submit" ? 72 : 80,
      });
    }
  }
  add({
    box: "brand",
    id: `${viewport}.brand.minimum`,
    kind: "minimum-size",
    minimumHeight: 28,
    minimumWidth: 28,
  });
  add({
    box: "mailing",
    id: `${viewport}.mailing.minimum`,
    kind: "minimum-size",
    minimumHeight: 28,
    minimumWidth: 80,
  });
  if (names.has("support")) {
    add({ box: "support", id: `${viewport}.support.minimum`, kind: "minimum-size", minimumHeight: 28, minimumWidth: 44 });
    for (const second of ["brand", "mailing", "socials"]) add({
      first: "support", second, id: `${viewport}.support-${second}.clear`, kind: "no-overlap", tolerance: 0,
    });
  }
  for (const name of boxNames.filter((name) => name.startsWith("social."))) {
    add({
      box: name,
      id: `${viewport}.${name}.minimum`,
      kind: "minimum-size",
      minimumHeight: 28,
      minimumWidth: 28,
    });
    add({
      id: `${viewport}.${name}.inside`,
      inner: name,
      kind: "inside",
      outer: "inner",
      tolerance: 0.5,
    });
  }
  if (viewport === "wide") {
    add({
      first: "brand",
      id: "wide.brand-mailing.center-y",
      kind: "center-y",
      second: "mailing",
      tolerance: 1,
    });
    add({
      first: "brand",
      id: "wide.brand-socials.center-y",
      kind: "center-y",
      second: "socials",
      tolerance: 1,
    });
    if (names.has("input") && names.has("submit")) {
      add({
        first: "input",
        id: "wide.input-submit.center-y",
        kind: "center-y",
        second: "submit",
        tolerance: 0.5,
      });
    }
    if (names.has("attribution")) {
      // The revealed attribution shares the control row and never touches a
      // control: it fills only the width the other columns leave behind.
      add({ box: "attribution", id: "wide.attribution.minimum", kind: "minimum-size", minimumHeight: 28, minimumWidth: 100 });
      add({ first: "brand", id: "wide.brand-attribution.center-y", kind: "center-y", second: "attribution", tolerance: 1 });
      for (const second of ["brand", "mailing", "support", "socials"]) {
        if (names.has(second)) add({ first: "attribution", id: `wide.attribution-${second}.clear`, kind: "no-overlap", second, tolerance: 0 });
      }
    }
  } else {
    for (const second of ["mailing", "socials"]) add({
      first: "brand", id: `compact.brand-${second}.center-y`, kind: "center-y", second, tolerance: 1,
    });
    add({
      first: "brand",
      id: "compact.brand-mailing.clear",
      kind: "no-overlap",
      second: "mailing",
      tolerance: 0,
    });
    add({
      first: "socials",
      id: "compact.socials-mailing.clear",
      kind: "no-overlap",
      second: "mailing",
      tolerance: 0,
    });
  }
  return {
    rules,
    schema: DIRECT_NAMED_LAYOUT_CONTRACT_SCHEMA,
  };
}

function parseFixtureSnapshot(input: unknown, expectedState: FixtureState): FixtureSnapshot {
  const record = exactRecord(input, [
    "domState",
    "errors",
    "expectedEmail",
    "requests",
    "schema",
    "selectedState",
  ], "Footer fixture snapshot");
  if (record.schema !== "hraness.site-footer.browser-fixture/v1") {
    throw new Error("The footer fixture snapshot schema changed.");
  }
  const selectedState = fixtureState(record.selectedState, "Footer fixture selected state");
  if (selectedState !== expectedState) throw new Error("The fixture selected the wrong state.");
  if (!Array.isArray(record.errors) || !record.errors.every((error) => typeof error === "string")) {
    throw new Error("Footer fixture errors are invalid.");
  }
  if (!Array.isArray(record.requests)) throw new Error("Footer fixture requests are invalid.");
  const requests = record.requests.map((request, index) => {
    const found = exactRecord(request, [
      "audience",
      "credentials",
      "email",
      "honeypot",
      "method",
      "source",
      "url",
    ], `Footer fixture request ${String(index)}`);
    return Object.freeze({
      audience: nullableString(found.audience, "Request audience"),
      credentials: nullableString(found.credentials ?? null, "Request credentials"),
      email: nullableString(found.email, "Request email"),
      honeypot: found.honeypot === null || found.honeypot === ""
        ? found.honeypot
        : requiredString(found.honeypot, "Request honeypot"),
      method: nullableString(found.method ?? null, "Request method"),
      source: nullableString(found.source, "Request source"),
      url: requiredString(found.url, "Request URL"),
    });
  });
  return Object.freeze({
    domState: requiredString(record.domState, "Footer DOM state"),
    errors: Object.freeze([...record.errors] as string[]),
    expectedEmail: requiredString(record.expectedEmail, "Fixture expected email"),
    requests: Object.freeze(requests),
    schema: "hraness.site-footer.browser-fixture/v1",
    selectedState,
  });
}

function parseManualGeometry(input: unknown): ManualGeometry {
  const record = exactRecord(input, [
    "bodyScrollWidth",
    "controlsHeight",
    "documentScrollWidth",
    "footerHeight",
    "footerPosition",
    "footerTop",
    "formHeight",
    "innerHeight",
    "innerPosition",
    "innerTop",
    "inputHeight",
    "mailingHeight",
    "statusOpacity",
    "statusPosition",
    "statusVisibility",
    "submitHeight",
    "viewportWidth",
    "visibleSocialTargets",
  ], "Footer manual geometry");
  const optionalNumber = (value: unknown, label: string): number | null =>
    value === null ? null : finiteNumber(value, label);
  if (!Array.isArray(record.visibleSocialTargets)) {
    throw new Error("Visible social target geometry must be an array.");
  }
  const visibleSocialTargets = record.visibleSocialTargets.map((target, index) => {
    const found = exactRecord(target, ["height", "width"], `Social target ${String(index)}`);
    return Object.freeze({
      height: finiteNumber(found.height, "Social target height"),
      width: finiteNumber(found.width, "Social target width"),
    });
  });
  return Object.freeze({
    bodyScrollWidth: finiteNumber(record.bodyScrollWidth, "Body scroll width"),
    controlsHeight: optionalNumber(record.controlsHeight, "Controls height"),
    documentScrollWidth: finiteNumber(record.documentScrollWidth, "Document scroll width"),
    footerHeight: finiteNumber(record.footerHeight, "Footer height"),
    footerPosition: requiredString(record.footerPosition, "Footer position"),
    footerTop: finiteNumber(record.footerTop, "Footer top"),
    formHeight: optionalNumber(record.formHeight, "Form height"),
    innerHeight: finiteNumber(record.innerHeight, "Inner height"),
    innerPosition: requiredString(record.innerPosition, "Inner position"),
    innerTop: finiteNumber(record.innerTop, "Inner top"),
    inputHeight: optionalNumber(record.inputHeight, "Input height"),
    mailingHeight: finiteNumber(record.mailingHeight, "Mailing height"),
    statusOpacity: optionalNumber(record.statusOpacity, "Status opacity"),
    statusPosition: record.statusPosition === null
      ? null
      : requiredString(record.statusPosition, "Status position"),
    statusVisibility: record.statusVisibility === null
      ? null
      : requiredString(record.statusVisibility, "Status visibility"),
    submitHeight: optionalNumber(record.submitHeight, "Submit height"),
    viewportWidth: finiteNumber(record.viewportWidth, "Viewport width"),
    visibleSocialTargets: Object.freeze(visibleSocialTargets),
  });
}

export function assertFontCascade(input: unknown, state: FixtureState): FontCascadeEvidence {
  const record = exactRecord(input, [
    "input", "root", "submit", "supportsLanguage", "supportsPalette",
  ], "Footer font cascade");
  if (record.supportsLanguage !== true || record.supportsPalette !== true) {
    throw new Error("Footer font cascade requires font-language-override and font-palette support.");
  }
  const values = (value: unknown, label: string): FontCascadeValues => {
    const found = exactRecord(value, ["language", "palette"], label);
    return Object.freeze({
      language: requiredString(found.language, `${label} language`),
      palette: requiredString(found.palette, `${label} palette`),
    });
  };
  const root = values(record.root, "Footer font root");
  if (root.language !== '"TRK"' || root.palette !== "dark") {
    throw new Error("Footer font cascade parent canary is missing or overridden.");
  }
  const control = (value: unknown, label: string): FontCascadeValues | null => {
    if (state === "accepted") {
      if (value !== null) throw new Error(`Accepted footer retains its ${label} font sample.`);
      return null;
    }
    const found = values(value, `Footer ${label} font`);
    if (found.palette !== "light") {
      throw new Error(`Footer ${label} font-palette did not preserve the explicit child palette: ${found.palette}.`);
    }
    if (found.language !== root.language) {
      throw new Error(`Footer ${label} font-language-override did not inherit: ${found.language}.`);
    }
    return found;
  };
  return Object.freeze({
    input: control(record.input, "input"),
    root,
    submit: control(record.submit, "submit"),
    supportsLanguage: true,
    supportsPalette: true,
  });
}

function sourceIdentity(): SourceIdentity {
  const run = (arguments_: readonly string[]): Uint8Array => {
    const result = Bun.spawnSync(["git", ...arguments_], {
      cwd: REPOSITORY_ROOT,
      stderr: "pipe",
      stdout: "pipe",
    });
    if (result.exitCode !== 0) {
      throw new Error(`Git source identity failed: ${result.stderr.toString().trim()}`);
    }
    return result.stdout;
  };
  const status = run(["status", "--porcelain=v1", "-z", "--untracked-files=all"]);
  const headSha = Buffer.from(run(["rev-parse", "HEAD"])).toString().trim();
  const diff = run(["diff", "--binary", "--no-ext-diff", "HEAD", "--", "."]);
  const untracked = Buffer.from(
    run(["ls-files", "--others", "--exclude-standard", "-z"]),
  ).toString().split("\0").filter((path) => path.length > 0).sort();
  const hash = createHash("sha256");
  const update = (label: string, value: string | Uint8Array): void => {
    const bytes = typeof value === "string" ? Buffer.from(value) : value;
    hash.update(`${label.length}:${label}:${bytes.byteLength}:`);
    hash.update(bytes);
  };
  update("git-status", status);
  update("git-diff-head", diff);
  for (const path of [
    "src/footer.stylex.ts", "scripts/build.ts", "scripts/stylex-transform.ts",
    "styles.css", "compiler-foundation.css", "dist/stylex.css", "dist/stylex-manifest.json",
    "package.json", "bun.lock",
  ]) {
    update(`compiler-input:${path}`, readFileSync(join(REPOSITORY_ROOT, path)));
  }
  for (const path of untracked) {
    const absolute = resolve(REPOSITORY_ROOT, path);
    if (!isWithin(REPOSITORY_ROOT, absolute)) {
      throw new Error(`Untracked source path escapes the repository: ${path}`);
    }
    const metadata = lstatSync(absolute);
    update("untracked-path", path);
    update("untracked-mode", String(metadata.mode));
    if (metadata.isSymbolicLink()) update("untracked-symlink", readlinkSync(absolute));
    else if (metadata.isFile()) update("untracked-file", readFileSync(absolute));
    else throw new Error(`Untracked source path is not a regular file or symlink: ${path}`);
  }
  return Object.freeze({
    contentSha256: hash.digest("hex"),
    dirty: status.byteLength > 0,
    headSha,
  });
}

function sameSourceIdentity(first: SourceIdentity, second: SourceIdentity): boolean {
  return first.headSha === second.headSha
    && first.dirty === second.dirty
    && first.contentSha256 === second.contentSha256;
}

function assertSameSourceIdentity(first: SourceIdentity, second: SourceIdentity): void {
  if (!sameSourceIdentity(first, second)) {
    throw new Error("Repository source content changed during browser verification.");
  }
}

async function packageVersion(path: string): Promise<string> {
  const parsed = JSON.parse(await readFile(path, "utf8")) as unknown;
  const record = isRecord(parsed) ? parsed : null;
  return requiredString(record?.version, `Package version at ${path}`);
}

async function manifestDependency(name: string): Promise<string> {
  const parsed = JSON.parse(await readFile(join(REPOSITORY_ROOT, "package.json"), "utf8")) as unknown;
  if (!isRecord(parsed)) throw new Error("The site-footer package manifest is invalid.");
  const record = parsed;
  const dependencies = isRecord(record.devDependencies) ? record.devDependencies : null;
  return requiredString(dependencies?.[name], `Development dependency ${name}`);
}

async function portIsOccupied(): Promise<boolean> {
  try {
    const response = await fetch(`${DEFAULT_BASE_URL}/health`, {
      signal: AbortSignal.timeout(400),
    });
    await response.body?.cancel();
    return true;
  } catch {
    return false;
  }
}

async function doctor(): Promise<Readonly<Record<string, unknown>>> {
  const packageManager = `bun@${Bun.version}`;
  if (packageManager !== "bun@1.3.14") {
    throw new Error(`Expected Bun 1.3.14, received ${packageManager}.`);
  }
  if (existsSync(ACTIVE_RECORD_PATH)) {
    throw new Error(`An active verifier record exists at ${ACTIVE_RECORD_PATH}. Run cleanup --dry-run.`);
  }
  if (await portIsOccupied()) {
    throw new Error(`${DEFAULT_BASE_URL} is already reachable; verifier ownership is ambiguous.`);
  }
  const directSpecifier = await manifestDependency("@hraness/direct");
  const browserSpecifier = await manifestDependency("agent-browser");
  const directInstalled = await packageVersion(
    join(REPOSITORY_ROOT, "node_modules/@hraness/direct/package.json"),
  );
  const browserInstalled = await packageVersion(
    join(REPOSITORY_ROOT, "node_modules/agent-browser/package.json"),
  );
  if (directSpecifier !== DIRECT_VERSION || directInstalled !== DIRECT_VERSION) {
    throw new Error(`Direct must be pinned and installed at ${DIRECT_VERSION}.`);
  }
  if (browserSpecifier !== BROWSER_VERSION || browserInstalled !== BROWSER_VERSION) {
    throw new Error(`agent-browser must be pinned and installed at ${BROWSER_VERSION}.`);
  }
  for (const path of [FIXTURE_ENTRY, SERVER_ENTRY, ...[
    "src/react.tsx", "src/footer.stylex.ts", "scripts/stylex-transform.ts",
    "dist/stylex.css", "dist/stylex-manifest.json", "compiler-foundation.css",
  ].map((file) => join(REPOSITORY_ROOT, file))]) {
    if (!existsSync(path)) throw new Error(`Required verifier source is missing: ${path}`);
  }
  await mkdir(ARTIFACT_ROOT, { recursive: true });
  await writeFile(join(ARTIFACT_ROOT, ".write-probe"), "", { mode: 0o600 });
  await rm(join(ARTIFACT_ROOT, ".write-probe"), { force: true });
  return Object.freeze({
    agentBrowser: browserInstalled,
    baseUrl: DEFAULT_BASE_URL,
    bun: Bun.version,
    direct: directInstalled,
    evidenceRoot: relative(REPOSITORY_ROOT, ARTIFACT_ROOT),
    source: sourceIdentity(),
    status: "ready",
  });
}

async function buildFixture(runtimeDirectory: string): Promise<string> {
  const bundleDirectory = join(runtimeDirectory, "bundle");
  await mkdir(bundleDirectory, { recursive: true });
  const manifest = await readStylexPackageManifest(
    join(REPOSITORY_ROOT, "dist/stylex-manifest.json"), REPOSITORY_ROOT,
  );
  const { collector, plugin } = packageStylexTransform(REPOSITORY_ROOT);
  const result = await Bun.build({
    entrypoints: [FIXTURE_ENTRY],
    format: "esm",
    minify: false,
    outdir: bundleDirectory,
    plugins: [plugin],
    sourcemap: "external",
    target: "browser",
  });
  if (!result.success) {
    throw new Error(
      `Footer fixture build failed: ${result.logs.map((log) => log.message).join("; ")}`,
    );
  }
  const checkedRules = new Set(manifest.rules.map((rule) => canonicalJson(rule)));
  const fixtureRules = collector.seal();
  if (fixtureRules.length === 0 || fixtureRules.some((rule) => !checkedRules.has(canonicalJson(rule)))) {
    throw new Error("Real-source fixture recipes differ from checked package CSS; run the checked build.");
  }
  for (const file of ["fixture.js", "fixture.css"]) {
    if (!existsSync(join(bundleDirectory, file))) {
      throw new Error(`Footer fixture build omitted ${file}.`);
    }
  }
  return bundleDirectory;
}

function sanitizedBrowserEnvironment(options: {
  readonly configPath: string;
  readonly session: string;
  readonly socketDirectory: string;
}): Record<string, string | undefined> {
  const inherited = { ...process.env };
  for (const name of [
    "ALL_PROXY",
    "HTTPS_PROXY",
    "HTTP_PROXY",
    "NO_PROXY",
    "all_proxy",
    "https_proxy",
    "http_proxy",
    "no_proxy",
  ]) {
    Reflect.deleteProperty(inherited, name);
  }
  return {
    ...isolatedAgentBrowserEnvironment({
      configPath: options.configPath,
      defaultTimeoutMs: BROWSER_TIMEOUT_MS,
      idleTimeoutMs: 60_000,
      inheritedEnvironment: inherited,
      session: options.session,
    }),
    AGENT_BROWSER_ALLOWED_DOMAINS: ALLOWED_DOMAINS.join(","),
    AGENT_BROWSER_ENGINE: "chrome",
    AGENT_BROWSER_SOCKET_DIR: options.socketDirectory,
    ALL_PROXY: undefined,
    HTTPS_PROXY: undefined,
    HTTP_PROXY: undefined,
    NO_PROXY: "127.0.0.1,localhost",
    all_proxy: undefined,
    http_proxy: undefined,
    https_proxy: undefined,
  };
}

function createBrowserDriver(options: {
  readonly configPath: string;
  readonly session: string;
  readonly socketDirectory: string;
}): BrowserDriver {
  const binary = join(REPOSITORY_ROOT, "node_modules/.bin/agent-browser");
  const environment = sanitizedBrowserEnvironment(options);
  let used = false;
  const run = async (arguments_: readonly string[]): Promise<unknown> => {
    used = true;
    const command = Bun.spawn([process.execPath, binary, "--json", ...arguments_], {
      cwd: REPOSITORY_ROOT,
      env: environment,
      stdin: "ignore",
      stderr: "pipe",
      stdout: "pipe",
    });
    const timeoutMs = agentBrowserProcessTimeoutMs(arguments_, BROWSER_TIMEOUT_MS);
    let timedOut = false;
    let forceKillTimer: ReturnType<typeof setTimeout> | undefined;
    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      command.kill();
      forceKillTimer = setTimeout(() => command.kill(9), 1_000);
    }, timeoutMs);
    let stdout: string;
    let stderr: string;
    let exitCode: number;
    try {
      [stdout, stderr, exitCode] = await Promise.all([
        new Response(command.stdout).text(),
        new Response(command.stderr).text(),
        command.exited,
      ]);
    } finally {
      clearTimeout(timeoutTimer);
      if (forceKillTimer !== undefined) clearTimeout(forceKillTimer);
    }
    if (timedOut) {
      throw new Error(`agent-browser ${arguments_[0] ?? "command"} exceeded ${String(timeoutMs)}ms.`);
    }
    if (exitCode !== 0) {
      throw new Error(
        `agent-browser ${arguments_[0] ?? "command"} exited with ${String(exitCode)}: ${tail(stderr.trim() || stdout.trim())}`,
      );
    }
    return parseAgentBrowserEnvelope(stdout);
  };
  const evaluate = async (expression: string): Promise<unknown> => {
    const data = await run(["eval", expression]);
    const record = isRecord(data) ? data : null;
    if (record === null || !Object.hasOwn(record, "result")) {
      throw new Error("Browser evaluation returned an invalid envelope.");
    }
    return record.result;
  };
  const close = async (allowMissing = false): Promise<void> => {
    if (!used) return;
    try {
      await run(["close"]);
    } catch (error) {
      const rendered = renderUnknown(error);
      const conclusivelyAbsent = rendered.includes("No such file or directory")
        || (rendered.includes("Socket path would be") && rendered.includes("max 103"));
      if (!allowMissing || !conclusivelyAbsent) throw error;
    } finally {
      used = false;
    }
  };
  return { close, evaluate, run, session: options.session };
}

function activeRunRecord(input: unknown): ActiveRunRecord {
  const record = exactRecord(input, [
    "browser",
    "ownershipToken",
    "repositoryRoot",
    "runtimeDirectory",
    "schema",
    "serverCommand",
    "serverPidFile",
  ], "Active verifier record");
  if (record.schema !== "hraness.site-footer.active-verifier/v1") {
    throw new Error("The active verifier record schema is unsupported.");
  }
  const browser = exactRecord(record.browser, [
    "configPath",
    "session",
    "socketDirectory",
  ], "Active verifier browser record");
  if (
    !Array.isArray(record.serverCommand)
    || record.serverCommand.length === 0
    || !record.serverCommand.every((part) => typeof part === "string" && part.length > 0)
  ) {
    throw new Error("The active verifier server command is invalid.");
  }
  const found: ActiveRunRecord = Object.freeze({
    browser: Object.freeze({
      configPath: requiredString(browser.configPath, "Browser config path"),
      session: requiredString(browser.session, "Browser session"),
      socketDirectory: requiredString(browser.socketDirectory, "Browser socket directory"),
    }),
    ownershipToken: requiredString(record.ownershipToken, "Ownership token"),
    repositoryRoot: requiredString(record.repositoryRoot, "Repository root"),
    runtimeDirectory: requiredString(record.runtimeDirectory, "Runtime directory"),
    schema: "hraness.site-footer.active-verifier/v1",
    serverCommand: Object.freeze([...record.serverCommand] as string[]),
    serverPidFile: requiredString(record.serverPidFile, "Server PID file"),
  });
  if (found.repositoryRoot !== REPOSITORY_ROOT) {
    throw new Error("The active verifier record belongs to another repository.");
  }
  if (!/^(?:sf|siteft)-[a-z0-9-]{3,24}$/u.test(found.browser.session)) {
    throw new Error("The active verifier browser session is not verifier-owned.");
  }
  const currentRuntime = isWithin(RUNTIME_ROOT, found.runtimeDirectory)
    && basename(found.runtimeDirectory).startsWith("sfv-");
  const legacyRuntime = isWithin(tmpdir(), found.runtimeDirectory)
    && basename(found.runtimeDirectory).startsWith("site-footer-verifier-");
  if (!currentRuntime && !legacyRuntime) {
    throw new Error("The active verifier runtime is outside the task temporary root.");
  }
  for (const path of [
    found.browser.configPath,
    found.browser.socketDirectory,
    found.serverPidFile,
  ]) {
    if (!isWithin(found.runtimeDirectory, path)) {
      throw new Error("The active verifier contains a path outside its runtime directory.");
    }
  }
  const expectedServerCommand = fixtureServerCommand(found);
  if (JSON.stringify(found.serverCommand) !== JSON.stringify(expectedServerCommand)) {
    throw new Error("The active verifier server command is not canonical for this run.");
  }
  return found;
}

async function readActiveRun(): Promise<ActiveRunRecord> {
  const parsed = JSON.parse(await readFile(ACTIVE_RECORD_PATH, "utf8")) as unknown;
  return activeRunRecord(parsed);
}

function processExists(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ESRCH") return false;
    throw error;
  }
}

async function readServerPid(record: ActiveRunRecord): Promise<number | null> {
  if (!existsSync(record.serverPidFile)) return null;
  const parsed = JSON.parse(await readFile(record.serverPidFile, "utf8")) as unknown;
  const server = exactRecord(parsed, [
    "ownershipToken",
    "pid",
    "root",
    "schema",
  ], "Fixture server ownership file");
  if (
    server.schema !== "hraness.site-footer.fixture-server/v1"
    || server.ownershipToken !== record.ownershipToken
  ) {
    throw new Error("The fixture server ownership token does not match the active run.");
  }
  const pid = nonnegativeInteger(server.pid, "Fixture server PID");
  if (pid === 0) throw new Error("The fixture server PID is invalid.");
  return pid;
}

function serverCommand(pid: number): string {
  const result = Bun.spawnSync(["ps", "-ww", "-p", String(pid), "-o", "command="], {
    stderr: "pipe",
    stdout: "pipe",
  });
  if (result.exitCode !== 0) return "";
  return result.stdout.toString().trim();
}

async function waitForProcessExit(pid: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (processExists(pid) && Date.now() < deadline) await Bun.sleep(25);
  return !processExists(pid);
}

async function cleanupInterrupted(mode: "apply" | "dry-run"): Promise<void> {
  if (!existsSync(ACTIVE_RECORD_PATH)) {
    console.log(JSON.stringify({ action: "none", status: "no-active-run" }, null, 2));
    return;
  }
  const record = await readActiveRun();
  const pid = await readServerPid(record);
  const serverAlive = pid !== null && processExists(pid);
  if (serverAlive && pid !== null) {
    const command = serverCommand(pid);
    if (!isExactServerCommand(command, record.serverCommand)) {
      throw new Error("The recorded PID no longer runs the exact verifier-owned server command.");
    }
  }
  const plan = {
    browserSession: record.browser.session,
    evidencePreserved: relative(REPOSITORY_ROOT, ARTIFACT_ROOT),
    mode,
    runtimeDirectory: record.runtimeDirectory,
    serverAlive,
    serverPid: pid,
  };
  if (mode === "dry-run") {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }
  if (existsSync(record.browser.configPath)) {
    const browser = createBrowserDriver({ ...record.browser });
    await browser.run(["session"]).catch(() => undefined);
    await browser.close(true);
  }
  if (serverAlive && pid !== null) {
    process.kill(-pid, "SIGTERM");
    if (!(await waitForProcessExit(pid, 3_000))) {
      const remainingCommand = serverCommand(pid);
      if (!isExactServerCommand(remainingCommand, record.serverCommand)) {
        throw new Error("The recorded PID changed ownership during verifier cleanup.");
      }
      process.kill(-pid, "SIGKILL");
      if (!(await waitForProcessExit(pid, 3_000))) {
        throw new Error(`Verifier-owned server ${String(pid)} survived SIGKILL.`);
      }
    }
  }
  await rm(record.runtimeDirectory, { force: true, recursive: true });
  await rm(ACTIVE_RECORD_PATH, { force: true });
  console.log(JSON.stringify({ ...plan, status: "cleaned" }, null, 2));
}

async function verifyHealth(ownershipToken: string): Promise<void> {
  const response = await fetch(`${DEFAULT_BASE_URL}/health`, {
    signal: AbortSignal.timeout(2_000),
  });
  const value = await response.json() as unknown;
  const record = exactRecord(value, ["ownershipToken", "schema"], "Fixture health response");
  if (
    !response.ok
    || record.schema !== "hraness.site-footer.fixture-health/v1"
    || record.ownershipToken !== ownershipToken
  ) {
    throw new Error("The fixture health response does not match this run.");
  }
}

const SETTLE_EXPRESSION = `(async () => {
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return true;
})()`;

// The verifier states the expected organization copy itself rather than
// importing it, so a source change to the attribution is caught here.
const ATTRIBUTION_TITLE = "Built by Hraness";
const ATTRIBUTION_SUBTITLE = "Hraness is an advanced software research organization dedicated to advancing the frontier of machine intelligence.";

// Browser-side statements shared by every context. They bind `attribution`
// and `attributionSample`, and throw when the block loses its exact copy,
// leaves the single wide row, or gains any compact footprint.
const ATTRIBUTION_STATEMENTS = `
  const attribution = document.querySelector('[data-slot="hraness-attribution"]');
  const attributionTitle = attribution?.querySelector(".hraness-site-footer__attribution-title");
  const attributionSubtitle = attribution?.querySelector(".hraness-site-footer__attribution-subtitle");
  if (
    !(attribution instanceof HTMLElement) || !(attributionTitle instanceof HTMLElement) || !(attributionSubtitle instanceof HTMLElement)
    || attributionTitle.textContent !== ${JSON.stringify(ATTRIBUTION_TITLE)}
    || attributionSubtitle.textContent !== ${JSON.stringify(ATTRIBUTION_SUBTITLE)}
    || attribution.children.length !== 2 || attribution.getAttribute("lang") !== "en" || attribution.getAttribute("dir") !== "ltr"
    || attribution.querySelector("a, button, [aria-hidden], [role]") !== null
    || attribution.closest(".hraness-site-footer__brand, nav") !== null
    || document.querySelectorAll('[data-slot="hraness-attribution"]').length !== 1
    || /Ben Guo|Built by Ben/u.test(document.querySelector("#hraness-site-footer").textContent)
  ) {
    throw new Error("Footer attribution lost its exact organization copy.");
  }
  for (const element of [attribution, attributionTitle, attributionSubtitle]) {
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") {
      throw new Error("Footer attribution left the accessibility tree.");
    }
  }
  const attributionStyle = getComputedStyle(attribution);
  const attributionBox = attribution.getBoundingClientRect();
  const attributionSample = {
    height: attributionBox.height,
    position: attributionStyle.position,
    subtitleVisible: getComputedStyle(attributionSubtitle).position === "static",
    titleVisible: getComputedStyle(attributionTitle).position === "static",
    width: attributionBox.width,
  };
  if (window.matchMedia("(min-width: 47.5rem)").matches) {
    const row = document.querySelector(".hraness-site-footer__socials").getBoundingClientRect();
    if (
      attributionStyle.position !== "static"
      || Math.abs(attributionBox.height - row.height) > 0.5
      || Math.abs((attributionBox.top + attributionBox.height / 2) - (row.top + row.height / 2)) > 1
    ) {
      throw new Error("Footer attribution left the single wide row.");
    }
    for (const line of [attributionTitle, attributionSubtitle]) {
      const box = line.getBoundingClientRect();
      if (getComputedStyle(line).position === "static" && (
        box.top < attributionBox.top - 0.5 || box.bottom > attributionBox.bottom + 0.5
        || line.scrollWidth > line.clientWidth
      )) {
        throw new Error("A revealed attribution line overflows its row.");
      }
    }
    if (attributionSample.subtitleVisible && !attributionSample.titleVisible) {
      throw new Error("The attribution subtitle cannot appear without its title.");
    }
  } else if (attributionStyle.position !== "absolute" || attributionBox.width > 1 || attributionBox.height > 1) {
    throw new Error("Footer attribution must have no compact footprint.");
  }
`;

const FIXTURE_SNAPSHOT_EXPRESSION = `(() => {
  const fixture = window.__siteFooterFixture;
  if (!fixture || typeof fixture.snapshot !== "function") {
    throw new Error("The footer fixture boundary is unavailable.");
  }
  return fixture.snapshot();
})()`;

const LAYOUT_SAMPLE_EXPRESSION = `(() => {
  const required = (selector, label) => {
    const element = document.querySelector(selector);
    if (!(element instanceof HTMLElement)) throw new Error(label + " is missing.");
    return element;
  };
  const rect = (name, element) => {
    const box = element.getBoundingClientRect();
    if (!(box.width > 0 && box.height > 0)) throw new Error(name + " is not visible.");
    return { height: box.height, name, width: box.width, x: box.x, y: box.y };
  };
  const footer = required("#hraness-site-footer", "Footer");
  const inner = required(".hraness-site-footer__inner", "Footer inner");
  const brand = required(".hraness-site-footer__brand", "Footer brand");
  const compact = !window.matchMedia("(min-width: 47.5rem)").matches;
  const mailing = (compact ? document.querySelector(".hraness-site-footer__disclosure-trigger") : document.querySelector(".hraness-site-footer__mailing"))
    ?? required(".hraness-site-footer__mailing-confirmation", "Footer mailing surface");
  const support = required('[data-slot="hraness-support-link"]', "Optional support link");
  if (!(support instanceof HTMLAnchorElement) || support.href !== 'https://account.hraness.com/support?product=soundfish&source=web#support'
    || support.textContent !== 'Support' || support.target || !support.title.includes('Support ongoing development')) {
    throw new Error("Support link lost its product handoff or optional value proposition.");
  }
  const socials = required(".hraness-site-footer__socials", "Footer social group");
  const socialLinks = [...document.querySelectorAll(".hraness-site-footer__social-link")];
  if (socialLinks.length !== 4 || brand.textContent.trim() !== "") {
    throw new Error("Footer must show the Ra icon without a wordmark and exactly four social links.");
  }
  ${ATTRIBUTION_STATEMENTS}
  const substack = socialLinks[0];
  if (
    !(substack instanceof HTMLAnchorElement)
    || substack.href !== "https://substack.com/@hraness"
    || substack.getBoundingClientRect().width <= 0
  ) {
    throw new Error("Substack is not the first visible social link.");
  }
  const boxes = [
    rect("footer", footer),
    rect("inner", inner),
    rect("brand", brand),
    rect("mailing", mailing),
    rect("support", support),
    rect("socials", socials),
  ];
  const panel = document.querySelector(".hraness-site-footer__disclosure-panel");
  if (!compact && panel instanceof HTMLElement && panel.checkVisibility()) {
    const panelBox = panel.getBoundingClientRect();
    const formBox = mailing.getBoundingClientRect();
    if (Math.abs(panelBox.height - formBox.height) > 0.5) {
      throw new Error("The wide inline disclosure panel adds height around the form.");
    }
    boxes.push(rect("panel", panel));
  }
  // The attribution joins the wide named layout once its track reveals the
  // title; a starved track leaves it out rather than sampling an empty box.
  if (!compact && attributionSample.titleVisible) boxes.push(rect("attribution", attribution));
  const controls = document.querySelector(".hraness-site-footer__mailing-controls");
  const input = document.querySelector(".hraness-site-footer__mailing-input");
  const submit = document.querySelector(".hraness-site-footer__mailing-submit");
  const status = document.querySelector(".hraness-site-footer__mailing-status");
  if (controls instanceof HTMLElement && controls.checkVisibility()) boxes.push(rect("controls", controls));
  if (input instanceof HTMLElement && input.checkVisibility()) boxes.push(rect("input", input));
  if (submit instanceof HTMLElement && submit.checkVisibility()) boxes.push(rect("submit", submit));
  if (
    status instanceof HTMLElement
    && status.checkVisibility() && getComputedStyle(status).visibility !== "hidden"
  ) boxes.push(rect("status", status));
  socialLinks
    .filter((element) => {
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0;
    })
    .forEach((element, index) => boxes.push(rect("social." + String(index), element)));
  return {
    boxes,
    schema: ${JSON.stringify(DIRECT_NAMED_LAYOUT_SAMPLE_SCHEMA)},
    viewport: { height: window.innerHeight, width: window.innerWidth },
  };
})()`;

const FOOTER_SPACING_EXPRESSION = `(() => {
  const inner = document.querySelector(".hraness-site-footer__inner");
  if (!(inner instanceof HTMLElement)) throw new Error("Footer inner is missing.");
  // The attribution counts as row content only while it is in flow; its
  // compact state is an out-of-flow, visually hidden box.
  const content = [...inner.querySelectorAll([
    ".hraness-site-footer__brand", ".hraness-site-footer__social-link", ".hraness-site-footer__support",
    ".hraness-site-footer__mailing-input", ".hraness-site-footer__mailing-submit",
    ".hraness-site-footer__mailing-confirmation", ".hraness-site-footer__disclosure-trigger", ".hraness-site-footer__account",
    ".hraness-site-footer__attribution",
  ].join(","))].filter(element => element.checkVisibility() && getComputedStyle(element).position !== "absolute")
    .map(element => element.getBoundingClientRect())
    .filter(box => box.width > 0 && box.height > 0 && box.top >= inner.getBoundingClientRect().top);
  if (content.length < 2) {
    throw new Error("Footer spacing requires visible content targets.");
  }
  // Resolve the device inset independently of the footer's own padding rule.
  // This hidden measurement box is out of flow and is always removed.
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "all:initial;position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;width:0;height:0;padding:0;padding-bottom:env(safe-area-inset-bottom, 0px);border:0;";
  document.body.append(probe);
  let safeAreaInset;
  try {
    safeAreaInset = Number.parseFloat(getComputedStyle(probe).paddingBottom);
  } finally {
    probe.remove();
  }
  const style = getComputedStyle(inner);
  const box = inner.getBoundingClientRect();
  const topPadding = Number.parseFloat(style.paddingBlockStart);
  const bottomPadding = Number.parseFloat(style.paddingBlockEnd);
  const borderTop = Number.parseFloat(style.borderTopWidth);
  const borderBottom = Number.parseFloat(style.borderBottomWidth);
  const contentTop = Math.min(...content.map(item => item.top));
  const contentBottom = Math.max(...content.map(item => item.bottom));
  return {
    bottomClearance: box.bottom - borderBottom - contentBottom,
    bottomPadding,
    expectedHeight: contentBottom - contentTop + topPadding + bottomPadding + borderTop + borderBottom,
    innerHeight: box.height,
    safeAreaInset,
    topClearance: contentTop - box.top - borderTop,
    topPadding,
  };
})()`;

function assertFooterSpacing(input: unknown, label: string): FooterSpacing {
  const record = exactRecord(input, [
    "bottomClearance", "bottomPadding", "expectedHeight", "innerHeight",
    "safeAreaInset", "topClearance", "topPadding",
  ], `${label} footer spacing`);
  const spacing = Object.freeze({
    bottomClearance: finiteNumber(record.bottomClearance, "Footer bottom clearance"),
    bottomPadding: finiteNumber(record.bottomPadding, "Footer bottom padding"),
    expectedHeight: finiteNumber(record.expectedHeight, "Footer expected height"),
    innerHeight: finiteNumber(record.innerHeight, "Footer inner height"),
    safeAreaInset: finiteNumber(record.safeAreaInset, "Footer safe-area inset"),
    topClearance: finiteNumber(record.topClearance, "Footer top clearance"),
    topPadding: finiteNumber(record.topPadding, "Footer top padding"),
  });
  if (spacing.topPadding <= 0 || spacing.safeAreaInset < 0
    || Math.abs(spacing.bottomPadding - spacing.topPadding - spacing.safeAreaInset) > 0.5) {
    throw new Error(`${label} must retain matching visual padding above the device safe area.`);
  }
  if (Math.abs(spacing.topClearance - spacing.topPadding) > 0.5
    || Math.abs(spacing.bottomClearance - spacing.bottomPadding) > 0.5
    || Math.abs(spacing.innerHeight - spacing.expectedHeight) > 0.5) {
    throw new Error(`${label} rendered content does not clear the footer edges by its declared padding.`);
  }
  return spacing;
}

const MANUAL_GEOMETRY_EXPRESSION = `(() => {
  const rect = (element) => element instanceof HTMLElement
    ? element.getBoundingClientRect()
    : null;
  const footer = document.querySelector("#hraness-site-footer");
  const inner = document.querySelector(".hraness-site-footer__inner");
  const mailing = document.querySelector(".hraness-site-footer__mailing")
    ?? document.querySelector(".hraness-site-footer__mailing-confirmation");
  const controls = document.querySelector(".hraness-site-footer__mailing-controls");
  const input = document.querySelector(".hraness-site-footer__mailing-input");
  const submit = document.querySelector(".hraness-site-footer__mailing-submit");
  const status = document.querySelector(".hraness-site-footer__mailing-status");
  const statusStyle = status instanceof HTMLElement ? getComputedStyle(status) : null;
  const footerBox = rect(footer);
  const innerBox = rect(inner);
  const mailingBox = rect(mailing);
  if (footerBox === null || innerBox === null || mailingBox === null) {
    throw new Error("The footer geometry surface is incomplete.");
  }
  return {
    bodyScrollWidth: document.body.scrollWidth,
    controlsHeight: rect(controls)?.height ?? null,
    documentScrollWidth: document.documentElement.scrollWidth,
    footerHeight: footerBox.height,
    footerPosition: getComputedStyle(footer).position,
    footerTop: footerBox.top,
    formHeight: rect(document.querySelector(".hraness-site-footer__mailing"))?.height ?? null,
    innerHeight: innerBox.height,
    innerPosition: getComputedStyle(inner).position,
    innerTop: innerBox.top,
    inputHeight: rect(input)?.height ?? null,
    mailingHeight: mailingBox.height,
    statusOpacity: statusStyle === null ? null : Number(statusStyle.opacity),
    statusPosition: statusStyle?.position ?? null,
    statusVisibility: statusStyle?.visibility ?? null,
    submitHeight: rect(submit)?.height ?? null,
    viewportWidth: window.innerWidth,
    visibleSocialTargets: [...document.querySelectorAll(".hraness-site-footer__social-link")]
      .map((element) => element.getBoundingClientRect())
      .filter((box) => box.width > 0 && box.height > 0)
      .map((box) => ({ height: box.height, width: box.width })),
  };
})()`;

const FONT_CASCADE_EXPRESSION = `(() => {
  const values = (selector) => {
    const element = document.querySelector(selector);
    if (!(element instanceof HTMLElement)) return null;
    const computed = getComputedStyle(element);
    return {
      language: computed.getPropertyValue("font-language-override"),
      palette: computed.getPropertyValue("font-palette"),
    };
  };
  return {
    input: values(".hraness-site-footer__mailing-input"),
    root: values("#hraness-site-footer"),
    submit: values(".hraness-site-footer__mailing-submit"),
    supportsLanguage: CSS.supports("font-language-override", '"TRK"'),
    supportsPalette: CSS.supports("font-palette", "light"),
  };
})()`;

function assertFixtureState(snapshot: FixtureSnapshot, state: FixtureState): void {
  if (snapshot.errors.length > 0) {
    throw new Error(`${state} reported page errors: ${snapshot.errors.join("; ")}`);
  }
  if (snapshot.expectedEmail !== TEST_EMAIL) throw new Error("The fixture email identity changed.");
  if (snapshot.domState !== state) {
    throw new Error(`${state} reached DOM state ${snapshot.domState}.`);
  }
  const expectedRequestCount = state === "pending" || state === "accepted" || state === "error"
    ? 1
    : 0;
  if (snapshot.requests.length !== expectedRequestCount) {
    throw new Error(`${state} produced ${String(snapshot.requests.length)} Accounts requests.`);
  }
  const request = snapshot.requests[0];
  if (request !== undefined) {
    if (
      request.url !== "https://account.hraness.com/api/mailing/subscribe"
      || request.method !== "POST"
      || request.credentials !== "omit"
      || request.audience !== "footer-fixture"
      || request.email !== TEST_EMAIL
      || request.honeypot !== ""
      || request.source !== "hraness-site-footer"
    ) {
      throw new Error(`${state} produced an invalid synthetic Accounts boundary request.`);
    }
  }
}

function assertManualGeometry(
  geometry: ManualGeometry,
  state: FixtureState,
  viewport: ViewportKind,
): void {
  if (
    geometry.documentScrollWidth > geometry.viewportWidth + 0.5
    || geometry.bodyScrollWidth > geometry.viewportWidth + 0.5
  ) {
    throw new Error(`${state}/${viewport} has horizontal overflow.`);
  }
  if (Math.abs(geometry.footerHeight - geometry.innerHeight) > 0.5) {
    throw new Error(`${state}/${viewport} footer and inner heights diverge.`);
  }
  if (
    geometry.footerPosition !== "static"
    || geometry.innerPosition !== "relative"
    || Math.abs(geometry.footerTop - geometry.innerTop) > 0.5
  ) {
    throw new Error(`${state}/${viewport} footer is not in normal document flow.`);
  }
  if (geometry.visibleSocialTargets.length < 1 || geometry.visibleSocialTargets.length > 4
    || (viewport === "wide" && geometry.visibleSocialTargets.length !== 4)) {
    throw new Error(`${state}/${viewport} must retain Substack and reveal later socials as space permits.`);
  }
  if (geometry.visibleSocialTargets.some(({ height, width }) => height < 28 || width < 28)) {
    throw new Error(`${state}/${viewport} has a visible social target smaller than 28 CSS pixels.`);
  }
  if (state !== "accepted" && !(state === "idle" && viewport === "compact")) {
    if (
      geometry.inputHeight === null
      || geometry.submitHeight === null
      || geometry.formHeight === null
      || geometry.controlsHeight === null
    ) {
      throw new Error(`${state}/${viewport} is missing form geometry.`);
    }
    if (Math.abs(geometry.inputHeight - geometry.submitHeight) > 0.5) {
      throw new Error(`${state}/${viewport} input and submit heights differ.`);
    }
    if (Math.abs(geometry.formHeight - geometry.controlsHeight) > 0.5) {
      throw new Error(`${state}/${viewport} status content reserves form-row height.`);
    }
  }
  if (state === "idle") {
    if (
      geometry.statusPosition !== "absolute"
      || geometry.statusVisibility !== "hidden"
      || geometry.statusOpacity === null
      || geometry.statusOpacity > 0.01
    ) {
      throw new Error(`${viewport} idle status is not a hidden non-reserving overlay.`);
    }
  }
}

async function screenshot(
  browser: BrowserDriver,
  path: string,
): Promise<void> {
  await browser.run(["screenshot", "--full", path]);
  if ((await stat(path)).size < SCREENSHOT_MINIMUM_BYTES) {
    throw new Error(`Browser screenshot is unexpectedly small: ${path}`);
  }
}

async function sampleViewport(options: {
  readonly browser: BrowserDriver;
  readonly kind: ViewportKind;
  readonly runDirectory: string;
  readonly state: FixtureState;
}): Promise<ViewportEvidence> {
  await options.browser.evaluate(SETTLE_EXPRESSION);
  const firstInput = await options.browser.evaluate(LAYOUT_SAMPLE_EXPRESSION);
  await options.browser.evaluate(SETTLE_EXPRESSION);
  const secondInput = await options.browser.evaluate(LAYOUT_SAMPLE_EXPRESSION);
  const first = parseDirectNamedLayoutSample(firstInput);
  const second = parseDirectNamedLayoutSample(secondInput);
  if (!first.ok) throw new Error(first.error.message);
  if (!second.ok) throw new Error(second.error.message);
  const boxNames = first.value.boxes.map(({ name }) => name);
  const contract = parseDirectNamedLayoutContract(
    createLayoutContract(options.kind, boxNames),
  );
  if (!contract.ok) throw new Error(contract.error.message);
  const validation = validateDirectNamedLayout(contract.value, [first.value, second.value]);
  if (!validation.ok) {
    throw new Error(
      `${options.state}/${options.kind} layout failed: ${validation.violations.map(({ message }) => message).join("; ")}`,
    );
  }
  const geometry = parseManualGeometry(
    await options.browser.evaluate(MANUAL_GEOMETRY_EXPRESSION),
  );
  assertManualGeometry(geometry, options.state, options.kind);
  const spacing = assertFooterSpacing(
    await options.browser.evaluate(FOOTER_SPACING_EXPRESSION), `${options.state}/${options.kind}`,
  );
  const fontCascade = assertFontCascade(
    await options.browser.evaluate(FONT_CASCADE_EXPRESSION), options.state,
  );
  const screenshotPath = join(
    options.runDirectory,
    `${options.state}-${options.kind}-${String(first.value.viewport.width)}.png`,
  );
  await screenshot(options.browser, screenshotPath);
  return Object.freeze({
    fontCascade,
    geometry,
    spacing,
    layout: Object.freeze({
      samples: [first.value, second.value],
      ok: validation.ok,
      ruleCount: contract.value.rules.length,
      violations: validation.violations,
    }),
    screenshot: relative(REPOSITORY_ROOT, screenshotPath),
    viewport: first.value.viewport,
  });
}

function activeTabId(input: unknown): string {
  const record = isRecord(input) ? input : null;
  if (record === null) throw new Error("Browser tab inventory is invalid.");
  if (typeof record.activeTabId === "string") return record.activeTabId;
  if (Array.isArray(record.tabs)) {
    const active = record.tabs.find((tab) => isRecord(tab) && tab.active === true);
    if (isRecord(active)) {
      const candidate = active.id ?? active.tabId;
      if (typeof candidate === "string") return candidate;
    }
  }
  throw new Error("Browser tab inventory did not identify the active tab.");
}

function tabIds(input: unknown): readonly string[] {
  const record = isRecord(input) ? input : null;
  if (record === null || !Array.isArray(record.tabs)) {
    throw new Error("Browser tab inventory must contain a tabs array.");
  }
  return Object.freeze(record.tabs.map((tab, index) => {
    if (!isRecord(tab)) throw new Error(`Browser tab ${String(index)} must be an object.`);
    const candidate = tab.id ?? tab.tabId;
    if (typeof candidate !== "string" || candidate.length === 0) {
      throw new Error(`Browser tab ${String(index)} has no stable ID.`);
    }
    return candidate;
  }));
}

export function browserConsoleErrors(input: unknown): readonly unknown[] {
  const record = isRecord(input) ? input : null;
  if (record === null || !Array.isArray(record.messages)) {
    throw new Error("Browser console evidence must contain a messages array.");
  }
  return Object.freeze(record.messages.filter((message, index) => {
    if (!isRecord(message)) {
      throw new Error(`Browser console message ${String(index)} must be an object.`);
    }
    const level = message.type;
    if (typeof level !== "string" || level.trim().length === 0) {
      throw new Error(`Browser console message ${String(index)} has no explicit type.`);
    }
    const normalized = level.trim().toLowerCase();
    return normalized === "error" || normalized === "assert";
  }));
}

export function isRecoverableTabCloseRace(error: unknown): boolean {
  const rendered = renderUnknown(error);
  return rendered.includes("agent-browser tab exited with 1")
    && rendered.includes(
      "Failed to install browser network controls: CDP error (Target.attachToTarget): No target with given id found",
    );
}

function browserPageErrors(input: unknown): readonly unknown[] {
  const record = isRecord(input) ? input : null;
  if (record === null || !Array.isArray(record.errors)) {
    throw new Error("Browser page-error evidence must contain an errors array.");
  }
  return Object.freeze([...record.errors]);
}

export function assertDisclosureSnapshot(input: unknown, expanded: boolean, expectedName: string): void {
  if (!isRecord(input) || typeof input.snapshot !== "string") throw new Error("Missing native disclosure accessibility snapshot.");
  const summaries = input.snapshot.split("\n").filter(line => line.includes("- DisclosureTriangle "));
  const summary = summaries[0]?.match(/- DisclosureTriangle "(.*)" \[expanded=(true|false)\]/u);
  // Chromium separates adjacent text runs with spaces, including before commas.
  const name = summary?.[1]?.replace(/\s+,/gu, ",").replace(/\s+/gu, " ").trim();
  if (summaries.length !== 1 || name !== expectedName || summary?.[2] !== String(expanded)) {
    throw new Error(`Native summary has the wrong accessible name or expanded state: ${summaries.join("; ")}`);
  }
}

async function verifyDisclosure(browser: BrowserDriver, runDirectory: string): Promise<readonly unknown[]> {
  const summary = '[data-slot="hraness-mailing-disclosure"] > summary';
  const inspect = async (open: boolean, preserved = false) => {
    const value = await browser.evaluate(`(() => {
      const disclosure = document.querySelector('[data-slot="hraness-mailing-disclosure"]');
      const summary = disclosure.querySelector('summary');
      const panel = disclosure.querySelector('.hraness-site-footer__disclosure-panel');
      const input = disclosure.querySelector('input[name="email"]');
      const footer = document.querySelector('.hraness-site-footer__inner');
      const closedLabel = summary.querySelector('.hraness-site-footer__disclosure-closed-label');
      const openLabel = summary.querySelector('.hraness-site-footer__disclosure-open-label');
      const box = summary.getBoundingClientRect();
      const panelBox = panel.getBoundingClientRect();
      const gap = footer.getBoundingClientRect().top - panelBox.bottom;
      const isOpen = disclosure.hasAttribute('open');
      if (isOpen !== ${String(open)}) throw new Error('Disclosure state did not follow activation.');
      if (getComputedStyle(closedLabel).visibility !== (isOpen ? 'hidden' : 'visible')
        || getComputedStyle(openLabel).visibility !== (isOpen ? 'visible' : 'hidden')) throw new Error('Disclosure action labels did not switch.');
      if (${String(preserved)} && input.value !== ${JSON.stringify(TEST_EMAIL)}) throw new Error('Disclosure lost the typed email.');
      if (isOpen) {
        if (document.activeElement !== input) throw new Error('Opening did not focus email.');
        if (parseFloat(getComputedStyle(input).fontSize) < 16) throw new Error('Compact email may zoom on focus.');
        if (gap < 4 || gap > 6 || panelBox.height > 76) throw new Error('Disclosure panel is detached or oversized: ' + gap + 'px gap, ' + panelBox.height + 'px height.');
        if (panelBox.left < 0 || panelBox.right > innerWidth + 0.5) throw new Error('Disclosure panel overflows.');
        if (getComputedStyle(summary).backgroundImage !== 'none') throw new Error('Open trigger still competes with submit.');
        if (!getComputedStyle(disclosure.querySelector('button[type="submit"]')).backgroundImage.includes('conic-gradient')) throw new Error('Submit lost its foil border.');
      } else if (!getComputedStyle(summary).backgroundImage.includes('conic-gradient')) throw new Error('Closed trigger lost its foil border.');
      return { open: isOpen, width: box.width, height: box.height, gap, panelHeight: panelBox.height, inputFontSize: getComputedStyle(input).fontSize };
    })()`);
    if (!isRecord(value) || typeof value.width !== "number") throw new Error("Invalid disclosure geometry evidence.");
    return value;
  };
  const requireSynchronousFocus = async () => {
    const value = await browser.evaluate("window.__siteFooterFixture.disclosureSnapshot().at(-1)");
    if (!isRecord(value) || value.open !== true || value.emailFocused !== true || value.trusted !== true) {
      throw new Error("Email was not focused synchronously during trusted summary activation.");
    }
  };
  const initialFocus = await browser.evaluate("document.activeElement?.matches('input[name=\"email\"]') === true");
  if (initialFocus === true) throw new Error("Idle disclosure stole email focus.");
  const closed = await inspect(false);
  await browser.run(["click", summary]);
  await requireSynchronousFocus();
  const opened = await inspect(true);
  if (Math.abs(Number(closed.width) - Number(opened.width)) > 0.5) throw new Error("Opening shifted the trigger footprint.");
  const openAccessibility = await browser.run(["snapshot"]);
  await writeJsonAtomically(join(runDirectory, "disclosure-open-accessibility.json"), openAccessibility);
  assertDisclosureSnapshot(openAccessibility, true, "Close email signup");
  await screenshot(browser, join(runDirectory, "disclosure-open-390.png"));
  await browser.run(["fill", 'input[name="email"]', TEST_EMAIL]);
  await browser.run(["click", summary]);
  const reclosed = await inspect(false, true);
  await browser.run(["press", "Enter"]);
  await requireSynchronousFocus();
  await inspect(true, true);
  await browser.run(["press", "Escape"]);
  await inspect(false, true);
  const escapeFocus = await browser.evaluate(`document.activeElement?.matches(${JSON.stringify(summary)}) === true`);
  if (escapeFocus !== true) throw new Error("Escape did not restore summary focus.");
  await browser.run(["press", "Space"]);
  await requireSynchronousFocus();
  await browser.run(["set", "viewport", "320", "844"]);
  const compact = await inspect(true, true);
  await screenshot(browser, join(runDirectory, "disclosure-open-320.png"));
  await browser.run(["press", "Escape"]);
  await inspect(false, true);
  const closedAccessibility = await browser.run(["snapshot"]);
  await writeJsonAtomically(join(runDirectory, "disclosure-closed-accessibility.json"), closedAccessibility);
  assertDisclosureSnapshot(closedAccessibility, false, "Feed the goblin, Subscribe by email");
  return [closed, opened, reclosed, compact, { openAccessibility, closedAccessibility }];
}

async function driveState(options: {
  readonly bootstrapTabId: string;
  readonly browser: BrowserDriver;
  readonly runDirectory: string;
  readonly state: FixtureState;
  readonly experiment?: "inline";
}): Promise<ScenarioEvidence> {
  const context = await options.browser.run(["tab", "new"]);
  await options.browser.run(["set", "viewport", "1280", "900"]);
  await options.browser.run([
    "open",
    `${DEFAULT_BASE_URL}/?state=${encodeURIComponent(options.state)}${options.experiment === "inline" ? "&experiment=inline" : ""}`,
  ]);
  await options.browser.run(["wait", "body[data-fixture-ready='true']", "--timeout", "5000"]);
  const waitForEnrollment = async () => {
    if (options.experiment !== "inline") return;
    await options.browser.run(["wait", "--fn", `(() => {
      const form = document.querySelector('form[data-copy-variant="goblin"]');
      const layout = window.matchMedia('(min-width: 47.5rem)').matches ? 'inline' : 'button';
      return form?.getAttribute('data-layout') === layout
        && form.querySelector('input[name="experimentToken"]')?.value === '${"a".repeat(64)}';
    })()`, "--timeout", "5000"]);
  };
  await waitForEnrollment();
  await options.browser.evaluate(SETTLE_EXPRESSION);
  if (options.state === "pending" || options.state === "accepted" || options.state === "error") {
    await options.browser.run(["fill", 'input[name="email"]', TEST_EMAIL]);
    await options.browser.run(["click", 'button[type="submit"]']);
  }
  await options.browser.run([
    "wait",
    "--fn",
    `document.querySelector("[data-state='${options.state}']") !== null`,
    "--timeout",
    "5000",
  ]);
  await options.browser.evaluate(SETTLE_EXPRESSION);
  const fixture = parseFixtureSnapshot(
    await options.browser.evaluate(FIXTURE_SNAPSHOT_EXPRESSION),
    options.state,
  );
  assertFixtureState(fixture, options.state);
  if (options.state === "idle") {
    const ready = await options.browser.evaluate(
      `(() => {
        const button = document.querySelector('button[type="submit"]');
        const honeypot = document.querySelector('input[name="website"]');
        return button instanceof HTMLButtonElement
          && !button.disabled
          && button.textContent === ${JSON.stringify(options.experiment === "inline" ? "Feed the goblin" : "Send me things")}
          && honeypot instanceof HTMLInputElement
          && honeypot.value === ""
          && honeypot.getAttribute("aria-hidden") === "true"
          && honeypot.getBoundingClientRect().width < 2;
      })()`,
    );
    if (ready !== true) throw new Error("Idle signup is not immediately usable with a hidden honeypot.");
  }
  let foilEvidence: unknown;
  // Synthetic pointerdown marks the form interacted, which correctly suppresses
  // enrollment rebuilds on later viewport changes, so the probe runs only in
  // the non-experiment idle scenario.
  if (options.state === "idle" && options.experiment !== "inline") {
    const foil = await options.browser.evaluate(`(async () => {
      const button = document.querySelector('button[type="submit"]');
      if (!(button instanceof HTMLElement)) throw new Error('Idle signup lost its foil submit.');
      const enhanced = matchMedia('(prefers-reduced-motion: no-preference) and (forced-colors: none)').matches;
      const vars = () => [
        button.style.getPropertyValue('--footer-foil-x'),
        button.style.getPropertyValue('--footer-foil-y'),
        button.style.getPropertyValue('--footer-foil-angle'),
      ];
      const settle = async () => {
        // Damped easing converges over several frames; wait until readings hold.
        let last = '';
        for (let i = 0; i < 90; i++) {
          await new Promise(resolve => requestAnimationFrame(resolve));
          const now = vars().join('|');
          if (now === last) return;
          last = now;
        }
      };
      const rect = button.getBoundingClientRect();
      const fire = (type, offset, pointerType) => button.dispatchEvent(new PointerEvent(type, {
        bubbles: true, clientX: rect.left + rect.width * offset, clientY: rect.top + rect.height / 2, pointerType,
      }));
      fire('pointermove', 0.2, 'mouse');
      await settle();
      const mouseNear = vars();
      fire('pointermove', 0.8, 'mouse');
      await settle();
      const mouseFar = vars();
      document.body.dispatchEvent(new PointerEvent('pointermove', {
        bubbles: true, clientX: 8, clientY: 8, pointerType: 'mouse',
      }));
      await settle();
      const offElement = vars();
      fire('pointerdown', 0.5, 'touch');
      await settle();
      const touch = vars();
      fire('pointerup', 0.5, 'touch');
      const released = vars();
      const expectNear = (sample, x) => Math.abs(parseFloat(sample[0]) - x) < 1;
      if (!enhanced) {
        if ([...mouseNear, ...mouseFar, ...offElement, ...touch].some(value => value !== '')) throw new Error('Foil painted without the motion and color fallbacks.');
        return { enhanced, mouseNear, mouseFar, offElement, touch, released };
      }
      if (!expectNear(mouseNear, 20) || !expectNear(mouseFar, 80) || !expectNear(touch, 50)) {
        throw new Error('Foil did not track mouse and touch position: ' + JSON.stringify({ mouseNear, mouseFar, touch }));
      }
      if (mouseNear[2] === mouseFar[2]) throw new Error('Foil angle did not follow pointer position.');
      if (!(parseFloat(offElement[0]) < 0) || offElement[2] === '') throw new Error('Foil ignored pointer movement outside the control: ' + JSON.stringify(offElement));
      if (released.some(value => value !== '')) throw new Error('Foil kept its pointer state after touch release.');
      return { enhanced, mouseNear, mouseFar, offElement, touch, released };
    })()`);
    if (!isRecord(foil) || foil.enhanced !== true) {
      throw new Error(`Foil enhancement probe could not run: ${renderUnknown(foil)}`);
    }
    foilEvidence = foil;
  }
  if (options.state === "pending" || options.state === "accepted") {
    const focused = await options.browser.evaluate(
      "document.activeElement?.matches('[data-slot=\"hraness-mailing-list-status\"]') === true",
    );
    if (focused !== true) throw new Error(`${options.state} did not focus its status.`);
  }
  if (options.state === "error") {
    const focused = await options.browser.evaluate(
      "document.activeElement?.matches('input[name=\"email\"]') === true",
    );
    if (focused !== true) throw new Error(`${options.state} did not restore email focus.`);
  }
  const wide = await sampleViewport({ ...options, kind: "wide" });
  await options.browser.run(["set", "viewport", "390", "844"]);
  await waitForEnrollment();
  const compact = await sampleViewport({ ...options, kind: "compact" });
  const additionalWidths: ViewportEvidence[] = [];
  for (const width of [320, 760]) {
    await options.browser.run(["set", "viewport", String(width), "844"]);
    await waitForEnrollment();
    additionalWidths.push(await sampleViewport({ ...options, kind: width < 760 ? "compact" : "wide" }));
  }
  let disclosure: readonly unknown[] = [];
  if (options.experiment === "inline") {
    await options.browser.run(["set", "viewport", "390", "844"]);
    await waitForEnrollment();
    disclosure = await verifyDisclosure(options.browser, options.runDirectory);
  }
  const experimentRequests = await options.browser.evaluate("window.__siteFooterFixture.experimentSnapshot()");
  const browserErrors = await options.browser.run(["errors"]);
  const pageErrors = browserPageErrors(browserErrors);
  if (pageErrors.length > 0) {
    throw new Error(
      `${options.state} produced browser page errors: ${renderUnknown(pageErrors)}`,
    );
  }
  const browserConsole = await options.browser.run(["console"]);
  const consoleErrors = browserConsoleErrors(browserConsole);
  if (consoleErrors.length > 0) {
    throw new Error(
      `${options.state} produced error-level console entries: ${renderUnknown(consoleErrors)}`,
    );
  }
  const preCloseInventory = await options.browser.run(["tab"]);
  const tabId = activeTabId(preCloseInventory);
  if (tabId === options.bootstrapTabId) {
    throw new Error(`${options.state} did not create a distinct scenario tab.`);
  }
  const returnToBootstrap = await options.browser.run(["tab", options.bootstrapTabId]);
  let closeAttempt: unknown;
  try {
    closeAttempt = await options.browser.run(["tab", "close", tabId]);
  } catch (error) {
    if (!isRecoverableTabCloseRace(error)) throw error;
    closeAttempt = Object.freeze({
      driverRace: "target-closed-before-network-control-reattach",
      error: renderUnknown(error),
      requiresPostCloseInventory: true,
    });
  }
  const postCloseInventory = await options.browser.run(["tab"]);
  if (
    activeTabId(postCloseInventory) !== options.bootstrapTabId
    || tabIds(postCloseInventory).includes(tabId)
  ) {
    throw new Error(`${options.state} scenario tab did not close back to the bootstrap tab.`);
  }
  const evidence = Object.freeze({
    additionalWidths,
    browserConsole,
    browserErrors,
    closeAttempt,
    compact,
    disclosure,
    context,
    fixture,
    experiment: options.experiment ?? "none",
    experimentRequests,
    foil: foilEvidence ?? null,
    postCloseInventory,
    preCloseInventory,
    returnToBootstrap,
    state: options.state,
    wide,
  });
  await writeJsonAtomically(
    join(options.runDirectory, `${options.state}.json`),
    evidence,
  );
  return evidence;
}

async function driveNoSignup(browser: BrowserDriver, runDirectory: string, bootstrapTabId: string, account = false): Promise<readonly unknown[]> {
  const scenario = account ? "account" : "no-signup";
  await browser.run(["tab", "new"]);
  await browser.run(["open", `${DEFAULT_BASE_URL}/?mailing=${account ? "account&experiment=inline" : "none"}`]);
  await browser.run(["wait", "body[data-fixture-ready='true']", "--timeout", "5000"]);
  const evidence: unknown[] = [];
  for (const width of [320, 390, 760, 1280]) {
    await browser.run(["set", "viewport", String(width), "844"]);
    await browser.evaluate(SETTLE_EXPRESSION);
    const geometry = await browser.evaluate(`(() => {
      const footer = document.querySelector('#hraness-site-footer');
      const inner = footer.querySelector('.hraness-site-footer__inner');
      const brand = footer.querySelector('.hraness-site-footer__brand');
      const links = [...footer.querySelectorAll('a')]
        .filter(link => link.closest('[data-slot="hraness-cookie-consent"]') === null);
      if (links.length !== ${account ? 7 : 6} || brand.textContent.trim() !== '') throw new Error('Unexpected footer identity or social count.');
      if (footer.querySelector('form, input, script, [data-foil], [data-copy-variant], .hraness-site-footer__mailing-status')) throw new Error('No-signup footer contains mailing UI.');
      const state = window.__siteFooterFixture.snapshot();
      if (state.requests.length || state.errors.length || window.__siteFooterFixture.experimentSnapshot().length) throw new Error('No-signup footer used a signup or experiment boundary.');
      const account = footer.querySelector('[data-slot="hraness-account-link"]');
      if (${account}) {
        if (!(account instanceof HTMLAnchorElement) || account.href !== 'https://account.hraness.com/' || account.textContent !== 'My account' || account.target) throw new Error('Account navigation lost native semantics.');
        const style = getComputedStyle(account);
        if (style.backgroundImage !== 'none' || style.borderStyle !== 'solid' || parseFloat(style.borderWidth) < 1 || style.animationName !== 'none') throw new Error('Account link must have a normal border without foil or animation.');
        if (!footer.querySelector('.hraness-site-footer__social-link').checkVisibility()) throw new Error('Account mode lost Substack.');
      }
      if (document.documentElement.scrollWidth > innerWidth + 0.5) throw new Error('No-signup footer overflows.');
      ${ATTRIBUTION_STATEMENTS}
      // Without a signup form the wide row has room for the whole attribution.
      if (innerWidth >= 1280 && !(attributionSample.titleVisible && attributionSample.subtitleVisible)) {
        throw new Error('The wide no-signup footer must reveal both attribution lines.');
      }
      const boxes = links.filter(link => link.checkVisibility()).map(link => {
        const rect = link.getBoundingClientRect();
        if (rect.width < 28 || rect.height < 28 || rect.left < 0 || rect.right > innerWidth + 0.5) throw new Error('Footer target is clipped or too small.');
        return { name: link.getAttribute('aria-label') ?? link.textContent, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      });
      const centers = boxes.map(box => box.y + box.height / 2);
      if (Math.max(...centers) - Math.min(...centers) > 1) throw new Error('Footer links must stay in one centered row.');
      return { width: innerWidth, height: inner.getBoundingClientRect().height, bottomPadding: getComputedStyle(inner).paddingBlockEnd, boxes, attribution: attributionSample };
    })()`);
    const spacing = assertFooterSpacing(
      await browser.evaluate(FOOTER_SPACING_EXPRESSION), `${scenario}/${String(width)}`,
    );
    const screenshotPath = join(runDirectory, `${scenario}-${String(width)}.png`);
    await screenshot(browser, screenshotPath);
    evidence.push({ geometry, spacing, screenshot: relative(REPOSITORY_ROOT, screenshotPath) });
  }
  await browser.run(["press", "Tab"]);
  for (const name of ["Hraness home", ...(account ? ["My account"] : []), "Support Soundfish: optional paid membership", "Hraness on Substack", "Hraness on X", "Hraness on LinkedIn", "Hraness on GitHub"]) {
    const focused = await browser.evaluate(`(() => {
      const element = document.activeElement;
      return { name: element?.getAttribute('aria-label') ?? element?.textContent, outline: element ? getComputedStyle(element).outlineStyle : null };
    })()`);
    if (!isRecord(focused) || focused.name !== name || focused.outline !== "solid") {
      throw new Error(`Keyboard focus did not visibly reach ${name}.`);
    }
    await browser.run(["press", "Tab"]);
  }
  const errors = browserPageErrors(await browser.run(["errors"]));
  const consoleErrors = browserConsoleErrors(await browser.run(["console"]));
  if (errors.length || consoleErrors.length) throw new Error("No-signup footer produced browser errors.");
  const tabId = activeTabId(await browser.run(["tab"]));
  await browser.run(["tab", bootstrapTabId]);
  try {
    await browser.run(["tab", "close", tabId]);
  } catch (error) {
    if (!isRecoverableTabCloseRace(error)) throw error;
  }
  const inventory = await browser.run(["tab"]);
  if (activeTabId(inventory) !== bootstrapTabId || tabIds(inventory).includes(tabId)) {
    throw new Error("No-signup tab did not close back to the bootstrap tab.");
  }
  return evidence;
}

function assertCrossStateGeometry(evidence: readonly ScenarioEvidence[]): void {
  const idle = evidence.find(({ state }) => state === "idle");
  if (idle === undefined) throw new Error("Idle geometry evidence is missing.");
  for (const scenario of evidence) {
    for (const viewport of ["wide", "compact"] as const) {
      const baseline = idle[viewport].geometry.innerHeight;
      const found = scenario[viewport].geometry.innerHeight;
      if (Math.abs(found - baseline) > 0.5) {
        throw new Error(
          `${scenario.state}/${viewport} changes the footer height from idle.`,
        );
      }
    }
  }
}

async function releaseServer(lease: ServerLease | null): Promise<void> {
  if (lease?.source === "started") await stopVerificationServer(lease.server);
}

async function runVerifier(): Promise<string> {
  const readiness = await doctor();
  const initialSource = sourceIdentity();
  const artifacts = await createArtifactRun({ artifactRoot: ARTIFACT_ROOT });
  const runtimeDirectory = await mkdtemp(join(RUNTIME_ROOT, "sfv-"));
  const browserDirectory = join(runtimeDirectory, "b");
  const configPath = join(browserDirectory, "c.json");
  const socketDirectory = join(browserDirectory, "s");
  const serverPidFile = join(runtimeDirectory, "server.json");
  const ownershipToken = randomUUID();
  const session = boundedAgentBrowserSessionName(
    "sf",
    process.pid,
    ownershipToken,
  );
  assertAgentBrowserSocketBudget(socketDirectory, session);
  const active: ActiveRunRecord = Object.freeze({
    browser: Object.freeze({ configPath, session, socketDirectory }),
    ownershipToken,
    repositoryRoot: REPOSITORY_ROOT,
    runtimeDirectory,
    schema: "hraness.site-footer.active-verifier/v1",
    serverCommand: fixtureServerCommand({
      ownershipToken,
      runtimeDirectory,
      serverPidFile,
    }),
    serverPidFile,
  });
  await mkdir(ACTIVE_DIRECTORY, { recursive: true });
  await writeJsonAtomically(ACTIVE_RECORD_PATH, active);

  const browser = createBrowserDriver(active.browser);
  let lease: ServerLease | null = null;
  let failure: unknown = null;
  let finalClose: "failed" | "passed" = "failed";
  let serverCleanup: "failed" | "passed" = "failed";
  const evidence: ScenarioEvidence[] = [];
  let noSignupEvidence: readonly unknown[] = [];
  let accountEvidence: readonly unknown[] = [];
  let bootstrapInventory: unknown = null;
  let finalInventory: unknown = null;
  let postDriveSource: SourceIdentity | null = null;
  try {
    await mkdir(socketDirectory, { recursive: true });
    await writeFile(configPath, "{}\n", { encoding: "utf8", mode: 0o600 });
    await buildFixture(runtimeDirectory);
    lease = await acquireVerificationServer({
      baseUrl: DEFAULT_BASE_URL,
      label: "Hraness site-footer fixture server",
      readinessPath: "/health",
      reuseExistingLocalServer: false,
      startServer: () => spawnVerificationServer({
        command: active.serverCommand,
        cwd: REPOSITORY_ROOT,
        detachedProcessGroup: true,
        env: { NODE_ENV: "test" },
        omitEnvironment: [
          "ALL_PROXY",
          "HTTPS_PROXY",
          "HTTP_PROXY",
          "all_proxy",
          "https_proxy",
          "http_proxy",
        ],
      }),
      startupTimeoutMs: 10_000,
    });
    if (lease.source !== "started") {
      throw new Error("The verifier refused to reuse a server it does not own.");
    }
    await verifyHealth(ownershipToken);
    await browser.run(["open"]);
    bootstrapInventory = await browser.run(["tab"]);
    const bootstrapTabId = activeTabId(bootstrapInventory);
    for (const state of fixtureStates) {
      console.log(`Verifying shared footer state: ${state}`);
      evidence.push(await driveState({
        bootstrapTabId,
        browser,
        runDirectory: artifacts.runDirectory,
        state,
      }));
    }
    const inlineDirectory = join(artifacts.runDirectory, "inline-enrollment");
    await mkdir(inlineDirectory, { recursive: true });
    console.log("Verifying version 3 inline enrollment and outer panel bounds");
    evidence.push(await driveState({ bootstrapTabId, browser, runDirectory: inlineDirectory, state: "idle", experiment: "inline" }));
    assertCrossStateGeometry(evidence);
    noSignupEvidence = await driveNoSignup(browser, artifacts.runDirectory, bootstrapTabId);
    accountEvidence = await driveNoSignup(browser, artifacts.runDirectory, bootstrapTabId, true);
    finalInventory = await browser.run(["tab"]);
    postDriveSource = sourceIdentity();
    assertSameSourceIdentity(initialSource, postDriveSource);
  } catch (error) {
    failure = error;
  }

  const cleanupFailures: unknown[] = [];
  try {
    await browser.close();
    finalClose = "passed";
  } catch (error) {
    cleanupFailures.push(error);
  }
  try {
    await releaseServer(lease);
    serverCleanup = "passed";
  } catch (error) {
    cleanupFailures.push(error);
  }
  if (finalClose === "passed" && serverCleanup === "passed") {
    await rm(runtimeDirectory, { force: true, recursive: true });
    await rm(ACTIVE_RECORD_PATH, { force: true });
  }

  const finalSource = sourceIdentity();
  const sourceIdentityMatched = sameSourceIdentity(initialSource, finalSource);
  if (!sourceIdentityMatched && failure === null) {
    failure = new Error("Repository source content changed during browser verification.");
  }

  const manifest = {
    allowedDomains: ALLOWED_DOMAINS,
    backend: "local-chromium",
    baseUrl: DEFAULT_BASE_URL,
    batchSize: evidence.length,
    bootstrapInventory,
    cleanup: { browser: finalClose, server: serverCleanup },
    driver: { name: "agent-browser", version: BROWSER_VERSION },
    executionMode: "synthetic-loopback-fixture",
    finalInventory,
    generatedAt: artifacts.generatedAt,
    limitations: [
      "A synthetic Accounts boundary does not prove the live provider.",
      "Named rectangles do not judge typography, contrast, hierarchy, rhythm, or overall visual quality.",
      "Measured safe-area insets may be zero; this fixture does not force a nonzero inset or prove physical-device behavior.",
      "The fixture does not prove a consuming site's CSP, theme integration, or deployed footer release.",
    ],
    readiness,
    scenarios: evidence,
    noSignup: noSignupEvidence,
    account: accountEvidence,
    schema: "hraness.site-footer.browser-verification/v1",
    source: {
      afterCleanup: finalSource,
      afterDrive: postDriveSource,
      before: initialSource,
      exactMatch: sourceIdentityMatched,
    },
  };
  if (failure !== null || cleanupFailures.length > 0) {
    await writeJsonAtomically(join(artifacts.runDirectory, "failure.json"), {
      ...manifest,
      failure: renderUnknown(failure ?? cleanupFailures[0]),
      cleanupFailures: cleanupFailures.map(renderUnknown),
    });
    throw new AggregateError(
      failure === null ? cleanupFailures : [failure, ...cleanupFailures],
      `Site-footer browser verification failed: ${renderUnknown(failure ?? cleanupFailures[0])}`,
    );
  }
  await writeJsonAtomically(artifacts.manifestPath, manifest);
  return artifacts.manifestPath;
}

async function main(): Promise<void> {
  const arguments_ = parseArguments(process.argv.slice(2));
  switch (arguments_.kind) {
    case "help":
      console.log(usage());
      return;
    case "doctor":
      console.log(JSON.stringify(await doctor(), null, 2));
      return;
    case "cleanup":
      await cleanupInterrupted(arguments_.mode);
      return;
    case "run": {
      const manifest = await runVerifier();
      console.log(`Site-footer browser verification passed. Manifest: ${manifest}`);
      return;
    }
  }
}

if (import.meta.main) await main();
