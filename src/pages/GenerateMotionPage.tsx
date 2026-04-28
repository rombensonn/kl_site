import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Zap, Sun, Moon, ArrowLeft, Film, Play, Download,
  Loader2, Upload, CheckCircle2, AlertTriangle, ImageIcon, X,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { FunctionsHttpError, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Project { id: string; character_name: string; emoji: string; }
interface Photo { id: string; result_url: string; prompt: string; created_at: string; }

const MOTION_TEMPLATES = [
  { id: "dance", label: "Танцует", icon: "💃", desc: "Динамичные танцевальные движения", prompt: "Person dancing with smooth rhythmic movements, energetic and expressive, professional dance performance" },
  { id: "walk",  label: "Идёт",    icon: "🚶", desc: "Плавная уверенная походка",         prompt: "Person walking confidently towards camera, smooth natural stride, fashion model walk" },
  { id: "pose",  label: "Позирует",icon: "✨", desc: "Смена поз с flow",                  prompt: "Person striking elegant fashion poses, fluid pose transitions, editorial style movements" },
  { id: "product",label:"Показывает",icon:"🛍️",desc:"Демонстрация товара",                prompt: "Person demonstrating and showcasing product with natural hand gestures, engaging presentation" },
  { id: "selfie",label: "Селфи",   icon: "📱", desc: "Разговор в камеру",                 prompt: "Person talking to camera in selfie style, natural expressions, engaging personality" },
  { id: "fitness",label:"Фитнес",  icon: "💪", desc: "Спортивные движения",               prompt: "Person doing fitness exercises, dynamic athletic movements, energetic workout" },
];

const ASPECT_RATIOS = [
  { id: "portrait" as const,  label: "9:16", hint: "TikTok / Reels" },
  { id: "landscape" as const, label: "16:9", hint: "YouTube" },
  { id: "square" as const,    label: "1:1",  hint: "Instagram" },
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
    <p className="text-[10px] font-bold uppercase tracking-widest mb-0" style={{ color: "var(--dfl-text-placeholder)" }}>
      {children}
    </p>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[11px] font-bold border"
      style={{ background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.3)", color: "#a78bfa" }}>
      {n}
    </div>
  );
}

function Badge({ children, color = "violet" }: { children: React.ReactNode; color?: "blue" | "pink" | "violet" | "amber" | "green" | "gray" }) {
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
        background: active ? "rgba(139,92,246,0.1)" : "var(--dfl-surface-2)",
        borderColor: active ? "rgba(139,92,246,0.4)" : "var(--dfl-border-1)",
        color: active ? "#a78bfa" : "var(--dfl-text-subtle)",
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
export default function GenerateMotionPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isDark = theme === "dark";

  const [projectId, setProjectId] = useState(searchParams.get("project") ?? "");
  const [photoSource, setPhotoSource] = useState<"library" | "upload">("library");
  const [selectedLibraryPhoto, setSelectedLibraryPhoto] = useState<Photo | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [uploadedPhotoPreview, setUploadedPhotoPreview] = useState<string | null>(null);
  const [selectedMotion, setSelectedMotion] = useState(MOTION_TEMPLATES[0]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"portrait" | "landscape" | "square">("portrait");
  const [seconds, setSeconds] = useState(5);

  const [status, setStatus] = useState<"idle" | "uploading" | "pending" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const predIdRef = useRef<string | null>(null);
  const assetIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    queryKey: ["project-photos-motion", projectId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      let q = supabase.from("generated_assets").select("id, result_url, prompt, created_at")
        .eq("user_id", user.id).eq("type", "photo").eq("status", "completed")
        .order("created_at", { ascending: false }).limit(16);
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Photo[];
    },
    enabled: !!user?.id && photoSource === "library",
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Загрузите файл изображения (JPG, PNG, WebP)"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Файл слишком большой (макс. 10 MB)"); return; }

    setStatus("uploading");
    const preview = URL.createObjectURL(file);
    setUploadedPhotoPreview(preview);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setStatus("idle"); toast.error("Необходима авторизация"); return; }

    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${user?.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("images").upload(fileName, file, { contentType: file.type });

    if (uploadError) { setStatus("idle"); toast.error(`Ошибка загрузки: ${uploadError.message}`); return; }

    const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(fileName);
    setUploadedPhotoUrl(publicUrl);
    setStatus("idle");
    toast.success("Фото загружено");
  };

  const activePhotoUrl = photoSource === "library" ? selectedLibraryPhoto?.result_url : uploadedPhotoUrl;
  const activePhotoPreview = photoSource === "library" ? selectedLibraryPhoto?.result_url : uploadedPhotoPreview;

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
      toast.success("Motion-видео готово!");
    } else if (data.status === "failed" || data.status === "canceled") {
      stopPolling(); setStatus("error"); setErrorMsg(data.error ?? "Генерация не удалась");
    } else {
      setProgress(data.progress ?? 0); setStatus("processing");
    }
  };

  const handleGenerate = async () => {
    if (!activePhotoUrl) { toast.error("Выберите или загрузите фотографию"); return; }
    stopPolling();
    setStatus("pending"); setProgress(0); setErrorMsg(""); setVideoUrl(null);

    const motionPrompt = [
      selectedMotion.prompt,
      customPrompt.trim() ? `Additional context: ${customPrompt.trim()}` : "",
    ].filter(Boolean).join(". ");

    const { data, error } = await supabase.functions.invoke("generate-video", {
      body: {
        action: "create",
        prompt: motionPrompt,
        model: "kling-v2.6-pro",
        referenceImageUrl: activePhotoUrl,
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

  const isGenerating = status === "pending" || status === "processing" || status === "uploading";
  const canGenerate = !isGenerating && !!activePhotoUrl;
  const cost = seconds <= 5 ? 75 : 215;

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
            <ArrowLeft size={13} /><span className="hidden sm:inline">Дашборд</span>
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
        <Badge color="violet"><Film size={10} />Motion Control · Kling API</Badge>
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
              {projects.length > 0 && (
                <DflCard>
                  <div className="flex items-center gap-2 mb-3">
                    <StepBadge n={1} /><SectionLabel>Персонаж</SectionLabel>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill active={!projectId} onClick={() => { setProjectId(""); setSelectedLibraryPhoto(null); }}>🌐 Все фото</Pill>
                    {projects.map(p => (
                      <Pill key={p.id} active={projectId === p.id} onClick={() => { setProjectId(p.id); setSelectedLibraryPhoto(null); }}>
                        {p.emoji} <span className="truncate max-w-[90px]">{p.character_name}</span>
                      </Pill>
                    ))}
                  </div>
                </DflCard>
              )}

              {/* Step 2: Photo source */}
              <DflCard>
                <div className="flex items-center gap-2 mb-3">
                  <StepBadge n={2} /><SectionLabel>Фотография персонажа</SectionLabel>
                </div>

                {/* Source toggle */}
                <div className="flex gap-1 p-1 rounded-xl mb-3 border" style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)" }}>
                  {(["library", "upload"] as const).map(src => (
                    <button key={src} onClick={() => setPhotoSource(src)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium transition-all duration-150"
                      style={{
                        background: photoSource === src ? "rgba(139,92,246,0.12)" : "transparent",
                        border: photoSource === src ? "1px solid rgba(139,92,246,0.35)" : "1px solid transparent",
                        color: photoSource === src ? "#a78bfa" : "var(--dfl-text-subtle)",
                        cursor: "pointer",
                      }}>
                      {src === "library" ? <><ImageIcon size={11} />Из библиотеки</> : <><Upload size={11} />Загрузить</>}
                    </button>
                  ))}
                </div>

                {/* Library picker */}
                {photoSource === "library" && (
                  photosLoading ? (
                    <div className="grid grid-cols-4 gap-2">
                      {[1,2,3,4].map(i => <div key={i} className="h-18 rounded-xl animate-pulse" style={{ height: 72, background: "var(--dfl-surface-2)" }} />)}
                    </div>
                  ) : photos.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-5 text-center">
                      <ImageIcon size={24} style={{ color: "var(--dfl-text-placeholder)" }} />
                      <p className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>Нет фото в библиотеке</p>
                      <Link to="/generate/photo" className="no-underline">
                        <button className="h-7 px-3 rounded-xl text-xs font-semibold border transition-all duration-150"
                          style={{ background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.3)", color: "#a78bfa", cursor: "pointer" }}>
                          Создать фото →
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {photos.map(photo => (
                        <div key={photo.id} onClick={() => setSelectedLibraryPhoto(photo)}
                          className="relative rounded-xl overflow-hidden transition-all duration-150"
                          style={{
                            border: selectedLibraryPhoto?.id === photo.id ? "2px solid #a78bfa" : "2px solid transparent",
                            cursor: "pointer",
                          }}>
                          <div className="bg-black" style={{ height: 72 }}>
                            <img src={photo.result_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          {selectedLibraryPhoto?.id === photo.id && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#8b5cf6" }}>
                              <CheckCircle2 size={9} color="white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Upload area */}
                {photoSource === "upload" && (
                  <div>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                    {uploadedPhotoPreview ? (
                      <div className="relative">
                        <div className="rounded-xl overflow-hidden border-2" style={{ borderColor: "rgba(139,92,246,0.5)", height: 160 }}>
                          <img src={uploadedPhotoPreview} alt="Uploaded" className="w-full h-full object-cover" />
                        </div>
                        <button
                          onClick={() => { setUploadedPhotoUrl(null); setUploadedPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-150"
                          style={{ background: "var(--dfl-error)", cursor: "pointer" }}>
                          <X size={11} color="white" />
                        </button>
                        {status === "uploading" && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ background: "rgba(0,0,0,0.5)" }}>
                            <Loader2 size={24} className="animate-spin text-white" color="white" />
                          </div>
                        )}
                        {uploadedPhotoUrl && (
                          <div className="absolute bottom-2 left-2">
                            <Badge color="green"><CheckCircle2 size={9} />Загружено</Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed transition-all duration-150"
                        style={{ height: 140, borderColor: "rgba(139,92,246,0.4)", background: "rgba(139,92,246,0.06)", cursor: "pointer" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.1)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.06)"}>
                        <Upload size={24} color="#a78bfa" />
                        <div className="text-center">
                          <p className="text-sm font-medium" style={{ color: "#a78bfa" }}>Нажмите для загрузки</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--dfl-text-placeholder)" }}>JPG, PNG, WebP · до 10 MB</p>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </DflCard>

              {/* Step 3: Motion preset */}
              <DflCard>
                <div className="flex items-center gap-2 mb-3">
                  <StepBadge n={3} /><SectionLabel>Тип движения</SectionLabel>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MOTION_TEMPLATES.map(m => (
                    <button key={m.id} onClick={() => setSelectedMotion(m)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-150"
                      style={{
                        background: selectedMotion.id === m.id ? "rgba(139,92,246,0.1)" : "var(--dfl-surface-2)",
                        borderColor: selectedMotion.id === m.id ? "rgba(139,92,246,0.4)" : "var(--dfl-border-1)",
                        cursor: "pointer",
                      }}>
                      <span className="text-xl flex-shrink-0">{m.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: selectedMotion.id === m.id ? "#a78bfa" : "var(--dfl-text-hi)" }}>{m.label}</p>
                        <p className="text-[10px] truncate" style={{ color: "var(--dfl-text-placeholder)" }}>{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </DflCard>

              {/* Step 4: Settings */}
              <DflCard>
                <div className="flex items-center gap-2 mb-3">
                  <StepBadge n={4} /><SectionLabel>Настройки</SectionLabel>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  {/* Aspect */}
                  <div>
                    <p className="text-xs mb-2" style={{ color: "var(--dfl-text-subtle)" }}>Формат</p>
                    <div className="flex gap-1">
                      {ASPECT_RATIOS.map(r => (
                        <button key={r.id} onClick={() => setAspectRatio(r.id)} disabled={isGenerating}
                          className="flex-1 flex flex-col items-center py-2 rounded-xl border text-xs transition-all duration-150"
                          style={{
                            background: aspectRatio === r.id ? "rgba(139,92,246,0.1)" : "var(--dfl-surface-2)",
                            borderColor: aspectRatio === r.id ? "rgba(139,92,246,0.4)" : "var(--dfl-border-1)",
                            color: aspectRatio === r.id ? "#a78bfa" : "var(--dfl-text-subtle)",
                            cursor: "pointer",
                          }}>
                          <span className="font-bold">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>Длина</p>
                      <Badge color="violet">{seconds}с</Badge>
                    </div>
                    <input type="range" min={3} max={10} value={seconds}
                      onChange={e => setSeconds(Number(e.target.value))} disabled={isGenerating}
                      className="w-full" style={{ accentColor: "#8b5cf6" }} />
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px]" style={{ color: "var(--dfl-text-placeholder)" }}>3с</span>
                      <span className="text-[10px]" style={{ color: "var(--dfl-text-placeholder)" }}>10с</span>
                    </div>
                  </div>
                </div>

                {/* Custom prompt */}
                <div className="mb-3">
                  <p className="text-xs mb-2" style={{ color: "var(--dfl-text-subtle)" }}>
                    Дополнительный контекст <span style={{ color: "var(--dfl-text-placeholder)" }}>(необязательно)</span>
                  </p>
                  <textarea
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    placeholder="Фоновая локация, одежда, освещение, атмосфера..."
                    disabled={isGenerating}
                    rows={2}
                    className="w-full text-xs resize-none outline-none rounded-xl px-3 py-2 border transition-all duration-150"
                    style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-hi)", lineHeight: 1.6, fontFamily: "inherit" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--dfl-border-1)")}
                  />
                </div>

                <div className="flex items-center gap-2 px-1">
                  <Zap size={11} style={{ color: "var(--dfl-warning)" }} />
                  <span className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>
                    Стоимость: <span className="font-bold" style={{ color: "var(--dfl-warning)" }}>{cost} кр</span>
                  </span>
                  <div className="ml-auto"><Badge color="violet">Kling · Motion</Badge></div>
                </div>
              </DflCard>

              {/* Generate */}
              <button disabled={!canGenerate} onClick={handleGenerate}
                className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: canGenerate ? "linear-gradient(135deg, #7c3aed, #9333ea)" : "var(--dfl-surface-2)",
                  color: canGenerate ? "white" : "var(--dfl-text-placeholder)",
                  cursor: canGenerate ? "pointer" : "not-allowed",
                  boxShadow: canGenerate ? "0 4px 24px rgba(124,58,237,0.3)" : "none",
                  border: canGenerate ? "none" : `1px solid var(--dfl-border-1)`,
                }}>
                {isGenerating
                  ? <><Loader2 size={15} className="animate-spin" />Генерируем Motion...</>
                  : <><Play size={15} />Запустить Motion · {cost} кр</>
                }
              </button>
            </div>
          </div>

          {/* ── RIGHT: Preview / Result ── */}
          <div className="flex flex-col rounded-2xl overflow-hidden border mt-2"
            style={{ height: "calc(100vh - 78px)", background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}>
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                    style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)" }}>
                    {selectedMotion.icon}
                  </div>
                  <div className="absolute border-2 border-transparent rounded-[28px]"
                    style={{ inset: -8, borderTopColor: "#8b5cf6", borderRightColor: "#8b5cf6", animation: "spin 1s linear infinite" }} />
                </div>
                <div>
                  <p className="text-base font-semibold mb-1.5" style={{ color: "var(--dfl-text-hi)" }}>
                    {status === "uploading" ? "Загружаем фото..." : status === "pending" ? "Запускаем Motion..." : `Анимируем: ${selectedMotion.label}...`}
                  </p>
                  <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
                    Kling · {aspectLabel(aspectRatio)} · {seconds}с
                  </p>
                </div>
                <div className="w-56 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--dfl-surface-2)" }}>
                  <div className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #8b5cf6, #ec4899)", width: progress > 0 ? `${progress}%` : "25%", transition: "width 1s ease", animation: progress === 0 ? "shimmer-bar 3s ease-in-out infinite" : "none" }} />
                </div>
                {progress > 0 && <Badge color="violet">{progress}% завершено</Badge>}
              </div>
            ) : status === "done" && videoUrl ? (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-hidden" style={{ background: "#000" }}>
                  <video src={videoUrl} controls autoPlay loop muted className="w-full h-full object-contain" />
                </div>
                <div className="px-4 py-3 border-t flex-shrink-0 grid grid-cols-2 gap-2" style={{ borderColor: "var(--dfl-border-1)" }}>
                  <a href={videoUrl} download="motion-video.mp4" className="no-underline">
                    <button className="w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-150"
                      style={{ background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.3)", color: "#a78bfa", cursor: "pointer" }}>
                      <Download size={12} />Скачать MP4
                    </button>
                  </a>
                  <button onClick={() => { setStatus("idle"); setVideoUrl(null); setProgress(0); }}
                    className="h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-150"
                    style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-mid)", cursor: "pointer" }}>
                    <Film size={12} />Новый Motion
                  </button>
                </div>
              </div>
            ) : status === "error" ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="rounded-2xl flex items-center justify-center" style={{ width: 72, height: 72, background: "var(--dfl-error-muted)", border: "1px solid rgba(239,68,68,0.2)" }}>
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
              /* Idle / preview */
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                {activePhotoPreview ? (
                  <>
                    <div className="relative">
                      <div className="rounded-2xl overflow-hidden border-2" style={{ width: 160, borderColor: "rgba(139,92,246,0.5)" }}>
                        <img src={activePhotoPreview} alt="preview" className="w-full object-cover" style={{ aspectRatio: "3/4" }} />
                      </div>
                      <div className="absolute bottom-[-10px] right-[-10px] w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-lg"
                        style={{ background: "#8b5cf6" }}>
                        {selectedMotion.icon}
                      </div>
                    </div>
                    <div>
                      <p className="text-base font-semibold mb-1" style={{ color: "var(--dfl-text-hi)" }}>{selectedMotion.label}</p>
                      <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>{selectedMotion.desc}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge color="violet">🎬 Kling API</Badge>
                      <Badge color="pink">{aspectLabel(aspectRatio)}</Badge>
                      <Badge color="amber">{seconds} сек</Badge>
                    </div>
                    <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>Нажмите «Запустить Motion» для генерации</p>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl flex items-center justify-center text-4xl"
                      style={{ width: 72, height: 72, background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}>
                      {selectedMotion.icon}
                    </div>
                    <div>
                      <p className="text-base font-semibold mb-1.5" style={{ color: "var(--dfl-text-mid)" }}>Выберите фотографию</p>
                      <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>Kling анимирует человека с вашей фотографии</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge color="violet">🎬 Kling · Motion</Badge>
                      <Badge color="blue">Из библиотеки или загрузка</Badge>
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
