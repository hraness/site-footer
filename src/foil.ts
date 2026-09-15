/** Pointer-only progressive enhancement; all resting presentation is compiled CSS. */
export function attachFooterFoil(root: HTMLElement): () => void {
  if (typeof window.matchMedia !== "function" || typeof requestAnimationFrame !== "function") return () => {};
  const preference = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)");
  let target: HTMLElement | null = null;
  let bounds: DOMRect | null = null;
  let frame = 0;
  let x = 0;
  let y = 0;
  const reset = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (target) {
      target.style.removeProperty("--footer-foil-x");
      target.style.removeProperty("--footer-foil-y");
      target.style.removeProperty("--footer-foil-angle");
    }
    target = null;
    bounds = null;
  };
  const paint = () => {
    frame = 0;
    if (!target || !preference.matches || !target.isConnected) { reset(); return; }
    bounds ??= target.getBoundingClientRect();
    const px = Math.max(0, Math.min(100, (x - bounds.left) / Math.max(1, bounds.width) * 100));
    const py = Math.max(0, Math.min(100, (y - bounds.top) / Math.max(1, bounds.height) * 100));
    target.style.setProperty("--footer-foil-x", `${px.toFixed(1)}%`);
    target.style.setProperty("--footer-foil-y", `${py.toFixed(1)}%`);
    target.style.setProperty("--footer-foil-angle", `${(90 + px * 1.8).toFixed(1)}deg`);
  };
  const move = (event: PointerEvent) => {
    if (!preference.matches || event.pointerType !== "mouse") { reset(); return; }
    const next = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-foil]") : null;
    if (!next || !root.contains(next)) { reset(); return; }
    if (target !== next) { reset(); target = next; }
    x = event.clientX;
    y = event.clientY;
    if (!frame) frame = requestAnimationFrame(paint);
  };
  const invalidate = () => { bounds = null; };
  root.addEventListener("pointermove", move, { passive: true });
  root.addEventListener("pointerleave", reset);
  root.addEventListener("pointercancel", reset);
  window.addEventListener("resize", invalidate, { passive: true });
  window.addEventListener("scroll", invalidate, { capture: true, passive: true });
  preference.addEventListener("change", reset);
  return () => {
    reset();
    root.removeEventListener("pointermove", move);
    root.removeEventListener("pointerleave", reset);
    root.removeEventListener("pointercancel", reset);
    window.removeEventListener("resize", invalidate);
    window.removeEventListener("scroll", invalidate, true);
    preference.removeEventListener("change", reset);
  };
}
