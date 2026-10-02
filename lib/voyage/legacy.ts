// -----------------------------------------------------------------------------
// Reprise d'un devis express (table devis_express) dans un dossier de voyage.
//
// Le devis express chiffrait par ratios de zone. On rejoue ici exactement son
// calcul pour le transformer en lignes de cotation : le prix par personne du
// dossier repris est identique à celui du devis d'origine.
// -----------------------------------------------------------------------------

import {
  genererInclusions,
  nouveauDossier,
  nouveauJour,
  nouvelleEtape,
  nouvellePrestation,
  ZONES,
} from "./defaults";
import { arrondir2, calculer } from "./calcul";
import type { Dossier, Jour, Prestation } from "./types";

type Ratios = { t: number; h: number; r: number; a: number };

export type DevisExpressData = {
  zone?: string;
  jours?: number;
  nuits?: number;
  eleves?: number;
  accomp?: number;
  confort?: string;
  visites?: number;
  marge?: number;
  sousTraite?: boolean;
  margeTransport?: number;
  ratios?: Ratios;
  assuranceCheck?: boolean;
  assurancePct?: number;
  assuranceMin?: number;
  taxeSejourCheck?: boolean;
  taxeSejourMontant?: number;
  repasTrajetCheck?: boolean;
  repasTrajetMontant?: number;
  cautionCheck?: boolean;
  cautionMontant?: number;
  chambreIndivCheck?: boolean;
  chambreIndivMontant?: number;
  etablissement?: string;
  dossierSuiviPar?: string;
  teacherName?: string;
  teacherEmail?: string;
  ville?: string;
  reference?: string;
  dateVoyage?: string;
  programme?: string;
  selectedSejourId?: string;
  detailVisites?: { id: string; jour: string; libelle: string; prixEleve: number; prixAdulte: number }[];
  baremeCheck?: boolean;
  baremeKm?: number;
  baremePrixKm?: number;
  baremeJoursExcursion?: number;
  baremePrixExcursion?: number;
  baremeJoursImmo?: number;
  baremePrixImmo?: number;
};

export type DevisExpressRow = {
  id: string;
  reference: string;
  etablissement: string | null;
  ville: string | null;
  zone: string | null;
  prix_ferme: number | null;
  pax: number | null;
  created_at: string;
  data: DevisExpressData;
};

function num(valeur: unknown, defaut = 0): number {
  const x = Number(valeur);
  return Number.isFinite(x) ? x : defaut;
}

function lireProgramme(texte: string): Jour[] {
  const jours: Jour[] = [];
  let tampon: string[] = [];
  const fermer = () => {
    if (jours.length > 0) jours[jours.length - 1].resume = tampon.join("\n").trim();
    tampon = [];
  };
  texte.split("\n").forEach((ligne) => {
    const m = ligne.match(/^\s*JOUR\s*\d+\s*[:\-–]?\s*(.*)$/i);
    if (m) {
      fermer();
      jours.push(nouveauJour({ titre: (m[1] || "").trim() }));
    } else if (jours.length > 0) {
      tampon.push(ligne);
    }
  });
  fermer();
  // Programme sans découpage « JOUR X » : conservé d'un bloc sur le premier jour.
  if (jours.length === 0 && texte.trim()) {
    jours.push(nouveauJour({ titre: "Programme", resume: texte.trim() }));
  }
  return jours;
}

// Tente de lire « du 24 au 30/04/2027 » ou « 24/04/2027 - 30/04/2027 ».
function lireDates(texte: string): { depart: string; retour: string } | null {
  const iso = (j: string, m: string, a: string) => `${a}-${m.padStart(2, "0")}-${j.padStart(2, "0")}`;
  const complet = texte.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}).*?(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (complet) {
    return { depart: iso(complet[1], complet[2], complet[3]), retour: iso(complet[4], complet[5], complet[6]) };
  }
  const court = texte.match(/(\d{1,2})\s*(?:au|-|–)\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (court) {
    return { depart: iso(court[1], court[3], court[4]), retour: iso(court[2], court[3], court[4]) };
  }
  return null;
}

export function convertirDevisExpress(row: DevisExpressRow): Dossier {
  const x = row.data || {};
  const zoneCle = x.zone || row.zone || "";
  const zone = ZONES[zoneCle];
  const ratios: Ratios = x.ratios || zone?.ratios || { t: 0, h: 0, r: 0, a: 0 };

  const jours = num(x.jours);
  const nuits = num(x.nuits);
  const eleves = num(x.eleves);
  const accomp = num(x.accomp);
  const pax = eleves + accomp;
  const marge = num(x.marge, 5);
  const niveau = parseFloat(x.confort || "1") || 1;
  const groupe = pax < 20 ? 1.4 : pax < 40 ? 1.15 : pax < 60 ? 1 : 0.95;
  const joursPension = Math.max(nuits + 1, 1);
  const margeTransport = x.sousTraite ? marge : num(x.margeTransport, 20);

  const programme = lireProgramme(x.programme || "");
  const prestations: Prestation[] = [];

  // --- Transport ---
  if (x.baremeCheck) {
    const bareme: [string, number, number, string][] = [
      ["Autocar Festimove, kilométrage aller et retour", num(x.baremeKm), num(x.baremePrixKm, 2.5), "km"],
      ["Autocar Festimove, journées d'excursion sur place", num(x.baremeJoursExcursion), num(x.baremePrixExcursion, 1000), "jour"],
      ["Autocar Festimove, journées d'immobilisation", num(x.baremeJoursImmo), num(x.baremePrixImmo, 500), "jour"],
    ];
    bareme.forEach(([libelle, quantite, prix, unite]) => {
      if (quantite <= 0) return;
      prestations.push(
        nouvellePrestation("transport", { libelle, mode: "groupe", quantite, unite, prixGroupe: prix, marge: margeTransport })
      );
    });
  } else if (ratios.t > 0) {
    const brut = ratios.t * Math.max(jours, 1) * 43;
    prestations.push(
      nouvellePrestation("transport", {
        libelle: x.sousTraite ? "Autocar sous-traité (estimation de zone)" : "Autocar Festimove (estimation de zone)",
        mode: "groupe",
        unite: "forfait",
        prixGroupe: x.sousTraite ? brut : brut * 0.7,
        marge: margeTransport,
      })
    );
  }

  // --- Hébergement, pension, assistance ---
  if (ratios.h > 0 && nuits > 0) {
    const prix = ratios.h * niveau * groupe;
    prestations.push(
      nouvellePrestation("hebergement", {
        libelle: "Hébergement en pension complète",
        unite: "nuit",
        quantite: nuits,
        prixEleve: prix,
        prixAdulte: prix,
        marge,
      })
    );
  }
  if (ratios.r > 0) {
    const prix = ratios.r * niveau;
    prestations.push(
      nouvellePrestation("restauration", {
        libelle: "Repas en pension complète",
        unite: "jour",
        quantite: joursPension,
        prixEleve: prix,
        prixAdulte: prix,
        marge,
      })
    );
  }
  if (ratios.a > 0) {
    prestations.push(
      nouvellePrestation("divers", {
        libelle: "Assistance et suivi Scolamove",
        unite: "jour",
        quantite: Math.max(jours, 1),
        prixEleve: ratios.a,
        prixAdulte: ratios.a,
        marge,
      })
    );
  }

  // --- Visites ---
  // Le devis express chiffrait un budget moyen par jour et par personne. Si le
  // détail saisi retombe sur ce budget, on reprend les visites une à une ;
  // sinon on garde le budget global pour ne pas modifier le prix validé.
  const budgetVisites = num(x.visites) * joursPension * pax;
  const detail = (x.detailVisites || []).filter((v) => v.libelle?.trim());
  const totalDetail = detail.reduce((s, v) => s + num(v.prixEleve) * eleves + num(v.prixAdulte) * accomp, 0);
  // Tolérance : le budget par jour était arrondi au centime dans le devis express.
  const tolerance = 0.005 * joursPension * Math.max(pax, 1) + 0.5;
  if (detail.length > 0 && Math.abs(totalDetail - budgetVisites) <= tolerance) {
    detail.forEach((v) => {
      const m = (v.jour || "").match(/(\d+)/);
      const jour = m ? programme[Number(m[1]) - 1] : undefined;
      const prestation = nouvellePrestation("visites", {
        libelle: v.libelle.trim(),
        unite: "entrée",
        prixEleve: num(v.prixEleve),
        prixAdulte: num(v.prixAdulte),
        marge,
        jourId: jour ? jour.id : null,
      });
      prestations.push(prestation);
      if (jour) {
        jour.etapes.push(nouvelleEtape({ type: "visite", libelle: v.libelle.trim(), prestationId: prestation.id }));
      }
    });
  } else if (budgetVisites > 0) {
    prestations.push(
      nouvellePrestation("visites", {
        libelle: "Visites et activités du programme (budget)",
        unite: "jour",
        quantite: joursPension,
        prixEleve: num(x.visites),
        prixAdulte: num(x.visites),
        marge,
      })
    );
  }

  // --- Options du devis express, toutes refacturées sans marge ---
  if (x.assuranceCheck) {
    // Montant figé à la valeur du devis d'origine (assiette hors taxe de séjour,
    // repas de trajet et chambres individuelles).
    const base = prestations.reduce((s, p) => {
      const adultes = accomp;
      const revient =
        p.mode === "groupe" ? p.quantite * p.prixGroupe : p.quantite * (p.prixEleve * eleves + p.prixAdulte * adultes);
      return s + revient * (1 + (p.marge ?? marge) / 100);
    }, 0);
    const parPersonne = Math.max(((base / Math.max(pax, 1)) * num(x.assurancePct, 2.5)) / 100, num(x.assuranceMin, 6));
    prestations.push(
      nouvellePrestation("assurance", {
        libelle: "Assurance annulation",
        prixEleve: parPersonne,
        prixAdulte: parPersonne,
        marge: 0,
      })
    );
  }
  if (x.taxeSejourCheck && nuits > 0) {
    prestations.push(
      nouvellePrestation("hebergement", {
        libelle: "Taxe de séjour",
        unite: "nuit",
        quantite: nuits,
        prixEleve: num(x.taxeSejourMontant, 1.5),
        prixAdulte: num(x.taxeSejourMontant, 1.5),
        marge: 0,
      })
    );
  }
  if (x.repasTrajetCheck) {
    prestations.push(
      nouvellePrestation("restauration", {
        libelle: "Repas du voyage aller et retour",
        unite: "forfait",
        prixEleve: num(x.repasTrajetMontant, 33),
        prixAdulte: num(x.repasTrajetMontant, 33),
        marge: 0,
      })
    );
  }
  if (x.chambreIndivCheck && nuits > 0) {
    prestations.push(
      nouvellePrestation("hebergement", {
        libelle: "Supplément chambre individuelle accompagnateurs",
        unite: "nuit",
        quantite: nuits,
        prixEleve: 0,
        prixAdulte: num(x.chambreIndivMontant, 25),
        marge: 0,
      })
    );
  }

  const dates = lireDates(x.dateVoyage || "");
  const base = nouveauDossier();
  const dossier: Dossier = {
    ...base,
    reference: x.reference || row.reference,
    titre: zone ? `Séjour ${zone.label}` : "Voyage scolaire",
    destination: zone ? zone.label : "",
    zone: zoneCle,
    client: {
      ...base.client,
      etablissement: x.etablissement || row.etablissement || "",
      ville: x.ville || row.ville || "",
      enseignant: x.teacherName || "",
      email: x.teacherEmail || "",
    },
    suiviPar: x.dossierSuiviPar || base.suiviPar,
    depart: dates?.depart || "",
    retour: dates?.retour || "",
    jours,
    nuits,
    periode: dates ? "" : x.dateVoyage || "",
    eleves,
    accompagnateurs: accomp,
    programme,
    prestations,
    // Prix unique par personne, au centime : la règle du devis express.
    tarif: { ...base.tarif, marge, gratuites: 0, arrondi: 0 },
    sejourCatalogueId: x.selectedSejourId || null,
    devisExpressId: row.id,
  };

  const inclusions = genererInclusions(dossier);
  const neComprendPas = x.cautionCheck
    ? `La caution demandée sur place par l'hébergement (environ ${num(x.cautionMontant, 10)} € par personne, rendue en fin de séjour)\n${inclusions.neComprendPas}`
    : inclusions.neComprendPas;
  dossier.textes = { ...dossier.textes, comprend: inclusions.comprend, neComprendPas };

  // Garde-fou : si la reprise ne retombe pas au centime sur le prix du devis
  // d'origine, ce prix est figé pour que le client retrouve le même montant.
  const prixOrigine = arrondir2(num(row.prix_ferme));
  if (prixOrigine > 0 && Math.abs(calculer(dossier).prixParPayant - prixOrigine) > 0.004) {
    dossier.tarif = { ...dossier.tarif, prixFige: prixOrigine };
  }

  return dossier;
}
