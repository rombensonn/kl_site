import { useState } from "react";
import { ArrowRight, CheckCircle, AlertCircle, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReservationFormData {
  name: string;
  email: string;
  term: "1month" | "3months";
  consent: boolean;
  marketingConsent: boolean;
}

interface Props {
  seatsLeft: number;
  onSuccess: (data: ReservationFormData) => void;
  success: boolean;
}

const PRICE_1M = 2792;
const PRICE_3M = 8376;

const trustVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const trustItemVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function PresaleReservationForm({ seatsLeft, onSuccess, success }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [term, setTerm] = useState<"1month" | "3months">("1month");
  const [consent, setConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const price = term === "1month" ? PRICE_1M : PRICE_3M;
  const filledPercent = ((100 - seatsLeft) / 100) * 100;

  const validate = () => {
    if (!name.trim()) return "Пожалуйста, введите ваше имя";
    if (!email.trim()) return "Пожалуйста, введите электронную почту";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Введите корректный адрес электронной почты";
    if (!consent) return "Необходимо согласие на обработку данных";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    onSuccess({ name, email, term, consent, marketingConsent });
  };

  return (
    <section id="presale-form" className="section-wrapper">
      <div className="container-tight">

        {/* Heading above the card */}
        <div className="text-center mb-10">
          <div className="section-label mb-5" style={{ display: "inline-flex" }}>
            <motion.span
              className="inline-block w-2 h-2 rounded-full mr-2"
              style={{ background: "var(--dfl-accent-bright)" }}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            ЗАБРОНИРОВАТЬ МЕСТО
          </div>
          <h2
            className="font-display font-black leading-none"
            style={{
              fontSize: "clamp(2.25rem, 5vw, 4rem)",
              letterSpacing: "-0.04em",
              color: "var(--dfl-text-hi)",
            }}
          >
            Заберите Про-тариф
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 55%, #818cf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              по специальной цене.
            </span>
          </h2>
        </div>

        {/* Centered card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            maxWidth: 780,
            margin: "0 auto",
            background: "#0f1623",
            borderRadius: 24,
            borderTop: "3px solid var(--dfl-accent)",
            boxShadow: "0 0 60px var(--dfl-glow-blue)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "clamp(24px, 5vw, 48px)" }}>

            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div key="form" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                  {/* Trust strip */}
                  <motion.div
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8"
                    variants={trustVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {/* Seats */}
                    <motion.div variants={trustItemVariant} className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
                        <span style={{ color: "var(--dfl-accent-bright)", fontWeight: 700 }}>{seatsLeft}</span>
                        {" "}мест из 100
                      </span>
                      <div
                        style={{
                          width: 60,
                          height: 4,
                          borderRadius: 4,
                          background: "rgba(255,255,255,0.08)",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: `${filledPercent}%`,
                            height: "100%",
                            background: "var(--dfl-accent)",
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    </motion.div>

                    <motion.span
                      variants={trustItemVariant}
                      style={{ color: "var(--dfl-text-placeholder)" }}
                    >·</motion.span>

                    <motion.span
                      variants={trustItemVariant}
                      className="text-sm font-semibold"
                      style={{ color: "var(--dfl-text-subtle)" }}
                    >
                      −20% на старте
                    </motion.span>

                    <motion.span
                      variants={trustItemVariant}
                      style={{ color: "var(--dfl-text-placeholder)" }}
                    >·</motion.span>

                    <motion.span
                      variants={trustItemVariant}
                      className="text-sm"
                      style={{ color: "var(--dfl-text-subtle)" }}
                    >
                      Возврат за 60 дней
                    </motion.span>
                  </motion.div>

                  <form onSubmit={handleSubmit} noValidate>

                    {/* Plan selector — pure React, no Framer Motion */}
                    <div style={{ marginBottom: 20 }}>
                      <p className="text-sm font-medium mb-3" style={{ color: "var(--dfl-text-lo)" }}>
                        Срок бронирования
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {(["1month", "3months"] as const).map((t) => {
                          const selected = term === t;
                          return (
                            <div
                              key={t}
                              onClick={() => setTerm(t)}
                              style={{
                                position: "relative",
                                padding: "14px 16px",
                                borderRadius: 12,
                                border: `1.5px solid ${selected ? "var(--dfl-accent)" : "#1e2d3d"}`,
                                background: selected ? "var(--dfl-accent-muted)" : "transparent",
                                cursor: "pointer",
                                transition: "border-color 0.2s ease, background 0.2s ease",
                                userSelect: "none",
                              }}
                            >
                              {/* Orange checkmark in top-right */}
                              {selected && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    width: 18,
                                    height: 18,
                                    borderRadius: "50%",
                                    background: "var(--dfl-accent)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              )}
                              <div
                                className="font-semibold text-sm"
                                style={{ color: selected ? "var(--dfl-text-hi)" : "var(--dfl-text-lo)" }}
                              >
                                {t === "1month" ? "1 месяц" : "3 месяца"}
                              </div>
                              <div
                                className="font-bold text-base mt-0.5"
                                style={{ color: selected ? "var(--dfl-accent-bright)" : "var(--dfl-text-subtle)" }}
                              >
                                {t === "1month" ? "2 792 ₽" : "8 376 ₽"}
                              </div>
                              {t === "3months" && (
                                <div className="text-xs mt-0.5" style={{ color: "var(--dfl-success)" }}>
                                  выгоднее
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name input */}
                    <div style={{ marginBottom: 14 }}>
                      <label
                        htmlFor="form-name"
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "var(--dfl-text-lo)" }}
                      >
                        Имя <span style={{ color: "var(--dfl-error)" }}>*</span>
                      </label>
                      <input
                        id="form-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                        placeholder="Ваше имя"
                        disabled={loading}
                        style={{
                          display: "block",
                          width: "100%",
                          background: "#0d1520",
                          border: `1.5px solid ${nameFocused ? "var(--dfl-accent)" : "#1e2d3d"}`,
                          borderRadius: 12,
                          fontSize: 16,
                          padding: "14px 16px",
                          color: "var(--dfl-text-hi)",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Email input */}
                    <div style={{ marginBottom: 14 }}>
                      <label
                        htmlFor="form-email"
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "var(--dfl-text-lo)" }}
                      >
                        Электронная почта <span style={{ color: "var(--dfl-error)" }}>*</span>
                      </label>
                      <input
                        id="form-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        placeholder="mail@example.ru"
                        disabled={loading}
                        style={{
                          display: "block",
                          width: "100%",
                          background: "#0d1520",
                          border: `1.5px solid ${emailFocused ? "var(--dfl-accent)" : "#1e2d3d"}`,
                          borderRadius: 12,
                          fontSize: 16,
                          padding: "14px 16px",
                          color: "var(--dfl-text-hi)",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    {/* Payment method row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid #1e2d3d",
                        marginBottom: 20,
                      }}
                    >
                      <CreditCard size={15} style={{ color: "var(--dfl-text-subtle)", flexShrink: 0 }} />
                      <span className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
                        Оплата через ЮКассу · Карты РФ, СБП, ЮMoney
                      </span>
                    </div>

                    {/* Checkbox 1 */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                      <div
                        onClick={() => !loading && setConsent(!consent)}
                        style={{
                          flexShrink: 0,
                          marginTop: 2,
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          border: consent ? "1.5px solid var(--dfl-accent-hover)" : "1.5px solid var(--dfl-border-2)",
                          background: consent ? "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))" : "var(--dfl-surface-1)",
                          boxShadow: consent ? "0 0 8px var(--dfl-glow-blue)" : "none",
                          cursor: loading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                        }}
                      >
                        {consent && (
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "var(--dfl-text-subtle)", lineHeight: 1.55 }}>
                        <span style={{ color: "var(--dfl-error)", marginRight: 2 }}>*</span>
                        Я даю согласие на обработку моих персональных данных в соответствии с{" "}
                        <a
                          href="/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--dfl-accent-bright)", textDecoration: "underline", textUnderlineOffset: 2 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Политикой конфиденциальности
                        </a>{" "}
                        и подтверждаю, что ознакомлен(а) с условиями{" "}
                        <a
                          href="/public-offer"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--dfl-accent-bright)", textDecoration: "underline", textUnderlineOffset: 2 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Публичной оферты
                        </a>
                        , акцептую их в полном объёме.
                      </span>
                    </div>

                    {/* Checkbox 2 */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
                      <div
                        onClick={() => !loading && setMarketingConsent(!marketingConsent)}
                        style={{
                          flexShrink: 0,
                          marginTop: 2,
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          border: marketingConsent ? "1.5px solid var(--dfl-accent-hover)" : "1.5px solid var(--dfl-border-2)",
                          background: marketingConsent ? "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))" : "var(--dfl-surface-1)",
                          boxShadow: marketingConsent ? "0 0 8px var(--dfl-glow-blue)" : "none",
                          cursor: loading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                        }}
                      >
                        {marketingConsent && (
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "var(--dfl-text-subtle)", lineHeight: 1.55 }}>
                        Я даю согласие на получение информационных и рекламных сообщений от ООО «КовальЛабс» на указанный адрес электронной почты. Согласие может быть отозвано в любой момент.
                      </span>
                    </div>

                    {/* Error */}
                    {error && (
                      <div
                        className="flex items-center gap-2 text-sm mb-4"
                        style={{ color: "var(--dfl-error)" }}
                      >
                        <AlertCircle size={14} />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* CTA button */}
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        width: "100%",
                        height: 60,
                        borderRadius: 14,
                        background: loading
                          ? "rgba(37,99,235,0.5)"
                          : "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))",
                        border: "1px solid rgba(37,99,235,0.5)",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "1rem",
                        letterSpacing: "-0.01em",
                        cursor: loading ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                        transition: "opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease",
                        boxShadow: "0 0 0 1px rgba(37,99,235,0.5), 0 4px 24px rgba(37,99,235,0.25)",
                        marginBottom: 12,
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          (e.currentTarget as HTMLButtonElement).style.opacity = "0.92";
                          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.01)";
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 1px rgba(59,130,246,0.7), 0 4px 32px rgba(59,130,246,0.35)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 1px rgba(37,99,235,0.5), 0 4px 24px rgba(37,99,235,0.25)";
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Перенаправляем на оплату...
                        </>
                      ) : (
                        <>
                          Оплатить и забронировать — {price.toLocaleString("ru-RU")}&nbsp;₽
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    {/* Below button text */}
                    <p className="text-xs text-center" style={{ color: "var(--dfl-text-placeholder)", marginBottom: 24 }}>
                      Деньги хранятся до запуска · Полный возврат при отмене до старта.
                    </p>

                    {/* Divider */}
                    <div style={{ height: 1, background: "#1e2d3d", marginBottom: 20 }} />

                    {/* Guarantee strip */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <ShieldCheck size={20} style={{ color: "#22c55e", flexShrink: 0 }} />
                      <div>
                        <span className="text-xs font-semibold" style={{ color: "#22c55e" }}>
                          Гарантия запуска&nbsp;
                        </span>
                        <span className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>
                          Если КовальЛабс не запустится в течение 60 дней — вернём 100% суммы без вопросов.
                        </span>
                      </div>
                    </div>

                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="py-10 text-center"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.3)",
                    }}
                  >
                    <CheckCircle size={32} style={{ color: "var(--dfl-success)" }} />
                  </div>
                  <h3
                    className="font-display font-bold text-xl mb-2"
                    style={{ color: "var(--dfl-text-hi)", letterSpacing: "-0.02em" }}
                  >
                    Место забронировано!
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--dfl-text-lo)" }}>
                    Письмо с подтверждением отправлено на{" "}
                    <span style={{ color: "var(--dfl-accent-bright)" }}>{email}</span>.
                    <br />
                    Мы сообщим вам о дате запуска первыми.
                  </p>
                  <div
                    className="rounded-xl px-4 py-3 text-xs"
                    style={{
                      background: "rgba(34,197,94,0.08)",
                      border: "1px solid rgba(34,197,94,0.2)",
                      color: "var(--dfl-text-lo)",
                    }}
                  >
                    Ваша цена 2&nbsp;792&nbsp;₽/мес зафиксирована на 6 месяцев после запуска.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

