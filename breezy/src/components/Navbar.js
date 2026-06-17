"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeSelector from "./ThemeSelector";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("breezy_user");
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    checkAuth();
    // Ecouter les changements d'auth (login / logout)
    window.addEventListener("auth-change", checkAuth);
    return () => {
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("breezy_jwt");
    localStorage.removeItem("breezy_user");
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="bg-card text-foreground border-b border-border px-6 py-4 sticky top-0 z-40 backdrop-blur-md transition-all duration-250 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/">
          <span className="text-2xl font-black tracking-tight text-primary cursor-pointer transition-transform hover:scale-105 duration-200">
            Breezy
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link href="/tweet/create">
                <span className="text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-full transition-all duration-200 shadow-md hover:opacity-90 cursor-pointer">
                  Écrire un tweet
                </span>
              </Link>
              <span className="text-sm opacity-80 hidden md:inline">
                Bonjour, <strong className="text-primary">{user.userDisplayName || user.userName}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold border border-primary text-primary px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:bg-primary/5 cursor-pointer"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <span className="text-sm font-semibold opacity-80 hover:text-primary transition-colors cursor-pointer">
                  Connexion
                </span>
              </Link>
              <Link href="/register">
                <span className="text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-full transition-all duration-200 shadow-md hover:opacity-90 cursor-pointer">
                  S'inscrire
                </span>
              </Link>
            </>
          )}
          
          <ThemeSelector />
        </div>
      </div>
    </nav>
  );
}