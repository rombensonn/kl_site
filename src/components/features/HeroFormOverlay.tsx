import { useState, useEffect, useRef, useCallback } from "react";
import { X, ArrowRight, Loader2, CheckCircle, AlertCircle, Sparkles, Zap } from "lucide-react";
import { createPortal } from "react-dom";
import { useWaitlistForm } from "@/hooks/useWaitlistForm";
import type { WaitlistFormData } from "@/types";

/* ── Consent checkbox ── */
function ConsentCheckbox({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative flex-shrink-0 mt-0.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          onClick={() => !disabled && onChange(!checked)}
          disabled={disabled}
          className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
          style={{
            background: checked
              ? "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))"
              : "var(--dfl-surface-2)",
            border: checked
              ? "1.5px solid var(--dfl-accent-hover)"
              : "1.5px solid var(--dfl-border-2)",
            boxShadow: checked ? "0 0 12px var(--dfl-glow-blue)" : "none",
          }}
        >
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4L3.5 6.5L9 1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
      <label
        className="text-xs leading-relaxed cursor-pointer"
        style={{ color: "var(--dfl-text-subtle)", lineHeight: 1.6 }}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span style={{ color: "var(--dfl-error)", marginRight: 2 }}>*</span>
        Нажимая кнопку, подтверждаю согласие с{" "}
        <a
          href="/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors duration-150"
          style={{ color: "var(--dfl-accent-bright)" }}
          onClick={(e) => e.stopPropagation()}
        >
          Политикой конфиденциальности
        </a>{" "}
        и даю{" "}
        <a
          href="/consent"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 transition-colors duration-150"
          style={{ color: "var(--dfl-accent-bright)" }}
          onClick={(e) => e.stopPropagation()}
        >
          согласие на обработку данных
        </a>
        .
      </label>
    </div>
  );
}

/* ── Canvas confetti ── */
function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = [
      "#22c55e", "#3b82f6", "#a78bfa", "#f59e0b",
      "#ec4899", "#60a5fa", "#34d399", "#fbbf24",
      "#f472b6", "#818cf8",
    ];

    type Piece = {
      x: number; y: number;
      vx: number; vy: number;
      rot: number; rotV: number;
      w: number; h: number;
      color: string;
      opacity: number;
      gravity: number;
      isDiamond: boolean;
    };

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const pieces: Piece[] = Array.from({ length: 130 }, (_, idx) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 10;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 6 + 2),
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 8,
        w: 7 + Math.random() * 9,
        h: 4 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: 1,
        gravity: 0.28 + Math.random() * 0.18,
        // Pre-compute shape type to avoid indexOf in the loop
        isDiamond: idx % 3 === 0,
      };
    });

    let frame = 0;
    const MAX_FRAMES = 200;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      for (const p of pieces) {
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotV;
        if (frame > 80) p.opacity = Math.max(0, p.opacity - 0.012);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        // Alternate between rectangles and diamonds (pre-computed)
        if (p.isDiamond) {
          // diamond
          ctx.beginPath();
          ctx.moveTo(0, -p.h);
          ctx.lineTo(p.w / 2, 0);
          ctx.lineTo(0, p.h);
          ctx.lineTo(-p.w / 2, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }

      if (frame < MAX_FRAMES) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2147483640,
      }}
    />
  );
}

/* ── Particle burst on success ── */
function ParticleBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * 360,
    color: i % 3 === 0 ? "#22c55e" : i % 3 === 1 ? "#60a5fa" : "#a78bfa",
    delay: (i * 40),
    distance: 60 + Math.random() * 40,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full" style={{ zIndex: 10 }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: p.color,
            animation: `particleBurst 600ms ${p.delay}ms cubic-bezier(0.16,1,0.3,1) forwards`,
            transformOrigin: "center",
            transform: `translate(-50%, -50%) rotate(${p.angle}deg) translateY(-${p.distance}px)`,
            opacity: 0,
            boxShadow: `0 0 6px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Success state ── */
function SuccessState({ onClose }: { onClose: () => void }) {
  const [countdown, setCountdown] = useState(3);
  const [burst, setBurst] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    setBurst(true);
    // Small delay so canvas is mounted before animating
    const ct = setTimeout(() => setConfetti(true), 80);
    const interval = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) { clearInterval(interval); onClose(); return 0; }
        return n - 1;
      });
    }, 1000);
    return () => { clearInterval(interval); clearTimeout(ct); };
  }, [onClose]);

  return (
    <div className="flex flex-col items-center text-center py-8">
      <ConfettiCanvas active={confetti} />
      {/* Animated icon */}
      <div className="relative mb-8">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle, rgba(34,197,94,0.18) 0%, rgba(34,197,94,0.05) 70%)",
            border: "1.5px solid rgba(34,197,94,0.4)",
            boxShadow: "0 0 48px rgba(34,197,94,0.25), 0 0 16px rgba(34,197,94,0.15)",
            animation: "successIconPop 600ms cubic-bezier(0.34,1.56,0.64,1) forwards",
          }}
        >
          <CheckCircle
            size={44}
            style={{ color: "#22c55e", filter: "drop-shadow(0 0 8px rgba(34,197,94,0.6))" }}
          />
        </div>
        <ParticleBurst active={burst} />

        {/* Pulse rings */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid rgba(34,197,94,0.3)",
              animation: `ping 1.5s ${i * 300}ms cubic-bezier(0,0,0.2,1) infinite`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Text */}
      <div style={{ animation: "successTextIn 500ms 200ms cubic-bezier(0.16,1,0.3,1) both" }}>
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Заявка принята
        </div>
        <h3
          className="font-display font-bold mb-3"
          style={{ fontSize: "1.6rem", color: "var(--dfl-text-hi)", lineHeight: 1.15 }}
        >
          Вы в списке!
        </h3>
        <p
          className="mb-6 max-w-xs mx-auto leading-relaxed"
          style={{ color: "var(--dfl-text-lo)", fontSize: "0.95rem" }}
        >
          Уведомим одними из первых о запуске бета-версии платформы.
        </p>

        {/* Beta launch indicator */}
        <div
          className="flex gap-6 justify-center mb-8 py-4 px-6 rounded-2xl"
          style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}
        >
          {[
            { label: "Статус", value: "Beta" },
            { label: "Запуск", value: "Скоро" },
            { label: "Доступ", value: "Ранний" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="font-display font-bold text-xl" style={{ color: "var(--dfl-accent-bright)" }}>
                {s.value}
              </span>
              <span className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Countdown */}
        <button
          onClick={onClose}
          className="group flex items-center gap-2 mx-auto text-sm transition-colors duration-200"
          style={{ color: "var(--dfl-text-subtle)" }}
        >
          <span style={{ animation: `closingPulse 1s ease-in-out infinite` }}>
            Закрывается через {countdown}с
          </span>
          <X size={14} className="group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN OVERLAY COMPONENT
   ══════════════════════════════════════════════════════════════ */

interface HeroFormOverlayProps {
  isOpen: boolean;
  initialEmail?: string;
  onClose: () => void;
}

export default function HeroFormOverlay({ isOpen, initialEmail = "", onClose }: HeroFormOverlayProps) {
  const { status, error, submitForm } = useWaitlistForm();

  const [phase, setPhase] = useState<"entering" | "visible" | "exiting">("entering");
  const [email, setEmail] = useState(initialEmail);
  const [represents, setRepresents] = useState("");
  const [useCase, setUseCase] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const firstInputRef = useRef<HTMLInputElement>(null);

  /* Sync initial email from trigger */
  useEffect(() => {
    if (isOpen) setEmail(initialEmail);
  }, [isOpen, initialEmail]);

  /* Animate in and focus */
  useEffect(() => {
    if (!isOpen) return;
    setPhase("entering");
    const t = setTimeout(() => {
      setPhase("visible");
      firstInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [isOpen]);

  /* Prevent scroll on body while open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* Escape key */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setPhase("exiting");
    setTimeout(() => onClose(), 270);
  }, [onClose]);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!email) { setValidationError("Введите ваш email"); return; }
    if (!validateEmail(email)) { setValidationError("Введите корректный email"); return; }
    if (!consent) { setValidationError("Необходимо дать согласие на обработку данных"); return; }
    if (!marketingConsent) { setValidationError("Необходимо согласие на получение информационных сообщений"); return; }

    const data: WaitlistFormData = {
      email,
      consent,
      marketingConsent,
      source: "hero-overlay",
    };
    if (represents) data.represents = represents;
    if (useCase) data.useCase = useCase;
    await submitForm(data);
  };

  if (!isOpen) return null;

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  const cardClass = phase === "exiting" ? "hero-overlay-card exiting" : "hero-overlay-card entering";
  const backdropClass = phase === "exiting" ? "hero-overlay-backdrop exiting" : "hero-overlay-backdrop entering";

  return createPortal(
    <div
      className={backdropClass}
      role="dialog"
      aria-modal="true"
      aria-label="Форма записи в лист ожидания"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className={cardClass}>

        {/* Decorative glow top */}
        <div
          className="absolute -top-px left-1/2 -translate-x-1/2 h-px"
          style={{
            width: "60%",
            background: "linear-gradient(90deg, transparent, var(--dfl-border-glow), transparent)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)" }}
        />

        {/* Close button */}
        {!isSuccess && (
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="absolute top-5 right-5 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: "var(--dfl-surface-2)",
              border: "1px solid var(--dfl-border-1)",
              color: "var(--dfl-text-subtle)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--dfl-surface-3)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--dfl-text-hi)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--dfl-surface-2)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--dfl-text-subtle)";
            }}
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>
        )}

        {/* Success state */}
        {isSuccess ? (
          <SuccessState onClose={handleClose} />
        ) : (
          <>
            {/* Header */}
            <div className="overlay-field-0 mb-8 pr-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{
                  background: "var(--dfl-accent-muted)",
                  border: "1px solid var(--dfl-border-2)",
                  color: "var(--dfl-accent-bright)",
                }}
              >
                <Sparkles size={11} />
                Ранний доступ · Первый состав участников
              </div>
              <h2
                className="font-display font-bold mb-2 leading-tight"
                style={{ fontSize: "clamp(1.4rem, 3vw, 1.8rem)", color: "var(--dfl-text-hi)" }}
              >
                Вступить в лист ожидания
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
                Оставьте заявку и получите ранний доступ к платформе, фиксированные условия на период беты.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="overlay-field-1">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--dfl-text-mid)" }}
                >
                  Email <span style={{ color: "var(--dfl-error)" }}>*</span>
                </label>
                <input
                  ref={firstInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-field"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              {/* Represents */}
              <div className="overlay-field-2">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--dfl-text-mid)" }}
                >
                  Кого вы представляете?{" "}
                  <span className="text-xs font-normal" style={{ color: "var(--dfl-text-placeholder)" }}>
                    (необязательно)
                  </span>
                </label>
                <select
                  value={represents}
                  onChange={(e) => setRepresents(e.target.value)}
                  className="input-field appearance-none cursor-pointer"
                  disabled={isLoading}
                >
                  <option value="">Выберите вариант</option>
                  <option value="brand">Бренд</option>
                  <option value="agency">Агентство</option>
                  <option value="personal">Личный проект / креатор</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              {/* Use case */}
              <div className="overlay-field-3">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--dfl-text-mid)" }}
                >
                  Как планируете использовать?{" "}
                  <span className="text-xs font-normal" style={{ color: "var(--dfl-text-placeholder)" }}>
                    (необязательно)
                  </span>
                </label>
                <textarea
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="Например: реклама в соцсетях, e-commerce карточки, motion-видео..."
                  className="input-field resize-none"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              {/* Consent checkboxes */}
              <div className="overlay-field-4 space-y-3">
                <ConsentCheckbox
                  checked={consent}
                  onChange={setConsent}
                  disabled={isLoading}
                />
                {/* Marketing consent */}
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={marketingConsent}
                      onClick={() => !isLoading && setMarketingConsent(!marketingConsent)}
                      disabled={isLoading}
                      className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                      style={{
                        background: marketingConsent
                          ? "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))"
                          : "var(--dfl-surface-2)",
                        border: marketingConsent
                          ? "1.5px solid var(--dfl-accent-hover)"
                          : "1.5px solid var(--dfl-border-2)",
                        boxShadow: marketingConsent ? "0 0 12px var(--dfl-glow-blue)" : "none",
                      }}
                    >
                      {marketingConsent && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <label
                    className="text-xs leading-relaxed cursor-pointer"
                    style={{ color: "var(--dfl-text-subtle)", lineHeight: 1.6 }}
                    onClick={() => !isLoading && setMarketingConsent(!marketingConsent)}
                  >
                    <span style={{ color: "var(--dfl-error)", marginRight: 2 }}>*</span>
                    Я согласен(на) на получение информационных и рекламных сообщений о платформе КовальЛабс
                    на указанный email-адрес в соответствии с ч.&nbsp;1 ст.&nbsp;18 ФЗ «О рекламе».
                    Согласие можно отозвать в любой момент, нажав «Отписаться» в письме.
                  </label>
                </div>
              </div>

              {/* Error */}
              {(validationError || error) && (
                <div
                  className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl"
                  style={{
                    background: "var(--dfl-error-muted)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "var(--dfl-error)",
                  }}
                >
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{validationError || error}</span>
                </div>
              )}

              {/* Submit */}
              <div className="overlay-field-4 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-4 text-base font-semibold"
                  style={{ borderRadius: "0.875rem" }}
                >
                  {isLoading ? (
                    <><Loader2 size={18} className="animate-spin" />Отправляем заявку...</>
                  ) : (
                    <><Zap size={17} />Вступить в первый состав<ArrowRight size={17} /></>
                  )}
                </button>

                {/* Seat counter */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span
                    className="inline-block w-2 h-2 rounded-full animate-pulse"
                    style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
                  />
                  <p className="text-xs text-center" style={{ color: "var(--dfl-text-subtle)" }}>
                    <span style={{ color: "#22c55e", fontWeight: 600 }}>Бета скоро · ранний доступ</span>
                    {" "}— только важные обновления
                  </p>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
