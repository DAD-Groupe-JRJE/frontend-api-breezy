export function formatTimeAgo(dateString) {
    const tweetDate = new Date(dateString);
    const now = new Date();

    // Différence en secondes
    const diffInSeconds = Math.floor((now - tweetDate) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds}s`; // ex: 45s
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}min`; // ex: 12min
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}h`; // ex: 3h
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}j`; // ex: 2j
    }

    // Si c'est plus vieux qu'une semaine, on affiche la date (ex: 8 juin)
    return tweetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}