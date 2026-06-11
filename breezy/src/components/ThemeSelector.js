"use client";

import { useTheme } from "./ThemeProvider";
import { useState, useEffect, useRef } from "react";

const themes = [
  { id: "light", name: "Clair", icon: "☀️", colorPreview: "bg-white border border-gray-300" },
  { id: "dark", name: "Sombre", icon: "🌙", colorPreview: "bg-zinc-900 border border-zinc-700" },
  { id: "system", name: "Automatique", icon: "🖥️", colorPreview: "bg-gradient-to-r from-white to-zinc-900 border border-gray-300" },
  { id: "sepia", name: "Sépia", icon: "🎨", colorPreview: "bg-[#fdfaf2] border border-[#d7c59e]" },
  { id: "nord", name: "Nord", icon: "❄️", colorPreview: "bg-[#3b4252] border border-[#4c566a]" },
  { id: "sunset", name: "Sunset", icon: "🌅", colorPreview: "bg-[#1e133a] border border-[#3f297a]" }
];

export default function ThemeSelector() {
  const { theme, setTheme, mounted } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    // Rendre un squelette temporaire pour éviter les sauts de mise en page
    return (
      <div className="w-40 h-10 bg-gray-200/20 rounded-lg animate-pulse"></div>
    );
  }

  const currentThemeObj = themes.find((t) => t.id === theme) || themes[2];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex justify-between items-center w-40 rounded-lg border border-gray-200/10 bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 shadow-sm cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span>{currentThemeObj.icon}</span>
            <span>{currentThemeObj.name}</span>
          </span>
          <svg
            className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-52 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] ring-1 ring-black/5 divide-y divide-[var(--color-border)] z-50 focus:outline-none transition-all duration-200">
          <div className="py-1.5 p-1">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-lg transition-colors cursor-pointer ${
                  theme === t.id
                    ? "bg-[var(--color-secondary)] text-[var(--color-primary)] font-semibold"
                    : "text-[var(--color-base)] hover:bg-[var(--color-secondary)]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">{t.icon}</span>
                  <span>{t.name}</span>
                </span>
                
                <span className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full ${t.colorPreview}`}></span>
                  
                  {theme === t.id && (
                    <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
