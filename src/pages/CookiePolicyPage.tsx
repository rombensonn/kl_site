import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import LegalNavbar from "@/components/layout/LegalNavbar";

const EFFECTIVE_DATE = "2 апреля 2026 г.";
const IP_FULL = "Индивидуальный предприниматель Соколов Сергей Дмитриевич";
const INN = "505029409487";
const OGRNIP = "324508100007100";
const ADDRESS = "141131, Россия, Московская обл., г.о. Щёлково, д. Назимиха, д. 38";
const EMAIL = "support@kovallabs.com";
const SITE = "https://kovallabs.com";

interface SectionProps {
  num: string;
  title: string;
  children: React.ReactNode;
}

function Section({ num, title, children }: SectionProps) {
  return (
    <section className="mb-10">
      <h2
        className="font-display font-bold mb-4 pb-3 border-b flex items-baseline gap-3"
        style={{ fontSize: "1.1rem", color: "var(--dfl-text-hi)", borderColor: "var(--dfl-border-1)" }}
      >
        <span
          className="text-sm font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
          style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}
        >
          {num}
        </span>
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--dfl-text-mid)" }}>
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

// Cookie type table row
interface CookieRow {
  name: string;
  type: string;
  purpose: string;
  duration: string;
}

const COOKIE_TYPES: CookieRow[] = [
  { name: "kovallab.local.session", type: "Необходимые", purpose: "Локальная сессия аутентификации пользователя", duration: "До выхода из аккаунта" },
  { name: "dfl-theme", type: "Функциональные", purpose: "Тема оформления (светлая/тёмная)", duration: "1 год" },
  { name: "cookie-consent", type: "Функциональные", purpose: "Выбор пользователя в баннере cookie", duration: "1 год" },
  { name: "onboarding-complete", type: "Функциональные", purpose: "Отметка о завершении онбординга AI-персонажа", duration: "Постоянно (localStorage)" },
  { name: "generation-history", type: "Функциональные", purpose: "Кэш истории генераций (фото/видео) в текущей сессии", duration: "Сессия" },
  { name: "cf_clearance", type: "Необходимые", purpose: "Защита от DDoS (Cloudflare)", duration: "1 день" },
];

export default function CookiePolicyPage() {
  const handleManageCookies = () => {
    localStorage.removeItem("cookie-consent");
    window.location.reload();
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--dfl-bg)", color: "var(--dfl-text-mid)" }}>
      <LegalNavbar />

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
            style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}
          >
            <Cookie size={10} />
            Политика использования файлов cookie
          </div>
          <h1
            className="font-display font-bold mb-3"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--dfl-text-hi)", lineHeight: 1.2 }}
          >
            Политика Cookie
          </h1>
          <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
            Дата вступления в силу: <strong>{EFFECTIVE_DATE}</strong>
          </p>
          <div
            className="mt-4 p-4 rounded-xl text-sm leading-relaxed"
            style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.2)", color: "var(--dfl-text-lo)" }}
          >
            Настоящая Политика описывает, какие файлы cookie и аналогичные технологии используются
            на платформе КовальЛабс ({SITE}), принадлежащей{" "}
            <strong style={{ color: "var(--dfl-text-hi)" }}>{IP_FULL}</strong>. Продолжая использование
            сайта после уведомления, вы даёте согласие на использование cookie в соответствии с настоящей Политикой.
          </div>
        </div>

        <Section num="1" title="Что такое файлы cookie">
          <P>Cookie — небольшие текстовые файлы, сохраняемые в браузере пользователя при посещении сайта. Они позволяют сайту распознавать устройство при последующих посещениях, сохранять настройки и анализировать поведение пользователей.</P>
          <P>Помимо cookie, мы используем аналогичные технологии локального хранения: localStorage и sessionStorage браузера — для хранения пользовательских предпочтений без истечения срока действия (localStorage) или в рамках текущей сессии (sessionStorage).</P>
          <P>Все технологии хранения данных применяются в строгом соответствии с требованиями Федерального закона № 152-ФЗ «О персональных данных» и Политикой конфиденциальности.</P>
        </Section>

        <Section num="2" title="Виды используемых cookie">
          <P>На платформе применяются следующие категории cookie:</P>

          <div className="space-y-3 mt-4">
            {[
              {
                type: "Необходимые (строго обязательные)",
                color: "#3b82f6",
                bg: "rgba(37,99,235,0.08)",
                border: "rgba(37,99,235,0.25)",
                desc: "Обеспечивают базовую работу Платформы: аутентификацию, безопасность сессии, защиту от атак. Не могут быть отключены, так как без них Платформа не функционирует.",
              },
              {
                type: "Функциональные",
                color: "#22c55e",
                bg: "rgba(34,197,94,0.08)",
                border: "rgba(34,197,94,0.25)",
                desc: "Запоминают ваши предпочтения (тема оформления, состояние онбординга, выбор настроек cookie). Могут быть отключены, однако это повлияет на удобство использования Платформы.",
              },
              {
                type: "Аналитические",
                color: "#f59e0b",
                bg: "rgba(245,158,11,0.08)",
                border: "rgba(245,158,11,0.25)",
                desc: "Собирают анонимную статистику о посещаемости и поведении пользователей для улучшения Платформы. Применяются только при наличии вашего согласия.",
              },
              {
                type: "Маркетинговые",
                color: "#a78bfa",
                bg: "rgba(167,139,250,0.08)",
                border: "rgba(167,139,250,0.25)",
                desc: "В настоящее время не используются. При подключении рекламных инструментов в будущем вы будете уведомлены отдельно.",
              },
            ].map((item) => (
              <div
                key={item.type}
                className="rounded-xl p-4"
                style={{ background: item.bg, border: `1px solid ${item.border}` }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: item.color }}>{item.type}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section num="3" title="Перечень используемых cookie">
          <P>Следующие файлы cookie и ключи localStorage применяются на Платформе:</P>
          <div
            className="rounded-xl overflow-hidden border mt-3"
            style={{ borderColor: "var(--dfl-border-1)" }}
          >
            <div
              className="grid text-xs font-semibold"
              style={{
                gridTemplateColumns: "1.8fr 1fr 2fr 1fr",
                background: "var(--dfl-surface-2)",
                borderBottom: "1px solid var(--dfl-border-1)",
                color: "var(--dfl-text-hi)",
              }}
            >
              {["Имя", "Тип", "Назначение", "Срок"].map((h) => (
                <div key={h} className="px-3 py-2.5">{h}</div>
              ))}
            </div>
            {COOKIE_TYPES.map((row, i) => (
              <div
                key={i}
                className="grid text-xs"
                style={{
                  gridTemplateColumns: "1.8fr 1fr 2fr 1fr",
                  borderTop: "1px solid var(--dfl-border-1)",
                  background: i % 2 === 0 ? "var(--dfl-surface-1)" : "transparent",
                }}
              >
                <div className="px-3 py-2.5 font-mono" style={{ color: "var(--dfl-accent-bright)" }}>{row.name}</div>
                <div className="px-3 py-2.5" style={{ color: "var(--dfl-text-subtle)" }}>{row.type}</div>
                <div className="px-3 py-2.5" style={{ color: "var(--dfl-text-lo)" }}>{row.purpose}</div>
                <div className="px-3 py-2.5" style={{ color: "var(--dfl-text-placeholder)" }}>{row.duration}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section num="4" title="Управление cookie">
          <P>4.1. При первом посещении сайта отображается баннер cookie, позволяющий принять все cookie, отклонить необязательные или перейти к детальным настройкам.</P>
          <P>4.2. Ваш выбор сохраняется в localStorage под ключом <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "var(--dfl-surface-2)", color: "var(--dfl-accent-bright)" }}>cookie-consent</code> на 1 год.</P>
          <P>4.3. В любой момент вы можете изменить свой выбор:</P>
          <div className="mt-3">
            <button
              onClick={handleManageCookies}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: "var(--dfl-accent-muted)",
                border: "1px solid var(--dfl-border-2)",
                color: "var(--dfl-accent-bright)",
              }}
            >
              <Cookie size={14} />
              Изменить настройки cookie
            </button>
          </div>
          <P>4.4. Вы также можете управлять cookie через настройки вашего браузера:</P>
          <ul className="space-y-1 mt-1" style={{ color: "var(--dfl-text-lo)" }}>
            {[
              { name: "Chrome", href: "https://support.google.com/chrome/answer/95647" },
              { name: "Firefox", href: "https://support.mozilla.org/ru/kb/cookies-information-websites-store-on-your-computer" },
              { name: "Safari", href: "https://support.apple.com/ru-ru/guide/safari/sfri11471/mac" },
              { name: "Edge", href: "https://support.microsoft.com/ru-ru/microsoft-edge/удаление-файлов-cookie-в-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" },
            ].map((b) => (
              <li key={b.name} className="flex gap-2 items-center text-xs">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--dfl-accent-bright)" }} />
                <a href={b.href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--dfl-accent-bright)" }}>
                  Инструкция для {b.name}
                </a>
              </li>
            ))}
          </ul>
          <P>Обратите внимание: полное отключение cookie в браузере может нарушить работу функций аутентификации и персонализации Платформы.</P>
        </Section>

        <Section num="5" title="Cookie третьих сторон">
          <P>5.1. В настоящее время Платформа не использует сторонние cookie для рекламных или маркетинговых целей.</P>
          <P>5.2. При использовании инфраструктуры Cloudflare для защиты сайта могут устанавливаться технические cookie данного провайдера (например, <code className="px-1 py-0.5 rounded text-xs font-mono" style={{ background: "var(--dfl-surface-2)", color: "var(--dfl-accent-bright)" }}>cf_clearance</code>). Политика конфиденциальности Cloudflare: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--dfl-accent-bright)" }}>cloudflare.com/privacypolicy</a>.</P>
          <P>5.3. Платформа использует собственный механизм аутентификации и хранит данные пользовательской сессии в first-party localStorage под ключом <code className="px-1 py-0.5 rounded text-xs font-mono" style={{ background: "var(--dfl-surface-2)", color: "var(--dfl-accent-bright)" }}>kovallab.local.session</code>. Инфраструктура приложения, базы данных и объектного хранилища может размещаться в Timeweb Cloud.</P>
          <P>5.4. OpenRouter.ai используется для обработки AI-запросов на серверной стороне. Данные о запросах не сохраняются в cookie — передача осуществляется через API. Политика OpenRouter: <a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--dfl-accent-bright)" }}>openrouter.ai/privacy</a>.</P>
        </Section>

        <Section num="6" title="Изменение Политики Cookie">
          <P>6.1. Оператор оставляет за собой право вносить изменения в настоящую Политику в одностороннем порядке.</P>
          <P>6.2. Актуальная версия Политики всегда доступна по адресу <a href={`${SITE}/cookie-policy`} style={{ color: "var(--dfl-accent-bright)" }}>kovallabs.com/cookie-policy</a>.</P>
          <P>6.3. При существенных изменениях, затрагивающих права пользователей, Оператор уведомит их посредством баннера на сайте.</P>
        </Section>

        <Section num="7" title="Реквизиты Оператора">
          <div
            className="rounded-2xl p-5 space-y-2.5 text-sm"
            style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)" }}
          >
            {[
              ["Наименование", IP_FULL],
              ["ИНН", INN],
              ["ОГРНИП", OGRNIP],
              ["Адрес регистрации", ADDRESS],
              ["По вопросам cookie", EMAIL],
              ["Сайт", SITE],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-4 flex-wrap">
                <span className="flex-shrink-0 font-medium" style={{ color: "var(--dfl-text-subtle)", minWidth: 180 }}>
                  {label}:
                </span>
                <span style={{ color: "var(--dfl-text-hi)" }}>
                  {label.includes("вопросам") ? (
                    <a href={`mailto:${value}`} style={{ color: "var(--dfl-accent-bright)" }}>{value}</a>
                  ) : label === "Сайт" ? (
                    <a href={value} style={{ color: "var(--dfl-accent-bright)" }}>{value}</a>
                  ) : value}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <div
          className="mt-8 pt-6 border-t text-xs text-center"
          style={{ borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-subtle)" }}
        >
          <p>Настоящая Политика cookie соответствует требованиям ФЗ-152 «О персональных данных».</p>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {[
              { label: "Политика конфиденциальности", to: "/privacy-policy" },
              { label: "Публичная оферта", to: "/public-offer" },
              { label: "EULA", to: "/eula" },
              { label: "Условия использования", to: "/terms" },
            ].map((l) => (
              <Link key={l.to} to={l.to} style={{ color: "var(--dfl-accent-bright)" }}>{l.label}</Link>
            ))}
          </div>
          <p className="mt-3" style={{ color: "var(--dfl-text-placeholder)" }}>
            © 2026 {IP_FULL}. Все права защищены.
          </p>
        </div>
      </main>
    </div>
  );
}
