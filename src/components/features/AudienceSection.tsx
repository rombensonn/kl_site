import { ShoppingCart, Sparkles, User2 } from "lucide-react";

const audiences = [
  {
    label: "E-commerce компании",
    pain: "Сотни SKU, а контента не хватает. Каждая съёмка — отдельный бюджет, согласование и неделя ожидания.",
    solution: "Генерируйте визуал под любой продукт и сезон за часы, сохраняя образ персонажа последовательным во всех карточках и рекламных баннерах.",
    Icon: ShoppingCart,
  },
  {
    label: "Fashion и Beauty бренды",
    pain: "Визуальная идентичность зависит от конкретных авторов и их интерпретации бренда. Стоит одному из них пропасть — контент-план рушится.",
    solution: "Создайте своего AI-персонажа с брендовым вайбом один раз — и используйте его в любых кампаниях, сезонах и форматах без пересборки.",
    Icon: Sparkles,
  },
  {
    label: "Креаторы и предприниматели",
    pain: "Снимать самому — долго и дорого. Нанимать людей — нестабильно. Личный бренд требует постоянного контента, а ресурсов на это нет.",
    solution: "Создайте своего AI-двойника или отдельного персонажа и монетизируйте его: реклама, коллаборации, продажа контента партнёрам.",
    Icon: User2,
  },
];

export default function AudienceSection() {
  return (
    <section id="audience" className="section-wrapper">
      <div className="glow-line" />
      <div className="container-wide">
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-5">Для кого</div>
          <h2
            className="font-display font-bold mb-4"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              color: "var(--dfl-text-hi)",
            }}
          >
            Платформа для тех,
            <br className="hidden md:block" />
            <span className="text-accent-gradient"> кому нужен AI-инфлюенсер</span>
          </h2>
          <p className="max-w-xl mx-auto leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
            Три аудитории — три разных сценария использования. Одна платформа для всех.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {audiences.map((audience) => {
            const Icon = audience.Icon;
            return (
              <div key={audience.label} className="glass-card-hover rounded-2xl p-6 lg:p-7 group">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="icon-wrapper w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                    style={{
                      background: "var(--dfl-accent-muted)",
                      border: "1px solid var(--dfl-border-2)",
                    }}
                  >
                    <Icon
                      size={22}
                      style={{
                        color: "var(--dfl-accent-bright)",
                        transition: "all 200ms",
                      }}
                    />
                  </div>
                  <h3
                    className="font-display font-semibold text-base transition-colors duration-200"
                    style={{ color: "var(--dfl-text-hi)" }}
                  >
                    {audience.label}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl p-3" style={{ background: "var(--dfl-error-muted)", border: "1px solid rgba(239,68,68,0.12)" }}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--dfl-error)" }}>Боль</div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>{audience.pain}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: "var(--dfl-accent-muted-2)", border: "1px solid var(--dfl-border-2)" }}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--dfl-accent-bright)" }}>Решение</div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>{audience.solution}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
