"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, login } from "@/utils/api";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // 1. Appel d'inscription
            await register(email, username, password, displayName);
            
            // 2. Connexion automatique immédiate après inscription
            const loginData = await login(email, password);
            if (loginData && loginData.token) {
                localStorage.setItem("breezy_jwt", loginData.token);
                localStorage.setItem("breezy_user", JSON.stringify(loginData.user));
                
                // Déclencher l'événement d'authentification
                window.dispatchEvent(new Event("auth-change"));
                
                router.push("/");
                router.refresh();
            } else {
                // Si la connexion auto échoue, on redirige vers la page de login
                router.push("/login?registered=true");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto mt-12 p-4">
            <div className="card shadow-lg p-8">
                <h2 className="text-3xl font-black text-center mb-2 text-primary">Inscription</h2>
                <p className="text-center opacity-70 mb-8 text-sm">Créez votre compte Breezy pour commencer à publier.</p>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold mb-2 opacity-80" htmlFor="email">
                            Adresse Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemple@email.com"
                            className="w-full p-3 bg-secondary text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 opacity-80" htmlFor="username">
                            Nom d'utilisateur (@username)
                        </label>
                        <input
                            id="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
                            className="w-full p-3 bg-secondary text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 opacity-80" htmlFor="displayName">
                            Nom d'affichage (Display Name)
                        </label>
                        <input
                            id="displayName"
                            type="text"
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Jean Dupont"
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
                        {loading ? "Création du compte..." : "S'inscrire"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm opacity-80">
                    Déjà un compte ?{" "}
                    <Link href="/login" className="text-primary font-bold hover:underline">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}
