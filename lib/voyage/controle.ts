import { avancementReservations, calculer, duree } from "./calcul";
import { vehiculeConseille } from "./defaults";
import type { Dossier, Prestataire } from "./types";

export type Onglet = "dossier" | "programme" | "cotation" | "devis" | "reservations" | "feuille";

export type Point = { onglet: Onglet; message: string; bloquant: boolean };

// Ce qui manque avant d'envoyer le devis.
export function controlerDevis(d: Dossier): Point[] {
  const points: Point[] = [];
  const calcul = calculer(d);
  const { jours } = duree(d);
  if (!d.client.etablissement.trim()) points.push({ onglet: "dossier", message: "Établissement non renseigné", bloquant: true });
  if (!d.destination.trim()) points.push({ onglet: "dossier", message: "Destination non renseignée", bloquant: true });
  if (d.eleves <= 0) points.push({ onglet: "dossier", message: "Effectif élèves à zéro", bloquant: true });
  if (jours <= 0) points.push({ onglet: "dossier", message: "Dates ou durée du voyage à renseigner", bloquant: true });
  if (d.programme.length === 0) points.push({ onglet: "programme", message: "Programme vide", bloquant: false });
  if (d.prestations.length === 0) points.push({ onglet: "cotation", message: "Aucune prestation chiffrée", bloquant: true });
  d.prestations.forEach((p) => {
    if (!p.libelle.trim()) points.push({ onglet: "cotation", message: "Une prestation n'a pas de libellé", bloquant: false });
    else if (p.mode !== "pourcent" && (calcul.lignes[p.id]?.revient || 0) === 0) {
      points.push({ onglet: "cotation", message: `Prix manquant : ${p.libelle}`, bloquant: false });
    }
  });
  if (calcul.revient > 0 && calcul.marge < 0) {
    points.push({ onglet: "cotation", message: "Le prix de vente est inférieur au prix de revient", bloquant: true });
  }
  if (!d.textes.comprend.trim()) points.push({ onglet: "devis", message: "« Le prix comprend » à rédiger", bloquant: false });
  return points;
}

// Ce qui manque avant de remettre la feuille de route.
export function controlerFeuilleRoute(d: Dossier, prestataires: Prestataire[]): Point[] {
  const points: Point[] = [];
  const f = d.feuilleRoute;
  const reservations = avancementReservations(d);
  const pax = d.eleves + d.accompagnateurs;

  if (!d.depart || !d.retour) points.push({ onglet: "dossier", message: "Dates de départ et de retour à fixer", bloquant: true });
  if (!f.departLieu.trim()) points.push({ onglet: "feuille", message: "Lieu de départ non renseigné", bloquant: true });
  if (!f.convocation.trim() || !f.departHeure.trim()) {
    points.push({ onglet: "feuille", message: "Heures de convocation et de départ à renseigner", bloquant: true });
  }
  if (!f.retourHeure.trim()) points.push({ onglet: "feuille", message: "Heure de retour prévue non renseignée", bloquant: false });
  if (!f.urgenceTelephone.trim()) points.push({ onglet: "feuille", message: "Numéro de permanence non renseigné", bloquant: true });
  if (!f.conducteurs.some((c) => c.nom.trim())) points.push({ onglet: "feuille", message: "Conducteur non désigné", bloquant: false });
  if (!f.vehicule.trim()) points.push({ onglet: "feuille", message: "Véhicule non renseigné", bloquant: false });

  const places = vehiculeConseille(pax + d.conducteurs);
  if (pax > 0 && places === null) {
    points.push({ onglet: "feuille", message: `${pax + d.conducteurs} personnes : prévoir deux autocars`, bloquant: false });
  }

  if (d.programme.length < duree(d).jours) {
    points.push({ onglet: "programme", message: "Le programme compte moins de jours que le voyage", bloquant: false });
  }
  const sansHeure = d.programme.reduce((s, j) => s + j.etapes.filter((e) => e.libelle.trim() && !e.heure.trim()).length, 0);
  if (sansHeure > 0) {
    points.push({ onglet: "programme", message: `${sansHeure} étape${sansHeure > 1 ? "s" : ""} sans horaire`, bloquant: false });
  }

  if (reservations.total > reservations.confirmees) {
    const reste = reservations.total - reservations.confirmees;
    points.push({
      onglet: "reservations",
      message: `${reste} réservation${reste > 1 ? "s" : ""} non confirmée${reste > 1 ? "s" : ""}`,
      bloquant: true,
    });
  }
  const utilises = new Set(d.prestations.map((p) => p.prestataireId).filter(Boolean));
  prestataires
    .filter((p) => utilises.has(p.id) && !p.telephone.trim())
    .forEach((p) => points.push({ onglet: "reservations", message: `Téléphone manquant : ${p.nom}`, bloquant: false }));

  if (d.participants.length === 0) {
    points.push({ onglet: "feuille", message: "Liste des participants à saisir", bloquant: false });
  } else {
    if (d.participants.length !== pax) {
      points.push({
        onglet: "feuille",
        message: `${d.participants.length} participants saisis pour un effectif de ${pax}`,
        bloquant: false,
      });
    }
    const sansChambre = d.participants.filter((p) => !p.chambreId).length;
    if (sansChambre > 0) {
      points.push({ onglet: "feuille", message: `${sansChambre} participant${sansChambre > 1 ? "s" : ""} sans chambre`, bloquant: false });
    }
    d.chambres.forEach((c) => {
      const occupants = d.participants.filter((p) => p.chambreId === c.id).length;
      if (occupants > c.capacite) {
        points.push({ onglet: "feuille", message: `Chambre ${c.nom} : ${occupants} occupants pour ${c.capacite} lits`, bloquant: true });
      }
    });
  }
  return points;
}
