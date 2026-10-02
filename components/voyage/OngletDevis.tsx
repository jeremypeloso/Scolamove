"use client";

import Link from "next/link";
import { useState } from "react";
import { AGENCE } from "@/lib/voyage/agence";
import { figerVersion } from "@/lib/voyage/actions";
import { libellePayant, prixClient } from "@/lib/voyage/calcul";
import { controlerDevis } from "@/lib/voyage/controle";
import { genererInclusions, normaliser } from "@/lib/voyage/defaults";
import { effectifTexte, periodeTexte } from "@/lib/voyage/programme";
import { publierDansEspaceEnseignant } from "@/lib/voyage/publication";
import type { Tarif, Textes } from "@/lib/voyage/types";
import { Apercu, telecharger } from "./Apercu";
import { Bloc, Champ, Nombre, Zone } from "./champs";
import { Controle } from "./Controle";
import type { PropsOnglet } from "./props";

export function OngletDevis({ d, maj, calcul, allerA }: PropsOnglet) {
  const [apercu, setApercu] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [occupe, setOccupe] = useState(false);
  const points = controlerDevis(d);
  const textes = (patch: Partial<Textes>) => maj((x) => ({ ...x, textes: { ...x.textes, ...patch } }));
  const tarif = (patch: Partial<Tarif>) => maj((x) => ({ ...x, tarif: { ...x.tarif, ...patch } }));
  const qui = libellePayant(d);

  async function blob() {
    const { devisBlob } = await import("@/lib/voyage/pdf/generer");
    return devisBlob(d);
  }

  async function agir(action: () => Promise<string>) {
    setOccupe(true);
    setMessage("");
    try {
      setMessage(await action());
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Opération impossible");
    }
    setOccupe(false);
  }

  function regenerer() {
    if ((d.textes.comprend.trim() || d.textes.neComprendPas.trim()) && !window.confirm("Remplacer les deux textes par ceux déduits de la cotation ?")) return;
    textes(genererInclusions(d));
  }

  // Message d'accompagnement, sans tirets, prêt à coller dans la messagerie.
  async function copierMessage() {
    const lignes = [
      `Objet : Devis voyage scolaire ${d.destination || d.titre} (référence ${d.reference})`,
      "",
      `Bonjour${d.client.enseignant ? ` ${d.client.enseignant}` : ""},`,
      "",
      "Vous trouverez ci-joint notre devis pour votre projet de voyage scolaire.",
      "",
      `Destination : ${d.destination || d.titre}`,
      `Période : ${periodeTexte(d)}`,
      `Effectif : ${effectifTexte(d)}`,
      `Prix : ${prixClient(calcul.prixParPayant)} ${qui}, soit ${prixClient(calcul.totalVente)} pour le groupe`,
      "",
      "Le devis détaille le programme, ce que le prix comprend et les conditions de réservation.",
      d.client.email.trim()
        ? `Vous pouvez aussi le retrouver dans votre espace enseignant avec le code ${d.reference} : https://www.scolamove.fr/espace-enseignant`
        : "",
      "",
      "Je reste à votre disposition pour ajuster le programme ou le budget.",
      "",
      "Bien cordialement,",
      `${d.suiviPar || AGENCE.signataire}, ${AGENCE.nom}`,
    ];
    await navigator.clipboard.writeText(lignes.filter((l, i) => l !== "" || lignes[i - 1] !== "").join("\n"));
    return "Message copié.";
  }

  return (
    <>
      <Bloc titre="Avant l'envoi">
        <Controle points={points} allerA={allerA} vide="Le devis est complet." />
        <div className="vg-actions vg-actions-bas">
          <button type="button" className="vg-btn vg-btn-plein" disabled={occupe} onClick={() => agir(async () => { setApercu(URL.createObjectURL(await blob())); return ""; })}>
            Aperçu du devis
          </button>
          <button type="button" className="vg-btn" disabled={occupe} onClick={() => agir(async () => { telecharger(await blob(), `devis-${d.reference}.pdf`); return "Devis téléchargé."; })}>
            Télécharger le PDF
          </button>
          <button type="button" className="vg-btn" disabled={occupe} onClick={() => agir(copierMessage)}>
            Copier le message d&apos;accompagnement
          </button>
          <button type="button" className="vg-btn" disabled={occupe} onClick={() => agir(async () => { await publierDansEspaceEnseignant(d, calcul, "devis", await blob()); return "Devis publié dans l'espace enseignant."; })}>
            Publier dans l&apos;espace enseignant
          </button>
          <button
            type="button"
            className="vg-btn"
            disabled={occupe}
            title="Garde une copie de ce devis tel qu'il part chez le client"
            onClick={() => {
              const note = window.prompt("Note pour cette version (facultatif)", "") ?? null;
              if (note === null) return;
              maj((x) => figerVersion(x, calcul, note));
              setMessage(`Version ${d.versions.length + 1} enregistrée, dossier marqué comme envoyé.`);
            }}
          >
            Marquer comme envoyé
          </button>
        </div>
        {message ? <p className="vg-message">{message}</p> : null}
      </Bloc>

      <Bloc titre="Présentation du prix">
        <div className="vg-grille vg-grille-6">
          <Champ label="Validité du devis">
            <Nombre value={d.tarif.validiteJours} onChange={(validiteJours) => tarif({ validiteJours })} suffixe="jours" />
          </Champ>
          <Champ label="Acompte à la confirmation">
            <Nombre value={d.tarif.acomptePct} onChange={(acomptePct) => tarif({ acomptePct })} suffixe="%" />
          </Champ>
          <div className="vg-champ vg-champ-large">
            <span className="vg-label">Détail affiché</span>
            <label className="vg-coche">
              <input type="checkbox" checked={d.tarif.afficherPostes} onChange={(e) => tarif({ afficherPostes: e.target.checked })} />
              Montrer la répartition du prix par poste (transport, hébergement…)
            </label>
            <span className="vg-aide">Le client ne voit jamais les prix d&apos;achat ni les marges.</span>
          </div>
          <div className="vg-champ vg-champ-large">
            <span className="vg-label">Conditions de vente</span>
            <label className="vg-coche">
              <input type="checkbox" checked={d.tarif.joindreCgv} onChange={(e) => tarif({ joindreCgv: e.target.checked })} />
              Joindre les conditions de vente à la suite du devis
            </label>
            <span className="vg-aide">
              Le même texte pour tous les dossiers.{" "}
              <Link className="vg-lien" href="/admin/voyages/cgv">
                Modifier les conditions
              </Link>
            </span>
          </div>
        </div>
      </Bloc>

      <Bloc
        titre="Textes du devis"
        actions={
          <button type="button" className="vg-btn" onClick={regenerer}>
            Rédiger d&apos;après la cotation
          </button>
        }
      >
        <div className="vg-grille">
          <Champ label="Mot d'introduction" large>
            <Zone value={d.textes.intro} lignes={2} onChange={(intro) => textes({ intro })} />
          </Champ>
          <Champ label="Conditions particulières" large aide="Validité, base de calcul et acompte sont ajoutés automatiquement.">
            <Zone value={d.textes.conditions} lignes={2} onChange={(conditions) => textes({ conditions })} />
          </Champ>
          <Champ label="Le prix comprend" large aide="Une ligne par élément.">
            <Zone value={d.textes.comprend} lignes={9} onChange={(comprend) => textes({ comprend })} />
          </Champ>
          <Champ label="Le prix ne comprend pas" large aide="Une ligne par élément.">
            <Zone value={d.textes.neComprendPas} lignes={9} onChange={(neComprendPas) => textes({ neComprendPas })} />
          </Champ>
        </div>
      </Bloc>

      {d.versions.length > 0 ? (
        <Bloc titre="Versions envoyées">
          <table className="vg-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Envoyée le</th>
                <th className="vg-droite">Prix</th>
                <th className="vg-droite">Total groupe</th>
                <th>Note</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {[...d.versions].reverse().map((v) => (
                <tr key={v.numero}>
                  <td>V{v.numero}</td>
                  <td>{new Date(v.date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="vg-droite">{prixClient(v.prixParPayant)}</td>
                  <td className="vg-droite">{prixClient(v.totalVente)}</td>
                  <td>{v.note}</td>
                  <td className="vg-droite">
                    <button
                      type="button"
                      className="vg-lien"
                      onClick={() => {
                        if (!window.confirm(`Revenir à la version ${v.numero} ? L'état actuel du dossier sera remplacé.`)) return;
                        maj((x) => ({ ...normaliser(v.instantane), versions: x.versions, statut: x.statut }));
                      }}
                    >
                      Restaurer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Bloc>
      ) : null}

      {apercu ? <Apercu url={apercu} titre="Devis" fermer={() => setApercu(null)} /> : null}
    </>
  );
}
