import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2, Zap, Sun, Moon, ChevronLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth, authService, mapAuthUser } from "@/contexts/AuthContext";

// ── Promo Panel ───────────────────────────────────────────────────────────────
function PromoPanel() {
  const bullets = [
    { icon: "📸", text: "60–100 единиц контента в месяц с одним персонажем" },
    { icon: "⚡", text: "От идеи до публикации за 2–6 часов" },
    { icon: "🎯", text: "Один AI-инфлюенсер для всех кампаний и каналов" },
  ];

  return (
    <div
      className="hidden lg:flex flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #0c1f4a 0%, #112259 35%, #1a1a5e 70%, #0d0d2b 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(96,165,250,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.8) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 30% 20%, rgba(37,99,235,0.25) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(99,102,241,0.18) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10">
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.35)",
              color: "#93c5fd",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Бета-версия · запуск скоро
          </div>
          <h2
            className="font-display font-bold leading-tight mb-4"
            style={{ fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)", color: "#f0f6ff" }}
          >
            Ваш AI-инфлюенсер
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ждёт вас
            </span>
          </h2>
          <p style={{ color: "rgba(148,190,255,0.75)", fontSize: "0.95rem", lineHeight: 1.7 }}>
            Создайте цифрового персонажа один раз — и генерируйте неограниченный контент без съёмок и агентств.
          </p>
        </div>

        <div className="space-y-4 mb-10">
          {bullets.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}
              >
                {b.icon}
              </div>
              <p style={{ color: "rgba(148,190,255,0.85)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                {b.text}
              </p>
            </div>
          ))}
        </div>

        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.28)" }}
        >
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "#4ade80" }}>
              Бета-версия запускается скоро
            </p>
            <p className="text-xs" style={{ color: "rgba(148,190,255,0.6)" }}>
              ранний доступ открыт
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8">
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(59,130,246,0.2)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
              <div className="w-2 h-2 rounded-full" style={{ background: "#f59e0b" }} />
              <div className="w-2 h-2 rounded-full" style={{ background: "#22c55e" }} />
            </div>
            <div
              className="flex-1 rounded px-2 py-0.5 text-center font-mono"
              style={{ background: "rgba(0,0,0,0.3)", color: "rgba(148,190,255,0.5)", fontSize: "10px" }}
            >
              app.kovalabs.ai/dashboard
            </div>
          </div>
          <div className="space-y-2">
            {["👩‍💼 Nova · 34 генерации", "📸 Последняя сессия: 4 фото", "⚡ Баланс: 4 850 pts"].map((line, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)", color: "rgba(148,190,255,0.75)" }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const emailRef = useRef<HTMLInputElement>(null);
  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // Redirect target after login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errs: typeof fieldErrors = {};
    if (!email) errs.email = "Введите ваш email";
    else if (!validateEmail(email)) errs.email = "Введите корректный email-адрес";
    if (!password) errs.password = "Введите пароль";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setIsLoading(true);

    try {
      const user = await authService.signIn(email, password);
      login(mapAuthUser(user));
      toast.success("Добро пожаловать!");
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка входа";
      if (msg.includes("Invalid login credentials")) {
        setError("Неверный email или пароль. Проверьте данные и попробуйте снова.");
      } else if (msg.includes("Email not confirmed")) {
        setError("Email не подтверждён. Проверьте почту и пройдите OTP-верификацию.");
      } else {
        setError(msg);
      }
      setIsLoading(false);
    }
  };

  const surfaceBg = isDark ? "var(--dfl-bg)" : "#f8faff";
  const formBg = isDark ? "var(--dfl-surface-1)" : "#ffffff";

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: surfaceBg }}>
      <div className="flex flex-col min-h-screen relative" style={{ background: formBg }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 sm:px-10 sm:py-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
              style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 16px rgba(37,99,235,0.5)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
            >
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-display text-base font-bold" style={{ letterSpacing: "-0.02em" }}>
              <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
              <span className="text-accent-gradient">Лабс</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block" style={{ color: "var(--dfl-text-lo)" }}>
              Нет аккаунта?
            </span>
            <Link
              to="/auth/register"
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
              style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}
            >
              Регистрация
            </Link>
            <button onClick={toggleTheme} className="theme-toggle" style={{ width: 36, height: 36 }} aria-label="Переключить тему">
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1
                className="font-display font-bold mb-2"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2rem)", color: "var(--dfl-text-hi)" }}
              >
                Войти в аккаунт
              </h1>
              <p style={{ color: "var(--dfl-text-lo)", fontSize: "0.95rem" }}>
                Создавайте контент с вашим AI-инфлюенсером
              </p>
            </div>

            {error && (
              <div
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-6 text-sm"
                style={{ background: "var(--dfl-error-muted)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--dfl-error)" }}
              >
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>
                  Email
                </label>
                <input
                  id="email"
                  ref={emailRef}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="your@email.com"
                  className="input-field"
                  disabled={isLoading}
                  style={{ borderColor: fieldErrors.email ? "var(--dfl-error)" : undefined }}
                />
                {fieldErrors.email && <p className="text-xs mt-1.5" style={{ color: "var(--dfl-error)" }}>{fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--dfl-text-mid)" }}>
                    Пароль
                  </label>
                  <Link to="/auth/reset-password" className="text-xs" style={{ color: "var(--dfl-accent-bright)" }}>
                    Забыли пароль?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                    placeholder="Введите пароль"
                    className="input-field pr-11"
                    disabled={isLoading}
                    style={{ borderColor: fieldErrors.password ? "var(--dfl-error)" : undefined }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--dfl-text-placeholder)" }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs mt-1.5" style={{ color: "var(--dfl-error)" }}>{fieldErrors.password}</p>}
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={rememberMe}
                  onClick={() => setRememberMe(!rememberMe)}
                  disabled={isLoading}
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    background: rememberMe ? "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))" : "var(--dfl-surface-2)",
                    border: rememberMe ? "1.5px solid var(--dfl-accent-hover)" : "1.5px solid var(--dfl-border-2)",
                    boxShadow: rememberMe ? "0 0 10px var(--dfl-glow-blue)" : "none",
                  }}
                >
                  {rememberMe && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <label
                  className="text-sm cursor-pointer select-none"
                  style={{ color: "var(--dfl-text-lo)" }}
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  Запомнить меня
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3.5 text-sm font-semibold mt-2"
                style={{ borderRadius: "0.875rem" }}
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" />Входим...</>
                ) : (
                  <>Войти <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <p className="text-center text-sm mt-8" style={{ color: "var(--dfl-text-lo)" }}>
              Нет аккаунта?{" "}
              <Link to="/auth/register" className="font-semibold" style={{ color: "var(--dfl-accent-bright)" }}>
                Зарегистрироваться →
              </Link>
            </p>
          </div>
        </div>

        <div className="px-6 py-4 sm:px-10">
          <div className="flex items-center justify-center gap-4">
            {[
              { label: "Политика конфиденциальности", to: "/privacy-policy" },
              { label: "Условия использования", to: "/terms" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <PromoPanel />
    </div>
  );
}
