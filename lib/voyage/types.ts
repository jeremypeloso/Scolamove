// -----------------------------------------------------------------------------
// Modèle du dossier de voyage.
//
// Un seul objet porte tout le cycle de vie d'un voyage : la demande, le devis,
// les réservations chez les prestataires, puis la feuille de route. Le devis et
// la feuille de route ne sont que deux lectures de ce même dossier : rien n'est
// ressaisi entre les deux.
// -----------------------------------------------------------------------------

export type Statut = "brouillon" | "envoye" | "accepte" | "termine" | "perdu";

export type Categorie =
  | "transport"
  | "hebergement"
  | "restauration"
  | "visites"
  | "assurance"
  | "divers";

// groupe   : forfait pour tout le groupe (quantité × prix unitaire)
// personne : tarif par personne, distinct élève / adulte (× quantité)
// pourcent : pourcentage du prix de vente par personne (assurance annulation)
export type ModePrix = "groupe" | "personne" | "pourcent";

export type StatutReservation = "a_reserver" | "option" | "confirme" | "solde";

export type Prestation = {
  id: string;
  categorie: Categorie;
  libelle: string;
  mode: ModePrix;
  quantite: number;
  unite: string;
  prixGroupe: number;
  prixEleve: number;
  prixAdulte: number;
  // Compter aussi les conducteurs, au tarif adulte (hébergement, repas).
  conducteurs: boolean;
  taux: number;
  minimum: number;
  // null : la marge du dossier s'applique.
  marge: number | null;
  // Proposée en option : chiffrée sur le devis mais hors prix du voyage.
  enOption: boolean;
  // Jour du programme auquel la prestation est rattachée (visite, repas…).
  jourId: string | null;

  // Suivi de réservation
  prestataireId: string | null;
  statut: StatutReservation;
  refReservation: string;
  echeance: string;
  acompte: number;
  note: string;
};

export type TypeEtape =
  | "rdv"
  | "trajet"
  | "visite"
  | "repas"
  | "hebergement"
  | "libre"
  | "autre";

export type Etape = {
  id: string;
  heure: string;
  type: TypeEtape;
  libelle: string;
  lieu: string;
  detail: string;
  // Prestation chiffrée liée à cette étape (entrée de musée, restaurant…).
  prestationId: string | null;
};

export type Jour = {
  id: string;
  titre: string;
  // Texte de présentation repris sur le devis.
  resume: string;
  etapes: Etape[];
  // Lieu de la nuitée, repris dans le tableau synoptique.
  nuit: string;
};

export type Participant = {
  id: string;
  nom: string;
  prenom: string;
  role: "eleve" | "accompagnateur";
  classe: string;
  chambreId: string | null;
  remarque: string;
};

export type Chambre = {
  id: string;
  nom: string;
  capacite: number;
};

export type Conducteur = { nom: string; telephone: string };

export type FeuilleRoute = {
  lettre: string;
  departLieu: string;
  departAdresse: string;
  convocation: string;
  departHeure: string;
  retourLieu: string;
  retourHeure: string;
  transporteur: string;
  vehicule: string;
  immatriculation: string;
  conducteurs: Conducteur[];
  urgenceNom: string;
  urgenceTelephone: string;
  formalites: string;
  consignes: string;
};

export type Tarif = {
  // Marge par défaut, en % appliqué sur le prix de revient.
  marge: number;
  // Nombre d'accompagnateurs gratuits : leur coût est réparti sur les payants.
  gratuites: number;
  // Arrondi du prix par personne : 0 = au centime, 1 = à l'euro supérieur, 5 = aux 5 €.
  arrondi: 0 | 1 | 5;
  // Prix par personne figé (devis accepté) : les coûts peuvent encore bouger,
  // seule la marge varie. null = prix calculé.
  prixFige: number | null;
  validiteJours: number;
  acomptePct: number;
  // Afficher le prix par poste (transport, hébergement…) sur le devis.
  afficherPostes: boolean;
  // Joindre les conditions de vente à la suite du devis.
  joindreCgv: boolean;
};

export type Textes = {
  intro: string;
  comprend: string;
  neComprendPas: string;
  conditions: string;
};

export type Client = {
  etablissement: string;
  adresse: string;
  codePostal: string;
  ville: string;
  enseignant: string;
  email: string;
  telephone: string;
  classe: string;
};

// Version figée du devis, créée à chaque envoi au client.
export type VersionDevis = {
  numero: number;
  date: string;
  prixParPayant: number;
  totalVente: number;
  payants: number;
  note: string;
  // Dossier complet au moment de l'envoi (sans l'historique des versions).
  instantane: Omit<Dossier, "versions">;
};

export type Dossier = {
  schema: 1;
  reference: string;
  statut: Statut;
  titre: string;
  destination: string;
  zone: string;
  client: Client;
  suiviPar: string;

  // Dates au format AAAA-MM-JJ. Tant qu'elles ne sont pas connues, la durée
  // (jours / nuits) se saisit à la main et la période s'écrit en clair.
  depart: string;
  retour: string;
  jours: number;
  nuits: number;
  // Nombre de nuits saisi à la main alors que les dates sont connues (nuits à
  // bord de l'autocar, par exemple). null : déduit des dates.
  nuitsForcees: number | null;
  periode: string;

  eleves: number;
  accompagnateurs: number;
  conducteurs: number;

  programme: Jour[];
  prestations: Prestation[];
  tarif: Tarif;
  textes: Textes;

  feuilleRoute: FeuilleRoute;
  participants: Participant[];
  chambres: Chambre[];

  versions: VersionDevis[];

  // Traçabilité de l'origine du dossier.
  sejourCatalogueId: string | null;
  devisExpressId: string | null;
};

export type Prestataire = {
  id: string;
  nom: string;
  type: string;
  adresse: string;
  code_postal: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  contact: string;
  notes: string;
};

// Ligne de la table dossiers_voyage : colonnes d'index + document complet.
export type DossierRow = {
  id: string;
  reference: string;
  statut: Statut;
  etablissement: string | null;
  ville: string | null;
  destination: string | null;
  date_depart: string | null;
  date_retour: string | null;
  eleves: number | null;
  accompagnateurs: number | null;
  prix_par_payant: number | null;
  total_vente: number | null;
  total_revient: number | null;
  reservations_confirmees: number | null;
  reservations_total: number | null;
  data: Dossier;
  created_at: string;
  updated_at: string;
};
