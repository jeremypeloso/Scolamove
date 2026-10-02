import { supabase } from "@/lib/supabase";
import { prixClient, type Calcul } from "./calcul";
import type { Dossier } from "./types";

// Dépose un document du dossier dans l'espace enseignant. Le projet enseignant
// est créé ou mis à jour au passage : son code d'accès est la référence du dossier.
export async function publierDansEspaceEnseignant(
  d: Dossier,
  calcul: Calcul,
  type: "devis" | "feuille",
  blob: Blob
): Promise<void> {
  if (!d.client.email.trim()) {
    throw new Error("Renseigne l'email de l'enseignant (étape Dossier) pour ouvrir son espace.");
  }

  const { data: projet, error } = await supabase
    .from("teacher_projects")
    .upsert(
      {
        access_code: d.reference,
        sejour_title: d.titre || d.destination || "Voyage scolaire",
        school_name: d.client.etablissement || "Établissement non renseigné",
        school_city: d.client.ville || null,
        teacher_name: d.client.enseignant || "Non renseigné",
        teacher_email: d.client.email.trim(),
        teacher_phone: d.client.telephone || null,
        level: d.client.classe || null,
        start_date: d.depart || null,
        end_date: d.retour || null,
        student_target: d.eleves || null,
        budget_target: `${prixClient(calcul.prixParPayant)} / pers`,
        status: d.statut === "accepte" || d.statut === "termine" ? "Projet confirmé" : "En attente validation établissement",
        notes: d.suiviPar ? `Dossier suivi par ${d.suiviPar} (Scolamove).` : null,
      },
      { onConflict: "access_code" }
    )
    .select("id")
    .single();
  if (error || !projet) throw new Error(error?.message || "Projet enseignant introuvable");

  const titre = type === "devis" ? "Devis" : "Feuille de route";
  const chemin = `${d.reference}/${type === "devis" ? "devis" : "feuille-de-route"}.pdf`;
  const depot = await supabase.storage
    .from("project-documents")
    .upload(chemin, blob, { upsert: true, contentType: "application/pdf" });
  if (depot.error) throw new Error(depot.error.message);

  const { data: url } = supabase.storage.from("project-documents").getPublicUrl(chemin);
  await supabase.from("project_documents").delete().eq("project_id", projet.id).eq("title", titre);
  const insertion = await supabase.from("project_documents").insert({
    project_id: projet.id,
    title: titre,
    category: type === "devis" ? "Devis" : "Document",
    // Le paramètre de version évite qu'un navigateur resserve l'ancien PDF.
    file_url: `${url.publicUrl}?v=${Date.now()}`,
  });
  if (insertion.error) throw new Error(insertion.error.message);
}

// Participants saisis par l'enseignant dans son espace, pour la liste des chambres.
export async function lireParticipantsEnseignant(
  reference: string
): Promise<{ nom: string; prenom: string; classe: string }[]> {
  const { data: projet } = await supabase.from("teacher_projects").select("id").eq("access_code", reference).maybeSingle();
  if (!projet) return [];
  const { data, error } = await supabase
    .from("project_participants")
    .select("first_name, last_name, class_name")
    .eq("project_id", projet.id)
    .order("last_name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map((p) => ({ nom: p.last_name || "", prenom: p.first_name || "", classe: p.class_name || "" }));
}
