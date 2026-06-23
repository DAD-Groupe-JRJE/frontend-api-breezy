"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {FaArrowLeft, FaCalendarAlt, FaPen, FaSignOutAlt} from "react-icons/fa";
import OneTweet from "@/components/OneTweet";
import {getUserById, getTweetsByUser, getConnectedUserInfo, followUser, unfollowUser} from "@/utils/api";

export default function UserPage({ params }) {
    const { handle } = use(params);
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [userConnected, setUserConnected] = useState(null);

    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMyProfile, setIsMyProfile] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [tweetsError, setTweetsError] = useState("");

    const handleLogout = () => {
        localStorage.removeItem("breezy_jwt");
        localStorage.removeItem("breezy_user");
        window.dispatchEvent(new Event("auth-change"));
        router.push("/login");
        router.refresh();
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setErrorMsg("");
                setTweetsError("");
                let tempUserConnected = null;

                const userStr = localStorage.getItem("breezy_user");
                if (userStr) {
                    try {
                        tempUserConnected = JSON.parse(userStr);
                        setUserConnected(tempUserConnected);
                    } catch (e) {
                        setUserConnected(null);
                    }
                } else {
                    setUserConnected(null);
                }

                setLoading(true);
                let user = await getUserById(handle);
                if (!user) {
                    setErrorMsg("Cet utilisateur est introuvable.");
                    return;
                }
                setUser(user.user);

                user = user.user

                if (user && tempUserConnected && user.userId === tempUserConnected.userId) {
                    setIsMyProfile(true);
                }

                if (user && user.userId) {
                    try {
                        const userTweets = await getTweetsByUser(user.userId);
                        setTweets(userTweets || []);
                    } catch (err) {
                        console.error("Erreur posts:", err);
                        setTweetsError(err.message || "Accès refusé.");
                    }
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
                setErrorMsg(error.message || "Erreur de connexion.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [handle]);

    const handleFollowToggle = async () => {
        if (!userConnected) {
            setErrorMsg("Vous devez être connecté pour suivre un utilisateur.");
            return;
        }
        try {
            setErrorMsg("");
            if (user.isFollowing) {
                const updatedProfile = await unfollowUser(user.userId);
                if (updatedProfile && updatedProfile.user) {
                    setUser(updatedProfile.user);
                }
            } else {
                const updatedProfile = await followUser(user.userId);
                if (updatedProfile && updatedProfile.user) {
                    setUser(updatedProfile.user);
                }
            }
        } catch (error) {
            console.error("Erreur lors du changement d'abonnement :", error);
            setErrorMsg(error.message || "Erreur lors du changement d'abonnement.");
        }
    };

    // Formatage simple des dates
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString("fr-FR", {
            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Chargement du profil...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="max-w-2xl mx-auto min-h-screen flex items-center justify-center flex-col p-4">
                <div className="p-4 text-center text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg max-w-md mx-auto mb-4 text-sm font-medium">
                    {errorMsg}
                </div>
                <Link href="/" className="px-5 py-2.5 bg-primary text-white font-bold rounded-full text-sm hover:opacity-90 transition">
                    Retour à l'accueil
                </Link>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto min-h-screen flex items-center justify-center flex-col">
                <p className="text-gray-500 mb-4">Cet utilisateur est introuvable.</p>
                <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded-full">
                    Retour à l'accueil
                </Link>
            </div>
        );
    }


    return (
        <div className="w-full max-w-3xl mx-auto py-8 px-4 min-h-screen flex flex-col gap-6">

            {/* BOUTON RETOUR */}
            <div>
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:bg-secondary/40 transition text-foreground font-medium w-fit shadow-sm text-sm cursor-pointer">
                    <FaArrowLeft />
                    Retour
                </Link>
            </div>

            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">

                {/* Wrapper Flexbox : Noms à gauche, Bouton à droite */}
                <div className="flex justify-between items-start mb-4">

                    {/* Noms (à gauche) */}
                    <div>
                        <h1 className="text-3xl font-bold text-foreground leading-tight">
                            {user.userDisplayName}
                        </h1>
                        <p className="opacity-60 text-lg">@{user.userName}</p>
                    </div>

                    {/* Boutons d'action (à droite) */}
                    <div>
                        {
                            isMyProfile ?
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        className="flex items-center gap-2 px-5 py-2.5 font-bold text-foreground bg-card border border-border rounded-full shadow-sm hover:bg-secondary/40 transition duration-200 cursor-pointer text-sm"
                                    >
                                        <FaPen className="text-sm opacity-75" />
                                        Éditer le profil
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex md:hidden items-center justify-center gap-2 px-5 py-2.5 font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full transition-all duration-200 cursor-pointer text-sm"
                                    >
                                        <FaSignOutAlt />
                                        Déconnexion
                                    </button>
                                </div> :
                                <button
                                    onClick={handleFollowToggle}
                                    className={`px-6 py-2.5 font-bold rounded-full transition duration-200 shadow-sm cursor-pointer text-sm ${
                                        user.isFollowing
                                            ? "bg-card border border-border text-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                                            : "bg-primary text-white hover:opacity-90"
                                    }`}
                                >
                                    {user.isFollowing ? "Se désabonner" : "S'abonner"}
                                </button>
                        }
                    </div>

                </div>

                {/* Biographie */}
                <p className="text-foreground text-base mb-6 whitespace-pre-wrap break-words opacity-90">
                    {user.userBio !== null ? user.userBio : "Aucune biographie disponible."}
                </p>

                {/* Statistiques d'abonnements */}
                <div className="flex flex-wrap items-center gap-8 text-foreground/80 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-xl">{user.followingCount}</span>
                        <span className="opacity-60">Abonnements</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-xl">{user.followersCount}</span>
                        <span className="opacity-60">Abonnés</span>
                    </div>
                </div>

                {/* Dates */}
                <div className="flex flex-wrap gap-8 text-sm opacity-60 pt-6 border-t border-border">
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt />
                        <span><strong>Créé le :</strong> {formatDate(user.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt />
                        <span><strong>Mis à jour le :</strong> {formatDate(user.updatedAt)}</span>
                    </div>
                </div>
            </div>

            {/* FIL DES POSTS (En bas) */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">

                <div className="p-5 border-b border-border bg-secondary/15">
                    <h2 className="text-xl font-bold text-foreground">
                        Posts de {user.userDisplayName}
                    </h2>
                </div>

                <div className="flex flex-col">
                    {tweetsError ? (
                        <div className="p-16 text-center text-red-500 bg-red-500/5 font-medium border-t border-border">
                            {tweetsError}
                        </div>
                    ) : tweets && tweets.length > 0 ? (
                        tweets.toReversed().map((tweet) => (
                            <OneTweet key={tweet._id} tweet={tweet} />
                        ))
                    ) : (
                        <div className="p-16 text-center opacity-60 text-lg">
                            Aucun post à afficher pour le moment.
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}