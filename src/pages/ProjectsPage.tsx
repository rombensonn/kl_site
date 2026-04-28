import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Plus, Camera, Video, Film,
  Loader2, Trash2, FolderOpen, ChevronRight, LayoutGrid, List, Zap, Sun, Moon,
} from "lucide-react";
import {
  Avatar, Badge, Box, Button, Card, Flex, Grid, Heading, IconButton,
  ScrollArea, Separator, Text, Tooltip,
} from "@radix-ui/themes";
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

// ── Project Grid Card ─────────────────────────────────────────────────────────
function ProjectGridCard({ project, onDelete }: { project: Project; onDelete: () => void }) {
  const [confirmDel, setConfirmDel] = useState(false);

  if (confirmDel) {
    return (
      <Card style={{ textAlign: "center" }}>
        <Flex direction="column" gap="3" py="3">
          <Text size="2" weight="medium">Удалить <strong>«{project.character_name}»</strong>?</Text>
          <Flex gap="2" justify="center">
            <Button color="red" size="2" onClick={onDelete} style={{ cursor: "pointer" }}>Удалить</Button>
            <Button variant="soft" color="gray" size="2" onClick={() => setConfirmDel(false)} style={{ cursor: "pointer" }}>Отмена</Button>
          </Flex>
        </Flex>
      </Card>
    );
  }

  return (
    <Card style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Top area */}
      <Box style={{ height: 96, background: "var(--accent-a3)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderBottom: "1px solid var(--gray-a4)" }}>
        <Text size="9">{project.emoji}</Text>
        <Box style={{ position: "absolute", top: 8, right: 8 }}>
          <Badge color={project.status === "active" ? "green" : "amber"} variant="soft" size="1">
            {project.status === "active" ? "Активный" : "Пауза"}
          </Badge>
        </Box>
      </Box>

      <Flex direction="column" gap="3" p="3" style={{ flex: 1 }}>
        <Box>
          <Text size="2" weight="medium" truncate style={{ display: "block" }}>{project.character_name}</Text>
          <Text size="1" color="gray" truncate style={{ display: "block" }}>{project.campaign_name}</Text>
        </Box>
        <Flex align="center" gap="2">
          <Text size="1" color="gray">{project.generations_count} генераций</Text>
          <Text size="1" color="gray">·</Text>
          <Text size="1" color="gray">{formatDate(project.created_at)}</Text>
        </Flex>
        <Flex gap="2" mt="auto">
          <Link to={`/projects/${project.id}/overview`} style={{ flex: 1, textDecoration: "none" }}>
            <Button variant="soft" size="2" style={{ width: "100%", cursor: "pointer" }}>
              Открыть <ChevronRight size={11} />
            </Button>
          </Link>
          <IconButton color="red" variant="soft" size="2" onClick={() => setConfirmDel(true)} style={{ cursor: "pointer" }}>
            <Trash2 size={13} />
          </IconButton>
        </Flex>
      </Flex>
    </Card>
  );
}

// ── Project List Row ──────────────────────────────────────────────────────────
function ProjectListRow({ project, onDelete }: { project: Project; onDelete: () => void }) {
  const [confirmDel, setConfirmDel] = useState(false);

  if (confirmDel) {
    return (
      <Card>
        <Flex align="center" gap="4">
          <Text size="2" style={{ flex: 1 }}>
            Удалить <Text weight="bold">«{project.character_name}»</Text>? Необратимо.
          </Text>
          <Flex gap="2">
            <Button color="red" size="2" onClick={onDelete} style={{ cursor: "pointer" }}>Удалить</Button>
            <Button variant="soft" color="gray" size="2" onClick={() => setConfirmDel(false)} style={{ cursor: "pointer" }}>Отмена</Button>
          </Flex>
        </Flex>
      </Card>
    );
  }

  return (
    <Card>
      <Flex align="center" gap="3">
        <Box style={{ width: 48, height: 48, borderRadius: "var(--radius-3)", background: "var(--gray-a3)", border: "1px solid var(--gray-a5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
          {project.emoji}
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Flex align="center" gap="2" mb="1" wrap="wrap">
            <Text size="2" weight="medium" truncate>{project.character_name}</Text>
            <Badge color={project.status === "active" ? "green" : "amber"} variant="soft" size="1">
              {project.status === "active" ? "Активный" : "Пауза"}
            </Badge>
          </Flex>
          <Text size="1" color="gray">
            {project.campaign_name} · {project.generations_count} генераций · {formatDate(project.created_at)}
          </Text>
        </Box>
        <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
          <Tooltip content="Генерация фото">
            <Link to={`/generate/photo?project=${project.id}`}>
              <IconButton variant="soft" size="2" style={{ cursor: "pointer" }}><Camera size={13} /></IconButton>
            </Link>
          </Tooltip>
          <Tooltip content="Генерация видео">
            <Link to={`/generate/video?project=${project.id}`}>
              <IconButton variant="soft" size="2" style={{ cursor: "pointer" }}><Video size={13} /></IconButton>
            </Link>
          </Tooltip>
          <Tooltip content="Motion">
            <Link to={`/generate/motion?project=${project.id}`}>
              <IconButton variant="soft" size="2" style={{ cursor: "pointer" }}><Film size={13} /></IconButton>
            </Link>
          </Tooltip>
          <Link to={`/projects/${project.id}/overview`} style={{ textDecoration: "none" }}>
            <Button variant="outline" size="2" style={{ cursor: "pointer" }}>
              Открыть <ChevronRight size={11} />
            </Button>
          </Link>
          <IconButton color="red" variant="soft" size="2" onClick={() => setConfirmDel(true)} style={{ cursor: "pointer" }}>
            <Trash2 size={13} />
          </IconButton>
        </Flex>
      </Flex>
    </Card>
  );
}

// ── Main Projects Page ────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isDark = theme === "dark";
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["user-projects", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_projects").select("*").eq("user_id", user.id)
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
      toast.success("Проект удалён");
    },
    onError: () => toast.error("Ошибка удаления"),
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    totalGens: projects.reduce((s, p) => s + p.generations_count, 0),
  };

  return (
    <Box style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      {/* Header */}
      <Flex
        align="center"
        gap="3"
        px="4"
        style={{ position: "sticky", top: 0, zIndex: 40, height: 64, background: "var(--color-panel-translucent)", borderBottom: "1px solid var(--gray-a4)", backdropFilter: "blur(12px)" }}
      >
        <Link to="/dashboard" style={{ textDecoration: "none" }}>
          <Button variant="ghost" size="2" style={{ cursor: "pointer" }}>
            <ArrowLeft size={15} /><Text className="hidden sm:inline">Дашборд</Text>
          </Button>
        </Link>
        <Separator orientation="vertical" style={{ height: 20 }} />
        <Link to="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <Box style={{ width: 24, height: 24, borderRadius: "var(--radius-2)", background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={11} color="white" />
          </Box>
          <Text size="2" weight="bold" className="hidden sm:block">
            <span style={{ color: "var(--gray-12)" }}>Коваль</span>
            <span className="text-accent-gradient">Лабс</span>
          </Text>
        </Link>
        <Box style={{ flex: 1 }} />

        {/* View toggle */}
        <Flex gap="1" p="1" style={{ background: "var(--gray-a3)", borderRadius: "var(--radius-3)", border: "1px solid var(--gray-a4)" }} className="hidden sm:flex">
          {([["list", List], ["grid", LayoutGrid]] as const).map(([mode, Icon]) => (
            <IconButton
              key={mode}
              variant={viewMode === mode ? "solid" : "ghost"}
              color={viewMode === mode ? "blue" : "gray"}
              size="1"
              onClick={() => setViewMode(mode)}
              style={{ cursor: "pointer" }}
            >
              <Icon size={13} />
            </IconButton>
          ))}
        </Flex>

        <Link to="/projects/new" style={{ textDecoration: "none" }}>
          <Button size="2" style={{ cursor: "pointer" }}>
            <Plus size={13} />Новый проект
          </Button>
        </Link>
        <Tooltip content={isDark ? "Светлая тема" : "Тёмная тема"}>
          <IconButton variant="soft" onClick={toggleTheme} size="2" radius="full">
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </IconButton>
        </Tooltip>
      </Flex>

      <Box style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
        {/* Title */}
        <Box mb="5">
          <Heading size="6" mb="1">Мои проекты</Heading>
          <Text size="2" color="gray">AI-инфлюенсеры и кампании вашего бренда</Text>
        </Box>

        {/* Stats */}
        {!isLoading && projects.length > 0 && (
          <Grid columns="3" gap="3" mb="5">
            {[
              { label: "Всего проектов", value: stats.total },
              { label: "Активных", value: stats.active, color: "green" as const },
              { label: "Генераций всего", value: stats.totalGens },
            ].map(s => (
              <Card key={s.label}>
                <Heading size="6" style={{ color: s.color ? `var(--${s.color}-11)` : undefined }}>{s.value}</Heading>
                <Text size="1" color="gray">{s.label}</Text>
              </Card>
            ))}
          </Grid>
        )}

        {/* Loading */}
        {isLoading && (
          <Flex align="center" justify="center" py="9">
            <Loader2 size={28} className="animate-spin" style={{ color: "var(--gray-9)" }} />
          </Flex>
        )}

        {/* Empty */}
        {!isLoading && projects.length === 0 && (
          <Card style={{ textAlign: "center", border: "1px dashed var(--gray-a6)" }}>
            <Flex direction="column" align="center" py="8" gap="3">
              <Box style={{ width: 56, height: 56, borderRadius: "var(--radius-4)", background: "var(--accent-a3)", border: "1px solid var(--accent-a6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FolderOpen size={24} style={{ color: "var(--accent-11)" }} />
              </Box>
              <Heading size="4">Проектов пока нет</Heading>
              <Text size="2" color="gray" style={{ maxWidth: 300 }}>
                Создайте первый проект и добавьте AI-инфлюенсера вашего бренда
              </Text>
              <Link to="/projects/new" style={{ textDecoration: "none" }}>
                <Button size="3" style={{ cursor: "pointer" }}>Создать первый проект →</Button>
              </Link>
            </Flex>
          </Card>
        )}

        {/* Grid view */}
        {!isLoading && projects.length > 0 && viewMode === "grid" && (
          <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="4">
            {projects.map(p => (
              <ProjectGridCard key={p.id} project={p} onDelete={() => deleteProject(p.id)} />
            ))}
          </Grid>
        )}

        {/* List view */}
        {!isLoading && projects.length > 0 && viewMode === "list" && (
          <Flex direction="column" gap="3">
            {projects.map(p => (
              <ProjectListRow key={p.id} project={p} onDelete={() => deleteProject(p.id)} />
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  );
}
