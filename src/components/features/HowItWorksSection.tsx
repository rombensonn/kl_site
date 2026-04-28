import { useEffect, useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Создайте AI-инфлюенсера",
    description:
      "Задайте внешность, стиль, характер и параметры вашего персонажа. Платформа создаёт уникального AI-инфлюенсера, адаптированного под ДНК вашего бренда. Этот персонаж остаётся вашим постоянным цифровым активом.",
    tags: ["Визуальный профиль", "Стиль бренда", "Параметры персонажа"],
    delay: 0,
  },
  {
    number: "02",
    title: "Генерируйте фото и визуальный контент",
    description:
      "Используйте вашего AI-инфлюенсера для создания профессиональных фотографий и трендовых коротких видео. Задавайте контекст, сцену и настроение — платформа генерирует готовый контент.",
    tags: ["AI-фотографии", "Короткие видео", "Рекламные материалы"],
    delay: 150,
  },
  {
    number: "03",
    title: "Motion control: загрузите видео — получите результат",
    description:
      "Загрузите референсное видео с любой динамикой и движениями. Выберите вашего AI-инфлюенсера. Платформа переносит пластику и движения референса на персонажа бренда — без съёмки.",
    tags: ["Референсное видео", "Перенос движения", "Готовый ролик"],
    delay: 300,
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(32px)";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.transition = `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${step.delay}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${step.delay}ms`;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, 50);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [step.delay]);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative transition-all duration-300 hover:scale-110"
          style={{
            background: "var(--dfl-accent-muted)",
            border: "1px solid var(--dfl-border-2)",
            boxShadow: "0 0 20px var(--dfl-glow-blue)",
            animation: "step-pulse 2s ease-in-out infinite",
            animationDelay: `${index * 0.6}s`,
          }}
        >
          <span
            className="font-display font-bold text-sm"
            style={{ color: "var(--dfl-accent-bright)" }}
          >
            {step.number}
          </span>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(37,99,235,0.12)]">
        <h3
          className="font-display font-semibold text-lg mb-3 leading-snug"
          style={{ color: "var(--dfl-text-hi)" }}
        >
          {step.title}
        </h3>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--dfl-text-lo)" }}>
          {step.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {step.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 hover:scale-105 cursor-default"
              style={{
                background: "var(--dfl-accent-muted)",
                border: "1px solid var(--dfl-border-2)",
                color: "var(--dfl-accent-bright)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnimatedConnector() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const line = svg.querySelector("line");
    if (!line) return;
    const length = 200;
    line.style.strokeDasharray = `${length}`;
    line.style.strokeDashoffset = `${length}`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          line.style.transition = "stroke-dashoffset 1200ms ease-in-out";
          line.style.strokeDashoffset = "0";
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={svgRef}
      className="hidden lg:block absolute top-[22px] left-[calc(50%-100px)] w-[200px] h-[2px]"
      style={{ overflow: "visible" }}
      viewBox="0 0 200 2"
    >
      <line x1="0" y1="1" x2="200" y2="1" stroke="var(--dfl-border-2)" strokeWidth="1.5" />
    </svg>
  );
}

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section-wrapper">
      <div className="container-wide">
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-5">Как это работает</div>
          <h2
            className="font-display font-bold"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              color: "var(--dfl-text-hi)",
            }}
          >
            Три шага — от создания до готового контента
          </h2>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-6 left-0 right-0 pointer-events-none">
            <div className="grid grid-cols-3 gap-6 px-4">
              <div className="relative"><AnimatedConnector /></div>
              <div className="relative"><AnimatedConnector /></div>
              <div />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
