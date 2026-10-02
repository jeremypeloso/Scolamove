// -----------------------------------------------------------------------------
// Identité de l'agence, reprise en pied de page du devis et de la feuille de
// route. Les mentions d'immatriculation, de garantie financière et d'assurance
// sont obligatoires sur les documents d'une agence de voyages : à compléter une
// fois, ici. Une mention laissée vide n'est pas imprimée.
// -----------------------------------------------------------------------------

export const AGENCE = {
  nom: "Scolamove",
  baseline: "Agence de voyages scolaires",
  adresse: "",
  telephone: "",
  email: "contact@scolamove.fr",
  site: "www.scolamove.fr",
  siret: "",
  immatriculation: "", // numéro Atout France, ex. IM078XXXXXX
  garant: "", // garant financier
  assureur: "", // assureur responsabilité civile professionnelle
  signataire: "Jérémy",
  urgenceTelephone: "",
};

export function mentionsLegales(): string {
  const morceaux = [
    `${AGENCE.nom}, ${AGENCE.baseline.toLowerCase()}`,
    AGENCE.adresse,
    AGENCE.siret ? `SIRET ${AGENCE.siret}` : "",
    AGENCE.immatriculation ? `Immatriculation Atout France ${AGENCE.immatriculation}` : "",
    AGENCE.garant ? `Garantie financière : ${AGENCE.garant}` : "",
    AGENCE.assureur ? `Responsabilité civile professionnelle : ${AGENCE.assureur}` : "",
  ];
  return morceaux.filter(Boolean).join(" · ");
}
