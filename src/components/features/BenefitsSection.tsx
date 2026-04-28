import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

const benefits = [
  {
    title: "Объём контента в месяц",
    before: "1–2 съёмки → 10–15 материалов",
    after: "60–100 единиц контента без съёмок",
  },
  {
    title: "Скорость от идеи до публикации",
    before: "2–4 недели: бриф, съёмка, монтаж, согласование",
    after: "2–6 часов: описал задачу — получил готовый контент",
  },
  {
    title: "Стоимость одного материала",
    before: "3 000–30 000 ₽ за фото или видео при работе с командой",
    after: "Фиксированные поинты: стоимость прозрачна до запуска",
  },
  {
    title: "Последовательность образа бренда",
    before: "Разные авторы — разный стиль, нет единого персонажа",
    after: "Один AI-инфлюенсер во всех форматах и кампаниях",
  },
  {
    title: "Тестирование гипотез",
    before: "Каждая идея требует отдельной съёмки",
    after: "10 вариантов за один запуск — A/B без бюджета на продакшн",
  },
  {
    title: "Зависимость от людей",
    before: "Инфлюенсер недоступен, фотограф занят — план срывается",
    after: "AI-персонаж доступен 24/7, без согласований и нервов",
  },
];

function FlipCard({ benefit, delay }: { benefit: typeof benefits[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    inner.style.transform = "rotateY(180deg)";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            if (inner) inner.style.transform = "rotateY(0deg)";
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} style={{ perspective: "800px" }}>
      <div
        ref={innerRef}
        style={{
          transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="rounded-2xl p-5 lg:p-6"
          style={{
            backfaceVisibility: "hidden",
            background: "var(--dfl-surface-1)",
            border: "1px solid var(--dfl-border-1)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr,36px,1fr] gap-3 md:gap-4 items-center">
            {/* Before */}
            <div
              className="p-4 rounded-xl"
              style={{
                background: "var(--dfl-error-muted)",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--dfl-error)" }}
              >
                Было
              </div>
              <p className="text-sm" style={{ color: "var(--dfl-text-lo)" }}>{benefit.before}</p>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background: "var(--dfl-accent-muted)",
                  border: "1px solid var(--dfl-border-2)",
                }}
              >
                <ArrowRight size={14} style={{ color: "var(--dfl-accent-bright)" }} />
              </div>
            </div>

            {/* After */}
            <div
              className="p-4 rounded-xl"
              style={{
                background: "rgba(139,92,246,0.07)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "#a78bfa" }}
              >
                Стало
              </div>
              <p className="text-sm" style={{ color: "var(--dfl-text-mid)" }}>{benefit.after}</p>
            </div>
          </div>

          <div
            className="mt-4 pt-4"
            style={{ borderTop: "1px solid var(--dfl-border-1)" }}
          >
            <span
              className="font-display font-semibold text-sm"
              style={{ color: "var(--dfl-text-hi)" }}
            >
              {benefit.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BenefitsSection() {
  return (
    <section id="benefits" className="section-wrapper">
      <div className="container-tight">
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-5">Результаты</div>
          <h2
            className="font-display font-bold"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              color: "var(--dfl-text-hi)",
            }}
          >
            Что меняется, когда вы
            <br className="hidden md:block" />
            <span className="text-accent-gradient"> переходите на КовальЛабс</span>
          </h2>
        </div>

        <div className="space-y-4">
          {benefits.map((benefit, i) => (
            <FlipCard key={benefit.title} benefit={benefit} delay={i * 200} />
          ))}
        </div>
      </div>
    </section>
  );
}
