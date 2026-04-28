import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Zap, ArrowLeft, Sun, Moon, Search, ChevronLeft, ChevronRight,
  Camera, Video, Film, User, TrendingUp, Plus, Loader2, Clock,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
type TxType = "all" | "photo" | "video" | "motion" | "character" | "topup" | "bonus";

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  created_at: string;
}

// ── Config ────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

const TYPE_FILTERS: { id: TxType; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "photo", label: "Фото" },
  { id: "video", label: "Видео" },
  { id: "motion", label: "Motion" },
  { id: "character", label: "Персонаж" },
  { id: "topup", label: "Пополнение" },
  { id: "bonus", label: "Бонусы" },
];

const TYPE_META: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  photo:     { icon: Camera,    color: "#3b82f6", bg: "rgba(59,130,246,0.1)",   label: "Фото" },
  video:     { icon: Video,     color: "#ec4899", bg: "rgba(236,72,153,0.1)",   label: "Видео" },
  motion:    { icon: Film,      color: "#a78bfa", bg: "rgba(167,139,250,0.1)",  label: "Motion" },
  character: { icon: User,      color: "#6366f1", bg: "rgba(99,102,241,0.1)",   label: "Персонаж" },
  topup:     { icon: Plus,      color: "#22c55e", bg: "rgba(34,197,94,0.1)",    label: "Пополнение" },
  bonus:     { icon: TrendingUp, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Бонус" },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? { icon: Clock, color: "var(--dfl-text-subtle)", bg: "var(--dfl-surface-2)", label: type };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      className="rounded-2xl p-12 text-center"
      style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)", borderStyle: "dashed" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
        style={{ background: "var(--dfl-surface-2)", border: "1px solid var(--dfl-border-1)" }}
      >
        📊
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--dfl-text-mid)" }}>
        {filtered ? "Нет транзакций по фильтру" : "История пуста"}
      </p>
      <p className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
        {filtered
          ? "Попробуйте изменить фильтр или поисковый запрос"
          : "Ваши транзакции появятся здесь после первой генерации"}
      </p>
    </div>
  );
}

// ── Transaction Row ───────────────────────────────────────────────────────────
function TxRow({ tx }: { tx: Transaction }) {
  const meta = getTypeMeta(tx.type);
  const isCredit = tx.amount > 0;
  const Icon = meta.icon;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors duration-150"
      style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-2)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--dfl-surface-1)")}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: meta.bg, border: `1px solid ${meta.color}28` }}
      >
        <Icon size={15} style={{ color: meta.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>
        </div>
        <p className="text-sm font-medium truncate" style={{ color: "var(--dfl-text-mid)" }}>
          {tx.description}
        </p>
        <p className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
          {formatDate(tx.created_at)}
        </p>
      </div>

      <span
        className="text-sm font-bold flex-shrink-0"
        style={{ color: isCredit ? "#22c55e" : "#f87171" }}
      >
        {isCredit ? "+" : ""}{tx.amount} кр
      </span>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150"
        style={{
          background: "var(--dfl-surface-2)",
          border: "1px solid var(--dfl-border-1)",
          color: page === 1 ? "var(--dfl-text-placeholder)" : "var(--dfl-text-lo)",
          cursor: page === 1 ? "not-allowed" : "pointer",
        }}
      >
        <ChevronLeft size={14} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="text-xs px-1" style={{ color: "var(--dfl-text-placeholder)" }}>
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p as number)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: p === page ? "var(--dfl-accent)" : "var(--dfl-surface-2)",
              border: `1px solid ${p === page ? "transparent" : "var(--dfl-border-1)"}`,
              color: p === page ? "white" : "var(--dfl-text-lo)",
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150"
        style={{
          background: "var(--dfl-surface-2)",
          border: "1px solid var(--dfl-border-1)",
          color: page === totalPages ? "var(--dfl-text-placeholder)" : "var(--dfl-text-lo)",
          cursor: page === totalPages ? "not-allowed" : "pointer",
        }}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BalanceHistoryPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";

  const [typeFilter, setTypeFilter] = useState<TxType>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Fetch all transactions for the user
  const { data: allTxs = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["balance-transactions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("balance_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  // Client-side filter + search + pagination
  const filtered = allTxs.filter((tx) => {
    const matchType = typeFilter === "all" || tx.type === typeFilter;
    const matchSearch =
      !search ||
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.type.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary stats
  const totalSpent = allTxs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalEarned = allTxs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  const handleFilterChange = (f: TxType) => {
    setTypeFilter(f);
    setPage(1);
  };

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--dfl-bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center gap-3 px-4 sm:px-6 border-b"
        style={{
          height: 64,
          background: "var(--dfl-surface-1)",
          borderColor: "var(--dfl-border-1)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-sm transition-colors duration-150 flex-shrink-0"
          style={{ color: "var(--dfl-text-lo)" }}
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Дашборд</span>
        </Link>

        <div className="w-px h-5 flex-shrink-0" style={{ background: "var(--dfl-border-2)" }} />

        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}
          >
            <Zap size={11} className="text-white" />
          </div>
          <span className="font-display font-bold text-sm hidden sm:block" style={{ letterSpacing: "-0.02em" }}>
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
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
        {/* Page title */}
        <div className="mb-6">
          <h1
            className="font-display font-bold mb-1"
            style={{ fontSize: "clamp(1.4rem, 3vw, 1.75rem)", color: "var(--dfl-text-hi)" }}
          >
            История баланса
          </h1>
          <p className="text-sm" style={{ color: "var(--dfl-text-subtle)" }}>
            Все транзакции и начисления кредитов
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Всего транзакций", value: allTxs.length.toString(), color: "var(--dfl-text-hi)" },
            { label: "Потрачено", value: `${totalSpent.toLocaleString()} кр`, color: "#f87171" },
            { label: "Начислено", value: `${totalEarned.toLocaleString()} кр`, color: "#4ade80" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl px-4 py-3.5 text-center"
              style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}
            >
              <p className="text-lg font-display font-bold leading-tight" style={{ color: stat.color }}>
                {isLoading ? (
                  <span className="inline-block w-12 h-5 rounded animate-pulse" style={{ background: "var(--dfl-surface-3)" }} />
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--dfl-text-placeholder)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
            style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}
          >
            <Search size={13} style={{ color: "var(--dfl-text-placeholder)", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Поиск по транзакциям..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--dfl-text-hi)" }}
            />
          </div>
        </div>

        {/* Type filter tabs */}
        <div
          className="flex gap-1 p-1 rounded-2xl mb-5 overflow-x-auto"
          style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}
        >
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
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

        {/* Results count */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
            {isLoading ? "Загрузка..." : `${filtered.length} ${filtered.length === 1 ? "транзакция" : "транзакций"}`}
          </p>
          {totalPages > 1 && (
            <p className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
              Страница {page} из {totalPages}
            </p>
          )}
        </div>

        {/* Transaction list */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl animate-pulse"
                style={{ background: "var(--dfl-surface-1)", border: "1px solid var(--dfl-border-1)" }}
              />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <EmptyState filtered={typeFilter !== "all" || !!search} />
        ) : (
          <>
            <div className="space-y-2">
              {paginated.map((tx) => (
                <TxRow key={tx.id} tx={tx} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}

        {/* Bottom nav */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link to="/dashboard" className="text-xs" style={{ color: "var(--dfl-text-placeholder)" }}>
            ← Вернуться в дашборд
          </Link>
        </div>
      </main>
    </div>
  );
}
