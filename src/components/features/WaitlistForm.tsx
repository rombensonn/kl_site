import { useState } from "react";
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useWaitlistForm } from "@/hooks/useWaitlistForm";
import type { WaitlistFormData } from "@/types";

interface WaitlistFormProps {
  variant?: "hero" | "full";
}

const MarketingConsentCheckbox = ({
  id,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) => (
  <div className="flex items-start gap-2.5">
    <div className="relative flex-shrink-0 mt-0.5">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        disabled={disabled}
      />
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer"
        style={{
          background: checked
            ? "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))"
            : "var(--dfl-surface-1)",
          border: checked
            ? "1.5px solid var(--dfl-accent-hover)"
            : "1.5px solid var(--dfl-border-2)",
          boxShadow: checked ? "0 0 8px var(--dfl-glow-blue)" : "none",
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
    <label
      htmlFor={id}
      className="cursor-pointer leading-relaxed select-none"
      style={{
        fontSize: "0.72rem",
        color: "var(--dfl-text-subtle)",
        lineHeight: 1.5,
      }}
    >
      <span style={{ color: "var(--dfl-error)", marginRight: 2 }}>*</span>
      Я согласен(на) на получение информационных и рекламных сообщений о платформе КовальЛабс
      на указанный email-адрес в соответствии с ч.&nbsp;1 ст.&nbsp;18 ФЗ «О рекламе».
      Согласие можно отозвать в любой момент, нажав «Отписаться» в письме.
    </label>
  </div>
);

const ConsentCheckbox = ({
  id,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) => (
  <div className="flex items-start gap-2.5">
    <div className="relative flex-shrink-0 mt-0.5">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
        disabled={disabled}
      />
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer"
        style={{
          background: checked
            ? "linear-gradient(135deg, var(--dfl-accent), var(--dfl-accent-hover))"
            : "var(--dfl-surface-1)",
          border: checked
            ? "1.5px solid var(--dfl-accent-hover)"
            : "1.5px solid var(--dfl-border-2)",
          boxShadow: checked ? "0 0 8px var(--dfl-glow-blue)" : "none",
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
    <label
      htmlFor={id}
      className="cursor-pointer leading-relaxed select-none"
      style={{
        fontSize: "0.72rem",
        color: "var(--dfl-text-subtle)",
        lineHeight: 1.5,
      }}
    >
      <span style={{ color: "var(--dfl-error)", marginRight: 2 }}>*</span>
      Нажимая кнопку, я подтверждаю, что ознакомлен(а) и согласен(на) с{" "}
      <a
        href="/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors duration-150 underline underline-offset-2"
        style={{ color: "var(--dfl-accent-bright)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--dfl-text-mid)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--dfl-accent-bright)")}
        onClick={(e) => e.stopPropagation()}
      >
        Политикой обработки персональных данных
      </a>{" "}
      и даю своё{" "}
      <a
        href="/consent"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors duration-150 underline underline-offset-2"
        style={{ color: "var(--dfl-accent-bright)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--dfl-text-mid)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--dfl-accent-bright)")}
        onClick={(e) => e.stopPropagation()}
      >
        согласие на обработку моих персональных данных
      </a>
    </label>
  </div>
);

export default function WaitlistForm({ variant = "hero" }: WaitlistFormProps) {
  const { status, error, submitForm } = useWaitlistForm();

  const [email, setEmail] = useState("");
  const [represents, setRepresents] = useState("");
  const [useCase, setUseCase] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email) { setValidationError("Пожалуйста, введите ваш email"); return; }
    if (!validateEmail(email)) { setValidationError("Пожалуйста, введите корректный email"); return; }
    if (!consent) { setValidationError("Необходимо дать согласие на обработку данных"); return; }
    if (!marketingConsent) { setValidationError("Необходимо согласие на получение информационных сообщений"); return; }

    const data: WaitlistFormData = {
      email,
      consent,
      marketingConsent,
      source: variant === "hero" ? "waitlist-hero" : "waitlist-full",
    };
    if (represents) data.represents = represents;
    if (useCase) data.useCase = useCase;
    await submitForm(data);
  };

  if (status === "success") {
    return (
      <div className="glass-card rounded-2xl p-6 lg:p-8 text-center">
        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: "var(--dfl-success-muted)",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <CheckCircle style={{ color: "var(--dfl-success)" }} size={28} />
          </div>
        </div>
        <h3 className="font-display text-xl font-bold mb-2" style={{ color: "var(--dfl-text-hi)" }}>
          Вы в листе ожидания
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
          Спасибо! Уведомим вас одними из первых, когда бета-версия запустится.
        </p>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="input-field flex-1"
            disabled={status === "loading"}
          />
          <button type="submit" disabled={status === "loading"} className="btn-primary whitespace-nowrap">
            {status === "loading" ? (
              <><Loader2 size={16} className="animate-spin" />Отправка...</>
            ) : (
              <>Получить доступ<ArrowRight size={16} /></>
            )}
          </button>
        </div>

        {(validationError || error) && (
          <div className="flex items-center gap-2 mt-3 text-sm" style={{ color: "var(--dfl-error)" }}>
            <AlertCircle size={14} />
            <span>{validationError || error}</span>
          </div>
        )}

        <div className="mt-3 space-y-2.5">
          <ConsentCheckbox
            id="consent-hero"
            checked={consent}
            onChange={setConsent}
            disabled={status === "loading"}
          />
          <MarketingConsentCheckbox
            id="marketing-consent-hero"
            checked={marketingConsent}
            onChange={setMarketingConsent}
            disabled={status === "loading"}
          />
        </div>

        <p className="mt-3 text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
          Оставьте заявку — получите ранний доступ и фиксированные условия на период запуска бета-версии.
        </p>
      </form>
    );
  }

  // Full variant
  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-lo)" }}>
          Email <span style={{ color: "var(--dfl-error)" }}>*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="input-field"
          disabled={status === "loading"}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-lo)" }}>
          Кого вы представляете?{" "}
          <span className="text-xs font-normal" style={{ color: "var(--dfl-text-placeholder)" }}>
            (необязательно)
          </span>
        </label>
        <select
          value={represents}
          onChange={(e) => setRepresents(e.target.value)}
          className="input-field appearance-none cursor-pointer"
          disabled={status === "loading"}
        >
          <option value="">Выберите вариант</option>
          <option value="brand">Бренд</option>
          <option value="agency">Агентство</option>
          <option value="personal">Личный проект / креатор</option>
          <option value="other">Другое</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-lo)" }}>
          Для каких задач хотите использовать AI-инфлюенсера?{" "}
          <span className="text-xs font-normal" style={{ color: "var(--dfl-text-placeholder)" }}>
            (необязательно)
          </span>
        </label>
        <textarea
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          placeholder="Например: реклама в соцсетях, e-commerce карточки, motion-видео..."
          className="input-field resize-none"
          rows={3}
          disabled={status === "loading"}
        />
      </div>

      <ConsentCheckbox
        id="consent-full"
        checked={consent}
        onChange={setConsent}
        disabled={status === "loading"}
      />
      <MarketingConsentCheckbox
        id="marketing-consent-full"
        checked={marketingConsent}
        onChange={setMarketingConsent}
        disabled={status === "loading"}
      />

      {(validationError || error) && (
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--dfl-error)" }}>
          <AlertCircle size={14} />
          <span>{validationError || error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full py-3.5 text-base"
      >
        {status === "loading" ? (
          <><Loader2 size={18} className="animate-spin" />Отправка заявки...</>
        ) : (
          <>Вступить в лист ожидания<ArrowRight size={18} /></>
        )}
      </button>

      <p className="text-xs text-center" style={{ color: "var(--dfl-text-placeholder)" }}>
        Мы не передаём ваши данные третьим лицам. Только важные обновления о запуске.
      </p>
    </form>
  );
}
