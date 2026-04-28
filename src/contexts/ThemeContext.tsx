import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Theme as RadixTheme } from "@radix-ui/themes";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

const SYSTEM_MQ = typeof window !== "undefined"
  ? window.matchMedia("(prefers-color-scheme: dark)")
  : null;

function getSystemTheme(): Theme {
  return SYSTEM_MQ?.matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const _saved = typeof window !== "undefined"
    ? (localStorage.getItem("dfl-theme-override") as Theme | null)
    : null;
  const _initial: Theme | null = _saved === "dark" || _saved === "light" ? _saved : null;

  const userOverride = useRef<Theme | null>(_initial);
  const [theme, setThemeState] = useState<Theme>(_initial ?? getSystemTheme());

  // Apply to DOM whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Listen to system preference changes
  useEffect(() => {
    if (!SYSTEM_MQ) return;
    const handler = (e: MediaQueryListEvent) => {
      if (!userOverride.current) {
        setThemeState(e.matches ? "dark" : "light");
      }
    };
    SYSTEM_MQ.addEventListener("change", handler);
    return () => SYSTEM_MQ.removeEventListener("change", handler);
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      userOverride.current = next;
      localStorage.setItem("dfl-theme-override", next);
      return next;
    });
  };

  const setTheme = (t: Theme) => {
    userOverride.current = t;
    localStorage.setItem("dfl-theme-override", t);
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <RadixTheme
        appearance={theme}
        accentColor="blue"
        grayColor="slate"
        radius="large"
        scaling="100%"
        panelBackground="translucent"
      >
        {children}
      </RadixTheme>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
