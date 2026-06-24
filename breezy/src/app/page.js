"use client";

import { useState, useEffect, useRef } from "react";
import ListTweet from "@/components/ListTweet";
import { createNewTweet } from "@/utils/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState(null);
  const formRef = useRef(null);

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

  async function publishTweet(formData) {
    setNotification(null);
    const content = formData.get("content");

    try {
      await createNewTweet(content);
      setNotification({ type: "success", message: "Post créé avec succès !" });
      formRef.current?.reset();
      
      // Force reload the list
      setRefreshKey(prev => prev + 1);

      setTimeout(() => {
        setNotification((prev) =>
          prev?.type === "success" ? null : prev
        );
      }, 3000);
    } catch (error) {
      setNotification({ type: "error", message: error.message });
    }
  }

  return (
    <main className="flex-1 py-10 px-4 md:px-8 max-w-6xl mx-auto w-full transition-colors duration-250">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-primary">
          Fil d'actualité
        </h1>
      </div>

      {/* Write a Post Form (only for logged-in users) */}
      {isLoggedIn && (
        <div className="w-full max-w-xl mx-auto mb-8 relative">
          {notification && (
            <div
              className={`mb-4 p-4 rounded-lg font-medium transition-all ${
                notification.type === "success"
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}
            >
              {notification.message}
            </div>
          )}

          <form
            ref={formRef}
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              await publishTweet(formData);
            }}
            className="card bg-card border border-border p-5 rounded-xl shadow-sm transition-all"
          >
            <div className="mb-4">
              <label htmlFor="content" className="sr-only">Contenu du post</label>
              <textarea
                id="content"
                name="content"
                placeholder="Quoi de neuf ?"
                className="w-full p-4 bg-secondary/40 text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all duration-200"
                rows="3"
                maxLength="280"
                required
              ></textarea>
            </div>

            <div className="flex justify-end items-center border-t pt-4 border-border">
              <span className="text-sm opacity-50 mr-4">Max 280 caractères</span>
              <button
                type="submit"
                className="bg-primary hover:opacity-90 text-white font-bold py-2 px-6 rounded-full transition-all duration-200 shadow-md cursor-pointer text-sm"
              >
                Poster
              </button>
            </div>
          </form>
        </div>
      )}

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
          <ListTweet key={`followed-${refreshKey}`} type="followed" />
        ) : (
          <ListTweet key={`all-${refreshKey}`} type="all" />
        )}
      </div>
    </main>
  );
}
