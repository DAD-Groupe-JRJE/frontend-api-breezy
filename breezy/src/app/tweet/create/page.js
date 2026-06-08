"use client"; // Indispensable pour utiliser useState, useRef et setTimeout

import { useState, useRef } from "react";
import { createNewTweet } from "@/utils/api";

export default function CreateTweet() {
    // État pour gérer la notification { type: "success" | "error", message: "..." }
    const [notification, setNotification] = useState(null);
    const formRef = useRef(null);

    async function publishTweet(formData) {
        // 1. On réinitialise les notifications à chaque nouvelle tentative
        setNotification(null);

        const content = formData.get("content");

        try {
            // 2. On appelle l'API
            await createNewTweet(content);

            // 3. Si succès : On affiche la pop-up verte
            setNotification({ type: "success", message: "Tweet créé avec succès !" });

            // 4. On vide le formulaire
            formRef.current?.reset();

            // 5. On fait disparaître la notification succès après 3 secondes (3000ms)
            setTimeout(() => {
                setNotification((prev) =>
                    // On vérifie que c'est bien toujours un succès avant de l'enlever
                    prev?.type === "success" ? null : prev
                );
            }, 3000);

        } catch (error) {
            // 6. Si erreur : On affiche l'erreur en rouge (pas de setTimeout, elle reste !)
            setNotification({ type: "error", message: error.message });
        }
    }

    return (
        <div className="w-1/3 mx-auto p-4 mt-8 relative">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Postez un tweet</h1>

            {/* ZONE DES NOTIFICATIONS */}
            {notification && (
                <div
                    className={`mb-4 p-4 rounded-lg font-medium transition-all ${
                        notification.type === "success"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                >
                    {notification.message}
                </div>
            )}

            <form
                ref={formRef}
                action={publishTweet}
                className="bg-white shadow-sm rounded-xl p-6 border border-gray-200"
            >
                <div className="mb-4">
                    <label htmlFor="content" className="sr-only">Contenu du tweet</label>
                    <textarea
                        id="content"
                        name="content"
                        placeholder="Quoi de neuf ?"
                        className="w-full p-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all"
                        rows="4"
                        maxLength="280"
                        required
                    ></textarea>
                </div>

                <div className="flex justify-end items-center border-t pt-4 border-gray-100">
                    <span className="text-sm text-gray-400 mr-4">Max 280 caractères</span>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200 shadow-md"
                    >
                        Tweeter
                    </button>
                </div>
            </form>
        </div>
    );
}