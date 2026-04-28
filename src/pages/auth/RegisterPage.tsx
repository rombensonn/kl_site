import { useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, ArrowRight, Loader2, Zap, Sun, Moon,
  CheckCircle2, XCircle, Mail, AlertCircle, ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth, authService, mapAuthUser } from "@/contexts/AuthContext";

// ── OTP Length from backend: 4 ────────────────────────────────────────────────
const OTP_LENGTH = 4;

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(pwd: string) {
  const checks = {
    length: pwd.length >= 6,
    upper: /[A-Z]/.test(pwd),
    digit: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const level: "weak" | "medium" | "strong" =
    score <= 1 ? "weak" : score <= 2 ? "medium" : "strong";
  return { checks, score, level };
}

const STRENGTH_META = {
  weak:   { label: "Слабый",   color: "#ef4444", width: "33%" },
  medium: { label: "Средний",  color: "#f59e0b", width: "66%" },
  strong: { label: "Надёжный", color: "#22c55e", width: "100%" },
};

function PasswordStrength({ password }: { password: string }) {
  const { checks, level } = useMemo(() => getStrength(password), [password]);
  if (!password) return null;
  const meta = STRENGTH_META[level];
  const reqs = [
    { label: "Минимум 6 символов", ok: checks.length },
    { label: "Заглавная буква", ok: checks.upper },
    { label: "Цифра", ok: checks.digit },
    { label: "Спецсимвол (рекомендуется)", ok: checks.special },
  ];

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--dfl-surface-3)" }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: meta.width, background: meta.color }} />
        </div>
        <span className="text-xs font-semibold w-16 text-right" style={{ color: meta.color }}>
          {meta.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {reqs.map((r) => (
          <div key={r.label} className="flex items-center gap-1.5">
            {r.ok ? (
              <CheckCircle2 size={11} style={{ color: "#22c55e", flexShrink: 0 }} />
            ) : (
              <XCircle size={11} style={{ color: "var(--dfl-text-placeholder)", flexShrink: 0 }} />
            )}
            <span className="text-[10px]" style={{ color: r.ok ? "var(--dfl-text-mid)" : "var(--dfl-text-placeholder)" }}>
              {r.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Promo panel ───────────────────────────────────────────────────────────────
function RegisterPromoPanel() {
  const steps = [
    { num: "01", title: "Создайте персонажа", desc: "Настройте внешность, стиль и характер AI-инфлюенсера" },
    { num: "02", title: "Генерируйте контент", desc: "Фото, Reels-видео, Motion-ролики в одном пространстве" },
    { num: "03", title: "Публикуйте", desc: "Экспортируйте и публикуйте на всех каналах" },
  ];

  return (
    <div
      className="hidden lg:flex flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #0c1f4a 0%, #112259 35%, #1a1a5e 70%, #0d0d2b 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{ backgroundImage: "linear-gradient(rgba(96,165,250,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.8) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 20% 15%, rgba(37,99,235,0.28) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 75%, rgba(99,102,241,0.18) 0%, transparent 60%)" }} />

      <div className="relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", color: "#4ade80" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Бета-версия · запуск скоро
          </div>
          <h2 className="font-display font-bold leading-tight mb-4" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)", color: "#f0f6ff" }}>
            Создайте собственного AI-инфлюенсера
            <br />
            <span style={{ background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              за несколько минут
            </span>
          </h2>
        </div>

        <div className="space-y-5 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
                style={{ background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.38)", color: "#60a5fa" }}>
                {s.num}
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: "#e0eeff" }}>{s.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(148,190,255,0.6)" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.28)" }}>
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#4ade80" }}>Бета-версия запускается скоро</p>
            <p className="text-xs" style={{ color: "rgba(148,190,255,0.6)" }}>ранний доступ открыт</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 1: Email Entry ───────────────────────────────────────────────────────
interface Step1Props {
  email: string;
  setEmail: (v: string) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
  marketingConsent: boolean;
  setMarketingConsent: (v: boolean) => void;
  onNext: () => Promise<void>;
  isLoading: boolean;
  error: string;
}

function StepEmail({ email, setEmail, consent, setConsent, marketingConsent, setMarketingConsent, onNext, isLoading, error }: Step1Props) {
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onNext(); };
  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="font-display font-bold mb-2" style={{ fontSize: "clamp(1.6rem, 3vw, 2rem)", color: "var(--dfl-text-hi)" }}>
          Создать аккаунт
        </h1>
        <p style={{ color: "var(--dfl-text-lo)", fontSize: "0.95rem" }}>
          Присоединяйтесь к платформе нового поколения контента
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1,2,3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: s === 1 ? "var(--dfl-accent)" : "var(--dfl-surface-2)", color: s === 1 ? "white" : "var(--dfl-text-placeholder)", border: s === 1 ? "none" : "1px solid var(--dfl-border-1)" }}>
              {s}
            </div>
            {s < 3 && <div className="flex-1 h-0.5 w-8" style={{ background: "var(--dfl-border-1)" }} />}
          </div>
        ))}
        <span className="text-xs ml-2" style={{ color: "var(--dfl-text-placeholder)" }}>Шаг 1 из 3: Email</span>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-4 text-sm"
          style={{ background: "var(--dfl-error-muted)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--dfl-error)" }}>
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input-field"
            disabled={isLoading}
          />
          <p className="text-xs mt-1.5" style={{ color: "var(--dfl-text-placeholder)" }}>
            Мы отправим 4-значный код подтверждения
          </p>
        </div>

        {/* Consent — обязательно до отправки email (152-ФЗ) */}
        <div className="flex items-start gap-2.5">
          <button
            type="button" role="checkbox" aria-checked={consent}
            onClick={() => setConsent(!consent)}
            disabled={isLoading}
            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
            style={{
              background: consent ? "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))" : "var(--dfl-surface-2)",
              border: consent ? "1.5px solid var(--dfl-accent-hover)" : "1.5px solid var(--dfl-border-2)",
            }}
          >
            {consent && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </button>
          <label
            className="text-xs leading-relaxed cursor-pointer"
            style={{ color: "var(--dfl-text-subtle)", lineHeight: 1.6 }}
            onClick={() => !isLoading && setConsent(!consent)}
          >
            <span style={{ color: "var(--dfl-error)", marginRight: 2 }}>*</span>
            Принимаю{" "}
            <Link to="/terms" target="_blank" className="underline underline-offset-2" style={{ color: "var(--dfl-accent-bright)" }} onClick={(e) => e.stopPropagation()}>Условия использования</Link>{" "}и{" "}
            <Link to="/privacy-policy" target="_blank" className="underline underline-offset-2" style={{ color: "var(--dfl-accent-bright)" }} onClick={(e) => e.stopPropagation()}>Политику конфиденциальности</Link>.
            Даю согласие на обработку персональных данных в соответствии с{" "}
            <Link to="/consent" target="_blank" className="underline underline-offset-2" style={{ color: "var(--dfl-accent-bright)" }} onClick={(e) => e.stopPropagation()}>Согласием</Link>.
          </label>
        </div>

        {/* Marketing consent (152-ФЗ, ч.1 ст.18 ФЗ «О рекламе») — добровольно */}
        <div className="flex items-start gap-2.5">
          <button
            type="button" role="checkbox" aria-checked={marketingConsent}
            onClick={() => setMarketingConsent(!marketingConsent)}
            disabled={isLoading}
            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
            style={{
              background: marketingConsent ? "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))" : "var(--dfl-surface-2)",
              border: marketingConsent ? "1.5px solid var(--dfl-accent-hover)" : "1.5px solid var(--dfl-border-2)",
            }}
          >
            {marketingConsent && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </button>
          <label
            className="text-xs leading-relaxed cursor-pointer"
            style={{ color: "var(--dfl-text-subtle)", lineHeight: 1.6 }}
            onClick={() => !isLoading && setMarketingConsent(!marketingConsent)}
          >
            <span className="text-[10px] px-1 py-0.5 rounded mr-1" style={{ background: "var(--dfl-surface-2)", color: "var(--dfl-text-placeholder)", border: "1px solid var(--dfl-border-1)" }}>необязательно</span>
            Я согласен(на) на получение информационных и рекламных сообщений о платформе КовальЛабс
            на указанный email в соответствии с ч.&nbsp;1 ст.&nbsp;18 ФЗ «О рекламе».
            Согласие можно отозвать в любой момент, нажав «Отписаться» в письме.
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !validateEmail(email) || !consent}
          className="btn-primary w-full py-3.5 text-sm font-semibold"
          style={{ borderRadius: "0.875rem" }}
        >
          {isLoading ? (
            <><Loader2 size={16} className="animate-spin" />Отправляем код...</>
          ) : (
            <>Получить код <Mail size={16} /></>
          )}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: "var(--dfl-text-lo)" }}>
        Уже есть аккаунт?{" "}
        <Link to="/auth/login" className="font-semibold" style={{ color: "var(--dfl-accent-bright)" }}>
          Войти →
        </Link>
      </p>
    </div>
  );
}

// ── Step 2: OTP Verification ──────────────────────────────────────────────────
interface Step2Props {
  email: string;
  otp: string;
  setOtp: (v: string) => void;
  onNext: () => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error: string;
}

function StepOtp({ email, otp, setOtp, onNext, onResend, onBack, isLoading, error }: Step2Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(60);

  useState(() => {
    const iv = setInterval(() => {
      setResendCooldown((n) => { if (n <= 1) { clearInterval(iv); return 0; } return n - 1; });
    }, 1000);
    return () => clearInterval(iv);
  });

  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => otp[i] || "");

  const handleDigit = (idx: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1);
    const arr = [...digits];
    arr[idx] = d;
    setOtp(arr.join(""));
    if (d && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(text);
    const lastIdx = Math.min(text.length, OTP_LENGTH - 1);
    inputRefs.current[lastIdx]?.focus();
    e.preventDefault();
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    await onResend();
    setResendCooldown(60);
    const iv = setInterval(() => {
      setResendCooldown((n) => { if (n <= 1) { clearInterval(iv); return 0; } return n - 1; });
    }, 1000);
  };

  return (
    <div className="w-full max-w-md">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors duration-150" style={{ color: "var(--dfl-text-lo)" }}>
        <ChevronLeft size={15} />Назад
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          {[1,2,3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: s <= 2 ? (s < 2 ? "rgba(37,99,235,0.3)" : "var(--dfl-accent)") : "var(--dfl-surface-2)", color: s <= 2 ? "white" : "var(--dfl-text-placeholder)", border: s <= 2 ? "none" : "1px solid var(--dfl-border-1)" }}>
                {s < 2 ? "✓" : s}
              </div>
              {s < 3 && <div className="flex-1 h-0.5 w-8" style={{ background: s < 2 ? "rgba(37,99,235,0.4)" : "var(--dfl-border-1)" }} />}
            </div>
          ))}
          <span className="text-xs ml-2" style={{ color: "var(--dfl-text-placeholder)" }}>Шаг 2 из 3: Код</span>
        </div>

        <h1 className="font-display font-bold mb-2" style={{ fontSize: "clamp(1.5rem, 3vw, 1.9rem)", color: "var(--dfl-text-hi)" }}>
          Введите код
        </h1>
        <p className="text-sm" style={{ color: "var(--dfl-text-lo)" }}>
          Мы отправили {OTP_LENGTH}-значный код на{" "}
          <span className="font-semibold" style={{ color: "var(--dfl-accent-bright)" }}>{email}</span>
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-4 text-sm"
          style={{ background: "var(--dfl-error-muted)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--dfl-error)" }}>
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* OTP digit inputs */}
      <div className="flex gap-3 mb-6" onPaste={handlePaste}>
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i]}
            onChange={(e) => handleDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isLoading}
            className="flex-1 text-center font-display font-bold text-xl rounded-2xl transition-all duration-150 outline-none"
            style={{
              height: 64,
              background: "var(--dfl-surface-2)",
              border: `2px solid ${digits[i] ? "var(--dfl-accent)" : "var(--dfl-border-2)"}`,
              color: "var(--dfl-text-hi)",
              boxShadow: digits[i] ? "0 0 12px rgba(37,99,235,0.25)" : "none",
            }}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={isLoading || otp.length < OTP_LENGTH}
        className="btn-primary w-full py-3.5 text-sm font-semibold"
        style={{ borderRadius: "0.875rem" }}
      >
        {isLoading ? (
          <><Loader2 size={16} className="animate-spin" />Проверяем...</>
        ) : (
          <>Подтвердить <ArrowRight size={16} /></>
        )}
      </button>

      <div className="text-center mt-4">
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-sm"
          style={{ color: resendCooldown > 0 ? "var(--dfl-text-placeholder)" : "var(--dfl-accent-bright)" }}
        >
          {resendCooldown > 0 ? `Отправить повторно через ${resendCooldown}с` : "Отправить код повторно"}
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Set Password ──────────────────────────────────────────────────────
interface Step3Props {
  name: string;
  setName: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  consent?: boolean;
  setConsent?: (v: boolean) => void;
  marketingConsent?: boolean;
  setMarketingConsent?: (v: boolean) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error: string;
}

function StepPassword({ name, setName, password, setPassword, confirmPassword, setConfirmPassword, onSubmit, onBack, isLoading, error }: Omit<Step3Props, 'consent' | 'setConsent' | 'marketingConsent' | 'setMarketingConsent'>) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const pwdStrength = useMemo(() => getStrength(password), [password]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(); };

  return (
    <div className="w-full max-w-md">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm mb-6" style={{ color: "var(--dfl-text-lo)" }}>
        <ChevronLeft size={15} />Назад
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          {[1,2,3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: s < 3 ? "rgba(37,99,235,0.3)" : "var(--dfl-accent)", color: "white", border: "none" }}>
                {s < 3 ? "✓" : s}
              </div>
              {s < 3 && <div className="flex-1 h-0.5 w-8" style={{ background: "rgba(37,99,235,0.4)" }} />}
            </div>
          ))}
          <span className="text-xs ml-2" style={{ color: "var(--dfl-text-placeholder)" }}>Шаг 3 из 3: Пароль</span>
        </div>
        <h1 className="font-display font-bold mb-2" style={{ fontSize: "clamp(1.5rem, 3vw, 1.9rem)", color: "var(--dfl-text-hi)" }}>
          Придумайте пароль
        </h1>
        <p style={{ color: "var(--dfl-text-lo)", fontSize: "0.9rem" }}>Почти готово! Задайте имя и пароль для аккаунта.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-4 text-sm"
          style={{ background: "var(--dfl-error-muted)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--dfl-error)" }}>
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="reg-name" className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>
            Имя / Название бренда
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя или название бренда"
            className="input-field"
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>
            Пароль
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              className="input-field pr-11"
              disabled={isLoading}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--dfl-text-placeholder)" }} tabIndex={-1}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <PasswordStrength password={password} />
        </div>

        {/* Confirm */}
        <div>
          <label htmlFor="reg-confirm" className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>
            Повторите пароль
          </label>
          <div className="relative">
            <input
              id="reg-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              className="input-field pr-11"
              disabled={isLoading}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--dfl-text-placeholder)" }} tabIndex={-1}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {confirmPassword && password && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {password === confirmPassword ? (
                <><CheckCircle2 size={12} style={{ color: "#22c55e" }} /><span className="text-xs" style={{ color: "#22c55e" }}>Пароли совпадают</span></>
              ) : (
                <><AlertCircle size={12} style={{ color: "var(--dfl-error)" }} /><span className="text-xs" style={{ color: "var(--dfl-error)" }}>Пароли не совпадают</span></>
              )}
            </div>
          )}
        </div>

        {/* Согласие уже получено на шаге 1 — дублирование исключено */}
        <div className="px-3 py-2.5 rounded-xl text-xs leading-relaxed"
          style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", color: "var(--dfl-text-subtle)" }}>
          ✓ Согласие с условиями и на получение сообщений подтверждено на шаге 1
        </div>

        <button
          type="submit"
          disabled={isLoading || !password || !confirmPassword || password !== confirmPassword || !pwdStrength.checks.length}
          className="btn-primary w-full py-3.5 text-sm font-semibold mt-2"
          style={{ borderRadius: "0.875rem" }}
        >
          {isLoading ? (
            <><Loader2 size={16} className="animate-spin" />Создаём аккаунт...</>
          ) : (
            <>Создать аккаунт <ArrowRight size={16} /></>
          )}
        </button>
      </form>
    </div>
  );
}

// ── Registration Closed Notice ───────────────────────────────────────────────
function RegistrationClosedPage({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) {
  const formBg = isDark ? "var(--dfl-surface-1)" : "#ffffff";
  const surfaceBg = isDark ? "var(--dfl-bg)" : "#f8faff";
  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: surfaceBg }}>
      <div className="flex flex-col min-h-screen relative" style={{ background: formBg }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 sm:px-10 sm:py-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
              style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-display text-base font-bold" style={{ letterSpacing: "-0.02em" }}>
              <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
              <span className="text-accent-gradient">Лабс</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
              style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}>
              Войти
            </Link>
            <button onClick={toggleTheme} className="theme-toggle" style={{ width: 36, height: 36 }} aria-label="Тема">
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.35)" }}>
              <span className="text-3xl">🔒</span>
            </div>
            <h1 className="font-display font-bold mb-3" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--dfl-text-hi)" }}>
              Регистрация временно недоступна
            </h1>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--dfl-text-lo)" }}>
              Создание новых аккаунтов временно приостановлено в период закрытого бета-тестирования.
              Если у вас уже есть аккаунт — войдите ниже.
            </p>
            <div className="px-4 py-3 rounded-xl mb-8 text-sm"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "var(--dfl-warning)" }}>
              ⏳ Публичный запуск скоро — следите за обновлениями
            </div>
            <Link to="/auth/login"
              className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold"
              style={{ borderRadius: "0.875rem", textDecoration: "none" }}>
              Войти в аккаунт <ArrowRight size={16} />
            </Link>
            <p className="mt-6 text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
              Хотите ранний доступ?{" "}
              <Link to="/#waitlist" className="underline underline-offset-2" style={{ color: "var(--dfl-accent-bright)" }}>
                Оставьте заявку на главной →
              </Link>
            </p>
          </div>
        </div>

        <div className="px-6 py-4 sm:px-10">
          <div className="flex items-center justify-center gap-4">
            {[{ label: "Политика конфиденциальности", to: "/privacy-policy" }, { label: "Условия использования", to: "/terms" }].map((l) => (
              <Link key={l.to} to={l.to} className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
      <RegisterPromoPanel />
    </div>
  );
}

// ── Main Register Page ────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  // ── REGISTRATION TEMPORARILY DISABLED ──
  return <RegistrationClosedPage isDark={isDark} toggleTheme={toggleTheme} />;

  // Multi-step state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formBg = isDark ? "var(--dfl-surface-1)" : "#ffffff";
  const surfaceBg = isDark ? "var(--dfl-bg)" : "#f8faff";

  // ── Step 1: Send OTP ──
  const handleSendOtp = async () => {
    setError("");
    if (!email) return;
    setIsLoading(true);
    try {
      await authService.sendOtp(email);
      setStep(2);
      toast.success("Код отправлен на " + email);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка отправки кода";
      setError(msg.includes("rate limit") ? "Слишком много попыток. Подождите немного." : msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP (custom SMTP) ──
  const handleVerifyOtp = async () => {
    setError("");
    if (otp.length < OTP_LENGTH) return;
    setIsLoading(true);
    try {
      await authService.verifyOtp(email, otp);
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Неверный код";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Create account ──
  const handleSetPassword = async () => {
    setError("");
    if (!password || password !== confirmPassword) { setError("Пароли не совпадают"); return; }
    if (!consent) { setError("Необходимо согласие с условиями использования (шаг 1)"); return; }
    setIsLoading(true);
    try {
      const username = name || email.split("@")[0];
      const { supabase } = await import("@/lib/supabase");
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (signUpError) throw signUpError;
      if (data.user) {
        login(mapAuthUser(data.user));
        toast.success("Добро пожаловать в КовальЛабс! 🎉");
        navigate("/dashboard");
      } else {
        toast.success("Аккаунт создан! Войдите в систему.");
        navigate("/auth/login");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка создания аккаунта";
      setError(msg.includes("already registered") ? "Email уже зарегистрирован. Попробуйте войти." : msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: surfaceBg }}>
      <div className="flex flex-col min-h-screen relative" style={{ background: formBg }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 sm:px-10 sm:py-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
              style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-display text-base font-bold" style={{ letterSpacing: "-0.02em" }}>
              <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
              <span className="text-accent-gradient">Лабс</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block" style={{ color: "var(--dfl-text-lo)" }}>Уже есть аккаунт?</span>
            <Link to="/auth/login" className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
              style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}>
              Войти
            </Link>
            <button onClick={toggleTheme} className="theme-toggle" style={{ width: 36, height: 36 }} aria-label="Тема">
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 sm:px-10">
          {step === 1 && (
            <StepEmail
              email={email} setEmail={setEmail}
              consent={consent} setConsent={setConsent}
              marketingConsent={marketingConsent} setMarketingConsent={setMarketingConsent}
              onNext={handleSendOtp} isLoading={isLoading} error={error}
            />
          )}
          {step === 2 && (
            <StepOtp
              email={email} otp={otp} setOtp={setOtp}
              onNext={handleVerifyOtp} onResend={handleSendOtp}
              onBack={() => { setStep(1); setOtp(""); setError(""); }}
              isLoading={isLoading} error={error}
            />
          )}
          {step === 3 && (
            <StepPassword
              name={name} setName={setName}
              password={password} setPassword={setPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              onSubmit={handleSetPassword}
              onBack={() => { setStep(2); setError(""); }}
              isLoading={isLoading} error={error}
            />
          )}
        </div>

        <div className="px-6 py-4 sm:px-10">
          <div className="flex items-center justify-center gap-4">
            {[{ label: "Политика конфиденциальности", to: "/privacy-policy" }, { label: "Условия использования", to: "/terms" }].map((l) => (
              <Link key={l.to} to={l.to} className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <RegisterPromoPanel />
    </div>
  );
}
