/** Pointer-only progressive enhancement; all resting presentation is compiled CSS. */
const REST = 50;
const SETTLE = 0.05;
const RESPONSE_MS = 85;
const MIN_LIGHT = 8;
const MAX_LIGHT = 92;
type Light = { x: number; y: number };
const clampLight = (value: number) => Math.max(MIN_LIGHT, Math.min(MAX_LIGHT, value));

/**
 * One damped light source per outermost [data-foil] control inside the footer.
 * Shapes and the material direction stay fixed; only the highlight fields move.
 * Resting CSS is complete without this enhancement; touch, reduced motion and
 * forced colors leave it untouched. Return the cleanup function on unmount.
 */
export function attachFooterFoil(root: HTMLElement): () => void {
  if (typeof window.matchMedia !== "function" || typeof requestAnimationFrame !== "function"
    || typeof cancelAnimationFrame !== "function") return () => {};
  const preference = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)");
  const states = new Map<HTMLElement, Light>();
  let targets: HTMLElement[] = [];
  let needsTargets = true;
  let pointer: Light | undefined;
  let frame = 0;
  let previousTime: number | undefined;
  const restore = (target: HTMLElement) => {
    target.style.removeProperty("--hraness-foil-x");
    target.style.removeProperty("--hraness-foil-y");
  };
  const reset = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousTime = undefined;
    pointer = undefined;
    for (const target of states.keys()) restore(target);
    states.clear();
    targets = [];
    needsTargets = true;
  };
  const refreshTargets = () => {
    targets = [...(root.matches("[data-foil]") ? [root] : []), ...root.querySelectorAll<HTMLElement>("[data-foil]")]
      .filter((target) => {
        const ancestor = target.parentElement?.closest("[data-foil]");
        return !ancestor || !root.contains(ancestor);
      });
    const live = new Set(targets);
    for (const target of states.keys()) {
      if (!live.has(target)) { restore(target); states.delete(target); }
    }
    needsTargets = false;
  };
  const paint = (time: number) => {
    frame = 0;
    if (!preference.matches || document.hidden || !pointer) { reset(); return; }
    if (needsTargets) refreshTargets();
    const elapsed = previousTime === undefined ? 1000 / 60 : Math.max(0, Math.min(64, time - previousTime));
    previousTime = time;
    const ease = 1 - Math.exp(-elapsed / RESPONSE_MS);
    // Read every rectangle before writing styles; there is no read/write/read loop.
    const measured = targets.map((target) => ({ target, bounds: target.getBoundingClientRect() }));
    let moving = false;
    for (const { target, bounds } of measured) {
      if (!target.isConnected || !root.contains(target) || bounds.width <= 0 || bounds.height <= 0
        || bounds.bottom <= 0 || bounds.right <= 0 || bounds.top >= window.innerHeight || bounds.left >= window.innerWidth) {
        if (states.has(target)) { restore(target); states.delete(target); }
        continue;
      }
      // A minimum light field avoids tiny controls behaving like a pointer joystick.
      const goal = {
        x: clampLight(REST + (pointer.x - bounds.left - bounds.width / 2) / Math.max(160, bounds.width) * 60),
        y: clampLight(REST + (pointer.y - bounds.top - bounds.height / 2) / Math.max(120, bounds.height) * 50),
      };
      const light = states.get(target) ?? { x: REST, y: REST };
      for (const axis of ["x", "y"] as const) {
        const distance = goal[axis] - light[axis];
        if (Math.abs(distance) > SETTLE) { light[axis] += distance * ease; moving = true; }
        else light[axis] = goal[axis];
      }
      states.set(target, light);
      target.style.setProperty("--hraness-foil-x", `${light.x.toFixed(2)}%`);
      target.style.setProperty("--hraness-foil-y", `${light.y.toFixed(2)}%`);
    }
    if (moving) frame = requestAnimationFrame(paint);
    else previousTime = undefined;
  };
  const move = (event: PointerEvent) => {
    if (!preference.matches || document.hidden || event.pointerType === "touch") { reset(); return; }
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
    pointer = { x: event.clientX, y: event.clientY };
    needsTargets = true;
    if (!frame) frame = requestAnimationFrame(paint);
  };
  const leave = (event: PointerEvent) => { if (event.relatedTarget === null) reset(); };
  const visibility = () => { if (document.hidden) reset(); };
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerdown", move, { passive: true });
  window.addEventListener("pointerout", leave, { passive: true });
  window.addEventListener("pointercancel", reset);
  window.addEventListener("blur", reset);
  window.addEventListener("scroll", reset, { passive: true, capture: true });
  window.addEventListener("resize", reset, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  preference.addEventListener("change", reset);
  return () => {
    reset();
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerdown", move);
    window.removeEventListener("pointerout", leave);
    window.removeEventListener("pointercancel", reset);
    window.removeEventListener("blur", reset);
    window.removeEventListener("scroll", reset, true);
    window.removeEventListener("resize", reset);
    document.removeEventListener("visibilitychange", visibility);
    preference.removeEventListener("change", reset);
  };
}
