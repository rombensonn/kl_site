import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    question: "Это агентство или платформа?",
    answer:
      "Это самообслуживаемая SaaS-платформа. Вы регистрируетесь, создаёте AI-инфлюенсера и генерируете контент самостоятельно — наша команда не участвует в процессе. Вы получаете инструмент, а не сервис.",
  },
  {
    question: "Подходит ли платформа для личных проектов, а не только для компаний?",
    answer:
      "Да, и это один из ключевых сценариев. Если вы ведёте личный бренд, блог или хотите создать AI-персонажа для монетизации — платформа работает так же, как для бизнеса. Нет минимального размера команды или бюджета.",
  },
  {
    question: "Можно ли использовать только один модуль?",
    answer:
      "Да. Фото, видео и motion control доступны независимо. Если нужны только AI-фотографии — платите только за них. Остальные модули подключаете по мере роста задач.",
  },
  {
    question: "Как работает motion control?",
    answer:
      "Загружаете референсное видео с нужной динамикой, выбираете своего AI-инфлюенсера — система переносит движения на персонажа. Результат: ролик с вашим персонажем, без съёмки.",
  },
  {
    question: "Зачем вступать в лист ожидания?",
    answer:
      "Бета-версия платформы запускается в ближайшее время. Ранние участники получают фиксированную цену на период беты, прямой контакт с командой и влияние на развитие продукта.",
  },
  {
    question: "Нужны ли технические навыки?",
    answer:
      "Нет. Весь процесс управляется через визуальный интерфейс с понятными настройками. Промпт-режим — опциональный, не обязательный.",
  },
];

/** Radix-compatible Accordion item using CSS grid animation */
function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--dfl-surface-1)",
        border: isOpen
          ? "1px solid var(--dfl-border-2)"
          : "1px solid var(--dfl-border-1)",
        transition: "border-color 300ms ease, background 250ms ease, box-shadow 300ms ease",
        boxShadow: isOpen ? "0 4px 24px var(--dfl-glow-blue)" : "none",
      }}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left transition-colors duration-200"
        aria-expanded={isOpen}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--dfl-accent-muted-2)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        }}
      >
        <span
          className="font-display font-semibold text-base leading-snug pr-2"
          style={{ color: "var(--dfl-text-hi)" }}
        >
          {question}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{
            background: isOpen ? "var(--dfl-accent-muted)" : "var(--dfl-surface-2)",
            border: isOpen
              ? "1px solid var(--dfl-border-2)"
              : "1px solid var(--dfl-border-1)",
          }}
        >
          <Plus
            size={16}
            style={{
              color: "var(--dfl-accent-bright)",
              transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
              transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        </div>
      </button>

      {/* Content — CSS Grid animation (Radix-style) */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 350ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <div className="glow-line !mb-4" />
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--dfl-text-lo)" }}
            >
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section id="faq" className="section-wrapper">
      <div className="glow-line" />
      <div className="container-tight">
        <div className="text-center mb-14">
          <div className="section-label mx-auto mb-5">Вопросы и ответы</div>
          <h2
            className="font-display font-bold"
            style={{
              fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
              color: "var(--dfl-text-hi)",
            }}
          >
            Часто задаваемые вопросы
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIdx === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
