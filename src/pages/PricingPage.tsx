import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap, Check, ArrowRight, Star, Camera, Video, Film,
  Users, HardDrive, Headphones, Code2, Shield, Sparkles,
  ChevronDown, Sun, Moon, BarChart3, Infinity,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

// ── Topup packages ───────────────────────────────────────────────────────────
const TOPUP_PACKAGES = [
  { id: "mini",    name: "Мини",   price: 690,   credits: 300,  color: "#60a5fa", bg: "rgba(37,99,235,0.08)",   border: "rgba(37,99,235,0.25)" },
  { id: "start",  name: "Старт",  price: 1490,  credits: 700,  color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.25)" },
  { id: "biz",    name: "Бизнес", price: 2790,  credits: 1500, color: "#fbbf24", bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.35)", popular: true },
  { id: "pro",    name: "Про",    price: 4990,  credits: 3000, color: "#a78bfa", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.3)" },
  { id: "max",    name: "Макс",   price: 8490,  credits: 6000, color: "#f472b6", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.3)" },
  { id: "ultra",  name: "Ультра", price: 14990, credits: 12000,color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.3)" },
];

// ── Plan definition ────────────────────────────────────────────────────────────
interface Feature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface Plan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  credits: number;
  creditsLabel: string;
  popular: boolean;
  cta: string;
  ctaHref: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  glowColor: string;
  features: Feature[];
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Попробуйте платформу без оплаты",
    monthlyPrice: 0,
    yearlyPrice: 0,
    credits: 500,
    creditsLabel: "разово",
    popular: false,
    cta: "Начать бесплатно",
    ctaHref: "/auth/register",
    accentColor: "#60a5fa",
    accentBg: "rgba(37,99,235,0.08)",
    accentBorder: "rgba(37,99,235,0.25)",
    glowColor: "rgba(37,99,235,0.15)",
    features: [
      { text: "500 стартовых кредитов", included: true },
      { text: "1 AI-персонаж", included: true },
      { text: "Генерация фото (до 5 в день)", included: true },
      { text: "Базовые стили и сцены", included: true },
      { text: "Хранилище 500 МБ", included: true },
      { text: "Галерея генераций", included: true },
      { text: "Email поддержка", included: true },
      { text: "Генерация видео", included: false },
      { text: "Motion Control", included: false },
      { text: "Бренд-бриф и TOV", included: false },
      { text: "API доступ", included: false },
      { text: "Командная работа", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Полный набор инструментов для брендов",
    monthlyPrice: 3490,
    yearlyPrice: 2790,
    credits: 1500,
    creditsLabel: "в месяц",
    popular: true,
    cta: "Начать с Pro",
    ctaHref: "/auth/register",
    accentColor: "#3b82f6",
    accentBg: "rgba(37,99,235,0.12)",
    accentBorder: "rgba(59,130,246,0.5)",
    glowColor: "rgba(59,130,246,0.25)",
    features: [
      { text: "1 500 кредитов / месяц", included: true, highlight: true },
      { text: "3 AI-персонажа", included: true },
      { text: "Генерация фото (без лимитов)", included: true },
      { text: "Генерация видео (TikTok / Reels)", included: true, highlight: true },
      { text: "Motion Control", included: true, highlight: true },
      { text: "Бренд-бриф и TOV", included: true },
      { text: "Хранилище 10 ГБ", included: true },
      { text: "Приоритетная поддержка", included: true },
      { text: "Ранний доступ к новым функциям", included: true },
      { text: "API доступ", included: false },
      { text: "Командная работа", included: false },
      { text: "Персональный менеджер", included: false },
    ],
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "Для агентств и крупных проектов",
    monthlyPrice: 9490,
    yearlyPrice: 7590,
    credits: 3350,
    creditsLabel: "в месяц",
    popular: false,
    cta: "Связаться с нами",
    ctaHref: "/support",
    accentColor: "#a78bfa",
    accentBg: "rgba(139,92,246,0.1)",
    accentBorder: "rgba(139,92,246,0.35)",
    glowColor: "rgba(139,92,246,0.2)",
    features: [
      { text: "3 350 кредитов / месяц", included: true, highlight: true },
      { text: "10 AI-персонажей", included: true },
      { text: "Генерация фото (без лимитов)", included: true },
      { text: "Генерация видео (все форматы)", included: true },
      { text: "Motion Control 4K", included: true, highlight: true },
      { text: "Бренд-бриф и TOV", included: true },
      { text: "Хранилище 50 ГБ", included: true },
      { text: "API доступ", included: true, highlight: true },
      { text: "Командная работа (до 5 чел.)", included: true, highlight: true },
      { text: "Персональный менеджер", included: true, highlight: true },
      { text: "SLA 99.9% · Приоритетный рендер", included: true },
      { text: "Белый лейбл (white label)", included: true },
    ],
  },
];

// ── FAQ ────────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "Что такое кредиты и как они расходуются?",
    a: "Кредиты — внутренняя валюта платформы. Каждая генерация списывает кредиты в зависимости от типа: фото ~25–80 кр, видео 75–300 кр, motion 80–240 кр. Неиспользованные кредиты не сгорают в течение 30 дней.",
  },
  {
    q: "Можно ли перейти с одного тарифа на другой?",
    a: "Да, переход между тарифами доступен в любой момент. При апгрейде разница пересчитывается пропорционально оставшимся дням. При даунгрейде — изменение вступает в силу с нового периода.",
  },
  {
    q: "Есть ли скрытые платежи или лимиты?",
    a: "Нет. Вы платите фиксированную сумму и получаете чётко указанный объём кредитов. Дополнительные кредиты можно купить пакетами без принудительного апгрейда тарифа.",
  },
  {
    q: "Как работает период бета-тестирования?",
    a: "В период беты все тарифы действуют по сниженным ценам, зафиксированным для ранних участников. После публичного запуска цены могут измениться, но для подписчиков бета-периода — остаются прежними.",
  },
  {
    q: "Предоставляется ли доступ к API?",
    a: "API доступен на тарифе Studio. Вы получаете ключи доступа, документацию и возможность интегрировать генерацию контента в собственные продукты и воркфлоу.",
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
        <span className="text-sm font-semibold" style={{ color: "var(--dfl-text-hi)" }}>{q}</span>
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
            <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>{a}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Plan Card ──────────────────────────────────────────────────────────────────
function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const [hovered, setHovered] = useState(false);
  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
  const isFree = plan.id === "free";

  return (
    <div
      className="relative flex flex-col rounded-3xl transition-all duration-300"
      style={{
        background: plan.popular
          ? "linear-gradient(160deg, rgba(37,99,235,0.12) 0%, rgba(99,102,241,0.08) 100%)"
          : "var(--dfl-surface-1)",
        border: plan.popular
          ? `1.5px solid ${plan.accentBorder}`
          : `1px solid ${hovered ? plan.accentBorder : "var(--dfl-border-1)"}`,
        boxShadow: plan.popular
          ? `0 0 48px ${plan.glowColor}, 0 8px 32px rgba(0,0,0,0.15)`
          : hovered
          ? `0 0 32px ${plan.glowColor}, 0 8px 24px rgba(0,0,0,0.1)`
          : "none",
        transform: plan.popular ? "scale(1.03)" : hovered ? "translateY(-4px)" : "translateY(0)",
        zIndex: plan.popular ? 1 : 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <div
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              color: "white",
              boxShadow: "0 4px 16px rgba(37,99,235,0.5)",
            }}
          >
            <Star size={10} className="fill-white" />
            Популярный выбор
          </div>
        </div>
      )}

      <div className="p-6 sm:p-7 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold mb-3"
            style={{ background: plan.accentBg, border: `1px solid ${plan.accentBorder}`, color: plan.accentColor }}
          >
            <Zap size={11} />
            {plan.name}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
            {plan.tagline}
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-end gap-2 mb-1">
            {isFree ? (
              <span
                className="font-display font-bold"
                style={{ fontSize: "3rem", lineHeight: 1, color: "var(--dfl-text-hi)" }}
              >
                0 ₽
              </span>
            ) : (
              <>
                <span
                  className="font-display font-bold"
                  style={{
                    fontSize: "3rem",
                    lineHeight: 1,
                    background: `linear-gradient(135deg, ${plan.accentColor}, ${plan.id === "pro" ? "#a78bfa" : "#60a5fa"})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {price.toLocaleString("ru-RU")} ₽
                </span>
                <span className="text-sm mb-2" style={{ color: "var(--dfl-text-subtle)" }}>/мес</span>
              </>
            )}
          </div>
          {yearly && !isFree && (
            <p className="text-xs" style={{ color: "#22c55e" }}>
              Экономия {((plan.monthlyPrice - plan.yearlyPrice) * 12).toLocaleString("ru-RU")} ₽ в год
            </p>
          )}
          {isFree && (
            <p className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>навсегда бесплатно</p>
          )}
        </div>

        {/* Credits badge */}
        <div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-6"
          style={{ background: plan.accentBg, border: `1px solid ${plan.accentBorder}` }}
        >
          <Zap size={14} style={{ color: plan.accentColor, flexShrink: 0 }} />
          <div>
            <span className="text-sm font-bold" style={{ color: plan.accentColor }}>
              {plan.credits.toLocaleString()} кредитов
            </span>
            <span className="text-xs ml-1.5" style={{ color: "var(--dfl-text-placeholder)" }}>
              {plan.creditsLabel}
            </span>
          </div>
        </div>

        {/* CTA */}
        {plan.id === "free" ? (
          <Link
            to={plan.ctaHref}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 mb-6"
            style={{
              background: "var(--dfl-surface-2)",
              border: `1px solid ${plan.accentBorder}`,
              color: plan.accentColor,
              textDecoration: "none",
            }}
          >
            {plan.cta}
            <ArrowRight size={15} />
          </Link>
        ) : (
          <div
            className="flex flex-col items-center gap-1.5 w-full mb-6"
          >
            <button
              disabled
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold"
              style={{
                background: plan.popular
                  ? "linear-gradient(135deg, rgba(29,78,216,0.5), rgba(59,130,246,0.5))"
                  : "rgba(109,40,217,0.3)",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                cursor: "not-allowed",
              }}
            >
              🔒 Скоро будет доступно
            </button>
            <span className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
              Оплата откроется в ближайшее время
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="h-px mb-5" style={{ background: "var(--dfl-border-1)" }} />

        {/* Features */}
        <div className="space-y-2.5 flex-1">
          {plan.features.map((feat, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className="w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  width: 18,
                  height: 18,
                  background: feat.included ? (feat.highlight ? plan.accentBg : "rgba(34,197,94,0.12)") : "rgba(239,68,68,0.08)",
                  border: feat.included
                    ? feat.highlight
                      ? `1px solid ${plan.accentBorder}`
                      : "1px solid rgba(34,197,94,0.3)"
                    : "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <Check
                  size={9}
                  strokeWidth={2.5}
                  style={{
                    color: feat.included
                      ? feat.highlight
                        ? plan.accentColor
                        : "#22c55e"
                      : "transparent",
                  }}
                />
              </div>
              <span
                className="text-sm leading-snug"
                style={{
                  color: feat.included
                    ? feat.highlight
                      ? "var(--dfl-text-hi)"
                      : "var(--dfl-text-mid)"
                    : "var(--dfl-text-placeholder)",
                  textDecoration: feat.included ? "none" : "line-through",
                  fontWeight: feat.highlight ? 500 : 400,
                }}
              >
                {feat.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Compare rows ───────────────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { label: "Кредиты / месяц", free: "500 (разово)", pro: "1 500", studio: "3 350" },
  { label: "AI-персонажи", free: "1", pro: "3", studio: "10" },
  { label: "Фото генерация", free: "До 5/день", pro: <Infinity size={14} />, studio: <Infinity size={14} /> },
  { label: "Видео генерация", free: "—", pro: <Check size={13} />, studio: <Check size={13} /> },
  { label: "Motion Control", free: "—", pro: <Check size={13} />, studio: "4K" },
  { label: "Бренд-бриф", free: "—", pro: <Check size={13} />, studio: <Check size={13} /> },
  { label: "Хранилище", free: "500 МБ", pro: "10 ГБ", studio: "50 ГБ" },
  { label: "API доступ", free: "—", pro: "—", studio: <Check size={13} /> },
  { label: "Командная работа", free: "—", pro: "—", studio: "до 5 чел." },
  { label: "Поддержка", free: "Email", pro: "Приоритетная", studio: "Персональный менеджер" },
];

// ── Stat cards ─────────────────────────────────────────────────────────────────
const STATS = [
  { value: "500+", label: "Брендов на платформе", icon: <Users size={18} />, color: "#60a5fa" },
  { value: "40K+", label: "Генераций в месяц", icon: <Camera size={18} />, color: "#a78bfa" },
  { value: "24ч", label: "Среднее время ответа", icon: <Headphones size={18} />, color: "#34d399" },
  { value: "99.9%", label: "Аптайм платформы", icon: <Shield size={18} />, color: "#f59e0b" },
];

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "var(--dfl-bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4" style={{ height: 64 }}>
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" style={{ textDecoration: "none" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm hidden sm:block" style={{ letterSpacing: "-0.02em" }}>
              <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
              <span className="text-accent-gradient">Лабс</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4">
            {[
              { label: "Продукт", href: "/#features" },
              { label: "Как это работает", href: "/#how-it-works" },
              { label: "Тарифы", href: "/pricing" },
              { label: "FAQ", href: "/#faq" },
            ].map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors duration-150"
                style={{ color: "var(--dfl-text-subtle)", textDecoration: "none" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-hi)";
                  (e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <button onClick={toggleTheme} className="theme-toggle" style={{ width: 36, height: 36 }} aria-label="Тема">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            {user ? (
              <Link
                to="/dashboard"
                className="text-sm px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  color: "var(--dfl-text-hi)",
                  textDecoration: "none",
                  background: "var(--dfl-surface-2)",
                  border: "1px solid var(--dfl-border-1)",
                }}
                title={user.email}
              >
                {user.username}
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-sm px-3 py-2 rounded-xl transition-all duration-200"
                  style={{ color: "var(--dfl-text-lo)", textDecoration: "none" }}
                >
                  Войти
                </Link>
                <Link
                  to="/auth/register"
                  className="btn-primary text-sm px-4 py-2"
                  style={{ textDecoration: "none" }}
                >
                  Начать бесплатно
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-10 px-4 sm:px-6 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37,99,235,0.1) 0%, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(37,99,235,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.8) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}
          >
            <Sparkles size={11} />
            Бета-цены зафиксированы для ранних участников
          </div>
          <h1
            className="font-display font-bold mb-4 leading-tight"
            style={{ fontSize: "clamp(2rem,5vw,3.2rem)", color: "var(--dfl-text-hi)" }}
          >
            Простые и прозрачные
            <br />
            <span className="text-accent-gradient">тарифные планы</span>
          </h1>
          <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: "var(--dfl-text-lo)" }}>
            Начните бесплатно и масштабируйтесь по мере роста. Никаких скрытых платежей — только чёткие кредиты и понятные возможности.
          </p>

          {/* Billing toggle */}
          <div
            className="inline-flex items-center gap-2 p-1 rounded-xl"
            style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)" }}
          >
            <button
              onClick={() => setYearly(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: !yearly ? "var(--dfl-accent-muted)" : "transparent",
                border: !yearly ? "1px solid var(--dfl-border-2)" : "1px solid transparent",
                color: !yearly ? "var(--dfl-accent-bright)" : "var(--dfl-text-subtle)",
              }}
            >
              Ежемесячно
            </button>
            <button
              onClick={() => setYearly(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: yearly ? "var(--dfl-accent-muted)" : "transparent",
                border: yearly ? "1px solid var(--dfl-border-2)" : "1px solid transparent",
                color: yearly ? "var(--dfl-accent-bright)" : "var(--dfl-text-subtle)",
              }}
            >
              Ежегодно
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", color: "#22c55e" }}
              >
                −20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans grid */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-stretch">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} yearly={yearly} />
            ))}
          </div>

              {/* Trust note */}
          <p className="text-center text-xs mt-8" style={{ color: "var(--dfl-text-placeholder)" }}>
            Все цены указаны без НДС. Оплата картой или по счёту. Отмена подписки — в любой момент без штрафов.
          </p>
        </div>
      </section>

      {/* Topup packages */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-text-subtle)" }}>
              <Zap size={11} />Топап-пакеты кредитов
            </div>
            <h2 className="font-display font-bold mb-3" style={{ fontSize: "clamp(1.4rem,2.5vw,1.8rem)", color: "var(--dfl-text-hi)" }}>
              Докупить кредиты отдельно
            </h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--dfl-text-lo)" }}>
              Без смены тарифа — просто пополните баланс нужным пакетом. Кредиты не сгорают 90 дней.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TOPUP_PACKAGES.map(pkg => (
              <div key={pkg.id} className="relative flex flex-col rounded-2xl p-4 transition-all duration-200"
                style={{ background: pkg.bg, border: `1.5px solid ${pkg.border}` }}>
                {pkg.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ background: "linear-gradient(135deg,#d97706,#fbbf24)", color: "#1a0a00" }}>Популярный</span>
                  </div>
                )}
                <div className="text-center mb-3">
                  <p className="text-sm font-bold mb-1" style={{ color: "var(--dfl-text-hi)" }}>{pkg.name}</p>
                  <p className="font-bold text-xl" style={{ color: pkg.color }}>{pkg.price.toLocaleString("ru-RU")} ₽</p>
                </div>
                <div className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl mb-3"
                  style={{ background: "var(--dfl-surface-1)", border: `1px solid ${pkg.border}` }}>
                  <Zap size={11} style={{ color: pkg.color, flexShrink: 0 }} />
                  <span className="text-xs font-bold" style={{ color: pkg.color }}>{pkg.credits.toLocaleString()} кр</span>
                </div>
                <p className="text-[10px] text-center mb-3" style={{ color: "var(--dfl-text-placeholder)" }}>
                  ≈ {Math.round(pkg.credits / 15)} фото
                </p>
                <button disabled
                  className="w-full py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                  style={{ background: "var(--dfl-surface-2)", color: "var(--dfl-text-placeholder)", border: `1px solid ${pkg.border}`, cursor: "not-allowed", opacity: 0.6 }}>
                  Скоро
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "var(--dfl-text-placeholder)" }}>
            Пополнение баланса откроется после публичного запуска платформы.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6 py-12 border-t border-b" style={{ borderColor: "var(--dfl-border-1)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center gap-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
              >
                <span style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <div
                className="font-display font-bold"
                style={{ fontSize: "1.6rem", color: "var(--dfl-text-hi)" }}
              >
                {stat.value}
              </div>
              <p className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-text-subtle)" }}
            >
              <BarChart3 size={11} />
              Сравнение тарифов
            </div>
            <h2
              className="font-display font-bold"
              style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", color: "var(--dfl-text-hi)" }}
            >
              Что включено в каждый план
            </h2>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--dfl-border-1)" }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-4 border-b"
              style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)" }}
            >
              <div className="px-4 py-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--dfl-text-placeholder)" }}>
                Возможность
              </div>
              {PLANS.map((plan) => (
                <div key={plan.id} className="px-4 py-4 text-center">
                  <span className="text-sm font-bold" style={{ color: plan.popular ? plan.accentColor : "var(--dfl-text-hi)" }}>
                    {plan.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Table rows */}
            {COMPARE_ROWS.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 border-b transition-colors duration-150"
                style={{
                  borderColor: "var(--dfl-border-1)",
                  background: i % 2 === 0 ? "var(--dfl-surface-1)" : "transparent",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-2)")}
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? "var(--dfl-surface-1)" : "transparent")
                }
              >
                <div className="px-4 py-3.5 text-sm" style={{ color: "var(--dfl-text-mid)" }}>
                  {row.label}
                </div>
                {([row.free, row.pro, row.studio] as (string | React.ReactNode)[]).map((val, vi) => (
                  <div key={vi} className="px-4 py-3.5 flex items-center justify-center">
                    {typeof val === "string" ? (
                      <span
                        className="text-sm font-medium"
                        style={{ color: val === "—" ? "var(--dfl-text-placeholder)" : "var(--dfl-text-hi)" }}
                      >
                        {val}
                      </span>
                    ) : (
                      <span style={{ color: vi === 1 ? "#3b82f6" : "#a78bfa" }}>{val}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 py-16 border-t" style={{ borderColor: "var(--dfl-border-1)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-text-subtle)" }}
            >
              Частые вопросы о тарифах
            </div>
            <h2
              className="font-display font-bold"
              style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", color: "var(--dfl-text-hi)" }}
            >
              Остались вопросы?
            </h2>
          </div>
          <div className="space-y-2.5">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>

          <div
            className="mt-10 rounded-2xl p-8 text-center"
            style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)" }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)" }}
            >
              <Headphones size={20} style={{ color: "var(--dfl-accent-bright)" }} />
            </div>
            <h3 className="font-display font-bold mb-2" style={{ color: "var(--dfl-text-hi)" }}>
              Нужна индивидуальная консультация?
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--dfl-text-lo)" }}>
              Свяжитесь с командой — подберём оптимальный план под ваши задачи.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/support"
                className="btn-primary text-sm px-6 py-2.5"
                style={{ textDecoration: "none" }}
              >
                Написать в поддержку
              </Link>
              <a
                href="mailto:support@kovallabs.com"
                className="text-sm px-6 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  background: "var(--dfl-surface-2)",
                  border: "1px solid var(--dfl-border-2)",
                  color: "var(--dfl-text-lo)",
                }}
              >
                support@kovallabs.com →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-4 sm:px-6 py-8 border-t text-center"
        style={{ borderColor: "var(--dfl-border-1)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
              <Zap size={10} className="text-white" />
            </div>
            <span className="font-display font-bold text-sm" style={{ letterSpacing: "-0.02em" }}>
              <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
              <span className="text-accent-gradient">Лабс</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {[
              { label: "Политика", href: "/privacy-policy" },
              { label: "Условия", href: "/terms" },
              { label: "Поддержка", href: "/support" },
            ].map((l) => (
              <Link key={l.href} to={l.href} className="text-xs" style={{ color: "var(--dfl-text-placeholder)", textDecoration: "none" }}>
                {l.label}
              </Link>
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
            © 2025 КовальЛабс
          </p>
        </div>
      </footer>
    </div>
  );
}
