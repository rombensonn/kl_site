import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Zap, Sun, Moon, ArrowLeft, Loader2, Eye, EyeOff, User,
  Lock, Trash2, CheckCircle2, XCircle, AlertCircle, AlertTriangle, Save,
  CreditCard, ArrowRight, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth, authService, mapAuthUser } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(pwd: string) {
  const checks = {
    length: pwd.length >= 6,
    upper: /[A-Z]/.test(pwd),
    digit: /[0-9]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return {
    checks,
    level: score <= 1 ? "weak" : score <= 2 ? "medium" : ("strong" as "weak" | "medium" | "strong"),
  };
}

const STRENGTH_META = {
  weak:   { label: "Слабый",   color: "#ef4444", width: "33%" },
  medium: { label: "Средний",  color: "#f59e0b", width: "66%" },
  strong: { label: "Надёжный", color: "#22c55e", width: "100%" },
};

// ── Plan config ──────────────────────────────────────────────────────────────
const PLAN_META = {
  free: {
    id: "free",
    label: "Free",
    color: "#60a5fa",
    bg: "rgba(37,99,235,0.1)",
    border: "rgba(37,99,235,0.28)",
    price: "Бесплатно",
    nextBilling: null,
  },
  pro: {
    id: "pro",
    label: "Pro",
    color: "#3b82f6",
    bg: "rgba(37,99,235,0.12)",
    border: "rgba(59,130,246,0.45)",
    price: "2 990 ₽ / мес",
    nextBilling: "1 февраля 2026",
  },
  studio: {
    id: "studio",
    label: "Studio",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.38)",
    price: "7 990 ₽ / мес",
    nextBilling: "1 февраля 2026",
  },
} as const;

type PlanId = keyof typeof PLAN_META;

// ── Section card wrapper ──────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)" }}
    >
      <div
        className="flex items-center gap-3 px-6 py-4 border-b"
        style={{ borderColor: "var(--dfl-border-1)" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)" }}
        >
          <Icon size={15} style={{ color: "var(--dfl-accent-bright)" }} />
        </div>
        <h2 className="text-sm font-semibold" style={{ color: "var(--dfl-text-hi)" }}>{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── Subscription Section ─────────────────────────────────────────────────────
function SubscriptionSection() {
  const { user } = useAuth();

  // In beta — everyone is on Free plan.
  // When billing is integrated, replace this with a real DB query.
  const currentPlanId: PlanId = "free";
  const plan = PLAN_META[currentPlanId];

  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["user-balance", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_balances")
        .select("points")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const credits = balanceData?.points ?? (balanceLoading ? null : 0);

  return (
    <SectionCard title="Подписка" icon={CreditCard}>
      <div className="space-y-4">
        {/* Current plan badge */}
        <div
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: plan.bg, border: `1px solid ${plan.border}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${plan.color}20`, border: `1px solid ${plan.border}` }}
            >
              <Sparkles size={16} style={{ color: plan.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: "var(--dfl-text-hi)" }}>Тариф {plan.label}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${plan.color}18`, border: `1px solid ${plan.border}`, color: plan.color }}
                >
                  {currentPlanId === "free" ? "Бесплатный" : "Активен"}
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--dfl-text-subtle)" }}>
                {plan.price}
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Credits */}
          <div
            className="flex flex-col gap-1 p-3 rounded-xl"
            style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}
          >
            <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--dfl-text-placeholder)" }}>Кредиты</span>
            {balanceLoading ? (
              <div className="h-5 w-12 rounded animate-pulse" style={{ background: "var(--dfl-surface-3)" }} />
            ) : (
              <span className="text-base font-bold" style={{ color: "var(--dfl-text-hi)" }}>
                {(credits ?? 0).toLocaleString()}
                <span className="text-xs font-normal ml-1" style={{ color: "var(--dfl-text-subtle)" }}>кр</span>
              </span>
            )}
          </div>

          {/* Next billing */}
          <div
            className="flex flex-col gap-1 p-3 rounded-xl"
            style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}
          >
            <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--dfl-text-placeholder)" }}>Списание</span>
            <span className="text-sm font-semibold" style={{ color: plan.nextBilling ? "var(--dfl-text-hi)" : "var(--dfl-text-placeholder)" }}>
              {plan.nextBilling ?? "—"}
            </span>
          </div>

          {/* Renewal */}
          <div
            className="flex flex-col gap-1 p-3 rounded-xl"
            style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}
          >
            <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--dfl-text-placeholder)" }}>Период</span>
            <span className="text-sm font-semibold" style={{ color: "var(--dfl-text-mid)" }}>
              {currentPlanId === "free" ? "Бессрочно" : "Ежемесячно"}
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link
          to="/pricing"
          className="flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, rgba(29,78,216,0.12), rgba(99,102,241,0.08))",
            border: "1px solid rgba(59,130,246,0.3)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(29,78,216,0.18), rgba(99,102,241,0.12))";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, rgba(29,78,216,0.12), rgba(99,102,241,0.08))";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.3)";
          }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--dfl-text-hi)" }}>Сменить тариф</p>
            <p className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>Pro от 2 990 ₽/мес · Studio от 7 990 ₽/мес</p>
          </div>
          <ArrowRight size={16} style={{ color: "var(--dfl-accent-bright)", flexShrink: 0 }} />
        </Link>

        {currentPlanId === "free" && (
          <p className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
            Бета-период: тарифы Pro и Studio будут доступны после публичного запуска. Ранние участники получают зафиксированные цены.
          </p>
        )}
      </div>
    </SectionCard>
  );
}

// ── Profile Section ───────────────────────────────────────────────────────────
function ProfileSection() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const isDirty = username.trim() !== (user?.username || "");
  const isValid = username.trim().length >= 2;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || !isValid) return;
    setError("");
    setIsLoading(true);
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: { username: username.trim() },
      });
      if (updateError) throw updateError;
      if (data.user) login(mapAuthUser(data.user));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success("Имя пользователя обновлено");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка обновления профиля");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SectionCard title="Профиль" icon={User}>
      <form onSubmit={handleSave} className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#2563eb,#6366f1)", color: "white" }}
          >
            {(username?.[0] || "U").toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--dfl-text-hi)" }}>
              {username || "Пользователь"}
            </p>
            <p className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>
            Email
          </label>
          <input
            type="email"
            value={user?.email || ""}
            readOnly
            className="input-field"
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          />
          <p className="text-xs mt-1" style={{ color: "var(--dfl-text-placeholder)" }}>
            Email изменить нельзя
          </p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>
            Имя пользователя
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(""); }}
            placeholder="Ваше имя или название бренда"
            className="input-field"
            disabled={isLoading}
            style={{ borderColor: error ? "var(--dfl-error)" : undefined }}
          />
          {error && (
            <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--dfl-error)" }}>
              <AlertCircle size={11} />{error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !isDirty || !isValid}
          className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2"
          style={{ borderRadius: "0.875rem" }}
        >
          {isLoading ? (
            <><Loader2 size={14} className="animate-spin" />Сохраняем...</>
          ) : saved ? (
            <><CheckCircle2 size={14} />Сохранено!</>
          ) : (
            <><Save size={14} />Сохранить изменения</>
          )}
        </button>
      </form>
    </SectionCard>
  );
}

// ── Password Section ──────────────────────────────────────────────────────────
function PasswordSection() {
  const { login } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string; general?: string }>({});
  const [saved, setSaved] = useState(false);

  const strength = useMemo(() => newPassword ? getStrength(newPassword) : null, [newPassword]);
  const strengthMeta = strength ? STRENGTH_META[strength.level] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!currentPassword) errs.current = "Введите текущий пароль";
    if (!newPassword || newPassword.length < 6) errs.new = "Минимум 6 символов";
    if (!confirmPassword) errs.confirm = "Повторите новый пароль";
    else if (newPassword !== confirmPassword) errs.confirm = "Пароли не совпадают";
    if (newPassword === currentPassword) errs.new = "Новый пароль совпадает с текущим";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);

    try {
      // Re-authenticate with current password first
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user?.email;
      if (!email) throw new Error("Сессия не найдена");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) {
        setErrors({ current: "Неверный текущий пароль" });
        setIsLoading(false);
        return;
      }

      // Update password
      const user = await authService.updatePassword(newPassword);
      login(mapAuthUser(user));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success("Пароль успешно изменён");
    } catch (err: unknown) {
      setErrors({ general: err instanceof Error ? err.message : "Ошибка смены пароля" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SectionCard title="Смена пароля" icon={Lock}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
            style={{ background: "var(--dfl-error-muted)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--dfl-error)" }}
          >
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Current password */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>
            Текущий пароль
          </label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setErrors((p) => ({ ...p, current: undefined })); }}
              placeholder="Введите текущий пароль"
              className="input-field pr-11"
              disabled={isLoading}
              style={{ borderColor: errors.current ? "var(--dfl-error)" : undefined }}
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--dfl-text-placeholder)" }} tabIndex={-1}>
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.current && <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--dfl-error)" }}><AlertCircle size={11} />{errors.current}</p>}
        </div>

        {/* New password */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>
            Новый пароль
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, new: undefined })); }}
              placeholder="Минимум 6 символов"
              className="input-field pr-11"
              disabled={isLoading}
              style={{ borderColor: errors.new ? "var(--dfl-error)" : undefined }}
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--dfl-text-placeholder)" }} tabIndex={-1}>
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.new && <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--dfl-error)" }}><AlertCircle size={11} />{errors.new}</p>}

          {/* Strength bar */}
          {strengthMeta && newPassword && (
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--dfl-surface-3)" }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: strengthMeta.width, background: strengthMeta.color }} />
                </div>
                <span className="text-xs font-semibold w-16 text-right" style={{ color: strengthMeta.color }}>{strengthMeta.label}</span>
              </div>
              {strength && (
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { label: "Минимум 6 символов", ok: strength.checks.length },
                    { label: "Заглавная буква", ok: strength.checks.upper },
                    { label: "Цифра", ok: strength.checks.digit },
                    { label: "Спецсимвол", ok: strength.checks.special },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-1.5">
                      {r.ok
                        ? <CheckCircle2 size={11} style={{ color: "#22c55e", flexShrink: 0 }} />
                        : <XCircle size={11} style={{ color: "var(--dfl-text-placeholder)", flexShrink: 0 }} />
                      }
                      <span className="text-[10px]" style={{ color: r.ok ? "var(--dfl-text-mid)" : "var(--dfl-text-placeholder)" }}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>
            Повторите новый пароль
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirm: undefined })); }}
              placeholder="Повторите новый пароль"
              className="input-field pr-11"
              disabled={isLoading}
              style={{ borderColor: errors.confirm ? "var(--dfl-error)" : undefined }}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--dfl-text-placeholder)" }} tabIndex={-1}>
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirm && <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--dfl-error)" }}><AlertCircle size={11} />{errors.confirm}</p>}
          {confirmPassword && newPassword && !errors.confirm && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {newPassword === confirmPassword
                ? <><CheckCircle2 size={12} style={{ color: "#22c55e" }} /><span className="text-xs" style={{ color: "#22c55e" }}>Пароли совпадают</span></>
                : <><AlertCircle size={12} style={{ color: "var(--dfl-error)" }} /><span className="text-xs" style={{ color: "var(--dfl-error)" }}>Пароли не совпадают</span></>
              }
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
          className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2"
          style={{ borderRadius: "0.875rem" }}
        >
          {isLoading ? (
            <><Loader2 size={14} className="animate-spin" />Меняем пароль...</>
          ) : saved ? (
            <><CheckCircle2 size={14} />Пароль изменён!</>
          ) : (
            <><Lock size={14} />Изменить пароль</>
          )}
        </button>
      </form>
    </SectionCard>
  );
}

// ── Delete Account Section ────────────────────────────────────────────────────
function DeleteAccountSection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const expectedText = "удалить аккаунт";
  const canDelete = confirmText.toLowerCase() === expectedText;

  const handleDelete = async () => {
    if (!canDelete) return;
    setIsLoading(true);
    setError("");
    try {
      const { error: deleteError } = await supabase.functions.invoke("delete-account");
      const res = { ok: !deleteError };

      if (!res.ok) {
        // Fallback: sign out even if deletion fails
        await logout();
        navigate("/");
        toast.success("Вы вышли из аккаунта");
        return;
      }

      await logout();
      navigate("/");
      toast.success("Аккаунт удалён");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка удаления аккаунта");
      setIsLoading(false);
    }
  };

  return (
    <SectionCard title="Удаление аккаунта" icon={Trash2}>
      <div className="space-y-4">
        <div
          className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#ef4444" }}>
              Это действие необратимо
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
              После удаления аккаунта все ваши данные, проекты и баланс кредитов будут безвозвратно удалены. Восстановление невозможно.
            </p>
          </div>
        </div>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#ef4444",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.14)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)")}
          >
            <Trash2 size={14} />
            Удалить аккаунт
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>
                Введите <span className="font-bold" style={{ color: "#ef4444" }}>«{expectedText}»</span> для подтверждения
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => { setConfirmText(e.target.value); setError(""); }}
                placeholder={expectedText}
                className="input-field"
                disabled={isLoading}
                style={{ borderColor: "rgba(239,68,68,0.35)" }}
              />
              {error && <p className="text-xs mt-1.5" style={{ color: "var(--dfl-error)" }}>{error}</p>}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={!canDelete || isLoading}
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: canDelete ? "#ef4444" : "rgba(239,68,68,0.15)",
                  border: "none",
                  color: canDelete ? "white" : "rgba(239,68,68,0.5)",
                  cursor: canDelete ? "pointer" : "not-allowed",
                }}
              >
                {isLoading ? <><Loader2 size={14} className="animate-spin" />Удаляем...</> : <><Trash2 size={14} />Подтвердить удаление</>}
              </button>
              <button
                onClick={() => { setShowConfirm(false); setConfirmText(""); setError(""); }}
                className="text-sm px-4 py-2.5 rounded-xl transition-colors"
                style={{ color: "var(--dfl-text-lo)" }}
                disabled={isLoading}
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="min-h-screen" style={{ background: "var(--dfl-bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center gap-4 px-6 border-b"
        style={{
          height: 64,
          background: "var(--dfl-surface-1)",
          borderColor: "var(--dfl-border-1)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-sm transition-colors duration-150"
          style={{ color: "var(--dfl-text-lo)" }}
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Дашборд</span>
        </Link>

        <div className="w-px h-5 flex-shrink-0" style={{ background: "var(--dfl-border-2)" }} />

        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
          >
            <Zap size={11} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm" style={{ letterSpacing: "-0.02em" }}>
            <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
            <span className="text-accent-gradient">Лабс</span>
          </span>
        </Link>

        <div className="flex-1" />

        <button
          onClick={toggleTheme}
          className="theme-toggle"
          style={{ width: 36, height: 36 }}
          aria-label="Переключить тему"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1
            className="font-display font-bold mb-1"
            style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)", color: "var(--dfl-text-hi)" }}
          >
            Настройки аккаунта
          </h1>
          <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
            Управление профилем, паролем и безопасностью
          </p>
        </div>

        <div className="space-y-4">
          <SubscriptionSection />
          <ProfileSection />
          <PasswordSection />
          <DeleteAccountSection />
        </div>

        <div className="flex items-center justify-center gap-4 mt-8 pb-4">
          {[
            { label: "Политика конфиденциальности", to: "/privacy-policy" },
            { label: "Условия использования", to: "/terms" },
          ].map((l) => (
            <Link key={l.to} to={l.to} target="_blank" className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
              {l.label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
