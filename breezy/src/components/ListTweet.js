import { getAllTweets } from "@/utils/api";
import OneTweet from "./OneTweet"; // Ajuste le chemin selon où tu as placé ton composant

// On ajoute 'async' ici pour pouvoir utiliser 'await' dans le composant
export default async function ListTweet() {
    let tweets = [];

    try {
        // On attend que la requête se termine avant d'afficher la page
        tweets = await getAllTweets();
    } catch (error) {
        return (
            <div className="p-4 text-center text-red-500">
                Impossible de charger les tweets pour le moment.
            </div>
        );
    }

    // Si on a récupéré les données mais que la base est vide
    if (!tweets || tweets.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                Aucun tweet n'a été publié. Soyez le premier !
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mx-auto mt-8 bg-card border border-border-custom rounded-xl overflow-hidden shadow-sm transition-all duration-250">
            {/* On parcourt le tableau de tweets.
              On utilise .toReversed() pour afficher les plus récents en haut
              (à moins que ton backend ne les trie déjà, auquel cas enlève .toReversed())
            */}
            {tweets.toReversed().map((tweet) => (
                <OneTweet
                    key={tweet._id} // Mongoose génère un _id, il est crucial pour React
                    tweet={tweet}
                />
            ))}
        </div>
    );
}