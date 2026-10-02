import { supabase } from "@/lib/supabase";
import { avancementReservations, calculer } from "./calcul";
import { normaliser } from "./defaults";
import type { Dossier, DossierRow, Prestataire } from "./types";

const TABLE = "dossiers_voyage";

// Colonnes d'index recopiées depuis le document : elles alimentent la liste des
// dossiers sans avoir à ouvrir chaque document.
function colonnes(d: Dossier) {
  const calcul = calculer(d);
  const reservations = avancementReservations(d);
  return {
    reference: d.reference,
    statut: d.statut,
    etablissement: d.client.etablissement || null,
    ville: d.client.ville || null,
    destination: d.destination || d.titre || null,
    date_depart: d.depart || null,
    date_retour: d.retour || null,
    eleves: d.eleves,
    accompagnateurs: d.accompagnateurs,
    prix_par_payant: calcul.prixParPayant,
    total_vente: calcul.totalVente,
    total_revient: calcul.revient,
    reservations_confirmees: reservations.confirmees,
    reservations_total: reservations.total,
    data: d,
    updated_at: new Date().toISOString(),
  };
}

const COLONNES_LISTE =
  "id, reference, statut, etablissement, ville, destination, date_depart, date_retour, eleves, accompagnateurs, prix_par_payant, total_vente, total_revient, reservations_confirmees, reservations_total, created_at, updated_at";

export type DossierResume = Omit<DossierRow, "data">;

export async function listerDossiers(): Promise<DossierResume[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLONNES_LISTE)
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data || []) as DossierResume[];
}

export async function lireDossier(id: string): Promise<{ id: string; dossier: Dossier; updatedAt: string }> {
  const { data, error } = await supabase.from(TABLE).select("id, data, updated_at").eq("id", id).single();
  if (error || !data) throw new Error(error?.message || "Dossier introuvable");
  return { id: data.id, dossier: normaliser(data.data as Dossier), updatedAt: data.updated_at };
}

export async function creerDossier(d: Dossier): Promise<string> {
  const { data, error } = await supabase.from(TABLE).insert(colonnes(d)).select("id").single();
  if (error || !data) throw new Error(error?.message || "Création impossible");
  return data.id as string;
}

export async function enregistrerDossier(id: string, d: Dossier): Promise<void> {
  const { error } = await supabase.from(TABLE).update(colonnes(d)).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function supprimerDossier(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Annuaire des prestataires -------------------------------------------------

export async function listerPrestataires(): Promise<Prestataire[]> {
  const { data, error } = await supabase.from("prestataires").select("*").order("nom", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map((p) => ({
    id: p.id,
    nom: p.nom || "",
    type: p.type || "",
    adresse: p.adresse || "",
    code_postal: p.code_postal || "",
    ville: p.ville || "",
    pays: p.pays || "",
    telephone: p.telephone || "",
    email: p.email || "",
    contact: p.contact || "",
    notes: p.notes || "",
  }));
}

export async function enregistrerPrestataire(p: Omit<Prestataire, "id"> & { id?: string }): Promise<Prestataire> {
  const { id, ...champs } = p;
  const requete = id
    ? supabase.from("prestataires").update(champs).eq("id", id).select("*").single()
    : supabase.from("prestataires").insert(champs).select("*").single();
  const { data, error } = await requete;
  if (error || !data) throw new Error(error?.message || "Enregistrement impossible");
  return data as Prestataire;
}

export async function supprimerPrestataire(id: string): Promise<void> {
  const { error } = await supabase.from("prestataires").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
