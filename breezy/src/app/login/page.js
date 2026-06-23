"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/utils/api";

export default function LoginPage() {
    const router = useRouter();
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!emailOrUsername.trim()) {
            setError("Veuillez saisir votre email ou votre nom d'utilisateur.");
            return;
        }

        if (!password) {
            setError("Veuillez saisir votre mot de passe.");
            return;
        }

        setLoading(true);

        try {
            const data = await login(emailOrUsername, password);
            if (data && data.token) {
                localStorage.setItem("breezy_jwt", data.token);
                localStorage.setItem("breezy_user", JSON.stringify(data.user));
                
                // Déclencher un événement pour que la Navbar se mette à jour immédiatement
                window.dispatchEvent(new Event("auth-change"));
                
                router.push("/");
                router.refresh();
            } else {
                setError("Identifiants incorrects ou réponse invalide.");
            }
        } catch (err) {
            setError(err.message || "Une erreur est survenue lors de la connexion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto mt-16 p-4">
            <div className="card shadow-lg p-8">
                <h2 className="text-3xl font-black text-center mb-2 text-primary">Connexion</h2>
                <p className="text-center opacity-70 mb-8 text-sm">Entrez vos identifiants pour vous connecter à Breezy.</p>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 opacity-80" htmlFor="identifier">
                            Email ou Nom d'utilisateur
                        </label>
                        <input
                            id="identifier"
                            type="text"
                            required
                            value={emailOrUsername}
                            onChange={(e) => setEmailOrUsername(e.target.value)}
                            placeholder="exemple@email.com ou username"
                            className="w-full p-3 bg-secondary text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 opacity-80" htmlFor="password">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-3 bg-secondary text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-full transition-all duration-200 shadow-md cursor-pointer flex justify-center items-center"
                    >
                        {loading ? "Connexion en cours..." : "Se connecter"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm opacity-80">
                    Pas encore de compte ?{" "}
                    <Link href="/register" className="text-primary font-bold hover:underline">
                        S'inscrire
                    </Link>
                </p>
            </div>
        </div>
    );
}
