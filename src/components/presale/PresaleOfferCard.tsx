import { Check, Zap, Lock } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "./FadeIn";

const FEATURES = [
  { text: "1 500 кредитов / месяц", highlight: true },
  { text: "3 ИИ-персонажа", highlight: false },
  { text: "Генерация фото (без лимитов)", highlight: false },
  { text: "Генерация видео (TikTok / Reels)", highlight: true },
  { text: "Управление движением", highlight: true },
  { text: "Хранилище 10 ГБ", highlight: false },
  { text: "Приоритетная поддержка", highlight: false },
  { text: "Ранний доступ к новым функциям", highlight: true },
];

const featureVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut", delay: i * 0.05 },
  }),
};

const checkVariants = {
  hidden: { scale: 0 },
  visible: (i: number) => ({
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, delay: i * 0.05 + 0.1 },
  }),
};

export default function PresaleOfferCard() {
  return (
    <section className="section-wrapper">
      <div className="container-tight">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="section-label mb-5">Что вы получаете</div>
            <h2
              className="font-display font-black leading-none"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 4rem)",
                letterSpacing: "-0.04em",
                color: "var(--dfl-text-hi)",
              }}
            >
              Полный Про-тариф.
              <br />
              <span style={{ color: "var(--dfl-text-subtle)", fontWeight: 700 }}>
                Никаких урезаний.
              </span>
            </h2>
            <p className="mt-4 mx-auto max-w-lg text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
              Тот же Про, что будет стоить 3&nbsp;490&nbsp;₽ после запуска —
              зафиксированный для вас на 6 месяцев.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* Feature list */}
          <FadeIn direction="left" delay={0.05} className="lg:col-span-3">
            <div
              className="rounded-3xl p-8 h-full"
              style={{
                background: "var(--dfl-surface-1)",
                border: "1px solid var(--dfl-border-1)",
              }}
            >
              <p
                className="text-xs uppercase tracking-widest font-semibold mb-5"
                style={{ color: "var(--dfl-text-subtle)" }}
              >
                Включено в тариф
              </p>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                {FEATURES.map(({ text, highlight }, i) => (
                  <motion.div
                    key={text}
                    custom={i}
                    variants={featureVariants}
                    className="flex items-center gap-3 py-2.5 border-b last:border-b-0 sm:last:border-b-0"
                    style={{ borderColor: "var(--dfl-border-1)" }}
                  >
                    <motion.div
                      custom={i}
                      variants={checkVariants}
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: highlight ? "var(--dfl-accent-muted)" : "rgba(34,197,94,0.1)",
                        border: highlight
                          ? "1px solid var(--dfl-border-2)"
                          : "1px solid rgba(34,197,94,0.25)",
                      }}
                    >
                      <Check
                        size={10}
                        strokeWidth={3}
                        style={{ color: highlight ? "var(--dfl-accent-bright)" : "var(--dfl-success)" }}
                      />
                    </motion.div>
                    <span
                      className="text-sm"
                      style={{
                        color: highlight ? "var(--dfl-text-mid)" : "var(--dfl-text-lo)",
                        fontWeight: highlight ? 500 : 400,
                      }}
                    >
                      {text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </FadeIn>

          {/* Pricing card */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            <div
              className="rounded-3xl p-8 relative overflow-hidden"
              style={{
                background: "var(--dfl-surface-2)",
                border: "1px solid var(--dfl-border-2)",
                boxShadow: "0 0 40px var(--dfl-glow-blue)",
              }}
            >
              {/* Blue top accent bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: "linear-gradient(90deg, var(--dfl-accent), var(--dfl-accent-bright))" }}
              />

              <div className="flex items-center gap-2 mb-6">
                <Zap size={13} style={{ color: "var(--dfl-accent-bright)" }} />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "var(--dfl-accent-bright)" }}
                >
                  Ограниченное предложение · −20%
                </span>
              </div>

              <div className="mb-1">
                <span
                  className="font-display font-black block leading-none"
                  style={{
                    fontSize: "clamp(2rem, 5vw, 2.75rem)",
                    color: "var(--dfl-text-hi)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  2&nbsp;792&nbsp;₽
                </span>
                <span className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>в месяц</span>
              </div>

              <div className="mb-7">
                <span
                  className="font-display font-semibold text-lg line-through"
                  style={{ color: "var(--dfl-text-placeholder)" }}
                >
                  3&nbsp;490&nbsp;₽/мес
                </span>
              </div>

              {/* Lock strip */}
              <div
                className="flex items-start gap-2.5 rounded-2xl p-4 mb-7"
                style={{
                  background: "var(--dfl-accent-muted-2)",
                  border: "1px solid var(--dfl-border-2)",
                }}
              >
                <Lock size={13} style={{ color: "var(--dfl-accent-bright)", flexShrink: 0, marginTop: 1 }} />
                <span className="text-xs leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
                  Цена заморожена на 6 месяцев после запуска — даже если тариф подорожает.
                </span>
              </div>

              <motion.button
                onClick={() =>
                  document.getElementById("presale-form")?.scrollIntoView({ behavior: "smooth" })
                }
                className="btn-primary w-full"
                style={{ padding: "13px", fontSize: "0.9rem", borderRadius: "1rem" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Забронировать место
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
