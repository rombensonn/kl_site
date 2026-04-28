import { useState } from "react";
import { Link } from "react-router-dom";
import { X, ChevronRight, ChevronLeft, User, FileText, Camera, Zap } from "lucide-react";

const ONBOARDING_KEY = "kl-onboarding-done";

export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  } catch {
    return false;
  }
}

export function markOnboardingDone(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, "true");
  } catch {
    // ignore
  }
}

// ── Step data ─────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    icon: User,
    iconColor: "#6366f1",
    iconBg: "rgba(99,102,241,0.14)",
    iconBorder: "rgba(99,102,241,0.35)",
    emoji: "👤",
    title: "Создайте AI-персонажа",
    description:
      "Настройте внешность, стиль и характер вашего цифрового инфлюенсера. Это займёт всего несколько минут — и результат останется с вами навсегда.",
    tip: "Персонаж — основа всех ваших генераций. Чем детальнее бриф, тем точнее контент.",
    action: { label: "Перейти к созданию", href: "/character/new" },
  },
  {
    id: 2,
    icon: FileText,
    iconColor: "#3b82f6",
    iconBg: "rgba(59,130,246,0.12)",
    iconBorder: "rgba(59,130,246,0.33)",
    emoji: "📝",
    title: "Заполните бренд-бриф",
    description:
      "Опишите ваш бренд: целевая аудитория, ценности, тон коммуникации. AI использует эту информацию для создания контента, который звучит как вы.",
    tip: "Хорошо заполненный бриф — это 80% качества генерации.",
    action: { label: "Заполнить бренд-бриф", href: "/brand-brief" },
  },
  {
    id: 3,
    icon: Camera,
    iconColor: "#22c55e",
    iconBg: "rgba(34,197,94,0.1)",
    iconBorder: "rgba(34,197,94,0.3)",
    emoji: "📸",
    title: "Первая генерация",
    description:
      "Запустите первую фотогенерацию вашего AI-инфлюенсера. На балансе уже 500 стартовых кредитов — этого достаточно для 6+ сессий.",
    tip: "Каждая фотосессия — от 80 кр. Motion и Видео — от 150 кр.",
    action: { label: "Сгенерировать фото", href: "/generate/photo" },
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────
interface OnboardingModalProps {
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0); // 0-indexed
  const current = STEPS[step];
  const total = STEPS.length;
  const isLast = step === total - 1;

  const handleClose = () => {
    markOnboardingDone();
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const Icon = current.icon;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200]"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="relative w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
          style={{
            background: "var(--dfl-surface-1)",
            border: "1px solid var(--dfl-border-2)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(37,99,235,0.1)",
            pointerEvents: "all",
            animation: "dropdownIn 280ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl z-10 transition-colors duration-150"
            style={{
              background: "var(--dfl-surface-2)",
              border: "1px solid var(--dfl-border-1)",
              color: "var(--dfl-text-lo)",
            }}
          >
            <X size={14} />
          </button>

          {/* Header gradient */}
          <div
            className="px-7 pt-7 pb-5 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, rgba(37,99,235,0.08) 0%, rgba(99,102,241,0.05) 100%)",
              borderBottom: "1px solid var(--dfl-border-1)",
            }}
          >
            {/* Decorative glow */}
            <div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 80% at 10% 10%, rgba(37,99,235,0.1) 0%, transparent 60%)",
              }}
            />

            {/* Logo + label */}
            <div className="flex items-center gap-2 mb-5 relative">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
              >
                <Zap size={11} className="text-white" />
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--dfl-text-lo)" }}>
                КовальЛабс · Быстрый старт
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1.5 mb-5 relative">
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className="flex-1 h-1 rounded-full transition-all duration-400"
                  style={{
                    background: i <= step ? "var(--dfl-accent)" : "var(--dfl-surface-3)",
                    opacity: i === step ? 1 : i < step ? 0.7 : 0.35,
                  }}
                />
              ))}
            </div>

            {/* Step icon + title */}
            <div className="flex items-center gap-4 relative">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                style={{
                  background: current.iconBg,
                  border: `1px solid ${current.iconBorder}`,
                  transition: "all 250ms",
                }}
              >
                {current.emoji}
              </div>
              <div>
                <p
                  className="text-[10px] uppercase tracking-widest font-semibold mb-1"
                  style={{ color: "var(--dfl-text-placeholder)" }}
                >
                  Шаг {step + 1} из {total}
                </p>
                <h2
                  className="font-display font-bold leading-tight"
                  style={{ fontSize: "1.2rem", color: "var(--dfl-text-hi)" }}
                >
                  {current.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-7 py-6">
            <p
              className="text-sm leading-relaxed mb-5"
              style={{ color: "var(--dfl-text-lo)", lineHeight: 1.7 }}
            >
              {current.description}
            </p>

            {/* Tip */}
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-2xl mb-6"
              style={{
                background: current.iconBg,
                border: `1px solid ${current.iconBorder}`,
              }}
            >
              <Icon size={15} style={{ color: current.iconColor, flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs leading-relaxed" style={{ color: "var(--dfl-text-subtle)" }}>
                {current.tip}
              </p>
            </div>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i === step ? 20 : 7,
                    height: 7,
                    background: i === step ? "var(--dfl-accent)" : "var(--dfl-surface-3)",
                  }}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl transition-colors duration-150"
                  style={{
                    background: "var(--dfl-surface-2)",
                    border: "1px solid var(--dfl-border-1)",
                    color: "var(--dfl-text-lo)",
                  }}
                >
                  <ChevronLeft size={14} />
                  Назад
                </button>
              )}

              <Link
                to={current.action.href}
                onClick={handleClose}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: "var(--dfl-accent-muted)",
                  border: "1px solid var(--dfl-border-2)",
                  color: "var(--dfl-accent-bright)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.16)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--dfl-accent-muted)";
                }}
              >
                {current.action.label}
              </Link>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 btn-primary"
              >
                {isLast ? "Готово" : "Далее"}
                {!isLast && <ChevronRight size={14} />}
              </button>
            </div>

            {/* Skip */}
            <div className="text-center mt-4">
              <button
                onClick={handleClose}
                className="text-xs transition-colors duration-150"
                style={{ color: "var(--dfl-text-placeholder)" }}
              >
                Пропустить и настроить позже
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
