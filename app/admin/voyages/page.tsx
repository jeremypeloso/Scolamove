"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { euros, prixClient } from "@/lib/voyage/calcul";
import { genRef, nouveauDossier, STATUTS } from "@/lib/voyage/defaults";
import { convertirDevisExpress, type DevisExpressRow } from "@/lib/voyage/legacy";
import { formatDateCourte } from "@/lib/voyage/programme";
import { creerDossier, lireDossier, listerDossiers, supprimerDossier, type DossierResume } from "@/lib/voyage/store";
import type { Statut } from "@/lib/voyage/types";

export default function PageVoyages() {
  const router = useRouter();
  const [dossiers, setDossiers] = useState<DossierResume[]>([]);
  const [charge, setCharge] = useState(false);
  const [erreur, setErreur] = useState("");
  const [filtre, setFiltre] = useState<Statut | "tous">("tous");
  const [recherche, setRecherche] = useState("");
  const [anciens, setAnciens] = useState<DevisExpressRow[] | null>(null);
  const [occupe, setOccupe] = useState(false);

  const [rechargement, setRechargement] = useState(0);

  useEffect(() => {
    let actif = true;
    listerDossiers()
      .then((liste) => {
        if (!actif) return;
        setDossiers(liste);
        setErreur("");
      })
      .catch((e) => {
        if (!actif) return;
        const message = e instanceof Error ? e.message : "";
        setErreur(
          /dossiers_voyage|schema cache|does not exist/i.test(message)
            ? "La table des dossiers n'existe pas encore. Exécute le fichier supabase/migrations/20261002_dossiers_voyage.sql dans Supabase (SQL Editor), puis recharge cette page."
            : `Chargement impossible : ${message}`
        );
      })
      .finally(() => {
        if (actif) setCharge(true);
      });
    return () => {
      actif = false;
    };
  }, [rechargement]);

  const visibles = useMemo(() => {
    const mots = recherche.trim().toLowerCase();
    return dossiers.filter((x) => {
      if (filtre !== "tous" && x.statut !== filtre) return false;
      if (!mots) return true;
      return [x.reference, x.etablissement, x.ville, x.destination].some((v) => (v || "").toLowerCase().includes(mots));
    });
  }, [dossiers, filtre, recherche]);

  async function agir(action: () => Promise<void>) {
    setOccupe(true);
    try {
      await action();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Opération impossible");
    }
    setOccupe(false);
  }

  const creer = () =>
    agir(async () => {
      router.push(`/admin/voyages/${await creerDossier(nouveauDossier())}`);
    });

  const ouvrirAnciens = () =>
    agir(async () => {
      const { data, error } = await supabase
        .from("devis_express")
        .select("id, reference, etablissement, ville, zone, prix_ferme, pax, created_at, data")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      const repris = new Set(dossiers.map((x) => x.reference));
      setAnciens(((data || []) as DevisExpressRow[]).filter((row) => !repris.has(row.reference)));
    });

  const reprendre = (row: DevisExpressRow) =>
    agir(async () => {
      router.push(`/admin/voyages/${await creerDossier(convertirDevisExpress(row))}`);
    });

  const dupliquer = (id: string) =>
    agir(async () => {
      const { dossier } = await lireDossier(id);
      const copie = {
        ...dossier,
        reference: genRef(),
        statut: "brouillon" as const,
        versions: [],
        participants: [],
        chambres: [],
        tarif: { ...dossier.tarif, prixFige: null },
        prestations: dossier.prestations.map((p) => ({ ...p, statut: "a_reserver" as const, refReservation: "", echeance: "", acompte: 0 })),
      };
      router.push(`/admin/voyages/${await creerDossier(copie)}`);
    });

  const supprimer = (x: DossierResume) =>
    agir(async () => {
      if (!window.confirm(`Supprimer définitivement le dossier ${x.reference} ?`)) return;
      await supprimerDossier(x.id);
      setRechargement((n) => n + 1);
    });

  return (
    <>
      <div className="vg-barre">
        <Link className="vg-retour" href="/admin">
          Tableau de bord
        </Link>
        <div className="vg-barre-titre">
          <strong>Devis et dossiers de voyage</strong>
          <span>Du premier devis à la feuille de route</span>
        </div>
        <button type="button" className="vg-btn" disabled={occupe} onClick={ouvrirAnciens}>
          Reprendre un devis express
        </button>
        <button type="button" className="vg-btn vg-btn-plein" disabled={occupe} onClick={creer}>
          Nouveau dossier
        </button>
      </div>

      <div className="vg-page">
        {erreur ? <p className="vg-message vg-erreur">{erreur}</p> : null}

        {anciens ? (
          <section className="vg-bloc">
            <div className="vg-bloc-tete">
              <div>
                <h2>Devis express à reprendre</h2>
                <p className="vg-note">Le dossier créé garde la référence et le prix du devis. Le devis d&apos;origine n&apos;est pas modifié.</p>
              </div>
              <button type="button" className="vg-btn" onClick={() => setAnciens(null)}>
                Fermer
              </button>
            </div>
            {anciens.length === 0 ? (
              <p className="vg-note">Tous les devis express ont déjà leur dossier.</p>
            ) : (
              <table className="vg-table">
                <tbody>
                  {anciens.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.reference}</strong>
                      </td>
                      <td>{[row.etablissement, row.ville].filter(Boolean).join(", ")}</td>
                      <td>{row.zone}</td>
                      <td className="vg-droite">{row.prix_ferme ? `${euros(Number(row.prix_ferme))} / pers.` : ""}</td>
                      <td>{new Date(row.created_at).toLocaleDateString("fr-FR")}</td>
                      <td className="vg-droite">
                        <button type="button" className="vg-btn vg-btn-mini" disabled={occupe} onClick={() => reprendre(row)}>
                          Créer le dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ) : null}

        <section className="vg-bloc">
          <div className="vg-filtres">
            <button type="button" className={filtre === "tous" ? "vg-filtre vg-actif" : "vg-filtre"} onClick={() => setFiltre("tous")}>
              Tous <span>{dossiers.length}</span>
            </button>
            {STATUTS.map((s) => (
              <button key={s.cle} type="button" className={filtre === s.cle ? "vg-filtre vg-actif" : "vg-filtre"} onClick={() => setFiltre(s.cle)}>
                {s.label} <span>{dossiers.filter((x) => x.statut === s.cle).length}</span>
              </button>
            ))}
            <input className="vg-input vg-recherche" type="search" placeholder="Référence, établissement, destination" aria-label="Rechercher un dossier" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </div>

          {!charge ? <p className="vg-note">Chargement…</p> : null}

          {charge && dossiers.length === 0 && !erreur ? (
            <div className="vg-vide">
              <p>Aucun dossier pour l&apos;instant. Crée le premier, ou reprends un devis express existant.</p>
              <button type="button" className="vg-btn vg-btn-plein" disabled={occupe} onClick={creer}>
                Nouveau dossier
              </button>
            </div>
          ) : null}

          {visibles.length > 0 ? (
            <table className="vg-table vg-liste">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Établissement</th>
                  <th>Voyage</th>
                  <th className="vg-droite">Effectif</th>
                  <th className="vg-droite">Prix / pers.</th>
                  <th className="vg-droite">Vente</th>
                  <th className="vg-droite">Marge</th>
                  <th>Réservations</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visibles.map((x) => {
                  const marge = (x.total_vente || 0) - (x.total_revient || 0);
                  return (
                    <tr key={x.id}>
                      <td>
                        <Link className="vg-ref" href={`/admin/voyages/${x.id}`}>
                          {x.reference}
                        </Link>
                      </td>
                      <td>
                        <strong>{x.etablissement || "Établissement à renseigner"}</strong>
                        <small>{x.ville}</small>
                      </td>
                      <td>
                        {x.destination || "Destination à renseigner"}
                        <small>
                          {x.date_depart && x.date_retour ? `${formatDateCourte(x.date_depart)} au ${formatDateCourte(x.date_retour)}` : "Dates à fixer"}
                        </small>
                      </td>
                      <td className="vg-droite">
                        {x.eleves || 0} + {x.accompagnateurs || 0}
                      </td>
                      <td className="vg-droite vg-fort">{x.prix_par_payant ? prixClient(Number(x.prix_par_payant)) : ""}</td>
                      <td className="vg-droite">{x.total_vente ? euros(Number(x.total_vente), 0) : ""}</td>
                      <td className={marge < 0 ? "vg-droite vg-negatif" : "vg-droite"}>{x.total_vente ? euros(marge, 0) : ""}</td>
                      <td>
                        {x.reservations_total ? `${x.reservations_confirmees || 0} / ${x.reservations_total}` : ""}
                      </td>
                      <td>
                        <span className={`vg-etiquette vg-statut-${x.statut}`}>{STATUTS.find((s) => s.cle === x.statut)?.label || x.statut}</span>
                      </td>
                      <td className="vg-droite">
                        <button type="button" className="vg-lien" disabled={occupe} onClick={() => dupliquer(x.id)}>
                          Dupliquer
                        </button>
                        <button type="button" className="vg-lien vg-danger" disabled={occupe} onClick={() => supprimer(x)}>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : null}

          {charge && dossiers.length > 0 && visibles.length === 0 ? <p className="vg-note">Aucun dossier ne correspond à ce filtre.</p> : null}
        </section>
      </div>
    </>
  );
}
