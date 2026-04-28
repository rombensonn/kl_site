import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2, Zap, Sun, Moon, ChevronLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth, authService, mapAuthUser } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// ── Security promo panel ──────────────────────────────────────────────────────
function SecurityPromoPanel({ stage }: { stage: "request" | "reset" }) {
  return (
    <div
      className="hidden lg:flex flex-col justify-center p-10 xl:p-14 relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #0c1f4a 0%, #112259 35%, #1a1a5e 70%, #0d0d2b 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{ backgroundImage: "linear-gradient(rgba(96,165,250,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.8) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 30% 30%, rgba(37,99,235,0.25) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(99,102,241,0.15) 0%, transparent 60%)" }} />

      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
          style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.35)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="#60a5fa" strokeWidth="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.5" fill="#60a5fa" />
          </svg>
        </div>

        <h2 className="font-display font-bold leading-tight mb-4" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", color: "#f0f6ff" }}>
          Безопасность ваших данных —
          <br />
          <span style={{ background: "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            наш приоритет
          </span>
        </h2>

        <div className="space-y-4 mb-8">
          {[
            { icon: "⏱️", text: stage === "request" ? "Ссылка для сброса действительна 1 час" : "Ваш новый пароль будет зашифрован автоматически" },
            { icon: "🔒", text: "Мы используем современное шифрование данных" },
            { icon: "🛡️", text: "Если вы не запрашивали сброс — просто проигнорируйте письмо" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
                {item.icon}
              </div>
              <p className="text-sm leading-relaxed pt-1" style={{ color: "rgba(148,190,255,0.8)" }}>{item.text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(59,130,246,0.18)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(148,190,255,0.5)" }}>
            Совет по безопасности
          </p>
          <p className="text-sm" style={{ color: "rgba(148,190,255,0.75)", lineHeight: 1.6 }}>
            Используйте уникальный пароль для каждого сервиса и менеджер паролей для их хранения.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Stage 1: Request Reset ────────────────────────────────────────────────────
function RequestResetForm() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const startCooldown = () => {
    setResendCooldown(60);
    const iv = setInterval(() => {
      setResendCooldown((n) => { if (n <= 1) { clearInterval(iv); return 0; } return n - 1; });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setEmailError("Введите ваш email"); return; }
    if (!validateEmail(email)) { setEmailError("Введите корректный email-адрес"); return; }
    setEmailError("");
    setIsLoading(true);
    try {
      await authService.sendPasswordReset(email);
      setSubmitted(true);
      startCooldown();
      toast.success("Письмо отправлено!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка";
      setEmailError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      await authService.sendPasswordReset(email);
      startCooldown();
      toast.success("Письмо отправлено повторно");
    } catch {
      toast.error("Не удалось отправить письмо");
    } finally {
      setIsLoading(false);
    }
  };

  const formBg = isDark ? "var(--dfl-surface-1)" : "#ffffff";
  const surfaceBg = isDark ? "var(--dfl-bg)" : "#f8faff";

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: surfaceBg }}>
      <div className="flex flex-col min-h-screen" style={{ background: formBg }}>
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
          <button onClick={toggleTheme} className="theme-toggle" style={{ width: 36, height: 36 }} aria-label="Тема">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8 sm:px-10">
          {!submitted ? (
            <div className="w-full max-w-md">
              <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors duration-150" style={{ color: "var(--dfl-text-lo)" }}>
                <ChevronLeft size={15} />Назад к входу
              </Link>
              <div className="mb-8">
                <h1 className="font-display font-bold mb-2" style={{ fontSize: "clamp(1.6rem, 3vw, 2rem)", color: "var(--dfl-text-hi)" }}>
                  Восстановление пароля
                </h1>
                <p style={{ color: "var(--dfl-text-lo)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Введите email, на который зарегистрирован ваш аккаунт. Мы отправим ссылку для сброса пароля.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>Email</label>
                  <input
                    id="reset-email" type="email" autoComplete="email"
                    value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    placeholder="your@email.com" className="input-field" disabled={isLoading}
                    style={{ borderColor: emailError ? "var(--dfl-error)" : undefined }}
                  />
                  {emailError && <p className="text-xs mt-1.5" style={{ color: "var(--dfl-error)" }}>{emailError}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-sm font-semibold" style={{ borderRadius: "0.875rem" }}>
                  {isLoading ? (
                    <><Loader2 size={16} className="animate-spin" />Отправляем...</>
                  ) : (
                    <>Отправить ссылку для сброса <ArrowRight size={16} /></>
                  )}
                </button>
              </form>
              <p className="text-sm text-center mt-8" style={{ color: "var(--dfl-text-lo)" }}>
                Вспомнили пароль?{" "}
                <Link to="/auth/login" className="font-semibold" style={{ color: "var(--dfl-accent-bright)" }}>Войти →</Link>
              </p>
            </div>
          ) : (
            <div className="w-full max-w-md">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)" }}>
                <Mail size={28} style={{ color: "#60a5fa" }} />
              </div>
              <h1 className="font-display font-bold mb-3" style={{ fontSize: "1.75rem", color: "var(--dfl-text-hi)" }}>
                Проверьте почту
              </h1>
              <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--dfl-text-lo)" }}>
                Если аккаунт с адресом{" "}
                <span className="font-semibold" style={{ color: "var(--dfl-accent-bright)" }}>{email}</span>{" "}
                существует, мы отправили письмо со ссылкой для сброса пароля.
              </p>
              <div className="rounded-2xl p-5 my-6 space-y-2" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}>
                <p className="text-sm font-medium mb-3" style={{ color: "var(--dfl-text-mid)" }}>Не получили письмо?</p>
                {["Проверьте папку «Спам»", "Убедитесь, что email указан верно", "Письмо может идти до 5 минут"].map((tip) => (
                  <div key={tip} className="flex items-center gap-2 text-sm" style={{ color: "var(--dfl-text-lo)" }}>
                    <span style={{ color: "var(--dfl-accent-bright)", flexShrink: 0 }}>•</span>{tip}
                  </div>
                ))}
              </div>
              <button onClick={handleResend} disabled={resendCooldown > 0 || isLoading} className="text-sm font-medium mb-6 transition-colors duration-150"
                style={{ color: resendCooldown > 0 ? "var(--dfl-text-placeholder)" : "var(--dfl-accent-bright)", display: "block" }}>
                {isLoading ? <span className="flex items-center gap-1.5"><Loader2 size={13} className="animate-spin" />Отправляем...</span>
                  : resendCooldown > 0 ? `Отправить повторно через ${resendCooldown}с` : "Отправить повторно"}
              </button>
              <div className="border-t pt-6" style={{ borderColor: "var(--dfl-border-1)" }}>
                <Link to="/auth/login" className="btn-secondary text-sm w-full py-3 flex items-center justify-center gap-2">
                  <ChevronLeft size={15} />Вернуться к входу
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 sm:px-10">
          <div className="flex items-center justify-center gap-4">
            {[{ label: "Политика конфиденциальности", to: "/privacy-policy" }, { label: "Условия использования", to: "/terms" }].map((l) => (
              <Link key={l.to} to={l.to} className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
      <SecurityPromoPanel stage="request" />
    </div>
  );
}

// ── Stage 2: New Password Form (after email link click) ───────────────────────
function NewPasswordForm() {
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});

  const strength = password ? (() => {
    const score = [password.length >= 6, /[A-Z]/.test(password), /[0-9]/.test(password)].filter(Boolean).length;
    return score <= 1
      ? { label: "Слабый", color: "#ef4444", width: "33%" }
      : score === 2
      ? { label: "Средний", color: "#f59e0b", width: "66%" }
      : { label: "Надёжный", color: "#22c55e", width: "100%" };
  })() : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof fieldErrors = {};
    if (!password || password.length < 6) errs.password = "Минимум 6 символов";
    if (!confirmPassword) errs.confirm = "Повторите пароль";
    else if (password !== confirmPassword) errs.confirm = "Пароли не совпадают";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setIsLoading(true);
    try {
      const user = await authService.updatePassword(password);
      login(mapAuthUser(user));
      setDone(true);
      toast.success("Пароль успешно изменён!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка обновления пароля";
      setFieldErrors({ password: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const formBg = isDark ? "var(--dfl-surface-1)" : "#ffffff";
  const surfaceBg = isDark ? "var(--dfl-bg)" : "#f8faff";

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: surfaceBg }}>
      <div className="flex flex-col min-h-screen" style={{ background: formBg }}>
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
          <button onClick={toggleTheme} className="theme-toggle" style={{ width: 36, height: 36 }} aria-label="Тема">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8 sm:px-10">
          {done ? (
            <div className="w-full max-w-md text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)" }}>
                <CheckCircle size={36} style={{ color: "#22c55e" }} />
              </div>
              <h1 className="font-display font-bold mb-3" style={{ fontSize: "1.75rem", color: "var(--dfl-text-hi)" }}>
                Пароль обновлён!
              </h1>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--dfl-text-lo)" }}>
                Ваш пароль успешно изменён. Теперь вы можете войти в дашборд.
              </p>
              <button onClick={() => navigate("/dashboard")} className="btn-primary px-8 py-3.5 text-sm">
                Перейти в дашборд <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md">
              <Link to="/auth/login" className="inline-flex items-center gap-1.5 text-sm mb-8" style={{ color: "var(--dfl-text-lo)" }}>
                <ChevronLeft size={15} />Назад к входу
              </Link>
              <div className="mb-8">
                <h1 className="font-display font-bold mb-2" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--dfl-text-hi)" }}>
                  Новый пароль
                </h1>
                <p style={{ color: "var(--dfl-text-lo)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  Придумайте надёжный пароль для вашего аккаунта КовальЛабс.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>Новый пароль</label>
                  <div className="relative">
                    <input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password"
                      value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                      placeholder="Минимум 6 символов" className="input-field pr-11" disabled={isLoading}
                      style={{ borderColor: fieldErrors.password ? "var(--dfl-error)" : undefined }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--dfl-text-placeholder)" }} tabIndex={-1}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-xs mt-1.5" style={{ color: "var(--dfl-error)" }}>{fieldErrors.password}</p>}
                  {strength && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--dfl-surface-3)" }}>
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, background: strength.color }} />
                      </div>
                      <span className="text-xs font-semibold w-16 text-right" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm-new" className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>Повторите пароль</label>
                  <div className="relative">
                    <input id="confirm-new" type={showConfirm ? "text" : "password"} autoComplete="new-password"
                      value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirm: undefined })); }}
                      placeholder="Повторите новый пароль" className="input-field pr-11" disabled={isLoading}
                      style={{ borderColor: fieldErrors.confirm ? "var(--dfl-error)" : undefined }} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--dfl-text-placeholder)" }} tabIndex={-1}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.confirm && <p className="text-xs mt-1.5" style={{ color: "var(--dfl-error)" }}>{fieldErrors.confirm}</p>}
                  {confirmPassword && password && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {password === confirmPassword ? (
                        <><CheckCircle size={12} style={{ color: "#22c55e" }} /><span className="text-xs" style={{ color: "#22c55e" }}>Пароли совпадают</span></>
                      ) : (
                        <><AlertCircle size={12} style={{ color: "var(--dfl-error)" }} /><span className="text-xs" style={{ color: "var(--dfl-error)" }}>Пароли не совпадают</span></>
                      )}
                    </div>
                  )}
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-sm font-semibold" style={{ borderRadius: "0.875rem" }}>
                  {isLoading ? (
                    <><Loader2 size={16} className="animate-spin" />Сохраняем пароль...</>
                  ) : (
                    <>Установить новый пароль <ArrowRight size={16} /></>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="px-6 py-4 sm:px-10">
          <div className="flex items-center justify-center gap-4">
            {[{ label: "Политика конфиденциальности", to: "/privacy-policy" }, { label: "Условия использования", to: "/terms" }].map((l) => (
              <Link key={l.to} to={l.to} className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
      <SecurityPromoPanel stage="reset" />
    </div>
  );
}

// ── Router: detect PASSWORD_RECOVERY session ──────────────────────────────────
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [isRecovery, setIsRecovery] = useState(supabase.hasRecoveryToken());

  useEffect(() => {
    const token = searchParams.get("recovery_token");
    if (token) {
      supabase.setRecoveryToken(token);
      setIsRecovery(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (isRecovery) return <NewPasswordForm />;
  return <RequestResetForm />;
}
