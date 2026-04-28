import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Zap, Sun, Moon, ArrowLeft, Download, X, Calendar, Camera,
  Video, Film, Loader2, ImageIcon, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Asset {
  id: string;
  type: "photo" | "video" | "motion";
  prompt: string;
  result_url: string;
  cost: number;
  status: string;
  created_at: string;
  project_id: string | null;
}

interface Project { id: string; character_name: string; emoji: string; }

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string; Icon: typeof Camera }> = {
  photo:  { label: "Фото",   color: "#60a5fa", bg: "rgba(59,130,246,0.1)",   border: "rgba(59,130,246,0.3)",   Icon: Camera },
  video:  { label: "Видео",  color: "#f472b6", bg: "rgba(236,72,153,0.1)",  border: "rgba(236,72,153,0.3)",  Icon: Video  },
  motion: { label: "Motion", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)", Icon: Film   },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
interface LightboxProps {
  assets: Asset[];
  index: number;
  projects: Project[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onNav: (idx: number) => void;
}

function Lightbox({ assets, index, projects, onClose, onDelete, onNav }: LightboxProps) {
  const asset = assets[index];
  const project = projects.find(p => p.id === asset.project_id);
  const meta = TYPE_META[asset.type] ?? TYPE_META.photo;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onNav(index - 1);
      if (e.key === "ArrowRight" && index < assets.length - 1) onNav(index + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index, assets.length, onClose, onNav]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
        style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
      >
        <X size={18} />
      </button>

      {/* Nav prev */}
      {index > 0 && (
        <button
          onClick={e => { e.stopPropagation(); onNav(index - 1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
          style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Nav next */}
      {index < assets.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); onNav(index + 1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
          style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Content */}
      <div
        className="relative flex flex-col lg:flex-row gap-0 rounded-3xl overflow-hidden max-w-5xl w-full max-h-[90vh]"
        style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="flex-1 flex items-center justify-center bg-black overflow-hidden" style={{ minHeight: 300, maxHeight: "75vh" }}>
          <img
            src={asset.result_url}
            alt={asset.prompt}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-4 p-5 lg:w-64 flex-shrink-0 overflow-y-auto">
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}>
              <meta.Icon size={10} />{meta.label}
            </div>
            {project && (
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--dfl-text-subtle)" }}>
                <span>{project.emoji}</span>
                <span className="truncate max-w-[80px]">{project.character_name}</span>
              </div>
            )}
          </div>

          {/* Prompt */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: "var(--dfl-text-placeholder)" }}>Промпт</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--dfl-text-mid)" }}>{asset.prompt}</p>
          </div>

          {/* Meta */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--dfl-text-subtle)" }}>
              <Calendar size={11} />{formatDate(asset.created_at)}
            </div>
            <div className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>Стоимость: {asset.cost} кр</div>
          </div>

          <div className="flex flex-col gap-2 mt-auto">
            <a
              href={asset.result_url}
              download={`${asset.type}-${asset.id.slice(0, 8)}.png`}
              className="flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all"
              style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)", color: "var(--dfl-accent-bright)", textDecoration: "none" }}
            >
              <Download size={13} />Скачать
            </a>
            <button
              onClick={() => { onDelete(asset.id); onClose(); }}
              className="flex items-center justify-center gap-2 text-xs py-2 rounded-xl transition-all"
              style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}
            >
              <Trash2 size={12} />Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Gallery Card ──────────────────────────────────────────────────────────────
function GalleryCard({ asset, project, onClick }: { asset: Asset; project?: Project; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const meta = TYPE_META[asset.type] ?? TYPE_META.photo;

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
      style={{
        background: "var(--dfl-surface-1)",
        border: `1px solid ${hovered ? "var(--dfl-border-2)" : "var(--dfl-border-1)"}`,
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.25)" : "none",
        breakInside: "avoid",
        marginBottom: 12,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={asset.result_url}
        alt={asset.prompt}
        className="w-full object-cover block"
        style={{ minHeight: 120 }}
        loading="lazy"
      />
      {/* Overlay on hover */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-3 transition-opacity duration-200"
        style={{ opacity: hovered ? 1 : 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}>
            <meta.Icon size={9} />{meta.label}
          </div>
          {project && <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.7)" }}>{project.emoji} {project.character_name}</span>}
        </div>
        <p className="text-[10px] text-white leading-tight" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {asset.prompt}
        </p>
      </div>

      {/* Type badge (always visible) */}
      <div className="absolute top-2 left-2">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(0,0,0,0.6)", color: "white", backdropFilter: "blur(6px)" }}>
          <meta.Icon size={9} />{meta.label}
        </div>
      </div>
    </div>
  );
}

// ── Main Gallery Page ─────────────────────────────────────────────────────────
export default function GalleryPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isDark = theme === "dark";

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fetch assets
  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["generated-assets", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("generated_assets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Asset[];
    },
    enabled: !!user?.id,
  });

  // Fetch projects for labels
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["user-projects", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from("user_projects").select("id, character_name, emoji").eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  // Delete mutation
  const { mutate: deleteAsset } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("generated_assets").delete().eq("id", id).eq("user_id", user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-assets", user?.id] });
      toast.success("Удалено");
    },
    onError: () => toast.error("Ошибка удаления"),
  });

  const filtered = assets.filter(a => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (projectFilter !== "all" && a.project_id !== projectFilter) return false;
    return true;
  });

  // Split into 3 columns for masonry
  const col1 = filtered.filter((_, i) => i % 3 === 0);
  const col2 = filtered.filter((_, i) => i % 3 === 1);
  const col3 = filtered.filter((_, i) => i % 3 === 2);

  const TYPE_FILTERS = [
    { id: "all", label: "Все" },
    { id: "photo", label: "Фото" },
    { id: "video", label: "Видео" },
    { id: "motion", label: "Motion" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--dfl-bg)" }}>
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 sm:px-6 border-b" style={{ height: 64, background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}>
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm" style={{ color: "var(--dfl-text-lo)" }}>
          <ArrowLeft size={15} /><span className="hidden sm:inline">Дашборд</span>
        </Link>
        <div className="w-px h-5" style={{ background: "var(--dfl-border-2)" }} />
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
            <Zap size={11} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm hidden sm:block">
            <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
            <span className="text-accent-gradient">Лабс</span>
          </span>
        </Link>
        <div className="flex-1" />
        <button onClick={toggleTheme} className="theme-toggle" style={{ width: 36, height: 36 }}>
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-bold mb-1" style={{ fontSize: "clamp(1.3rem,3vw,1.6rem)", color: "var(--dfl-text-hi)" }}>
              Галерея
            </h1>
            <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
              {isLoading ? "Загрузка..." : `${filtered.length} из ${assets.length} изображений`}
            </p>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-3">
            {["photo", "video", "motion"].map(type => {
              const count = assets.filter(a => a.type === type).length;
              const meta = TYPE_META[type];
              return (
                <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                  <meta.Icon size={11} style={{ color: meta.color }} />
                  <span style={{ color: meta.color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Type filter */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}>
            {TYPE_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                style={{
                  background: typeFilter === f.id ? "var(--dfl-accent-muted)" : "transparent",
                  border: typeFilter === f.id ? "1px solid var(--dfl-border-2)" : "1px solid transparent",
                  color: typeFilter === f.id ? "var(--dfl-accent-bright)" : "var(--dfl-text-subtle)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Project filter */}
          {projects.length > 0 && (
            <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}>
              <button
                onClick={() => setProjectFilter("all")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap"
                style={{
                  background: projectFilter === "all" ? "var(--dfl-accent-muted)" : "transparent",
                  border: projectFilter === "all" ? "1px solid var(--dfl-border-2)" : "1px solid transparent",
                  color: projectFilter === "all" ? "var(--dfl-accent-bright)" : "var(--dfl-text-subtle)",
                }}
              >
                Все персонажи
              </button>
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setProjectFilter(p.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap"
                  style={{
                    background: projectFilter === p.id ? "var(--dfl-accent-muted)" : "transparent",
                    border: projectFilter === p.id ? "1px solid var(--dfl-border-2)" : "1px solid transparent",
                    color: projectFilter === p.id ? "var(--dfl-accent-bright)" : "var(--dfl-text-subtle)",
                  }}
                >
                  {p.emoji} {p.character_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin" style={{ color: "var(--dfl-text-placeholder)" }} />
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-2xl p-12 text-center" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)", borderStyle: "dashed" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}>
              <ImageIcon size={28} style={{ color: "var(--dfl-text-placeholder)" }} />
            </div>
            <h3 className="font-semibold mb-2" style={{ color: "var(--dfl-text-hi)" }}>
              {assets.length === 0 ? "Генераций ещё нет" : "Ничего не найдено"}
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--dfl-text-subtle)" }}>
              {assets.length === 0
                ? "Создайте первое изображение вашего AI-инфлюенсера"
                : "Попробуйте сбросить фильтры"}
            </p>
            {assets.length === 0 && (
              <Link to="/generate/photo" className="btn-primary text-sm" style={{ textDecoration: "none" }}>
                Создать фото →
              </Link>
            )}
            {assets.length > 0 && (
              <button onClick={() => { setTypeFilter("all"); setProjectFilter("all"); }} className="text-sm" style={{ color: "var(--dfl-accent-bright)" }}>
                Сбросить фильтры
              </button>
            )}
          </div>
        )}

        {/* Masonry grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" style={{ alignItems: "start" }}>
            {[col1, col2, col3].map((col, ci) => (
              <div key={ci}>
                {col.map(asset => (
                  <GalleryCard
                    key={asset.id}
                    asset={asset}
                    project={projects.find(p => p.id === asset.project_id)}
                    onClick={() => {
                      const globalIdx = filtered.indexOf(asset);
                      setLightboxIndex(globalIdx);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          assets={filtered}
          index={lightboxIndex}
          projects={projects}
          onClose={() => setLightboxIndex(null)}
          onDelete={(id) => deleteAsset(id)}
          onNav={setLightboxIndex}
        />
      )}
    </div>
  );
}
