"use client";

import { FaEnvelope } from "react-icons/fa";

export default function MessagesPage() {
  return (
    <main className="flex-1 py-10 px-6 max-w-xl mx-auto w-full transition-colors duration-250">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-6 text-primary">Messages</h1>
      </div>

      <div className="text-center py-16 opacity-65 bg-card border border-border rounded-xl">
        <div className="text-4xl text-primary mb-4 flex justify-center">
          <FaEnvelope />
        </div>
        <p className="text-lg font-semibold">Votre boîte de réception est vide</p>
        <p className="text-sm mt-1">Les messages privés s'afficheront ici quand la fonctionnalité sera disponible.</p>
      </div>
    </main>
  );
}
