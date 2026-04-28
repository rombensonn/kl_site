import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Zap, Sun, Moon, ArrowLeft, Video, Sparkles, Download,
  Loader2, Film, Play, CheckCircle2, AlertTriangle, ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { FunctionsHttpError, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Project { id: string; character_name: string; emoji: string; }
interface Photo { id: string; result_url: string; prompt: string; created_at: string; }

const VIDEO_TEMPLATES = [
  "Инфлюенсер идёт по улице города, модный образ, золотой час",
  "Утренняя рутина: кофе, книга, солнечный свет через окно",
  "Распаковка продукта, крупный план рук, эмоциональная реакция",
  "Лёгкая прогулка в парке, осенние листья, камера следует сзади",
  "Переодевание: несколько образов с плавными переходами",
];

const ASPECT_RATIOS = [
  { id: "portrait" as const, label: "9:16", hint: "TikTok / Reels" },
  { id: "landscape" as const, label: "16:9", hint: "YouTube" },
  { id: "square" as const, label: "1:1", hint: "Instagram" },
];

// ── Shared primitives ─────────────────────────────────────────────────────────
function DflCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border p-4", className)}
      style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}>
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

function StepBadge({ n }: { n: number }) {
  return (
    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[11px] font-bold border"
      style={{ background: "rgba(236,72,153,0.1)", borderColor: "rgba(236,72,153,0.3)", color: "#f472b6" }}>
      {n}
    </div>
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
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {children}
    </span>
  );
}

function Pill({ children, active = false, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150"
      style={{
        background: active ? "rgba(236,72,153,0.1)" : "var(--dfl-surface-2)",
        borderColor: active ? "rgba(236,72,153,0.4)" : "var(--dfl-border-1)",
        color: active ? "#f472b6" : "var(--dfl-text-subtle)",
        cursor: "pointer",
      }}>
      {children}
    </button>
  );
}

function aspectLabel(id: string) {
  return id === "portrait" ? "9:16" : id === "landscape" ? "16:9" : "1:1";
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GenerateVideoPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isDark = theme === "dark";

  const [projectId, setProjectId] = useState(searchParams.get("project") ?? "");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "landscape" | "square">("portrait");
  const [seconds, setSeconds] = useState(5);
  const [status, setStatus] = useState<"idle" | "pending" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const predIdRef = useRef<string | null>(null);
  const assetIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };
  useEffect(() => () => stopPolling(), []);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["user-projects", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from("user_projects").select("id, character_name, emoji").eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const { data: photos = [], isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: ["project-photos", projectId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      let q = supabase
        .from("generated_assets").select("id, result_url, prompt, created_at")
        .eq("user_id", user.id).eq("type", "photo").eq("status", "completed")
        .order("created_at", { ascending: false }).limit(20);
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Photo[];
    },
    enabled: !!user?.id,
  });

  const pollStatus = async () => {
    if (!predIdRef.current) return;
    const { data, error } = await supabase.functions.invoke("generate-video", {
      body: { action: "check", predictionId: predIdRef.current, assetId: assetIdRef.current },
    });
    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) { try { msg = await error.context.text(); } catch { /* noop */ } }
      stopPolling(); setStatus("error"); setErrorMsg(msg); return;
    }
    if (data.status === "succeeded") {
      stopPolling(); setProgress(100); setVideoUrl(data.videoUrl); setStatus("done");
      queryClient.invalidateQueries({ queryKey: ["user-balance", user?.id] });
      toast.success("Видео сгенерировано через Kling!");
    } else if (data.status === "failed" || data.status === "canceled") {
      stopPolling(); setStatus("error"); setErrorMsg(data.error ?? "Генерация не удалась");
    } else {
      setProgress(data.progress ?? 0); setStatus("processing");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Введите описание видео"); return; }
    if (!selectedPhoto) { toast.error("Выберите фотографию персонажа"); return; }
    stopPolling();
    setStatus("pending"); setProgress(0); setErrorMsg(""); setVideoUrl(null);

    const { data, error } = await supabase.functions.invoke("generate-video", {
      body: {
        action: "create",
        prompt: prompt.trim(),
        model: "kling-v2.6-pro",
        referenceImageUrl: selectedPhoto.result_url,
        projectId: projectId || null,
        aspectRatio,
        seconds,
      },
    });
    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) { try { msg = await error.context.text(); } catch { /* noop */ } }
      setStatus("error"); setErrorMsg(msg); return;
    }
    predIdRef.current = data.predictionId;
    assetIdRef.current = data.assetId;
    setStatus("processing");
    pollRef.current = setInterval(pollStatus, 5000);
  };

  const isGenerating = status === "pending" || status === "processing";
  const canGenerate = !isGenerating && !!selectedPhoto && prompt.trim().length > 3;
  const cost = seconds <= 5 ? 50 : 145;

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100vh", background: "var(--dfl-bg)" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes shimmer-bar{0%{width:10%}50%{width:70%}100%{width:10%}}`}</style>

      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-4 flex-shrink-0 border-b"
        style={{ height: 60, background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)", backdropFilter: "blur(12px)" }}>
        <Link to="/dashboard" style={{ textDecoration: "none" }}>
          <button className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-sm border transition-all duration-150"
            style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-subtle)", cursor: "pointer" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-hi)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-2)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-1)"; }}>
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
        <Badge color="pink"><Video size={10} />Kling 3.0 · от 150 кр</Badge>
        <div className="flex-1" />
        <button onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-xl border transition-all duration-150"
          style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-subtle)", cursor: "pointer" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-hi)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-2)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-1)"; }}>
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 overflow-hidden flex" style={{ padding: "0 32px 16px" }}>
        <div className="flex-1 overflow-hidden grid"
          style={{ gridTemplateColumns: "360px 1fr", gap: 16, height: "calc(100vh - 76px)", maxWidth: 1400, margin: "0 auto", width: "100%" }}>

          {/* ── LEFT: Controls ── */}
          <div className="overflow-y-auto scrollbar-none" style={{ paddingRight: 2 }}>
            <div className="flex flex-col gap-3 pb-4 pt-2">

              {/* Step 1: Character */}
              <DflCard>
                <div className="flex items-center gap-2 mb-3">
                  <StepBadge n={1} /><SectionLabel>Выберите персонажа</SectionLabel>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill active={!projectId} onClick={() => { setProjectId(""); setSelectedPhoto(null); }}>🌐 Все фото</Pill>
                  {projects.map(p => (
                    <Pill key={p.id} active={projectId === p.id} onClick={() => { setProjectId(p.id); setSelectedPhoto(null); }}>
                      {p.emoji} <span className="truncate max-w-[90px]">{p.character_name}</span>
                    </Pill>
                  ))}
                </div>
              </DflCard>

              {/* Step 2: Photo picker */}
              <DflCard>
                <div className="flex items-center gap-2 mb-3">
                  <StepBadge n={2} /><SectionLabel>Выберите фотографию референс</SectionLabel>
                </div>

                {photosLoading ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "var(--dfl-surface-2)" }} />)}
                  </div>
                ) : photos.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-5 text-center">
                    <ImageIcon size={28} style={{ color: "var(--dfl-text-placeholder)" }} />
                    <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
                      Нет сгенерированных фото{projectId ? " для этого персонажа" : ""}
                    </p>
                    <Link to={`/generate/photo${projectId ? `?project=${projectId}` : ""}`} className="no-underline">
                      <button className="h-8 px-4 rounded-xl text-xs font-semibold border transition-all duration-150"
                        style={{ background: "rgba(236,72,153,0.1)", borderColor: "rgba(236,72,153,0.3)", color: "#f472b6", cursor: "pointer" }}>
                        Генерировать фото →
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map(photo => (
                      <div key={photo.id} onClick={() => setSelectedPhoto(photo)}
                        className="relative rounded-xl overflow-hidden transition-all duration-150"
                        style={{
                          border: selectedPhoto?.id === photo.id ? "2px solid #f472b6" : "2px solid transparent",
                          cursor: "pointer",
                        }}>
                        <div className="h-24 bg-black">
                          <img src={photo.result_url} alt={photo.prompt} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        {selectedPhoto?.id === photo.id && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#ec4899" }}>
                            <CheckCircle2 size={11} color="white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedPhoto && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--dfl-border-1)" }}>
                    <CheckCircle2 size={11} color="#f472b6" />
                    <span className="text-xs truncate flex-1" style={{ color: "var(--dfl-text-subtle)" }}>
                      {selectedPhoto.prompt.slice(0, 50)}...
                    </span>
                  </div>
                )}
              </DflCard>

              {/* Step 3: Prompt */}
              <DflCard>
                <div className="flex items-center gap-2 mb-3">
                  <StepBadge n={3} /><SectionLabel>Опишите видео</SectionLabel>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {VIDEO_TEMPLATES.map((t, i) => (
                    <button key={i} onClick={() => setPrompt(t)}
                      className="px-2.5 py-1 rounded-full text-xs border transition-all duration-150"
                      style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-subtle)", cursor: "pointer" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(236,72,153,0.1)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(236,72,153,0.3)"; (e.currentTarget as HTMLElement).style.color = "#f472b6"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-2)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-1)"; (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)"; }}>
                      {t.slice(0, 28)}...
                    </button>
                  ))}
                </div>

                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Опишите действие: что делает персонаж, как движется камера, атмосфера..."
                  disabled={isGenerating}
                  rows={3}
                  className="w-full text-sm resize-none outline-none rounded-xl px-3 py-2.5 border transition-all duration-150"
                  style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-hi)", lineHeight: 1.6, fontFamily: "inherit" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--dfl-border-2)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--dfl-border-1)") }
                />
              </DflCard>

              {/* Step 4: Settings */}
              <DflCard>
                <div className="flex items-center gap-2 mb-3">
                  <StepBadge n={4} /><SectionLabel>Параметры</SectionLabel>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Format */}
                  <div>
                    <p className="text-xs mb-2" style={{ color: "var(--dfl-text-subtle)" }}>Формат</p>
                    <div className="flex gap-1">
                      {ASPECT_RATIOS.map(r => (
                        <button key={r.id} onClick={() => setAspectRatio(r.id)} disabled={isGenerating}
                          className="flex-1 flex flex-col items-center py-2 rounded-xl border text-xs transition-all duration-150"
                          style={{
                            background: aspectRatio === r.id ? "rgba(236,72,153,0.1)" : "var(--dfl-surface-2)",
                            borderColor: aspectRatio === r.id ? "rgba(236,72,153,0.4)" : "var(--dfl-border-1)",
                            color: aspectRatio === r.id ? "#f472b6" : "var(--dfl-text-subtle)",
                            cursor: "pointer",
                          }}>
                          <span className="font-bold">{r.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-center mt-1" style={{ color: "var(--dfl-text-placeholder)" }}>
                      {ASPECT_RATIOS.find(r => r.id === aspectRatio)?.hint}
                    </p>
                  </div>

                  {/* Duration */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>Длительность</p>
                      <Badge color="pink">{seconds} сек</Badge>
                    </div>
                    <input type="range" min={3} max={10} value={seconds}
                      onChange={e => setSeconds(Number(e.target.value))} disabled={isGenerating}
                      className="w-full" style={{ accentColor: "#ec4899" }} />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px]" style={{ color: "var(--dfl-text-placeholder)" }}>3с</span>
                      <span className="text-[10px]" style={{ color: "var(--dfl-text-placeholder)" }}>10с</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 px-1">
                  <Zap size={11} style={{ color: "var(--dfl-warning)" }} />
                  <span className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>
                    Стоимость: <span className="font-bold" style={{ color: "var(--dfl-warning)" }}>{cost} кр</span>
                  </span>
                  <div className="ml-auto"><Badge color="pink">Kling 3.0</Badge></div>
                </div>
              </DflCard>

              {/* Generate */}
              <button disabled={!canGenerate} onClick={handleGenerate}
                className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: canGenerate ? "linear-gradient(135deg, #db2777, #9333ea)" : "var(--dfl-surface-2)",
                  color: canGenerate ? "white" : "var(--dfl-text-placeholder)",
                  cursor: canGenerate ? "pointer" : "not-allowed",
                  boxShadow: canGenerate ? "0 4px 24px rgba(219,39,119,0.3)" : "none",
                  border: canGenerate ? "none" : `1px solid var(--dfl-border-1)`,
                }}>
                {isGenerating
                  ? <><Loader2 size={15} className="animate-spin" />Генерируем видео...</>
                  : <><Play size={15} />Создать видео · {cost} кр</>
                }
              </button>
            </div>
          </div>

          {/* ── RIGHT: Result ── */}
          <div className="flex flex-col rounded-2xl overflow-hidden border mt-2"
            style={{ height: "calc(100vh - 78px)", background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}>
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.3)" }}>
                    <Video size={32} color="#f472b6" />
                  </div>
                  <div className="absolute border-2 border-transparent rounded-[28px]"
                    style={{ inset: -8, borderTopColor: "#ec4899", borderRightColor: "#ec4899", animation: "spin 1s linear infinite" }} />
                </div>
                <div>
                  <p className="text-base font-semibold mb-1.5" style={{ color: "var(--dfl-text-hi)" }}>
                    {status === "pending" ? "Запускаем Kling..." : "Генерируем видео..."}
                  </p>
                  <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
                    Это может занять 1–5 минут · {aspectLabel(aspectRatio)} · {seconds}с
                  </p>
                </div>
                <div className="w-56 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--dfl-surface-2)" }}>
                  <div className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #ec4899, #8b5cf6)", width: progress > 0 ? `${progress}%` : "25%", transition: "width 1s ease", animation: progress === 0 ? "shimmer-bar 3s ease-in-out infinite" : "none" }} />
                </div>
                {progress > 0 && <Badge color="pink">{progress}% завершено</Badge>}
              </div>
            ) : status === "done" && videoUrl ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 relative overflow-hidden" style={{ background: "#000" }}>
                  <video src={videoUrl} controls autoPlay loop muted className="w-full h-full object-contain" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge color="pink">Kling 3.0</Badge>
                    <Badge color="green"><CheckCircle2 size={9} />Готово</Badge>
                  </div>
                </div>
                <div className="px-4 py-3 border-t flex-shrink-0 grid grid-cols-2 gap-2" style={{ borderColor: "var(--dfl-border-1)" }}>
                  <a href={videoUrl} download="sora-video.mp4" className="no-underline">
                    <button className="w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-150"
                      style={{ background: "rgba(236,72,153,0.1)", borderColor: "rgba(236,72,153,0.3)", color: "#f472b6", cursor: "pointer" }}>
                      <Download size={12} />Скачать MP4
                    </button>
                  </a>
                  <button onClick={() => { setStatus("idle"); setVideoUrl(null); setProgress(0); }}
                    className="h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-150"
                    style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-mid)", cursor: "pointer" }}>
                    <Sparkles size={12} />Новое видео
                  </button>
                </div>
              </div>
            ) : status === "error" ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="w-18 h-18 rounded-2xl flex items-center justify-center"
                  style={{ width: 72, height: 72, background: "var(--dfl-error-muted)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertTriangle size={32} style={{ color: "var(--dfl-error)" }} />
                </div>
                <div>
                  <p className="text-base font-semibold mb-1.5" style={{ color: "var(--dfl-error)" }}>Ошибка генерации</p>
                  <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>{errorMsg}</p>
                </div>
                <button onClick={() => setStatus("idle")}
                  className="h-9 px-5 rounded-xl text-sm font-semibold border transition-all duration-150"
                  style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-mid)", cursor: "pointer" }}>
                  Попробовать снова
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                {selectedPhoto ? (
                  <>
                    <div className="w-40 rounded-2xl overflow-hidden border-2" style={{ borderColor: "rgba(236,72,153,0.5)" }}>
                      <img src={selectedPhoto.result_url} alt="selected" className="w-full object-cover" style={{ aspectRatio: "3/4" }} />
                    </div>
                    <div>
                      <p className="text-base font-semibold mb-1.5" style={{ color: "var(--dfl-text-hi)" }}>Фото выбрано</p>
                      <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>Опишите движение и нажмите «Создать видео»</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge color="pink">🎬 Kling 3.0</Badge>
                      <Badge color="violet">{aspectLabel(aspectRatio)}</Badge>
                      <Badge color="amber">{seconds} сек</Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-18 h-18 rounded-2xl flex items-center justify-center"
                      style={{ width: 72, height: 72, background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}>
                      <Film size={32} style={{ color: "var(--dfl-text-placeholder)" }} />
                    </div>
                    <div>
                      <p className="text-base font-semibold mb-1.5" style={{ color: "var(--dfl-text-mid)" }}>Выберите исходное фото персонажа</p>
                      <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>Сделаем короткое видео с сохранением лица и образа персонажа</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge color="pink">🎬 Kling 3.0</Badge>
                      <Badge color="violet">С сохранением персонажа</Badge>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
