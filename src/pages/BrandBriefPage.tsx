import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Zap, Sun, Moon, ArrowLeft, Save, CheckCircle2, Loader2,
  FileText, AlertCircle, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const TONE_OPTIONS = [
  { id: "official",  label: "Официальный",  desc: "Строго и профессионально" },
  { id: "friendly",  label: "Дружелюбный",  desc: "Тепло и по-человечески" },
  { id: "bold",      label: "Дерзкий",      desc: "Ярко и провокационно" },
  { id: "neutral",   label: "Нейтральный",  desc: "Сбалансированно и чётко" },
  { id: "inspiring", label: "Вдохновляющий",desc: "Мотивирующий и позитивный" },
];

interface BriefData {
  brand_name: string;
  audience: string;
  tone: string;
  values: string;
  restrictions: string;
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: "var(--dfl-text-mid)" }}>{label}</label>
      {children}
      {error && <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: "var(--dfl-error)" }}><AlertCircle size={11} />{error}</p>}
      {hint && !error && <p className="text-xs mt-1.5" style={{ color: "var(--dfl-text-placeholder)" }}>{hint}</p>}
    </div>
  );
}

export default function BrandBriefPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDark = theme === "dark";

  const [form, setForm] = useState<BriefData>({
    brand_name: "", audience: "", tone: "friendly", values: "", restrictions: "",
  });
  const [errors, setErrors] = useState<Partial<BriefData>>({});
  const [hasExisting, setHasExisting] = useState(false);

  // Fetch existing brief
  const { isLoading: briefLoading } = useQuery({
    queryKey: ["brand-brief", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("brand_briefs")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    onSuccess: (data: BriefData | null) => {
      if (data) {
        setForm({ brand_name: data.brand_name, audience: data.audience, tone: data.tone, values: data.values, restrictions: data.restrictions });
        setHasExisting(true);
      }
    },
  });

  const { mutate: saveBrief, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const payload = { ...form, user_id: user.id, updated_at: new Date().toISOString() };
      const { error } = await supabase
        .from("brand_briefs")
        .upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-brief", user?.id] });
      setHasExisting(true);
      toast.success("Бренд-бриф сохранён");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const validate = () => {
    const errs: Partial<BriefData> = {};
    if (!form.brand_name.trim()) errs.brand_name = "Введите название бренда";
    if (!form.audience.trim()) errs.audience = "Опишите целевую аудиторию";
    if (!form.values.trim()) errs.values = "Укажите ценности бренда";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) saveBrief();
  };

  const set = (key: keyof BriefData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: undefined }));
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--dfl-bg)" }}>
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 sm:px-6 border-b" style={{ height: 64, background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}>
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm" style={{ color: "var(--dfl-text-lo)" }}>
          <ArrowLeft size={15} /><span className="hidden sm:inline">Дашборд</span>
        </Link>
        <div className="w-px h-5" style={{ background: "var(--dfl-border-2)" }} />
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}><Zap size={11} className="text-white" /></div>
          <span className="font-display font-bold text-sm hidden sm:block"><span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span><span className="text-accent-gradient">Лабс</span></span>
        </Link>
        <div className="flex-1" />
        <button onClick={toggleTheme} className="theme-toggle" style={{ width: 36, height: 36 }}>{isDark ? <Sun size={14} /> : <Moon size={14} />}</button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)" }}>
              <FileText size={18} style={{ color: "#60a5fa" }} />
            </div>
            <div>
              <h1 className="font-display font-bold" style={{ fontSize: "clamp(1.3rem,3vw,1.6rem)", color: "var(--dfl-text-hi)" }}>Бренд-бриф</h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--dfl-text-subtle)" }}>AI использует бриф для генерации контента</p>
            </div>
          </div>
          {hasExisting && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <CheckCircle2 size={13} style={{ color: "#22c55e" }} />
              <p className="text-xs" style={{ color: "#4ade80" }}>Бриф сохранён · AI знает ваш бренд</p>
            </div>
          )}
        </div>

        {briefLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }} />)}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="rounded-3xl overflow-hidden" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <div className="px-6 pt-6 pb-5 border-b space-y-5" style={{ borderColor: "var(--dfl-border-1)", background: "linear-gradient(145deg,rgba(37,99,235,0.05) 0%,transparent 100%)" }}>
                <Field label="Название бренда" error={errors.brand_name} hint="Ваш бренд, продукт или компания">
                  <input type="text" value={form.brand_name} onChange={set("brand_name")} placeholder="Например: КовальЛабс, Nike, Zara..." className="input-field" disabled={isSaving} style={{ borderColor: errors.brand_name ? "var(--dfl-error)" : undefined }} />
                </Field>
                <Field label="Целевая аудитория" error={errors.audience} hint="Пол, возраст, интересы, боли, потребности">
                  <textarea value={form.audience} onChange={set("audience")} placeholder="Например: Женщины 25–40 лет, интересующиеся fashion и lifestyle. Хотят выглядеть стильно без лишних усилий..." className="input-field min-h-[90px] resize-none" disabled={isSaving} style={{ borderColor: errors.audience ? "var(--dfl-error)" : undefined }} />
                </Field>
              </div>

              <div className="px-6 py-5 border-b space-y-5" style={{ borderColor: "var(--dfl-border-1)" }}>
                <Field label="Тон коммуникации" hint="Как бренд говорит со своей аудиторией">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                    {TONE_OPTIONS.map(opt => (
                      <button key={opt.id} type="button" onClick={() => setForm(p => ({ ...p, tone: opt.id }))}
                        className="flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
                        style={{ background: form.tone === opt.id ? "var(--dfl-accent-muted)" : "var(--dfl-surface-2)", border: `1px solid ${form.tone === opt.id ? "var(--dfl-border-glow)" : "var(--dfl-border-1)"}` }}>
                        <span className="text-xs font-semibold" style={{ color: form.tone === opt.id ? "var(--dfl-accent-bright)" : "var(--dfl-text-mid)" }}>{opt.label}</span>
                        <span className="text-[10px]" style={{ color: "var(--dfl-text-placeholder)" }}>{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Ценности бренда" error={errors.values} hint="Что важно для вашего бренда — 3–5 ключевых принципа">
                  <textarea value={form.values} onChange={set("values")} placeholder="Например: Качество, устойчивость, доступность. Бренд верит в осознанное потребление и натуральные материалы..." className="input-field min-h-[90px] resize-none" disabled={isSaving} style={{ borderColor: errors.values ? "var(--dfl-error)" : undefined }} />
                </Field>

                <Field label="Запрещённые темы и ограничения" hint="Что нельзя упоминать или показывать в контенте">
                  <textarea value={form.restrictions} onChange={set("restrictions")} placeholder="Например: Не упоминать конкурентов. Избегать политических тем. Без агрессивных сцен..." className="input-field min-h-[72px] resize-none" disabled={isSaving} />
                </Field>
              </div>

              <div className="px-6 py-5 flex items-center gap-3">
                <button type="submit" disabled={isSaving} className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2" style={{ borderRadius: "0.875rem" }}>
                  {isSaving ? <><Loader2 size={14} className="animate-spin" />Сохраняем...</> : <><Save size={14} />Сохранить бриф</>}
                </button>
                <Link to="/dashboard" className="text-sm px-4 py-2.5 rounded-xl transition-colors" style={{ color: "var(--dfl-text-lo)", background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)", textDecoration: "none" }}>Отмена</Link>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
