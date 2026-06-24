"use client";

import { useEffect, useState } from "react";
import { getAllTweets, getFollowedTweets } from "@/utils/api";
import OneTweet from "./OneTweet"; // Ajuste le chemin selon où tu as placé ton composant

export default function ListTweet({ type = "all" }) {
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState("");
    const [isGuest, setIsGuest] = useState(false);

    // Reset state when feed type changes
    useEffect(() => {
        setTweets([]);
        setPage(1);
        setHasMore(true);
        setLoading(true);
        setLoadingMore(false);
        setError("");
        setIsGuest(false);
    }, [type]);

    useEffect(() => {
        const token = localStorage.getItem("breezy_jwt");
        if (!token) {
            setIsGuest(true);
            setLoading(false);
            return;
        }

        let isCurrent = true;

        const fetchTweets = async () => {
            const isInitial = page === 1;
            if (isInitial) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            try {
                const data = type === "followed" 
                    ? await getFollowedTweets(page, 15) 
                    : await getAllTweets(page, 15);

                if (!isCurrent) return;

                const newTweets = data || [];
                if (isInitial) {
                    setTweets(newTweets);
                } else {
                    setTweets((prev) => {
                        // Avoid duplicates in case of quick edits or timing gaps
                        const existingIds = new Set(prev.map(t => t._id));
                        const filteredNew = newTweets.filter(t => !existingIds.has(t._id));
                        return [...prev, ...filteredNew];
                    });
                }

                if (newTweets.length < 15) {
                    setHasMore(false);
                }
            } catch (err) {
                if (!isCurrent) return;
                console.error("Error fetching tweets:", err);
                if (err.status === 401 || err.response?.status === 401) {
                    setIsGuest(true);
                } else {
                    setError(err.message || "Impossible de charger les tweets.");
                }
            } finally {
                if (isCurrent) {
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        };

        fetchTweets();

        return () => {
            isCurrent = false;
        };
    }, [type, page]);

    // Setup scroll listener to load more tweets
    useEffect(() => {
        const handleScroll = () => {
            if (loading || loadingMore || !hasMore) return;

            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const clientHeight = document.documentElement.clientHeight;

            // Trigger when scrolled near the bottom (within 150px)
            if (scrollTop + clientHeight >= scrollHeight - 150) {
                setPage((prevPage) => prevPage + 1);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, loadingMore, hasMore]);

    if (loading && page === 1) {
        return (
            <div className="p-8 text-center text-gray-500">
                Chargement des messages...
            </div>
        );
    }

    if (isGuest) {
        return (
            <div className="p-8 text-center text-gray-500 bg-secondary/20 rounded-xl border border-dashed border-border max-w-md mx-auto mt-8">
                <p className="font-semibold mb-2">Bienvenue sur Breezy !</p>
                <p className="text-sm opacity-80 mb-4">
                    {type === "followed" 
                        ? "Veuillez vous connecter pour voir les messages de vos abonnements." 
                        : "Veuillez vous connecter pour voir le flux chronologique des messages."}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg max-w-md mx-auto mt-8 text-sm font-medium">
                {error}
            </div>
        );
    }

    // Si on a récupéré les données mais que la base est vide
    if (!tweets || tweets.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-secondary/10 rounded-xl border border-dashed border-border mt-4">
                {type === "followed" 
                    ? "Aucun message de vos abonnements. Suivez d'autres utilisateurs pour voir leurs tweets !" 
                    : "Aucun tweet n'a été publié. Soyez le premier !"}
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="w-full bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-250">
                {tweets.map((tweet) => (
                    <OneTweet
                        key={tweet._id} // Mongoose génère un _id, il est crucial pour React
                        tweet={tweet}
                    />
                ))}
            </div>

            {loadingMore && (
                <div className="p-4 text-center text-sm text-foreground/60 bg-card border border-border rounded-xl shadow-sm animate-pulse">
                    Chargement des messages suivants...
                </div>
            )}

            {!hasMore && tweets.length > 0 && (
                <div className="p-4 text-center text-sm text-foreground/40 font-medium">
                    Vous avez vu tous les messages.
                </div>
            )}
        </div>
    );
}