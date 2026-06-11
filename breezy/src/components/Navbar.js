import Link from "next/link";
import ThemeSelector from "./ThemeSelector";

export default function Navbar() {
  return (
    <nav className="bg-card text-foreground border-b border-border px-6 py-4 sticky top-0 z-40 backdrop-blur-md transition-all duration-250 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/">
          <span className="text-2xl font-black tracking-tight text-primary cursor-pointer transition-transform hover:scale-105 duration-200">
            Breezy
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/tweet/create">
            <span className="text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-full transition-all duration-200 shadow-md hover:opacity-90 cursor-pointer">
              Écrire un tweet
            </span>
          </Link>
          
          <ThemeSelector />
        </div>
      </div>
    </nav>
  );
}