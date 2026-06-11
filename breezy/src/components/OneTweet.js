"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaHeart, FaRegHeart, FaComment, FaRegComment } from "react-icons/fa";
import { getTweetsResponse, likeTweet, unlikeTweet } from "@/utils/api";
import { formatTimeAgo } from "@/utils/formatDate";

export default function OneTweet({ tweet }) {
    const currentUserId = "1234abc";

    const [isLiked, setIsLiked] = useState(tweet.likes?.includes(currentUserId) || false);
    const [likesCount, setLikesCount] = useState(tweet.likes?.length || 0);
    const [isCommented, setIsCommented] = useState(false);

    // État pour stocker le nombre de réponses
    const [commentsCount, setCommentsCount] = useState(0);

    // Récupération asynchrone du nombre de commentaires
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const responses = await getTweetsResponse(tweet._id);
                setCommentsCount(responses.length);
            } catch (error) {
                console.error("Impossible de charger les commentaires", error);
            }
        };

        fetchComments();
    }, [tweet._id]);

    const dummyUser = {
        name: "Utilisateur Mystère",
        handle: "user_inconnu",
        avatar: "https://ui-avatars.com/api/?name=Utilisateur+Mystère&background=random&color=fff"
    };

    const handleLike = (e) => {
        e.preventDefault();

        if (isLiked) {
            setLikesCount((prev) => prev - 1);
            unlikeTweet(tweet._id);
        } else {
            setLikesCount((prev) => prev + 1);
            likeTweet(tweet._id);
        }

        setIsLiked(!isLiked);
    };

    const handleComment = (e) => {
        setIsCommented(!isCommented);
    };

    return (
        <article className="p-4 border-b border-border hover:bg-secondary/40 transition-colors duration-200 text-foreground">
            <div className="flex gap-4">

                {/* Colonne de gauche : Photo de profil */}
                <div className="flex-shrink-0">
                    <img
                        src={dummyUser.avatar}
                        alt={`Avatar de ${dummyUser.name}`}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                </div>

                {/* Colonne de droite : Contenu du tweet */}
                <div className="flex-1 min-w-0">

                    {/* En-tête : Nom, Handle et Date */}
                    <div className="flex items-center justify-between mb-1">

                        {/* Partie gauche : Nom et Handle */}
                        <Link href={`/user/${dummyUser.handle}`} className="group flex items-center gap-1 min-w-0">
                            <span className="font-bold text-foreground truncate group-hover:underline">
                                {dummyUser.name}
                            </span>
                            <span className="opacity-60 text-sm truncate">
                                @{dummyUser.handle}
                            </span>
                        </Link>

                        {/* Partie droite : Date (sans le point) */}
                        <Link
                            href={`/tweet/${tweet._id}`}
                            className="opacity-50 text-sm hover:underline flex-shrink-0 ml-2"
                        >
                            {formatTimeAgo(tweet.createdAt)}
                        </Link>

                    </div>

                    {/* Texte du tweet */}
                    <Link href={`/tweet/${tweet._id}`} className="block mt-1">
                        <p className="text-foreground text-base whitespace-pre-wrap break-words">
                            {tweet.content}
                        </p>
                    </Link>

                    {/* Boutons d'interaction */}
                    <div className="flex items-center gap-12 mt-3 opacity-80">
                        {/* Bouton Commentaire */}
                        <Link
                            href={`/tweet/${tweet._id}`}
                            onClick={handleComment}
                            className={`flex items-center gap-2 text-sm transition group ${isCommented ? 'text-blue-500' : 'hover:text-blue-500'}`}
                        >
                            <div className={`p-2 rounded-full transition ${isCommented ? 'bg-blue-500/10' : 'group-hover:bg-blue-500/10'}`}>
                                {isCommented ? <FaComment className="text-lg" /> : <FaRegComment className="text-lg" />}
                            </div>
                            <span>{commentsCount}</span>
                        </Link>

                        {/* Bouton Like */}
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 text-sm transition group ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                        >
                            <div className={`p-2 rounded-full transition ${isLiked ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'}`}>
                                {isLiked ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
                            </div>
                            <span>{likesCount}</span>
                        </button>
                    </div>

                </div>
            </div>
        </article>
    );
}