"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  // Par défaut en SSR, on utilise 'system' pour être neutre, puis on résout au montage.
  const [theme, setThemeState] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  // Lire le thème depuis localStorage lors du montage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    setThemeState(savedTheme);
    setMounted(true);
  }, []);

  // Synchroniser le thème avec le DOM et gérer les préférences système
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    const applyTheme = (currentTheme) => {
      root.setAttribute("data-theme", currentTheme);
      
      let resolved = currentTheme;
      if (currentTheme === "system") {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        resolved = systemPrefersDark ? "dark" : "light";
      }
      setResolvedTheme(resolved);
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    // Écouter les changements système si 'system' est sélectionné
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemThemeChange = () => {
        applyTheme("system");
      };
      
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme doit être utilisé à l'intérieur d'un ThemeProvider");
  }
  return context;
}
