"use client";

import { useState, useEffect } from "react";
import ListTweet from "@/components/ListTweet";

export default function Home() {
  const [activeTab, setActiveTab] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("breezy_jwt");
    setIsLoggedIn(!!token);

    const handleAuthChange = () => {
      const currentToken = localStorage.getItem("breezy_jwt");
      setIsLoggedIn(!!currentToken);
    };

    window.addEventListener("auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  return (
    <main className="flex-1 py-10 px-4 md:px-8 max-w-6xl mx-auto w-full transition-colors duration-250">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-primary">
          Fil d'actualité
        </h1>
        <p className="text-lg opacity-85 max-w-xl mx-auto">
          Découvrez les derniers messages de la communauté et suivez vos utilisateurs préférés.
        </p>
      </div>

      {/* Tabs Switcher for all screens if logged in */}
      {isLoggedIn && (
        <div className="flex justify-center mb-8 bg-secondary/35 p-1.5 rounded-xl border border-border max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "all"
                ? "bg-card text-foreground shadow-sm"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            À la une
          </button>
          <button
            onClick={() => setActiveTab("followed")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "followed"
                ? "bg-card text-foreground shadow-sm"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Abonnements
          </button>
        </div>
      )}

      {/* Main Feed Container */}
      <div className="max-w-xl mx-auto">
        {isLoggedIn && activeTab === "followed" ? (
          <ListTweet type="followed" />
        ) : (
          <ListTweet type="all" />
        )}
      </div>
    </main>
  );
}
