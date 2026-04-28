import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Sun, Moon, ArrowLeft, User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// ── Emoji picker data ─────────────────────────────────────────────────────────
const EMOJI_GROUPS = [
  {
    label: "Персонажи",
    emojis: ["👤", "👩", "👨", "🧑", "👸", "🤴", "🧑‍💼", "👩‍💼", "👨‍💼", "🧑‍🎨", "👩‍🎨", "👨‍🎨"],
  },
  {
    label: "Стиль",
    emojis: ["🦸", "🦸‍♀️", "🦸‍♂️", "🌟", "💫", "✨", "🔥", "💎", "👑", "🎭", "🎬", "🎤"],
  },
  {
    label: "Тематика",
    emojis: ["📸", "🎯", "🚀", "💡", "🌈", "🎨", "🌸", "🌺", "⚡", "🏆", "🎪", "🤖"],
  },
];

// ── Emoji Picker ──────────────────────────────────────────────────────────────
interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div className="space-y-4">
      {EMOJI_GROUPS.map((group) => (
        <div key={group.label}>
          <p
            className="text-[9px] uppercase tracking-widest font-semibold mb-2"
            style={{ color: "var(--dfl-text-placeholder)" }}
          >
            {group.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onChange(emoji)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-150"
                style={{
                  background:
                    value === emoji
                      ? "var(--dfl-accent-muted)"
                      : "var(--dfl-surface-2)",
                  border: `1px solid ${value === emoji ? "var(--dfl-border-glow)" : "var(--dfl-border-1)"}`,
                  transform: value === emoji ? "scale(1.12)" : "scale(1)",
                  boxShadow:
                    value === emoji
                      ? "0 0 0 2px var(--dfl-accent-muted)"
                      : "none",
                }}
                onMouseEnter={(e) => {
                  if (value !== emoji) {
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--dfl-surface-3)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "scale(1.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== emoji) {
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--dfl-surface-2)";
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                  }
                }}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Status Toggle ─────────────────────────────────────────────────────────────
interface StatusToggleProps {
  value: "active" | "paused";
  onChange: (v: "active" | "paused") => void;
}

function StatusToggle({ value, onChange }: StatusToggleProps) {
  const options: { id: "active" | "paused"; label: string; color: string; bg: string; border: string }[] = [
    {
      id: "active",
      label: "Активный",
      color: "#4ade80",
      bg: "rgba(34,197,94,0.1)",
      border: "rgba(34,197,94,0.3)",
    },
    {
      id: "paused",
      label: "На паузе",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.3)",
    },
  ];

  return (
    <div
      className="flex gap-2 p-1 rounded-2xl"
      style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: value === opt.id ? opt.bg : "transparent",
            border: `1px solid ${value === opt.id ? opt.border : "transparent"}`,
            color: value === opt.id ? opt.color : "var(--dfl-text-subtle)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: value === opt.id ? opt.color : "var(--dfl-text-placeholder)" }}
          />
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: "var(--dfl-text-mid)" }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          className="text-xs mt-1.5 flex items-center gap-1"
          style={{ color: "var(--dfl-error)" }}
        >
          <AlertCircle size={11} />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs mt-1.5" style={{ color: "var(--dfl-text-placeholder)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
interface FormErrors {
  character_name?: string;
  campaign_name?: string;
  general?: string;
}

export default function CharacterNewPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [characterName, setCharacterName] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [emoji, setEmoji] = useState("👤");
  const [status, setStatus] = useState<"active" | "paused">("active");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!characterName.trim()) errs.character_name = "Введите имя персонажа";
    else if (characterName.trim().length < 2) errs.character_name = "Минимум 2 символа";
    else if (characterName.trim().length > 80) errs.character_name = "Максимум 80 символов";
    if (!campaignName.trim()) errs.campaign_name = "Введите название кампании";
    else if (campaignName.trim().length < 2) errs.campaign_name = "Минимум 2 символа";
    else if (campaignName.trim().length > 120) errs.campaign_name = "Максимум 120 символов";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user?.id) return;

    setIsLoading(true);
    setErrors({});

    const { error } = await supabase.from("user_projects").insert({
      user_id: user.id,
      character_name: characterName.trim(),
      campaign_name: campaignName.trim(),
      emoji,
      status,
      generations_count: 0,
    });

    if (error) {
      setErrors({ general: error.message });
      setIsLoading(false);
      return;
    }

    toast.success(`Персонаж «${characterName.trim()}» успешно создан!`);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--dfl-bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center gap-4 px-4 sm:px-6 border-b"
        style={{
          height: 64,
          background: "var(--dfl-surface-1)",
          borderColor: "var(--dfl-border-1)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-sm transition-colors duration-150"
          style={{ color: "var(--dfl-text-lo)" }}
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Дашборд</span>
        </Link>

        <div
          className="w-px h-5 flex-shrink-0"
          style={{ background: "var(--dfl-border-2)" }}
        />

        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
          >
            <Zap size={11} className="text-white" />
          </div>
          <span
            className="font-display font-bold text-sm hidden sm:block"
            style={{ letterSpacing: "-0.02em" }}
          >
            <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
            <span className="text-accent-gradient">Лабс</span>
          </span>
        </Link>

        <div className="flex-1" />

        <button
          onClick={toggleTheme}
          className="theme-toggle"
          style={{ width: 36, height: 36 }}
          aria-label="Переключить тему"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        {/* Page title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <User size={18} style={{ color: "#818cf8" }} />
            </div>
            <div>
              <h1
                className="font-display font-bold leading-tight"
                style={{
                  fontSize: "clamp(1.3rem, 3vw, 1.6rem)",
                  color: "var(--dfl-text-hi)",
                }}
              >
                Новый персонаж
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--dfl-text-subtle)" }}>
                Настройте AI-инфлюенсера под ваш бренд
              </p>
            </div>
          </div>

          {/* Info banner */}
          <div
            className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
            style={{
              background: "rgba(37,99,235,0.06)",
              border: "1px solid rgba(37,99,235,0.2)",
            }}
          >
            <Zap size={14} style={{ color: "#60a5fa", flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--dfl-text-lo)" }}>
              Создание персонажа — первый шаг. Имя и кампания задают контекст для всех генераций. Их можно изменить позже в настройках проекта.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "var(--dfl-surface-1)",
            border: "1px solid var(--dfl-border-2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          {/* Card header */}
          <div
            className="px-6 pt-6 pb-5 border-b"
            style={{
              borderColor: "var(--dfl-border-1)",
              background:
                "linear-gradient(145deg, rgba(37,99,235,0.05) 0%, transparent 100%)",
            }}
          >
            {/* Preview */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-all duration-200"
                style={{
                  background: "var(--dfl-surface-2)",
                  border: "1px solid var(--dfl-border-2)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                }}
              >
                {emoji}
              </div>
              <div className="min-w-0">
                <p
                  className="font-display font-bold text-lg leading-tight truncate"
                  style={{ color: "var(--dfl-text-hi)" }}
                >
                  {characterName || "Имя персонажа"}
                </p>
                <p
                  className="text-sm mt-0.5 truncate"
                  style={{ color: "var(--dfl-text-subtle)" }}
                >
                  {campaignName || "Название кампании"}
                </p>
                <span
                  className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      status === "active"
                        ? "rgba(34,197,94,0.12)"
                        : "rgba(245,158,11,0.12)",
                    border: `1px solid ${status === "active" ? "rgba(34,197,94,0.28)" : "rgba(245,158,11,0.28)"}`,
                    color: status === "active" ? "#4ade80" : "#fbbf24",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: status === "active" ? "#4ade80" : "#fbbf24",
                    }}
                  />
                  {status === "active" ? "Активный" : "На паузе"}
                </span>
              </div>
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* General error */}
            {errors.general && (
              <div
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "var(--dfl-error-muted)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "var(--dfl-error)",
                }}
              >
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Character name */}
            <Field
              label="Имя персонажа"
              hint={`${characterName.length}/80 символов`}
              error={errors.character_name}
            >
              <input
                type="text"
                value={characterName}
                onChange={(e) => {
                  setCharacterName(e.target.value);
                  setErrors((p) => ({ ...p, character_name: undefined }));
                }}
                placeholder="Например: Nova, Alex, Aria..."
                className="input-field"
                disabled={isLoading}
                maxLength={80}
                style={{
                  borderColor: errors.character_name
                    ? "var(--dfl-error)"
                    : undefined,
                }}
              />
            </Field>

            {/* Campaign name */}
            <Field
              label="Название кампании"
              hint="Бренд, продукт или цель контента"
              error={errors.campaign_name}
            >
              <input
                type="text"
                value={campaignName}
                onChange={(e) => {
                  setCampaignName(e.target.value);
                  setErrors((p) => ({ ...p, campaign_name: undefined }));
                }}
                placeholder="Например: Fashion Spring 2025, TikTok Shop..."
                className="input-field"
                disabled={isLoading}
                maxLength={120}
                style={{
                  borderColor: errors.campaign_name
                    ? "var(--dfl-error)"
                    : undefined,
                }}
              />
            </Field>

            {/* Emoji picker */}
            <Field label="Аватар-эмодзи" hint="Выберите иконку для вашего персонажа">
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "var(--dfl-surface-2)",
                  border: "1px solid var(--dfl-border-1)",
                }}
              >
                <EmojiPicker value={emoji} onChange={setEmoji} />
              </div>
            </Field>

            {/* Status */}
            <Field
              label="Статус проекта"
              hint={
                status === "active"
                  ? "Персонаж активен и доступен для генераций"
                  : "Персонаж на паузе — генерации временно отключены"
              }
            >
              <StatusToggle value={status} onChange={setStatus} />
            </Field>

            {/* Divider */}
            <div
              className="h-px w-full"
              style={{ background: "var(--dfl-border-1)" }}
            />

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex-shrink-0 text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: "var(--dfl-surface-2)",
                  border: "1px solid var(--dfl-border-1)",
                  color: "var(--dfl-text-lo)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--dfl-surface-3)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--dfl-text-hi)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--dfl-surface-2)";
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--dfl-text-lo)";
                }}
              >
                Отмена
              </Link>

              <button
                type="submit"
                disabled={isLoading || !characterName.trim() || !campaignName.trim()}
                className="flex-1 btn-primary text-sm py-3 flex items-center justify-center gap-2"
                style={{ borderRadius: "0.875rem" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Создаём персонажа...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Создать персонажа
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom hint */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: "var(--dfl-text-placeholder)" }}
        >
          После создания персонажа вы сразу сможете запустить первую генерацию
        </p>
      </main>
    </div>
  );
}
