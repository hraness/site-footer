/** Pointer-only progressive enhancement; all resting presentation is compiled CSS. */
const REST_X = 50;
const REST_Y = 50;
const REST_ANGLE = 135;
const EASE = 0.22;
const SETTLE = 0.05;
const MIN_PCT = -100;
const MAX_PCT = 200;

type FoilState = { x: number; y: number; angle: number };

const clamp = (value: number) => Math.max(MIN_PCT, Math.min(MAX_PCT, value));
const wrap = (angle: number) => ((angle % 360) + 360) % 360;
const shortestTurn = (from: number, to: number) => wrap(to - from + 180) - 180;

export function attachFooterFoil(root: HTMLElement): () => void {
  if (typeof window.matchMedia !== "function" || typeof requestAnimationFrame !== "function") return () => {};
  const preference = window.matchMedia("(prefers-reduced-motion: no-preference) and (forced-colors: none)");
  const states = new Map<HTMLElement, FoilState>();
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  const reset = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    for (const target of states.keys()) {
      target.style.removeProperty("--hraness-foil-x");
      target.style.removeProperty("--hraness-foil-y");
      target.style.removeProperty("--hraness-foil-angle");
    }
    states.clear();
  };
  const paint = () => {
    frame = 0;
    if (!preference.matches) { reset(); return; }
    const live = new Set(root.querySelectorAll<HTMLElement>("[data-foil]"));
    for (const target of states.keys()) if (!live.has(target)) states.delete(target);
    let settled = true;
    for (const target of live) {
      if (!target.isConnected) { states.delete(target); continue; }
      const bounds = target.getBoundingClientRect();
      const tx = clamp((pointerX - bounds.left) / Math.max(1, bounds.width) * 100);
      const ty = clamp((pointerY - bounds.top) / Math.max(1, bounds.height) * 100);
      const ta = wrap(
        Math.atan2(pointerY - (bounds.top + bounds.height / 2), pointerX - (bounds.left + bounds.width / 2)) * (180 / Math.PI) + 90,
      );
      let state = states.get(target);
      if (!state) { state = { x: REST_X, y: REST_Y, angle: REST_ANGLE }; states.set(target, state); }
      const dx = tx - state.x;
      const dy = ty - state.y;
      const da = shortestTurn(state.angle, ta);
      if (Math.abs(dx) > SETTLE || Math.abs(dy) > SETTLE || Math.abs(da) > SETTLE) {
        settled = false;
        state.x += dx * EASE;
        state.y += dy * EASE;
        state.angle = wrap(state.angle + da * EASE);
      } else {
        state.x = tx;
        state.y = ty;
        state.angle = ta;
      }
      target.style.setProperty("--hraness-foil-x", `${state.x.toFixed(1)}%`);
      target.style.setProperty("--hraness-foil-y", `${state.y.toFixed(1)}%`);
      target.style.setProperty("--hraness-foil-angle", `${state.angle.toFixed(1)}deg`);
    }
    if (!settled) frame = requestAnimationFrame(paint);
  };
  const move = (event: PointerEvent) => {
    if (!preference.matches) { reset(); return; }
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!frame) frame = requestAnimationFrame(paint);
  };
  const release = (event: PointerEvent) => {
    if (event.pointerType === "touch") reset();
  };
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerdown", move, { passive: true });
  window.addEventListener("pointerup", release, { passive: true });
  window.addEventListener("pointercancel", reset);
  window.addEventListener("blur", reset);
  preference.addEventListener("change", reset);
  return () => {
    reset();
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerdown", move);
    window.removeEventListener("pointerup", release);
    window.removeEventListener("pointercancel", reset);
    window.removeEventListener("blur", reset);
    preference.removeEventListener("change", reset);
  };
}
