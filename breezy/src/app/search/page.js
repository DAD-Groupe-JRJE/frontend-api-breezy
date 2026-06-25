"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaUser, FaFeatherAlt } from "react-icons/fa";
import Link from "next/link";
import OneTweet from "@/components/OneTweet";
import { searchUsers, searchTweets } from "@/utils/api";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users"); // "users" or "tweets"

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const [foundUsers, foundTweets] = await Promise.all([
            searchUsers(query),
            searchTweets(query)
          ]);
          setUsers(foundUsers || []);
          setTweets(foundTweets || []);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else {
        setUsers([]);
        setTweets([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <main className="flex-1 py-10 px-6 max-w-2xl mx-auto w-full transition-colors duration-250">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-6 text-primary">Recherche</h1>
        
        <div className="relative w-full mb-6">
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

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-3 flex justify-center items-center gap-2 font-bold transition-colors border-b-2 ${
              activeTab === "users" ? "border-primary text-primary" : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            <FaUser /> Utilisateurs ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("tweets")}
            className={`flex-1 py-3 flex justify-center items-center gap-2 font-bold transition-colors border-b-2 ${
              activeTab === "tweets" ? "border-primary text-primary" : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            <FaFeatherAlt /> Posts ({tweets.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-foreground/60 font-medium">Recherche en cours...</div>
      ) : query.trim() === "" ? (
        <div className="text-center py-16 opacity-65 bg-card border border-border rounded-xl">
          <p className="text-lg font-semibold">Trouvez ce qui vous intéresse</p>
          <p className="text-sm mt-1">Saisissez des mots-clés dans la barre de recherche ci-dessus.</p>
        </div>
      ) : activeTab === "users" ? (
        <div className="flex flex-col gap-4">
          {users.length > 0 ? (
            users.map(user => (
              <Link href={`/user/${user.userName}`} key={user.userId}>
                <div className="card flex items-center gap-4 p-4 border border-border hover:bg-secondary/20 transition-colors cursor-pointer">
                  <img
                    src={user.userPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userDisplayName || user.userName)}&background=random&color=fff&size=128`}
                    alt={user.userDisplayName}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{user.userDisplayName}</h3>
                    <p className="text-sm opacity-60 truncate">@{user.userName}</p>
                    {user.userBio && <p className="text-sm mt-1 opacity-80 truncate">{user.userBio}</p>}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-10 text-foreground/60 font-medium">Aucun utilisateur trouvé.</div>
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          {tweets.length > 0 ? (
            tweets.map(tweet => (
              <OneTweet key={tweet._id} tweet={tweet} />
            ))
          ) : (
            <div className="text-center py-10 text-foreground/60 font-medium">Aucun post trouvé.</div>
          )}
        </div>
      )}
    </main>
  );
}
