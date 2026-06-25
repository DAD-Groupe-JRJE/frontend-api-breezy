"use client"; // Indispensable pour utiliser useState, useRef et setTimeout

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createNewTweet } from "@/utils/api";

export default function CreateTweet() {
    const router = useRouter();
    // État pour gérer la notification { type: "success" | "error", message: "..." }
    const [notification, setNotification] = useState(null);
    const [mediaData, setMediaData] = useState(null);
    const [mediaName, setMediaName] = useState("");
    const [mediaType, setMediaType] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("breezy_jwt");
            if (!token) {
                router.push("/login");
            }
        }
    }, [router]);

    const handleFileChange = (file) => {
        if (!file) return;

        if (file.size > 15 * 1024 * 1024) {
            alert("Le fichier est trop volumineux. La limite est de 15 Mo.");
            return;
        }

        const type = file.type.startsWith("image/")
            ? "image"
            : file.type.startsWith("video/")
            ? "video"
            : null;

        if (!type) {
            alert("Seuls les fichiers image ou vidéo sont autorisés.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setMediaData(e.target.result);
            setMediaName(file.name);
            setMediaType(type);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    async function publishTweet(formData) {
        // 1. On réinitialise les notifications à chaque nouvelle tentative
        setNotification(null);

        const content = formData.get("content");

        try {
            // 2. On appelle l'API
            await createNewTweet(content, null, mediaData, mediaName);

            // 3. Si succès : On affiche la pop-up verte
            setNotification({ type: "success", message: "Post créé avec succès !" });

            // 4. On vide le formulaire
            formRef.current?.reset();
            setMediaData(null);
            setMediaName("");
            setMediaType(null);

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
            <h1 className="text-3xl font-black mb-6 text-primary">Créer un Post</h1>

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
                onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    await publishTweet(formData);
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`card p-5 border rounded-xl shadow-sm transition-all ${
                    isDragging
                        ? "border-primary border-dashed bg-primary/5 scale-[1.01]"
                        : "border-border"
                }`}
            >
                <div className="mb-4">
                    <label htmlFor="content" className="sr-only">Contenu du post</label>
                    <textarea
                        id="content"
                        name="content"
                        placeholder="Quoi de neuf ?"
                        className="w-full p-4 bg-secondary/45 text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all duration-200"
                        rows="4"
                        maxLength="280"
                        required
                    ></textarea>
                </div>

                {mediaData && (
                    <div className="relative mb-4 rounded-lg overflow-hidden border border-border group max-h-80 flex items-center justify-center bg-black/5">
                        {mediaType === "image" ? (
                            <img
                                src={mediaData}
                                alt="Prévisualisation"
                                className="max-h-80 w-auto object-contain rounded-lg"
                            />
                        ) : (
                            <video
                                src={mediaData}
                                controls
                                className="max-h-80 w-auto object-contain rounded-lg"
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                setMediaData(null);
                                setMediaName("");
                                setMediaType(null);
                            }}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all cursor-pointer shadow-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex justify-between items-center border-t pt-4 border-border">
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="media-upload"
                            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all cursor-pointer flex items-center justify-center"
                            title="Ajouter une image ou vidéo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                            <input
                                id="media-upload"
                                type="file"
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={(e) => handleFileChange(e.target.files[0])}
                            />
                        </label>
                        {mediaName && (
                            <span className="text-xs opacity-60 truncate max-w-[150px]" title={mediaName}>
                                {mediaName}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center">
                        <span className="text-sm opacity-50 mr-4">Max 280 caractères</span>
                        <button
                            type="submit"
                            className="bg-primary hover:opacity-90 text-white font-bold py-2 px-6 rounded-full transition-all duration-200 shadow-md cursor-pointer"
                        >
                            Poster
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
