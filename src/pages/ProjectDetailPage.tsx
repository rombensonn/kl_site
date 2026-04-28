
import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Zap, Sun, Moon, ArrowLeft, Camera, Video, Film, Plus,
  Loader2, ImageIcon, Download, Trash2, Settings, BarChart3,
  TrendingUp, FileText, Edit3, Save, X, Play, Sparkles,
  AlertTriangle, CheckCircle2,
} from "lucide-react";
import {
  Avatar, Badge, Box, Button, Card, Dialog, Flex, Grid, Heading,
  IconButton, ScrollArea, Separator, Tabs, Text, Tooltip, Select, TextField,
} from "@radix-ui/themes";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { FunctionsHttpError, supabase } from "@/lib/supabase";

interface Project {
  id: string;
  character_name: string;
  campaign_name: string;
  generations_count: number;
  status: string;
  emoji: string;
  created_at: string;
  updated_at: string;
}

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

interface BrandBrief {
  id?: string;
  brand_name: string;
  audience: string;
  tone: string;
  values: string;
  restrictions: string;
}

const TYPE_META: Record<string, { label: string; color: "blue" | "pink" | "violet"; Icon: typeof Camera }> = {
  photo:  { label: "Фото",   color: "blue",   Icon: Camera },
  video:  { label: "Видео",  color: "pink",   Icon: Video  },
  motion: { label: "Motion", color: "violet", Icon: Film   },
};

const TONE_OPTIONS = ["Дружелюбный", "Экспертный", "Люксовый", "Энергичный", "Минималистичный", "Игривый"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
}

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  return `${Math.floor(hrs / 24)} д назад`;
}

// ── Video Generation Modal ────────────────────────────────────────────────────
interface VideoGenModalProps {
  photo: Asset;
  projectId: string;
  userId: string;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}

function VideoGenModal({ photo, projectId, userId, open, onClose, onDone }: VideoGenModalProps) {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"landscape" | "portrait" | "square">("portrait");
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
      stopPolling(); setProgress(100); setVideoUrl(data.videoUrl); setStatus("done"); onDone();
    } else if (data.status === "failed" || data.status === "canceled") {
      stopPolling(); setStatus("error"); setErrorMsg(data.error ?? "Генерация не удалась");
    } else {
      setProgress(data.progress ?? 0); setStatus("processing");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Введите описание для видео"); return; }
    setStatus("pending"); setProgress(0); setErrorMsg("");
    const { data, error } = await supabase.functions.invoke("generate-video", {
      body: { action: "create", prompt: prompt.trim(), model: "kling-v2.6-pro", referenceImageUrl: photo.result_url, projectId, aspectRatio, seconds },
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

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) { stopPolling(); onClose(); } }}>
      <Dialog.Content maxWidth="500px">
        <Dialog.Title>
          <Flex align="center" gap="2">
            <Box style={{ width: 28, height: 28, borderRadius: "var(--radius-2)", background: "var(--pink-a3)", border: "1px solid var(--pink-a6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={13} style={{ color: "var(--pink-11)" }} />
            </Box>
            Генерация видео
            <Text size="1" color="gray" ml="1">Kling · от фото</Text>
          </Flex>
        </Dialog.Title>
        <Dialog.Description size="1" mb="4" color="gray">
          Создайте видео на основе выбранного фото персонажа
        </Dialog.Description>

        <Flex direction="column" gap="4">
          {/* Reference photo */}
          <Box>
            <Text size="1" color="gray" weight="medium" style={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
              Исходное фото (референс)
            </Text>
            <Box style={{ position: "relative", borderRadius: "var(--radius-3)", overflow: "hidden", height: 120 }}>
              <img src={photo.result_url} alt={photo.prompt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <Box style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
              <Text size="1" style={{ position: "absolute", bottom: 8, left: 12, right: 12, color: "white", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {photo.prompt}
              </Text>
            </Box>
          </Box>

          {/* Prompt */}
          <Box>
            <Text as="label" size="2" weight="medium" htmlFor="video-prompt" style={{ display: "block", marginBottom: 8 }}>
              Описание видео
            </Text>
            <textarea
              id="video-prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Персонаж плавно идёт вперёд, камера медленно отъезжает..."
              disabled={status !== "idle" && status !== "error"}
              style={{
                width: "100%", borderRadius: "var(--radius-3)", padding: "10px 12px",
                border: "1px solid var(--gray-a6)", background: "var(--color-surface)",
                color: "var(--gray-12)", fontSize: 14, resize: "none", outline: "none",
                lineHeight: 1.5,
              }}
              rows={3}
            />
          </Box>

          {/* Settings */}
          <Grid columns="2" gap="3">
            {/* Aspect */}
            <Box>
              <Text size="1" color="gray" weight="medium" style={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
                Формат
              </Text>
              <Flex gap="1">
                {([
                  { id: "portrait" as const, label: "9:16", icon: "▌" },
                  { id: "landscape" as const, label: "16:9", icon: "▬" },
                  { id: "square" as const, label: "1:1", icon: "■" },
                ]).map(opt => (
                  <Button
                    key={opt.id}
                    variant={aspectRatio === opt.id ? "solid" : "soft"}
                    color={aspectRatio === opt.id ? "pink" : "gray"}
                    size="1"
                    style={{ flex: 1, flexDirection: "column", height: 44, gap: 2, cursor: "pointer" }}
                    onClick={() => setAspectRatio(opt.id)}
                    disabled={status !== "idle" && status !== "error"}
                  >
                    <span style={{ fontSize: 14 }}>{opt.icon}</span>
                    <span style={{ fontSize: 10 }}>{opt.label}</span>
                  </Button>
                ))}
              </Flex>
            </Box>

            {/* Duration */}
            <Box>
              <Flex align="center" justify="between" mb="2">
                <Text size="1" color="gray" weight="medium" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Длина
                </Text>
                <Badge color="pink" variant="soft" size="1">{seconds}с</Badge>
              </Flex>
              <input
                type="range" min={3} max={10} value={seconds}
                onChange={e => setSeconds(Number(e.target.value))}
                disabled={status !== "idle" && status !== "error"}
                style={{ width: "100%", accentColor: "var(--pink-9)", marginTop: 4 }}
              />
              <Flex justify="between">
                <Text size="1" color="gray">3с</Text>
                <Text size="1" color="gray">10с</Text>
              </Flex>
            </Box>
          </Grid>

          {/* Cost */}
          <Card style={{ background: "var(--pink-a2)", border: "1px solid var(--pink-a4)" }}>
            <Flex align="center" gap="2">
              <Zap size={13} style={{ color: "var(--pink-11)" }} />
              <Text size="2" color="gray">
                Стоимость: <Text as="span" weight="bold" style={{ color: "var(--pink-11)" }}>150 кр</Text> · Модель: Kling
              </Text>
            </Flex>
          </Card>

          {/* Progress */}
          {(status === "pending" || status === "processing") && (
            <Box>
              <Flex align="center" justify="between" mb="2">
                <Flex align="center" gap="2">
                  <Loader2 size={12} className="animate-spin" style={{ color: "var(--pink-11)" }} />
                  <Text size="2" color="gray">
                    {status === "pending" ? "Запускаем Kling..." : "Генерация видео..."}
                  </Text>
                </Flex>
                {progress > 0 && <Badge color="pink" variant="soft" size="1">{progress}%</Badge>}
              </Flex>
              <Box style={{ height: 4, borderRadius: 2, background: "var(--pink-a4)", overflow: "hidden" }}>
                <Box style={{ height: "100%", width: progress > 0 ? `${progress}%` : "30%", background: "var(--pink-9)", borderRadius: 2, transition: "width 500ms", animation: "pulse 2s infinite" }} />
              </Box>
            </Box>
          )}

          {/* Done */}
          {status === "done" && videoUrl && (
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2">
                <CheckCircle2 size={14} style={{ color: "var(--green-11)" }} />
                <Text size="2" style={{ color: "var(--green-11)" }}>Видео сгенерировано и сохранено</Text>
              </Flex>
              <video src={videoUrl} controls style={{ width: "100%", borderRadius: "var(--radius-3)", maxHeight: 180 }} />
              <a href={videoUrl} download={`video-${photo.id.slice(0, 8)}.mp4`} style={{ textDecoration: "none" }}>
                <Button variant="outline" style={{ width: "100%", cursor: "pointer" }}>
                  <Download size={13} />Скачать MP4
                </Button>
              </a>
            </Flex>
          )}

          {/* Error */}
          {status === "error" && (
            <Card style={{ background: "var(--red-a2)", border: "1px solid var(--red-a5)" }}>
              <Flex align="start" gap="2">
                <AlertTriangle size={13} style={{ color: "var(--red-11)", flexShrink: 0, marginTop: 2 }} />
                <Text size="2" style={{ color: "var(--red-11)" }}>{errorMsg}</Text>
              </Flex>
            </Card>
          )}

          {/* Actions */}
          <Flex gap="2" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" style={{ cursor: "pointer" }} onClick={() => { stopPolling(); }}>
                {status === "done" ? "Закрыть" : "Отмена"}
              </Button>
            </Dialog.Close>
            {(status === "idle" || status === "error") && (
              <Button
                color="pink"
                disabled={!prompt.trim()}
                onClick={handleGenerate}
                style={{ cursor: "pointer" }}
              >
                <Play size={13} />Генерировать видео
              </Button>
            )}
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// ── Brand Brief Section ───────────────────────────────────────────────────────
function BrandBriefSection({ projectId, userId }: { projectId: string; userId: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<BrandBrief>({
    brand_name: "", audience: "", tone: "Дружелюбный", values: "", restrictions: "",
  });

  const { data: brief, isLoading } = useQuery<BrandBrief | null>({
    queryKey: ["brand-brief-project", projectId, userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("brand_briefs").select("*")
        .eq("user_id", userId).eq("project_id", projectId).maybeSingle();
      return data ?? null;
    },
    enabled: !!projectId && !!userId,
  });

  useEffect(() => {
    if (brief) setForm({ brand_name: brief.brand_name, audience: brief.audience, tone: brief.tone, values: brief.values, restrictions: brief.restrictions });
  }, [brief]);

  const { mutate: saveBrief, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      if (brief?.id) {
        const { error } = await supabase.from("brand_briefs").update({ ...form, updated_at: new Date().toISOString() }).eq("id", brief.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("brand_briefs").insert({ user_id: userId, project_id: projectId, ...form });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-brief-project", projectId, userId] });
      setEditing(false);
      toast.success("Бренд-бриф сохранён");
    },
    onError: () => toast.error("Ошибка сохранения"),
  });

  if (isLoading) {
    return <Box style={{ height: 120, borderRadius: "var(--radius-4)", background: "var(--gray-a3)", animation: "pulse 2s infinite" }} />;
  }

  if (!brief && !editing) {
    return (
      <Card style={{ background: "var(--violet-a2)", border: "1px solid var(--violet-a5)" }}>
        <Flex align="center" gap="4">
          <Box style={{ width: 44, height: 44, borderRadius: "var(--radius-3)", background: "var(--violet-a3)", border: "1px solid var(--violet-a6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FileText size={18} style={{ color: "var(--violet-11)" }} />
          </Box>
          <Box style={{ flex: 1 }}>
            <Text size="2" weight="medium" style={{ display: "block" }}>Бренд-бриф не заполнен</Text>
            <Text size="2" color="gray">Заполните параметры бренда — они будут использоваться как контекст при генерации контента.</Text>
          </Box>
          <Button size="2" color="violet" onClick={() => setEditing(true)} style={{ flexShrink: 0, cursor: "pointer" }}>
            <Plus size={13} />Заполнить бриф
          </Button>
        </Flex>
      </Card>
    );
  }

  return (
    <Card>
      {/* Header */}
      <Flex align="center" justify="between" mb="4">
        <Flex align="center" gap="2">
          <FileText size={15} style={{ color: "var(--violet-11)" }} />
          <Text size="2" weight="medium">Бренд-бриф</Text>
          {brief && !editing && <Badge color="green" variant="soft" size="1">Заполнен</Badge>}
        </Flex>
        <Flex gap="2">
          {editing ? (
            <>
              <Button variant="soft" color="gray" size="1" onClick={() => { setEditing(false); if (brief) setForm({ brand_name: brief.brand_name, audience: brief.audience, tone: brief.tone, values: brief.values, restrictions: brief.restrictions }); }} style={{ cursor: "pointer" }}>
                <X size={11} />Отмена
              </Button>
              <Button variant="solid" size="1" onClick={() => saveBrief()} disabled={isSaving} style={{ cursor: "pointer" }}>
                {isSaving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                Сохранить
              </Button>
            </>
          ) : (
            <Button variant="soft" size="1" onClick={() => setEditing(true)} style={{ cursor: "pointer" }}>
              <Edit3 size={11} />Редактировать
            </Button>
          )}
        </Flex>
      </Flex>

      {editing ? (
        <Flex direction="column" gap="3">
          <Box>
            <Text as="label" size="1" color="gray" weight="medium" style={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Название бренда
            </Text>
            <TextField.Root
              value={form.brand_name}
              onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))}
              placeholder="Например: Nova Fashion"
              size="2"
            />
          </Box>

          <Box>
            <Text as="label" size="1" color="gray" weight="medium" style={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Целевая аудитория
            </Text>
            <TextField.Root
              value={form.audience}
              onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
              placeholder="Женщины 25–35 лет, городские, интересуются модой..."
              size="2"
            />
          </Box>

          <Box>
            <Text size="1" color="gray" weight="medium" style={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
              Tone of Voice
            </Text>
            <Flex wrap="wrap" gap="2">
              {TONE_OPTIONS.map(t => (
                <Button
                  key={t}
                  variant={form.tone === t ? "solid" : "soft"}
                  color={form.tone === t ? "violet" : "gray"}
                  size="1"
                  onClick={() => setForm(f => ({ ...f, tone: t }))}
                  style={{ cursor: "pointer" }}
                >
                  {t}
                </Button>
              ))}
            </Flex>
          </Box>

          <Box>
            <Text as="label" size="1" color="gray" weight="medium" style={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Ценности бренда
            </Text>
            <textarea
              value={form.values}
              onChange={e => setForm(f => ({ ...f, values: e.target.value }))}
              placeholder="Натуральность, устойчивость, современность..."
              rows={2}
              style={{ width: "100%", borderRadius: "var(--radius-3)", padding: "10px 12px", border: "1px solid var(--gray-a6)", background: "var(--color-surface)", color: "var(--gray-12)", fontSize: 14, resize: "none", outline: "none", lineHeight: 1.5 }}
            />
          </Box>

          <Box>
            <Text as="label" size="1" color="gray" weight="medium" style={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              Ограничения <Text as="span" size="1" color="gray" style={{ textTransform: "none", fontWeight: 400 }}>(необязательно)</Text>
            </Text>
            <textarea
              value={form.restrictions}
              onChange={e => setForm(f => ({ ...f, restrictions: e.target.value }))}
              placeholder="Не использовать агрессивный стиль..."
              rows={2}
              style={{ width: "100%", borderRadius: "var(--radius-3)", padding: "10px 12px", border: "1px solid var(--gray-a6)", background: "var(--color-surface)", color: "var(--gray-12)", fontSize: 14, resize: "none", outline: "none", lineHeight: 1.5 }}
            />
          </Box>
        </Flex>
      ) : (
        <Grid columns={{ initial: "1", sm: "2" }} gap="3">
          {[
            { label: "Название бренда", value: brief?.brand_name },
            { label: "Аудитория", value: brief?.audience },
            { label: "Tone of Voice", value: brief?.tone },
            { label: "Ценности", value: brief?.values },
            ...(brief?.restrictions ? [{ label: "Ограничения", value: brief.restrictions }] : []),
          ].map(item => (
            <Box key={item.label}>
              <Text size="1" color="gray" weight="medium" style={{ textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>
                {item.label}
              </Text>
              <Text size="2" color={item.value ? undefined : "gray"}>{item.value || "—"}</Text>
            </Box>
          ))}
        </Grid>
      )}
    </Card>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ project, assets, userId }: { project: Project; assets: Asset[]; userId: string }) {
  const queryClient = useQueryClient();
  const completed = assets.filter(a => a.status === "completed");
  const photos = completed.filter(a => a.type === "photo");
  const byType = {
    photo: photos.length,
    video: completed.filter(a => a.type === "video").length,
    motion: completed.filter(a => a.type === "motion").length,
  };
  const totalCost = completed.reduce((s, a) => s + (a.cost || 0), 0);
  const recent = photos.slice(0, 4);

  const [videoModalPhoto, setVideoModalPhoto] = useState<Asset | null>(null);

  return (
    <Flex direction="column" gap="5">
      {/* Brand Brief */}
      <BrandBriefSection projectId={project.id} userId={userId} />

      {/* Stats grid */}
      <Grid columns={{ initial: "2", sm: "4" }} gap="3">
        {[
          { label: "Генераций всего", value: project.generations_count, Icon: TrendingUp, color: "blue" as const },
          { label: "Кредитов потрачено", value: totalCost, Icon: Zap, color: "amber" as const },
          { label: "Фото", value: byType.photo, Icon: Camera, color: "blue" as const },
          { label: "Видео + Motion", value: byType.video + byType.motion, Icon: Film, color: "violet" as const },
        ].map(s => (
          <Card key={s.label}>
            <Flex align="center" gap="2" mb="2">
              <s.Icon size={13} style={{ color: `var(--${s.color}-11)`, flexShrink: 0 }} />
              <Text size="1" color="gray" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</Text>
            </Flex>
            <Heading size="6">{s.value}</Heading>
          </Card>
        ))}
      </Grid>

      {/* Quick actions */}
      <Box>
        <Text size="1" color="gray" style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, display: "block", marginBottom: 12 }}>
          Быстрые действия
        </Text>
        <Grid columns="3" gap="3">
          {[
            { label: "Генерация фото",  Icon: Camera, color: "blue" as const,   href: `/generate/photo?project=${project.id}` },
            { label: "Видео по тренду", Icon: Video,  color: "pink" as const,   href: `/generate/video?project=${project.id}` },
            { label: "Motion Control",  Icon: Film,   color: "violet" as const, href: `/generate/motion?project=${project.id}` },
          ].map(a => (
            <Link key={a.label} to={a.href} style={{ textDecoration: "none" }}>
              <Card style={{ cursor: "pointer", textAlign: "center" }}>
                <Flex direction="column" align="center" gap="2" py="1">
                  <Box style={{ width: 40, height: 40, borderRadius: "var(--radius-3)", background: `var(--${a.color}-a3)`, border: `1px solid var(--${a.color}-a6)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <a.Icon size={18} style={{ color: `var(--${a.color}-11)` }} />
                  </Box>
                  <Text size="2" weight="medium" style={{ color: `var(--${a.color}-11)` }}>{a.label}</Text>
                </Flex>
              </Card>
            </Link>
          ))}
        </Grid>
      </Box>

      {/* Recent photos with video generation */}
      {photos.length > 0 && (
        <Box>
          <Flex align="center" justify="between" mb="3">
            <Text size="1" color="gray" style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              Последние фото · наведите для создания видео
            </Text>
            <Link to={`/projects/${project.id}/generations`} style={{ textDecoration: "none" }}>
              <Button variant="ghost" size="1">Все генерации →</Button>
            </Link>
          </Flex>
          <Grid columns={{ initial: "2", sm: "4" }} gap="3">
            {recent.map(asset => (
              <Box key={asset.id} style={{ borderRadius: "var(--radius-3)", overflow: "hidden", position: "relative" }}
                className="group"
              >
                <Box style={{ height: 144, background: "#000" }}>
                  <img src={asset.result_url} alt={asset.prompt} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                </Box>
                {/* Hover overlay */}
                <Box
                  style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 200ms" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0"}
                >
                  <Button
                    size="1"
                    color="pink"
                    onClick={() => setVideoModalPhoto(asset)}
                    style={{ cursor: "pointer" }}
                  >
                    <Play size={11} />Создать видео
                  </Button>
                </Box>
                <Badge color="blue" variant="soft" size="1" style={{ position: "absolute", top: 6, left: 6 }}>
                  <Camera size={8} />Фото
                </Badge>
                <Box px="2" py="1" style={{ background: "var(--gray-a2)", borderTop: "1px solid var(--gray-a4)" }}>
                  <Text size="1" color="gray">{formatTimeAgo(asset.created_at)}</Text>
                </Box>
              </Box>
            ))}
          </Grid>
        </Box>
      )}

      {/* No photos yet */}
      {photos.length === 0 && (
        <Card style={{ textAlign: "center", border: "1px dashed var(--gray-a6)" }}>
          <Flex direction="column" align="center" py="5" gap="3">
            <Box style={{ width: 48, height: 48, borderRadius: "var(--radius-3)", background: "var(--pink-a3)", border: "1px solid var(--pink-a6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={20} style={{ color: "var(--pink-11)" }} />
            </Box>
            <Text size="2" weight="medium">Видео из фото недоступно</Text>
            <Text size="2" color="gray">Сначала сгенерируйте фото персонажа — затем превратите их в видео одним кликом</Text>
            <Link to={`/generate/photo?project=${project.id}`} style={{ textDecoration: "none" }}>
              <Button size="2" style={{ cursor: "pointer" }}>Генерировать фото →</Button>
            </Link>
          </Flex>
        </Card>
      )}

      {/* Project info */}
      <Card>
        <Text size="1" color="gray" style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, display: "block", marginBottom: 12 }}>
          Информация о проекте
        </Text>
        <Flex direction="column" gap="2">
          {[
            ["Имя персонажа", project.character_name],
            ["Кампания", project.campaign_name],
            ["Статус", project.status === "active" ? "Активный" : "Пауза"],
            ["Создан", formatDate(project.created_at)],
            ["Обновлён", formatDate(project.updated_at)],
          ].map(([label, value]) => (
            <Flex key={label} align="center" gap="3">
              <Text size="2" color="gray" style={{ width: 120, flexShrink: 0 }}>{label}</Text>
              <Text size="2" weight="medium">{value}</Text>
            </Flex>
          ))}
        </Flex>
      </Card>

      {/* Video generation modal */}
      {videoModalPhoto && (
        <VideoGenModal
          photo={videoModalPhoto}
          projectId={project.id}
          userId={userId}
          open={!!videoModalPhoto}
          onClose={() => setVideoModalPhoto(null)}
          onDone={() => {
            queryClient.invalidateQueries({ queryKey: ["project-assets", project.id] });
            queryClient.invalidateQueries({ queryKey: ["user-balance", userId] });
          }}
        />
      )}
    </Flex>
  );
}

// ── Generations Tab ───────────────────────────────────────────────────────────
function GenerationsTab({ projectId, userId }: { projectId: string; userId: string }) {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [videoModalPhoto, setVideoModalPhoto] = useState<Asset | null>(null);

  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["project-assets", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_assets").select("*")
        .eq("user_id", userId).eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Asset[];
    },
    enabled: !!userId && !!projectId,
  });

  const { mutate: deleteAsset } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("generated_assets").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-assets", projectId] });
      toast.success("Удалено");
    },
    onError: () => toast.error("Ошибка удаления"),
  });

  const filtered = typeFilter === "all" ? assets : assets.filter(a => a.type === typeFilter);

  return (
    <Box>
      <Flex align="center" justify="between" mb="4">
        {/* Type filter as Radix Tabs (pills style) */}
        <Tabs.Root value={typeFilter} onValueChange={setTypeFilter}>
          <Tabs.List size="1">
            <Tabs.Trigger value="all">Все</Tabs.Trigger>
            <Tabs.Trigger value="photo">Фото</Tabs.Trigger>
            <Tabs.Trigger value="video">Видео</Tabs.Trigger>
            <Tabs.Trigger value="motion">Motion</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
        <Text size="2" color="gray">{isLoading ? "..." : `${filtered.length} генераций`}</Text>
      </Flex>

      {isLoading && (
        <Grid columns={{ initial: "2", sm: "3" }} gap="3">
          {[1, 2, 3, 4, 5, 6].map(i => <Box key={i} style={{ height: 192, borderRadius: "var(--radius-4)", background: "var(--gray-a3)", animation: "pulse 2s infinite" }} />)}
        </Grid>
      )}

      {!isLoading && filtered.length === 0 && (
        <Card style={{ textAlign: "center", border: "1px dashed var(--gray-a6)" }}>
          <Flex direction="column" align="center" py="7" gap="3">
            <ImageIcon size={28} style={{ color: "var(--gray-9)" }} />
            <Text size="3" weight="medium">{assets.length === 0 ? "Генераций ещё нет" : "Ничего по фильтру"}</Text>
            <Text size="2" color="gray">{assets.length === 0 ? "Создайте первое фото или видео для этого проекта" : "Попробуйте другой тип"}</Text>
            {assets.length === 0 && (
              <Link to={`/generate/photo?project=${projectId}`} style={{ textDecoration: "none" }}>
                <Button size="2" style={{ cursor: "pointer" }}>Генерировать фото →</Button>
              </Link>
            )}
          </Flex>
        </Card>
      )}

      {!isLoading && filtered.length > 0 && (
        <Grid columns={{ initial: "2", sm: "3" }} gap="3">
          {filtered.map(asset => {
            const meta = TYPE_META[asset.type] ?? TYPE_META.photo;
            const isVideo = asset.type === "video" || asset.type === "motion";
            return (
              <Card key={asset.id} style={{ overflow: "hidden", padding: 0 }}>
                <Box style={{ position: "relative", height: 176, background: "#000" }}>
                  {isVideo && asset.result_url ? (
                    <video src={asset.result_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline
                      onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                      onMouseLeave={e => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0; }}
                    />
                  ) : (
                    <img src={asset.result_url} alt={asset.prompt} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                  )}
                  <Badge color={meta.color} variant="soft" size="1" style={{ position: "absolute", top: 6, left: 6 }}>
                    <meta.Icon size={9} />{meta.label}
                  </Badge>
                  {/* Action buttons */}
                  <Flex gap="1" style={{ position: "absolute", top: 6, right: 6 }}>
                    {asset.type === "photo" && (
                      <Tooltip content="Создать видео из фото">
                        <IconButton
                          size="1" color="pink" variant="solid"
                          onClick={() => setVideoModalPhoto(asset)}
                          style={{ cursor: "pointer", opacity: 0.85 }}
                        >
                          <Play size={10} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip content="Скачать">
                      <a href={asset.result_url} download={`${asset.type}-${asset.id.slice(0, 8)}.${isVideo ? "mp4" : "png"}`}
                        onClick={e => e.stopPropagation()}>
                        <IconButton size="1" variant="solid" color="gray" style={{ cursor: "pointer", opacity: 0.85 }}>
                          <Download size={10} />
                        </IconButton>
                      </a>
                    </Tooltip>
                    <Tooltip content="Удалить">
                      <IconButton size="1" color="red" variant="solid" onClick={() => deleteAsset(asset.id)} style={{ cursor: "pointer", opacity: 0.85 }}>
                        <Trash2 size={10} />
                      </IconButton>
                    </Tooltip>
                  </Flex>
                </Box>
                <Box px="2" py="2">
                  <Text size="1" color="gray" truncate style={{ display: "block" }}>{asset.prompt}</Text>
                  <Text size="1" color="gray">{formatDate(asset.created_at)} · {asset.cost} кр</Text>
                </Box>
              </Card>
            );
          })}
        </Grid>
      )}

      {videoModalPhoto && (
        <VideoGenModal
          photo={videoModalPhoto}
          projectId={projectId}
          userId={userId}
          open={!!videoModalPhoto}
          onClose={() => setVideoModalPhoto(null)}
          onDone={() => {
            queryClient.invalidateQueries({ queryKey: ["project-assets", projectId] });
            queryClient.invalidateQueries({ queryKey: ["user-balance", userId] });
            setVideoModalPhoto(null);
          }}
        />
      )}
    </Box>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab({ project, onDelete }: { project: Project; onDelete: () => void }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [name, setName] = useState(project.character_name);
  const [campaign, setCampaign] = useState(project.campaign_name);
  const [emoji, setEmoji] = useState(project.emoji);
  const [status, setStatus] = useState(project.status);
  const [confirmDel, setConfirmDel] = useState(false);

  const { mutate: updateProject, isPending: isSaving } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("user_projects")
        .update({ character_name: name.trim(), campaign_name: campaign.trim(), emoji, status, updated_at: new Date().toISOString() })
        .eq("id", project.id).eq("user_id", user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-projects", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["project-detail", project.id] });
      toast.success("Проект обновлён");
    },
    onError: () => toast.error("Ошибка сохранения"),
  });

  const EMOJI_OPTIONS = ["👩‍💼", "👨‍💼", "👩‍🎨", "👨‍🎨", "👩‍💻", "👨‍💻", "🌟", "🚀", "💎", "🔥", "⚡", "🎯"];

  return (
    <Flex direction="column" gap="5" style={{ maxWidth: 480 }}>
      {/* Emoji picker */}
      <Box>
        <Text size="2" weight="medium" style={{ display: "block", marginBottom: 12 }}>Аватар персонажа</Text>
        <Flex wrap="wrap" gap="2">
          {EMOJI_OPTIONS.map(e => (
            <Button
              key={e}
              variant={emoji === e ? "solid" : "soft"}
              color={emoji === e ? "blue" : "gray"}
              size="2"
              onClick={() => setEmoji(e)}
              style={{ fontSize: 18, cursor: "pointer", width: 42, height: 42, padding: 0 }}
            >
              {e}
            </Button>
          ))}
        </Flex>
      </Box>

      <Box>
        <Text as="label" size="2" weight="medium" style={{ display: "block", marginBottom: 8 }}>Имя персонажа</Text>
        <TextField.Root value={name} onChange={e => setName(e.target.value)} placeholder="Например: Nova" size="3" />
      </Box>

      <Box>
        <Text as="label" size="2" weight="medium" style={{ display: "block", marginBottom: 8 }}>Название кампании</Text>
        <TextField.Root value={campaign} onChange={e => setCampaign(e.target.value)} placeholder="Например: Spring 2025" size="3" />
      </Box>

      <Box>
        <Text size="2" weight="medium" style={{ display: "block", marginBottom: 8 }}>Статус</Text>
        <Flex gap="2">
          {([
            ["active", "Активный", "green"],
            ["paused", "Пауза", "amber"],
          ] as const).map(([s, label, color]) => (
            <Button
              key={s}
              variant={status === s ? "solid" : "soft"}
              color={color}
              onClick={() => setStatus(s)}
              style={{ flex: 1, cursor: "pointer" }}
            >
              {label}
            </Button>
          ))}
        </Flex>
      </Box>

      <Button size="3" onClick={() => updateProject()} disabled={isSaving || !name.trim()} style={{ cursor: "pointer" }}>
        {isSaving ? <><Loader2 size={15} className="animate-spin" />Сохраняем...</> : "Сохранить изменения"}
      </Button>

      <Separator />

      {/* Danger zone */}
      <Card style={{ background: "var(--red-a2)", border: "1px solid var(--red-a5)" }}>
        <Heading size="3" style={{ color: "var(--red-11)", marginBottom: 6 }}>Опасная зона</Heading>
        <Text size="2" color="gray" style={{ display: "block", marginBottom: 12 }}>
          Удаление проекта необратимо. Все генерации этого проекта будут удалены.
        </Text>
        {confirmDel ? (
          <Flex gap="2">
            <Button color="red" onClick={onDelete} style={{ cursor: "pointer", flex: 1 }}>Подтвердить удаление</Button>
            <Button variant="soft" color="gray" onClick={() => setConfirmDel(false)} style={{ cursor: "pointer", flex: 1 }}>Отмена</Button>
          </Flex>
        ) : (
          <Button color="red" variant="soft" onClick={() => setConfirmDel(true)} style={{ cursor: "pointer" }}>
            Удалить проект
          </Button>
        )}
      </Card>
    </Flex>
  );
}

// ── Main Project Detail Page ──────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDark = theme === "dark";

  const pathname = window.location.pathname;
  const activeTab = pathname.includes("/generations") ? "generations"
    : pathname.includes("/settings") ? "settings"
    : "overview";

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_projects").select("*").eq("id", id).eq("user_id", user?.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user?.id,
  });

  const { data: allAssets = [] } = useQuery<Asset[]>({
    queryKey: ["project-assets", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_assets").select("*")
        .eq("user_id", user?.id).eq("project_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Asset[];
    },
    enabled: !!id && !!user?.id,
  });

  const { mutate: deleteProject } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("user_projects").delete().eq("id", id).eq("user_id", user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-projects", user?.id] });
      toast.success("Проект удалён");
      navigate("/projects");
    },
    onError: () => toast.error("Ошибка удаления"),
  });

  const TAB_ITEMS = [
    { id: "overview",    label: "Обзор",     Icon: BarChart3, href: `/projects/${id}/overview`    },
    { id: "generations", label: "Генерации", Icon: ImageIcon, href: `/projects/${id}/generations` },
    { id: "settings",    label: "Настройки", Icon: Settings,  href: `/projects/${id}/settings`    },
  ];

  if (isLoading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: "var(--gray-9)" }} />
      </Flex>
    );
  }

  if (!project) {
    return (
      <Flex direction="column" align="center" justify="center" gap="4" style={{ minHeight: "100vh" }}>
        <Text size="3" weight="medium">Проект не найден</Text>
        <Link to="/projects" style={{ textDecoration: "none" }}>
          <Button size="2" style={{ cursor: "pointer" }}>К проектам →</Button>
        </Link>
      </Flex>
    );
  }

  return (
    <Box style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      {/* Header */}
      <Flex
        align="center"
        gap="3"
        px="4"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          height: 64,
          background: "var(--color-panel-translucent)",
          borderBottom: "1px solid var(--gray-a4)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Link to="/projects" style={{ textDecoration: "none" }}>
          <Button variant="ghost" size="2" style={{ cursor: "pointer" }}>
            <ArrowLeft size={15} />
            <Text className="hidden sm:inline">Проекты</Text>
          </Button>
        </Link>
        <Separator orientation="vertical" style={{ height: 20 }} />
        <Flex align="center" gap="2" style={{ flex: 1, minWidth: 0 }}>
          <Text size="5">{project.emoji}</Text>
          <Text size="2" weight="medium" truncate>{project.character_name}</Text>
          <Text color="gray">/</Text>
          <Text size="2" color="gray">{activeTab === "overview" ? "Обзор" : activeTab === "generations" ? "Генерации" : "Настройки"}</Text>
        </Flex>
        <Link to={`/generate/photo?project=${project.id}`} style={{ textDecoration: "none" }} className="hidden sm:block">
          <Button variant="outline" size="2" style={{ cursor: "pointer" }}>
            <Plus size={12} />Генерировать
          </Button>
        </Link>
        <Tooltip content={isDark ? "Светлая тема" : "Тёмная тема"}>
          <IconButton variant="soft" onClick={toggleTheme} size="2" radius="full">
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </IconButton>
        </Tooltip>
      </Flex>

      <Box style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
        {/* Project hero */}
        <Flex align="center" gap="4" mb="6">
          <Box
            style={{
              width: 64, height: 64, borderRadius: "var(--radius-4)",
              background: "var(--gray-a3)", border: "1px solid var(--gray-a5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, flexShrink: 0,
            }}
          >
            {project.emoji}
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Flex align="center" gap="2" mb="1" wrap="wrap">
              <Heading size="5" truncate>{project.character_name}</Heading>
              <Badge color={project.status === "active" ? "green" : "amber"} variant="soft">
                {project.status === "active" ? "Активный" : "Пауза"}
              </Badge>
            </Flex>
            <Text size="2" color="gray">
              {project.campaign_name} · {project.generations_count} генераций · {formatDate(project.created_at)}
            </Text>
          </Box>
        </Flex>

        {/* Sub-nav using Radix Tabs */}
        <Tabs.Root
          value={activeTab}
          onValueChange={(val) => {
            const tab = TAB_ITEMS.find(t => t.id === val);
            if (tab) navigate(tab.href);
          }}
          mb="5"
        >
          <Tabs.List>
            {TAB_ITEMS.map(tab => (
              <Tabs.Trigger key={tab.id} value={tab.id}>
                <tab.Icon size={13} style={{ marginRight: 6 }} />
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Box mt="5">
            <Tabs.Content value="overview">
              {user?.id && <OverviewTab project={project} assets={allAssets} userId={user.id} />}
            </Tabs.Content>
            <Tabs.Content value="generations">
              {user?.id && <GenerationsTab projectId={project.id} userId={user.id} />}
            </Tabs.Content>
            <Tabs.Content value="settings">
              <SettingsTab project={project} onDelete={() => deleteProject()} />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Box>
    </Box>
  );
}
