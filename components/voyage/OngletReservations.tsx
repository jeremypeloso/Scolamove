"use client";

import { useState } from "react";
import { majPrestation } from "@/lib/voyage/actions";
import { avancementReservations, CATEGORIES, euros } from "@/lib/voyage/calcul";
import { STATUTS_RESERVATION } from "@/lib/voyage/defaults";
import { enregistrerPrestataire, supprimerPrestataire } from "@/lib/voyage/store";
import type { Prestataire, Prestation, StatutReservation } from "@/lib/voyage/types";
import { Bloc, Champ, Nombre, Texte, Zone } from "./champs";
import type { PropsOnglet } from "./props";

const VIDE: Omit<Prestataire, "id"> & { id?: string } = {
  nom: "",
  type: "",
  adresse: "",
  code_postal: "",
  ville: "",
  pays: "",
  telephone: "",
  email: "",
  contact: "",
  notes: "",
};

const TYPES = ["Hôtel", "Auberge de jeunesse", "Restaurant", "Musée ou site", "Guide", "Autocariste", "Compagnie maritime", "Assurance"];

export function OngletReservations({ d, maj, calcul, prestataires, rechargerPrestataires }: PropsOnglet) {
  const [fiche, setFiche] = useState<(Omit<Prestataire, "id"> & { id?: string }) | null>(null);
  // Ligne de réservation à rattacher au prestataire en cours de création.
  const [pourLigne, setPourLigne] = useState<string | null>(null);
  const [erreur, setErreur] = useState("");

  const suivies = d.prestations.filter((p) => p.mode !== "pourcent");
  const avancement = avancementReservations(d);
  const ligne = (id: string, patch: Partial<Prestation>) => maj((x) => majPrestation(x, id, patch));
  const cout = suivies.filter((p) => !p.enOption).reduce((s, p) => s + (calcul.lignes[p.id]?.revient || 0), 0);
  const acomptes = suivies.reduce((s, p) => s + (p.acompte || 0), 0);
  const utilises = new Set(d.prestations.map((p) => p.prestataireId).filter(Boolean));

  async function enregistrer() {
    if (!fiche || !fiche.nom.trim()) return;
    setErreur("");
    try {
      const cree = await enregistrerPrestataire(fiche);
      await rechargerPrestataires();
      if (pourLigne) ligne(pourLigne, { prestataireId: cree.id });
      setFiche(null);
      setPourLigne(null);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Enregistrement impossible");
    }
  }

  async function supprimer(p: Prestataire) {
    if (!window.confirm(`Retirer ${p.nom} de l'annuaire ? Il disparaîtra de tous les dossiers.`)) return;
    try {
      await supprimerPrestataire(p.id);
      await rechargerPrestataires();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Suppression impossible");
    }
  }

  return (
    <>
      <Bloc
        titre="Suivi des réservations"
        note="Chaque ligne de la cotation se réserve ici. Prestataires et numéros de réservation alimentent la feuille de route."
        actions={
          <span className="vg-avancement">
            <span className="vg-jauge">
              <span style={{ width: `${avancement.total ? (avancement.confirmees / avancement.total) * 100 : 0}%` }} />
            </span>
            {avancement.confirmees} sur {avancement.total} confirmée{avancement.confirmees > 1 ? "s" : ""}
          </span>
        }
      >
        {suivies.length === 0 ? (
          <div className="vg-vide">
            <p>Les prestations apparaissent ici dès qu&apos;elles sont chiffrées dans la cotation.</p>
          </div>
        ) : (
          <div className="vg-resa">
            <div className="vg-resa-tete">
              <span>Prestation</span>
              <span>Prestataire</span>
              <span>Statut</span>
              <span>N° de réservation</span>
              <span>Échéance</span>
              <span>Acompte versé</span>
              <span className="vg-droite">Coût</span>
            </div>
            {CATEGORIES.map((categorie) =>
              suivies
                .filter((p) => p.categorie === categorie.cle)
                .map((p) => {
                  const jour = d.programme.findIndex((j) => j.id === p.jourId);
                  return (
                    <div key={p.id} className={`vg-resa-ligne vg-statut-${p.statut}`}>
                      <span className="vg-resa-nom">
                        <strong>{p.libelle || "Prestation sans libellé"}</strong>
                        <small>
                          {categorie.court}
                          {jour >= 0 ? `, jour ${jour + 1}` : ""}
                          {p.enOption ? ", en option" : ""}
                        </small>
                      </span>
                      <select
                        className="vg-input"
                        value={p.prestataireId || ""}
                        aria-label="Prestataire"
                        onChange={(e) => {
                          if (e.target.value === "__nouveau") {
                            setPourLigne(p.id);
                            setFiche({ ...VIDE });
                          } else ligne(p.id, { prestataireId: e.target.value || null });
                        }}
                      >
                        <option value="">À choisir</option>
                        {prestataires.map((x) => (
                          <option key={x.id} value={x.id}>
                            {x.nom}
                            {x.ville ? `, ${x.ville}` : ""}
                          </option>
                        ))}
                        <option value="__nouveau">Nouveau prestataire…</option>
                      </select>
                      <select className="vg-input vg-statut" value={p.statut} aria-label="Statut" onChange={(e) => ligne(p.id, { statut: e.target.value as StatutReservation })}>
                        {STATUTS_RESERVATION.map((s) => (
                          <option key={s.cle} value={s.cle}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <Texte value={p.refReservation} placeholder="Référence" onChange={(refReservation) => ligne(p.id, { refReservation })} />
                      <Texte type="date" value={p.echeance} titre="Date limite d'option ou de paiement" onChange={(echeance) => ligne(p.id, { echeance })} />
                      <Nombre value={p.acompte} titre="Acompte versé" suffixe="€" onChange={(acompte) => ligne(p.id, { acompte })} />
                      <span className="vg-droite vg-chiffre">{euros(calcul.lignes[p.id]?.revient || 0)}</span>
                    </div>
                  );
                })
            )}
            <div className="vg-resa-total">
              <span>
                Engagé <strong>{euros(cout)}</strong>
              </span>
              <span>
                Acomptes versés <strong>{euros(acomptes)}</strong>
              </span>
              <span>
                Reste à régler <strong>{euros(cout - acomptes)}</strong>
              </span>
            </div>
          </div>
        )}
      </Bloc>

      <Bloc
        titre="Annuaire des prestataires"
        note="Partagé entre tous les dossiers : un hôtel saisi une fois se retrouve au voyage suivant."
        actions={
          <button type="button" className="vg-btn" onClick={() => { setPourLigne(null); setFiche({ ...VIDE }); }}>
            Nouveau prestataire
          </button>
        }
      >
        {erreur ? <p className="vg-message vg-erreur">{erreur}</p> : null}

        {fiche ? (
          <div className="vg-fiche">
            <div className="vg-grille">
              <Champ label="Nom" large>
                <Texte value={fiche.nom} onChange={(nom) => setFiche({ ...fiche, nom })} />
              </Champ>
              <Champ label="Type">
                <Texte value={fiche.type} liste="vg-types-prestataire" onChange={(type) => setFiche({ ...fiche, type })} />
              </Champ>
              <Champ label="Contact sur place">
                <Texte value={fiche.contact} onChange={(contact) => setFiche({ ...fiche, contact })} />
              </Champ>
              <Champ label="Adresse" large>
                <Texte value={fiche.adresse} onChange={(adresse) => setFiche({ ...fiche, adresse })} />
              </Champ>
              <Champ label="Code postal">
                <Texte value={fiche.code_postal} onChange={(code_postal) => setFiche({ ...fiche, code_postal })} />
              </Champ>
              <Champ label="Ville">
                <Texte value={fiche.ville} onChange={(ville) => setFiche({ ...fiche, ville })} />
              </Champ>
              <Champ label="Pays">
                <Texte value={fiche.pays} onChange={(pays) => setFiche({ ...fiche, pays })} />
              </Champ>
              <Champ label="Téléphone">
                <Texte type="tel" value={fiche.telephone} onChange={(telephone) => setFiche({ ...fiche, telephone })} />
              </Champ>
              <Champ label="Email" large>
                <Texte type="email" value={fiche.email} onChange={(email) => setFiche({ ...fiche, email })} />
              </Champ>
              <Champ label="Notes internes" large>
                <Zone value={fiche.notes} lignes={2} onChange={(notes) => setFiche({ ...fiche, notes })} />
              </Champ>
            </div>
            <datalist id="vg-types-prestataire">
              {TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            <div className="vg-actions vg-actions-bas">
              <button type="button" className="vg-btn vg-btn-plein" disabled={!fiche.nom.trim()} onClick={enregistrer}>
                Enregistrer le prestataire
              </button>
              <button type="button" className="vg-btn" onClick={() => { setFiche(null); setPourLigne(null); }}>
                Annuler
              </button>
            </div>
          </div>
        ) : null}

        {prestataires.length === 0 && !fiche ? (
          <div className="vg-vide">
            <p>L&apos;annuaire est vide. Ajoute l&apos;hôtel, les sites visités et les restaurants de ce voyage.</p>
          </div>
        ) : null}

        {prestataires.length > 0 ? (
          <table className="vg-table">
            <thead>
              <tr>
                <th>Prestataire</th>
                <th>Type</th>
                <th>Ville</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {prestataires.map((p) => (
                <tr key={p.id} className={utilises.has(p.id) ? "vg-utilise" : ""}>
                  <td>
                    <strong>{p.nom}</strong>
                    {utilises.has(p.id) ? <span className="vg-pastille">Ce dossier</span> : null}
                  </td>
                  <td>{p.type}</td>
                  <td>{[p.ville, p.pays].filter(Boolean).join(", ")}</td>
                  <td>{p.telephone}</td>
                  <td>{p.email}</td>
                  <td className="vg-droite">
                    <button type="button" className="vg-lien" onClick={() => { setPourLigne(null); setFiche({ ...p }); }}>
                      Modifier
                    </button>
                    <button type="button" className="vg-lien vg-danger" onClick={() => supprimer(p)}>
                      Retirer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Bloc>
    </>
  );
}
