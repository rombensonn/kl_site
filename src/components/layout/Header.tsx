import { useState, useEffect, useRef } from "react";
import { Menu, X, Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const navLinks = [
  { label: "Как это работает", href: "#how-it-works" },
  { label: "Возможности", href: "#features" },
  { label: "Для кого", href: "#audience" },
  { label: "FAQ", href: "#faq" },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Glassmorphism on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sliding underline indicator
  const updateIndicator = (idx: number | null) => {
    const indicator = indicatorRef.current;
    if (!indicator) return;
    if (idx === null) {
      indicator.style.opacity = "0";
      return;
    }
    const btn = btnRefs.current[idx];
    if (!btn) return;
    const parentLeft = navRef.current?.getBoundingClientRect().left ?? 0;
    const btnRect = btn.getBoundingClientRect();
    indicator.style.left = `${btnRect.left - parentLeft}px`;
    indicator.style.width = `${btnRect.width}px`;
    indicator.style.opacity = "1";
  };

  useEffect(() => {
    updateIndicator(hoverIdx ?? activeIdx);
  }, [hoverIdx, activeIdx]);

  const handleNavClick = (href: string, idx: number) => {
    setMobileOpen(false);
    setActiveIdx(idx);
    const el = document.querySelector(href);
    if (!el) return;
    // Use smooth scroll with header offset compensation
    const headerHeight = 64;
    const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const isDark = theme === "dark";

  // Header background based on theme + scroll
  const headerBg = scrolled
    ? isDark
      ? "rgba(5,5,10,0.82)"
      : "rgba(244,247,252,0.88)"
    : "transparent";

  const headerShadow = scrolled
    ? isDark
      ? "0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.2)"
      : "0 1px 0 rgba(37,99,235,0.1), 0 4px 24px rgba(0,0,0,0.08)"
    : "none";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: headerBg,
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        boxShadow: headerShadow,
        // Promote header to own GPU compositor layer — isolates backdrop-filter
        // repaint from the main scroll layer, eliminating scroll jank
        willChange: "transform",
        transform: "translateZ(0)",
      }}
    >
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2 group"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                boxShadow: "0 0 0 0 rgba(59,130,246,0)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 16px rgba(37,99,235,0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 0 rgba(59,130,246,0)";
              }}
            >
              <Zap size={13} className="text-white" />
            </div>
            <span
              className="font-display text-lg"
              title="КовальЛабс"
              aria-label="КовальЛабс"
              style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
            >
              <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
              <span className="text-accent-gradient">Лабс</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 relative" ref={navRef}>
            {/* Sliding underline indicator */}
            <div
              ref={indicatorRef}
              className="absolute bottom-0 h-0.5 rounded-full pointer-events-none"
              style={{
                background: "var(--dfl-accent-bright)",
                transition: "left 250ms ease-out, width 250ms ease-out, opacity 200ms",
                opacity: 0,
              }}
            />
            {navLinks.map((link, i) => (
              <button
                key={link.href}
                ref={(el) => { btnRefs.current[i] = el; }}
                onClick={() => handleNavClick(link.href, i)}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                className="relative px-4 py-2 text-sm font-medium transition-colors duration-200"
                style={{
                  color: activeIdx === i
                    ? "var(--dfl-text-hi)"
                    : "var(--dfl-text-lo)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA + theme toggle */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme toggle with Radix-style design */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
              title={isDark ? "Светлая тема" : "Тёмная тема"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => window.dispatchEvent(new Event("open-waitlist-overlay"))}
              className="btn-primary text-sm px-5 py-2.5"
            >
              Войти в лист ожидания
            </button>
          </div>

          {/* Mobile buttons */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              style={{ width: 36, height: 36 }}
              aria-label="Переключить тему"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
              style={{
                color: "var(--dfl-text-lo)",
                background: "var(--dfl-surface-2)",
                border: "1px solid var(--dfl-border-1)",
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Меню"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t"
          style={{
            borderColor: "var(--dfl-border-1)",
            background: isDark ? "rgba(5,5,10,0.98)" : "rgba(244,247,252,0.98)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="container-wide py-4 flex flex-col gap-2">
            {navLinks.map((link, i) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href, i)}
                className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  color: "var(--dfl-text-lo)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--dfl-text-hi)";
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--dfl-surface-2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--dfl-text-lo)";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                window.dispatchEvent(new Event("open-waitlist-overlay"));
              }}
              className="btn-primary mt-2 text-sm"
            >
              Войти в лист ожидания
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
