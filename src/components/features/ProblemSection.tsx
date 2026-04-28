import { useState, useRef, useEffect } from "react";

const problems = [
  {
    id: "dependency",
    title: "Зависимость от инфлюенсеров",
    description:
      "Бренды отдают контроль над своим визуальным образом третьим лицам. Условия, цены и доступность диктует рынок, а не вы.",
    accent: "#ef4444",
    scene: "chain",
  },
  {
    id: "production",
    title: "Дорогостоящие съёмки",
    description:
      "Каждая кампания требует логистики, стилистов, локаций и бюджетов. Скорость выхода контента ограничена производственным циклом.",
    accent: "#f59e0b",
    scene: "camera",
  },
  {
    id: "scale",
    title: "Низкая масштабируемость",
    description:
      "Физические ограничения делают быстрое тестирование идей невозможным. Один съёмочный день — одна идея. Без итераций.",
    accent: "#8b5cf6",
    scene: "layers",
  },
  {
    id: "brand",
    title: "Непоследовательный образ",
    description:
      "Разные авторы, разные стили, разная интерпретация бренда. Визуальная идентичность размывается на каждом канале.",
    accent: "#ec4899",
    scene: "shatter",
  },
];

// ── Scene: broken chain links ────────────────────────────────────────────────
function ChainScene({ active }: { active: boolean }) {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="select-none">
      <defs>
        <linearGradient id="chain-grad-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
        <filter id="chain-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Chain link top */}
      <g
        filter="url(#chain-glow)"
        style={{
          transform: active ? "translate(0px, -5px) rotate(-12deg)" : "translate(0,0) rotate(0deg)",
          transformOrigin: "48px 32px",
          transition: "transform 500ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <rect x="26" y="14" width="44" height="26" rx="13" stroke="url(#chain-grad-a)" strokeWidth="5" fill="none" opacity="0.9" />
        <rect x="36" y="20" width="24" height="14" rx="7" fill="rgba(239,68,68,0.15)" />
      </g>
      {/* Break gap — sparks */}
      {active && (
        <>
          <circle cx="40" cy="51" r="2.5" fill="#fbbf24" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0;0.9" dur="0.6s" repeatCount="indefinite" />
            <animate attributeName="r" values="2.5;4;2.5" dur="0.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="56" cy="49" r="1.8" fill="#ef4444" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.1;0.8" dur="0.45s" repeatCount="indefinite" />
          </circle>
          <circle cx="48" cy="53" r="1.5" fill="#fca5a5" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.1;0.7" dur="0.8s" repeatCount="indefinite" />
          </circle>
          <line x1="44" y1="50" x2="52" y2="50" stroke="#fbbf24" strokeWidth="2" strokeDasharray="2 3" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0;0.6" dur="0.5s" repeatCount="indefinite" />
          </line>
        </>
      )}
      {/* Chain link bottom */}
      <g
        filter="url(#chain-glow)"
        style={{
          transform: active ? "translate(0px, 5px) rotate(12deg)" : "translate(0,0) rotate(0deg)",
          transformOrigin: "48px 70px",
          transition: "transform 500ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <rect x="26" y="58" width="44" height="26" rx="13" stroke="url(#chain-grad-a)" strokeWidth="5" fill="none" opacity="0.7" />
        <rect x="36" y="64" width="24" height="14" rx="7" fill="rgba(239,68,68,0.1)" />
      </g>
      {/* Crack line center */}
      <line
        x1="35" y1="48" x2="61" y2="52"
        stroke="#ef4444"
        strokeWidth="2.5"
        strokeDasharray="4 3"
        opacity={active ? 0.9 : 0.4}
        style={{ transition: "opacity 300ms" }}
      />
    </svg>
  );
}

// ── Scene: film camera ───────────────────────────────────────────────────────
function CameraScene({ active }: { active: boolean }) {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="select-none">
      <defs>
        <linearGradient id="cam-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="cam-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Camera body */}
      <g
        filter="url(#cam-glow)"
        style={{
          transformOrigin: "48px 52px",
          transform: active ? "scale(1.06)" : "scale(1)",
          transition: "transform 400ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <rect x="14" y="38" width="52" height="34" rx="6" stroke="url(#cam-grad)" strokeWidth="3.5" fill="rgba(245,158,11,0.08)" />
        {/* Lens circle */}
        <circle cx="44" cy="55" r="13" stroke="url(#cam-grad)" strokeWidth="3" fill="rgba(245,158,11,0.05)" />
        <circle cx="44" cy="55" r="7" stroke="rgba(253,230,138,0.5)" strokeWidth="1.5" fill="rgba(245,158,11,0.12)" />
        <circle cx="44" cy="55" r="3" fill="rgba(253,230,138,0.35)" />
        {/* Viewfinder bump */}
        <rect x="38" y="28" width="22" height="12" rx="4" stroke="url(#cam-grad)" strokeWidth="2.5" fill="rgba(245,158,11,0.07)" />
        {/* Film reel right */}
        <circle cx="73" cy="55" r="9" stroke="url(#cam-grad)" strokeWidth="2.5" fill="rgba(245,158,11,0.06)"
          style={{
            transform: active ? "rotate(360deg)" : "rotate(0deg)",
            transformOrigin: "73px 55px",
            transition: active ? "transform 1.2s linear" : "transform 0.4s",
          }}
        />
        <circle cx="73" cy="55" r="3" fill="rgba(245,158,11,0.3)" />
        <line x1="73" y1="46" x2="73" y2="64" stroke="rgba(253,230,138,0.4)" strokeWidth="1.5" />
        <line x1="64" y1="55" x2="82" y2="55" stroke="rgba(253,230,138,0.4)" strokeWidth="1.5" />
      </g>
      {/* Dollar signs floating up on active */}
      {active && (
        <>
          <text x="16" y="34" fontSize="11" fill="#fbbf24" opacity="0.85" style={{ animation: "problemFloat 1.2s ease-out infinite" }}>$</text>
          <text x="62" y="28" fontSize="10" fill="#fbbf24" opacity="0.7" style={{ animation: "problemFloat 1.5s ease-out 0.3s infinite" }}>$</text>
          <text x="28" y="22" fontSize="9" fill="#fde68a" opacity="0.6" style={{ animation: "problemFloat 1.8s ease-out 0.6s infinite" }}>$</text>
        </>
      )}
    </svg>
  );
}

// ── Scene: stacked layers ────────────────────────────────────────────────────
function LayersScene({ active }: { active: boolean }) {
  const layers = [
    { y: 0, color: "#a78bfa", opacity: 0.9 },
    { y: 12, color: "#8b5cf6", opacity: 0.75 },
    { y: 24, color: "#7c3aed", opacity: 0.55 },
  ];

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="select-none">
      <defs>
        <linearGradient id="layer-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <filter id="layer-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter="url(#layer-glow)">
        {layers.map((l, i) => (
          <g
            key={i}
            style={{
              transform: active
                ? `translateY(${i === 0 ? -10 : i === 1 ? 0 : 10}px)`
                : `translateY(0px)`,
              transformOrigin: "48px 48px",
              transition: `transform ${400 + i * 80}ms cubic-bezier(0.34,1.56,0.64,1)`,
            }}
          >
            {/* Card shape */}
            <rect
              x="18"
              y={28 + l.y}
              width="60"
              height="26"
              rx="7"
              stroke={l.color}
              strokeWidth="3"
              fill={`${l.color}14`}
              opacity={l.opacity}
            />
            {/* Fake content lines */}
            <rect x="26" y={36 + l.y} width="28" height="3" rx="1.5" fill={l.color} opacity={l.opacity * 0.6} />
            <rect x="26" y={42 + l.y} width="16" height="2.5" rx="1.25" fill={l.color} opacity={l.opacity * 0.35} />
            {/* Right accent dot */}
            <circle cx="68" cy={41 + l.y} r="4" fill={l.color} opacity={l.opacity * 0.5} />
          </g>
        ))}
        {/* Lock icon in center when not active */}
        {!active && (
          <g opacity="0.6" style={{ transition: "opacity 300ms" }}>
            <rect x="42" y="44" width="12" height="10" rx="2" stroke="#a78bfa" strokeWidth="2" fill="rgba(139,92,246,0.15)" />
            <path d="M44 44v-3a4 4 0 018 0v3" stroke="#a78bfa" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="48" cy="49" r="1.5" fill="#c4b5fd" />
          </g>
        )}
        {active && (
          <g opacity="0.8">
            <path d="M42 50 L48 44 L54 50" stroke="#c4b5fd" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M48 44 L48 56" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  );
}

// ── Scene: shattered screen ──────────────────────────────────────────────────
function ShatterScene({ active }: { active: boolean }) {
  const shards = [
    { points: "28,30 52,28 48,52 26,50", color: "#f9a8d4", tx: active ? -6 : 0, ty: active ? -5 : 0, rot: active ? -8 : 0 },
    { points: "52,28 70,32 66,50 48,52", color: "#ec4899", tx: active ? 5 : 0, ty: active ? -4 : 0, rot: active ? 7 : 0 },
    { points: "26,50 48,52 44,68 24,64", color: "#db2777", tx: active ? -7 : 0, ty: active ? 6 : 0, rot: active ? -6 : 0 },
    { points: "48,52 66,50 70,68 46,70", color: "#f472b6", tx: active ? 6 : 0, ty: active ? 7 : 0, rot: active ? 9 : 0 },
  ];

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="select-none">
      <defs>
        <filter id="shard-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Screen frame */}
      <rect
        x="20"
        y="24"
        width="56"
        height="50"
        rx="6"
        stroke="rgba(236,72,153,0.35)"
        strokeWidth="2.5"
        fill="none"
        style={{
          transition: "stroke-opacity 300ms",
        }}
      />
      {/* Shards */}
      <g filter="url(#shard-glow)">
        {shards.map((s, i) => (
          <polygon
            key={i}
            points={s.points}
            fill={`${s.color}22`}
            stroke={s.color}
            strokeWidth="2"
            style={{
              transform: `translate(${s.tx}px, ${s.ty}px) rotate(${s.rot}deg)`,
              transformOrigin: "48px 49px",
              transition: `transform ${350 + i * 60}ms cubic-bezier(0.34,1.56,0.64,1)`,
              opacity: 0.9,
            }}
          />
        ))}
      </g>
      {/* Crack lines */}
      <g opacity={active ? 1 : 0.5} style={{ transition: "opacity 300ms" }}>
        <line x1="48" y1="28" x2="48" y2="70" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
        <line x1="24" y1="50" x2="72" y2="50" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
        <line x1="28" y1="30" x2="70" y2="68" stroke="#f9a8d4" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
      </g>
      {/* Emoji fragments floating off */}
      {active && (
        <>
          <text x="14" y="26" fontSize="12" opacity="0.7" style={{ animation: "problemFloat 1s ease-out infinite" }}>😶</text>
          <text x="70" y="24" fontSize="11" opacity="0.6" style={{ animation: "problemFloat 1.3s ease-out 0.2s infinite" }}>🎭</text>
          <text x="68" y="78" fontSize="10" opacity="0.5" style={{ animation: "problemFloat 1.6s ease-out 0.5s infinite" }}>🖼️</text>
        </>
      )}
    </svg>
  );
}

// ── Problem Card ─────────────────────────────────────────────────────────────
function ProblemCard({ problem }: { problem: typeof problems[0] }) {
  const [active, setActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mousePos.current = { x, y };
    el.style.transform = `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    setActive(false);
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
  };

  const SceneComponent = {
    chain: ChainScene,
    camera: CameraScene,
    layers: LayersScene,
    shatter: ShatterScene,
  }[problem.scene];

  return (
    <div
      ref={cardRef}
      className="rounded-2xl p-5 sm:p-6 relative overflow-hidden group cursor-default"
      onMouseEnter={() => setActive(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: "var(--dfl-surface-1)",
        border: `1px solid var(--dfl-border-1)`,
        transition: "transform 350ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 350ms, border-color 300ms",
        willChange: active ? "transform" : "auto",
        boxShadow: active
          ? `0 24px 48px rgba(0,0,0,0.22), 0 0 0 1px ${problem.accent}33, 0 0 32px ${problem.accent}18`
          : "0 4px 16px rgba(0,0,0,0.1)",
        borderColor: active ? `${problem.accent}55` : "var(--dfl-border-1)",
      }}
    >
      {/* Animated bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "2px",
          width: "100%",
          background: `linear-gradient(90deg, ${problem.accent}, ${problem.accent}60)`,
          transform: active ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: `0 0 8px ${problem.accent}80`,
        }}
      />

      {/* Subtle background glow on hover */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 80% 50%, ${problem.accent}0D 0%, transparent 70%)`,
          opacity: active ? 1 : 0,
          transition: "opacity 400ms",
          pointerEvents: "none",
        }}
      />

      <div className="flex items-start gap-4 relative z-10">
        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-display font-semibold text-base mb-2 leading-snug"
            style={{
              color: "var(--dfl-text-hi)",
              transition: "color 300ms",
            }}
          >
            {problem.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
            {problem.description}
          </p>
        </div>

        {/* 3D Scene on the right */}
        <div
          className="flex-shrink-0 relative"
          style={{
            width: 88,
            height: 88,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Glow behind scene */}
          <div
            style={{
              position: "absolute",
              inset: 4,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${problem.accent}20 0%, transparent 70%)`,
              opacity: active ? 1 : 0.4,
              transition: "opacity 400ms",
              filter: "blur(6px)",
            }}
          />
          <div
            style={{
              transition: "transform 400ms cubic-bezier(0.34,1.56,0.64,1), filter 400ms",
              transform: active ? "scale(1.08)" : "scale(1)",
              filter: active ? `drop-shadow(0 0 8px ${problem.accent}60)` : "none",
            }}
          >
            <SceneComponent active={active} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────
export default function ProblemSection() {
  return (
    <section id="problem" className="section-wrapper">
      <style>{`
        @keyframes problemFloat {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-18px); opacity: 0; }
        }
      `}</style>
      <div className="glow-line" />
      <div className="container-tight">
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-5">Проблема</div>
          <h2
            className="font-display font-bold mb-5"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              color: "var(--dfl-text-hi)",
            }}
          >
            Почему традиционный подход к контенту больше не работает
          </h2>
          <p className="max-w-xl mx-auto leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
            Бренды, проекты и личные инфлюенсеры сталкиваются с одними и теми же барьерами:
            скорость, стоимость и зависимость от людей.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>

        {/* Transition to solution */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "var(--dfl-accent-muted-2)",
            border: "1px solid var(--dfl-border-2)",
          }}
        >
          <p
            className="font-display font-semibold leading-snug"
            style={{
              fontSize: "clamp(1.05rem, 2vw, 1.35rem)",
              color: "var(--dfl-text-hi)",
            }}
          >
            КовальЛабс убирает эти ограничения —
            <span className="text-accent-gradient">
              {" "}AI‑инфлюенсер становится цифровым активом, а не зависимостью от людей.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
