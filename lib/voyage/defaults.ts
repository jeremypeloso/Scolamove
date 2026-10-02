import { AGENCE } from "./agence";
import { duree } from "./calcul";
import type {
  Categorie,
  Dossier,
  Etape,
  Jour,
  Prestation,
  Statut,
  StatutReservation,
  TypeEtape,
} from "./types";

export function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function genRef(): string {
  return `SCOLA-${Math.floor(100000 + Math.random() * 900000)}`;
}

export const STATUTS: { cle: Statut; label: string }[] = [
  { cle: "brouillon", label: "Brouillon" },
  { cle: "envoye", label: "Devis envoyé" },
  { cle: "accepte", label: "Accepté" },
  { cle: "termine", label: "Terminé" },
  { cle: "perdu", label: "Perdu" },
];

export const STATUTS_RESERVATION: { cle: StatutReservation; label: string }[] = [
  { cle: "a_reserver", label: "À réserver" },
  { cle: "option", label: "Option posée" },
  { cle: "confirme", label: "Confirmé" },
  { cle: "solde", label: "Soldé" },
];

export const TYPES_ETAPE: { cle: TypeEtape; label: string }[] = [
  { cle: "rdv", label: "Rendez-vous" },
  { cle: "trajet", label: "Trajet" },
  { cle: "visite", label: "Visite" },
  { cle: "repas", label: "Repas" },
  { cle: "hebergement", label: "Hébergement" },
  { cle: "libre", label: "Temps libre" },
  { cle: "autre", label: "Autre" },
];

// --- Transport Festimove -----------------------------------------------------

export const FLOTTE_FESTIMOVE = [43, 53, 57, 61, 63, 98];

export const BAREME_FESTIMOVE = { km: 2.5, excursion: 1000, immobilisation: 500, marge: 20 };

// Plus petit autocar de la flotte capable d'emmener tout le groupe.
export function vehiculeConseille(personnes: number): number | null {
  return FLOTTE_FESTIMOVE.find((places) => places >= personnes) ?? null;
}

// --- Ratios de zone (pré-chiffrage rapide, repris du devis express) ----------

export type Ratios = { t: number; h: number; r: number; a: number };

export const ZONES: Record<string, { label: string; ratios: Ratios }> = {
  france: { label: "France proche (moins de 400 km)", ratios: { t: 25, h: 15, r: 13, a: 5 } },
  "france-loin": { label: "France lointaine", ratios: { t: 31, h: 19, r: 17, a: 6 } },
  benelux: { label: "Bénélux", ratios: { t: 31, h: 19, r: 17, a: 6 } },
  espagne: { label: "Espagne", ratios: { t: 35, h: 20, r: 17, a: 6 } },
  portugal: { label: "Portugal", ratios: { t: 42, h: 24, r: 21, a: 7 } },
  italie: { label: "Italie", ratios: { t: 42, h: 31, r: 21, a: 6 } },
  uk: { label: "Royaume-Uni (ferry, tunnel)", ratios: { t: 38, h: 23, r: 20, a: 7 } },
  irlande: { label: "Irlande (ferry)", ratios: { t: 48, h: 29, r: 25, a: 8 } },
  "europe-est": { label: "Allemagne", ratios: { t: 31, h: 19, r: 16, a: 6 } },
  "europe-centrale": {
    label: "Europe centrale (Tchéquie, Pologne, Hongrie, Roumanie)",
    ratios: { t: 47, h: 29, r: 24, a: 9 },
  },
  lointain: { label: "Long courrier (avion, hors transport)", ratios: { t: 0, h: 30, r: 19, a: 7 } },
};

// --- Prestations -------------------------------------------------------------

export function nouvellePrestation(categorie: Categorie, partiel: Partial<Prestation> = {}): Prestation {
  return {
    id: uid(),
    categorie,
    libelle: "",
    mode: "personne",
    quantite: 1,
    unite: "",
    prixGroupe: 0,
    prixEleve: 0,
    prixAdulte: 0,
    conducteurs: false,
    taux: 0,
    minimum: 0,
    marge: null,
    enOption: false,
    jourId: null,
    prestataireId: null,
    statut: "a_reserver",
    refReservation: "",
    echeance: "",
    acompte: 0,
    note: "",
    ...partiel,
  };
}

export type ModeleLigne = { label: string; creer: (d: Dossier) => Prestation[] };

// Lignes prêtes à l'emploi proposées dans chaque poste de la cotation.
export const MODELES: Record<Categorie, ModeleLigne[]> = {
  transport: [
    {
      label: "Barème Festimove",
      creer: () => [
        nouvellePrestation("transport", {
          libelle: "Autocar Festimove, kilométrage aller et retour",
          mode: "groupe",
          quantite: 0,
          unite: "km",
          prixGroupe: BAREME_FESTIMOVE.km,
          marge: BAREME_FESTIMOVE.marge,
        }),
        nouvellePrestation("transport", {
          libelle: "Autocar Festimove, journées d'excursion sur place",
          mode: "groupe",
          quantite: 0,
          unite: "jour",
          prixGroupe: BAREME_FESTIMOVE.excursion,
          marge: BAREME_FESTIMOVE.marge,
        }),
        nouvellePrestation("transport", {
          libelle: "Autocar Festimove, journées d'immobilisation",
          mode: "groupe",
          quantite: 0,
          unite: "jour",
          prixGroupe: BAREME_FESTIMOVE.immobilisation,
          marge: BAREME_FESTIMOVE.marge,
        }),
      ],
    },
    {
      label: "Autocar sous-traité",
      creer: () => [
        nouvellePrestation("transport", { libelle: "Autocar grand tourisme (sous-traitance)", mode: "groupe", unite: "forfait" }),
      ],
    },
    {
      label: "Péages et parkings",
      creer: () => [nouvellePrestation("transport", { libelle: "Péages et parkings", mode: "groupe", unite: "forfait" })],
    },
    {
      label: "Ferry ou tunnel",
      creer: () => [nouvellePrestation("transport", { libelle: "Traversée ferry ou tunnel", mode: "groupe", unite: "trajet", quantite: 2 })],
    },
  ],
  hebergement: [
    {
      label: "Nuitées",
      creer: (d) => [
        nouvellePrestation("hebergement", {
          libelle: "Hébergement en pension complète",
          unite: "nuit",
          quantite: duree(d).nuits,
        }),
      ],
    },
    {
      label: "Taxe de séjour",
      creer: (d) => [
        nouvellePrestation("hebergement", { libelle: "Taxe de séjour", unite: "nuit", quantite: duree(d).nuits, marge: 0 }),
      ],
    },
    {
      label: "Chambre individuelle",
      creer: (d) => [
        nouvellePrestation("hebergement", {
          libelle: "Supplément chambre individuelle accompagnateurs",
          unite: "nuit",
          quantite: duree(d).nuits,
          marge: 0,
        }),
      ],
    },
    {
      label: "Hébergement conducteurs",
      creer: (d) => [
        nouvellePrestation("hebergement", {
          libelle: "Hébergement et repas des conducteurs",
          mode: "groupe",
          unite: "nuit",
          quantite: duree(d).nuits * Math.max(d.conducteurs, 1),
        }),
      ],
    },
  ],
  restauration: [
    { label: "Déjeuners", creer: () => [nouvellePrestation("restauration", { libelle: "Déjeuner", unite: "repas" })] },
    { label: "Dîners", creer: () => [nouvellePrestation("restauration", { libelle: "Dîner", unite: "repas" })] },
    { label: "Paniers repas", creer: () => [nouvellePrestation("restauration", { libelle: "Panier repas", unite: "repas" })] },
  ],
  visites: [
    { label: "Visite ou entrée", creer: () => [nouvellePrestation("visites", { libelle: "", unite: "entrée" })] },
    {
      label: "Guide (forfait)",
      creer: () => [nouvellePrestation("visites", { libelle: "Guide conférencier", mode: "groupe", unite: "prestation" })],
    },
  ],
  assurance: [
    {
      label: "Assurance annulation",
      creer: () => [
        nouvellePrestation("assurance", { libelle: "Assurance annulation", mode: "pourcent", taux: 2.5, minimum: 6 }),
      ],
    },
    {
      label: "Assistance rapatriement",
      creer: () => [nouvellePrestation("assurance", { libelle: "Assistance et rapatriement", marge: 0 })],
    },
  ],
  divers: [
    {
      label: "Assistance Scolamove",
      creer: (d) => [
        nouvellePrestation("divers", {
          libelle: "Assistance et suivi Scolamove",
          unite: "jour",
          quantite: Math.max(duree(d).jours, 1),
        }),
      ],
    },
    {
      label: "Frais de dossier",
      creer: () => [nouvellePrestation("divers", { libelle: "Frais de dossier", mode: "groupe", unite: "forfait" })],
    },
  ],
};

// Pré-chiffrage par ratios de zone : pose en quelques secondes des lignes
// estimées, à remplacer ensuite par les prix réels des prestataires.
export function preChiffrer(
  d: Dossier,
  zone: string,
  confort: number,
  flottePropre: boolean
): Prestation[] {
  const z = ZONES[zone];
  if (!z) return [];
  const { jours, nuits } = duree(d);
  const pax = d.eleves + d.accompagnateurs;
  const groupe = pax < 20 ? 1.4 : pax < 40 ? 1.15 : pax < 60 ? 1 : 0.95;
  const arrondi = (x: number) => Math.round(x * 100) / 100;
  const lignes: Prestation[] = [];

  if (z.ratios.t > 0) {
    const brut = z.ratios.t * Math.max(jours, 1) * 43;
    lignes.push(
      nouvellePrestation("transport", {
        libelle: flottePropre ? "Autocar Festimove (estimation de zone)" : "Autocar sous-traité (estimation de zone)",
        mode: "groupe",
        unite: "forfait",
        prixGroupe: arrondi(flottePropre ? brut * 0.7 : brut),
        marge: flottePropre ? BAREME_FESTIMOVE.marge : null,
      })
    );
  }
  const hebergement = arrondi(z.ratios.h * confort * groupe);
  lignes.push(
    nouvellePrestation("hebergement", {
      libelle: "Hébergement (estimation de zone)",
      unite: "nuit",
      quantite: nuits,
      prixEleve: hebergement,
      prixAdulte: hebergement,
    })
  );
  const repas = arrondi(z.ratios.r * confort);
  lignes.push(
    nouvellePrestation("restauration", {
      libelle: "Pension complète (estimation de zone)",
      unite: "jour",
      quantite: Math.max(nuits + 1, 1),
      prixEleve: repas,
      prixAdulte: repas,
    })
  );
  lignes.push(
    nouvellePrestation("divers", {
      libelle: "Assistance et suivi Scolamove",
      unite: "jour",
      quantite: Math.max(jours, 1),
      prixEleve: z.ratios.a,
      prixAdulte: z.ratios.a,
    })
  );
  return lignes;
}

// --- Programme ---------------------------------------------------------------

export function nouvelleEtape(partiel: Partial<Etape> = {}): Etape {
  return { id: uid(), heure: "", type: "visite", libelle: "", lieu: "", detail: "", prestationId: null, ...partiel };
}

export function nouveauJour(partiel: Partial<Jour> = {}): Jour {
  return { id: uid(), titre: "", resume: "", etapes: [], nuit: "", ...partiel };
}

// Catégorie de cotation correspondant à une étape que l'on chiffre.
export function categoriePourEtape(type: TypeEtape): Categorie {
  if (type === "repas") return "restauration";
  if (type === "hebergement") return "hebergement";
  if (type === "trajet") return "transport";
  return "visites";
}

// --- Textes ------------------------------------------------------------------

export const LETTRE_DEFAUT = [
  "Madame, Monsieur,",
  "",
  "Vous trouverez dans ce document la feuille de route de votre séjour. Elle rassemble les horaires, le programme détaillé, les coordonnées de vos prestataires et la répartition des chambres.",
  "",
  "Nous vous remercions de la lire attentivement et de la garder avec vous pendant tout le voyage. Notre permanence reste joignable à tout moment au numéro indiqué en page suivante.",
  "",
  "Toute l'équipe vous souhaite un excellent séjour.",
].join("\n");

export const FORMALITES_DEFAUT = [
  "Carte nationale d'identité ou passeport en cours de validité pour chaque participant.",
  "Autorisation de sortie du territoire pour chaque élève mineur, avec la copie de la pièce d'identité du parent signataire.",
  "Carte européenne d'assurance maladie pour chaque participant.",
  "Liste nominative des participants en double exemplaire.",
].join("\n");

export const CONSIGNES_DEFAUT = [
  "Un bagage en soute et un petit sac à dos par personne.",
  "Prévoir un pique-nique pour le premier repas du voyage aller.",
  "Une caution peut être demandée par l'hébergement à l'arrivée ; elle est rendue au départ en l'absence de dégradation.",
  "Les élèves restent sous la responsabilité de leurs accompagnateurs pendant tout le séjour.",
].join("\n");

export const CONDITIONS_DEFAUT = [
  "Prix établi sous réserve de disponibilité des prestataires au moment de la réservation.",
  "Toute variation de l'effectif entraîne une révision du prix par personne.",
  "Échéancier : 40 % dix semaines avant le départ, solde à réception des documents de voyage.",
].join("\n");

export const INTRO_DEFAUT =
  "Nous avons le plaisir de vous adresser notre proposition pour votre projet de voyage scolaire.";

function liste(libelles: string[]): string {
  const propres = libelles.map((l) => l.trim()).filter(Boolean);
  return [...new Set(propres)].join(", ");
}

function minuscule(texte: string): string {
  return texte ? texte.charAt(0).toLowerCase() + texte.slice(1) : texte;
}

// Nombre de nuits réellement passées à l'hébergement : la plus longue ligne
// d'hébergement comptée à la nuit, sinon la durée du voyage.
export function nuitsHebergement(d: Dossier): number {
  const lignes = d.prestations.filter(
    (p) => p.categorie === "hebergement" && !p.enOption && p.mode === "personne" && p.unite.toLowerCase().startsWith("nuit")
  );
  return lignes.length > 0 ? Math.max(...lignes.map((p) => p.quantite)) : duree(d).nuits;
}

// Rédige « Le prix comprend » et « ne comprend pas » d'après la cotation.
export function genererInclusions(d: Dossier): { comprend: string; neComprendPas: string } {
  const nuits = nuitsHebergement(d);
  const incluses = d.prestations.filter((p) => !p.enOption);
  const de = (categorie: Categorie) => incluses.filter((p) => p.categorie === categorie);
  const comprend: string[] = [];

  if (de("transport").length > 0) {
    comprend.push(
      "Le transport en autocar grand tourisme au départ de votre établissement, aller et retour, et sur place selon le programme",
      "Les frais de route : péages, parkings, hébergement et repas des conducteurs"
    );
  }
  if (de("hebergement").length > 0) {
    comprend.push(
      `L'hébergement pour ${nuits} nuit${nuits > 1 ? "s" : ""} : ${liste(de("hebergement").map((p) => minuscule(p.libelle)))}`
    );
  }
  if (de("restauration").length > 0) {
    comprend.push(`La restauration : ${liste(de("restauration").map((p) => minuscule(p.libelle)))}`);
  }
  if (de("visites").length > 0) {
    comprend.push("Les entrées, visites et activités réservées du programme, détaillées ci-dessous");
  }
  de("assurance").forEach((p) => comprend.push(p.libelle));
  comprend.push(
    "La réservation des sites et des musées",
    "Une permanence téléphonique 24 h/24 pendant le voyage",
    "Le dossier de voyage et la feuille de route"
  );

  const neComprendPas: string[] = [];
  d.prestations.filter((p) => p.enOption).forEach((p) => neComprendPas.push(`${p.libelle} (proposé en option)`));
  if (de("assurance").length === 0 && !d.prestations.some((p) => p.categorie === "assurance")) {
    neComprendPas.push("L'assurance annulation");
  }
  neComprendPas.push(
    "Les repas non mentionnés au programme",
    "Les dépenses personnelles",
    "Tout ce qui n'est pas mentionné dans « Le prix comprend »"
  );

  return { comprend: comprend.join("\n"), neComprendPas: neComprendPas.join("\n") };
}

// --- Dossier vierge ----------------------------------------------------------

export function nouveauDossier(partiel: Partial<Dossier> = {}): Dossier {
  return {
    schema: 1,
    reference: genRef(),
    statut: "brouillon",
    titre: "",
    destination: "",
    zone: "",
    client: {
      etablissement: "",
      adresse: "",
      codePostal: "",
      ville: "",
      enseignant: "",
      email: "",
      telephone: "",
      classe: "",
    },
    suiviPar: AGENCE.signataire,
    depart: "",
    retour: "",
    jours: 0,
    nuits: 0,
    nuitsForcees: null,
    periode: "",
    eleves: 0,
    accompagnateurs: 0,
    conducteurs: 1,
    programme: [],
    prestations: [],
    tarif: { marge: 5, gratuites: 0, arrondi: 1, prixFige: null, validiteJours: 30, acomptePct: 30, afficherPostes: false, joindreCgv: true },
    textes: {
      intro: INTRO_DEFAUT,
      comprend: "",
      neComprendPas: "",
      conditions: CONDITIONS_DEFAUT,
    },
    feuilleRoute: {
      lettre: LETTRE_DEFAUT,
      departLieu: "",
      departAdresse: "",
      convocation: "",
      departHeure: "",
      retourLieu: "",
      retourHeure: "",
      transporteur: "Autocars Festimove",
      vehicule: "",
      immatriculation: "",
      conducteurs: [{ nom: "", telephone: "" }],
      urgenceNom: `Permanence ${AGENCE.nom}`,
      urgenceTelephone: AGENCE.urgenceTelephone,
      formalites: FORMALITES_DEFAUT,
      consignes: CONSIGNES_DEFAUT,
    },
    participants: [],
    chambres: [],
    versions: [],
    sejourCatalogueId: null,
    devisExpressId: null,
    ...partiel,
  };
}

// Remet un document lu en base au format courant : un champ ajouté plus tard au
// modèle prend sa valeur par défaut au lieu de faire planter l'écran.
export function normaliser(brut: Partial<Dossier> | null | undefined): Dossier {
  const base = nouveauDossier();
  const d = brut || {};
  return {
    ...base,
    ...d,
    client: { ...base.client, ...(d.client || {}) },
    tarif: { ...base.tarif, ...(d.tarif || {}) },
    textes: { ...base.textes, ...(d.textes || {}) },
    feuilleRoute: { ...base.feuilleRoute, ...(d.feuilleRoute || {}) },
    programme: (d.programme || []).map((j) => ({
      ...nouveauJour(),
      ...j,
      etapes: (j.etapes || []).map((e) => ({ ...nouvelleEtape(), ...e })),
    })),
    prestations: (d.prestations || []).map((p) => ({ ...nouvellePrestation(p.categorie || "divers"), ...p })),
    participants: d.participants || [],
    chambres: d.chambres || [],
    versions: d.versions || [],
  };
}
