import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap, Sun, Moon, Search, Bell, ChevronRight, Plus, LayoutDashboard,
  FileText, User, Camera, Video, Film, Menu, X, LogOut, Settings,
  CreditCard, TrendingUp, AlertTriangle, CheckCircle2, Clock,
  Loader2, ChevronDown, Package, FolderOpen, Sparkles, Headphones, Bug,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingModal, { isOnboardingDone } from "@/components/features/OnboardingModal";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type DashTab = "balance" | "projects" | "history";

interface DBProject {
  id: string;
  character_name: string;
  campaign_name: string;
  generations_count: number;
  status: string;
  emoji: string;
}

interface DBNotification {
  id: string;
  type: string;
  text: string;
  read: boolean;
  created_at: string;
}

interface DBTransaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  created_at: string;
}

interface DBAsset {
  id: string;
  type: string;
  prompt: string;
  status: string;
  created_at: string;
}

// ── Transaction type meta ────────────────────────────────────────────────────
const TX_TYPE_META: Record<string, { icon: string; label: string }> = {
  photo:     { icon: "📸", label: "Фото" },
  video:     { icon: "🎬", label: "Видео" },
  motion:    { icon: "🎭", label: "Motion" },
  character: { icon: "👤", label: "Персонаж" },
  topup:     { icon: "⚡", label: "Пополнение" },
  bonus:     { icon: "🎁", label: "Бонус" },
};

function getTxMeta(type: string) {
  return TX_TYPE_META[type] ?? { icon: "💳", label: type };
}

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Вчера";
  return `${days} д назад`;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Дашборд", Icon: LayoutDashboard, href: "/dashboard" },
  { id: "brief",     label: "Бренд-бриф", Icon: FileText, href: "/brand-brief" },
  { id: "character", label: "Персонаж", Icon: User, href: "/character" },
  { id: "photo",     label: "Фото", Icon: Camera, href: "/generate/photo" },
  { id: "video",     label: "Видео", Icon: Video, href: "/generate/video" },
  { id: "motion",    label: "Motion", Icon: Film, href: "/generate/motion" },
  { id: "projects",  label: "Проекты", Icon: FolderOpen, href: "/projects" },
];

const QUICK_ACTIONS = [
  { label: "Мои проекты",    Icon: FolderOpen, cost: "все персонажи", href: "/projects",         color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/25" },
  { label: "Генерация фото", Icon: Camera,     cost: "от 80 кр",     href: "/generate/photo",   color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/25" },
  { label: "Видео",          Icon: Video,      cost: "от 150 кр",    href: "/generate/video",   color: "text-pink-400",   bg: "bg-pink-500/10 border-pink-500/25" },
  { label: "Motion Control", Icon: Film,       cost: "от 240 кр",    href: "/generate/motion",  color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/25" },
];

// ── Dropdown (portal-free, state-driven) ──────────────────────────────────────
function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

// ── Notifications Dropdown ────────────────────────────────────────────────────
interface NotifDropdownProps {
  notifications: DBNotification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  isMarkingRead: boolean;
  isLoading: boolean;
}

function NotificationsDropdown({ notifications, unreadCount, onMarkAllRead, isMarkingRead, isLoading }: NotifDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-150"
        style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-lo)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-2)"; (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-hi)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-1)"; (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-lo)"; }}
        aria-label="Уведомления"
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 border-2" style={{ borderColor: "var(--dfl-bg)" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 z-50 w-80 rounded-2xl shadow-2xl border overflow-hidden"
          style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-2)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--dfl-border-1)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--dfl-text-hi)" }}>Уведомления</span>
            <button
              onClick={onMarkAllRead}
              disabled={isMarkingRead || notifications.every(n => n.read)}
              className="text-xs px-2 py-1 rounded-lg transition-colors disabled:opacity-40"
              style={{ color: "var(--dfl-accent-bright)", background: "var(--dfl-accent-muted)" }}
            >
              {isMarkingRead ? "Помечаем..." : "Прочитать все"}
            </button>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
                Уведомлений нет
              </div>
            ) : notifications.map(n => {
              const diff = Date.now() - new Date(n.created_at).getTime();
              const mins = Math.floor(diff / 60000);
              const ago = mins < 60 ? `${mins} мин` : mins < 1440 ? `${Math.floor(mins / 60)} ч` : `${Math.floor(mins / 1440)} д`;
              return (
                <div
                  key={n.id}
                  className="px-4 py-3 flex gap-3 items-start cursor-pointer transition-colors"
                  style={{ background: n.read ? "transparent" : "var(--dfl-accent-muted-2)", borderBottom: "1px solid var(--dfl-border-1)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-2)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.read ? "transparent" : "var(--dfl-accent-muted-2)"}
                >
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.read ? "var(--dfl-text-subtle)" : "var(--dfl-accent)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug" style={{ color: "var(--dfl-text-hi)" }}>{n.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--dfl-text-subtle)" }}>{ago} назад</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-2.5" style={{ borderTop: "1px solid var(--dfl-border-1)" }}>
            <button className="w-full text-center text-xs py-1 rounded-lg transition-colors" style={{ color: "var(--dfl-accent-bright)" }}
              onClick={() => setOpen(false)}>
              Посмотреть все →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Create Dropdown ───────────────────────────────────────────────────────────
function CreateDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useClickOutside(ref, () => setOpen(false));

  const items = [
    { label: "Фото · от 80 кр",    href: "/generate/photo",  Icon: Camera,    color: "text-blue-400" },
    { label: "Видео · от 150 кр",  href: "/generate/video",  Icon: Video,     color: "text-pink-400" },
    { label: "Motion · от 240 кр", href: "/generate/motion", Icon: Film,      color: "text-violet-400" },
    { divider: true },
    { label: "Мои проекты",        href: "/projects",         Icon: FolderOpen, color: "text-gray-400" },
    { label: "Новый персонаж",     href: "/character/new",    Icon: User,       color: "text-gray-400" },
  ] as const;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 shadow-lg"
        style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)", boxShadow: "0 2px 8px rgba(37,99,235,0.35)" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(37,99,235,0.5)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(37,99,235,0.35)"}
      >
        <Plus size={14} />
        <span className="hidden sm:inline">Создать</span>
        <ChevronDown size={11} className="opacity-70" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 z-50 w-52 rounded-2xl shadow-2xl border py-1.5 overflow-hidden"
          style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-2)" }}
        >
          {items.map((item, i) => {
            if ("divider" in item) {
              return <div key={i} className="my-1 h-px mx-3" style={{ background: "var(--dfl-border-1)" }} />;
            }
            return (
              <button
                key={item.href}
                onClick={() => { navigate(item.href); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left"
                style={{ color: "var(--dfl-text-mid)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-2)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <item.Icon size={13} className={item.color} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Burger Menu ───────────────────────────────────────────────────────────────
function BurgerMenu({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useClickOutside(ref, () => setOpen(false));

  const items = [
    { label: "Тарифы",               href: "/pricing",         Icon: TrendingUp, special: false },
    { label: "История пополнений",   href: "/balance/history", Icon: CreditCard, special: false },
    { label: "Настройки",            href: "/settings",        Icon: Settings,   special: false },
    { label: "Тех. поддержка",       href: "/support",         Icon: Headphones, special: true  },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-150"
        style={{ background: "var(--dfl-surface-2)", borderColor: open ? "var(--dfl-border-2)" : "var(--dfl-border-1)", color: "var(--dfl-text-lo)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-2)"; (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-hi)"; }}
        onMouseLeave={e => { if (!open) { (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-1)"; (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-lo)"; } }}
        aria-label="Меню"
      >
        <Menu size={15} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 z-50 w-48 rounded-2xl shadow-2xl border py-1.5 overflow-hidden"
          style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-2)" }}
        >
          {items.filter(i => !i.special).map(item => (
            <button
              key={item.href}
              onClick={() => { navigate(item.href); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left"
              style={{ color: "var(--dfl-text-mid)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-2)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              <item.Icon size={13} style={{ color: "var(--dfl-text-subtle)" }} />
              {item.label}
            </button>
          ))}
          <div className="my-1 h-px mx-3" style={{ background: "var(--dfl-border-1)" }} />
          {/* Support — highlighted */}
          {items.filter(i => i.special).map(item => (
            <button
              key={item.href}
              onClick={() => { navigate(item.href); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left mx-1 rounded-xl"
              style={{ color: "#60a5fa", background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)", width: "calc(100% - 8px)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.12)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.06)"}
            >
              <item.Icon size={13} style={{ color: "#60a5fa" }} />
              <span className="flex-1">{item.label}</span>
              <Bug size={10} style={{ color: "#f87171", opacity: 0.8 }} />
            </button>
          ))}
          <div className="my-1 h-px mx-3" style={{ background: "var(--dfl-border-1)" }} />
          <button
            onClick={async () => { setOpen(false); await onLogout(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left text-red-400 hover:text-red-300"
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.07)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            <LogOut size={13} />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  activeNav: string;
  onNavClick: (id: string) => void;
  username?: string;
}

function Sidebar({ collapsed, mobileOpen, onCloseMobile, activeNav, onNavClick, username }: SidebarProps) {
  const groups = [
    { label: "",           ids: ["dashboard"] },
    { label: "ПРОЕКТ",     ids: ["brief", "character"] },
    { label: "ГЕНЕРАЦИЯ",  ids: ["photo", "video", "motion", "projects"] },
  ];

  const content = (
    <div className="flex flex-col h-full">
      {/* User info */}
      <div className="flex items-center gap-3 px-3 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--dfl-border-1)", minHeight: 64 }}>
        <div className={cn(
          "flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-sm text-white",
          collapsed ? "w-8 h-8" : "w-8 h-8"
        )} style={{ background: "linear-gradient(135deg,#2563eb,#6366f1)" }}>
          {(username?.[0] || "U").toUpperCase()}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--dfl-text-hi)" }}>{username || "Пользователь"}</p>
            <p className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>Free · 1 проект</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
        {groups.map(group => (
          <div key={group.label} className="mb-1">
            {group.label && !collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5" style={{ color: "var(--dfl-text-placeholder)" }}>
                {group.label}
              </p>
            )}
            {NAV_ITEMS.filter(n => group.ids.includes(n.id)).map(item => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavClick(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "w-full flex items-center rounded-xl mb-0.5 transition-all duration-120",
                    collapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2",
                    isActive ? "font-medium" : "font-normal"
                  )}
                  style={{
                    background: isActive ? "var(--dfl-accent-muted)" : "transparent",
                    color: isActive ? "var(--dfl-accent-bright)" : "var(--dfl-text-subtle)",
                    border: isActive ? "1px solid var(--dfl-border-2)" : "1px solid transparent",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-2)"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <item.Icon size={15} className="flex-shrink-0" />
                  {!collapsed && <span className="text-sm truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div
        className="hidden md:flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden h-screen sticky top-0"
        style={{
          width: collapsed ? 60 : 224,
          background: "var(--dfl-surface-1)",
          borderRight: "1px solid var(--dfl-border-1)",
        }}
      >
        {content}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div
            className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col"
            style={{
              background: "var(--dfl-surface-1)",
              borderRight: "1px solid var(--dfl-border-2)",
              animation: "sidebarSlideIn 280ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--dfl-border-1)" }}>
              <span className="text-sm font-bold" style={{ color: "var(--dfl-text-hi)" }}>Меню</span>
              <button onClick={onCloseMobile} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors" style={{ color: "var(--dfl-text-subtle)", background: "var(--dfl-surface-2)" }}>
                <X size={13} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">{content}</div>
          </div>
        </>
      )}
    </>
  );
}

// ── Quick Action Card ─────────────────────────────────────────────────────────
function QuickActionCard({ action }: { action: typeof QUICK_ACTIONS[0] }) {
  return (
    <Link to={action.href} className="block rounded-2xl p-4 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group no-underline" style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-2)"}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-1)"}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border mb-3", action.bg)}>
        <action.Icon size={17} className={action.color} />
      </div>
      <p className="text-sm font-semibold" style={{ color: "var(--dfl-text-hi)" }}>{action.label}</p>
      <p className="text-xs mt-0.5" style={{ color: "var(--dfl-text-subtle)" }}>{action.cost}</p>
    </Link>
  );
}

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: DBProject }) {
  return (
    <Link
      to={`/projects/${project.id}/overview`}
      className="block rounded-2xl p-4 border transition-all duration-150 hover:border-[var(--dfl-border-2)] no-underline"
      style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}>
          {project.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate" style={{ color: "var(--dfl-text-hi)" }}>{project.character_name}</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-green-400" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}>
              {project.status}
            </span>
          </div>
          <p className="text-xs truncate mt-0.5" style={{ color: "var(--dfl-text-subtle)" }}>
            {project.campaign_name} · {project.generations_count} генераций
          </p>
        </div>
        <ChevronRight size={14} style={{ color: "var(--dfl-text-placeholder)" }} className="flex-shrink-0" />
      </div>
    </Link>
  );
}

// ── History Row ───────────────────────────────────────────────────────────────
function HistoryRow({ item }: { item: DBTransaction }) {
  const meta = getTxMeta(item.type);
  const isCredit = item.amount > 0;
  return (
    <div className="flex items-center gap-3 rounded-2xl p-3 border" style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--dfl-text-hi)" }}>{meta.label} · {item.description}</p>
        <p className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>{formatTimeAgo(item.created_at)}</p>
      </div>
      <span className="text-sm font-bold flex-shrink-0" style={{ color: isCredit ? "var(--dfl-success)" : "var(--dfl-error)" }}>
        {isCredit ? "+" : ""}{item.amount} кр
      </span>
    </div>
  );
}

// ── Subscription Block ────────────────────────────────────────────────────────
function SubscriptionBlock({ credits }: { credits: number | null }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl p-4 border" style={{ background: "var(--dfl-accent-muted-2)", borderColor: "var(--dfl-border-2)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--dfl-accent-muted)", border: "1px solid var(--dfl-border-2)" }}>
        <Sparkles size={17} style={{ color: "var(--dfl-accent-bright)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold" style={{ color: "var(--dfl-text-hi)" }}>Тариф Free</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "var(--dfl-accent-muted)", color: "var(--dfl-accent-bright)", border: "1px solid var(--dfl-border-2)" }}>Бесплатный</span>
        </div>
        <p className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>
          Баланс: <span className="font-semibold">{credits === null ? "..." : `${credits.toLocaleString()} кр`}</span> · Следующее списание: —
        </p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <button disabled className="h-8 px-3 rounded-xl text-xs font-semibold opacity-50 cursor-not-allowed" style={{ background: "var(--dfl-surface-2)", color: "var(--dfl-text-subtle)", border: "1px solid var(--dfl-border-1)" }}>
          Скоро
        </button>
        <span className="text-[10px]" style={{ color: "var(--dfl-text-placeholder)" }}>soon</span>
      </div>
    </div>
  );
}

// ── Balance Block ─────────────────────────────────────────────────────────────
function BalanceBlock({ points, isLow }: { points: number | null; isLow: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl p-4 border" style={{ background: isLow ? "var(--dfl-warning-muted)" : "var(--dfl-surface-1)", borderColor: isLow ? "rgba(245,158,11,0.35)" : "var(--dfl-border-1)" }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isLow ? "rgba(245,158,11,0.15)" : "var(--dfl-accent-muted)", border: `1px solid ${isLow ? "rgba(245,158,11,0.35)" : "var(--dfl-border-2)"}` }}>
        <Zap size={20} style={{ color: isLow ? "var(--dfl-warning)" : "var(--dfl-accent-bright)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--dfl-text-subtle)" }}>Баланс кредитов</p>
        <div className="flex items-baseline gap-1.5">
          {points === null ? (
            <div className="h-7 w-20 rounded-lg animate-pulse" style={{ background: "var(--dfl-surface-2)" }} />
          ) : (
            <>
              <span className="text-3xl font-bold leading-none" style={{ color: isLow ? "var(--dfl-warning)" : "var(--dfl-text-hi)" }}>{points.toLocaleString()}</span>
              <span className="text-base" style={{ color: "var(--dfl-text-subtle)" }}>кр</span>
            </>
          )}
        </div>
        {isLow && (
          <div className="flex items-center gap-1 mt-1">
            <AlertTriangle size={11} style={{ color: "var(--dfl-warning)" }} />
            <span className="text-xs" style={{ color: "var(--dfl-warning)" }}>Недостаточно кредитов</span>
          </div>
        )}
      </div>
      <Link to="/balance/history" className="no-underline">
        <button className="h-8 px-3 rounded-xl text-xs font-semibold border transition-all duration-150" style={{ background: "var(--dfl-surface-2)", color: isLow ? "var(--dfl-warning)" : "var(--dfl-accent-bright)", borderColor: isLow ? "rgba(245,158,11,0.35)" : "var(--dfl-border-2)" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-3)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-2)"}>
          История →
        </button>
      </Link>
    </div>
  );
}

// ── Active Tasks ──────────────────────────────────────────────────────────────
function ActiveTasks({ tasks }: { tasks: DBAsset[] }) {
  if (tasks.length === 0) return null;
  return (
    <div className="rounded-2xl p-4 border" style={{ background: "var(--dfl-accent-muted-2)", borderColor: "var(--dfl-border-2)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Loader2 size={13} className="animate-spin" style={{ color: "var(--dfl-accent-bright)" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--dfl-accent-bright)" }}>Активные задачи</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--dfl-accent-muted)", color: "var(--dfl-accent-bright)", border: "1px solid var(--dfl-border-2)" }}>{tasks.length}</span>
      </div>
      <div className="space-y-2">
        {tasks.map(task => {
          const meta = getTxMeta(task.type);
          const isProcessing = task.status === "processing";
          return (
            <div key={task.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs truncate flex-1" style={{ color: "var(--dfl-text-mid)" }}>
                  {meta.icon} {meta.label} · {task.prompt.slice(0, 40)}{task.prompt.length > 40 ? "..." : ""}
                </span>
                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: "var(--dfl-accent-muted)", color: "var(--dfl-accent-bright)" }}>
                  {isProcessing ? "Обработка" : "В очереди"}
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--dfl-surface-2)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: isProcessing ? "60%" : "10%", background: "linear-gradient(90deg,#3b82f6,#6366f1)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Empty Dashboard ───────────────────────────────────────────────────────────
function EmptyDashboard({ onStartOnboarding }: { onStartOnboarding: () => void }) {
  return (
    <div className="rounded-2xl border p-8 text-center" style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)", borderStyle: "dashed" }}>
      <div className="text-5xl mb-4">👋</div>
      <h2 className="text-lg font-bold mb-2" style={{ color: "var(--dfl-text-hi)" }}>Добро пожаловать в КовальЛабс!</h2>
      <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--dfl-text-subtle)" }}>
        Начните с создания вашего первого AI‑инфлюенсера. Стартовый бонус 500 кредитов уже на балансе.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={onStartOnboarding}
          className="h-10 px-5 rounded-xl text-sm font-semibold text-white transition-all duration-150"
          style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)", boxShadow: "0 2px 8px rgba(37,99,235,0.35)" }}
        >
          Быстрый старт →
        </button>
        <Link to="/character/new" className="no-underline">
          <button className="h-10 px-5 rounded-xl text-sm font-semibold border transition-all duration-150" style={{ background: "var(--dfl-surface-2)", color: "var(--dfl-text-hi)", borderColor: "var(--dfl-border-2)" }}>
            Создать персонажа
          </button>
        </Link>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-xl animate-pulse", className)} style={{ background: "var(--dfl-surface-2)" }} />;
}

// ── Projects Tab ──────────────────────────────────────────────────────────────
function ProjectsTab({ projects, isLoading }: { projects: DBProject[]; isLoading: boolean }) {
  if (isLoading) return <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-16" />)}</div>;
  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border p-6 text-center" style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)", borderStyle: "dashed" }}>
        <p className="text-sm mb-3" style={{ color: "var(--dfl-text-subtle)" }}>У вас пока нет проектов.</p>
        <Link to="/character/new" className="no-underline">
          <button className="h-8 px-4 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)" }}>Создать персонажа →</button>
        </Link>
      </div>
    );
  }
  return <div className="space-y-2">{projects.map(p => <ProjectCard key={p.id} project={p} />)}</div>;
}

// ── History Tab ───────────────────────────────────────────────────────────────
function HistoryTab({ transactions, isLoading }: { transactions: DBTransaction[]; isLoading: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs" style={{ color: "var(--dfl-text-subtle)" }}>
          {isLoading ? "Загрузка..." : `${transactions.length} последних транзакций`}
        </p>
        <Link to="/balance/history" className="no-underline">
          <button className="text-xs transition-colors" style={{ color: "var(--dfl-accent-bright)" }}>Полная история →</button>
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
      ) : transactions.length === 0 ? (
        <div className="rounded-2xl border p-6 text-center" style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)", borderStyle: "dashed" }}>
          <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>Транзакций пока нет.</p>
        </div>
      ) : (
        <div className="space-y-2">{transactions.map(item => <HistoryRow key={item.id} item={item} />)}</div>
      )}
    </div>
  );
}

// ── Main Dashboard Page ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDark = theme === "dark";

  const [activeNav, setActiveNav] = useState("dashboard");
  const [activeTab, setActiveTab] = useState<DashTab>("balance");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ── Queries ──
  const { data: balanceData, isLoading: balanceLoading } = useQuery<{ points: number } | null>({
    queryKey: ["user-balance", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from("user_balances").select("points").eq("user_id", user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<DBProject[]>({
    queryKey: ["user-projects", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from("user_projects").select("id, character_name, campaign_name, generations_count, status, emoji").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery<DBTransaction[]>({
    queryKey: ["balance-transactions-dash", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from("balance_transactions").select("id, type, description, amount, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const { data: activeTasks = [] } = useQuery<DBAsset[]>({
    queryKey: ["active-tasks", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from("generated_assets").select("id, type, prompt, status, created_at").eq("user_id", user.id).in("status", ["pending", "processing"]).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: 15_000,
    refetchInterval: 15_000,
  });

  const { data: notifications = [], isLoading: notifsLoading } = useQuery<DBNotification[]>({
    queryKey: ["user-notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase.from("user_notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchInterval: 30_000,
  });

  const { mutate: markAllRead, isPending: isMarkingRead } = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const ids = notifications.filter(n => !n.read).map(n => n.id);
      if (!ids.length) return;
      const { error } = await supabase.from("user_notifications").update({ read: true }).in("id", ids).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-notifications", user?.id] }),
  });

  const points = balanceData?.points ?? (balanceLoading ? null : null);
  const isNew = !balanceLoading && !projectsLoading && points !== null && projects.length === 0;
  const isLow = points !== null && points < 100;
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (isNew && !isOnboardingDone()) {
      const t = setTimeout(() => setShowOnboarding(true), 600);
      return () => clearTimeout(t);
    }
  }, [isNew]);

  const handleNavClick = (id: string) => {
    const item = NAV_ITEMS.find(n => n.id === id);
    if (item && item.href !== "/dashboard") {
      navigate(item.href);
    } else {
      setActiveNav(id);
    }
    setMobileSidebarOpen(false);
  };

  const handleLogout = async () => { await logout(); navigate("/auth/login"); };

  // ── Tab definitions ──
  const tabs: { id: DashTab; label: string; Icon: typeof Zap }[] = [
    { id: "balance",  label: "Баланс",  Icon: Zap },
    { id: "projects", label: "Проекты", Icon: Package },
    { id: "history",  label: "История", Icon: Clock },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--dfl-bg)" }}>
      <style>{`
        @keyframes sidebarSlideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}

      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        activeNav={activeNav}
        username={user?.username}
        onNavClick={handleNavClick}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* ── Header ── */}
        <header
          className="flex items-center gap-3 px-4 flex-shrink-0"
          style={{
            height: 64,
            background: "var(--dfl-surface-1)",
            borderBottom: "1px solid var(--dfl-border-1)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border transition-all"
            style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-subtle)" }}
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={15} />
          </button>

          {/* Sidebar collapse (desktop) */}
          <button
            className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl border transition-all duration-150"
            style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-subtle)" }}
            onClick={() => setSidebarCollapsed(v => !v)}
            title="Свернуть / развернуть"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-2)"; (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-hi)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-1)"; (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)"; }}
          >
            <Menu size={15} />
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="no-underline flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", boxShadow: "0 2px 8px rgba(37,99,235,0.35)" }}>
              <Zap size={12} color="white" />
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:block">
              <span style={{ color: "var(--dfl-text-hi)" }}>Коваль</span>
              <span className="text-accent-gradient">Лабс</span>
            </span>
          </Link>

          {/* Quick nav (desktop) */}
          <div className="hidden lg:flex items-center gap-0.5 ml-1">
            {[
              { label: "Фото",   href: "/generate/photo",  Icon: Camera, hoverColor: "#3b82f6" },
              { label: "Видео",  href: "/generate/video",  Icon: Video,  hoverColor: "#ec4899" },
              { label: "Motion", href: "/generate/motion", Icon: Film,   hoverColor: "#8b5cf6" },
            ].map(item => (
              <Link key={item.href} to={item.href} className="no-underline">
                <button
                  className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium transition-all duration-120"
                  style={{ color: "var(--dfl-text-subtle)", background: "transparent" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = item.hoverColor; (e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <item.Icon size={12} />{item.label}
                </button>
              </Link>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm ml-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors duration-150"
              style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)" }}
              onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--dfl-border-2)")}
              onBlurCapture={e => (e.currentTarget.style.borderColor = "var(--dfl-border-1)")}
            >
              <Search size={12} style={{ color: "var(--dfl-text-placeholder)", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Поиск проектов..."
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xs min-w-0"
                style={{ color: "var(--dfl-text-hi)" }}
              />
            </div>
          </div>

          {/* Right zone */}
          <div className="flex items-center gap-2 ml-auto flex-shrink-0">
            {/* Credits pill */}
            <Link to="/balance/history" className="no-underline">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border cursor-pointer transition-all duration-150 min-w-[80px]"
                style={{ background: isLow ? "rgba(245,158,11,0.1)" : "var(--dfl-accent-muted)", borderColor: isLow ? "rgba(245,158,11,0.35)" : "var(--dfl-border-2)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.8"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
              >
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: isLow ? "rgba(245,158,11,0.2)" : "rgba(37,99,235,0.2)" }}>
                  <Zap size={10} style={{ color: isLow ? "var(--dfl-warning)" : "var(--dfl-accent-bright)" }} />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider leading-none mb-0.5" style={{ color: isLow ? "rgba(245,158,11,0.7)" : "var(--dfl-accent-bright)", opacity: 0.8 }}>Кредиты</p>
                  <p className="text-sm font-bold leading-none tabular-nums" style={{ color: isLow ? "var(--dfl-warning)" : "var(--dfl-accent-bright)" }}>
                    {balanceLoading ? "..." : (points ?? 0).toLocaleString()}
                  </p>
                </div>
                {isLow && <AlertTriangle size={10} style={{ color: "var(--dfl-warning)", flexShrink: 0 }} />}
              </div>
            </Link>

            {/* Buy credits button */}
            <button
              disabled
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold border opacity-50 cursor-not-allowed flex-shrink-0"
              style={{ background: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.2)", color: "#22c55e" }}
              title="Пополнение откроется после запуска"
            >
              <Plus size={12} />
              <span className="hidden sm:inline">Докупить</span>
            </button>

            {/* Create */}
            <CreateDropdown />

            {/* Divider */}
            <div className="hidden sm:block w-px h-7 flex-shrink-0" style={{ background: "var(--dfl-border-1)" }} />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-150"
              style={{ background: "var(--dfl-surface-2)", borderColor: "var(--dfl-border-1)", color: "var(--dfl-text-subtle)" }}
              title={isDark ? "Светлая тема" : "Тёмная тема"}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-2)"; (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-hi)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dfl-border-1)"; (e.currentTarget as HTMLElement).style.color = "var(--dfl-text-subtle)"; }}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Notifications */}
            <NotificationsDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={() => markAllRead()}
              isMarkingRead={isMarkingRead}
              isLoading={notifsLoading}
            />

            {/* Burger */}
            <BurgerMenu onLogout={handleLogout} />
          </div>
        </header>

        {/* ── Main Content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-5 py-6">
            {/* Page title */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold" style={{ color: "var(--dfl-text-hi)" }}>{isNew ? "Добро пожаловать! 👋" : "Дашборд"}</h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--dfl-text-subtle)" }}>
                  {isNew ? "Начните с создания AI‑инфлюенсера" : "Обзор аккаунта и быстрый доступ к генерации"}
                </p>
              </div>
              <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Бета · скоро запуск
              </span>
            </div>

            {/* New user */}
            {isNew ? (
              <div className="space-y-3">
                <EmptyDashboard onStartOnboarding={() => setShowOnboarding(true)} />
                <BalanceBlock points={points} isLow={false} />
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl mb-5 w-fit" style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}>
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-sm font-medium transition-all duration-150"
                      style={{
                        background: activeTab === tab.id ? "var(--dfl-accent-muted)" : "transparent",
                        color: activeTab === tab.id ? "var(--dfl-accent-bright)" : "var(--dfl-text-subtle)",
                        border: activeTab === tab.id ? "1px solid var(--dfl-border-2)" : "1px solid transparent",
                      }}
                    >
                      <tab.Icon size={12} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                {activeTab === "balance" && (
                  <div className="space-y-3">
                    <BalanceBlock points={points} isLow={isLow} />
                    <SubscriptionBlock credits={points} />
                    {activeTasks.length > 0 && <ActiveTasks tasks={activeTasks} />}

                    {/* Quick actions */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--dfl-text-placeholder)" }}>Быстрые действия</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {QUICK_ACTIONS.map(a => <QuickActionCard key={a.href} action={a} />)}
                      </div>
                    </div>

                    {/* Projects preview */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--dfl-text-placeholder)" }}>Мои проекты</p>
                        <Link to="/character/new" className="no-underline">
                          <button className="flex items-center gap-1 text-xs transition-colors" style={{ color: "var(--dfl-accent-bright)" }}>
                            <Plus size={11} />Новый
                          </button>
                        </Link>
                      </div>
                      {projectsLoading ? (
                        <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-16" />)}</div>
                      ) : projects.length === 0 ? (
                        <div className="rounded-2xl border p-4 text-center" style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}>
                          <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
                            Нет проектов. <Link to="/character/new" className="no-underline" style={{ color: "var(--dfl-accent-bright)" }}>Создайте персонажа →</Link>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">{projects.slice(0,3).map(p => <ProjectCard key={p.id} project={p} />)}</div>
                      )}
                    </div>

                    {/* Transactions preview */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--dfl-text-placeholder)" }}>История списаний</p>
                        <Link to="/balance/history" className="no-underline">
                          <button className="text-xs transition-colors" style={{ color: "var(--dfl-accent-bright)" }}>Вся история →</button>
                        </Link>
                      </div>
                      {txLoading ? (
                        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
                      ) : transactions.length === 0 ? (
                        <div className="rounded-2xl border p-4 text-center" style={{ background: "var(--dfl-surface-1)", borderColor: "var(--dfl-border-1)" }}>
                          <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
                            История пуста. <Link to="/generate/photo" className="no-underline" style={{ color: "var(--dfl-accent-bright)" }}>Запустите генерацию →</Link>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">{transactions.slice(0,5).map(item => <HistoryRow key={item.id} item={item} />)}</div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "projects" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
                        {projectsLoading ? "Загрузка..." : `${projects.length} ${projects.length === 1 ? "проект" : "проекта"}`}
                      </p>
                      <Link to="/character/new" className="no-underline">
                        <button className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563eb,#4f46e5)" }}>
                          <Plus size={12} />Новый проект
                        </button>
                      </Link>
                    </div>
                    <ProjectsTab projects={projects} isLoading={projectsLoading} />
                  </div>
                )}

                {activeTab === "history" && (
                  <HistoryTab transactions={transactions} isLoading={txLoading} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
