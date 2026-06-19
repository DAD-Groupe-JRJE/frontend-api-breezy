"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowLeft, FaCalendarAlt, FaBan, FaUserCheck } from "react-icons/fa";
import OneTweet from "@/components/OneTweet";
import { getUserById, getTweetsByUser, suspendUser, unsuspendUser } from "@/utils/api";

export default function UserPage({ params }) {
    const { handle } = use(params);

    const [user, setUser] = useState(null);
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
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

        const loadData = async () => {
            try {
                const response = await getUserById(handle);
                if (response && response.user) {
                    const fetchedUser = response.user;
                    
                    const formatJoinDate = (dateString) => {
                        if (!dateString) return "Récemment";
                        try {
                            const date = new Date(dateString);
                            const formatted = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
                            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
                        } catch (e) {
                            return "Récemment";
                        }
                    };

                    setUser({
                        user_id: fetchedUser.userId,
                        user_name: fetchedUser.userName,
                        user_diplayname: fetchedUser.userDisplayName || fetchedUser.userName,
                        user_photo: fetchedUser.userPhoto || `https://ui-avatars.com/api/?name=${fetchedUser.userDisplayName || fetchedUser.userName}&background=random&color=fff&size=150`,
                        user_bio: fetchedUser.userBio || "",
                        joinDate: formatJoinDate(fetchedUser.createdAt),
                        followers: fetchedUser.followersCount || 0,
                        following: fetchedUser.followingCount || 0,
                        role: fetchedUser.role || "user",
                        isSuspended: fetchedUser.isSuspended || false
                    });

                    const userTweets = await getTweetsByUser(fetchedUser.userId);
                    if (userTweets) {
                        setTweets(userTweets);
                    }
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données :", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [handle]);

    const handleToggleSuspend = async () => {
        if (!user || !currentUser) return;
        setActionLoading(true);
        try {
            if (user.isSuspended) {
                await unsuspendUser(user.user_id);
                setUser((prev) => ({ ...prev, isSuspended: false }));
            } else {
                await suspendUser(user.user_id);
                setUser((prev) => ({ ...prev, isSuspended: true }));
            }
        } catch (err) {
            alert("Erreur lors du changement de statut de suspension.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Chargement du profil...</p>
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
        <div className="max-w-2xl mx-auto bg-white border-x border-gray-200 min-h-screen">

            {/* EN-TÊTE FIXE (Header) */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-2 flex items-center gap-6">
                <Link
                    href="/"
                    className="p-2 rounded-full hover:bg-gray-100 transition duration-200"
                >
                    <FaArrowLeft className="text-gray-800" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">
                        {user.user_diplayname}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {tweets.length} posts
                    </p>
                </div>
            </div>

            {/* BANNIÈRE ET AVATAR */}
            <div className="relative">
                {/* Bannière (Couleur unie temporaire) */}
                <div className="h-48 bg-slate-200 w-full object-cover"></div>

                {/* Avatar flottant et Bouton Éditer */}
                <div className="px-4 flex justify-between items-start relative">
                    <div className="-mt-16 rounded-full p-1 bg-white">
                        <img
                            src={user.user_photo}
                            alt={`Photo de profil de ${user.user_diplayname}`}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white"
                        />
                    </div>
                    <div className="pt-3 flex gap-2">
                        {currentUser && currentUser.userId === user.user_id && (
                            <button className="px-4 py-1.5 font-bold border border-gray-300 rounded-full hover:bg-gray-100 transition duration-200 text-gray-900">
                                Éditer le profil
                            </button>
                        )}
                        {currentUser && (currentUser.role === "admin" || currentUser.role === "moderator") && currentUser.userId !== user.user_id && user.role !== "admin" && (
                            <button
                                onClick={handleToggleSuspend}
                                disabled={actionLoading}
                                className={`px-4 py-1.5 font-bold rounded-full text-white transition duration-200 cursor-pointer flex items-center gap-1 ${
                                    user.isSuspended
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-red-500 hover:bg-red-600"
                                }`}
                            >
                                {actionLoading ? "En cours..." : user.isSuspended ? "Réactiver le compte" : "Suspendre le compte"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* INFORMATIONS DU PROFIL */}
            <div className="px-4 pt-2 pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                        {user.user_diplayname}
                    </h2>
                    {user.isSuspended && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full border border-red-500/20">
                            <FaBan size={10} /> Suspendu
                        </span>
                    )}
                </div>
                <p className="text-gray-500 mb-3">
                    @{user.user_name}
                </p>

                {user.user_bio && (
                    <p className="text-gray-900 text-base mb-3 whitespace-pre-wrap">
                        {user.user_bio}
                    </p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <FaCalendarAlt className="text-gray-400" />
                    <span>A rejoint en {user.joinDate}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                    <Link href="#" className="hover:underline">
                        <span className="font-bold text-gray-900">{user.following}</span> <span className="text-gray-500">Abonnements</span>
                    </Link>
                    <Link href="#" className="hover:underline">
                        <span className="font-bold text-gray-900">{user.followers}</span> <span className="text-gray-500">Abonnés</span>
                    </Link>
                </div>
            </div>

            {/* SYSTÈME D'ONGLETS (Tabs) */}
            <div className="flex border-b border-gray-200 mt-2">
                <div className="flex-1 text-center font-bold text-gray-900 hover:bg-gray-100 cursor-pointer transition">
                    <div className="inline-block py-3 border-b-4 border-blue-500">Posts</div>
                </div>
                <div className="flex-1 text-center font-medium text-gray-500 hover:bg-gray-100 cursor-pointer transition py-3">
                    Réponses
                </div>
                <div className="flex-1 text-center font-medium text-gray-500 hover:bg-gray-100 cursor-pointer transition py-3">
                    J'aime
                </div>
            </div>

            {/* FIL DES TWEETS DE L'UTILISATEUR */}
            <div className="bg-white">
                {tweets.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Aucun post trouvé.</div>
                ) : (
                    tweets.map((tweet) => (
                        <OneTweet key={tweet._id} tweet={tweet} />
                    ))
                )}
            </div>

        </div>
    );
}