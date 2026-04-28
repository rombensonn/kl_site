import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ borderTop: "1px solid var(--dfl-border-1)" }}>
      <div className="container-wide py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
              >
                <Zap size={10} className="text-white" />
              </div>
              <span
                className="font-display font-bold text-base tracking-tight"
                style={{ color: "var(--dfl-text-hi)" }}
              >
                КовальЛабс
              </span>
            </div>
            <p
              className="text-xs font-medium"
              style={{ color: "var(--dfl-accent-bright)" }}
            >
              Один AI‑инфлюенсер. Весь контент бренда. Без съёмок.
            </p>
            <p
              className="text-xs max-w-xs leading-relaxed mt-1"
              style={{ color: "var(--dfl-text-placeholder)" }}
            >
              Платформа для создания собственного AI-персонажа и генерации визуального контента.
            </p>
          </div>

          {/* Links – three columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-1.5">
            {/* Column 1: Platform */}
            <div className="space-y-1.5">
              <p className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--dfl-text-placeholder)" }}>Платформа</p>
              {[
                { label: "Возможности", href: "/#features" },
                { label: "Как это работает", href: "/#how" },
                { label: "Для кого", href: "/#audience" },
              ].map((l) => (
                <a key={l.href} href={l.href} className="block text-xs transition-colors duration-200" style={{ color: "var(--dfl-text-subtle)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dfl-text-lo)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)")}>
                  {l.label}
                </a>
              ))}
            </div>

            {/* Column 2: Account */}
            <div className="space-y-1.5">
              <p className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--dfl-text-placeholder)" }}>Аккаунт</p>
              {[
                { label: "Войти", to: "/auth/login" },
                { label: "Регистрация", to: "/auth/register" },
                { label: "Дашборд", to: "/dashboard" },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="block text-xs transition-colors duration-200" style={{ color: "var(--dfl-text-subtle)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dfl-text-lo)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)")}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Column 3: Legal */}
            <div className="space-y-1.5">
              <p className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: "var(--dfl-text-placeholder)" }}>Правовая информация</p>
              {[
                { label: "Политика конфиденциальности", to: "/privacy-policy" },
                { label: "Условия использования", to: "/terms" },
                { label: "Публичная оферта", to: "/public-offer" },
                { label: "Лицензионное соглашение (EULA)", to: "/eula" },
                { label: "Политика cookie", to: "/cookie-policy" },
                { label: "Согласие на обработку данных", to: "/consent" },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="block text-xs transition-colors duration-200" style={{ color: "var(--dfl-text-subtle)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dfl-text-lo)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)")}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Separator */}
        <div
          className="my-6"
          style={{ height: 1, background: "var(--dfl-border-1)", width: "100%" }}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          <p className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
            © {currentYear} КовальЛабс. Все права защищены.
          </p>
          <p className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
            Бета-версия · Запуск скоро
          </p>
        </div>
        {/* Legal entity */}
        <div
          className="rounded-xl px-4 py-3 text-[10px] leading-relaxed"
          style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)", color: "var(--dfl-text-placeholder)" }}
        >
          <span className="font-semibold" style={{ color: "var(--dfl-text-subtle)" }}>ИП Соколов Сергей Дмитриевич</span>
          {" · "}
          ИНН&nbsp;505029409487
          {" · "}
          ОГРНИП&nbsp;324508100007100
          {" · "}
          141131, Россия, Московская обл., г.о.&nbsp;Щёлково, д.&nbsp;Назимиха, д.&nbsp;38
          {" · "}
          <a href="mailto:support@kovallabs.com" style={{ color: "var(--dfl-accent-bright)" }}>support@kovallabs.com</a>
        </div>
      </div>
    </footer>
  );
}
