import { User2, Palette, Camera, Video, Play, TrendingUp } from "lucide-react";

const features = [
  {
    icon: User2,
    title: "Создание AI-инфлюенсера",
    description:
      "Задайте внешность, возраст, стиль и характер персонажа под ДНК вашего бренда. Это ваш уникальный цифровой актив.",
    span: 4,
    minH: 200,
  },
  {
    icon: Palette,
    title: "Адаптация под бренд",
    description:
      "Настройте визуальные параметры — от стиля одежды до освещения и фирменных цветов — так, чтобы персонаж идеально вписывался в вашу айдентику.",
    span: 2,
    minH: 200,
  },
  {
    icon: Camera,
    title: "Генерация фотографий",
    description:
      "Создавайте профессиональные студийные и контекстные фотографии с вашим AI-инфлюенсером для любых каналов и форматов.",
    span: 2,
    minH: 160,
  },
  {
    icon: TrendingUp,
    title: "Трендовые видео",
    description:
      "Генерируйте короткие видеоролики с использованием актуальных трендов и паттернов — быстро и без съёмочного процесса.",
    span: 4,
    minH: 160,
  },
  {
    icon: Play,
    title: "Motion control",
    description:
      "Загрузите любое референсное видео с нужной пластикой движений. Платформа применит эту динамику к вашему AI-инфлюенсеру.",
    span: 3,
    minH: 160,
  },
  {
    icon: Video,
    title: "Масштабирование контента",
    description:
      "Генерируйте сотни вариантов контента параллельно. Тестируйте идеи, форматы и креативы в разы быстрее традиционного производства.",
    span: 3,
    minH: 160,
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="section-wrapper">
      <div className="glow-line" />
      <div className="container-wide">
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-5">Возможности платформы</div>
          <h2
            className="font-display font-bold mb-4"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              color: "var(--dfl-text-hi)",
            }}
          >
            Всё необходимое для создания
            <br className="hidden md:block" />
            <span className="text-accent-gradient"> цифрового лица бренда</span>
          </h2>
          <p className="max-w-xl mx-auto leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
            КовальЛабс объединяет создание персонажа, генерацию фото и видео, и motion control в единой системе.
          </p>
        </div>

        {/* Bento grid */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card-hover rounded-2xl p-6 group"
                style={{
                  gridColumn: `span ${feature.span}`,
                  minHeight: `${feature.minH}px`,
                }}
              >
                <div
                  className="icon-wrapper w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-200"
                  style={{
                    background: "var(--dfl-accent-muted)",
                    border: "1px solid var(--dfl-border-2)",
                  }}
                >
                  <Icon
                    size={20}
                    style={{
                      color: "var(--dfl-accent-bright)",
                      transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  />
                </div>
                <h3
                  className="font-display font-semibold text-base mb-2.5 leading-snug"
                  style={{ color: "var(--dfl-text-hi)" }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
