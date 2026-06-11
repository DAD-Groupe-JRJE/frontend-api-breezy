"use client";

import Link from "next/link";

export default function Home() {
  const mockTweets = [
    {
      id: "1",
      author: "Julien R.",
      handle: "@julien_dev",
      content: "Je viens de tester la nouvelle fonctionnalité de thèmes personnalisés sur Breezy ! Le thème Sépia est hyper agréable pour coder tard le soir. ☕",
      date: "Il y a 10 min",
    },
    {
      id: "2",
      author: "Sophie L.",
      handle: "@sophie_design",
      content: "Le mode Sunset est incroyable ! 🌅 Ces tons violet/rose donnent un aspect néon/cyberpunk hyper premium à l'interface. Beau travail sur l'UX !",
      date: "Il y a 1 heure",
    },
    {
      id: "3",
      author: "Breezy Team",
      handle: "@breezy_app",
      content: "Bienvenue sur Breezy ! Nous avons ajouté le support des thèmes système automatiques. Vos composants utilisant la classe `.card` s'adapteront automatiquement aux préférences de votre OS. 💻✨",
      date: "Il y a 2 heures",
    }
  ];

  return (
    <main className="flex-1 py-10 px-6 max-w-4xl mx-auto w-full transition-colors duration-250">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-primary">
          Fil d'actualité
        </h1>
        <p className="text-lg opacity-85 max-w-xl mx-auto">
          Découvrez les derniers messages de la communauté et personnalisez votre expérience visuelle depuis la barre de navigation.
        </p>
      </div>

      <div className="space-y-6">
        {mockTweets.map((tweet) => (
          <article key={tweet.id} className="card hover:shadow-md hover:scale-[1.01] duration-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-bold text-fg mr-2">{tweet.author}</span>
                <span className="text-sm opacity-60">{tweet.handle}</span>
              </div>
              <span className="text-xs opacity-50">{tweet.date}</span>
            </div>
            <p className="leading-relaxed break-words">{tweet.content}</p>
            <div className="mt-4 pt-3 border-t border-border-custom flex gap-6 text-sm opacity-60">
              <button className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                💬 <span>0</span>
              </button>
              <button className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                ❤️ <span>12</span>
              </button>
              <button className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                🔁 <span>3</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/tweet/create">
          <span className="inline-flex items-center justify-center bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-lg hover:scale-105 duration-200 cursor-pointer">
            Publier un message
          </span>
        </Link>
      </div>
    </main>
  );
}
