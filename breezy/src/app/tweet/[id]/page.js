"use client";

import { use, useEffect, useState } from "react";
import { createNewTweet, getOneTweet, getTweetsResponse } from "@/utils/api";
import OneTweet from "@/components/OneTweet";

export default function Tweet({ params }) {
    const { id } = use(params);

    const [tweet, setTweet] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    const loadData = async () => {
        try {
            setErrorMsg("");
            const fetchedTweet = await getOneTweet(id);
            setTweet(fetchedTweet);
            const fetchedResponses = await getTweetsResponse(id);
            setResponses(fetchedResponses || []);
        } catch (err) {
            setErrorMsg(err.message || "Impossible de charger ce tweet ou ses réponses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("breezy_user");
            if (userStr) {
                try {
                    setCurrentUser(JSON.parse(userStr));
                } catch (e) {
                    console.error("Error parsing user from localStorage:", e);
                }
            }
        }
    }, [id]);

    async function publishComment(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const content = formData.get("content");

        if (!content || content.trim() === "") return;

        try {
            await createNewTweet(content, id);
            e.target.reset();
            // On recharge les données pour afficher le nouveau commentaire
            await loadData();
        } catch (error) {
            console.error("Erreur lors de la réponse au tweet :", error);
            alert(error.message || "Erreur lors de la publication de la réponse.");
        }
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto mt-12 p-6 text-center text-gray-500">
                Chargement du tweet...
            </div>
        );
    }

    if (errorMsg || !tweet) {
        return (
            <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center font-medium">
                {errorMsg || "Impossible de charger ce tweet ou ses réponses. Il a peut-être été supprimé."}
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 px-4 flex flex-col gap-6">
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                {/* L'AFFICHAGE DU TWEET PRINCIPAL */}
                <OneTweet tweet={tweet} />

                {/* LA ZONE DE COMMENTAIRE */}
                <div className="p-4 bg-secondary/15 border-t border-border">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <img
                                src={currentUser?.userPhoto || (currentUser ? `https://ui-avatars.com/api/?name=${currentUser.userDisplayName || currentUser.userName}&background=random&color=fff` : "https://ui-avatars.com/api/?name=User&background=random&color=fff")}
                                alt={currentUser ? `Avatar de ${currentUser.userDisplayName || currentUser.userName}` : "Mon avatar"}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        </div>

                        <form onSubmit={publishComment} className="flex-1">
                            <label htmlFor="content" className="sr-only">Postez votre réponse</label>
                            <textarea
                                id="content"
                                name="content"
                                placeholder="Postez votre réponse !"
                                className="w-full p-3 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all duration-200 text-sm"
                                rows="3"
                                maxLength="280"
                                required
                            ></textarea>

                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    className="bg-primary hover:opacity-90 text-white font-bold py-2 px-5 rounded-full text-sm transition-all duration-200 shadow-sm cursor-pointer"
                                >
                                    Répondre
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="border-t border-border bg-card">
                    {responses && responses.length > 0 ? (
                        // On utilise .toReversed() pour avoir les réponses les plus récentes en haut
                        responses.toReversed().map((response) => (
                            <OneTweet key={response._id} tweet={response} />
                        ))
                    ) : (
                        <div className="p-8 text-center opacity-60 text-sm">
                            Aucune réponse pour le moment. Soyez le premier à répondre !
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}