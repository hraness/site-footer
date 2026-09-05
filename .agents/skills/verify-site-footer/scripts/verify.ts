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
  "verification-error",
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
    method: string | null;
    source: string | null;
    turnstileResponse: string | null;
    url: string;
  }>[];
  readonly schema: "hraness.site-footer.browser-fixture/v1";
  readonly selectedState: FixtureState;
  readonly turnstile: Readonly<{
    options: Readonly<{
      action: string;
      appearance: string;
      execution: string;
      refreshExpired: string;
      refreshTimeout: string;
      responseField: boolean;
      responseFieldName: string;
      retry: string;
      sitekey: string;
      size: string;
      theme: string;
    }> | null;
    removeCount: number;
    renderCount: number;
    resetCount: number;
  }>;
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

interface ViewportEvidence {
  readonly geometry: ManualGeometry;
  readonly layout: Readonly<{
    ok: boolean;
    ruleCount: number;
    violations: readonly unknown[];
  }>;
  readonly screenshot: string;
  readonly viewport: Readonly<{ height: number; width: number }>;
}

interface ScenarioEvidence {
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
  for (const name of ["brand", "mailing", "socials"] as const) {
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
  if (names.has("controls")) {
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
        minimumHeight: 40,
        minimumWidth: name === "submit" ? 72 : 80,
      });
    }
  }
  add({
    box: "brand",
    id: `${viewport}.brand.minimum`,
    kind: "minimum-size",
    minimumHeight: 40,
    minimumWidth: 28,
  });
  add({
    box: "mailing",
    id: `${viewport}.mailing.minimum`,
    kind: "minimum-size",
    minimumHeight: 40,
    minimumWidth: 80,
  });
  for (const name of boxNames.filter((name) => name.startsWith("social."))) {
    add({
      box: name,
      id: `${viewport}.${name}.minimum`,
      kind: "minimum-size",
      minimumHeight: 40,
      minimumWidth: 40,
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
  } else {
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
    "turnstile",
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
      "method",
      "source",
      "turnstileResponse",
      "url",
    ], `Footer fixture request ${String(index)}`);
    return Object.freeze({
      audience: nullableString(found.audience, "Request audience"),
      credentials: nullableString(found.credentials ?? null, "Request credentials"),
      email: nullableString(found.email, "Request email"),
      method: nullableString(found.method ?? null, "Request method"),
      source: nullableString(found.source, "Request source"),
      turnstileResponse: nullableString(found.turnstileResponse, "Turnstile response"),
      url: requiredString(found.url, "Request URL"),
    });
  });
  const turnstile = exactRecord(record.turnstile, [
    "options",
    "removeCount",
    "renderCount",
    "resetCount",
  ], "Footer fixture Turnstile snapshot");
  let options: FixtureSnapshot["turnstile"]["options"] = null;
  if (turnstile.options !== null) {
    const found = exactRecord(turnstile.options, [
      "action",
      "appearance",
      "execution",
      "refreshExpired",
      "refreshTimeout",
      "responseField",
      "responseFieldName",
      "retry",
      "sitekey",
      "size",
      "theme",
    ], "Footer fixture Turnstile options");
    if (typeof found.responseField !== "boolean") {
      throw new Error("Turnstile responseField must be boolean.");
    }
    options = Object.freeze({
      action: requiredString(found.action, "Turnstile action"),
      appearance: requiredString(found.appearance, "Turnstile appearance"),
      execution: requiredString(found.execution, "Turnstile execution"),
      refreshExpired: requiredString(found.refreshExpired, "Turnstile refresh-expired"),
      refreshTimeout: requiredString(found.refreshTimeout, "Turnstile refresh-timeout"),
      responseField: found.responseField,
      responseFieldName: requiredString(found.responseFieldName, "Turnstile response field"),
      retry: requiredString(found.retry, "Turnstile retry"),
      sitekey: requiredString(found.sitekey, "Turnstile sitekey"),
      size: requiredString(found.size, "Turnstile size"),
      theme: requiredString(found.theme, "Turnstile theme"),
    });
  }
  return Object.freeze({
    domState: requiredString(record.domState, "Footer DOM state"),
    errors: Object.freeze([...record.errors] as string[]),
    expectedEmail: requiredString(record.expectedEmail, "Fixture expected email"),
    requests: Object.freeze(requests),
    schema: "hraness.site-footer.browser-fixture/v1",
    selectedState,
    turnstile: Object.freeze({
      options,
      removeCount: nonnegativeInteger(turnstile.removeCount, "Turnstile remove count"),
      renderCount: nonnegativeInteger(turnstile.renderCount, "Turnstile render count"),
      resetCount: nonnegativeInteger(turnstile.resetCount, "Turnstile reset count"),
    }),
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
  for (const path of [FIXTURE_ENTRY, SERVER_ENTRY, join(REPOSITORY_ROOT, "src/react.tsx")]) {
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
  const result = await Bun.build({
    entrypoints: [FIXTURE_ENTRY],
    format: "esm",
    minify: false,
    outdir: bundleDirectory,
    sourcemap: "external",
    target: "browser",
  });
  if (!result.success) {
    throw new Error(
      `Footer fixture build failed: ${result.logs.map((log) => log.message).join("; ")}`,
    );
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
  const mailing = document.querySelector(".hraness-site-footer__mailing")
    ?? required(".hraness-site-footer__mailing-confirmation", "Footer mailing surface");
  const socials = required(".hraness-site-footer__socials", "Footer social group");
  const socialLinks = [...document.querySelectorAll(".hraness-site-footer__social-link")];
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
    rect("socials", socials),
  ];
  const controls = document.querySelector(".hraness-site-footer__mailing-controls");
  const input = document.querySelector(".hraness-site-footer__mailing-input");
  const submit = document.querySelector(".hraness-site-footer__mailing-submit");
  const status = document.querySelector(".hraness-site-footer__mailing-status");
  if (controls instanceof HTMLElement) boxes.push(rect("controls", controls));
  if (input instanceof HTMLElement) boxes.push(rect("input", input));
  if (submit instanceof HTMLElement) boxes.push(rect("submit", submit));
  if (
    status instanceof HTMLElement
    && getComputedStyle(status).visibility !== "hidden"
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
      || request.source !== "hraness-site-footer"
      || request.turnstileResponse?.startsWith("fixture-") !== true
    ) {
      throw new Error(`${state} produced an invalid synthetic Accounts boundary request.`);
    }
  }
  const options = snapshot.turnstile.options;
  if (
    snapshot.turnstile.renderCount < 1
    || options === null
    || options.action !== "mailing_footer_fixture"
    || options.appearance !== "interaction-only"
    || options.execution !== "render"
    || options.refreshExpired !== "auto"
    || options.refreshTimeout !== "auto"
    || options.responseField !== true
    || options.responseFieldName !== "cf-turnstile-response"
    || options.retry !== "auto"
    || options.sitekey !== "1x00000000000000000000AA"
    || options.size !== "flexible"
    || options.theme !== "auto"
  ) {
    throw new Error(`${state} lost the Turnstile rendering contract.`);
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
  if (geometry.visibleSocialTargets.length < 4) {
    throw new Error(`${state}/${viewport} exposes fewer than four essential social targets.`);
  }
  if (geometry.visibleSocialTargets.some(({ height, width }) => height < 40 || width < 40)) {
    throw new Error(`${state}/${viewport} has a visible social target smaller than 40 CSS pixels.`);
  }
  if (state !== "accepted") {
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
  const screenshotPath = join(
    options.runDirectory,
    `${options.state}-${options.kind}.png`,
  );
  await screenshot(options.browser, screenshotPath);
  return Object.freeze({
    geometry,
    layout: Object.freeze({
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

async function driveState(options: {
  readonly bootstrapTabId: string;
  readonly browser: BrowserDriver;
  readonly runDirectory: string;
  readonly state: FixtureState;
}): Promise<ScenarioEvidence> {
  const context = await options.browser.run(["tab", "new"]);
  await options.browser.run(["set", "viewport", "1280", "900"]);
  await options.browser.run([
    "open",
    `${DEFAULT_BASE_URL}/?state=${encodeURIComponent(options.state)}`,
  ]);
  await options.browser.run(["wait", "body[data-fixture-ready='true']", "--timeout", "5000"]);
  await options.browser.run([
    "wait",
    "--fn",
    "window.__siteFooterFixture?.snapshot().turnstile.renderCount >= 1",
    "--timeout",
    "5000",
  ]);
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
    const gated = await options.browser.evaluate(
      `(() => {
        const button = document.querySelector('button[type="submit"]');
        return button instanceof HTMLButtonElement
          && button.disabled
          && button.textContent === "Verifying…";
      })()`,
    );
    if (gated !== true) throw new Error("Idle signup is not gated on Turnstile readiness.");
  }
  if (options.state === "pending" || options.state === "accepted") {
    const focused = await options.browser.evaluate(
      "document.activeElement?.matches('[data-slot=\"hraness-mailing-list-status\"]') === true",
    );
    if (focused !== true) throw new Error(`${options.state} did not focus its status.`);
  }
  if (options.state === "error" || options.state === "verification-error") {
    const focused = await options.browser.evaluate(
      "document.activeElement?.matches('input[name=\"email\"]') === true",
    );
    if (focused !== true) throw new Error(`${options.state} did not restore email focus.`);
  }
  const wide = await sampleViewport({ ...options, kind: "wide" });
  await options.browser.run(["set", "viewport", "390", "844"]);
  const compact = await sampleViewport({ ...options, kind: "compact" });
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
    browserConsole,
    browserErrors,
    closeAttempt,
    compact,
    context,
    fixture,
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
    assertCrossStateGeometry(evidence);
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
    batchSize: fixtureStates.length,
    bootstrapInventory,
    cleanup: { browser: finalClose, server: serverCleanup },
    driver: { name: "agent-browser", version: BROWSER_VERSION },
    executionMode: "synthetic-loopback-fixture",
    finalInventory,
    generatedAt: artifacts.generatedAt,
    limitations: [
      "Synthetic Turnstile and Accounts boundaries do not prove either live provider.",
      "Named rectangles do not judge typography, contrast, hierarchy, rhythm, or overall visual quality.",
      "The fixture does not prove a consuming site's CSP, theme integration, or deployed footer release.",
    ],
    readiness,
    scenarios: evidence,
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
