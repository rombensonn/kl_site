import { CreditCard, Mail, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "./FadeIn";

const STEPS = [
  {
    num: "01",
    Icon: CreditCard,
    title: "Оплатите бронирование",
    body: "Выберите срок (1 или 3 месяца) и внесите оплату. Деньги резервируются, списание происходит после запуска платформы.",
  },
  {
    num: "02",
    Icon: Mail,
    title: "Получите подтверждение",
    body: "На вашу электронную почту придёт письмо с деталями брони, гарантийными условиями и ожидаемой датой запуска.",
  },
  {
    num: "03",
    Icon: Rocket,
    title: "Используйте с первого дня",
    body: "Когда платформа откроется, вы получите доступ первыми — по зафиксированной цене 2 792 ₽/мес.",
  },
];

const circleVariant = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 18, delay: i * 0.18 },
  }),
};

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: i * 0.15 + 0.1 },
  }),
};

export default function PresaleHowItWorks() {
  return (
    <section className="section-wrapper">
      <div className="container-tight">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="section-label mb-5">Как это работает</div>
            <h2
              className="font-display font-black leading-none"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 4rem)",
                letterSpacing: "-0.04em",
                color: "var(--dfl-text-hi)",
              }}
            >
              Три шага
              <br />
              <span style={{ color: "var(--dfl-text-subtle)", fontWeight: 700 }}>
                до вашего места.
              </span>
            </h2>
          </div>
        </FadeIn>

        {/* Desktop: horizontal stepper */}
        <div className="hidden md:block">
          {/* Step circles + connecting line */}
          <motion.div
            className="flex items-center justify-between mb-10 relative px-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex items-center flex-1">
                <motion.div
                  custom={i}
                  variants={circleVariant}
                  className="relative z-10 flex-shrink-0"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-display font-black text-lg"
                    style={{
                      background: "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))",
                      color: "white",
                      boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
                    }}
                  >
                    {step.num}
                  </div>
                </motion.div>

                {i < STEPS.length - 1 && (
                  <div className="flex-1 relative h-0.5 mx-2" style={{ background: "var(--dfl-border-1)" }}>
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: "linear-gradient(90deg, var(--dfl-accent), var(--dfl-accent-bright))",
                        transformOrigin: "left",
                      }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.18 + 0.3 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </motion.div>

          {/* Cards */}
          <motion.div
            className="grid grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {STEPS.map(({ num, Icon, title, body }, i) => (
              <motion.div
                key={num}
                custom={i}
                variants={cardVariant}
                className="rounded-3xl p-7 relative overflow-hidden"
                style={{
                  background: "var(--dfl-surface-1)",
                  border: "1px solid var(--dfl-border-1)",
                }}
              >
                {/* Watermark */}
                <div
                  aria-hidden
                  className="absolute -top-5 -right-2 font-display font-black leading-none pointer-events-none select-none"
                  style={{
                    fontSize: "7rem",
                    color: "var(--dfl-accent-bright)",
                    opacity: 0.05,
                    letterSpacing: "-0.05em",
                  }}
                >
                  {num}
                </div>

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: "var(--dfl-accent-muted)",
                    border: "1px solid var(--dfl-border-2)",
                  }}
                >
                  <Icon size={18} style={{ color: "var(--dfl-accent-bright)" }} />
                </div>

                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "var(--dfl-accent-bright)" }}
                >
                  {num}
                </div>

                <h3
                  className="font-display font-bold text-base mb-2.5"
                  style={{ color: "var(--dfl-text-hi)", letterSpacing: "-0.02em" }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
                  {body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden relative">
          <div
            className="absolute left-6 top-0 bottom-0 w-0.5"
            style={{ background: "var(--dfl-border-1)" }}
          >
            <motion.div
              className="absolute top-0 left-0 right-0 rounded-full"
              style={{
                background: "linear-gradient(180deg, var(--dfl-accent), var(--dfl-accent-bright))",
                transformOrigin: "top",
              }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>

          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {STEPS.map(({ num, Icon, title, body }, i) => (
              <motion.div
                key={num}
                custom={i}
                variants={cardVariant}
                className="flex gap-5"
              >
                <motion.div
                  custom={i}
                  variants={circleVariant}
                  className="flex-shrink-0 z-10"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-sm"
                    style={{
                      background: "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))",
                      color: "white",
                      boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
                    }}
                  >
                    {num}
                  </div>
                </motion.div>

                <div
                  className="flex-1 rounded-2xl p-5 mb-2"
                  style={{
                    background: "var(--dfl-surface-1)",
                    border: "1px solid var(--dfl-border-1)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: "var(--dfl-accent-muted)",
                        border: "1px solid var(--dfl-border-2)",
                      }}
                    >
                      <Icon size={14} style={{ color: "var(--dfl-accent-bright)" }} />
                    </div>
                  </div>
                  <h3
                    className="font-display font-bold text-base mb-2"
                    style={{ color: "var(--dfl-text-hi)", letterSpacing: "-0.02em" }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
                    {body}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
