import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Sun, Moon, Zap } from "lucide-react";
import {
  Box, Button, Card, Flex, Heading, IconButton, Separator, Text, TextField, Tooltip,
} from "@radix-ui/themes";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const EMOJI_OPTIONS = [
  "👩‍💼", "👨‍💼", "👩‍🎨", "👨‍🎨", "👩‍💻", "👨‍💻",
  "🌟", "🚀", "💎", "🔥", "⚡", "🎯", "🦋", "🌺",
];

const STYLE_OPTIONS = ["Fashion", "Beauty", "Tech", "Lifestyle", "E-commerce", "Sport", "Food", "Travel", "Finance", "Other"];

export default function ProjectNewPage() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isDark = theme === "dark";

  const [characterName, setCharacterName] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [emoji, setEmoji] = useState("👩‍💼");
  const [style, setStyle] = useState("");

  const { mutate: createProject, isPending } = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Необходима авторизация");
      const { data, error } = await supabase
        .from("user_projects")
        .insert({
          user_id: user.id,
          character_name: characterName.trim(),
          campaign_name: campaignName.trim() || "Новая кампания",
          emoji,
          status: "active",
          generations_count: 0,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-projects", user?.id] });
      toast.success("Проект создан!");
      navigate(`/projects/${data.id}/overview`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName.trim()) { toast.error("Введите имя персонажа"); return; }
    createProject();
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
        <Link to="/projects" style={{ textDecoration: "none" }}>
          <Button variant="ghost" size="2" style={{ cursor: "pointer" }}>
            <ArrowLeft size={15} /><Text className="hidden sm:inline">Проекты</Text>
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
        <Tooltip content={isDark ? "Светлая тема" : "Тёмная тема"}>
          <IconButton variant="soft" onClick={toggleTheme} size="2" radius="full">
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </IconButton>
        </Tooltip>
      </Flex>

      <Box style={{ maxWidth: 540, margin: "0 auto", padding: "40px 16px" }}>
        {/* Title */}
        <Box mb="7">
          <Heading size="7" mb="2">Создать AI-инфлюенсера</Heading>
          <Text size="2" color="gray">
            Задайте основные параметры персонажа — вы сможете изменить их позже в настройках проекта.
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="5">
            {/* Emoji */}
            <Box>
              <Text size="2" weight="medium" style={{ display: "block", marginBottom: 12 }}>
                Аватар персонажа
              </Text>
              <Flex wrap="wrap" gap="2">
                {EMOJI_OPTIONS.map(e => (
                  <Button
                    key={e}
                    type="button"
                    variant={emoji === e ? "solid" : "soft"}
                    color={emoji === e ? "blue" : "gray"}
                    size="2"
                    onClick={() => setEmoji(e)}
                    style={{ fontSize: 20, cursor: "pointer", width: 44, height: 44, padding: 0 }}
                  >
                    {e}
                  </Button>
                ))}
              </Flex>

              {/* Preview */}
              <Card mt="3">
                <Flex align="center" gap="3">
                  <Text size="7">{emoji}</Text>
                  <Box>
                    <Text size="2" weight="medium" style={{ display: "block" }}>
                      {characterName || "Имя персонажа"}
                    </Text>
                    <Text size="1" color="gray">
                      {campaignName || "Название кампании"} · AI-инфлюенсер
                    </Text>
                  </Box>
                </Flex>
              </Card>
            </Box>

            {/* Character name */}
            <Box>
              <Text as="label" size="2" weight="medium" htmlFor="char-name" style={{ display: "block", marginBottom: 8 }}>
                Имя персонажа <Text style={{ color: "var(--red-11)" }}>*</Text>
              </Text>
              <TextField.Root
                id="char-name"
                value={characterName}
                onChange={e => setCharacterName(e.target.value)}
                placeholder="Например: Nova, Alix, Max..."
                maxLength={40}
                disabled={isPending}
                size="3"
              />
              <Text size="1" color="gray" mt="1" style={{ display: "block" }}>
                Уникальное имя вашего AI-инфлюенсера
              </Text>
            </Box>

            {/* Campaign name */}
            <Box>
              <Text as="label" size="2" weight="medium" htmlFor="camp-name" style={{ display: "block", marginBottom: 8 }}>
                Название кампании <Text size="1" color="gray">(необязательно)</Text>
              </Text>
              <TextField.Root
                id="camp-name"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="Например: Spring 2025, Brand Relaunch..."
                maxLength={60}
                disabled={isPending}
                size="3"
              />
            </Box>

            {/* Style / niche */}
            <Box>
              <Text size="2" weight="medium" style={{ display: "block", marginBottom: 8 }}>
                Ниша бренда <Text size="1" color="gray">(необязательно)</Text>
              </Text>
              <Flex wrap="wrap" gap="2">
                {STYLE_OPTIONS.map(s => (
                  <Button
                    key={s}
                    type="button"
                    variant={style === s ? "solid" : "soft"}
                    color={style === s ? "blue" : "gray"}
                    size="1"
                    onClick={() => setStyle(style === s ? "" : s)}
                    style={{ cursor: "pointer" }}
                  >
                    {s}
                  </Button>
                ))}
              </Flex>
            </Box>

            {/* Info block */}
            <Card style={{ background: "var(--blue-a2)", border: "1px solid var(--blue-a4)" }}>
              <Text size="2" color="gray">
                После создания проекта вы сможете заполнить бренд-бриф, настроить внешность персонажа и начать генерацию фото и видео.
              </Text>
            </Card>

            {/* Submit */}
            <Flex gap="3">
              <Link to="/projects" style={{ flex: 1, textDecoration: "none" }}>
                <Button variant="outline" size="3" style={{ width: "100%", cursor: "pointer" }}>Отмена</Button>
              </Link>
              <Button
                type="submit"
                size="3"
                disabled={isPending || !characterName.trim()}
                style={{ flex: 2, cursor: "pointer" }}
              >
                {isPending ? <><Loader2 size={16} className="animate-spin" />Создаём...</> : "Создать проект →"}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}
