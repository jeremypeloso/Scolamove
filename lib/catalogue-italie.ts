import type { Sejour } from "./sejours";

export const italieSejours: Sejour[] = [
  {
    id: "developpement-durable-rome",
    title: "Développement durable à Rome",
    destination: "Rome",
    country: "Italie",
    region: "Latium",
    language: "Italien",
    duration: "4 jours / 3 nuits",
    level: "Collège / Lycée",
    accommodation: "Hôtel ou centre d’hébergement",
    transport: "Autocar grand tourisme",
    price: "Sur demande",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80",
    badge: "Durable",
    featured: true,
    theme: "Développement durable",
    description:
      "Un séjour à Rome pour découvrir la ville éternelle sous l’angle du développement durable, entre patrimoine, mobilité et enjeux urbains.",
    objectives: [
      "Comprendre les enjeux du développement durable en milieu urbain.",
      "Découvrir Rome à travers son patrimoine antique et contemporain.",
      "Relier histoire, ville et transition écologique.",
    ],
    program: [
      { day: "Jour 1", title: "Voyage vers Rome", text: "Départ de l’établissement et route vers l’Italie selon le format retenu." },
      { day: "Jour 2", title: "Rome antique et ville durable", text: "Découverte des sites antiques et approche des enjeux urbains contemporains." },
      { day: "Jour 3", title: "Patrimoine et transition", text: "Visites culturelles et activités autour de la ville, des mobilités et de l’environnement." },
      { day: "Jour 4", title: "Retour", text: "Dernières visites puis retour vers l’établissement." },
    ],
  },
];