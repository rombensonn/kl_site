import { Link, useLocation } from "react-router-dom";
import { Zap, ArrowLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const LEGAL_LINKS = [
  { to: "/privacy-policy",  label: "Конфиденциальность", short: "ПК" },
  { to: "/consent",         label: "Согласие на обработку", short: "СД" },
  { to: "/terms",           label: "Условия использования", short: "УИ" },
  { to: "/public-offer",    label: "Публичная оферта", short: "ПО" },
  { to: "/eula",            label: "EULA", short: "EU" },
  { to: "/cookie-policy",   label: "Политика Cookie", short: "CK" },
];

interface LegalNavbarProps {
  /** Override back-button destination (default: "/") */
  backTo?: string;
  /** Override back-button label */
  backLabel?: string;
}

export default function LegalNavbar({ backTo = "/", backLabel = "На главную" }: LegalNavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const isDark = theme === "dark";

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: isDark ? "rgba(5,5,15,0.92)" : "rgba(244,247,252,0.95)",
        borderColor: "var(--dfl-border-1)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Top row */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        {/* Back */}
        <Link
          to={backTo}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 flex-shrink-0"
          style={{ color: "var(--dfl-text-lo)", textDecoration: "none" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dfl-text-hi)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dfl-text-lo)")}
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">{backLabel}</span>
        </Link>

        <div className="w-px h-5 flex-shrink-0" style={{ background: "var(--dfl-border-2)" }} />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0" style={{ textDecoration: "none" }}>
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
          >
            <Zap size={11} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm hidden sm:block" style={{ color: "var(--dfl-text-hi)" }}>
            Коваль<span style={{ background: "linear-gradient(90deg,#3b82f6,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Лабс</span>
          </span>
        </Link>

        <div className="flex-1" />

        {/* Doc label */}
        <span
          className="hidden md:inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)" }}
        >
          Правовые документы
        </span>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors duration-150"
          style={{
            background: "var(--dfl-surface-2)",
            border: "1px solid var(--dfl-border-1)",
            color: "var(--dfl-text-subtle)",
          }}
          aria-label="Переключить тему"
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dfl-text-hi)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)")}
        >
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>

      {/* Document tabs row */}
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 pb-0 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex gap-0.5 min-w-max">
          {LEGAL_LINKS.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all duration-150 relative flex-shrink-0"
                style={{
                  color: isActive ? "var(--dfl-accent-bright)" : "var(--dfl-text-subtle)",
                  textDecoration: "none",
                  borderBottom: isActive
                    ? "2px solid var(--dfl-accent-bright)"
                    : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-lo)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)";
                }}
              >
                {/* Active dot */}
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--dfl-accent-bright)" }}
                  />
                )}
                {/* Full label on md+, short on small */}
                <span className="hidden sm:inline">{link.label}</span>
                <span className="sm:hidden font-bold">{link.short}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
