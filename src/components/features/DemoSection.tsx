const demoSteps = [
  {
    number: "01",
    phase: "Создание персонажа",
    title: "Настройте AI-инфлюенсера",
    description: "Выберите внешность, стиль, возраст и характер. Задайте параметры бренда — и платформа создаёт уникального AI-персонажа.",
    visual: {
      label: "Конструктор персонажа",
      items: ["Внешность и черты", "Стиль и одежда", "Параметры бренда", "Подтверждение"],
    },
  },
  {
    number: "02",
    phase: "Генерация фото",
    title: "Создайте фотоконтент",
    description: "Задайте сцену, освещение и контекст. Платформа генерирует профессиональные фотографии с вашим инфлюенсером.",
    visual: {
      label: "Генератор фото",
      items: ["Промпт сцены", "Настройки освещения", "Выбор ракурса", "Экспорт контента"],
    },
  },
  {
    number: "03",
    phase: "Референс-видео",
    title: "Загрузите референсное видео",
    description: "Выберите любое видео с движениями, которые хотите воспроизвести. Платформа считывает пластику и динамику.",
    visual: {
      label: "Загрузка референса",
      items: ["Загрузка видео", "Анализ движений", "Выбор инфлюенсера", "Параметры переноса"],
    },
  },
  {
    number: "04",
    phase: "Motion control",
    title: "Получите готовый ролик",
    description: "Платформа применяет захваченную динамику к вашему AI-инфлюенсеру. Результат — полноценный видеоролик без съёмки.",
    visual: {
      label: "Результат",
      items: ["Motion rendering", "Проверка качества", "Экспорт видео", "Готов к публикации"],
    },
  },
];

export default function DemoSection() {
  return (
    <section id="demo" className="section-wrapper">
      <div className="glow-line" />
      <div className="container-wide">
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-5">Как работает платформа</div>
          <h2
            className="font-display font-bold"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              color: "var(--dfl-text-hi)",
            }}
          >
            Полный цикл: от создания персонажа
            <br className="hidden md:block" />
            <span className="text-accent-gradient"> до готового motion-видео</span>
          </h2>
        </div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div
            className="hidden lg:block absolute left-[192px] top-0 bottom-0 w-px"
            style={{
              background: "linear-gradient(to bottom, transparent, var(--dfl-border-2), transparent)",
            }}
          />

          <div className="space-y-6">
            {demoSteps.map((step, index) => (
              <div
                key={step.number}
                className="grid grid-cols-1 lg:grid-cols-[180px,1fr] gap-4 lg:gap-6 items-start"
              >
                {/* Left: Step info */}
                <div className="lg:text-right lg:pr-8 flex lg:flex-col items-start lg:items-end gap-3 lg:gap-2">
                  <div
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center font-display font-bold text-sm lg:self-end"
                    style={{
                      background: "var(--dfl-accent-muted)",
                      border: "1px solid var(--dfl-border-2)",
                      color: "var(--dfl-accent-bright)",
                    }}
                  >
                    {step.number}
                  </div>
                  <div>
                    <div
                      className="text-xs font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "var(--dfl-text-placeholder)" }}
                    >
                      {step.phase}
                    </div>
                    <div
                      className="font-display font-semibold text-sm"
                      style={{ color: "var(--dfl-text-lo)" }}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>

                {/* Right: Content card */}
                <div
                  className="glass-card rounded-2xl p-6 lg:p-7"
                  style={{
                    borderLeft: `2px solid var(--dfl-border-2)`,
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                      <h3
                        className="font-display font-semibold text-lg mb-3"
                        style={{ color: "var(--dfl-text-hi)" }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
                        {step.description}
                      </p>
                    </div>

                    {/* Visual flow */}
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "var(--dfl-surface-2)",
                        border: "1px solid var(--dfl-border-1)",
                      }}
                    >
                      <div
                        className="text-xs font-medium mb-3"
                        style={{ color: "var(--dfl-text-placeholder)" }}
                      >
                        {step.visual.label}
                      </div>
                      <div className="space-y-2">
                        {step.visual.items.map((item, i) => (
                          <div
                            key={item}
                            className="flex items-center gap-2.5 text-xs"
                            style={{ opacity: 1 - i * 0.15 }}
                          >
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                              style={{
                                background: i === 0 ? "var(--dfl-accent-muted)" : "var(--dfl-surface-3)",
                                color: i === 0 ? "var(--dfl-accent-bright)" : "var(--dfl-text-placeholder)",
                              }}
                            >
                              {i + 1}
                            </div>
                            <span style={{ color: i === 0 ? "var(--dfl-text-mid)" : "var(--dfl-text-subtle)" }}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
