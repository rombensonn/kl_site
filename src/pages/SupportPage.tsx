import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Zap, Sun, Moon, ArrowLeft, HelpCircle, Send, CheckCircle2,
  Loader2, AlertCircle, ChevronDown, ChevronRight,
  MessageSquare, CreditCard, Wrench, Lightbulb, BookOpen, Bug, ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
interface TicketType {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  priority?: string;
}

const TICKET_TYPES: TicketType[] = [
  {
    id: "bug",
    label: "Баг / Ошибка",
    desc: "Критический сбой, падение, сбой",
    icon: <Bug size={16} />,
    color: "#f87171",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.45)",
    priority: "до 4 ч",
  },
  {
    id: "general",
    label: "Общий вопрос",
    desc: "Вопрос по работе платформы",
    icon: <MessageSquare size={16} />,
    color: "#60a5fa",
    bg: "rgba(37,99,235,0.1)",
    border: "rgba(37,99,235,0.3)",
  },
  {
    id: "technical",
    label: "Тех. проблема",
    desc: "Не работает функция, глюк",
    icon: <Wrench size={16} />,
    color: "#fb923c",
    bg: "rgba(251,146,60,0.1)",
    border: "rgba(251,146,60,0.3)",
  },
  {
    id: "billing",
    label: "Баланс / Оплата",
    desc: "Кредиты, списания, пополнение",
    icon: <CreditCard size={16} />,
    color: "#fbbf24",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
  },
  {
    id: "feature",
    label: "Предложение",
    desc: "Идея, пожелание, улучшение",
    icon: <Lightbulb size={16} />,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)",
    border: "rgba(167,139,250,0.3)",
  },
];

// ── Bug report tips ───────────────────────────────────────────────────────────
const BUG_TIPS = [
  "Опишите шаги: что делали до ошибки",
  "Укажите текст ошибки / скриншот",
  "Браузер и устройство",
  "Произошло один раз или постоянно?",
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "Когда запускается бета-версия платформы?",
    a: "Мы активно готовимся к запуску. Все зарегистрированные пользователи получат уведомление на email одними из первых. Следите за обновлениями в уведомлениях в дашборде.",
  },
  {
    q: "Что такое кредиты и как они расходуются?",
    a: "Кредиты — внутренняя валюта платформы. 500 кредитов начисляются при регистрации. Каждая операция (генерация фото, видео, motion) списывает кредиты в зависимости от сложности. Баланс всегда виден в дашборде.",
  },
  {
    q: "Почему я не вижу сгенерированные изображения в галерее?",
    a: "После генерации изображение автоматически сохраняется в таблицу assets. Если изображение не появилось — обновите страницу. Если проблема сохраняется, создайте тикет.",
  },
  {
    q: "Могу ли я удалить аккаунт?",
    a: "Да. В разделе «Настройки» внизу страницы есть возможность удалить аккаунт. Все данные (проекты, генерации, баланс) будут безвозвратно удалены.",
  },
  {
    q: "Как изменить имя или пароль?",
    a: "Перейдите в «Настройки» через меню в правом верхнем углу дашборда. Там можно изменить имя, email и пароль.",
  },
  {
    q: "Генерация занимает слишком долго — что делать?",
    a: "Стандартное время генерации — 10–30 секунд. Если прошло более 2 минут, обновите страницу и попробуйте снова. Высокая нагрузка на серверах может влиять на скорость в период бета-теста.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: "var(--dfl-surface-1)",
        border: `1px solid ${open ? "var(--dfl-border-2)" : "var(--dfl-border-1)"}`,
        boxShadow: open ? "0 4px 16px rgba(37,99,235,0.08)" : "none",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
            style={{ background: "var(--dfl-accent-muted)", color: "var(--dfl-accent-bright)", border: "1px solid var(--dfl-border-2)" }}
          >
            {index + 1}
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--dfl-text-hi)" }}>{q}</span>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: "var(--dfl-text-placeholder)",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 280ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </button>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 300ms cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ overflow: "hidden" }}>
          <div className="px-5 pb-5">
            <div className="h-px mb-4" style={{ background: "var(--dfl-border-1)" }} />
            <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)", paddingLeft: "2.25rem" }}>{a}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessState({ ticketType, onReset }: { ticketType: string; onReset: () => void }) {
  const isBug = ticketType === "bug";
  return (
    <div className="flex flex-col items-center text-center py-12 px-8">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: isBug ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
          border: `1px solid ${isBug ? "rgba(239,68,68,0.35)" : "rgba(34,197,94,0.35)"}`,
          boxShadow: `0 0 32px ${isBug ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.18)"}`,
        }}
      >
        {isBug ? <Bug size={36} style={{ color: "#f87171" }} /> : <CheckCircle2 size={36} style={{ color: "#22c55e" }} />}
      </div>
      <h3 className="font-display font-bold mb-2" style={{ fontSize: "1.3rem", color: "var(--dfl-text-hi)" }}>
        {isBug ? "Баг-репорт принят!" : "Заявка отправлена"}
      </h3>
      <p className="text-sm leading-relaxed mb-8 max-w-xs" style={{ color: "var(--dfl-text-lo)" }}>
        {isBug
          ? "Ваш баг-репорт передан команде. Приоритетный ответ — в течение 4 часов."
          : "Мы получили ваше обращение и ответим на email в течение 24–48 часов."}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="text-sm px-5 py-2.5 rounded-xl transition-all duration-200"
          style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}
        >
          Новое обращение
        </button>
        <Link
          to="/dashboard"
          className="text-sm px-5 py-2.5 rounded-xl transition-all duration-200"
          style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)", color: "var(--dfl-text-mid)", textDecoration: "none" }}
        >
          В дашборд
        </Link>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SupportPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";

  const [ticketType, setTicketType] = useState("bug");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedType = TICKET_TYPES.find(t => t.id === ticketType) ?? TICKET_TYPES[0];
  const isBugReport = ticketType === "bug";

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Необходимо войти в аккаунт");
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        type: ticketType,
        subject: subject.trim(),
        description: description.trim(),
        status: "open",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success(isBugReport ? "Баг-репорт отправлен! Приоритетный разбор." : "Обращение отправлено!");
    },
    onError: (err: Error) => {
      toast.error(`Ошибка: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!subject.trim()) { setValidationError("Укажите тему обращения"); return; }
    if (!description.trim() || description.trim().length < 20) {
      setValidationError("Опишите проблему подробнее (минимум 20 символов)");
      return;
    }
    submit();
  };

  const reset = () => {
    setSubmitted(false);
    setSubject("");
    setDescription("");
    setTicketType("bug");
    setMarketingConsent(false);
    setValidationError(null);
  };

  const descPlaceholder = isBugReport
    ? "1. Что делали до ошибки?\n2. Что произошло (текст ошибки)?\n3. Что ожидали?\n4. Браузер / устройство?"
    : ticketType === "technical"
    ? "Опишите проблему: что делали, что произошло, какое сообщение об ошибке..."
    : ticketType === "billing"
    ? "Опишите ситуацию: сумма, дата операции, что ожидали, что получили..."
    : ticketType === "feature"
    ? "Опишите идею: какую задачу решает, как это должно работать..."
    : "Опишите ваш вопрос подробно...";

  return (
    <div className="min-h-screen" style={{ background: "var(--dfl-bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 border-b"
        style={{ height: 64, background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80"
          style={{ color: "var(--dfl-text-lo)" }}
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Дашборд</span>
        </Link>
        <div className="w-px h-5" style={{ background: "var(--dfl-border-2)" }} />
        <Link to="/dashboard" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
            <Zap size={11} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm hidden sm:block" style={{ letterSpacing: "-0.02em" }}>
            <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
            <span className="text-accent-gradient">Лабс</span>
          </span>
        </Link>
        <div className="flex-1" />
        <button onClick={toggleTheme} className="theme-toggle" style={{ width: 36, height: 36 }} aria-label="Переключить тему">
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Page title */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}>
            <HelpCircle size={11} />
            Поддержка
          </div>
          <h1 className="font-display font-bold mb-2" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", color: "var(--dfl-text-hi)" }}>
            Как мы можем помочь?
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
            Нашли баг? Опишите его — разбираем в приоритетном порядке. Все остальные вопросы — в течение 24–48 ч.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}>
              {submitted ? (
                <SuccessState ticketType={ticketType} onReset={reset} />
              ) : (
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                  <div>
                    <h2 className="font-display font-bold mb-1" style={{ fontSize: "1.1rem", color: "var(--dfl-text-hi)" }}>
                      Новое обращение
                    </h2>
                    <p className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
                      Ответим на {user?.email ?? "вашу почту"}
                    </p>
                  </div>

                  {/* Bug report alert banner */}
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <ShieldAlert size={15} style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: "#f87171" }}>
                        Нашли баг? Выберите «Баг / Ошибка» — приоритетный разбор до 4 ч
                      </p>
                      <p className="text-[11px] leading-relaxed" style={{ color: "var(--dfl-text-subtle)" }}>
                        Укажите шаги воспроизведения, текст ошибки и браузер — это ускорит исправление.
                      </p>
                    </div>
                  </div>

                  {/* Ticket type grid */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--dfl-text-placeholder)" }}>
                      Тип обращения
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {TICKET_TYPES.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTicketType(t.id)}
                          className="flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 relative"
                          style={{
                            background: ticketType === t.id ? t.bg : "var(--dfl-surface-2)",
                            border: `1px solid ${ticketType === t.id ? t.border : "var(--dfl-border-1)"}`,
                            boxShadow: ticketType === t.id && t.id === "bug"
                              ? "0 0 0 1px rgba(239,68,68,0.2), 0 2px 12px rgba(239,68,68,0.1)"
                              : "none",
                          }}
                        >
                          <span className="flex-shrink-0 mt-0.5" style={{ color: ticketType === t.id ? t.color : "var(--dfl-text-placeholder)" }}>
                            {t.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold leading-tight" style={{ color: ticketType === t.id ? t.color : "var(--dfl-text-mid)" }}>
                              {t.label}
                            </p>
                            <p className="text-[10px] mt-0.5 leading-snug" style={{ color: "var(--dfl-text-placeholder)" }}>
                              {t.desc}
                            </p>
                          </div>
                          {t.priority && (
                            <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.35)" }}>
                              {t.priority}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bug tips */}
                  {isBugReport && (
                    <div className="rounded-xl px-4 py-3 space-y-1.5"
                      style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: "#f87171" }}>
                        🐞 Для быстрого исправления укажите:
                      </p>
                      {BUG_TIPS.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[10px] font-bold w-4 flex-shrink-0 mt-0.5" style={{ color: "#f87171" }}>{i + 1}.</span>
                          <span className="text-[11px] leading-relaxed" style={{ color: "var(--dfl-text-subtle)" }}>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Subject */}
                  <div>
                    <label htmlFor="support-subject" className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>
                      Тема <span style={{ color: "var(--dfl-error)" }}>*</span>
                    </label>
                    <input
                      id="support-subject"
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder={isBugReport ? "Кратко: что сломалось (напр. «Генерация фото не запускается»)" : "Кратко опишите суть вопроса"}
                      className="input-field"
                      disabled={isPending}
                      maxLength={120}
                      style={{ borderColor: isBugReport && subject ? "rgba(239,68,68,0.3)" : undefined }}
                    />
                    <p className="text-[10px] mt-1" style={{ color: "var(--dfl-text-placeholder)" }}>{subject.length}/120</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="support-desc" className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>
                      Описание <span style={{ color: "var(--dfl-error)" }}>*</span>
                    </label>
                    <textarea
                      id="support-desc"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder={descPlaceholder}
                      className="input-field resize-none"
                      rows={isBugReport ? 7 : 6}
                      disabled={isPending}
                      maxLength={2000}
                    />
                    <p className="text-[10px] mt-1" style={{ color: "var(--dfl-text-placeholder)" }}>
                      {description.length}/2000 · минимум 20 символов
                    </p>
                  </div>

                  {/* Marketing consent — добровольно */}
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={marketingConsent}
                      onClick={() => setMarketingConsent(!marketingConsent)}
                      disabled={isPending}
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
                      style={{
                        background: marketingConsent ? "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))" : "var(--dfl-surface-2)",
                        border: marketingConsent ? "1.5px solid var(--dfl-accent-hover)" : "1.5px solid var(--dfl-border-2)",
                      }}
                    >
                      {marketingConsent && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <label
                      className="text-xs leading-relaxed cursor-pointer"
                      style={{ color: "var(--dfl-text-subtle)" }}
                      onClick={() => !isPending && setMarketingConsent(!marketingConsent)}
                    >
                      <span className="text-[10px] px-1 py-0.5 rounded mr-1" style={{ background: "var(--dfl-surface-2)", color: "var(--dfl-text-placeholder)", border: "1px solid var(--dfl-border-1)" }}>необязательно</span>
                      Согласен на получение информационных сообщений о платформе в соответствии с ч.&nbsp;1 ст.&nbsp;18 ФЗ «О рекламе».
                    </label>
                  </div>

                  {/* Validation error */}
                  {validationError && (
                    <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
                      style={{ background: "var(--dfl-error-muted)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--dfl-error)" }}>
                      <AlertCircle size={14} className="flex-shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 rounded-2xl transition-all duration-200"
                    style={{
                      background: isPending ? "var(--dfl-surface-2)" : isBugReport
                        ? "linear-gradient(135deg, #dc2626, #ef4444)"
                        : `linear-gradient(135deg, ${selectedType.color === "#60a5fa" ? "#1d4ed8,#3b82f6" : selectedType.color === "#fbbf24" ? "#d97706,#f59e0b" : selectedType.color === "#fb923c" ? "#ea580c,#f97316" : "#7c3aed,#9333ea"})`,
                      color: isPending ? "var(--dfl-text-placeholder)" : "white",
                      cursor: isPending ? "not-allowed" : "pointer",
                      boxShadow: isPending ? "none" : isBugReport ? "0 4px 20px rgba(239,68,68,0.3)" : "0 4px 20px rgba(37,99,235,0.25)",
                    }}
                  >
                    {isPending ? (
                      <><Loader2 size={16} className="animate-spin" />Отправляем...</>
                    ) : isBugReport ? (
                      <><Bug size={15} />Отправить баг-репорт</>
                    ) : (
                      <><Send size={15} />Отправить обращение</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Response time */}
            <div className="rounded-2xl p-5" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}>
              <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--dfl-text-hi)" }}>Время ответа</h3>
              <div className="space-y-2.5">
                {[
                  { type: "🐞 Баг / Ошибка", time: "до 4 ч", color: "#f87171", priority: true },
                  { type: "Тех. проблема", time: "12–24 ч", color: "#fb923c" },
                  { type: "Баланс / Оплата", time: "4–12 ч", color: "#fbbf24" },
                  { type: "Общий вопрос", time: "24–48 ч", color: "#60a5fa" },
                  { type: "Предложение", time: "3–5 дней", color: "#a78bfa" },
                ].map(item => (
                  <div key={item.type}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl"
                    style={{
                      background: (item as { priority?: boolean }).priority ? "rgba(239,68,68,0.07)" : "transparent",
                      border: (item as { priority?: boolean }).priority ? "1px solid rgba(239,68,68,0.15)" : "1px solid transparent",
                    }}
                  >
                    <span className="text-xs font-medium" style={{ color: (item as { priority?: boolean }).priority ? "#f87171" : "var(--dfl-text-subtle)" }}>
                      {item.type}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}35` }}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bug report tips card */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Bug size={13} style={{ color: "#f87171" }} />
                <span className="text-xs font-semibold" style={{ color: "#f87171" }}>Как описать баг правильно</span>
              </div>
              <div className="space-y-1.5">
                {BUG_TIPS.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[10px] font-bold w-3 flex-shrink-0 mt-0.5" style={{ color: "#f87171" }}>{i + 1}.</span>
                    <span className="text-xs leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct contact */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)" }}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={13} style={{ color: "#60a5fa" }} />
                <span className="text-xs font-semibold" style={{ color: "#60a5fa" }}>Прямой контакт</span>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--dfl-text-lo)" }}>
                В период бета-теста команда КовальЛабс доступна напрямую для приоритетных участников.
              </p>
              <a href="mailto:support@kovallabs.com" className="text-xs font-semibold" style={{ color: "var(--dfl-accent-bright)" }}>
                support@kovallabs.com →
              </a>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl p-5" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}>
              <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--dfl-text-hi)" }}>Полезные ссылки</h3>
              <div className="space-y-1">
                {[
                  { label: "Настройки аккаунта", href: "/settings" },
                  { label: "История баланса", href: "/balance/history" },
                  { label: "Создать персонажа", href: "/character/new" },
                  { label: "Политика конфиденциальности", href: "/privacy-policy" },
                  { label: "Условия использования", href: "/terms" },
                ].map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-150"
                    style={{ color: "var(--dfl-text-subtle)", textDecoration: "none" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-hi)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)"; }}
                  >
                    {link.label}
                    <ChevronRight size={13} style={{ flexShrink: 0, opacity: 0.5 }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-14">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-text-subtle)" }}>
              <HelpCircle size={11} />
              Частые вопросы
            </div>
            <h2 className="font-display font-bold" style={{ fontSize: "clamp(1.3rem,2.5vw,1.7rem)", color: "var(--dfl-text-hi)" }}>
              Ответы на популярные вопросы
            </h2>
          </div>
          <div className="space-y-2.5">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>
          <div className="mt-8 rounded-2xl p-6 text-center" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}>
            <p className="text-sm mb-3" style={{ color: "var(--dfl-text-lo)" }}>Не нашли ответ на свой вопрос?</p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
              style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}
            >
              Создать обращение →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
