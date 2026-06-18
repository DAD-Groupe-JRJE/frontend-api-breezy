"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllUsers, suspendUser, unsuspendUser } from "@/utils/api";
import { FaUserShield, FaUserCheck, FaBan, FaSearch, FaExclamationTriangle } from "react-icons/fa";

export default function ModerationPage() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const userStr = localStorage.getItem("breezy_user");
            if (!userStr) {
                router.push("/login");
                return;
            }

            try {
                const loggedInUser = JSON.parse(userStr);
                const role = loggedInUser.role;
                if (role === "admin" || role === "moderator") {
                    setIsAuthorized(true);
                } else {
                    setError("Accès interdit : vous devez être modérateur ou administrateur.");
                    setLoading(false);
                }
            } catch (e) {
                router.push("/login");
            }
        }
    }, [router]);

    useEffect(() => {
        if (!isAuthorized) return;

        const loadUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data || []);
            } catch (err) {
                console.error(err);
                setError("Impossible de récupérer la liste des utilisateurs.");
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, [isAuthorized]);

    const handleSuspend = async (userId) => {
        setActionLoadingId(userId);
        try {
            await suspendUser(userId);
            // Mettre à jour l'état local
            setUsers((prevUsers) =>
                prevUsers.map((u) => (u.userId === userId ? { ...u, isSuspended: true } : u))
            );
        } catch (err) {
            alert("Erreur lors de la suspension de l'utilisateur.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleUnsuspend = async (userId) => {
        setActionLoadingId(userId);
        try {
            await unsuspendUser(userId);
            // Mettre à jour l'état local
            setUsers((prevUsers) =>
                prevUsers.map((u) => (u.userId === userId ? { ...u, isSuspended: false } : u))
            );
        } catch (err) {
            alert("Erreur lors de la réactivation de l'utilisateur.");
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredUsers = users.filter((u) =>
        u.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.userDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto mt-16 p-6 text-center text-gray-500">
                Chargement de l'interface de modération...
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="max-w-md mx-auto mt-16 p-6 text-center bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
                <FaExclamationTriangle className="text-4xl mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
                <p className="text-sm">{error || "Vous n'avez pas l'autorisation d'accéder à cette page."}</p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-6 px-6 py-2 bg-primary text-white rounded-full font-semibold"
                >
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-primary tracking-tight mb-2 flex items-center gap-3">
                        <FaUserShield className="text-primary" /> Modération
                    </h1>
                    <p className="opacity-80 text-sm">Gérez les comptes des utilisateurs et appliquez des sanctions si nécessaire.</p>
                </div>

                {/* Recherche */}
                <div className="relative w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none opacity-50">
                        <FaSearch />
                    </span>
                    <input
                        type="text"
                        placeholder="Rechercher par pseudo, e-mail..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-secondary text-foreground border border-border rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
                    />
                </div>
            </div>

            {/* Liste des utilisateurs */}
            {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500 card">
                    Aucun utilisateur ne correspond à votre recherche.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {filteredUsers.map((u) => {
                        const avatarUrl = u.userPhoto || `https://ui-avatars.com/api/?name=${u.userDisplayName || u.userName}&background=random&color=fff&size=128`;
                        return (
                            <div key={u.userId} className={`card flex p-5 border gap-4 items-center transition-all ${
                                u.isSuspended ? "border-red-500/30 bg-red-500/5" : "border-border"
                            }`}>
                                <img
                                    src={avatarUrl}
                                    alt={`Avatar de ${u.userDisplayName}`}
                                    className="w-16 h-16 rounded-full object-cover border border-border"
                                />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="font-bold truncate text-lg">{u.userDisplayName}</h3>
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                                            u.role === "admin"
                                                ? "bg-red-500 text-white"
                                                : u.role === "moderator"
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-200 text-gray-800"
                                        }`}>
                                            {u.role}
                                        </span>
                                    </div>
                                    <p className="text-sm opacity-60 truncate">@{u.userName}</p>
                                    <p className="text-xs opacity-50 truncate mb-2">{u.userEmail}</p>

                                    {u.isSuspended ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full border border-red-500/20">
                                            <FaBan size={10} /> Suspendu
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-500/10 text-green-500 px-2.5 py-0.5 rounded-full border border-green-500/20">
                                            <FaUserCheck size={10} /> Actif
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div>
                                    {u.role !== "admin" ? (
                                        u.isSuspended ? (
                                            <button
                                                onClick={() => handleUnsuspend(u.userId)}
                                                disabled={actionLoadingId === u.userId}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-bold rounded-full transition-colors cursor-pointer shadow-sm"
                                            >
                                                {actionLoadingId === u.userId ? "En cours..." : "Réactiver"}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSuspend(u.userId)}
                                                disabled={actionLoadingId === u.userId}
                                                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold rounded-full transition-colors cursor-pointer shadow-sm"
                                            >
                                                {actionLoadingId === u.userId ? "En cours..." : "Suspendre"}
                                            </button>
                                        )
                                    ) : (
                                        <span className="text-xs opacity-40 font-italic italic">Protégé</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
