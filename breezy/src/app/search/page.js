"use client";

import { useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <main className="flex-1 py-10 px-6 max-w-xl mx-auto w-full transition-colors duration-250">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-6 text-primary">Recherche</h1>
        
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-foreground/50">
            <FaSearch />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher des posts, des utilisateurs..."
            className="w-full pl-10 pr-4 py-3 bg-secondary/40 text-foreground border border-border rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
          />
        </div>
      </div>

      <div className="text-center py-16 opacity-65 bg-card border border-border rounded-xl">
        <p className="text-lg font-semibold">Trouvez ce qui vous intéresse</p>
        <p className="text-sm mt-1">Saisissez des mots-clés dans la barre de recherche ci-dessus.</p>
      </div>
    </main>
  );
}
