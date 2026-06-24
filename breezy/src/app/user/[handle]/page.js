"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {FaArrowLeft, FaCalendarAlt, FaPen, FaTimes, FaCamera, FaSignOutAlt} from "react-icons/fa";
import OneTweet from "@/components/OneTweet";
import {getUserById, getTweetsByUser, getConnectedUserInfo, followUser, unfollowUser, updateConnectedUserProfile} from "@/utils/api";

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

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editDisplayName, setEditDisplayName] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editPhoto, setEditPhoto] = useState("");
    const [editError, setEditError] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const handleOpenEditModal = () => {
        setEditDisplayName(user.userDisplayName || "");
        setEditBio(user.userBio || "");
        setEditPhoto(user.userPhoto || "");
        setEditError("");
        setIsEditModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setEditError("La taille de la photo ne doit pas dépasser 2 Mo.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditPhoto(reader.result); // Base64 string
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditError("");
        
        const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9\s\-_'’À-ÿ]{2,30}$/;
        if (!DISPLAY_NAME_REGEX.test(editDisplayName)) {
            setEditError("Le nom d'affichage doit contenir entre 2 et 30 caractères.");
            return;
        }

        setEditLoading(true);
        try {
            const updatedProfile = await updateConnectedUserProfile({
                userDisplayName: editDisplayName,
                userBio: editBio,
                userPhoto: editPhoto
            });

            if (updatedProfile && updatedProfile.user) {
                setUser(updatedProfile.user);
            }
            setIsEditModalOpen(false);
        } catch (err) {
            console.error("Erreur de sauvegarde profil:", err);
            setEditError(err.message || "Impossible de sauvegarder les modifications.");
        } finally {
            setEditLoading(false);
        }
    };

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

                {/* Wrapper Flexbox : Photo et Noms à gauche, Bouton à droite */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">

                    {/* Partie gauche : Photo + Noms */}
                    <div className="flex items-center gap-6">
                        <img
                            src={user.userPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userDisplayName || user.userName)}&background=random&color=fff&size=128`}
                            alt={user.userDisplayName}
                            className="w-24 h-24 rounded-full border-4 border-border shadow-sm object-cover"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-foreground leading-tight">
                                {user.userDisplayName}
                            </h1>
                            <p className="opacity-60 text-lg">@{user.userName}</p>
                        </div>
                    </div>

                    {/* Boutons d'action (à droite) */}
                    <div>
                        {
                            isMyProfile ?
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={handleOpenEditModal}
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

            {/* Modal d'édition */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                        {/* En-tête de la modale */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">Éditer le profil</h3>
                            <button 
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditError("");
                                }}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
                            >
                                <FaTimes className="text-lg" />
                            </button>
                        </div>

                        {/* Corps de la modale */}
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                            {editError && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg">
                                    {editError}
                                </div>
                            )}

                            {/* Section Photo de profil */}
                            <div className="flex flex-col items-center gap-4">
                                <label className="block text-sm font-bold text-gray-700 w-full text-center">
                                    Photo de profil
                                </label>
                                <div className="relative w-28 h-28">
                                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-200 shadow-inner group relative">
                                        <img
                                            src={editPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userDisplayName)}&background=random&color=fff&size=128`}
                                            alt="Aperçu photo"
                                            className="w-full h-full object-cover"
                                        />
                                        <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer text-white text-xs font-semibold gap-1">
                                            <FaCamera className="text-xl" />
                                            <span>Changer</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200">
                                        <FaCamera className="text-sm" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-400">Recommandé : image carrée, max. 2 Mo</p>
                            </div>

                            {/* Section Nom d'affichage */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Nom d'affichage
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editDisplayName}
                                    onChange={(e) => setEditDisplayName(e.target.value)}
                                    placeholder="Votre nom"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-gray-900"
                                />
                            </div>

                            {/* Section Biographie */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Biographie
                                </label>
                                <textarea
                                    value={editBio}
                                    onChange={(e) => setEditBio(e.target.value)}
                                    placeholder="Décrivez-vous en quelques mots..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-gray-900 resize-none"
                                />
                            </div>

                            {/* Pied de la modale */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditError("");
                                    }}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
                                >
                                    {editLoading ? "Enregistrement..." : "Sauvegarder"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}