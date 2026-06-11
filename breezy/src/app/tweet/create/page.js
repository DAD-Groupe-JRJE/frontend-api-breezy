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
        <div className="w-full max-w-xl mx-auto p-4 mt-8 relative">
            <h1 className="text-3xl font-black mb-6 text-primary">Postez un tweet</h1>

            {/* ZONE DES NOTIFICATIONS */}
            {notification && (
                <div
                    className={`mb-4 p-4 rounded-lg font-medium transition-all ${
                        notification.type === "success"
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}
                >
                    {notification.message}
                </div>
            )}

            <form
                ref={formRef}
                action={publishTweet}
                className="card"
            >
                <div className="mb-4">
                    <label htmlFor="content" className="sr-only">Contenu du tweet</label>
                    <textarea
                        id="content"
                        name="content"
                        placeholder="Quoi de neuf ?"
                        className="w-full p-4 bg-secondary text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all duration-200"
                        rows="4"
                        maxLength="280"
                        required
                    ></textarea>
                </div>

                <div className="flex justify-end items-center border-t pt-4 border-border">
                    <span className="text-sm opacity-50 mr-4">Max 280 caractères</span>
                    <button
                        type="submit"
                        className="bg-primary hover:opacity-90 text-white font-bold py-2 px-6 rounded-full transition-all duration-200 shadow-md cursor-pointer"
                    >
                        Tweeter
                    </button>
                </div>
            </form>
        </div>
    );
}