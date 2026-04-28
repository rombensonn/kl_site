import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronDown, Sparkles, Check, Zap, User, Upload, Play,
  Camera, Video, LayoutDashboard, FolderOpen, Image, Film,
  Plus, ArrowRight, Download, RotateCcw,
  Sliders, MessageSquare, Layers, ChevronRight, Bell,
  Package, TrendingUp, RefreshCw, Save, Clock, AlertTriangle,
  Search, Settings } from "lucide-react";

// ─── Typewriter component ─────────────────────────────────────────────────────
const TYPEWRITER_PHRASES = ["Без съёмок.", "Без агентств.", "Без зависимости."];

function TypewriterText() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) {
      const t = setTimeout(() => {setPaused(false);setDeleting(true);}, 1500);
      return () => clearTimeout(t);
    }
    const phrase = TYPEWRITER_PHRASES[phraseIdx];
    if (!deleting) {
      if (displayed.length < phrase.length) {
        const t = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 60);
        return () => clearTimeout(t);
      } else {setPaused(true);}
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
        return () => clearTimeout(t);
      } else {
        setDeleting(false);
        setPhraseIdx((i) => (i + 1) % TYPEWRITER_PHRASES.length);
      }
    }
  }, [displayed, deleting, paused, phraseIdx]);

  return (
    <span className="typewriter-text">
      {displayed}
      <span className="typewriter-cursor" />
    </span>);
}

// ─── Particles canvas ─────────────────────────────────────────────────────────
function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const COUNT = isMobile ? 18 : 36;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let animId: number;
    let visible = true;
    const resize = () => {
      const w = canvas.offsetWidth; const h = canvas.offsetHeight;
      canvas.width = w * DPR; canvas.height = h * DPR;
      ctx.scale(DPR, DPR);
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
    };
    resize();
    const onVisibility = () => { visible = !document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); };
    window.addEventListener("resize", onResize, { passive: true });
    type Particle = { x: number; y: number; vx: number; vy: number; radius: number; opacity: number; };
    const W = () => canvas.offsetWidth; const H = () => canvas.offsetHeight;
    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W(), y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 1.2 + 0.8, opacity: Math.random() * 0.25 + 0.08,
    }));
    const draw = () => {
      if (!visible) { animId = requestAnimationFrame(draw); return; }
      const w = W(); const h = H();
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, 6.2832);
        ctx.fillStyle = `rgba(139,92,246,${p.opacity})`; ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId); clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} />);
}

// ─── 3D Tilt wrapper ──────────────────────────────────────────────────────────
function TiltWrapper({ children }: {children: React.ReactNode;}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const isTouch = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return;
    const inner = innerRef.current; if (!inner) return;
    const rect = inner.parentElement!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 2 - 1;
    const y = (e.clientY - rect.top) / rect.height * 2 - 1;
    inner.style.transition = "none";
    inner.style.transform = `rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale(1.02)`;
  };
  const onLeave = () => {
    if (isTouch) return;
    const inner = innerRef.current; if (!inner) return;
    inner.style.transition = "transform 400ms ease-out";
    inner.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  };
  return (
    <div style={{ perspective: isTouch ? undefined : "1000px" }} onMouseMove={isTouch ? undefined : onMove} onMouseLeave={isTouch ? undefined : onLeave}>
      <div ref={innerRef} style={{ transition: "transform 150ms ease-out" }}>{children}</div>
    </div>);
}

// ─── Shared primitives ────────────────────────────────────────────────────────
type Screen = "dashboard" | "brief" | "character" | "photo" | "video" | "motion" | "results";
type Mode = "guided" | "prompt" | "hybrid";

const POINT_COLORS = { low: "#4ade80", mid: "#facc15", high: "#f87171" };

function ProtoToast({ msg, visible, type = "success" }: {msg: string;visible: boolean;type?: "success" | "info";}) {
  return (
    <div className="absolute top-3 right-3 z-30 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium pointer-events-none transition-all duration-400"
    style={{
      background: type === "success" ? "rgba(34,197,94,0.14)" : "rgba(37,99,235,0.14)",
      border: `1px solid ${type === "success" ? "rgba(34,197,94,0.35)" : "rgba(37,99,235,0.35)"}`,
      color: type === "success" ? "#4ade80" : "#93c5fd",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-10px)",
      backdropFilter: "blur(8px)", maxWidth: 220
    }}>
      <Check size={10} strokeWidth={2.5} className="flex-shrink-0" />
      <span className="truncate">{msg}</span>
    </div>);
}

function ProgressBar({ value, color, animated }: {value: number;color: string;animated: boolean;}) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--proto-track-bg)" }}>
      <div className="h-full rounded-full transition-all duration-100"
      style={{ width: `${value}%`, background: color, boxShadow: animated ? `0 0 6px ${color}50` : "none" }} />
    </div>);
}

function Tag({ children, color = "#60a5fa", bg = "rgba(37,99,235,0.12)", border = "rgba(37,99,235,0.25)" }: {children: React.ReactNode;color?: string;bg?: string;border?: string;}) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide"
    style={{ background: bg, border: `1px solid ${border}`, color }}>{children}</span>);
}

function CostBar({ points, label, onConfirm, loading }: {points: number;label: string;onConfirm: () => void;loading: boolean;}) {
  return (
    <div className="rounded-xl p-3 flex items-center gap-3"
    style={{ background: "var(--proto-blue-bg-2)", border: "1px solid var(--proto-blue-border-2)" }}>
      <div className="flex-1 min-w-0">
        <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "var(--proto-text-lo)" }}>Стоимость операции</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-bold" style={{ color: "#60a5fa" }}>{points} кр</span>
          <span className="text-[9px]" style={{ color: "var(--proto-text-dim)" }}>будет списано</span>
        </div>
      </div>
      <button onClick={onConfirm} disabled={loading}
      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 cursor-pointer"
      style={{ background: loading ? "var(--proto-blue-bg)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)", border: "1px solid var(--proto-blue-border-3)", color: "white" }}>
        {loading ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap size={10} />}
        {label}
      </button>
    </div>);
}

function ModeSelector({ mode, onChange }: {mode: Mode;onChange: (m: Mode) => void;}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pillRef = useRef<HTMLDivElement>(null);
  const modes: {id: Mode;label: string;icon: React.ReactNode;}[] = [
  { id: "guided", label: "Guided", icon: <Sliders size={9} /> },
  { id: "prompt", label: "Prompt", icon: <MessageSquare size={9} /> },
  { id: "hybrid", label: "Hybrid", icon: <Layers size={9} /> }];
  const modeIdx = modes.findIndex((m) => m.id === mode);
  useEffect(() => {
    const pill = pillRef.current, btn = btnRefs.current[modeIdx], container = containerRef.current;
    if (!pill || !btn || !container) return;
    const cr = container.getBoundingClientRect(), br = btn.getBoundingClientRect();
    pill.style.left = `${br.left - cr.left + 2}px`;
    pill.style.width = `${br.width - 4}px`;
    pill.style.top = "2px";
    pill.style.height = `${br.height - 4}px`;
  }, [modeIdx]);
  return (
    <div ref={containerRef} className="flex gap-0 p-0.5 rounded-lg relative"
    style={{ background: "var(--proto-blue-bg-mode)", border: "1px solid var(--proto-blue-border-mode)" }}>
      <div ref={pillRef} className="absolute rounded-md pointer-events-none"
      style={{ background: "var(--proto-blue-bg-3)", border: "1px solid var(--proto-blue-border-3)", transition: "left 300ms cubic-bezier(0.34,1.56,0.64,1), width 300ms cubic-bezier(0.34,1.56,0.64,1)", zIndex: 0 }} />
      {modes.map((m, i) =>
      <button key={m.id} ref={(el) => {btnRefs.current[i] = el;}} onClick={() => onChange(m.id)}
      className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md text-[9px] font-semibold transition-colors duration-150 cursor-pointer"
      style={{ color: mode === m.id ? "#93c5fd" : "var(--proto-text-lo)", position: "relative", zIndex: 1, background: "transparent", border: "none" }}>
          <span style={{ color: mode === m.id ? "#60a5fa" : "var(--proto-text-dim)" }}>{m.icon}</span>
          <span>{m.label}</span>
        </button>
      )}
    </div>);
}

// ─── SCREEN: DASHBOARD (real app replica) ────────────────────────────────────
function DashboardScreen({ onNav, points }: {onNav: (s: Screen) => void;points: number;}) {
  const [activeTab, setActiveTab] = useState<"balance" | "projects" | "history">("balance");

  const projects = [
    { name: "Nova", campaign: "Fashion Spring", gens: 34, emoji: "👩‍💼", status: "active" },
    { name: "Max",  campaign: "Corporate",      gens: 12, emoji: "👨‍💼", status: "active" },
  ];
  const history = [
    { icon: "📸", label: "Фото",   desc: "Студия · белая блузка",     pts: -80,  time: "2 мин" },
    { icon: "🎭", label: "Motion", desc: "Nova · dance_ref.mp4",       pts: -240, time: "1 ч"   },
    { icon: "🎬", label: "Видео",  desc: "TikTok · 15с · переход",    pts: -150, time: "3 ч"   },
    { icon: "⚡", label: "Бонус",  desc: "Стартовые кредиты",         pts: 500,  time: "2 д"   },
  ];
  const quickActions = [
    { label: "Новый персонаж", Icon: User,       cost: "от 200 кр", screen: "brief"  as Screen, color: "#6366f1", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.3)"  },
    { label: "Фото",          Icon: Camera,     cost: "от 80 кр",  screen: "photo"  as Screen, color: "#3b82f6", bg: "rgba(37,99,235,0.12)",   border: "rgba(37,99,235,0.3)"  },
    { label: "Видео",         Icon: TrendingUp, cost: "от 150 кр", screen: "video"  as Screen, color: "#ec4899", bg: "rgba(236,72,153,0.1)",   border: "rgba(236,72,153,0.28)" },
    { label: "Motion",        Icon: Film,       cost: "от 240 кр", screen: "motion" as Screen, color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.3)"  },
  ];

  const isLow = points < 100;
  const ptColor = isLow ? "#fbbf24" : points > 3000 ? "#4ade80" : "#60a5fa";

  const tabs = [
    { id: "balance"  as const, label: "Баланс",   Icon: Zap   },
    { id: "projects" as const, label: "Проекты",  Icon: Package },
    { id: "history"  as const, label: "История",  Icon: Clock  },
  ];

  return (
    <div className="flex flex-col gap-2 h-full">

      {/* ── Tabs ── */}
      <div className="flex gap-0.5 p-0.5 rounded-xl" style={{ background: "var(--proto-card-bg-2)", border: "1px solid var(--proto-card-border-2)", display: "inline-flex" }}>
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-medium transition-all duration-150 cursor-pointer"
            style={{
              background: activeTab === id ? "var(--proto-blue-bg-3)" : "transparent",
              border: activeTab === id ? "1px solid var(--proto-blue-border-3)" : "1px solid transparent",
              color: activeTab === id ? "#93c5fd" : "var(--proto-text-dim)",
            }}>
            <Icon size={9} />{label}
          </button>
        ))}
      </div>

      {/* ── TAB: Balance ── */}
      {activeTab === "balance" && (
        <div className="flex flex-col gap-2">
          {/* Balance card */}
          <div className="rounded-xl p-3 flex items-center gap-2.5"
            style={{
              background: isLow
                ? "linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.06))"
                : "linear-gradient(135deg,var(--proto-blue-bg-3),rgba(99,102,241,0.07))",
              border: `1px solid ${isLow ? "rgba(245,158,11,0.3)" : "var(--proto-blue-border-3)"}`,
            }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: isLow ? "rgba(245,158,11,0.12)" : "var(--proto-blue-bg)", border: `1px solid ${isLow ? "rgba(245,158,11,0.3)" : "var(--proto-blue-border)"}` }}>
              <Zap size={16} style={{ color: ptColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[8px] uppercase tracking-wider" style={{ color: "var(--proto-text-lo)" }}>Баланс кредитов</div>
              <div className="font-bold leading-tight" style={{ fontSize: 18, color: ptColor }}>
                {points.toLocaleString()} <span className="text-[9px] font-normal" style={{ color: "var(--proto-text-lo)" }}>кр</span>
              </div>
              {isLow && (
                <div className="flex items-center gap-1 mt-0.5">
                  <AlertTriangle size={8} style={{ color: "#fbbf24" }} />
                  <span className="text-[8px]" style={{ color: "#fbbf24" }}>Низкий баланс</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(37,99,235,0.14)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa" }}>Free</span>
              <button className="text-[8px] px-2 py-0.5 rounded-lg font-semibold cursor-pointer"
                style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "white" }}>Апгрейд →</button>
            </div>
          </div>

          {/* Subscription block */}
          <div className="rounded-xl px-3 py-2 flex items-center gap-2.5"
            style={{ background: "linear-gradient(135deg,rgba(29,78,216,0.07),rgba(99,102,241,0.05))", border: "1px solid rgba(59,130,246,0.22)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(59,130,246,0.28)" }}>
              <Sparkles size={11} style={{ color: "#60a5fa" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-semibold" style={{ color: "var(--proto-text-hi)" }}>Тариф Free</span>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(37,99,235,0.14)", border: "1px solid rgba(59,130,246,0.28)", color: "#60a5fa" }}>Бесплатный</span>
              </div>
              <div className="text-[8px]" style={{ color: "var(--proto-text-dim)" }}>Следующее списание: — · История →</div>
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <div className="text-[8px] uppercase tracking-widest font-semibold mb-1" style={{ color: "var(--proto-text-dim)" }}>Быстрые действия</div>
            <div className="grid grid-cols-2 gap-1">
              {quickActions.map(a => (
                <button key={a.label} onClick={() => onNav(a.screen)}
                  className="flex items-center gap-1.5 p-2 rounded-xl text-left cursor-pointer transition-all duration-150"
                  style={{ background: "var(--proto-card-bg-2)", border: "1px solid var(--proto-card-border-2)" }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: a.bg, border: `1px solid ${a.border}` }}>
                    <a.Icon size={10} style={{ color: a.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-semibold truncate" style={{ color: "var(--proto-text-hi)" }}>{a.label}</div>
                    <div className="text-[8px]" style={{ color: "var(--proto-text-dim)" }}>{a.cost}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Projects mini */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[8px] uppercase tracking-widest font-semibold" style={{ color: "var(--proto-text-dim)" }}>Мои проекты</div>
              <button onClick={() => onNav("brief")} className="flex items-center gap-0.5 text-[8px] cursor-pointer" style={{ color: "#60a5fa" }}><Plus size={8} />Новый</button>
            </div>
            {projects.map(p => (
              <div key={p.name} className="flex items-center gap-2 px-2 py-1.5 rounded-xl mb-0.5 cursor-pointer transition-all duration-150"
                style={{ background: "var(--proto-card-bg-2)", border: "1px solid var(--proto-card-border-2)" }}
                onClick={() => onNav("photo")}>
                <span className="text-sm flex-shrink-0">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-semibold truncate" style={{ color: "var(--proto-text-hi)" }}>{p.name} · {p.campaign}</div>
                  <div className="text-[8px]" style={{ color: "var(--proto-text-dim)" }}>{p.gens} генераций</div>
                </div>
                <Tag color="#4ade80" bg="rgba(34,197,94,0.1)" border="rgba(34,197,94,0.25)">active</Tag>
                <ChevronRight size={9} style={{ color: "var(--proto-text-dim)" }} />
              </div>
            ))}
          </div>

          {/* History mini */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[8px] uppercase tracking-widest font-semibold" style={{ color: "var(--proto-text-dim)" }}>История списаний</div>
              <span className="text-[8px] cursor-pointer" style={{ color: "#60a5fa" }}>Вся история →</span>
            </div>
            {history.slice(0, 2).map((h, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5"
                style={{ background: "var(--proto-card-bg-3)", border: "1px solid var(--proto-card-border-3)" }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0" style={{ background: "var(--proto-card-bg-2)" }}>{h.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-medium truncate" style={{ color: "var(--proto-text-mid)" }}>{h.label} · {h.desc}</div>
                  <div className="text-[8px]" style={{ color: "var(--proto-text-dim)" }}>{h.time} назад</div>
                </div>
                <span className="text-[9px] font-bold flex-shrink-0" style={{ color: h.pts > 0 ? "#4ade80" : "#f87171" }}>
                  {h.pts > 0 ? "+" : ""}{h.pts} кр
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Projects ── */}
      {activeTab === "projects" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px]" style={{ color: "var(--proto-text-lo)" }}>2 проекта</span>
            <button onClick={() => onNav("brief")} className="flex items-center gap-1 text-[9px] font-semibold cursor-pointer px-2 py-1 rounded-lg"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "white" }}><Plus size={9} />Новый</button>
          </div>
          {projects.map(p => (
            <div key={p.name} className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-150"
              style={{ background: "var(--proto-meta-bg)", border: "1px solid var(--proto-meta-border)" }}
              onClick={() => onNav("photo")}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "var(--proto-card-bg-2)", border: "1px solid var(--proto-card-border-2)" }}>{p.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-semibold" style={{ color: "var(--proto-text-hi)" }}>{p.name}</span>
                  <Tag color="#4ade80" bg="rgba(34,197,94,0.1)" border="rgba(34,197,94,0.25)">{p.status}</Tag>
                </div>
                <div className="text-[9px]" style={{ color: "var(--proto-text-dim)" }}>{p.campaign} · {p.gens} генераций</div>
              </div>
              <ChevronRight size={12} style={{ color: "var(--proto-text-dim)" }} className="flex-shrink-0" />
            </div>
          ))}
          <div className="rounded-xl p-3 text-center" style={{ background: "var(--proto-card-bg-2)", border: "1px dashed var(--proto-card-border-2)" }}>
            <p className="text-[9px] mb-2" style={{ color: "var(--proto-text-lo)" }}>Создайте нового AI‑инфлюенсера</p>
            <button onClick={() => onNav("brief")} className="text-[9px] px-3 py-1 rounded-lg font-semibold cursor-pointer"
              style={{ background: "var(--proto-blue-bg-3)", border: "1px solid var(--proto-blue-border-3)", color: "#93c5fd" }}>Создать персонажа →</button>
          </div>
        </div>
      )}

      {/* ── TAB: History ── */}
      {activeTab === "history" && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px]" style={{ color: "var(--proto-text-lo)" }}>4 последних транзакции</span>
            <span className="text-[9px] font-semibold cursor-pointer" style={{ color: "#60a5fa" }}>Вся история →</span>
          </div>
          {history.map((h, i) => (
            <div key={i} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl"
              style={{ background: "var(--proto-card-bg-2)", border: "1px solid var(--proto-card-border-2)" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: "var(--proto-card-bg-3)", border: "1px solid var(--proto-card-border-3)" }}>{h.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-medium truncate" style={{ color: "var(--proto-text-mid)" }}>{h.label} · {h.desc}</div>
                <div className="text-[8px]" style={{ color: "var(--proto-text-dim)" }}>{h.time} назад</div>
              </div>
              <span className="text-[10px] font-bold flex-shrink-0" style={{ color: h.pts > 0 ? "#4ade80" : "#f87171" }}>
                {h.pts > 0 ? "+" : ""}{h.pts} кр
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: BRAND BRIEF ──────────────────────────────────────────────────────
function BriefScreen({ onNav }: {onNav: (s: Screen) => void;}) {
  const [niche, setNiche] = useState(0);
  const [tov, setTov] = useState(0);
  const [vstyle, setVstyle] = useState(0);
  const [audience, setAudience] = useState("");
  const [tasks, setTasks] = useState<number[]>([0, 2]);
  const niches = ["Fashion", "Beauty", "E-comm", "Tech", "Food", "Sport"];
  const tovs = ["Экспертный", "Дружелюбный", "Люксовый", "Энергичный"];
  const vstyles = ["Минимализм", "Яркий", "Editorial", "UGC-стиль"];
  const taskList = ["Соцсети", "Реклама", "Лендинги", "Запуски", "E-comm"];
  const toggleTask = (i: number) => setTasks((t) => t.includes(i) ? t.filter((x) => x !== i) : [...t, i]);
  return (
    <div className="flex flex-col gap-3">
      <div className="text-[10px] leading-relaxed rounded-xl p-2.5"
      style={{ background: "var(--proto-blue-bg-2)", border: "1px solid var(--proto-blue-border-2)", color: "var(--proto-text-mid)" }}>
        Заполните бренд-бриф — платформа использует его для всех генераций в проекте.
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Название проекта</label>
        <input defaultValue="Nova Spring Campaign 2025" className="w-full px-2.5 py-1.5 rounded-lg text-[11px] outline-none truncate"
        style={{ background: "var(--proto-input-bg)", border: "1px solid var(--proto-input-border)", color: "var(--proto-input-color)" }} />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Ниша бренда</label>
        <div className="flex flex-wrap gap-1">
          {niches.map((n, i) =>
          <button key={n} onClick={() => setNiche(i)}
          className="text-[10px] px-2 py-0.5 rounded-full transition-all duration-150 cursor-pointer whitespace-nowrap"
          style={{ background: niche === i ? "var(--proto-indigo-bg)" : "var(--proto-card-bg-2)", border: niche === i ? "1px solid var(--proto-indigo-border)" : "1px solid var(--proto-card-border-2)", color: niche === i ? "#a5b4fc" : "var(--proto-text-lo)", transform: niche === i ? "scale(1.05)" : "scale(1)" }}>{n}</button>
          )}
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Целевая аудитория</label>
        <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Женщины 25-34, городские..."
        className="w-full px-2.5 py-1.5 rounded-lg text-[10px] outline-none"
        style={{ background: "var(--proto-input-bg)", border: "1px solid var(--proto-input-border)", color: "var(--proto-input-color)" }} />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Tone of Voice</label>
        <div className="grid grid-cols-2 gap-1">
          {tovs.map((t, i) =>
          <button key={t} onClick={() => setTov(i)}
          className="py-1 rounded-lg text-[10px] transition-all duration-150 cursor-pointer"
          style={{ background: tov === i ? "rgba(16,185,129,0.15)" : "var(--proto-card-bg-2)", border: tov === i ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--proto-card-border-2)", color: tov === i ? "#6ee7b7" : "var(--proto-text-lo)" }}>{t}</button>
          )}
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Визуальный стиль</label>
        <div className="grid grid-cols-2 gap-1">
          {vstyles.map((v, i) =>
          <button key={v} onClick={() => setVstyle(i)}
          className="py-1 rounded-lg text-[10px] transition-all duration-150 cursor-pointer"
          style={{ background: vstyle === i ? "var(--proto-amber-bg)" : "var(--proto-card-bg-2)", border: vstyle === i ? "1px solid var(--proto-amber-border)" : "1px solid var(--proto-card-border-2)", color: vstyle === i ? "#fcd34d" : "var(--proto-text-lo)" }}>{v}</button>
          )}
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Задачи</label>
        <div className="flex flex-wrap gap-1">
          {taskList.map((t, i) =>
          <button key={t} onClick={() => toggleTask(i)}
          className="text-[10px] px-2 py-0.5 rounded-full transition-all duration-150 cursor-pointer whitespace-nowrap"
          style={{ background: tasks.includes(i) ? "var(--proto-blue-bg-3)" : "var(--proto-card-bg-2)", border: tasks.includes(i) ? "1px solid var(--proto-blue-border-3)" : "1px solid var(--proto-card-border-2)", color: tasks.includes(i) ? "#93c5fd" : "var(--proto-text-lo)" }}>{t}</button>
          )}
        </div>
      </div>
      <button onClick={() => onNav("character")}
      className="w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
      style={{ background: "linear-gradient(135deg,#4f46e5,#6366f1)", border: "1px solid var(--proto-indigo-border)", color: "white" }}>
        Создать персонажа <ArrowRight size={12} />
      </button>
    </div>);
}

// ─── SCREEN: CHARACTER CREATION ───────────────────────────────────────────────
const LOOKS = ["Профи", "Casual", "Edgy", "Luxury", "Sport"];
const ETHNICITIES = ["Европейская", "Азиатская", "Латинская", "Ближневост."];
const TRAITS = ["Уверенная", "Дружелюбная", "Загадочная", "Энергичная"];
const REALISM = ["Фото", "Стилизованная", "CGI", "Арт"];

function CharacterScreen({ onNav, onDeductPoints }: {onNav: (s: Screen) => void;onDeductPoints: (n: number) => void;}) {
  const [mode, setMode] = useState<Mode>("guided");
  const [gender, setGender] = useState<"female" | "male">("female");
  const [look, setLook] = useState(0);
  const [ethnicity, setEthnicity] = useState(0);
  const [trait, setTrait] = useState(0);
  const [realism, setRealism] = useState(0);
  const [age, setAge] = useState(25);
  const [variations, setVariations] = useState(4);
  const [prompt, setPrompt] = useState("Молодая женщина 25 лет, европейская внешность, профессиональный стиль...");
  const [negPrompt, setNegPrompt] = useState("cartoon, watermark, blurry");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [masterSaved, setMasterSaved] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const cost = variations * 55 + (realism >= 2 ? 40 : 0);
  const handleGenerate = () => {
    setLoading(true); setGenerated(false); setProgress(0); setSelectedVariant(null); setMasterSaved(false);
    onDeductPoints(cost);
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(iv); setLoading(false); setGenerated(true); setToastMsg(`${variations} варианта готово`); setToast(true); setTimeout(() => setToast(false), 2800); return 100; }
        return p + Math.random() * 8 + 4;
      });
    }, 100);
  };
  const handleApprove = () => {
    setMasterSaved(true); setToastMsg("Master ID сохранён ✓"); setToast(true);
    setTimeout(() => { setToast(false); onNav("photo"); }, 2000);
  };
  const emojis = gender === "female" ? ["👩‍💼", "👩‍🎨", "👩‍💻", "👩‍🔬"] : ["👨‍💼", "👨‍🎨", "👨‍💻", "👨‍🔬"];
  return (
    <div className="flex flex-col gap-3 relative">
      <ProtoToast msg={toastMsg} visible={toast} />
      <ModeSelector mode={mode} onChange={setMode} />
      {mode === "guided" && <>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Пол</label>
            <div className="flex gap-1">
              {(["female", "male"] as const).map((g) =>
              <button key={g} onClick={() => setGender(g)} className="flex-1 py-1 rounded-lg text-[10px] font-medium transition-all duration-150 cursor-pointer"
              style={{ background: gender === g ? "var(--proto-indigo-bg)" : "var(--proto-card-bg-2)", border: gender === g ? "1px solid var(--proto-indigo-border)" : "1px solid var(--proto-card-border-2)", color: gender === g ? "#a5b4fc" : "var(--proto-text-lo)" }}>{g === "female" ? "Жен." : "Муж."}</button>
              )}
            </div>
          </div>
          <div>
            <div className="flex justify-between">
              <label className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--proto-text-lo)" }}>Возраст</label>
              <span className="text-[10px] font-bold" style={{ color: "#60a5fa" }}>{age} л</span>
            </div>
            <input type="range" min={18} max={50} value={age} onChange={(e) => setAge(+e.target.value)} className="w-full h-1.5 rounded-full cursor-pointer mt-2" style={{ accentColor: "#60a5fa" }} />
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Стиль</label>
          <div className="flex flex-wrap gap-1">
            {LOOKS.map((l, i) =>
            <button key={l} onClick={() => setLook(i)} className="text-[10px] px-2 py-0.5 rounded-full transition-all duration-150 cursor-pointer whitespace-nowrap"
            style={{ background: look === i ? "var(--proto-indigo-bg)" : "var(--proto-card-bg-2)", border: look === i ? "1px solid var(--proto-indigo-border)" : "1px solid var(--proto-card-border-2)", color: look === i ? "#a5b4fc" : "var(--proto-text-lo)", transform: look === i ? "scale(1.05)" : "scale(1)" }}>{l}</button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Внешность</label>
            <div className="flex flex-col gap-0.5">
              {ETHNICITIES.map((e, i) =>
              <button key={e} onClick={() => setEthnicity(i)} className="text-left px-2 py-1 rounded-lg text-[10px] transition-all duration-150 cursor-pointer"
              style={{ background: ethnicity === i ? "rgba(16,185,129,0.12)" : "var(--proto-card-bg-3)", border: ethnicity === i ? "1px solid rgba(16,185,129,0.35)" : "1px solid transparent", color: ethnicity === i ? "#6ee7b7" : "var(--proto-text-lo)" }}>{e}</button>
              )}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Реализм</label>
            <div className="flex flex-col gap-0.5">
              {REALISM.map((r, i) =>
              <button key={r} onClick={() => setRealism(i)} className="text-left px-2 py-1 rounded-lg text-[10px] transition-all duration-150 cursor-pointer flex items-center justify-between"
              style={{ background: realism === i ? "var(--proto-amber-bg)" : "var(--proto-card-bg-3)", border: realism === i ? "1px solid var(--proto-amber-border)" : "1px solid transparent", color: realism === i ? "#fcd34d" : "var(--proto-text-lo)" }}>
                <span>{r}</span>{i >= 2 && <Tag color="#f87171" bg="rgba(239,68,68,0.08)" border="rgba(239,68,68,0.2)">+40</Tag>}
              </button>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between">
            <label className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--proto-text-lo)" }}>Вариаций</label>
            <span className="text-[10px] font-bold" style={{ color: "#60a5fa" }}>{variations} шт</span>
          </div>
          <input type="range" min={1} max={8} value={variations} onChange={(e) => setVariations(+e.target.value)} className="w-full h-1.5 rounded-full cursor-pointer mt-1" style={{ accentColor: "#60a5fa" }} />
        </div>
      </>}
      {mode === "prompt" && <>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Промпт персонажа</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className="w-full px-2.5 py-2 rounded-xl text-[10px] outline-none resize-none"
          style={{ background: "var(--proto-input-bg)", border: "1px solid var(--proto-blue-border-3)", color: "var(--proto-input-color)", lineHeight: 1.5 }} />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Negative prompt</label>
          <input value={negPrompt} onChange={(e) => setNegPrompt(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg text-[10px] outline-none"
          style={{ background: "var(--proto-input-bg)", border: "1px solid var(--proto-input-border)", color: "var(--proto-input-color)" }} />
        </div>
        <div>
          <div className="flex justify-between">
            <label className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--proto-text-lo)" }}>Вариаций</label>
            <span className="text-[10px] font-bold" style={{ color: "#60a5fa" }}>{variations} шт</span>
          </div>
          <input type="range" min={1} max={8} value={variations} onChange={(e) => setVariations(+e.target.value)} className="w-full h-1.5 rounded-full cursor-pointer mt-1" style={{ accentColor: "#60a5fa" }} />
        </div>
      </>}
      {mode === "hybrid" && <>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Уточнение текстом</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} className="w-full px-2.5 py-2 rounded-xl text-[10px] outline-none resize-none"
          style={{ background: "var(--proto-input-bg)", border: "1px solid var(--proto-blue-border-3)", color: "var(--proto-input-color)", lineHeight: 1.5 }} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Стиль</label>
            {LOOKS.slice(0, 3).map((l, i) =>
            <button key={l} onClick={() => setLook(i)} className="w-full text-left px-2 py-1 mb-0.5 rounded-lg text-[10px] transition-all duration-150 cursor-pointer"
            style={{ background: look === i ? "var(--proto-indigo-bg)" : "var(--proto-card-bg-3)", border: look === i ? "1px solid var(--proto-indigo-border)" : "1px solid transparent", color: look === i ? "#a5b4fc" : "var(--proto-text-lo)" }}>{l}</button>
            )}
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Характер</label>
            {TRAITS.slice(0, 3).map((t, i) =>
            <button key={t} onClick={() => setTrait(i)} className="w-full text-left px-2 py-1 mb-0.5 rounded-lg text-[10px] transition-all duration-150 cursor-pointer"
            style={{ background: trait === i ? "var(--proto-amber-bg)" : "var(--proto-card-bg-3)", border: trait === i ? "1px solid var(--proto-amber-border)" : "1px solid transparent", color: trait === i ? "#fcd34d" : "var(--proto-text-lo)" }}>{t}</button>
            )}
          </div>
        </div>
        <div>
          <div className="flex justify-between">
            <label className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--proto-text-lo)" }}>Вариаций</label>
            <span className="text-[10px] font-bold" style={{ color: "#60a5fa" }}>{variations} шт</span>
          </div>
          <input type="range" min={1} max={6} value={variations} onChange={(e) => setVariations(+e.target.value)} className="w-full h-1.5 rounded-full cursor-pointer mt-1" style={{ accentColor: "#60a5fa" }} />
        </div>
      </>}
      <div className="flex items-center gap-2">
        <Tag color="#c4b5fd" bg="rgba(139,92,246,0.12)" border="rgba(139,92,246,0.28)">Gemini 2.5 Flash</Tag>
        <span className="text-[9px]" style={{ color: "var(--proto-text-dim)" }}>face consistency lock включён</span>
      </div>
      {loading || generated ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: "var(--proto-text-lo)" }}>{loading ? "Генерация персонажа..." : `${variations} варианта готово`}</span>
            <span className="text-[10px] font-bold" style={{ color: "#60a5fa" }}>{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={Math.min(progress, 100)} color="linear-gradient(90deg,#4f46e5,#6366f1,#818cf8)" animated={loading} />
          {generated && <>
            <div className="grid grid-cols-4 gap-1 mt-1">
              {emojis.slice(0, variations).map((e, i) =>
              <button key={i} onClick={() => setSelectedVariant(i)} className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200 cursor-pointer"
              style={{ background: selectedVariant === i ? "var(--proto-indigo-bg)" : "var(--proto-card-bg)", border: selectedVariant === i ? "1.5px solid var(--proto-indigo-border)" : "1px solid var(--proto-card-border)", transform: selectedVariant === i ? "scale(1.06)" : "scale(1)" }}>
                <span className="text-xl">{e}</span>
                <span className="text-[8px]" style={{ color: "var(--proto-text-lo)" }}>v{i + 1}</span>
                {selectedVariant === i && <Check size={8} className="text-indigo-400" />}
              </button>
              )}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => {setGenerated(false); setLoading(false); setProgress(0);}} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] cursor-pointer"
              style={{ background: "var(--proto-btn-ghost-bg)", border: "1px solid var(--proto-btn-ghost-border)", color: "var(--proto-btn-ghost-color)" }}><RefreshCw size={9} /> Reroll</button>
              <button disabled={selectedVariant === null} onClick={handleApprove} className="flex-[2] flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer"
              style={{ background: selectedVariant !== null ? "var(--proto-green-bg-2)" : "var(--proto-card-bg-3)", border: selectedVariant !== null ? "1px solid var(--proto-green-border-2)" : "1px solid var(--proto-card-border-3)", color: selectedVariant !== null ? "#4ade80" : "var(--proto-text-dim)" }}>
                <Package size={9} /> Сохранить как Master ID
              </button>
            </div>
            {masterSaved && (
              <div className="rounded-xl p-2.5" style={{ background: "var(--proto-green-bg)", border: "1px solid var(--proto-green-border)" }}>
                <div className="text-[9px] text-green-400 font-semibold mb-1">✓ Master Identity Pack сохранён</div>
                <div className="text-[8px]" style={{ color: "var(--proto-text-dim)" }}>Face consistency · Approved refs · Prompt history</div>
              </div>
            )}
          </>}
        </div>
      ) : (
        <CostBar points={cost} label="Генерировать" onConfirm={handleGenerate} loading={loading} />
      )}
    </div>);
}

// ─── SCREEN: PHOTO GENERATION ─────────────────────────────────────────────────
const SCENES = ["Студия", "Улица", "Природа", "Офис", "Loft", "Пляж"];
const RATIOS = ["1:1", "4:5", "9:16", "16:9"];
const PHOTO_SCENARIOS = ["Рекламный", "Lifestyle", "Editorial", "Product"];

function PhotoScreen({ onNav, onDeductPoints }: {onNav: (s: Screen) => void;onDeductPoints: (n: number) => void;}) {
  const [mode, setMode] = useState<Mode>("guided");
  const [scene, setScene] = useState(0);
  const [scenario, setScenario] = useState(0);
  const [ratio, setRatio] = useState(0);
  const [count, setCount] = useState(4);
  const [outfit, setOutfit] = useState("Деловой образ, белая блузка, офисный стиль");
  const [prompt, setPrompt] = useState("Nova в белой блузке стоит у окна в современном офисе...");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState(false);
  const [savedToLib, setSavedToLib] = useState(false);
  const cost = count * (mode === "prompt" ? 35 : 28) + (scenario >= 2 ? 20 : 0);
  const handleGenerate = () => {
    setLoading(true); setGenerated(false); setProgress(0); onDeductPoints(cost);
    const iv = setInterval(() => {
      setProgress((p) => { if (p >= 100) { clearInterval(iv); setLoading(false); setGenerated(true); setToast(true); setTimeout(() => setToast(false), 2500); return 100; } return p + Math.random() * 8 + 4; });
    }, 100);
  };
  const RESULT_EMOJIS = ["🧑‍💼", "✨", "🌿", "📸"];
  return (
    <div className="flex flex-col gap-3 relative">
      <ProtoToast msg={`${count} фото сгенерировано`} visible={toast} />
      <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl" style={{ background: "var(--proto-green-bg)", border: "1px solid var(--proto-green-border)" }}>
        <span className="text-base flex-shrink-0">👩‍💼</span>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-semibold" style={{ color: "#4ade80" }}>Активный инфлюенсер</div>
          <div className="text-[10px] truncate" style={{ color: "var(--proto-text-mid)" }}>Nova Spring Campaign · Master ID v3</div>
        </div>
        <Tag color="#4ade80" bg="rgba(34,197,94,0.1)" border="rgba(34,197,94,0.25)">locked</Tag>
      </div>
      <ModeSelector mode={mode} onChange={setMode} />
      {(mode === "guided" || mode === "hybrid") && <>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Локация</label>
          <div className="flex flex-wrap gap-1">
            {SCENES.map((s, i) =>
            <button key={s} onClick={() => setScene(i)} className="text-[10px] px-2 py-0.5 rounded-full transition-all duration-150 cursor-pointer whitespace-nowrap"
            style={{ background: scene === i ? "var(--proto-blue-bg-3)" : "var(--proto-card-bg-2)", border: scene === i ? "1px solid var(--proto-blue-border-3)" : "1px solid var(--proto-card-border-2)", color: scene === i ? "#93c5fd" : "var(--proto-text-lo)", transform: scene === i ? "scale(1.05)" : "scale(1)" }}>{s}</button>
            )}
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Образ / одежда</label>
          <input value={outfit} onChange={(e) => setOutfit(e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg text-[10px] outline-none"
          style={{ background: "var(--proto-input-bg)", border: "1px solid var(--proto-input-border)", color: "var(--proto-input-color)" }} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Сценарий</label>
            {PHOTO_SCENARIOS.map((s, i) =>
            <button key={s} onClick={() => setScenario(i)} className="w-full text-left px-2 py-1 mb-0.5 rounded-lg text-[10px] cursor-pointer flex items-center justify-between"
            style={{ background: scenario === i ? "var(--proto-blue-bg)" : "var(--proto-card-bg-3)", border: scenario === i ? "1px solid var(--proto-blue-border)" : "1px solid transparent", color: scenario === i ? "#93c5fd" : "var(--proto-text-lo)" }}>
              <span>{s}</span>{i >= 2 && <Tag color="#f87171" bg="rgba(239,68,68,0.08)" border="rgba(239,68,68,0.2)">+20</Tag>}
            </button>
            )}
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Формат</label>
            {RATIOS.map((r, i) =>
            <button key={r} onClick={() => setRatio(i)} className="w-full py-1 mb-0.5 rounded-lg text-[10px] font-mono font-medium cursor-pointer"
            style={{ background: ratio === i ? "rgba(16,185,129,0.15)" : "var(--proto-card-bg-2)", border: ratio === i ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--proto-card-border-2)", color: ratio === i ? "#6ee7b7" : "var(--proto-text-lo)" }}>{r}</button>
            )}
            <div className="flex justify-between mt-2">
              <label className="text-[10px] font-semibold" style={{ color: "var(--proto-text-lo)" }}>Кол-во</label>
              <span className="text-[10px] font-bold" style={{ color: "#60a5fa" }}>{count}</span>
            </div>
            <input type="range" min={1} max={8} value={count} onChange={(e) => setCount(+e.target.value)} className="w-full h-1.5 rounded-full cursor-pointer mt-1" style={{ accentColor: "#60a5fa" }} />
          </div>
        </div>
      </>}
      {mode === "prompt" && <>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Image prompt</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="w-full px-2.5 py-2 rounded-xl text-[10px] outline-none resize-none"
          style={{ background: "var(--proto-input-bg)", border: "1px solid var(--proto-blue-border-3)", color: "var(--proto-input-color)", lineHeight: 1.5 }} />
        </div>
        <div className="flex gap-2">
          {RATIOS.map((r, i) =>
          <button key={r} onClick={() => setRatio(i)} className="flex-1 py-1 rounded-lg text-[10px] font-mono cursor-pointer"
          style={{ background: ratio === i ? "rgba(16,185,129,0.15)" : "var(--proto-card-bg-2)", border: ratio === i ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--proto-card-border-2)", color: ratio === i ? "#6ee7b7" : "var(--proto-text-lo)" }}>{r}</button>
          )}
        </div>
        <div className="flex justify-between">
          <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--proto-text-lo)" }}>Кол-во</label>
          <span className="text-[10px] font-bold" style={{ color: "#60a5fa" }}>{count}</span>
        </div>
        <input type="range" min={1} max={8} value={count} onChange={(e) => setCount(+e.target.value)} className="w-full h-1.5 rounded-full cursor-pointer" style={{ accentColor: "#60a5fa" }} />
      </>}
      {loading || generated ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: "var(--proto-text-lo)" }}>{loading ? "Генерация фото..." : `${count} фото готово`}</span>
            <span className="text-[10px] font-bold" style={{ color: "#60a5fa" }}>{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={Math.min(progress, 100)} color="linear-gradient(90deg,#1d4ed8,#3b82f6,#60a5fa)" animated={loading} />
          {generated && <>
            <div className="grid grid-cols-4 gap-1 mt-1">
              {RESULT_EMOJIS.slice(0, Math.min(count, 4)).map((e, i) =>
              <div key={i} className="flex flex-col items-center gap-1 py-2 rounded-xl" style={{ background: "var(--proto-card-bg)", border: "1px solid var(--proto-blue-border)" }}>
                <span className="text-xl">{e}</span>
                <span className="text-[8px]" style={{ color: "var(--proto-text-lo)" }}>{RATIOS[ratio]}</span>
              </div>
              )}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => {setGenerated(false); setProgress(0);}} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] cursor-pointer"
              style={{ background: "var(--proto-btn-ghost-bg)", border: "1px solid var(--proto-btn-ghost-border)", color: "var(--proto-btn-ghost-color)" }}><RotateCcw size={9} /> Reroll</button>
              <button onClick={() => setSavedToLib(true)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer"
              style={{ background: savedToLib ? "var(--proto-green-bg-2)" : "var(--proto-blue-bg)", border: savedToLib ? "1px solid var(--proto-green-border-2)" : "1px solid var(--proto-blue-border-3)", color: savedToLib ? "#4ade80" : "#93c5fd" }}>
                <Save size={9} /> {savedToLib ? "Сохранено" : "В галерею"}
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] cursor-pointer"
              style={{ background: "var(--proto-btn-ghost-bg)", border: "1px solid var(--proto-btn-ghost-border)", color: "var(--proto-btn-ghost-color)" }}><Download size={9} /> Экспорт</button>
            </div>
          </>}
        </div>
      ) : (
        <CostBar points={cost} label="Сгенерировать" onConfirm={handleGenerate} loading={loading} />
      )}
    </div>);
}

// ─── SCREEN: VIDEO GENERATION ─────────────────────────────────────────────────
const PLATFORMS = ["TikTok", "Reels", "Shorts", "VK"];
const TRENDS = ["Переход", "Day in Life", "Before/After", "Reveal", "Story"];
const MOODS = ["Энергично", "Спокойно", "Лирично", "Драматично"];
const DURATIONS = [7, 15, 30, 60];

function VideoScreen({ onNav, onDeductPoints }: {onNav: (s: Screen) => void;onDeductPoints: (n: number) => void;}) {
  const [mode, setMode] = useState<Mode>("guided");
  const [platform, setPlatform] = useState(0);
  const [trend, setTrend] = useState(0);
  const [mood, setMood] = useState(0);
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState(false);
  const [prompt, setPrompt] = useState("Nova идёт по улице, уверенный шаг, трендовая переходная сцена...");
  const cost = DURATIONS[duration] * 5 + (mode === "prompt" ? 20 : 0);
  const handleGenerate = () => {
    setLoading(true); setGenerated(false); setProgress(0); onDeductPoints(cost);
    const iv = setInterval(() => {
      setProgress((p) => { if (p >= 100) { clearInterval(iv); setLoading(false); setGenerated(true); setToast(true); setTimeout(() => setToast(false), 2500); return 100; } return p + Math.random() * 5 + 3; });
    }, 130);
  };
  return (
    <div className="flex flex-col gap-3 relative">
      <ProtoToast msg={`Видео ${DURATIONS[duration]}с · ${PLATFORMS[platform]}`} visible={toast} />
      <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl" style={{ background: "var(--proto-pink-bg)", border: "1px solid var(--proto-pink-border)" }}>
        <span className="text-base">👩‍💼</span>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-semibold" style={{ color: "#f9a8d4" }}>Активный инфлюенсер</div>
          <div className="text-[10px] truncate" style={{ color: "var(--proto-text-mid)" }}>Nova Spring Campaign · Master ID v3</div>
        </div>
        <Tag color="#f9a8d4" bg="rgba(236,72,153,0.1)" border="rgba(236,72,153,0.25)">identity lock</Tag>
      </div>
      <ModeSelector mode={mode} onChange={setMode} />
      {mode !== "prompt" && <>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Платформа</label>
          <div className="grid grid-cols-4 gap-1">
            {PLATFORMS.map((p, i) =>
            <button key={p} onClick={() => setPlatform(i)} className="py-1.5 rounded-lg text-[9px] font-medium cursor-pointer"
            style={{ background: platform === i ? "rgba(236,72,153,0.15)" : "var(--proto-card-bg-2)", border: platform === i ? "1px solid rgba(236,72,153,0.4)" : "1px solid var(--proto-card-border-2)", color: platform === i ? "#f9a8d4" : "var(--proto-text-lo)" }}>{p}</button>
            )}
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Тренд</label>
          <div className="flex flex-wrap gap-1">
            {TRENDS.map((t, i) =>
            <button key={t} onClick={() => setTrend(i)} className="text-[10px] px-2 py-0.5 rounded-full cursor-pointer whitespace-nowrap"
            style={{ background: trend === i ? "rgba(236,72,153,0.16)" : "var(--proto-card-bg-2)", border: trend === i ? "1px solid rgba(236,72,153,0.45)" : "1px solid var(--proto-card-border-2)", color: trend === i ? "#f9a8d4" : "var(--proto-text-lo)", transform: trend === i ? "scale(1.05)" : "scale(1)" }}>{t}</button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Настроение</label>
            {MOODS.map((m, i) =>
            <button key={m} onClick={() => setMood(i)} className="w-full text-left px-2 py-1 mb-0.5 rounded-lg text-[10px] cursor-pointer"
            style={{ background: mood === i ? "rgba(139,92,246,0.14)" : "var(--proto-card-bg-3)", border: mood === i ? "1px solid rgba(139,92,246,0.35)" : "1px solid transparent", color: mood === i ? "#c4b5fd" : "var(--proto-text-lo)" }}>{m}</button>
            )}
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Длина</label>
            {DURATIONS.map((d, i) =>
            <button key={d} onClick={() => setDuration(i)} className="w-full py-1 mb-0.5 rounded-lg text-[10px] font-mono cursor-pointer flex items-center justify-between px-2"
            style={{ background: duration === i ? "rgba(236,72,153,0.15)" : "var(--proto-card-bg-2)", border: duration === i ? "1px solid rgba(236,72,153,0.4)" : "1px solid var(--proto-card-border-2)", color: duration === i ? "#f9a8d4" : "var(--proto-text-lo)" }}>
              <span>{d}с</span><span className="text-[8px]">{d * 5} кр</span>
            </button>
            )}
          </div>
        </div>
      </>}
      {mode === "prompt" && <>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>Video prompt</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="w-full px-2.5 py-2 rounded-xl text-[10px] outline-none resize-none"
          style={{ background: "var(--proto-input-bg)", border: "1px solid rgba(236,72,153,0.18)", color: "var(--proto-input-color)", lineHeight: 1.5 }} />
        </div>
        <div className="grid grid-cols-4 gap-1">
          {DURATIONS.map((d, i) =>
          <button key={d} onClick={() => setDuration(i)} className="py-1.5 rounded-lg text-[10px] font-mono cursor-pointer"
          style={{ background: duration === i ? "rgba(236,72,153,0.15)" : "var(--proto-card-bg-2)", border: duration === i ? "1px solid rgba(236,72,153,0.4)" : "1px solid var(--proto-card-border-2)", color: duration === i ? "#f9a8d4" : "var(--proto-text-lo)" }}>{d}с</button>
          )}
        </div>
      </>}
      <div className="flex items-center gap-2">
        <Tag color="#f9a8d4" bg="rgba(236,72,153,0.1)" border="rgba(236,72,153,0.25)">Kling 3.0</Tag>
        <span className="text-[9px]" style={{ color: "var(--proto-text-dim)" }}>face consistency · motion preservation</span>
      </div>
      {loading || generated ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: "var(--proto-text-lo)" }}>{loading ? "Kling 3.0 рендерит..." : `${DURATIONS[duration]}с · ${PLATFORMS[platform]}`}</span>
            <span className="text-[10px] font-bold" style={{ color: "#f9a8d4" }}>{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={Math.min(progress, 100)} color="linear-gradient(90deg,#be185d,#ec4899,#f9a8d4)" animated={loading} />
          {generated && (
            <div className="flex gap-1.5">
              <button onClick={() => {setGenerated(false); setProgress(0);}} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] cursor-pointer"
              style={{ background: "var(--proto-btn-ghost-bg)", border: "1px solid var(--proto-btn-ghost-border)", color: "var(--proto-btn-ghost-color)" }}><RotateCcw size={9} /> Reroll</button>
              <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer"
              style={{ background: "rgba(236,72,153,0.14)", border: "1px solid rgba(236,72,153,0.35)", color: "#f9a8d4" }}><Play size={9} /> Preview</button>
              <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] cursor-pointer"
              style={{ background: "var(--proto-btn-ghost-bg)", border: "1px solid var(--proto-btn-ghost-border)", color: "var(--proto-btn-ghost-color)" }}><Download size={9} /> MP4</button>
            </div>
          )}
        </div>
      ) : (
        <CostBar points={cost} label="Создать видео" onConfirm={handleGenerate} loading={loading} />
      )}
    </div>);
}

// ─── SCREEN: MOTION CONTROL ───────────────────────────────────────────────────
function MotionScreen({ onNav, onDeductPoints }: {onNav: (s: Screen) => void;onDeductPoints: (n: number) => void;}) {
  const [uploaded, setUploaded] = useState(false);
  const [influencer, setInfluencer] = useState<string | null>(null);
  const [motionStr, setMotionStr] = useState(80);
  const [idLock, setIdLock] = useState(90);
  const [mimicry, setMimicry] = useState(70);
  const [camSim, setCamSim] = useState(60);
  const [quality, setQuality] = useState<"preview" | "final">("preview");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState(false);
  const COSTS = { preview: 80, final: 240 };
  const cost = COSTS[quality];
  const handleRun = () => {
    if (!uploaded || !influencer) return;
    setLoading(true); setDone(false); setProgress(0); onDeductPoints(cost);
    const iv = setInterval(() => {
      setProgress((p) => { if (p >= 100) { clearInterval(iv); setLoading(false); setDone(true); setToast(true); setTimeout(() => setToast(false), 2500); return 100; } return p + Math.random() * 6 + 3; });
    }, 130);
  };
  const influencers = [{ id: "Nova_v3", emoji: "👩‍💼" }, { id: "Max_Pro", emoji: "👨‍💼" }, { id: "Sofia_X", emoji: "👩‍🎨" }];
  return (
    <div className="flex flex-col gap-3 relative">
      <ProtoToast msg={`Motion перенесён · ${quality === "final" ? "Final 4K" : "Preview HD"}`} visible={toast} />
      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>1. Референсное видео</label>
        <button onClick={() => {setUploaded(!uploaded); setDone(false);}} className="w-full rounded-xl flex items-center justify-center gap-2 py-2.5 cursor-pointer"
        style={{ background: uploaded ? "var(--proto-amber-bg)" : "var(--proto-card-bg-2)", border: uploaded ? "1.5px solid var(--proto-amber-border)" : "1.5px dashed var(--proto-card-border-2)", color: uploaded ? "#fcd34d" : "var(--proto-text-dim)" }}>
          {uploaded ? <><Check size={12} className="text-amber-400 flex-shrink-0" /><span className="text-[10px] font-medium truncate">dance_trend_ref.mp4</span><span className="text-[9px] flex-shrink-0 ml-1" style={{ color: "#fcd34d", opacity: 0.7 }}>·загружено</span></> : <><Upload size={12} /><span className="text-[10px]">Загрузить референс · MP4, MOV</span></>}
        </button>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>2. AI-инфлюенсер</label>
        <div className="grid grid-cols-3 gap-1.5">
          {influencers.map((inf) =>
          <button key={inf.id} onClick={() => {setInfluencer(inf.id); setDone(false);}} className="flex flex-col items-center gap-1 py-2 rounded-xl cursor-pointer"
          style={{ background: influencer === inf.id ? "var(--proto-blue-bg-3)" : "var(--proto-card-bg-2)", border: influencer === inf.id ? "1.5px solid var(--proto-blue-border-3)" : "1px solid var(--proto-card-border-2)", transform: influencer === inf.id ? "scale(1.04)" : "scale(1)" }}>
            <span className="text-xl">{inf.emoji}</span>
            <span className="text-[9px] font-medium truncate w-full text-center" style={{ color: influencer === inf.id ? "#93c5fd" : "var(--proto-text-lo)" }}>{inf.id}</span>
            {influencer === inf.id && <Check size={8} className="text-blue-400" />}
          </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
        { label: "Сила переноса", val: motionStr, set: setMotionStr, color: "#f59e0b" },
        { label: "Identity lock", val: idLock,    set: setIdLock,    color: "#6366f1" },
        { label: "Мимика",        val: mimicry,   set: setMimicry,   color: "#ec4899" },
        { label: "Камера",        val: camSim,    set: setCamSim,    color: "#10b981" }].map((ctrl) =>
        <div key={ctrl.label}>
          <div className="flex justify-between mb-1">
            <label className="text-[9px] font-semibold" style={{ color: "var(--proto-text-lo)" }}>{ctrl.label}</label>
            <span className="text-[9px] font-bold" style={{ color: ctrl.color }}>{ctrl.val}%</span>
          </div>
          <input type="range" min={0} max={100} value={ctrl.val} onChange={(e) => ctrl.set(+e.target.value)} className="w-full h-1 rounded-full cursor-pointer" style={{ accentColor: ctrl.color }} />
        </div>
        )}
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "var(--proto-text-lo)" }}>3. Качество рендера</label>
        <div className="grid grid-cols-2 gap-1.5">
          {(["preview", "final"] as const).map((q) =>
          <button key={q} onClick={() => setQuality(q)} className="py-2 rounded-xl text-[10px] font-semibold cursor-pointer flex flex-col items-center gap-0.5"
          style={{ background: quality === q ? (q === "preview" ? "var(--proto-blue-bg)" : "var(--proto-amber-bg)") : "var(--proto-card-bg-2)", border: quality === q ? (q === "preview" ? "1px solid var(--proto-blue-border-3)" : "1px solid var(--proto-amber-border)") : "1px solid var(--proto-card-border-2)", color: quality === q ? (q === "preview" ? "#93c5fd" : "#fcd34d") : "var(--proto-text-lo)" }}>
            <span>{q === "preview" ? "Preview HD" : "Final 4K"}</span>
            <span className="text-[8px] font-normal">{COSTS[q]} кр</span>
          </button>
          )}
        </div>
      </div>
      {loading || done ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: "var(--proto-text-lo)" }}>{loading ? "Kling 3.0 переносит движения..." : "Motion перенесён"}</span>
            <span className="text-[10px] font-bold text-amber-400">{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={Math.min(progress, 100)} color="linear-gradient(90deg,#d97706,#f59e0b,#fcd34d)" animated={loading} />
          {done && <>
            <div className="rounded-xl p-2.5" style={{ background: "var(--proto-green-bg)", border: "1px solid var(--proto-green-border)" }}>
              <div className="text-[9px] text-green-400 font-semibold mb-0.5">✓ Motion control завершён</div>
              <div className="text-[8px]" style={{ color: "var(--proto-text-dim)" }}>{influencer} · Сила {motionStr}% · ID lock {idLock}%</div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {["MP4 / HD", "MP4 / 4K", "В галерею"].map((fmt) =>
              <button key={fmt} className="py-1.5 rounded-lg text-[9px] font-medium cursor-pointer flex items-center justify-center gap-1"
              style={{ background: "var(--proto-btn-ghost-bg)", border: "1px solid var(--proto-blue-border)", color: "#60a5fa" }}><Download size={8} />{fmt}</button>
              )}
            </div>
          </>}
        </div>
      ) : (
        <CostBar points={cost} label={!uploaded || !influencer ? "Загрузите видео и выберите инфлюенсера" : "Применить Motion"} onConfirm={handleRun} loading={loading || !uploaded || !influencer} />
      )}
    </div>);
}

// ─── SIDEBAR NAV ──────────────────────────────────────────────────────────────
type NavItem = {id: Screen;label: string;icon: React.ReactNode;group?: string;};
const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Дашборд",    icon: <LayoutDashboard size={11} /> },
  { id: "brief",     label: "Бренд-бриф", icon: <FolderOpen size={11} />,     group: "ПРОЕКТ"    },
  { id: "character", label: "Персонаж",   icon: <User size={11} />,            group: "ПРОЕКТ"    },
  { id: "photo",     label: "Фото",       icon: <Image size={11} />,           group: "ГЕНЕРАЦИЯ" },
  { id: "video",     label: "Видео",      icon: <Video size={11} />,           group: "ГЕНЕРАЦИЯ" },
  { id: "motion",    label: "Motion",     icon: <Film size={11} />,            group: "ГЕНЕРАЦИЯ" },
];

const SCREEN_COLORS: Record<Screen, string> = {
  dashboard: "#3b82f6", brief: "#6366f1", character: "#8b5cf6",
  photo: "#3b82f6", video: "#ec4899", motion: "#f59e0b", results: "#10b981"
};

const SCREEN_TITLES: Record<Screen, {title: string;sub: string;}> = {
  dashboard: { title: "Дашборд",         sub: "Баланс · Проекты · История" },
  brief:     { title: "Бренд-бриф",      sub: "Параметры проекта" },
  character: { title: "Создать персонажа", sub: "Guided · Prompt · Hybrid" },
  photo:     { title: "Генерация фото",  sub: "Guided · Prompt · Hybrid" },
  video:     { title: "Видео по тренду", sub: "Kling 3.0 · identity lock" },
  motion:    { title: "Motion Control",  sub: "Перенос движений · Kling 3.0" },
  results:   { title: "Результаты",      sub: "Медиатека проекта" },
};

// ─── APP PROTOTYPE ────────────────────────────────────────────────────────────
function AppPrototype() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [points, setPoints] = useState(4850);
  const [screenKey, setScreenKey] = useState(0);

  const navigate = (s: Screen) => {setScreen(s); setScreenKey((k) => k + 1);};
  const deductPoints = (n: number) => setPoints((p) => Math.max(0, p - n));

  const color = SCREEN_COLORS[screen];
  const meta = SCREEN_TITLES[screen];
  const pointColor = points > 3000 ? POINT_COLORS.low : points > 1000 ? POINT_COLORS.mid : POINT_COLORS.high;

  return (
    <div className="w-full rounded-2xl overflow-hidden"
    style={{ background: "var(--proto-shell)", border: "1px solid var(--proto-shell-border)", boxShadow: "var(--proto-shell-shadow)" }}>

      {/* ── Browser bar ── */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0"
      style={{ background: "var(--proto-bar-bg)", borderColor: "var(--proto-bar-border)" }}>
        <div className="flex gap-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
          <div className="w-2 h-2 rounded-full" style={{ background: "#f59e0b" }} />
          <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
        </div>
        <div className="flex-1 min-w-0 mx-2">
          <div className="rounded-md px-2 py-0.5 text-[10px] max-w-xs mx-auto text-center font-mono truncate"
          style={{ background: "var(--proto-bar-url-bg)", border: "1px solid var(--proto-bar-url-border)", color: "var(--proto-bar-url-color)" }}>
            app.kovalabs.ai/{screen === "dashboard" ? "dashboard" : `studio/${screen}`}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Search */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: "var(--proto-bar-url-bg)", border: "1px solid var(--proto-bar-url-border)" }}>
            <Search size={8} style={{ color: "var(--proto-text-dim)" }} />
            <span className="text-[9px]" style={{ color: "var(--proto-text-dim)" }}>Поиск...</span>
          </div>
          {/* Balance */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "var(--proto-blue-bg)", border: "1px solid var(--proto-blue-border)" }}>
            <Zap size={9} style={{ color: pointColor }} />
            <span className="text-[10px] font-bold" style={{ color: pointColor }}>{points.toLocaleString()} кр</span>
          </div>
          {/* Beta badge */}
          <div className="relative flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "var(--proto-indigo-bg-2)", border: "1px solid var(--proto-indigo-border-2)" }}>
            <span className="relative flex-shrink-0" style={{ width: 8, height: 8 }}>
              <span className="ping-dot" style={{ background: "#22c55e" }} />
              <span className="status-dot" style={{ background: "#22c55e" }} />
            </span>
            <span className="text-[9px] font-semibold" style={{ color: "#a78bfa" }}>BETA</span>
          </div>
          {/* Bell */}
          <button className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "var(--proto-card-bg-3)" }}>
            <Bell size={9} style={{ color: "var(--proto-text-lo)" }} />
          </button>
          {/* Profile */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md cursor-pointer" style={{ background: "var(--proto-card-bg-3)", border: "1px solid var(--proto-card-border-2)" }}>
            <div className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold" style={{ background: "linear-gradient(135deg,#2563eb,#6366f1)", color: "white" }}>М</div>
            <span className="text-[8px] font-medium hidden sm:block" style={{ color: "var(--proto-text-mid)" }}>MyBrand</span>
          </div>
        </div>
      </div>

      {/* ── Mobile nav ── */}
      <div className="flex sm:hidden border-b overflow-x-auto scrollbar-none" style={{ borderColor: "var(--proto-header-border)", background: "var(--proto-nav-bg)" }}>
        {NAV_ITEMS.map((n) =>
        <button key={n.id} onClick={() => navigate(n.id)} className="flex-shrink-0 flex items-center gap-1 px-3 py-2 text-[9px] font-medium cursor-pointer whitespace-nowrap"
        style={{ color: screen === n.id ? "#93c5fd" : "var(--proto-text-dim)", borderBottom: screen === n.id ? `2px solid ${SCREEN_COLORS[n.id]}` : "2px solid transparent", background: screen === n.id ? "var(--proto-blue-bg-2)" : "transparent" }}>
          <span style={{ color: screen === n.id ? SCREEN_COLORS[n.id] : "var(--proto-text-dim)" }}>{n.icon}</span>
          {n.label}
        </button>
        )}
      </div>

      {/* ── Main layout ── */}
      <div className="flex" style={{ minHeight: 0 }}>
        {/* Sidebar */}
        <div className="hidden sm:flex flex-col border-r flex-shrink-0"
        style={{ background: "var(--proto-sidebar-bg)", borderColor: "var(--proto-sidebar-border)", width: 116 }}>
          {/* User info */}
          <div className="px-2.5 pt-3 pb-2 border-b" style={{ borderColor: "var(--proto-header-border)" }}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs" style={{ background: "linear-gradient(135deg,#2563eb,#6366f1)", color: "white" }}>М</div>
              <span className="text-[10px] font-semibold truncate" style={{ color: "var(--proto-text-hi)" }}>MyBrand</span>
            </div>
            <div className="text-[8px] truncate" style={{ color: "var(--proto-text-dim)" }}>Free · 2 проекта</div>
          </div>

          {/* Nav groups */}
          <nav className="flex-1 px-1.5 py-2 space-y-0.5 overflow-hidden">
            {["", "ПРОЕКТ", "ГЕНЕРАЦИЯ"].map((group) =>
            <div key={group}>
              {group && <div className="text-[8px] uppercase tracking-wider font-semibold px-1.5 pt-2 pb-0.5" style={{ color: "var(--proto-text-dimmer)" }}>{group}</div>}
              {NAV_ITEMS.filter((n) => (n.group ?? "") === group).map((n) =>
              <button key={n.id} onClick={() => navigate(n.id)} className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium cursor-pointer"
              style={{ background: screen === n.id ? "var(--proto-blue-bg-3)" : "transparent", border: screen === n.id ? `1px solid ${SCREEN_COLORS[n.id]}30` : "1px solid transparent", color: screen === n.id ? "#93c5fd" : "var(--proto-text-dim)", transition: "all 150ms" }}>
                <span style={{ color: screen === n.id ? SCREEN_COLORS[n.id] : "var(--proto-text-dimmer)", flexShrink: 0 }}>{n.icon}</span>
                <span className="truncate">{n.label}</span>
              </button>
              )}
            </div>
            )}
          </nav>

          {/* Settings + Master ID */}
          <div className="px-2 pb-3 space-y-1.5">
            <button className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] cursor-pointer" style={{ color: "var(--proto-text-dim)", border: "1px solid transparent" }}>
              <Settings size={9} style={{ color: "var(--proto-text-dimmer)" }} />
              Настройки
            </button>
            <div className="rounded-xl p-2" style={{ background: "var(--proto-green-bg)", border: "1px solid var(--proto-green-border)" }}>
              <div className="flex items-center gap-1 mb-0.5">
                <Package size={9} className="text-green-400 flex-shrink-0" />
                <span className="text-[8px] text-green-400 font-semibold truncate">Master ID</span>
              </div>
              <div className="text-[8px] truncate" style={{ color: "var(--proto-text-dim)" }}>Nova v3 · active</div>
            </div>
          </div>
        </div>

        {/* ── Content area ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Inner header */}
          <div className="px-3 sm:px-4 pt-3 pb-2.5 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: "var(--proto-header-border)" }}>
            <div className="min-w-0">
              <h3 className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: "var(--proto-text-hi)" }}>{meta.title}</h3>
              <p className="text-[9px] truncate hidden sm:block" style={{ color: "var(--proto-text-dim)" }}>{meta.sub}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
              <span className="text-[8px] hidden sm:block" style={{ color: "var(--proto-text-dim)" }}>live</span>
            </div>
          </div>

          {/* Screen content */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3" style={{ maxHeight: 420, minHeight: 300 }}>
            <div key={screenKey} style={{ animation: "fadeSlideIn 0.16s ease-out" }}>
              {screen === "dashboard" && <DashboardScreen onNav={navigate} points={points} />}
              {screen === "brief"     && <BriefScreen onNav={navigate} />}
              {screen === "character" && <CharacterScreen onNav={navigate} onDeductPoints={deductPoints} />}
              {screen === "photo"     && <PhotoScreen onNav={navigate} onDeductPoints={deductPoints} />}
              {screen === "video"     && <VideoScreen onNav={navigate} onDeductPoints={deductPoints} />}
              {screen === "motion"    && <MotionScreen onNav={navigate} onDeductPoints={deductPoints} />}
            </div>
          </div>
        </div>
      </div>
    </div>);
}

// ─── HERO FORM TRIGGER ───────────────────────────────────────────────────────
function HeroFormTrigger({ onOpen }: { onOpen: (email: string) => void }) {
  const [draftEmail, setDraftEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFocus = () => { inputRef.current?.blur(); onOpen(draftEmail); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onOpen(draftEmail); };
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 p-1.5 rounded-2xl"
        style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)", boxShadow: "0 0 0 1px rgba(37,99,235,0.08), 0 8px 32px rgba(0,0,0,0.2)" }}>
        <input ref={inputRef} type="email" value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} onFocus={handleFocus}
          placeholder="your@email.com" className="flex-1 outline-none bg-transparent px-3 py-2.5 text-sm" style={{ color: "var(--dfl-text-hi)" }}
          autoComplete="email" readOnly />
        <button type="submit" className="btn-primary whitespace-nowrap px-5 py-2.5 rounded-xl text-sm">
          Получить доступ <ArrowRight size={15} />
        </button>
      </div>
      {/* Юридическое примечание — согласие фиксируется в полной форме overlay (152-ФЗ) */}
      <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--dfl-text-placeholder)" }}>
        Нажимая кнопку, вы переходите к форме, где подтверждаете согласие с{" "}
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors duration-150"
          style={{ color: "var(--dfl-text-subtle)" }}
          onClick={(e) => e.stopPropagation()}>
          Политикой конфиденциальности
        </a>{" "}и{" "}
        <a href="/consent" target="_blank" rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors duration-150"
          style={{ color: "var(--dfl-text-subtle)" }}
          onClick={(e) => e.stopPropagation()}>
          обработкой персональных данных
        </a>.
      </p>
    </form>);
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────
interface HeroSectionProps {
  onOpenOverlay?: (email?: string) => void;
}

export default function HeroSection({ onOpenOverlay }: HeroSectionProps) {
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const openOverlay = useCallback((email: string) => {
    if (onOpenOverlay) onOpenOverlay(email);
    else window.dispatchEvent(new Event("open-waitlist-overlay"));
  }, [onOpenOverlay]);

  useEffect(() => {
    const els = [eyebrowRef.current, headlineRef.current, formRef.current];
    const delays = [0, 150, 300];
    els.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = "0"; el.style.transform = "translateY(20px)";
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) { el.style.opacity = "1"; el.style.transform = "none"; return; }
      setTimeout(() => {
        if (el) {
          el.style.transition = "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)";
          el.style.opacity = "1"; el.style.transform = "translateY(0)";
        }
      }, delays[i]);
    });
  }, []);

  const scrollToHowItWorks = () => {
    const el = document.querySelector("#how-it-works");
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center pt-20 sm:pt-24 pb-4 sm:pb-8 overflow-hidden">
      <ParticlesCanvas />
      <div className="hero-bg-glow" />
      <div className="hero-bg-glow-2" />
      <div className="absolute inset-0 opacity-[0.022] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(37,99,235,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.8) 1px, transparent 1px)`,
        backgroundSize: "80px 80px"
      }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col">
            <div ref={eyebrowRef} className="flex mb-5 sm:mb-6">
              <div className="section-label text-[10px] sm:text-xs gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 sm:w-3 sm:h-3 flex-shrink-0" />
                <span>AI‑платформа для создания инфлюенсера</span>
              </div>
            </div>
            <h1 ref={headlineRef} className="font-display font-bold leading-tight mb-4">
              <span className="block shimmer-text" style={{ fontSize: "clamp(1.9rem, 4vw, 3.5rem)", lineHeight: 1.08 }}>Создайте собственного</span>
              <span className="block shimmer-text" style={{ fontSize: "clamp(1.9rem, 4vw, 3.5rem)", lineHeight: 1.08 }}>AI-инфлюенсера</span>
            </h1>
            <p className="leading-relaxed mb-3 max-w-lg" style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)", color: "var(--dfl-text-lo)" }}>
              Платформа, где бренд создаёт своего AI-персонажа один раз — а затем системно генерирует с ним фото и видео через управляемый интерфейс или промпт.
            </p>
            <p className="font-display font-semibold mb-8 h-7" style={{ fontSize: "clamp(0.9rem, 1.4vw, 0.98rem)", color: "var(--dfl-accent-bright)" }}>
              <TypewriterText />
            </p>
            <div ref={formRef} className="w-full mb-4">
              <HeroFormTrigger onOpen={openOverlay} />
            </div>
            <div className="flex mb-8">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium flex-wrap"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", color: "var(--dfl-text-lo)" }}>
                <span className="relative flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: "#22c55e" }} />
                  <span style={{ color: "#22c55e", fontWeight: 600 }}>Бета · запуск скоро</span>
                </span>
                <span style={{ color: "var(--dfl-text-placeholder)" }}>— ранний доступ открыт</span>
              </div>
            </div>
            <div className="flex lg:hidden justify-center">
              <button onClick={scrollToHowItWorks} className="flex flex-col items-center gap-2 transition-colors duration-200 group" style={{ color: "var(--dfl-text-subtle)" }}>
                <span className="text-sm">Как это работает</span>
                <ChevronDown size={20} className="animate-bounce group-hover:text-blue-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN: prototype ── */}
          <div className="relative w-full">
            <div className="absolute inset-0 -top-8 bg-[#2563eb] opacity-[0.06] blur-3xl rounded-full pointer-events-none" />
            {/* Floating badge left */}
            <div className="absolute -top-4 -left-3 sm:-left-6 z-10 animate-float hidden sm:block">
              <div className="glass-card rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2 font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                  <span className="text-xs whitespace-nowrap" style={{ color: "var(--dfl-text-hi)" }}>Master Identity Pack</span>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--dfl-text-subtle)" }}>Nova_v3 · face lock · active</p>
              </div>
            </div>
            {/* Floating badge right */}
            <div className="absolute -top-4 -right-3 sm:-right-6 z-10 animate-float-delayed hidden sm:block">
              <div className="glass-card rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2 font-medium">
                  <Zap size={10} className="text-blue-400 flex-shrink-0" />
                  <span className="text-xs whitespace-nowrap" style={{ color: "var(--dfl-text-hi)" }}>4 850 кредитов</span>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--dfl-text-subtle)" }}>Баланс · каждое действие прозрачно</p>
              </div>
            </div>
            <TiltWrapper>
              <div className="w-full overflow-hidden">
                <AppPrototype />
              </div>
            </TiltWrapper>
          </div>
        </div>

        {/* Scroll hint desktop */}
        <div className="hidden lg:flex justify-center mt-6">
          <button onClick={scrollToHowItWorks} className="flex flex-col items-center gap-2 transition-colors duration-200 group" style={{ color: "var(--dfl-text-subtle)" }}>
            <span className="text-sm">Как это работает</span>
            <ChevronDown size={20} className="animate-bounce group-hover:text-blue-400 transition-colors" />
          </button>
        </div>
      </div>
    </section>);
}
