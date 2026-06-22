"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register, login } from "@/utils/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9\s\-_'’À-ÿ]{2,30}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

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

        // Frontend Validations
        if (!EMAIL_REGEX.test(email)) {
            setError("L'adresse email n'est pas valide.");
            return;
        }

        if (!USERNAME_REGEX.test(username)) {
            setError("Le nom d'utilisateur doit contenir entre 3 et 20 caractères (lettres, chiffres et tirets bas uniquement).");
            return;
        }

        if (!DISPLAY_NAME_REGEX.test(displayName)) {
            setError("Le nom d'affichage doit contenir entre 2 et 30 caractères autorisés.");
            return;
        }

        if (!PASSWORD_REGEX.test(password)) {
            setError("Le mot de passe doit contenir au moins 8 caractères, incluant au moins une lettre et un chiffre.");
            return;
        }

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
            setError(err.message || "Une erreur est survenue lors de l'inscription.");
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
                        <p className="text-xs mt-1 text-foreground/50">Exemple : nom@domaine.com</p>
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
                        <p className={`text-xs mt-1 transition-colors duration-200 ${
                            username && !USERNAME_REGEX.test(username) ? "text-red-500 font-medium" : "text-foreground/50"
                        }`}>
                            3 à 20 caractères (lettres, chiffres et '_' uniquement)
                        </p>
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
                        <p className={`text-xs mt-1 transition-colors duration-200 ${
                            displayName && !DISPLAY_NAME_REGEX.test(displayName) ? "text-red-500 font-medium" : "text-foreground/50"
                        }`}>
                            2 à 30 caractères
                        </p>
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
                        <p className={`text-xs mt-1 transition-colors duration-200 ${
                            password && !PASSWORD_REGEX.test(password) ? "text-red-500 font-medium" : "text-foreground/50"
                        }`}>
                            Au moins 8 caractères, avec 1 lettre et 1 chiffre
                        </p>
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
