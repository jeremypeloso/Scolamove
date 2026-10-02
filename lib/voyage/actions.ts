// Opérations sur le dossier. Toutes pures : elles reçoivent un dossier et en
// rendent un nouveau, ce qui garde la cohérence entre programme et cotation
// (une étape chiffrée et sa prestation vivent et meurent ensemble).

import type { Calcul } from "./calcul";
import { duree } from "./calcul";
import { categoriePourEtape, nouveauJour, nouvelleEtape, nouvellePrestation } from "./defaults";
import type { Dossier, Etape, Jour, Prestation, TypeEtape } from "./types";

export function deplacer<T>(liste: T[], index: number, delta: number): T[] {
  const cible = index + delta;
  if (cible < 0 || cible >= liste.length) return liste;
  const copie = [...liste];
  [copie[index], copie[cible]] = [copie[cible], copie[index]];
  return copie;
}

// --- Prestations ---------------------------------------------------------------

export function majPrestation(d: Dossier, id: string, patch: Partial<Prestation>): Dossier {
  return { ...d, prestations: d.prestations.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
}

export function ajouterPrestations(d: Dossier, lignes: Prestation[]): Dossier {
  return { ...d, prestations: [...d.prestations, ...lignes] };
}

export function supprimerPrestation(d: Dossier, id: string): Dossier {
  return {
    ...d,
    prestations: d.prestations.filter((p) => p.id !== id),
    programme: d.programme.map((j) => ({
      ...j,
      etapes: j.etapes.map((e) => (e.prestationId === id ? { ...e, prestationId: null } : e)),
    })),
  };
}

export function deplacerPrestation(d: Dossier, id: string, delta: number): Dossier {
  // Le déplacement se fait parmi les lignes du même poste.
  const cible = d.prestations.find((p) => p.id === id);
  if (!cible) return d;
  const memePoste = d.prestations.filter((p) => p.categorie === cible.categorie);
  const reordonne = deplacer(memePoste, memePoste.findIndex((p) => p.id === id), delta);
  let k = 0;
  return { ...d, prestations: d.prestations.map((p) => (p.categorie === cible.categorie ? reordonne[k++] : p)) };
}

// --- Programme -------------------------------------------------------------------

export function majJour(d: Dossier, jourId: string, patch: Partial<Jour>): Dossier {
  return { ...d, programme: d.programme.map((j) => (j.id === jourId ? { ...j, ...patch } : j)) };
}

export function ajouterJour(d: Dossier): Dossier {
  return { ...d, programme: [...d.programme, nouveauJour()] };
}

// Crée les jours manquants pour couvrir la durée du voyage.
export function completerJours(d: Dossier): Dossier {
  const manque = duree(d).jours - d.programme.length;
  if (manque <= 0) return d;
  return { ...d, programme: [...d.programme, ...Array.from({ length: manque }, () => nouveauJour())] };
}

export function supprimerJour(d: Dossier, jourId: string): Dossier {
  const jour = d.programme.find((j) => j.id === jourId);
  if (!jour) return d;
  const liees = new Set(jour.etapes.map((e) => e.prestationId).filter(Boolean));
  return {
    ...d,
    programme: d.programme.filter((j) => j.id !== jourId),
    prestations: d.prestations
      .filter((p) => !liees.has(p.id))
      .map((p) => (p.jourId === jourId ? { ...p, jourId: null } : p)),
  };
}

export function ajouterEtape(d: Dossier, jourId: string, type: TypeEtape, libelle = ""): Dossier {
  return {
    ...d,
    programme: d.programme.map((j) =>
      j.id === jourId ? { ...j, etapes: [...j.etapes, nouvelleEtape({ type, libelle })] } : j
    ),
  };
}

export function majEtape(d: Dossier, jourId: string, etapeId: string, patch: Partial<Etape>): Dossier {
  let prestations = d.prestations;
  const jour = d.programme.find((j) => j.id === jourId);
  const etape = jour?.etapes.find((e) => e.id === etapeId);
  // Le libellé d'une étape chiffrée reste celui de sa prestation.
  if (etape?.prestationId && patch.libelle !== undefined) {
    prestations = prestations.map((p) => (p.id === etape.prestationId ? { ...p, libelle: patch.libelle as string } : p));
  }
  return {
    ...d,
    prestations,
    programme: d.programme.map((j) =>
      j.id === jourId ? { ...j, etapes: j.etapes.map((e) => (e.id === etapeId ? { ...e, ...patch } : e)) } : j
    ),
  };
}

export function supprimerEtape(d: Dossier, jourId: string, etapeId: string): Dossier {
  const etape = d.programme.find((j) => j.id === jourId)?.etapes.find((e) => e.id === etapeId);
  return {
    ...d,
    prestations: etape?.prestationId ? d.prestations.filter((p) => p.id !== etape.prestationId) : d.prestations,
    programme: d.programme.map((j) => (j.id === jourId ? { ...j, etapes: j.etapes.filter((e) => e.id !== etapeId) } : j)),
  };
}

// Chiffrer une étape : crée la prestation correspondante dans la cotation.
export function chiffrerEtape(d: Dossier, jourId: string, etapeId: string): Dossier {
  const etape = d.programme.find((j) => j.id === jourId)?.etapes.find((e) => e.id === etapeId);
  if (!etape || etape.prestationId) return d;
  const prestation = nouvellePrestation(categoriePourEtape(etape.type), {
    libelle: etape.libelle,
    unite: etape.type === "repas" ? "repas" : etape.type === "visite" ? "entrée" : "",
    jourId,
  });
  return {
    ...d,
    prestations: [...d.prestations, prestation],
    programme: d.programme.map((j) =>
      j.id === jourId
        ? { ...j, etapes: j.etapes.map((e) => (e.id === etapeId ? { ...e, prestationId: prestation.id } : e)) }
        : j
    ),
  };
}

// --- Versions du devis -----------------------------------------------------------

// Fige l'état du devis au moment de son envoi au client.
export function figerVersion(d: Dossier, calcul: Calcul, note: string): Dossier {
  const { versions, ...instantane } = d;
  return {
    ...d,
    statut: d.statut === "brouillon" ? "envoye" : d.statut,
    versions: [
      ...versions,
      {
        numero: versions.length + 1,
        date: new Date().toISOString(),
        prixParPayant: calcul.prixParPayant,
        totalVente: calcul.totalVente,
        payants: calcul.payants,
        note,
        instantane,
      },
    ].slice(-20),
  };
}
