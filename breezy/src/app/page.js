import ListTweet from "@/components/ListTweet";

export default function Home() {
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

      <ListTweet />
    </main>
  );
}
