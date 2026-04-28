import { useState, useRef } from "react";

const cases = [
  {
    niche: "E-commerce / Fashion",
    task: "Бренд одежды запускает новую коллекцию и нуждается в фотоконтенте под 40 SKU в двух цветовых вариантах.",
    result: "320 уникальных фото за 3 дня без съёмки, с единым образом AI-инфлюенсера во всех карточках товаров.",
    metrics: [
      { label: "Фото", value: "320" },
      { label: "Дней", value: "3" },
      { label: "Экономия", value: "80%" },
    ],
    accent: "#3b82f6",
    scene: "ecommerce",
    note: "Пример использования",
  },
  {
    niche: "Beauty / SMM",
    task: "Маркетинговая команда beauty-бренда хочет 12 трендовых Reels-видео в месяц с постоянным персонажем.",
    result: "12 видео за неделю через Kling 3.0. Персонаж сохраняет лицо и стиль в каждом ролике. Motion control для трендовых переходов.",
    metrics: [
      { label: "Видео", value: "12" },
      { label: "Неделя", value: "1" },
      { label: "Без съёмок", value: "100%" },
    ],
    accent: "#ec4899",
    scene: "beauty",
    note: "Пример использования",
  },
  {
    niche: "Личный бренд / Креатор",
    task: "Предприниматель хочет вести активный контент-маркетинг, но у него нет времени сниматься самому каждую неделю.",
    result: "AI-двойник генерирует контент 3 раза в неделю: посты, сторис, промо-материалы — без участия владельца в съёмках.",
    metrics: [
      { label: "Публикаций/нед", value: "3" },
      { label: "Часов на съёмку", value: "0" },
      { label: "Контроль образа", value: "100%" },
    ],
    accent: "#8b5cf6",
    scene: "creator",
    note: "Пример использования",
  },
];

// ── Scene: Rotating product cube with SKU tags ────────────────────────────────
function EcommerceScene({ active }: { active: boolean }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="select-none overflow-visible">
      <defs>
        <linearGradient id="cube-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="cube-front" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="cube-side" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <filter id="cube-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Shadow */}
      <ellipse cx="60" cy="105" rx="28" ry="5" fill="rgba(59,130,246,0.15)" />

      {/* Cube group with rotation animation */}
      <g
        filter="url(#cube-glow)"
        style={{
          transformOrigin: "60px 65px",
          transform: active ? "rotateY(20deg) rotateX(-8deg)" : "rotateY(0deg) rotateX(0deg)",
          transition: "transform 600ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Top face */}
        <path d="M60 28 L88 42 L60 56 L32 42 Z" fill="url(#cube-top)" opacity="0.95" />
        {/* Front face */}
        <path d="M32 42 L60 56 L60 90 L32 76 Z" fill="url(#cube-front)" opacity="0.9" />
        {/* Right face */}
        <path d="M60 56 L88 42 L88 76 L60 90 Z" fill="url(#cube-side)" opacity="0.85" />

        {/* Edge highlights */}
        <line x1="60" y1="28" x2="88" y2="42" stroke="rgba(147,197,253,0.5)" strokeWidth="0.8" />
        <line x1="60" y1="28" x2="32" y2="42" stroke="rgba(147,197,253,0.3)" strokeWidth="0.8" />
        <line x1="60" y1="56" x2="60" y2="90" stroke="rgba(147,197,253,0.25)" strokeWidth="0.8" />

        {/* Top face pattern */}
        <text x="60" y="47" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.7)" fontWeight="600">SKU</text>
        <line x1="44" y1="49" x2="76" y2="49" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />

        {/* Front face text */}
        <text x="46" y="70" fontSize="7" fill="rgba(255,255,255,0.55)">×40</text>
        <text x="46" y="79" fontSize="6" fill="rgba(255,255,255,0.35)">items</text>
      </g>

      {/* Floating price tags */}
      <g style={{ transition: "opacity 400ms, transform 400ms", opacity: active ? 1 : 0, transform: active ? "translateY(0)" : "translateY(4px)" }}>
        <g transform="translate(4, 18)">
          <rect x="0" y="0" width="34" height="16" rx="5" fill="rgba(59,130,246,0.18)" stroke="rgba(59,130,246,0.45)" strokeWidth="0.8" />
          <text x="17" y="11" textAnchor="middle" fontSize="7.5" fill="#93c5fd" fontWeight="700">×320</text>
        </g>
        <g transform="translate(83, 22)">
          <rect x="0" y="0" width="32" height="15" rx="4.5" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.35)" strokeWidth="0.8" />
          <text x="16" y="10.5" textAnchor="middle" fontSize="7" fill="#4ade80" fontWeight="600">−80%</text>
        </g>
      </g>

      {/* Orbit ring */}
      <ellipse
        cx="60" cy="65" rx="44" ry="14"
        stroke="rgba(59,130,246,0.18)"
        strokeWidth="1"
        fill="none"
        strokeDasharray="4 3"
        style={{
          transition: "stroke-opacity 400ms",
          strokeOpacity: active ? 0.5 : 0.2,
        }}
      />

      {/* Orbit dot */}
      <circle
        cx={active ? "104" : "16"}
        cy="65"
        r="3"
        fill="#60a5fa"
        opacity={active ? 0.9 : 0.3}
        style={{ transition: "cx 600ms ease-in-out, opacity 400ms" }}
      />
    </svg>
  );
}

// ── Scene: Reels phone with progress ring ────────────────────────────────────
function BeautyScene({ active }: { active: boolean }) {
  const circumference = 2 * Math.PI * 20;
  const progress = active ? circumference * 0.75 : circumference * 0.3;

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="select-none overflow-visible">
      <defs>
        <linearGradient id="phone-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#be185d" />
          <stop offset="100%" stopColor="#9d174d" />
        </linearGradient>
        <linearGradient id="screen-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a0a14" />
          <stop offset="100%" stopColor="#2d0d24" />
        </linearGradient>
        <linearGradient id="reel-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <filter id="phone-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Glow */}
      <ellipse cx="60" cy="108" rx="22" ry="4" fill="rgba(236,72,153,0.2)" />

      <g
        filter="url(#phone-glow)"
        style={{
          transformOrigin: "60px 64px",
          transform: active ? "translateY(-4px) rotate(-4deg)" : "translateY(0) rotate(0deg)",
          transition: "transform 500ms cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Phone body */}
        <rect x="36" y="18" width="48" height="86" rx="8" fill="url(#phone-grad)" />
        {/* Screen */}
        <rect x="39" y="22" width="42" height="74" rx="5" fill="url(#screen-grad)" />

        {/* Influencer avatar on screen */}
        <rect x="39" y="22" width="42" height="74" rx="5" fill="rgba(236,72,153,0.06)" />
        <text x="60" y="54" textAnchor="middle" fontSize="22">👩‍💼</text>

        {/* Reels overlay elements */}
        <rect x="42" y="72" width="26" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
        <rect x="42" y="77" width="18" height="2.5" rx="1.25" fill="rgba(255,255,255,0.1)" />

        {/* Heart icon */}
        <text x="72" y="68" fontSize="9" opacity={active ? 0.9 : 0.4} style={{ transition: "opacity 300ms" }}>❤️</text>

        {/* Camera notch */}
        <rect x="55" y="20" width="10" height="3" rx="1.5" fill="rgba(0,0,0,0.5)" />

        {/* Play indicator */}
        {active && (
          <polygon points="54,52 54,62 64,57" fill="rgba(255,255,255,0.7)" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.2s" repeatCount="indefinite" />
          </polygon>
        )}
      </g>

      {/* Progress ring floating */}
      <g style={{ transform: "translate(84, 26)", transition: "opacity 400ms", opacity: active ? 1 : 0.5 }}>
        <circle cx="16" cy="16" r="20" fill="none" stroke="rgba(236,72,153,0.15)" strokeWidth="3.5" />
        <circle
          cx="16" cy="16" r="20"
          fill="none"
          stroke="url(#reel-accent)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          style={{ transition: "stroke-dasharray 600ms cubic-bezier(0.16,1,0.3,1)" }}
        />
        <text x="16" y="20" textAnchor="middle" fontSize="8" fill="#f9a8d4" fontWeight="700">
          {active ? "75%" : "30%"}
        </text>
      </g>

      {/* Floating tags */}
      <g style={{ opacity: active ? 1 : 0, transition: "opacity 400ms 100ms" }}>
        <g transform="translate(0, 38)">
          <rect width="32" height="15" rx="4.5" fill="rgba(236,72,153,0.15)" stroke="rgba(236,72,153,0.4)" strokeWidth="0.8" />
          <text x="16" y="10.5" textAnchor="middle" fontSize="7" fill="#f9a8d4" fontWeight="600">Reels</text>
        </g>
        <g transform="translate(2, 60)">
          <rect width="30" height="15" rx="4.5" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.35)" strokeWidth="0.8" />
          <text x="15" y="10.5" textAnchor="middle" fontSize="7" fill="#a5b4fc" fontWeight="600">Kling</text>
        </g>
      </g>

      {/* Sparkles */}
      {active && (
        <>
          <circle cx="100" cy="90" r="2" fill="#f9a8d4" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.1;0.8" dur="0.7s" repeatCount="indefinite" />
          </circle>
          <circle cx="18" cy="82" r="1.5" fill="#ec4899" opacity="0.6">
            <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}

// ── Scene: Avatar with identity orbit rings ──────────────────────────────────
function CreatorScene({ active }: { active: boolean }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="select-none overflow-visible">
      <defs>
        <linearGradient id="avatar-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="ring-grad-1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="ring-grad-2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>
        <filter id="avatar-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="avatar-clip">
          <circle cx="60" cy="55" r="22" />
        </clipPath>
      </defs>

      {/* Outer orbit ring */}
      <ellipse
        cx="60" cy="62" rx="50" ry="18"
        stroke="url(#ring-grad-1)"
        strokeWidth="1.2"
        fill="none"
        style={{
          transformOrigin: "60px 62px",
          transform: active ? "rotateX(70deg) rotate(20deg)" : "rotateX(70deg) rotate(0deg)",
          transition: "transform 700ms cubic-bezier(0.34,1.56,0.64,1)",
          strokeOpacity: active ? 0.7 : 0.35,
        }}
      />

      {/* Inner orbit ring */}
      <ellipse
        cx="60" cy="62" rx="36" ry="13"
        stroke="url(#ring-grad-2)"
        strokeWidth="1"
        fill="none"
        strokeDasharray="5 3"
        style={{
          transformOrigin: "60px 62px",
          transform: active ? "rotateX(70deg) rotate(-15deg)" : "rotateX(70deg) rotate(0deg)",
          transition: "transform 600ms cubic-bezier(0.34,1.56,0.64,1)",
          strokeOpacity: active ? 0.6 : 0.25,
        }}
      />

      {/* Avatar circle */}
      <g filter="url(#avatar-glow)">
        <circle
          cx="60" cy="55" r="22"
          fill="rgba(139,92,246,0.12)"
          stroke="url(#avatar-grad)"
          strokeWidth="2"
          style={{
            transform: active ? "scale(1.08)" : "scale(1)",
            transformOrigin: "60px 55px",
            transition: "transform 500ms cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
        {/* Avatar emoji */}
        <text
          x="60" y="65"
          textAnchor="middle"
          fontSize="22"
          style={{
            transform: active ? "scale(1.08)" : "scale(1)",
            transformOrigin: "60px 55px",
            transition: "transform 500ms cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          👤
        </text>

        {/* AI label */}
        <rect x="44" y="71" width="32" height="12" rx="4" fill="rgba(139,92,246,0.25)" stroke="rgba(139,92,246,0.5)" strokeWidth="0.8" />
        <text x="60" y="80" textAnchor="middle" fontSize="7" fill="#c4b5fd" fontWeight="700">AI-двойник</text>
      </g>

      {/* Orbit dots on rings */}
      <circle
        cx={active ? "108" : "12"}
        cy="62"
        r="4"
        fill="#8b5cf6"
        opacity={active ? 0.9 : 0.4}
        style={{ transition: "cx 700ms ease-in-out, opacity 400ms" }}
      />
      <circle
        cx="60"
        cy={active ? "49" : "75"}
        r="3"
        fill="#a78bfa"
        opacity={active ? 0.8 : 0.3}
        style={{ transition: "cy 600ms ease-in-out, opacity 400ms" }}
      />

      {/* Content badges floating */}
      <g style={{ opacity: active ? 1 : 0, transition: "opacity 350ms 50ms" }}>
        <g transform="translate(1, 14)">
          <rect width="36" height="15" rx="4.5" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="0.8" />
          <text x="18" y="10.5" textAnchor="middle" fontSize="7" fill="#c4b5fd" fontWeight="600">Посты ×3</text>
        </g>
        <g transform="translate(83, 14)">
          <rect width="34" height="15" rx="4.5" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.35)" strokeWidth="0.8" />
          <text x="17" y="10.5" textAnchor="middle" fontSize="7" fill="#6ee7b7" fontWeight="600">0 часов</text>
        </g>
        <g transform="translate(83, 92)">
          <rect width="34" height="15" rx="4.5" fill="rgba(139,92,246,0.15)" stroke="rgba(139,92,246,0.4)" strokeWidth="0.8" />
          <text x="17" y="10.5" textAnchor="middle" fontSize="7" fill="#c4b5fd" fontWeight="600">Авто</text>
        </g>
      </g>

      {/* Pulse rings */}
      {active && (
        <>
          <circle cx="60" cy="55" r="26" stroke="rgba(139,92,246,0.3)" strokeWidth="1" fill="none">
            <animate attributeName="r" values="26;34;26" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}

// ── Use Case Card ────────────────────────────────────────────────────────────
function UseCaseCard({ c }: { c: typeof cases[0] }) {
  const [active, setActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) translateY(-4px) scale(1.015)`;
  };

  const handleMouseLeave = () => {
    setActive(false);
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
  };

  const SceneComponent = {
    ecommerce: EcommerceScene,
    beauty: BeautyScene,
    creator: CreatorScene,
  }[c.scene];

  return (
    <div
      ref={cardRef}
      className="rounded-2xl overflow-hidden flex flex-col cursor-default"
      onMouseEnter={() => setActive(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: "var(--dfl-surface-1)",
        border: "1px solid var(--dfl-border-1)",
        transition: "transform 350ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 350ms, border-color 300ms",
        // Release will-change when not hovered to free GPU memory
      willChange: active ? "transform" : "auto",
        boxShadow: active
          ? `0 28px 56px rgba(0,0,0,0.2), 0 0 0 1px ${c.accent}33, 0 0 40px ${c.accent}14`
          : "0 4px 16px rgba(0,0,0,0.08)",
        borderColor: active ? `${c.accent}50` : "var(--dfl-border-1)",
      }}
    >
      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "2px",
          width: "100%",
          background: `linear-gradient(90deg, ${c.accent}, ${c.accent}55)`,
          transform: active ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 400ms cubic-bezier(0.16,1,0.3,1)",
          boxShadow: `0 0 8px ${c.accent}80`,
          zIndex: 2,
        }}
      />

      {/* Subtle bg glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 70% 0%, ${c.accent}0A 0%, transparent 65%)`,
          opacity: active ? 1 : 0,
          transition: "opacity 400ms",
          pointerEvents: "none",
        }}
      />

      {/* Header with 3D scene */}
      <div
        className="relative px-5 pt-5 pb-0 flex items-end justify-between"
        style={{
          background: `linear-gradient(135deg, ${c.accent}10, transparent)`,
          borderBottom: "1px solid var(--dfl-border-1)",
          minHeight: 110,
        }}
      >
        {/* Left: niche + badge */}
        <div className="pb-4 flex flex-col gap-2 z-10">
          <div
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: c.accent }}
          >
            {c.niche}
          </div>
          <div
            className="text-[10px] px-1.5 py-0.5 rounded inline-block self-start"
            style={{
              background: "var(--dfl-surface-2)",
              color: "var(--dfl-text-placeholder)",
              border: "1px solid var(--dfl-border-1)",
            }}
          >
            {c.note}
          </div>
        </div>

        {/* Right: 3D scene */}
        <div
          className="flex-shrink-0 relative"
          style={{
            width: 120,
            height: 110,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            overflow: "visible",
          }}
        >
          {/* Glow behind scene */}
          <div
            style={{
              position: "absolute",
              bottom: 4,
              left: "50%",
              transform: "translateX(-50%)",
              width: 80,
              height: 40,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${c.accent}22 0%, transparent 70%)`,
              opacity: active ? 1 : 0.4,
              transition: "opacity 400ms",
              filter: "blur(8px)",
            }}
          />
          <div
            style={{
              transition: "transform 400ms cubic-bezier(0.34,1.56,0.64,1), filter 400ms",
              transform: active ? "scale(1.06) translateY(-4px)" : "scale(1) translateY(0)",
              filter: active ? `drop-shadow(0 0 10px ${c.accent}55)` : "none",
            }}
          >
            <SceneComponent active={active} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col gap-4 relative z-10">
        <div>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--dfl-text-placeholder)" }}
          >
            Задача
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
            {c.task}
          </p>
        </div>

        <div
          className="rounded-xl p-3"
          style={{
            background: `${c.accent}08`,
            border: `1px solid ${c.accent}20`,
          }}
        >
          <div
            className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: c.accent }}
          >
            Результат
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-mid)" }}>
            {c.result}
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-auto">
          {c.metrics.map((m) => (
            <div
              key={m.label}
              className="text-center rounded-xl p-2.5 transition-all duration-300"
              style={{
                background: active ? `${c.accent}0E` : "var(--dfl-surface-2)",
                border: active ? `1px solid ${c.accent}28` : "1px solid var(--dfl-border-1)",
              }}
            >
              <div
                className="font-display font-bold text-base leading-none mb-0.5"
                style={{ color: c.accent }}
              >
                {m.value}
              </div>
              <div className="text-[9px]" style={{ color: "var(--dfl-text-placeholder)" }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────
export default function UseCasesSection() {
  return (
    <section id="cases" className="section-wrapper">
      <div className="glow-line" />
      <div className="container-wide">
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-5">Примеры сценариев</div>
          <h2
            className="font-display font-bold mb-4"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              color: "var(--dfl-text-hi)",
            }}
          >
            Как это работает
            <span className="text-accent-gradient"> на практике</span>
          </h2>
          <p className="max-w-xl mx-auto leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
            Гипотетические сценарии, основанные на реальных задачах брендов и креаторов.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {cases.map((c) => (
            <UseCaseCard key={c.niche} c={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
