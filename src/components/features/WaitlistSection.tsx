import { useRef } from "react";
import WaitlistForm from "@/components/features/WaitlistForm";

export default function WaitlistSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    // Disable spotlight tracking on touch/mobile devices
    if (window.matchMedia("(hover: none)").matches) return;
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  };

  return (
    <section
      id="waitlist"
      ref={sectionRef}
      className="section-wrapper waitlist-spotlight"
      onMouseMove={handleMouseMove}
    >
      <div className="container-tight relative z-10">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "var(--dfl-surface-2)",
            border: "1px solid var(--dfl-border-2)",
            boxShadow: "0 0 80px var(--dfl-glow-blue), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Background glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 blur-3xl opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(ellipse, var(--dfl-accent), transparent)" }}
          />

          <div className="relative z-10 p-5 sm:p-8 lg:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left: Copy */}
              <div>
                <div className="section-label mb-6">Ранний доступ</div>
                <h2
                  className="font-display font-bold mb-3 leading-tight"
                  style={{
                    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                    color: "var(--dfl-text-hi)",
                  }}
                >
                  Получите доступ
                  <br />
                  <span className="text-accent-gradient">к платформе первыми</span>
                </h2>
                <p className="text-sm font-medium mb-5" style={{ color: "var(--dfl-accent-bright)" }}>
                  Бета-версия запускается скоро. Оставьте заявку — получите ранний доступ первыми.
                </p>
                <p className="leading-relaxed mb-8" style={{ color: "var(--dfl-text-lo)" }}>
                  Платформа готовится к запуску. Оставьте заявку — и вы получите ранний доступ до
                  публичного релиза, специальные условия и возможность участвовать в формировании продукта.
                </p>

                {/* Trust signals */}
                <div className="space-y-3">
                  {[
                    "Фиксированная цена на период беты",
                    "Личная связь с командой на старте",
                    "Влияете на развитие продукта напрямую",
                    "Без обязательств на этапе бета-теста",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "var(--dfl-accent-muted)",
                          border: "1px solid var(--dfl-border-2)",
                        }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "var(--dfl-accent-bright)" }}
                        />
                      </div>
                      <span className="text-sm" style={{ color: "var(--dfl-text-lo)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Form */}
              <div
                className="rounded-2xl p-6 lg:p-7"
                style={{
                  background: "var(--dfl-surface-1)",
                  border: "1px solid var(--dfl-border-1)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <h3
                  className="font-display font-semibold text-lg mb-1"
                  style={{ color: "var(--dfl-text-hi)" }}
                >
                  Оставить заявку
                </h3>
                <p className="text-xs mb-5" style={{ color: "var(--dfl-text-placeholder)" }}>
                  Запуск бета-версии скоро. Фиксированные условия для ранних участников.
                </p>
                <WaitlistForm variant="full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
