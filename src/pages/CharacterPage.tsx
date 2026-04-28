import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Zap, Sun, Moon, ArrowLeft, Plus, Camera, Video, Film,
  Loader2, Trash2, ImageIcon, Download, X,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  character_name: string;
  campaign_name: string;
  generations_count: number;
  status: string;
  emoji: string;
  created_at: string;
}

interface Asset {
  id: string;
  type: "photo" | "video" | "motion";
  prompt: string;
  result_url: string;
  cost: number;
  created_at: string;
  project_id: string | null;
}

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string; Icon: typeof Camera }> = {
  photo:  { label: "Фото",   color: "#60a5fa", bg: "rgba(59,130,246,0.1)",   border: "rgba(59,130,246,0.3)",   Icon: Camera },
  video:  { label: "Видео",  color: "#f472b6", bg: "rgba(236,72,153,0.1)",  border: "rgba(236,72,153,0.3)",  Icon: Video  },
  motion: { label: "Motion", color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)", Icon: Film   },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

// ── Asset Card (compact) ──────────────────────────────────────────────────────
function AssetCard({ asset, onDelete }: { asset: Asset; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const meta = TYPE_META[asset.type] ?? TYPE_META.photo;

  if (confirmDel) {
    return (
      <div className="rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-3 p-4 text-center" style={{ background: "var(--dfl-surface-1)", border: "1px solid rgba(239,68,68,0.3)", minHeight: 180 }}>
        <p className="text-xs" style={{ color: "var(--dfl-text-mid)" }}>Удалить это изображение?</p>
        <div className="flex gap-2">
          <button onClick={onDelete} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "#ef4444", color: "white" }}>Удалить</button>
          <button onClick={() => setConfirmDel(false)} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: "var(--dfl-surface-2)", color: "var(--dfl-text-lo)", border: "1px solid var(--dfl-border-1)" }}>Отмена</button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden relative cursor-pointer transition-all duration-200"
      style={{
        background: "var(--dfl-surface-1)",
        border: `1px solid ${hovered ? "var(--dfl-border-2)" : "var(--dfl-border-1)"}`,
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.2)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden" style={{ height: 180, background: "#0a0a0a" }}>
        <img src={asset.result_url} alt={asset.prompt} className="w-full h-full object-cover" loading="lazy" />
        {/* Overlay */}
        <div
          className="absolute inset-0 flex items-end justify-between p-2 transition-opacity duration-200"
          style={{ opacity: hovered ? 1 : 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }}
        >
          <a
            href={asset.result_url}
            download={`${asset.type}-${asset.id.slice(0, 8)}.png`}
            onClick={e => e.stopPropagation()}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
          >
            <Download size={12} />
          </a>
          <button
            onClick={e => { e.stopPropagation(); setConfirmDel(true); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.2)", color: "#f87171" }}
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color, backdropFilter: "blur(4px)" }}>
            <meta.Icon size={9} />{meta.label}
          </div>
        </div>
      </div>

      <div className="p-2.5">
        <p className="text-[10px] leading-relaxed" style={{ color: "var(--dfl-text-subtle)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {asset.prompt}
        </p>
        <p className="text-[9px] mt-1" style={{ color: "var(--dfl-text-placeholder)" }}>{formatDate(asset.created_at)} · {asset.cost} кр</p>
      </div>
    </div>
  );
}

// ── Characters Tab ────────────────────────────────────────────────────────────
function CharactersTab({ projects, isLoading, onDelete, onToggleStatus }: {
  projects: Project[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--dfl-surface-1)" }} />)}</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl p-10 text-center" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)", borderStyle: "dashed" }}>
        <div className="text-4xl mb-4">👤</div>
        <h3 className="font-semibold mb-2" style={{ color: "var(--dfl-text-hi)" }}>Персонажей нет</h3>
        <p className="text-sm mb-6" style={{ color: "var(--dfl-text-subtle)" }}>Создайте первого AI-инфлюенсера вашего бренда</p>
        <Link to="/character/new" className="btn-primary text-sm" style={{ textDecoration: "none" }}>Создать персонажа →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map(project => (
        <div key={project.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-2)" }}>
          {deletingId === project.id ? (
            <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <p className="text-sm flex-1" style={{ color: "var(--dfl-text-mid)" }}>
                Удалить персонажа <strong style={{ color: "var(--dfl-text-hi)" }}>«{project.character_name}»</strong>? Это действие необратимо.
              </p>
              <div className="flex gap-2">
                <button onClick={() => { onDelete(project.id); setDeletingId(null); }} className="text-sm font-semibold px-3 py-2 rounded-xl" style={{ background: "#ef4444", color: "white" }}>Удалить</button>
                <button onClick={() => setDeletingId(null)} className="text-sm px-3 py-2 rounded-xl" style={{ background: "var(--dfl-surface-2)", color: "var(--dfl-text-lo)", border: "1px solid var(--dfl-border-1)" }}>Отмена</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}>{project.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold" style={{ color: "var(--dfl-text-hi)" }}>{project.character_name}</p>
                  <button
                    onClick={() => onToggleStatus(project.id, project.status)}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full transition-all duration-150"
                    style={{ background: project.status === "active" ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)", border: `1px solid ${project.status === "active" ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`, color: project.status === "active" ? "#4ade80" : "#fbbf24" }}
                  >
                    ● {project.status === "active" ? "Активный" : "Пауза"}
                  </button>
                </div>
                <p className="text-xs mt-0.5" style={{ color: "var(--dfl-text-subtle)" }}>{project.campaign_name} · {project.generations_count} генераций</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Link to={`/generate/photo?project=${project.id}`} title="Генерация фото" className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)", color: "var(--dfl-text-subtle)" }}><Camera size={13} /></Link>
                <Link to={`/generate/video?project=${project.id}`} title="Генерация видео" className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)", color: "var(--dfl-text-subtle)" }}><Video size={13} /></Link>
                <Link to={`/generate/motion?project=${project.id}`} title="Motion" className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)", color: "var(--dfl-text-subtle)" }}><Film size={13} /></Link>
                <button onClick={() => setDeletingId(project.id)} title="Удалить" className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}><Trash2 size={13} /></button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Generations Tab ───────────────────────────────────────────────────────────
function GenerationsTab({ userId, projects }: { userId: string; projects: Project[] }) {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["generated-assets", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_assets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Asset[];
    },
    enabled: !!userId,
  });

  const { mutate: deleteAsset } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("generated_assets").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-assets", userId] });
      toast.success("Удалено");
    },
    onError: () => toast.error("Ошибка удаления"),
  });

  const TYPE_FILTERS = [
    { id: "all", label: "Все" },
    { id: "photo", label: "Фото" },
    { id: "video", label: "Видео" },
    { id: "motion", label: "Motion" },
  ];

  const filtered = typeFilter === "all" ? assets : assets.filter(a => a.type === typeFilter);

  return (
    <div>
      {/* Filters + stats row */}
      <div className="flex items-center justify-between mb-5">
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
        <p className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
          {isLoading ? "..." : `${filtered.length} генераций`}
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "var(--dfl-surface-1)" }} />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-2xl p-10 text-center" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)", borderStyle: "dashed" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--dfl-surface-2)" }}>
            <ImageIcon size={24} style={{ color: "var(--dfl-text-placeholder)" }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: "var(--dfl-text-mid)" }}>
            {assets.length === 0 ? "Генераций ещё нет" : "Ничего по фильтру"}
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--dfl-text-placeholder)" }}>
            {assets.length === 0 ? "Создайте первое фото вашего персонажа" : "Попробуйте другой тип"}
          </p>
          {assets.length === 0 && (
            <Link to="/generate/photo" className="btn-primary text-sm" style={{ textDecoration: "none" }}>
              Генерировать фото →
            </Link>
          )}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map(asset => (
            <AssetCard key={asset.id} asset={asset} onDelete={() => deleteAsset(asset.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Character Page ───────────────────────────────────────────────────────
export default function CharacterPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"characters" | "generations">("characters");

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["user-projects", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const { mutate: deleteProject } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_projects").delete().eq("id", id).eq("user_id", user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-projects", user?.id] });
      toast.success("Персонаж удалён");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === "active" ? "paused" : "active";
      const { error } = await supabase.from("user_projects").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-projects", user?.id] }),
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    totalGens: projects.reduce((s, p) => s + p.generations_count, 0),
  };

  const TABS = [
    { id: "characters" as const, label: "Персонажи" },
    { id: "generations" as const, label: "Мои генерации" },
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
        <Link to="/character/new" className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5" style={{ borderRadius: "0.75rem" }}>
          <Plus size={13} />Новый персонаж
        </Link>
        <button onClick={toggleTheme} className="theme-toggle" style={{ width: 36, height: 36 }}>
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display font-bold mb-1" style={{ fontSize: "clamp(1.3rem,3vw,1.6rem)", color: "var(--dfl-text-hi)" }}>
            Мои персонажи
          </h1>
          <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
            Управляйте AI-инфлюенсерами вашего бренда
          </p>
        </div>

        {/* Stats */}
        {activeTab === "characters" && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Всего", value: stats.total },
              { label: "Активных", value: stats.active, color: "#22c55e" },
              { label: "Генераций", value: stats.totalGens },
            ].map(s => (
              <div key={s.label} className="rounded-2xl px-4 py-3.5 text-center" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}>
                <p className="font-display font-bold text-2xl" style={{ color: s.color ?? "var(--dfl-text-hi)" }}>
                  {isLoading ? "—" : s.value}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--dfl-text-placeholder)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-5 inline-flex" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: activeTab === tab.id ? "var(--dfl-accent-muted)" : "transparent",
                border: activeTab === tab.id ? "1px solid var(--dfl-border-2)" : "1px solid transparent",
                color: activeTab === tab.id ? "var(--dfl-accent-bright)" : "var(--dfl-text-subtle)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "characters" && (
          <CharactersTab
            projects={projects}
            isLoading={isLoading}
            onDelete={(id) => deleteProject(id)}
            onToggleStatus={(id, status) => toggleStatus({ id, status })}
          />
        )}

        {activeTab === "generations" && user?.id && (
          <GenerationsTab userId={user.id} projects={projects} />
        )}
      </main>
    </div>
  );
}
