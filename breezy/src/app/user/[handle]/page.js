import Link from "next/link";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import OneTweet from "@/components/OneTweet"; // Ajuste le chemin

export default async function UserPage({ params }) {
    // 1. Récupération du handle (@) depuis l'URL
    const { handle } = await params;

    // 2. Fausse donnée utilisateur (Mock)
    // Plus tard : const user = await getUserByHandle(handle);
    const mockUser = {
        user_id: "user_999xyz",
        user_email: "test@example.com", // Ne s'affiche pas publiquement
        user_name: handle, // Le handle sans le @
        user_diplayname: handle.charAt(0).toUpperCase() + handle.slice(1), // Met une majuscule pour faire joli
        user_photo: `https://ui-avatars.com/api/?name=${handle}&background=random&color=fff&size=150`,
        user_bio: "Développeur passionné 💻 | En train de coder un super clone avec Next.js et Node.js !",
        user_password: "hash", // Ne s'affiche jamais

        // Des petites stats bonus qu'on retrouve souvent
        joinDate: "Juin 2026",
        followers: 124,
        following: 42
    };

    // 3. Faux tweets pour remplir son profil
    // Plus tard : const userTweets = await getTweetsByUser(mockUser.user_id);
    const mockTweets = [
        {
            _id: "t1",
            content: "Salut tout le monde ! C'est mon premier tweet sur cette nouvelle appli. 🚀",
            likes: ["123", "456"],
            createdAt: new Date().toISOString()
        },
        {
            _id: "t2",
            content: "Le combo Next.js + Tailwind + Express + MongoDB est vraiment incroyable à utiliser au quotidien.",
            likes: [],
            createdAt: new Date(Date.now() - 86400000).toISOString() // Hier
        }
    ];

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
                        {mockUser.user_diplayname}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {mockTweets.length} posts
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
                            src={mockUser.user_photo}
                            alt={`Photo de profil de ${mockUser.user_diplayname}`}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white"
                        />
                    </div>
                    <div className="pt-3">
                        <button className="px-4 py-1.5 font-bold border border-gray-300 rounded-full hover:bg-gray-100 transition duration-200 text-gray-900">
                            Éditer le profil
                        </button>
                    </div>
                </div>
            </div>

            {/* INFORMATIONS DU PROFIL */}
            <div className="px-4 pt-2 pb-4">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                    {mockUser.user_diplayname}
                </h2>
                <p className="text-gray-500 mb-3">
                    @{mockUser.user_name}
                </p>

                <p className="text-gray-900 text-base mb-3 whitespace-pre-wrap">
                    {mockUser.user_bio}
                </p>

                <div className="flex items-center gap-4 text-sm">
                    <Link href="#" className="hover:underline">
                        <span className="font-bold text-gray-900">{mockUser.following}</span> <span className="text-gray-500">Abonnements</span>
                    </Link>
                    <Link href="#" className="hover:underline">
                        <span className="font-bold text-gray-900">{mockUser.followers}</span> <span className="text-gray-500">Abonnés</span>
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
                {mockTweets.map((tweet) => (
                    <OneTweet key={tweet._id} tweet={tweet} />
                ))}
            </div>

        </div>
    );
}