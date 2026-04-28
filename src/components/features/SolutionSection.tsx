import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const highlights = [
  "Ваш собственный AI-персонаж без зависимости от авторов",
  "Генерация фото и видео в одной платформе",
  "Motion control без съёмочного процесса",
  "Полный контроль над визуальным образом бренда",
];

const stats = [
  { value: 4000, label: "Фото создано", display: (v: number) => `${Math.round(v / 1000)}K+` },
  { value: 180, label: "Видео за месяц", display: (v: number) => `${Math.round(v)}` },
  { value: 100, label: "Контроль бренда", display: (v: number) => `${Math.round(v)}%` },
];

function AnimatedCounter({ target, display }: { target: number; display: (v: number) => string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            setValue(target * ease);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="font-display font-bold text-lg" style={{ color: "var(--dfl-text-hi)" }}>
      {display(value)}
    </div>
  );
}

export default function SolutionSection() {
  return (
    <section id="solution" className="section-wrapper">
      <div className="container-tight">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className="section-label mb-5">Решение</div>
            <h2
              className="font-display font-bold mb-5 leading-tight"
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                color: "var(--dfl-text-hi)",
              }}
            >
              Платформа, которая даёт бренду
              <span className="text-accent-gradient"> собственное цифровое лицо</span>
            </h2>
            <p className="leading-relaxed mb-8" style={{ fontSize: "1.05rem", color: "var(--dfl-text-lo)" }}>
              КовальЛабс — это специализированная платформа, где бренд создаёт своего уникального
              AI-инфлюенсера и использует его для производства всего визуального контента: фото, видео
              и motion-ролики — из одного рабочего пространства.
            </p>
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" style={{ color: "var(--dfl-accent-bright)" }} />
                  <span className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-mid)" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Visual block */}
          <div className="relative">
            <div
              className="rounded-2xl p-7 space-y-4"
              style={{
                background: "var(--dfl-surface-2)",
                border: "1px solid var(--dfl-border-2)",
                boxShadow: "0 0 60px var(--dfl-glow-blue)",
              }}
            >
              <div
                className="text-xs font-medium uppercase tracking-wider mb-4"
                style={{ color: "var(--dfl-text-placeholder)" }}
              >
                Рабочий процесс КовальЛабс
              </div>

              {[
                { step: "1", label: "Создание инфлюенсера", status: "done" },
                { step: "2", label: "Генерация фото", status: "done" },
                { step: "3", label: "Трендовое видео", status: "active" },
                { step: "4", label: "Motion control", status: "pending" },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: item.status === "active" ? "var(--dfl-accent-muted)" : "var(--dfl-surface-1)",
                    border: item.status === "active" ? "1px solid var(--dfl-border-2)" : "1px solid var(--dfl-border-1)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background:
                        item.status === "done" ? "var(--dfl-success-muted)" :
                        item.status === "active" ? "var(--dfl-accent-muted)" :
                        "var(--dfl-surface-3)",
                      color:
                        item.status === "done" ? "var(--dfl-success)" :
                        item.status === "active" ? "var(--dfl-accent-bright)" :
                        "var(--dfl-text-placeholder)",
                    }}
                  >
                    {item.status === "done" ? "✓" : item.step}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: item.status === "active" ? "var(--dfl-text-hi)"
                        : item.status === "done" ? "var(--dfl-text-lo)"
                        : "var(--dfl-text-placeholder)",
                    }}
                  >
                    {item.label}
                  </span>
                  {item.status === "active" && (
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--dfl-accent-bright)" }} />
                      <span className="text-xs" style={{ color: "var(--dfl-accent-bright)" }}>В процессе</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Animated stats */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center p-3 rounded-xl"
                    style={{
                      background: "var(--dfl-surface-1)",
                      border: "1px solid var(--dfl-border-1)",
                    }}
                  >
                    <AnimatedCounter target={stat.value} display={stat.display} />
                    <div className="text-xs mt-0.5" style={{ color: "var(--dfl-text-subtle)" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
