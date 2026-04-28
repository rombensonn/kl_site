import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Only render on pointer:fine devices — check once at module level
const IS_TOUCH = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const rippleContainerRef = useRef<HTMLDivElement>(null);

  // All mutable state in refs — no React re-renders in the animation loop
  const mouse = useRef({ x: -200, y: -200 });
  const ring = useRef({ x: -200, y: -200 });
  const isHovered = useRef(false);
  const isClicked = useRef(false);
  const animId = useRef<number>();
  // Ring size / color cached to avoid unnecessary style writes
  const prevHov = useRef(false);
  const prevClk = useRef(false);
  const trailPositions = useRef<{ x: number; y: number }[]>([]);
  const TRAIL_COUNT = 5; // Reduced from 6 — saves one DOM write per frame

  useEffect(() => {
    if (IS_TOUCH) return;

    document.documentElement.style.cursor = "none";

    /* ── mouse move (passive, no layout reads) ── */
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    /* ── hover detection ── */
    const INTERACTIVE = "a, button, [role='button'], input, select, textarea, label, [tabindex]";
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(INTERACTIVE)) isHovered.current = true;
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(INTERACTIVE)) isHovered.current = false;
    };

    /* ── click ripple ── */
    const onDown = (e: MouseEvent) => {
      isClicked.current = true;
      spawnRipple(e.clientX, e.clientY);
    };
    const onUp = () => { isClicked.current = false; };

    function spawnRipple(x: number, y: number) {
      const container = rippleContainerRef.current;
      if (!container) return;
      const ripple = document.createElement("div");
      ripple.style.cssText = [
        `position:fixed`,
        `left:${x}px`,
        `top:${y}px`,
        `width:8px`,
        `height:8px`,
        `border-radius:50%`,
        `transform:translate(-50%,-50%) scale(0)`,
        `background:radial-gradient(circle,rgba(99,102,241,0.5) 0%,rgba(59,130,246,0.2) 70%,transparent 100%)`,
        `border:1px solid rgba(99,102,241,0.6)`,
        `pointer-events:none`,
        `animation:cursorRipple 0.55s cubic-bezier(0.16,1,0.3,1) forwards`,
        `z-index:2147483646`,
      ].join(";");
      container.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }

    /* ── rAF loop — uses transform instead of left/top to avoid layout ── */
    const tick = () => {
      const dot = dotRef.current;
      const ringEl = ringRef.current;
      if (!dot || !ringEl) { animId.current = requestAnimationFrame(tick); return; }

      const mx = mouse.current.x;
      const my = mouse.current.y;

      // Dot: GPU-composited transform only, no left/top reads
      dot.style.transform = `translate3d(${mx - 3.5}px, ${my - 3.5}px, 0) scale(${isClicked.current ? 0.4 : isHovered.current ? 0.5 : 1})`;

      // Ring: lerp position
      const ease = 0.13;
      ring.current.x += (mx - ring.current.x) * ease;
      ring.current.y += (my - ring.current.y) * ease;
      const rx = ring.current.x;
      const ry = ring.current.y;

      // Only write style if state changed — avoids unnecessary style recalcs
      const hov = isHovered.current;
      const clk = isClicked.current;
      const stateChanged = hov !== prevHov.current || clk !== prevClk.current;

      ringEl.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;

      if (stateChanged) {
        prevHov.current = hov;
        prevClk.current = clk;

        dot.style.opacity = hov ? "0.6" : "1";
        dot.style.background = hov ? "rgba(129,140,248,1)" : "rgba(99,102,241,1)";

        ringEl.style.width = hov ? "52px" : clk ? "24px" : "36px";
        ringEl.style.height = hov ? "52px" : clk ? "24px" : "36px";
        ringEl.style.borderColor = hov
          ? "rgba(129,140,248,0.8)"
          : clk ? "rgba(248,113,113,0.7)" : "rgba(99,102,241,0.55)";
        ringEl.style.boxShadow = hov
          ? "0 0 14px rgba(99,102,241,0.35)"
          : clk ? "0 0 18px rgba(239,68,68,0.4)" : "0 0 8px rgba(99,102,241,0.18)";
      }

      // Trails: GPU transform only
      trailPositions.current.unshift({ x: mx, y: my });
      if (trailPositions.current.length > TRAIL_COUNT) trailPositions.current.length = TRAIL_COUNT;

      trailsRef.current.forEach((trail, i) => {
        if (!trail) return;
        const pos = trailPositions.current[i + 1];
        if (!pos) { trail.style.opacity = "0"; return; }
        const opacity = ((TRAIL_COUNT - i) / TRAIL_COUNT) * 0.28;
        const scale = ((TRAIL_COUNT - i) / TRAIL_COUNT) * 0.7;
        trail.style.transform = `translate3d(${pos.x - 3}px, ${pos.y - 3}px, 0) scale(${scale})`;
        trail.style.opacity = String(opacity);
      });

      animId.current = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp, { passive: true });

    animId.current = requestAnimationFrame(tick);

    return () => {
      document.documentElement.style.cursor = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      if (animId.current) cancelAnimationFrame(animId.current);
    };
  }, []);

  if (IS_TOUCH) return null;

  const BASE: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 2147483647,
    borderRadius: "50%",
    // Promote to own compositor layer — avoids triggering layout
    willChange: "transform",
  };

  return createPortal(
    <>
      {/* Ripple container */}
      <div ref={rippleContainerRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2147483646 }} />

      {/* Trail dots */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) trailsRef.current[i] = el; }}
          style={{
            ...BASE,
            width: 6,
            height: 6,
            background: "rgba(99,102,241,0.7)",
            transform: "translate3d(-200px,-200px,0)",
            transition: "opacity 80ms linear",
            filter: "blur(0.5px)",
          }}
        />
      ))}

      {/* Main dot */}
      <div
        ref={dotRef}
        style={{
          ...BASE,
          width: 7,
          height: 7,
          background: "rgba(99,102,241,1)",
          transform: "translate3d(-200px,-200px,0)",
          transition: "transform 120ms cubic-bezier(0.34,1.56,0.64,1), background 200ms, opacity 200ms",
          boxShadow: "0 0 6px rgba(99,102,241,0.9), 0 0 2px white",
        }}
      />

      {/* Lagging ring — 36×36px, centered via transform offset */}
      <div
        ref={ringRef}
        style={{
          ...BASE,
          width: 36,
          height: 36,
          border: "1.5px solid rgba(99,102,241,0.55)",
          transform: "translate3d(-200px,-200px,0)",
          transition:
            "width 220ms cubic-bezier(0.34,1.56,0.64,1), height 220ms cubic-bezier(0.34,1.56,0.64,1), border-color 200ms, box-shadow 200ms",
          animation: "cursorRingRotate 6s linear infinite",
          background: "transparent",
        }}
      />
    </>,
    document.body
  );
}
