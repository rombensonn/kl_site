import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "./FadeIn";
import SeatCounter from "./SeatCounter";
import CountdownTimer from "./CountdownTimer";

interface PresaleHeroProps {
  seatsLeft: number;
  onCTAClick: () => void;
  targetDate: Date;
}

export default function PresaleHero({ seatsLeft, onCTAClick, targetDate }: PresaleHeroProps) {
  return (
    <section
      className="relative flex flex-col justify-center overflow-hidden"
      style={{
        minHeight: "100svh",
        paddingTop: "clamp(8rem, 14vw, 12rem)",
        paddingBottom: "clamp(5rem, 8vw, 8rem)",
      }}
    >
      {/* Faint watermark */}
      <div
        aria-hidden
        className="absolute pointer-events-none select-none font-display font-black"
        style={{
          fontSize: "clamp(10rem, 32vw, 28rem)",
          right: "-3%",
          top: "50%",
          transform: "translateY(-52%)",
          color: "var(--dfl-accent)",
          opacity: 0.028,
          lineHeight: 1,
          letterSpacing: "-0.05em",
        }}
      >
        −20%
      </div>

      {/* Top glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "60%",
          height: "45%",
          background: "radial-gradient(ellipse at top, rgba(37,99,235,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="container-tight relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0 }}
          className="flex justify-center mb-10"
        >
          <div className="section-label">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--dfl-accent-bright)" }}
            />
            ОГРАНИЧЕННОЕ ПРЕДЛОЖЕНИЕ
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
        >
          <h1
            className="font-display font-black text-center leading-none mb-7"
            style={{
              fontSize: "clamp(3rem, 8.5vw, 7.5rem)",
              letterSpacing: "-0.04em",
              color: "var(--dfl-text-hi)",
            }}
          >
            Зафиксируйте
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 55%, #818cf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Про-тариф
            </span>
            <br />
            на 6 месяцев.
          </h1>
        </motion.div>

        {/* Price row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          className="text-center mb-5"
        >
          <div className="flex items-center justify-center gap-3 flex-wrap mb-2.5">
            <span
              className="font-display font-bold line-through"
              style={{
                fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)",
                color: "var(--dfl-text-subtle)",
              }}
            >
              3&nbsp;490&nbsp;₽/мес
            </span>
            <span style={{ color: "var(--dfl-text-placeholder)" }}>→</span>
            <span
              className="font-display font-black"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
                color: "var(--dfl-text-hi)",
                letterSpacing: "-0.03em",
              }}
            >
              2&nbsp;792&nbsp;₽/мес
            </span>
            <span
              className="px-3 py-1 rounded-full text-sm font-bold"
              style={{
                background: "var(--dfl-accent-muted)",
                border: "1px solid var(--dfl-border-2)",
                color: "var(--dfl-accent-bright)",
              }}
            >
              −20%
            </span>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
          className="text-center mb-9"
        >
          <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
            Платформа скоро запустится · стоимость тарифа зафиксируется на 6 месяцев после официального запуска платформы
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
          className="flex justify-center mb-6"
        >
          <motion.button
            onClick={onCTAClick}
            className="inline-flex items-center gap-3 font-bold text-white rounded-2xl cursor-pointer"
            style={{
              background: "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))",
              padding: "15px 36px",
              fontSize: "1rem",
              border: "1px solid rgba(37,99,235,0.5)",
              letterSpacing: "-0.01em",
              boxShadow: "var(--shadow-button)",
            }}
            animate={{
              boxShadow: [
                "0 0 0 1px rgba(37,99,235,0.5), 0 4px 24px rgba(37,99,235,0.25)",
                "0 0 0 1px rgba(59,130,246,0.7), 0 4px 32px rgba(59,130,246,0.35)",
                "0 0 0 1px rgba(37,99,235,0.5), 0 4px 24px rgba(37,99,235,0.25)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 0 1px rgba(59,130,246,0.7), 0 6px 40px rgba(59,130,246,0.4)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            Забронировать место
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
          className="flex items-center justify-center gap-2 text-xs flex-wrap mb-9"
          style={{ color: "var(--dfl-text-subtle)" }}
        >
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--dfl-success)" }}
            />
            53 человека уже забронировали места
          </span>
          <span style={{ color: "var(--dfl-text-placeholder)" }}>·</span>
          <span>Безопасная оплата</span>
          <span style={{ color: "var(--dfl-text-placeholder)" }}>·</span>
          <span>Возврат в течение 7 дней</span>
        </motion.div>

        {/* Seat counter */}
        <FadeIn delay={0.26}>
          <div className="flex justify-center mb-12">
            <SeatCounter seatsLeft={seatsLeft} />
          </div>
        </FadeIn>

        {/* Countdown divider */}
        <FadeIn delay={0.30}>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px" style={{ background: "var(--dfl-border-1)" }} />
            <span
              className="text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: "var(--dfl-text-placeholder)" }}
            >
              До окончания предложения
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--dfl-border-1)" }} />
          </div>
        </FadeIn>

        {/* Countdown */}
        <FadeIn delay={0.34}>
          <CountdownTimer targetDate={targetDate} label="" />
        </FadeIn>
      </div>
    </section>
  );
}
