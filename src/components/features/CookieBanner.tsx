import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X, ChevronDown, ChevronUp, Check } from "lucide-react";

type ConsentChoice = "all" | "necessary" | "custom";

interface CookiePrefs {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
}

const STORAGE_KEY = "cookie-consent";

function loadConsent(): ConsentChoice | null {
  try {
    return localStorage.getItem(STORAGE_KEY) as ConsentChoice | null;
  } catch {
    return null;
  }
}

function saveConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {}
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>({ necessary: true, functional: true, analytics: false });
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const consent = loadConsent();
    if (!consent) {
      // Delay appearance slightly so page renders first
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (choice: ConsentChoice) => {
    setLeaving(true);
    saveConsent(choice);
    setTimeout(() => setVisible(false), 300);
  };

  const handleAcceptAll = () => dismiss("all");
  const handleNecessaryOnly = () => dismiss("necessary");
  const handleSaveCustom = () => dismiss("custom");

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[999] px-4 pb-4 sm:px-6 sm:pb-6"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="max-w-2xl mx-auto rounded-2xl overflow-hidden"
        style={{
          background: "var(--dfl-surface-1)",
          border: "1px solid var(--dfl-border-2)",
          boxShadow: "0 8px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(37,99,235,0.1)",
          backdropFilter: "blur(16px)",
          pointerEvents: "all",
          opacity: leaving ? 0 : 1,
          transform: leaving ? "translateY(12px)" : "translateY(0)",
          transition: "opacity 280ms ease, transform 280ms ease",
          animation: "bannerSlideUp 360ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <style>{`
          @keyframes bannerSlideUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Main row */}
        <div className="flex items-start gap-4 p-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)" }}
          >
            <Cookie size={18} style={{ color: "#60a5fa" }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--dfl-text-hi)" }}>
              Мы используем cookies
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
              Для работы авторизации и улучшения платформы. Необходимые cookie не могут быть отключены.{" "}
              <Link to="/cookie-policy" className="underline underline-offset-2" style={{ color: "var(--dfl-accent-bright)" }}>
                Политика cookie
              </Link>
            </p>

            {/* Expanded preferences */}
            {expanded && (
              <div className="mt-4 space-y-2.5">
                {[
                  {
                    key: "necessary" as keyof CookiePrefs,
                    label: "Необходимые",
                    desc: "Аутентификация, безопасность сессии. Всегда активны.",
                    locked: true,
                    color: "#3b82f6",
                  },
                  {
                    key: "functional" as keyof CookiePrefs,
                    label: "Функциональные",
                    desc: "Тема оформления, настройки персонализации.",
                    locked: false,
                    color: "#22c55e",
                  },
                  {
                    key: "analytics" as keyof CookiePrefs,
                    label: "Аналитические",
                    desc: "Анонимная статистика использования платформы.",
                    locked: false,
                    color: "#f59e0b",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: "var(--dfl-text-hi)" }}>{item.label}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--dfl-text-placeholder)" }}>{item.desc}</p>
                    </div>

                    {item.locked ? (
                      <div
                        className="w-10 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${item.color}20`, border: `1px solid ${item.color}40` }}
                      >
                        <Check size={10} style={{ color: item.color }} />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPrefs((p) => ({ ...p, [item.key]: !p[item.key] }))}
                        className="w-10 h-5 rounded-full flex-shrink-0 relative transition-all duration-200"
                        style={{
                          background: prefs[item.key] ? item.color : "var(--dfl-surface-3)",
                          border: `1px solid ${prefs[item.key] ? item.color : "var(--dfl-border-2)"}`,
                        }}
                        aria-checked={prefs[item.key]}
                        role="switch"
                      >
                        <span
                          className="absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-200"
                          style={{
                            left: prefs[item.key] ? "calc(100% - 0.375rem - 0.875rem)" : "0.25rem",
                          }}
                        />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={handleSaveCustom}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={{
                    background: "var(--dfl-accent-muted)",
                    border: "1px solid var(--dfl-border-2)",
                    color: "var(--dfl-accent-bright)",
                  }}
                >
                  Сохранить настройки
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleNecessaryOnly}
            className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors duration-150"
            style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)", color: "var(--dfl-text-placeholder)" }}
            title="Только необходимые"
          >
            <X size={14} />
          </button>
        </div>

        {/* Footer buttons */}
        <div
          className="flex items-center gap-2 px-5 pb-4 flex-wrap"
          style={{ borderTop: expanded ? "1px solid var(--dfl-border-1)" : "none" }}
        >
          <button
            onClick={handleAcceptAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              color: "white",
              boxShadow: "0 2px 12px rgba(37,99,235,0.35)",
            }}
          >
            <Check size={11} />
            Принять все
          </button>

          <button
            onClick={handleNecessaryOnly}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: "var(--dfl-surface-2)",
              border: "1px solid var(--dfl-border-2)",
              color: "var(--dfl-text-lo)",
            }}
          >
            Только необходимые
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto flex items-center gap-1 text-xs transition-colors duration-150"
            style={{ color: "var(--dfl-text-placeholder)" }}
          >
            Настроить
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}
