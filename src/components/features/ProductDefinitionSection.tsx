import { useState, useRef, useEffect } from "react";

const cards = [
  {
    id: "avatar",
    title: "Ваш собственный AI-инфлюенсер",
    description:
      "Создаёте персонажа один раз — и получаете цифровой актив, который работает в любом контенте и кампании без пересборки.",
    accent: "#3b82f6",
    dot: "#60a5fa",
  },
  {
    id: "content",
    title: "Фото и видео из одной системы",
    description:
      "Генерируйте фотографии, трендовые короткие видео и motion-control ролики — всё в одном рабочем пространстве.",
    accent: "#8b5cf6",
    dot: "#a78bfa",
  },
  {
    id: "control",
    title: "Контроль и масштаб",
    description:
      "Без зависимости от авторов и съёмок. Вы управляете внешностью, стилем и контентом полностью самостоятельно.",
    accent: "#10b981",
    dot: "#34d399",
  },
];

// ── Central 3D AI identity scene ─────────────────────────────────────────────
function AIIdentityScene({ hovered }: { hovered: boolean }) {
  return (
    <svg
      viewBox="0 0 380 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full select-none"
      style={{ maxWidth: 380, maxHeight: 420, overflow: "visible" }}
    >
      <defs>
        <radialGradient id="pd-face-glow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
          <stop offset="60%" stopColor="#6366f1" stopOpacity="0.08" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pd-avatar-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="pd-dna-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="pd-dna-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="pd-photo-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--pd-card-photo-a)" />
          <stop offset="100%" stopColor="var(--pd-card-photo-b)" />
        </linearGradient>
        <linearGradient id="pd-video-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--pd-card-video-a)" />
          <stop offset="100%" stopColor="var(--pd-card-video-b)" />
        </linearGradient>
        <linearGradient id="pd-motion-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--pd-card-motion-a)" />
          <stop offset="100%" stopColor="var(--pd-card-motion-b)" />
        </linearGradient>
        <filter id="pd-main-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="pd-card-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="pd-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="pd-avatar-clip">
          <circle cx="190" cy="175" r="68" />
        </clipPath>
      </defs>

      {/* ── Background ambient glow ── */}
      <ellipse cx="190" cy="210" rx="160" ry="140" fill="url(#pd-face-glow)" />

      {/* ── Orbit rings — pure 2D ellipses that rotate via animateTransform ── */}
      {/* Outer orbit ring */}
      <ellipse
        cx="190" cy="200"
        rx="155" ry="42"
        stroke="rgba(99,102,241,0.22)"
        strokeWidth="1.2"
        fill="none"
        strokeDasharray="6 4"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 190 200"
          to="360 190 200"
          dur="18s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Middle orbit ring */}
      <ellipse
        cx="190" cy="192"
        rx="118" ry="32"
        stroke="rgba(139,92,246,0.28)"
        strokeWidth="1"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 190 192"
          to="-360 190 192"
          dur="12s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Inner orbit ring */}
      <ellipse
        cx="190" cy="185"
        rx="84" ry="22"
        stroke="rgba(59,130,246,0.32)"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="3 5"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 190 185"
          to="360 190 185"
          dur="8s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* ── DNA / identity strands ── */}
      <g opacity={hovered ? 0.85 : 0.55} style={{ transition: "opacity 500ms" }}>
        <path
          d="M 60 80 C 75 110, 50 140, 68 170 C 85 200, 58 230, 72 260"
          stroke="url(#pd-dna-a)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 80 80 C 65 110, 88 140, 70 170 C 52 200, 78 230, 60 260"
          stroke="url(#pd-dna-b)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="4 3"
        />
        {[100, 130, 160, 190, 220].map((y, i) => (
          <line
            key={i}
            x1={60 + (i % 2 === 0 ? 4 : -4)}
            y1={y}
            x2={80 - (i % 2 === 0 ? 4 : -4)}
            y2={y}
            stroke="rgba(99,102,241,0.5)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        ))}
      </g>

      <g opacity={hovered ? 0.85 : 0.55} style={{ transition: "opacity 500ms" }}>
        <path
          d="M 300 80 C 315 110, 290 140, 308 170 C 325 200, 298 230, 312 260"
          stroke="url(#pd-dna-b)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 320 80 C 305 110, 328 140, 310 170 C 292 200, 318 230, 300 260"
          stroke="url(#pd-dna-a)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="4 3"
        />
        {[100, 130, 160, 190, 220].map((y, i) => (
          <line
            key={i}
            x1={300 + (i % 2 === 0 ? 4 : -4)}
            y1={y}
            x2={320 - (i % 2 === 0 ? 4 : -4)}
            y2={y}
            stroke="rgba(139,92,246,0.5)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* ── Avatar core ── */}
      <g filter="url(#pd-main-glow)">
        {/* Pulse ring — using SVG animate on r, not CSS */}
        <circle cx="190" cy="175" r="82" fill="none" stroke="rgba(99,102,241,0.18)" strokeWidth="1.5">
          <animate attributeName="r" values="80;88;80" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.15;0.5" dur="2.4s" repeatCount="indefinite" />
        </circle>

        {/* Accent ring */}
        <circle
          cx="190" cy="175" r="72"
          fill="none"
          stroke="url(#pd-avatar-ring)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={hovered ? "380 0" : "300 152"}
          strokeDashoffset="-30"
          style={{ transition: "stroke-dasharray 700ms cubic-bezier(0.16,1,0.3,1)" }}
        />

        {/* Inner fill */}
        <circle cx="190" cy="175" r="68" fill="var(--pd-avatar-fill)" />

        {/* Avatar face */}
        <text
          x="190" y="198"
          textAnchor="middle"
          fontSize="72"
          style={{
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transformOrigin: "190px 175px",
            transition: "transform 400ms cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          👩‍💼
        </text>

        {/* Identity lock badge */}
        <g style={{ transform: hovered ? "translateY(-3px)" : "translateY(0)", transition: "transform 400ms cubic-bezier(0.34,1.56,0.64,1)" }}>
          <rect x="140" y="228" width="100" height="22" rx="11"
            fill="rgba(37,99,235,0.25)" stroke="rgba(59,130,246,0.5)" strokeWidth="1" />
          <text x="190" y="243" textAnchor="middle" fontSize="9.5" fill="#93c5fd" fontWeight="700" letterSpacing="0.5">
            IDENTITY LOCK ✓
          </text>
        </g>
      </g>

      {/* ── Orbit dots — animated along ellipse paths ── */}
      <circle r="5" fill="#3b82f6" opacity="0.9" filter="url(#pd-soft-glow)">
        <animateMotion
          dur="12s"
          repeatCount="indefinite"
          path="M 190 160 m -118 0 a 118 32 0 1 1 236 0 a 118 32 0 1 1 -236 0"
        />
      </circle>
      <circle r="4" fill="#a78bfa" opacity="0.8" filter="url(#pd-soft-glow)">
        <animateMotion
          dur="8s"
          repeatCount="indefinite"
          begin="-4s"
          path="M 190 163 m -84 0 a 84 22 0 1 0 168 0 a 84 22 0 1 0 -168 0"
        />
      </circle>
      <circle r="3.5" fill="#34d399" opacity="0.85" filter="url(#pd-soft-glow)">
        <animateMotion
          dur="18s"
          repeatCount="indefinite"
          begin="-9s"
          path="M 190 158 m -155 0 a 155 42 0 1 1 310 0 a 155 42 0 1 1 -310 0"
        />
      </circle>

      {/* ── Floating content cards ── */}

      {/* Photo card — top left: wrapper for float, inner g for hover */}
      <g style={{ animation: "pdFloat 3.2s ease-in-out infinite" }}>
        <g
          filter="url(#pd-card-glow)"
          style={{
            transform: hovered ? "translate(-6px, -8px)" : "translate(0,0)",
            transformOrigin: "80px 82px",
            transition: "transform 500ms cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <rect x="22" y="52" width="116" height="60" rx="12"
            fill="url(#pd-photo-card)" stroke="rgba(59,130,246,0.45)" strokeWidth="1.2" />
          <rect x="30" y="60" width="34" height="34" rx="8"
            fill="rgba(37,99,235,0.2)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
          <text x="47" y="82" textAnchor="middle" fontSize="16">📷</text>
          <rect x="72" y="63" width="56" height="6" rx="3" fill="var(--pd-bar-hi)" />
          <rect x="72" y="73" width="40" height="5" rx="2.5" fill="var(--pd-bar-mid)" />
          <rect x="72" y="82" width="48" height="5" rx="2.5" fill="var(--pd-bar-lo)" />
          <rect x="30" y="98" width="38" height="10" rx="5"
            fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.4)" strokeWidth="0.8" />
          <text x="49" y="106.5" textAnchor="middle" fontSize="6.5" fill="#60a5fa" fontWeight="600">Фото ×320</text>
          <text x="126" y="106.5" textAnchor="middle" fontSize="7" fill="#4ade80" fontWeight="700">−80%</text>
        </g>
      </g>

      {/* Video card — top right */}
      <g style={{ animation: "pdFloat 2.8s ease-in-out 0.8s infinite" }}>
        <g
          filter="url(#pd-card-glow)"
          style={{
            transform: hovered ? "translate(6px, -6px)" : "translate(0,0)",
            transformOrigin: "300px 78px",
            transition: "transform 500ms cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <rect x="242" y="48" width="116" height="60" rx="12"
            fill="url(#pd-video-card)" stroke="rgba(139,92,246,0.45)" strokeWidth="1.2" />
          <rect x="250" y="56" width="34" height="34" rx="8"
            fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
          <text x="267" y="78" textAnchor="middle" fontSize="16">🎬</text>
          <rect x="292" y="59" width="56" height="6" rx="3" fill="var(--pd-bar-hi)" />
          <rect x="292" y="69" width="36" height="5" rx="2.5" fill="var(--pd-bar-mid)" />
          <rect x="292" y="78" width="50" height="5" rx="2.5" fill="var(--pd-bar-lo)" />
          <rect x="250" y="94" width="46" height="10" rx="5"
            fill="rgba(139,92,246,0.18)" stroke="rgba(139,92,246,0.4)" strokeWidth="0.8" />
          <text x="273" y="102.5" textAnchor="middle" fontSize="6.5" fill="#c4b5fd" fontWeight="600">Kling 3.0</text>
          <text x="340" y="102.5" textAnchor="middle" fontSize="7" fill="#f9a8d4" fontWeight="700">Reels</text>
        </g>
      </g>

      {/* Motion card — bottom center */}
      <g style={{ animation: "pdFloat 3.6s ease-in-out 1.6s infinite" }}>
        <g
          filter="url(#pd-card-glow)"
          style={{
            transform: hovered ? "translate(0, 8px)" : "translate(0,0)",
            transformOrigin: "190px 330px",
            transition: "transform 500ms cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <rect x="120" y="300" width="140" height="58" rx="12"
            fill="url(#pd-motion-card)" stroke="rgba(16,185,129,0.4)" strokeWidth="1.2" />
          <rect x="128" y="308" width="34" height="34" rx="8"
            fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.3)" strokeWidth="1" />
          <text x="145" y="330" textAnchor="middle" fontSize="16">🕺</text>
          <rect x="170" y="311" width="50" height="5" rx="2.5" fill="rgba(16,185,129,0.4)" />
          <rect x="170" y="320" width="38" height="5" rx="2.5" fill="rgba(16,185,129,0.25)" />
          <rect x="170" y="329" width="44" height="5" rx="2.5" fill="rgba(16,185,129,0.15)" />
          <rect x="128" y="346" width="58" height="9" rx="4.5"
            fill="rgba(16,185,129,0.18)" stroke="rgba(16,185,129,0.4)" strokeWidth="0.8" />
          <text x="157" y="353.5" textAnchor="middle" fontSize="6.5" fill="#34d399" fontWeight="600">Motion control</text>
          <text x="225" y="353.5" textAnchor="middle" fontSize="7" fill="#fcd34d" fontWeight="700">97%</text>
        </g>
      </g>

      {/* ── Scan lines across avatar ── */}
      <g clipPath="url(#pd-avatar-clip)" opacity={hovered ? 0.35 : 0.15} style={{ transition: "opacity 400ms" }}>
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={i}
            x1="122" y1={115 + i * 14}
            x2="258" y2={115 + i * 14}
            stroke="#60a5fa"
            strokeWidth="0.7"
            strokeDasharray="6 4"
            opacity={1 - i * 0.07}
          />
        ))}
      </g>

      {/* ── Animated scan line — using SVG animate on y1/y2 ── */}
      <g clipPath="url(#pd-avatar-clip)">
        <line x1="122" x2="258" stroke="rgba(96,165,250,0.7)" strokeWidth="1.5">
          <animate attributeName="y1" values="107;243;107" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="y2" values="107;243;107" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.4s" repeatCount="indefinite" />
        </line>
      </g>

      {/* ── Sparkle nodes on orbit intersections ── */}
      {[
        { cx: 72, cy: 175, color: "#60a5fa", begin: "0s" },
        { cx: 308, cy: 175, color: "#a78bfa", begin: "0.8s" },
        { cx: 190, cy: 148, color: "#34d399", begin: "1.6s" },
      ].map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r="4" fill={s.color} filter="url(#pd-soft-glow)">
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" begin={s.begin} repeatCount="indefinite" />
          <animate attributeName="r" values="4;2.5;4" dur="2s" begin={s.begin} repeatCount="indefinite" />
        </circle>
      ))}

      {/* ── Connection lines from avatar to cards ── */}
      <g opacity={hovered ? 0.5 : 0.2} style={{ transition: "opacity 400ms" }}>
        <line x1="138" y1="112" x2="90" y2="82" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="242" y1="112" x2="290" y2="78" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="190" y1="243" x2="190" y2="300" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
      </g>

      {/* ── Watermark text ── */}
      <text x="190" y="395" textAnchor="middle" fontSize="8" fill="var(--pd-watermark)" letterSpacing="1.5" fontWeight="600">
        КОВАЛЬЛАБС · MASTER IDENTITY
      </text>
    </svg>
  );
}

// ── Info card ────────────────────────────────────────────────────────────────
function InfoCard({ card, index }: { card: typeof cards[0]; index: number }) {
  const [active, setActive] = useState(false);

  return (
    <div
      className="relative rounded-2xl p-6 cursor-default overflow-hidden"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      style={{
        background: "var(--dfl-surface-1)",
        border: `1px solid ${active ? card.accent + "44" : "var(--dfl-border-1)"}`,
        boxShadow: active
          ? `0 20px 40px rgba(0,0,0,0.18), 0 0 0 1px ${card.accent}22, 0 0 30px ${card.accent}10`
          : "0 4px 16px rgba(0,0,0,0.08)",
        transform: active ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 350ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 350ms, border-color 300ms",
        willChange: "transform",
      }}
    >
      {/* Bg glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 0% 50%, ${card.accent}0C 0%, transparent 70%)`,
          opacity: active ? 1 : 0,
          transition: "opacity 400ms",
          pointerEvents: "none",
        }}
      />
      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0,
          height: "2px",
          width: "100%",
          background: `linear-gradient(90deg, ${card.accent}, ${card.accent}40)`,
          transform: active ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 400ms cubic-bezier(0.16,1,0.3,1)",
          boxShadow: `0 0 8px ${card.accent}80`,
        }}
      />
      {/* Number badge */}
      <div className="relative z-10 flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
          style={{
            background: active ? `${card.accent}18` : "var(--dfl-surface-2)",
            border: `1.5px solid ${active ? card.accent + "55" : "var(--dfl-border-1)"}`,
            color: active ? card.dot : "var(--dfl-text-subtle)",
            transition: "background 300ms, border-color 300ms, color 300ms",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
        <div
          className="h-px flex-1"
          style={{
            background: `linear-gradient(90deg, ${card.accent}${active ? "50" : "20"}, transparent)`,
            transition: "background 400ms",
          }}
        />
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{
            background: card.dot,
            opacity: active ? 1 : 0.35,
            boxShadow: active ? `0 0 8px ${card.dot}` : "none",
            transition: "opacity 300ms, box-shadow 300ms",
          }}
        />
      </div>

      <h3
        className="relative z-10 font-display font-semibold text-base mb-2.5 leading-snug"
        style={{ color: "var(--dfl-text-hi)" }}
      >
        {card.title}
      </h3>
      <p
        className="relative z-10 text-sm leading-relaxed"
        style={{ color: "var(--dfl-text-lo)" }}
      >
        {card.description}
      </p>
    </div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────
export default function ProductDefinitionSection() {
  const [sceneHovered, setSceneHovered] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
        setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="product" className="section-wrapper overflow-hidden">
      <style>{`
        /* ── Theme-aware SVG card palette ──
           :root (no class)  = light theme
           :root.dark        = dark theme (toggled by ThemeContext)
        */
        :root {
          --pd-card-photo-a: #dbeafe;
          --pd-card-photo-b: #ede9fe;
          --pd-card-video-a: #ede9fe;
          --pd-card-video-b: #e0e7ff;
          --pd-card-motion-a: #d1fae5;
          --pd-card-motion-b: #dbeafe;
          --pd-avatar-fill: rgba(248,250,255,0.95);
          --pd-bar-hi: rgba(30,58,138,0.18);
          --pd-bar-mid: rgba(30,58,138,0.1);
          --pd-bar-lo: rgba(30,58,138,0.06);
          --pd-watermark: rgba(99,102,241,0.12);
        }
        :root.dark {
          --pd-card-photo-a: #1e3a5f;
          --pd-card-photo-b: #1e1b4b;
          --pd-card-video-a: #2d1b4e;
          --pd-card-video-b: #1e1b4b;
          --pd-card-motion-a: #064e3b;
          --pd-card-motion-b: #1e1b4b;
          --pd-avatar-fill: rgba(10,14,30,0.75);
          --pd-bar-hi: rgba(255,255,255,0.14);
          --pd-bar-mid: rgba(255,255,255,0.08);
          --pd-bar-lo: rgba(255,255,255,0.06);
          --pd-watermark: rgba(99,102,241,0.2);
        }

        @keyframes pdFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes pdEntranceLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pdEntranceRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="glow-line" />
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-5">Что такое КовальЛабс</div>
          <h2
            className="font-display font-bold mb-5"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", color: "var(--dfl-text-hi)" }}
          >
            Это не агентство.
            <br />
            <span className="text-accent-gradient">Это платформа.</span>
          </h2>
          <p
            className="max-w-xl mx-auto leading-relaxed"
            style={{ fontSize: "1.05rem", color: "var(--dfl-text-lo)" }}
          >
            КовальЛабс — самообслуживаемая SaaS-платформа. Бренд, проект или личный инфлюенсер
            сам создаёт AI-персонажа и генерирует весь визуальный контент без участия третьих сторон.
          </p>
        </div>

        {/* Two-column layout: cards left, 3D scene right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14 items-center">

          {/* Left: info cards */}
          <div
            ref={leftRef}
            className="flex flex-col gap-4"
            style={{
              animation: visible ? "pdEntranceLeft 700ms cubic-bezier(0.16,1,0.3,1) both" : "none",
            }}
          >
            {cards.map((card, i) => (
              <InfoCard key={card.id} card={card} index={i} />
            ))}
          </div>

          {/* Right: 3D scene */}
          <div
            ref={sceneRef}
            id="pd-scene-wrap"
            className="relative flex items-center justify-center"
            style={{
              animation: visible ? "pdEntranceRight 700ms 150ms cubic-bezier(0.16,1,0.3,1) both" : "none",
            }}
          >
            {/* Ambient bg glow */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(37,99,235,0.1) 0%, rgba(99,102,241,0.06) 40%, transparent 70%)",
                filter: "blur(24px)",
                transform: "scale(1.2)",
              }}
            />

            {/* Pause all SVG animations when section is scrolled out of view */}
            {!inView && (
              <style>{`#pd-scene-wrap svg animate,#pd-scene-wrap svg animateTransform,#pd-scene-wrap svg animateMotion{animation-play-state:paused}`}</style>
            )}

            {/* Hover area */}
            <div
              className="relative w-full max-w-md mx-auto cursor-default flex flex-col items-center"
              onMouseEnter={() => setSceneHovered(true)}
              onMouseLeave={() => setSceneHovered(false)}
              style={{
                transform: sceneHovered ? "scale(1.02)" : "scale(1)",
                transition: "transform 500ms cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              {/* Subtle border frame */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  border: `1px solid ${sceneHovered ? "rgba(99,102,241,0.28)" : "rgba(99,102,241,0.1)"}`,
                  boxShadow: sceneHovered
                    ? "0 0 60px rgba(37,99,235,0.12), 0 0 120px rgba(99,102,241,0.06)"
                    : "none",
                  transition: "border-color 400ms, box-shadow 400ms",
                }}
              />

              <AIIdentityScene hovered={sceneHovered} />

              {/* Hover hint — below SVG, no overlap */}
              <div
                className="text-xs font-medium mt-1 pb-2"
                style={{
                  color: "var(--dfl-text-placeholder)",
                  opacity: sceneHovered ? 0 : 0.55,
                  transition: "opacity 300ms",
                  whiteSpace: "nowrap",
                }}
              >
                Наведите для взаимодействия
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
