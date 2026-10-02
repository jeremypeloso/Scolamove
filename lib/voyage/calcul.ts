import type { Categorie, Dossier, Prestation } from "./types";

export const CATEGORIES: { cle: Categorie; label: string; court: string }[] = [
  { cle: "transport", label: "Transport", court: "Transport" },
  { cle: "hebergement", label: "Hébergement", court: "Hébergement" },
  { cle: "restauration", label: "Restauration", court: "Repas" },
  { cle: "visites", label: "Visites et activités", court: "Visites" },
  { cle: "assurance", label: "Assurances", court: "Assurance" },
  { cle: "divers", label: "Frais et divers", court: "Divers" },
];

export type LigneCalcul = {
  revient: number;
  vente: number;
  // Montant ramené à un participant payant.
  parPayant: number;
  marge: number;
};

export type OptionCalcul = { id: string; libelle: string; parPayant: number };

export type Calcul = {
  participants: number;
  payants: number;
  lignes: Record<string, LigneCalcul>;
  postes: Record<Categorie, { revient: number; vente: number }>;
  revient: number;
  // Prix exact avant arrondi, puis prix affiché au client.
  prixBrut: number;
  // Prix issu de la cotation (arrondi compris), même quand le prix est figé.
  prixCalcule: number;
  prixParPayant: number;
  totalVente: number;
  marge: number;
  // Marge réelle rapportée au prix de vente, arrondi compris.
  margePct: number;
  options: OptionCalcul[];
};

function n(valeur: unknown): number {
  const x = Number(valeur);
  return Number.isFinite(x) ? x : 0;
}

export function arrondir2(valeur: number): number {
  return Math.round((valeur + Number.EPSILON) * 100) / 100;
}

// Durée du voyage : calculée depuis les dates quand elles existent, sinon saisie.
// Les jours suivent toujours les dates ; les nuits aussi, sauf si elles ont été
// corrigées à la main.
export function duree(
  d: Pick<Dossier, "depart" | "retour" | "jours" | "nuits"> & { nuitsForcees?: number | null }
): {
  jours: number;
  nuits: number;
} {
  if (d.depart && d.retour) {
    const debut = Date.parse(`${d.depart}T00:00:00Z`);
    const fin = Date.parse(`${d.retour}T00:00:00Z`);
    if (Number.isFinite(debut) && Number.isFinite(fin) && fin >= debut) {
      const ecart = Math.round((fin - debut) / 86400000);
      const forcees = d.nuitsForcees;
      const nuits = forcees !== null && forcees !== undefined ? Math.max(n(forcees), 0) : ecart;
      return { jours: ecart + 1, nuits };
    }
  }
  return { jours: Math.max(n(d.jours), 0), nuits: Math.max(n(d.nuits), 0) };
}

// Coût d'achat d'une ligne forfaitaire ou par personne.
function revientLigne(p: Prestation, d: Dossier): number {
  const quantite = n(p.quantite);
  if (p.mode === "groupe") {
    return quantite * n(p.prixGroupe);
  }
  if (p.mode === "personne") {
    const adultes = n(d.accompagnateurs) + (p.conducteurs ? n(d.conducteurs) : 0);
    return quantite * (n(p.prixEleve) * n(d.eleves) + n(p.prixAdulte) * adultes);
  }
  return 0;
}

export function margeLigne(p: Prestation, d: Dossier): number {
  if (p.mode === "pourcent") return 0;
  return p.marge === null || p.marge === undefined ? n(d.tarif.marge) : n(p.marge);
}

export function calculer(d: Dossier): Calcul {
  const participants = n(d.eleves) + n(d.accompagnateurs);
  const gratuites = Math.min(Math.max(n(d.tarif.gratuites), 0), n(d.accompagnateurs));
  const payants = Math.max(participants - gratuites, 0);
  const diviseur = Math.max(payants, 1);

  const lignes: Record<string, LigneCalcul> = {};
  const postes = {
    transport: { revient: 0, vente: 0 },
    hebergement: { revient: 0, vente: 0 },
    restauration: { revient: 0, vente: 0 },
    visites: { revient: 0, vente: 0 },
    assurance: { revient: 0, vente: 0 },
    divers: { revient: 0, vente: 0 },
  } as Calcul["postes"];
  const options: OptionCalcul[] = [];

  // 1. Lignes à montant direct (forfait groupe et tarif par personne).
  let venteBase = 0;
  d.prestations.forEach((p) => {
    if (p.mode === "pourcent") return;
    const revient = revientLigne(p, d);
    const marge = margeLigne(p, d);
    const vente = revient * (1 + marge / 100);
    lignes[p.id] = { revient, vente, parPayant: vente / diviseur, marge };
    if (!p.enOption) venteBase += vente;
  });

  // 2. Lignes en pourcentage : assises sur le prix de vente par payant des
  //    prestations incluses, avec un plancher par personne. Refacturées sans marge.
  const baseParPayant = venteBase / diviseur;
  d.prestations.forEach((p) => {
    if (p.mode !== "pourcent") return;
    const parPayant = Math.max((baseParPayant * n(p.taux)) / 100, n(p.minimum));
    const montant = parPayant * payants;
    lignes[p.id] = { revient: montant, vente: montant, parPayant, marge: 0 };
  });

  // 3. Totaux : les options sont chiffrées mais restent hors prix.
  let revient = 0;
  let vente = 0;
  d.prestations.forEach((p) => {
    const ligne = lignes[p.id];
    if (!ligne) return;
    if (p.enOption) {
      options.push({ id: p.id, libelle: p.libelle, parPayant: ligne.parPayant });
      return;
    }
    revient += ligne.revient;
    vente += ligne.vente;
    postes[p.categorie].revient += ligne.revient;
    postes[p.categorie].vente += ligne.vente;
  });

  const prixBrut = vente / diviseur;
  const pas = d.tarif.arrondi;
  const prixCalcule =
    pas === 1 || pas === 5 ? Math.ceil(arrondir2(prixBrut) / pas) * pas : arrondir2(prixBrut);
  const fige = d.tarif.prixFige;
  const prixParPayant = fige !== null && fige !== undefined && n(fige) > 0 ? n(fige) : prixCalcule;
  const totalVente = arrondir2(prixParPayant * payants);
  const marge = totalVente - revient;

  return {
    participants,
    payants,
    lignes,
    postes,
    revient,
    prixBrut,
    prixCalcule,
    prixParPayant,
    totalVente,
    marge,
    margePct: totalVente > 0 ? (marge / totalVente) * 100 : 0,
    options,
  };
}

// À qui s'applique le prix affiché : tout le monde, les seuls élèves quand tous
// les accompagnateurs sont gratuits, ou les participants payants.
export function libellePayant(d: Dossier): string {
  const gratuites = Math.min(n(d.tarif.gratuites), n(d.accompagnateurs));
  if (gratuites <= 0) return "par personne";
  return gratuites >= n(d.accompagnateurs) ? "par élève" : "par participant payant";
}

// Suivi des réservations : seules les prestations achetées à un tiers comptent.
export function avancementReservations(d: Dossier): { confirmees: number; total: number } {
  const suivies = d.prestations.filter((p) => !p.enOption && p.mode !== "pourcent");
  return {
    total: suivies.length,
    confirmees: suivies.filter((p) => p.statut === "confirme" || p.statut === "solde").length,
  };
}

export function euros(valeur: number, decimales = 2): string {
  // Espaces insécables remplacés par des espaces simples : la police des PDF ne
  // les connaît pas et l'interface empêche déjà le retour à la ligne.
  const texte = n(valeur)
    .toLocaleString("fr-FR", { minimumFractionDigits: decimales, maximumFractionDigits: decimales })
    .replace(/[\u202f\u00a0]/g, " ");
  return `${texte} €`;
}

// Prix affiché au client : sans décimales quand le montant est rond.
export function prixClient(valeur: number): string {
  return euros(valeur, Number.isInteger(arrondir2(valeur)) ? 0 : 2);
}
