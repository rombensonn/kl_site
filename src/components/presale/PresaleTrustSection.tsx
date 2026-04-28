import { Shield, Lock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "./FadeIn";

const TRUST_ITEMS = [
  {
    num: "01",
    Icon: Shield,
    title: "Безопасный возврат",
    body: "Если платформа не запустится в течение 60 дней с указанной даты — вы получите полный возврат средств без вопросов и удержаний.",
    accent: "#22c55e",
    accentBg: "rgba(34,197,94,0.08)",
    accentBorder: "rgba(34,197,94,0.2)",
  },
  {
    num: "02",
    Icon: Lock,
    title: "Цена заморожена",
    body: "Ваши 2 792 ₽/мес не вырастут в первые 6 месяцев после запуска, даже если Про-тариф подорожает для новых пользователей.",
    accent: "var(--dfl-accent-bright)",
    accentBg: "var(--dfl-accent-muted)",
    accentBorder: "var(--dfl-border-2)",
  },
  {
    num: "03",
    Icon: Zap,
    title: "Приоритетный доступ",
    body: "Участники ограниченного предложения получают доступ к платформе раньше всех остальных и могут напрямую влиять на план развития продукта.",
    accent: "var(--dfl-accent-bright)",
    accentBg: "var(--dfl-accent-muted)",
    accentBorder: "var(--dfl-border-2)",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function PresaleTrustSection() {
  return (
    <section className="section-wrapper">
      <div className="container-tight">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="section-label mb-5">Почему сейчас</div>
            <h2
              className="font-display font-black leading-none"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 4rem)",
                letterSpacing: "-0.04em",
                color: "var(--dfl-text-hi)",
              }}
            >
              Зачем платить
              <br />
              <span style={{ color: "var(--dfl-text-subtle)", fontWeight: 700 }}>до запуска?</span>
            </h2>
          </div>
        </FadeIn>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {TRUST_ITEMS.map(({ num, Icon, title, body, accent, accentBg, accentBorder }) => (
            <motion.div
              key={num}
              variants={cardVariant}
              className="rounded-3xl p-7 relative overflow-hidden cursor-default"
              style={{
                background: "var(--dfl-surface-1)",
                border: "1px solid var(--dfl-border-1)",
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                transition: { duration: 0.2 },
              }}
            >
              {/* Large number watermark */}
              <div
                aria-hidden
                className="absolute -top-3 -right-2 font-display font-black leading-none pointer-events-none select-none"
                style={{
                  fontSize: "6.5rem",
                  color: accent,
                  opacity: 0.07,
                  letterSpacing: "-0.05em",
                }}
              >
                {num}
              </div>

              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 relative z-10"
                style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
              >
                <Icon size={18} style={{ color: accent }} />
              </div>

              <div
                className="text-xs font-bold uppercase tracking-widest mb-2 relative z-10"
                style={{ color: accent }}
              >
                {num}
              </div>

              <h3
                className="font-display font-bold text-lg mb-3 relative z-10"
                style={{ color: "var(--dfl-text-hi)", letterSpacing: "-0.02em" }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed relative z-10" style={{ color: "var(--dfl-text-lo)" }}>
                {body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
