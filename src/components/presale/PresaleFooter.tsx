import { Link } from "react-router-dom";
import { Zap, Shield, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function PresaleFooter() {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Gradient divider line — all blue */}
      <div
        style={{
          height: 1,
          background: "linear-gradient(to right, transparent, var(--dfl-accent) 30%, var(--dfl-accent-bright) 70%, transparent)",
        }}
      />

      <div className="px-4 sm:px-6 py-10">
        <div className="container-wide">
          {/* Main row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            {/* Left: brand + tagline */}
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-2" style={{ textDecoration: "none" }}>
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
                >
                  <Zap size={11} className="text-white" />
                </div>
                <span className="font-display font-bold text-sm" style={{ letterSpacing: "-0.02em" }}>
                  <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
                  <span className="text-accent-gradient">Лабс</span>
                </span>
              </Link>
              <p className="text-xs" style={{ color: "var(--dfl-text-placeholder)", marginLeft: "2.25rem" }}>
                ИИ-контент без съёмок
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--dfl-text-placeholder)", marginLeft: "2.25rem" }}>
                Платформа запустится в 2026 году
              </p>
            </div>

            {/* Right: links + trust badges */}
            <div className="flex flex-col items-start sm:items-end gap-4">
              <div className="flex items-center gap-5 flex-wrap">
                {[
                  { label: "Публичная оферта", href: "/public-offer" },
                  { label: "Конфиденциальность", href: "/privacy-policy" },
                  { label: "Поддержка", href: "/support" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    to={l.href}
                    className="text-xs transition-colors duration-150 cursor-pointer"
                    style={{ color: "var(--dfl-text-placeholder)", textDecoration: "none" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = "var(--dfl-text-hi)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = "var(--dfl-text-placeholder)")
                    }
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--dfl-text-subtle)" }}>
                  <Shield size={12} style={{ color: "var(--dfl-success)" }} />
                  Защита данных
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--dfl-text-subtle)" }}>
                  <Lock size={12} style={{ color: "var(--dfl-accent-bright)" }} />
                  Безопасная оплата
                </div>
              </div>
            </div>
          </div>

          {/* Bottom copyright */}
          <div
            className="mt-8 pt-6 text-xs text-center"
            style={{
              borderTop: "1px solid var(--dfl-border-1)",
              color: "var(--dfl-text-placeholder)",
              opacity: 0.6,
            }}
          >
            © {year} КовальЛабс · Все права защищены · Оплата через ЮКассу защищена
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
