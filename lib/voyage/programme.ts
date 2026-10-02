import { duree } from "./calcul";
import type { Dossier, Etape, Jour } from "./types";

const JOURS_SEMAINE = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function lireDate(iso: string): Date | null {
  if (!iso) return null;
  const t = Date.parse(`${iso}T00:00:00Z`);
  return Number.isFinite(t) ? new Date(t) : null;
}

export function dateDuJour(d: Pick<Dossier, "depart">, index: number): Date | null {
  const debut = lireDate(d.depart);
  if (!debut) return null;
  return new Date(debut.getTime() + index * 86400000);
}

// « samedi 24 avril »
export function formatJour(date: Date | null, avecAnnee = false): string {
  if (!date) return "";
  const base = `${JOURS_SEMAINE[date.getUTCDay()]} ${date.getUTCDate() === 1 ? "1er" : date.getUTCDate()} ${MOIS[date.getUTCMonth()]}`;
  return avecAnnee ? `${base} ${date.getUTCFullYear()}` : base;
}

// « sam. 24/04 »
export function formatJourCourt(date: Date | null): string {
  if (!date) return "";
  const jj = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${JOURS_SEMAINE[date.getUTCDay()].slice(0, 3)}. ${jj}/${mm}`;
}

export function formatDate(iso: string): string {
  const date = lireDate(iso);
  if (!date) return "";
  return `${date.getUTCDate() === 1 ? "1er" : date.getUTCDate()} ${MOIS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatDateCourte(iso: string): string {
  const date = lireDate(iso);
  if (!date) return "";
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

// Période du voyage telle qu'elle s'écrit sur les documents.
export function periodeTexte(d: Dossier): string {
  const debut = lireDate(d.depart);
  const fin = lireDate(d.retour);
  const { jours, nuits } = duree(d);
  const dureeTexte = jours > 0 ? `${jours} jour${jours > 1 ? "s" : ""}, ${nuits} nuit${nuits > 1 ? "s" : ""}` : "";
  if (debut && fin) {
    const memeMois = debut.getUTCMonth() === fin.getUTCMonth() && debut.getUTCFullYear() === fin.getUTCFullYear();
    const depart = memeMois
      ? `${debut.getUTCDate() === 1 ? "1er" : debut.getUTCDate()}`
      : `${debut.getUTCDate() === 1 ? "1er" : debut.getUTCDate()} ${MOIS[debut.getUTCMonth()]}${
          debut.getUTCFullYear() === fin.getUTCFullYear() ? "" : ` ${debut.getUTCFullYear()}`
        }`;
    return `du ${depart} au ${formatDate(d.retour)}${dureeTexte ? ` (${dureeTexte})` : ""}`;
  }
  if (d.periode.trim()) return dureeTexte ? `${d.periode.trim()} (${dureeTexte})` : d.periode.trim();
  return dureeTexte ? `${dureeTexte}, dates à préciser` : "Dates à préciser";
}

export function effectifTexte(d: Dossier): string {
  const eleves = `${d.eleves} élève${d.eleves > 1 ? "s" : ""}`;
  const adultes = `${d.accompagnateurs} accompagnateur${d.accompagnateurs > 1 ? "s" : ""}`;
  return `${eleves} et ${adultes}`;
}

// --- Tableau synoptique --------------------------------------------------------

export type LigneSynoptique = {
  jour: string;
  date: string;
  matin: string[];
  dejeuner: string[];
  apresMidi: string[];
  diner: string[];
  nuit: string;
};

function minutes(heure: string): number | null {
  const m = heure.match(/^(\d{1,2})[:hH](\d{2})?/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2] || 0);
}

type Creneau = "matin" | "dejeuner" | "apresMidi" | "diner";

// Range une étape dans son créneau de la journée. Sans heure, elle suit le
// créneau de l'étape précédente : l'ordre de saisie fait foi.
function creneau(etape: Etape, precedent: Creneau): Creneau {
  const t = minutes(etape.heure);
  if (etape.type === "repas") {
    if (t === null) return precedent === "matin" ? "dejeuner" : precedent === "dejeuner" ? "dejeuner" : "diner";
    if (t < 10 * 60) return "matin";
    return t < 16 * 60 ? "dejeuner" : "diner";
  }
  if (t === null) return precedent === "dejeuner" ? "apresMidi" : precedent === "diner" ? "diner" : precedent;
  if (t < 12 * 60 + 30) return "matin";
  return t < 19 * 60 + 30 ? "apresMidi" : "diner";
}

export function synoptique(d: Dossier): LigneSynoptique[] {
  return d.programme.map((jour: Jour, index: number) => {
    const ligne: LigneSynoptique = {
      jour: `Jour ${index + 1}`,
      date: formatJourCourt(dateDuJour(d, index)),
      matin: [],
      dejeuner: [],
      apresMidi: [],
      diner: [],
      nuit: jour.nuit,
    };
    let courant: Creneau = "matin";
    jour.etapes.forEach((etape) => {
      if (!etape.libelle.trim()) return;
      courant = creneau(etape, courant);
      ligne[courant].push(etape.libelle.trim());
    });
    return ligne;
  });
}

// Ajuste le nombre de jours du programme à la durée du voyage, sans rien perdre.
export function joursManquants(d: Dossier): number {
  return Math.max(duree(d).jours - d.programme.length, 0);
}
