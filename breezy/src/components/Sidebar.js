"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FaHome, FaUser, FaSearch, FaFeatherAlt, FaEnvelope, FaSignOutAlt, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import ThemeSelector from "./ThemeSelector";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
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

  const navItems = [
    { name: "Accueil", href: "/", icon: <FaHome className="text-xl" /> },
    { name: "Rechercher", href: "/search", icon: <FaSearch className="text-xl" /> },
  ];

  if (user) {
    navItems.push(
      { name: "Message", href: "/messages", icon: <FaEnvelope className="text-xl" /> },
      { name: "Poster", href: "/tweet/create", icon: <FaFeatherAlt className="text-xl" /> },
      { name: "Profil", href: "/user/me", icon: <FaUser className="text-xl" /> }
    );
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 py-8 px-6 hidden md:flex flex-col justify-between border-r border-border bg-card transition-all duration-250 z-40">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <Link href="/">
          <span className="text-3xl font-black tracking-tight text-primary cursor-pointer transition-transform hover:scale-105 duration-200 block">
            Breezy
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link href={item.href} key={item.name}>
                <span
                  className={`flex items-center gap-4 px-4 py-3 rounded-full text-lg font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary/40 text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Actions & Theme Selector */}
      <div className="flex flex-col gap-6 pt-6 border-t border-border">
        {/* Theme Selector */}
        <div className="flex flex-col gap-2 px-2">
          <span className="text-xs font-bold uppercase tracking-wider opacity-65">Thème</span>
          <ThemeSelector position="up" />
        </div>

        {user ? (
          <div className="flex flex-col gap-3">
            {/* User Info Card */}
            <Link href="/user/me" className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/30 transition-colors duration-200">
              <img
                src={user.userPhoto || `https://ui-avatars.com/api/?name=${user.userDisplayName || user.userName}&background=random&color=fff`}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-foreground text-sm truncate">{user.userDisplayName || user.userName}</span>
                <span className="opacity-60 text-xs truncate">@{user.userName}</span>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full transition-all duration-200 cursor-pointer text-sm"
            >
              <FaSignOutAlt />
              Déconnexion
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/login">
              <span className="flex items-center justify-center gap-2 w-full py-2.5 px-4 font-bold text-foreground hover:bg-secondary/40 border border-border rounded-full transition-all duration-200 cursor-pointer text-sm text-center">
                <FaSignInAlt />
                Connexion
              </span>
            </Link>
            <Link href="/register">
              <span className="flex items-center justify-center gap-2 w-full py-2.5 px-4 font-bold text-white bg-primary hover:opacity-90 rounded-full transition-all duration-200 cursor-pointer text-sm text-center shadow-sm">
                <FaUserPlus />
                S'inscrire
              </span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
