"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaUser, FaSearch, FaFeatherAlt, FaEnvelope, FaShieldAlt } from "react-icons/fa";

export default function MobileNav() {
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

  const navItems = [
    { name: "Accueil", href: "/", icon: <FaHome className="text-xl" /> },
    { name: "Rechercher", href: "/search", icon: <FaSearch className="text-xl" /> },
  ];

  if (user) {
    navItems.push(
      { name: "Poster", href: "/tweet/create", icon: <FaFeatherAlt className="text-xl" /> },
      // { name: "Message", href: "/messages", icon: <FaEnvelope className="text-xl" /> },
      { name: "Profil", href: "/user/me", icon: <FaUser className="text-xl" /> }
    );

    if (user.role === "admin" || user.role === "moderator") {
      navItems.push(
        { name: "Modération", href: "/moderation", icon: <FaShieldAlt className="text-xl" /> }
      );
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-35 h-16 bg-card border-t border-border flex justify-around items-center md:hidden shadow-lg transition-all duration-250">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link href={item.href} key={item.name} className="flex-1 h-full">
            <span
              className={`flex flex-col justify-center items-center h-full w-full gap-0.5 cursor-pointer transition-colors duration-200 ${
                isActive ? "text-primary" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.name}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
