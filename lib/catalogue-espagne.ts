import type { Sejour } from "./sejours";

export const espagneSejours: Sejour[] = [
  {
    id: "alicante",
    title: "Alicante",
    destination: "Alicante",
    country: "Espagne",
    region: "Alicante / Valence",
    language: "Espagnol",
    duration: "4 jours / 3 nuits",
    level: "Collège / Lycée",
    accommodation: "Hôtel ou famille selon formule",
    transport: "Autocar grand tourisme",
    price: "Sur demande",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=80",
    badge: "Espagnol",
    featured: true,
    theme: "Langue & culture",
    description:
      "Un séjour sur la côte méditerranéenne espagnole pour pratiquer l’espagnol et découvrir Alicante, son patrimoine et son cadre maritime.",
    objectives: [
      "Pratiquer l’espagnol en contexte réel.",
      "Découvrir une ville méditerranéenne espagnole.",
      "Relier culture, patrimoine et vie quotidienne.",
    ],
    program: [
      { day: "Jour 1", title: "Voyage vers Alicante", text: "Départ de l’établissement et route vers l’Espagne selon l’organisation retenue." },
      { day: "Jour 2", title: "Alicante culturelle", text: "Découverte de la ville, de son centre historique et de son environnement méditerranéen." },
      { day: "Jour 3", title: "Langue et patrimoine", text: "Activités de pratique linguistique et visites culturelles." },
      { day: "Jour 4", title: "Retour", text: "Dernières découvertes puis retour vers l’établissement." },
    ],
  },
];