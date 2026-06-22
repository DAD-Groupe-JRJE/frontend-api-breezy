"use client";

import { useEffect, useState } from "react";
import { getAllTweets } from "@/utils/api";
import OneTweet from "./OneTweet"; // Ajuste le chemin selon où tu as placé ton composant

export default function ListTweet() {
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        // Vérification de la présence d'un token avant d'initier la requête
        const token = localStorage.getItem("breezy_jwt");
        if (!token) {
            setIsGuest(true);
            setLoading(false);
            return;
        }

        const fetchTweets = async () => {
            try {
                const data = await getAllTweets();
                setTweets(data || []);
            } catch (err) {
                console.error("Error fetching tweets:", err);
                if (err.status === 401 || err.response?.status === 401) {
                    setIsGuest(true);
                } else {
                    setError(err.message || "Impossible de charger les tweets.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTweets();
    }, []);

    if (loading) {
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
                <p className="text-sm opacity-80 mb-4">Veuillez vous connecter pour voir le flux chronologique des messages.</p>
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
            <div className="p-8 text-center text-gray-500">
                Aucun tweet n'a été publié. Soyez le premier !
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto mt-8 bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-250">
            {/* On parcourt le tableau de tweets.
              On utilise .toReversed() pour afficher les plus récents en haut
            */}
            {tweets.toReversed().map((tweet) => (
                <OneTweet
                    key={tweet._id} // Mongoose génère un _id, il est crucial pour React
                    tweet={tweet}
                />
            ))}
        </div>
    );
}