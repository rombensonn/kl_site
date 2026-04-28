import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import FadeIn from "./FadeIn";

const FAQS = [
  {
    q: "Что будет, если платформа не запустится?",
    a: "Если платформа не запустится в течение 60 дней с даты, указанной при бронировании, вы получите полный возврат средств. Никаких удержаний — только перевод обратно в течение 5 рабочих дней.",
  },
  {
    q: "Когда спишут деньги?",
    a: "Платёж фиксируется сразу при бронировании. Первый расчётный период начинается с даты запуска платформы — именно с этого момента отсчитываются ваши 6 месяцев по зафиксированной цене.",
  },
  {
    q: "Можно ли отменить бронирование до запуска?",
    a: "Да, до момента запуска вы можете отменить бронирование и получить полный возврат. После запуска действуют стандартные условия возврата Про-тарифа (7 дней с начала периода).",
  },
  {
    q: "Что входит в Про-тариф по ограниченному предложению?",
    a: "Всё то же, что в стандартном Про: 1 500 кредитов/месяц, 3 ИИ-персонажа, генерация фото без лимитов, генерация видео (TikTok/Reels), Управление движением, хранилище 10 ГБ, приоритетная поддержка и ранний доступ к новым функциям. Никакого урезания.",
  },
];

function FAQItem({
  q,
  a,
  isOpen,
  onToggle,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b" style={{ borderColor: "var(--dfl-border-1)" }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer"
        style={{ background: "transparent", border: "none" }}
      >
        <span
          className="font-display font-semibold text-base"
          style={{
            color: isOpen ? "var(--dfl-text-hi)" : "var(--dfl-text-mid)",
            letterSpacing: "-0.01em",
            transition: "color 200ms ease",
          }}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown
            size={16}
            style={{ color: isOpen ? "var(--dfl-accent-bright)" : "var(--dfl-text-placeholder)" }}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p className="pb-5 text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PresaleFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="section-wrapper">
      <div className="container-tight">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="section-label mb-5">Частые вопросы</div>
            <h2
              className="font-display font-black leading-none"
              style={{
                fontSize: "clamp(2.25rem, 5vw, 4rem)",
                letterSpacing: "-0.04em",
                color: "var(--dfl-text-hi)",
              }}
            >
              Остались
              <br />
              <span style={{ color: "var(--dfl-text-subtle)", fontWeight: 700 }}>вопросы?</span>
            </h2>
          </div>
        </FadeIn>

        <div
          className="max-w-2xl mx-auto border-t"
          style={{ borderColor: "var(--dfl-border-1)" }}
        >
          {FAQS.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <FAQItem
                q={faq.q}
                a={faq.a}
                isOpen={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
