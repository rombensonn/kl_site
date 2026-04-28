import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function PresaleHeader() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-4 left-4 right-4 z-50 flex justify-center">
      <nav
        className="w-full max-w-6xl flex items-center justify-between px-5 rounded-2xl transition-all duration-300"
        style={{
          height: 52,
          background: scrolled ? "var(--dfl-surface-2)" : "transparent",
          border: scrolled ? "1px solid var(--dfl-border-1)" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.2)" : "none",
        }}
      >
        <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}
          >
            <Zap size={12} className="text-white" />
          </div>
          <span
            className="font-display font-bold text-sm hidden sm:block"
            style={{ letterSpacing: "-0.02em" }}
          >
            <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
            <span className="text-accent-gradient">Лабс</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Сменить тему"
            className="cursor-pointer flex items-center justify-center rounded-xl transition-all duration-200"
            style={{
              width: 36,
              height: 36,
              background: "var(--dfl-surface-1)",
              border: "1px solid var(--dfl-border-1)",
              color: "var(--dfl-text-subtle)",
            }}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm rounded-xl transition-all duration-200 cursor-pointer"
            style={{
              padding: "0 14px",
              height: 36,
              background: "var(--dfl-surface-1)",
              border: "1px solid var(--dfl-border-1)",
              color: "var(--dfl-text-lo)",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:block">На сайт</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
