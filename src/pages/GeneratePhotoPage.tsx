import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Zap, Sun, Moon, ArrowLeft, Camera, Sparkles, Download,
  Loader2, ImageIcon, RefreshCw, FileText, ChevronDown,
  CheckCircle2, Library,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { FunctionsHttpError, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Project { id: string; character_name: string; emoji: string; }
interface BrandBrief { brand_name: string; audience: string; tone: string; values: string; restrictions: string; }

const STYLES = [
  { id: "photorealistic portrait photography", label: "Фото", icon: "📷" },
  { id: "high fashion editorial photography, vogue style", label: "Fashion", icon: "👗" },
  { id: "professional studio portrait, clean background", label: "Студия", icon: "🎬" },
  { id: "street style photography, urban environment", label: "Стрит", icon: "🏙️" },
  { id: "cinematic film still, dramatic lighting", label: "Кино", icon: "🎞️" },
  { id: "lifestyle photography, natural light, candid", label: "Лайфстайл", icon: "☀️" },
];

const RATIOS = [
  { id: "1:1", label: "1:1", hint: "Квадрат" },
  { id: "4:5", label: "4:5", hint: "Портрет" },
  { id: "9:16", label: "9:16", hint: "Stories" },
  { id: "16:9", label: "16:9", hint: "Горизонт" },
  { id: "3:4", label: "3:4", hint: "Pinterest" },
];

const RESOLUTIONS = [
  { id: "1K", label: "1K", desc: "Быстро · 15 кр" },
  { id: "2K", label: "2K", desc: "Качество · 15 кр" },
  { id: "4K", label: "4K", desc: "Студия · 15 кр" },
];

const PROMPT_TEMPLATES = [
  "Профессиональный фэшн-образ для Instagram, стильный аутфит, нейтральный фон, мягкий студийный свет",
  "Lifestyle-контент в кофейне, натуральный свет, уютная атмосфера, книга и кофе в руках",
  "Бьюти-портрет, минималистичный белый фон, дневной мягкий свет, прямой взгляд в камеру",
  "Outdoor street style, городской пейзаж, динамичная поза, золотой час заката",
  "Product placement, держит продукт обеими руками, улыбка, светлый фон",
  "Редакционный fashion-образ в стиле Vogue, элегантный наряд, художественное освещение",
];

const COST_MAP: Record<string, number> = { "1K": 15, "2K": 15, "4K": 15 };

// ── Reusable primitives ───────────────────────────────────────────────────────
function DflCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("rounded-2xl border p-4", className)}
      style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--dfl-text-placeholder)" }}>
      {children}
    </p>
  );
}

function Pill({
  children, active = false, onClick, className,
}: { children: React.ReactNode; active?: boolean; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150", className)}
      style={{
        background: active ? "var(--dfl-accent-muted)" : "var(--dfl-surface-2)",
        borderColor: active ? "var(--dfl-border-2)" : "var(--dfl-border-1)",
        color: active ? "var(--dfl-accent-bright)" : "var(--dfl-text-subtle)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Badge({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "pink" | "violet" | "amber" | "green" | "gray" }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    blue:   { bg: "rgba(37,99,235,0.12)",  text: "var(--dfl-accent-bright)", border: "var(--dfl-border-2)" },
    pink:   { bg: "rgba(236,72,153,0.1)",  text: "#f472b6",                  border: "rgba(236,72,153,0.3)" },
    violet: { bg: "rgba(139,92,246,0.1)",  text: "#a78bfa",                  border: "rgba(139,92,246,0.3)" },
    amber:  { bg: "rgba(245,158,11,0.1)",  text: "var(--dfl-warning)",       border: "rgba(245,158,11,0.3)" },
    green:  { bg: "rgba(34,197,94,0.1)",   text: "var(--dfl-success)",       border: "rgba(34,197,94,0.3)" },
    gray:   { bg: "var(--dfl-surface-2)",  text: "var(--dfl-text-subtle)",   border: "var(--dfl-border-1)" },
  };
  const c = colors[color];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {children}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GeneratePhotoPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isDark = theme === "dark";

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0].id);
  const [ratio, setRatio] = useState("9:16");
  const [resolution, setResolution] = useState<"1K" | "2K" | "4K">("1K");
  const [projectId, setProjectId] = useState(searchParams.get("project") ?? "");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultDesc, setResultDesc] = useState("");
  const [resultCost, setResultCost] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [savedToLibrary, setSavedToLibrary] = useState(false);

  const { data: brief } = useQuery<BrandBrief | null>({
    queryKey: ["brand-brief", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from("brand_briefs").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["user-projects", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from("user_projects").select("id, character_name, emoji").eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const applyBrief = () => {
    if (!brief) return;
    const addition = [
      brief.brand_name ? `Бренд: ${brief.brand_name}` : "",
      brief.audience ? `Аудитория: ${brief.audience}` : "",
      brief.tone ? `Тон: ${brief.tone}` : "",
      brief.values ? `Ценности: ${brief.values}` : "",
    ].filter(Boolean).join(". ");
    setPrompt(prev => prev ? `${prev.trimEnd()}. ${addition}` : addition);
    toast.success("Параметры бренд-брифа добавлены в промпт");
  };

  const { mutate: generate, isPending } = useMutation({
    mutationFn: async () => {
      setSavedToLibrary(false);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token ?? "";
      const selectedProject = projects.find(p => p.id === projectId);
      const selectedStyle = STYLES.find(s => s.id === style);

      const characterCtx = selectedProject
        ? `AI influencer character named "${selectedProject.character_name}", photorealistic human appearance, professional model quality. `
        : "";
      const briefCtx = brief
        ? `Brand context: ${brief.brand_name || ""} targeting ${brief.audience || ""} with ${brief.tone || ""} tone. `
        : "";
      const fullPrompt = `${characterCtx}${briefCtx}${prompt}. ${selectedStyle?.id || ""}. Ultra-realistic, 8K photography quality, professional lighting.`;

      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt: fullPrompt,
          aspect_ratio: ratio,
          style: "",
          project_id: projectId || null,
          type: "photo",
          image_size: resolution,
          model: "google/gemini-3.1-flash-image-preview",
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) {
        let msg = error.message;
        if (error instanceof FunctionsHttpError) { try { msg = await error.context.text(); } catch { /* ignore */ } }
        throw new Error(msg);
      }
      return data as { url: string; description: string; cost: number };
    },
    onSuccess: (data) => {
      setResultUrl(data.url);
      setResultDesc(data.description ?? "");
      setResultCost(data.cost ?? COST_MAP[resolution]);
      queryClient.invalidateQueries({ queryKey: ["user-balance", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["project-assets"] });
      toast.success(`Фото сгенерировано · ${resolution} · Nano Banana Pro`);
    },
    onError: (err: Error) => toast.error(`Ошибка: ${err.message}`),
  });

  const handleSaveToLibrary = () => {
    setSavedToLibrary(true);
    queryClient.invalidateQueries({ queryKey: ["project-assets"] });
    toast.success("Фото сохранено в библиотеку проекта");
  };

  const canGenerate = prompt.trim().length > 3 && !isPending;
  const estimatedCost = COST_MAP[resolution];

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100vh", background: "var(--dfl-bg)" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes shimmer-bar { 0%{width:10%} 50%{width:80%} 100%{width:10%} }`}</style>

      {/* ── Header ── */}
      <header
        className="flex items-center gap-3 px-4 flex-shrink-0 border-b"
        style={{ height: 60, background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)", backdropFilter: "blur(12px)" }}
      >
        <Link to="/dashboard" style={{ textDecoration: "none" }}>
          <button
            className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-sm border transition-all duration-150"
            style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-subtle)", cursor: "pointer" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-hi)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-2)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-1)"; }}
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Дашборд</span>
          </button>
        </Link>

        <div className="w-px h-5 flex-shrink-0" style={{ background: "var(--dfl-border-1)" }} />

        <Link to="/dashboard" className="no-underline flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
            <Zap size={11} color="white" />
          </div>
          <span className="font-bold text-sm hidden sm:block">
            <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
            <span className="text-accent-gradient">Лабс</span>
          </span>
        </Link>

        <Badge color="blue"><Camera size={10} />Nano Banana Pro · {resolution}</Badge>

        <div className="flex-1" />

        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-xl border transition-all duration-150"
          style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-subtle)", cursor: "pointer" }}
          title={isDark ? "Светлая тема" : "Тёмная тема"}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-hi)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-2)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-1)"; }}
        >
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 overflow-hidden flex" style={{ padding: "0 32px 16px" }}>
        <div
          className="flex-1 overflow-hidden grid"
          style={{ gridTemplateColumns: "360px 1fr", gap: 16, height: "calc(100vh - 76px)", maxWidth: 1400, margin: "0 auto", width: "100%" }}
        >
          {/* ── LEFT: Controls ── */}
          <div className="overflow-y-auto scrollbar-none" style={{ paddingRight: 2 }}>
            <div className="flex flex-col gap-3 pb-4 pt-2">

              {/* Character */}
              {projects.length > 0 && (
                <DflCard>
                  <SectionLabel>Персонаж</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    <Pill active={!projectId} onClick={() => setProjectId("")}>🌐 Без персонажа</Pill>
                    {projects.map(p => (
                      <Pill key={p.id} active={projectId === p.id} onClick={() => setProjectId(p.id)}>
                        {p.emoji} <span className="truncate max-w-[90px]">{p.character_name}</span>
                      </Pill>
                    ))}
                  </div>
                  {projectId && (
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: "var(--dfl-border-1)" }}>
                      <Sparkles size={10} style={{ color: "var(--dfl-accent-bright)" }} />
                      <span className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>Персонаж будет встроен в промпт</span>
                    </div>
                  )}
                </DflCard>
              )}

              {/* Prompt */}
              <DflCard>
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel>Промпт</SectionLabel>
                  <div className="flex items-center gap-2">
                    {brief && (
                      <button
                        onClick={applyBrief}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition-all duration-150"
                        style={{ background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.3)", color: "#a78bfa", cursor: "pointer" }}
                      >
                        <FileText size={10} />Учесть бриф
                      </button>
                    )}
                    <button
                      onClick={() => setShowTemplates(v => !v)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition-all duration-150"
                      style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-subtle)", cursor: "pointer" }}
                    >
                      Шаблоны
                      <ChevronDown size={10} style={{ transform: showTemplates ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
                    </button>
                  </div>
                </div>

                {showTemplates && (
                  <div className="flex flex-col gap-1 mb-3">
                    {PROMPT_TEMPLATES.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => { setPrompt(t); setShowTemplates(false); }}
                        className="text-left px-3 py-2 rounded-xl text-xs leading-relaxed border transition-all duration-150"
                        style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-mid)", cursor: "pointer" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-3)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-2)"}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Опишите сцену: поза, локация, освещение, аутфит, настроение, детали..."
                  disabled={isPending}
                  rows={4}
                  className="w-full text-sm resize-none outline-none rounded-xl px-3 py-2.5 border transition-all duration-150"
                  style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-hi)", lineHeight: 1.6, fontFamily: "inherit" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--dfl-border-2)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--dfl-border-1)")}
                />
                <p className="text-xs mt-1.5" style={{ color: "var(--dfl-text-placeholder)" }}>
                  {prompt.length}/500 · Чем подробнее, тем точнее результат
                </p>
              </DflCard>

              {/* Style */}
              <DflCard>
                <SectionLabel>Стиль съёмки</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-150 text-center"
                      style={{
                        background: style === s.id ? "var(--dfl-accent-muted)" : "var(--dfl-surface-2)",
                        borderColor: style === s.id ? "var(--dfl-border-2)" : "var(--dfl-border-1)",
                        cursor: "pointer",
                      }}
                    >
                      <span className="text-lg">{s.icon}</span>
                      <span className="text-xs font-medium" style={{ color: style === s.id ? "var(--dfl-accent-bright)" : "var(--dfl-text-subtle)" }}>
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              </DflCard>

              {/* Ratio */}
              <DflCard>
                <SectionLabel>Соотношение сторон</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {RATIOS.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setRatio(r.id)}
                      className="flex flex-col items-center px-3 py-2 rounded-xl border transition-all duration-150 min-w-[52px]"
                      style={{
                        background: ratio === r.id ? "var(--dfl-accent-muted)" : "var(--dfl-surface-2)",
                        borderColor: ratio === r.id ? "var(--dfl-border-2)" : "var(--dfl-border-1)",
                        cursor: "pointer",
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: ratio === r.id ? "var(--dfl-accent-bright)" : "var(--dfl-text-hi)" }}>{r.label}</span>
                      <span className="text-[10px]" style={{ color: "var(--dfl-text-placeholder)" }}>{r.hint}</span>
                    </button>
                  ))}
                </div>
              </DflCard>

              {/* Resolution */}
              <DflCard>
                <SectionLabel>Разрешение</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                  {RESOLUTIONS.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setResolution(r.id as "1K" | "2K" | "4K")}
                      className="flex flex-col items-center py-3 px-2 rounded-xl border transition-all duration-150 text-center"
                      style={{
                        background: resolution === r.id ? "var(--dfl-accent-muted)" : "var(--dfl-surface-2)",
                        borderColor: resolution === r.id ? "var(--dfl-border-2)" : "var(--dfl-border-1)",
                        cursor: "pointer",
                      }}
                    >
                      <span className="text-base font-bold" style={{ color: resolution === r.id ? "var(--dfl-accent-bright)" : "var(--dfl-text-hi)" }}>{r.id}</span>
                      <span className="text-[11px] mt-0.5" style={{ color: "var(--dfl-text-placeholder)" }}>{r.desc}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 px-1">
                  <Zap size={11} style={{ color: "var(--dfl-warning)" }} />
                  <span className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>
                    Стоимость: <span className="font-bold" style={{ color: "var(--dfl-warning)" }}>{estimatedCost} кр</span>
                  </span>
                  <div className="ml-auto"><Badge color="blue">Nano Banana Pro</Badge></div>
                </div>
              </DflCard>

              {/* Generate button */}
              <button
                disabled={!canGenerate}
                onClick={() => generate()}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: canGenerate ? "linear-gradient(135deg, #2563eb, #4f46e5)" : "var(--dfl-surface-2)",
                  color: canGenerate ? "white" : "var(--dfl-text-placeholder)",
                  cursor: canGenerate ? "pointer" : "not-allowed",
                  boxShadow: canGenerate ? "0 4px 24px rgba(37,99,235,0.3)" : "none",
                  border: canGenerate ? "none" : `1px solid var(--dfl-border-1)`,
                }}
                onMouseEnter={e => { if (canGenerate) (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 32px rgba(37,99,235,0.45)"; }}
                onMouseLeave={e => { if (canGenerate) (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(37,99,235,0.3)"; }}
              >
                {isPending
                  ? <><Loader2 size={15} className="animate-spin" />Генерируем {resolution}...</>
                  : <><Sparkles size={15} />Сгенерировать · {estimatedCost} кр</>
                }
              </button>
            </div>
          </div>

          {/* ── RIGHT: Result ── */}
          <div
            className="flex flex-col rounded-2xl overflow-hidden border mt-2"
            style={{ height: "calc(100vh - 78px)", background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}
          >
            {isPending ? (
              /* Loading */
              <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)" }}>
                    <Camera size={32} style={{ color: "var(--dfl-accent-bright)" }} />
                  </div>
                  <div className="absolute inset-[-8px] rounded-[28px] border-2 border-transparent"
                    style={{ borderTopColor: "var(--dfl-accent)", borderRightColor: "var(--dfl-accent)", animation: "spin 1s linear infinite" }} />
                </div>
                <div>
                  <p className="text-base font-semibold mb-1.5" style={{ color: "var(--dfl-text-hi)" }}>Генерируем {resolution} фото...</p>
                  <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>Nano Banana Pro · до 40 сек</p>
                </div>
                <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--dfl-surface-2)" }}>
                  <div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--dfl-accent), #6366f1)", animation: "shimmer-bar 2s ease-in-out infinite" }} />
                </div>
              </div>
            ) : resultUrl ? (
              /* Result */
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 relative overflow-hidden" style={{ background: "#000" }}>
                  <img src={resultUrl} alt="Generated influencer" className="w-full h-full object-contain" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge color="blue">Nano Banana Pro</Badge>
                    <Badge color="violet">{resolution} · {ratio}</Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge color="green"><CheckCircle2 size={9} />−{resultCost} кр</Badge>
                  </div>
                </div>

                {resultDesc && (
                  <div className="px-4 py-2.5 border-t overflow-hidden max-h-14" style={{ borderColor: "var(--dfl-border-1)" }}>
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--dfl-text-subtle)" }}>{resultDesc}</p>
                  </div>
                )}

                <div className="px-4 py-3 border-t flex-shrink-0" style={{ borderColor: "var(--dfl-border-1)" }}>
                  <div className="grid grid-cols-3 gap-2">
                    <a href={resultUrl} download={`influencer-${resolution}.png`} className="no-underline">
                      <button className="w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-150"
                        style={{ background: "var(--dfl-accent-muted)", borderColor: "var(--dfl-border-2)", color: "var(--dfl-accent-bright)", cursor: "pointer" }}>
                        <Download size={12} />Скачать
                      </button>
                    </a>
                    <button
                      onClick={() => generate()} disabled={!canGenerate}
                      className="h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-150"
                      style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-mid)", cursor: "pointer" }}>
                      <RefreshCw size={12} />Ещё раз
                    </button>
                    <button
                      onClick={handleSaveToLibrary} disabled={savedToLibrary}
                      className="h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-150"
                      style={{
                        background: savedToLibrary ? "rgba(34,197,94,0.1)" : "rgba(139,92,246,0.1)",
                        borderColor: savedToLibrary ? "rgba(34,197,94,0.3)" : "rgba(139,92,246,0.3)",
                        color: savedToLibrary ? "var(--dfl-success)" : "#a78bfa",
                        cursor: savedToLibrary ? "default" : "pointer",
                      }}>
                      {savedToLibrary ? <><CheckCircle2 size={12} />Сохранено</> : <><Library size={12} />В библиотеку</>}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty */
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="w-18 h-18 rounded-2xl flex items-center justify-center" style={{ width: 72, height: 72, background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}>
                  <ImageIcon size={32} style={{ color: "var(--dfl-text-placeholder)" }} />
                </div>
                <div>
                  <p className="text-base font-semibold mb-1.5" style={{ color: "var(--dfl-text-mid)" }}>Фото появится здесь</p>
                  <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
                    Опишите сцену, выберите стиль и разрешение
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge color="blue">📸 Nano Banana Pro</Badge>
                  <Badge color="violet">До 4K разрешение</Badge>
                  <Badge color="green">Studio quality</Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
