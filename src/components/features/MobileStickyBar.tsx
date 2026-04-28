import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export default function MobileStickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToWaitlist = () => {
    window.dispatchEvent(new Event("open-waitlist-overlay"));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div
        className="px-4 py-3"
        style={{
          borderTop: "1px solid var(--dfl-border-1)",
          background: "color-mix(in srgb, var(--dfl-bg) 97%, transparent)",
          backdropFilter: "blur(16px)",
        }}
      >
        <button onClick={scrollToWaitlist} className="btn-primary w-full py-3.5">
          Войти в лист ожидания
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
