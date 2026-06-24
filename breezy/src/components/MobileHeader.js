"use client";

import Link from "next/link";
import ThemeSelector from "./ThemeSelector";

export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-35 flex md:hidden items-center justify-between px-6 py-4 bg-card/85 backdrop-blur-md border-b border-border transition-all duration-250">
      <Link href="/">
        <span className="text-2xl font-black tracking-tight text-primary cursor-pointer transition-transform hover:scale-105 duration-200">
          Breezy
        </span>
      </Link>
      
      <div className="flex items-center gap-4">
        <ThemeSelector />
      </div>
    </header>
  );
}
