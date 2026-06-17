"use client";

import { use, useEffect, useState } from "react";
import { createNewTweet, getOneTweet, getTweetsResponse } from "@/utils/api";
import OneTweet from "@/components/OneTweet";

export default function Tweet({ params }) {
    const { id } = use(params);

    const [tweet, setTweet] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadData = async () => {
        try {
            const fetchedTweet = await getOneTweet(id);
            setTweet(fetchedTweet);
            const fetchedResponses = await getTweetsResponse(id);
            setResponses(fetchedResponses || []);
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
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
            alert("Erreur lors de la publication de la réponse.");
        }
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto mt-12 p-6 text-center text-gray-500">
                Chargement du tweet...
            </div>
        );
    }

    if (error || !tweet) {
        return (
            <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-xl text-center text-red-600">
                Impossible de charger ce tweet ou ses réponses. Il a peut-être été supprimé.
            </div>
        );
    }

    return (
        <div className="w-1/3 mx-auto mt-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* L'AFFICHAGE DU TWEET PRINCIPAL */}
            <OneTweet tweet={tweet} />

            {/* LA ZONE DE COMMENTAIRE */}
            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                        <img
                            src="https://ui-avatars.com/api/?name=User&background=random&color=fff"
                            alt="Mon avatar"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    </div>

                    <form onSubmit={publishComment} className="flex-1">
                        <label htmlFor="content" className="sr-only">Postez votre réponse</label>
                        <textarea
                            id="content"
                            name="content"
                            placeholder="Postez votre réponse !"
                            className="w-full p-3 bg-white text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                            rows="3"
                            maxLength="280"
                            required
                        ></textarea>

                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-full text-sm transition-colors duration-200 shadow-sm"
                            >
                                Répondre
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="border-t border-gray-100 bg-white">
                {responses && responses.length > 0 ? (
                    // On utilise .toReversed() pour avoir les réponses les plus récentes en haut
                    responses.toReversed().map((response) => (
                        <OneTweet key={response._id} tweet={response} />
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        Aucune réponse pour le moment. Soyez le premier à répondre !
                    </div>
                )}
            </div>
        </div>
    );
}