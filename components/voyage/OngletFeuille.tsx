"use client";

import { useState } from "react";
import { controlerFeuilleRoute } from "@/lib/voyage/controle";
import { FLOTTE_FESTIMOVE, uid } from "@/lib/voyage/defaults";
import { lireParticipantsEnseignant, publierDansEspaceEnseignant } from "@/lib/voyage/publication";
import type { Chambre, FeuilleRoute, Participant } from "@/lib/voyage/types";
import { Apercu, telecharger } from "./Apercu";
import { Bloc, Champ, Nombre, Texte, Zone } from "./champs";
import { Controle } from "./Controle";
import type { PropsOnglet } from "./props";

// Lit une liste collée : une personne par ligne, « NOM Prénom » ou des colonnes
// séparées par tabulation ou point-virgule (nom, prénom, classe).
function lireListe(texte: string, role: Participant["role"]): Participant[] {
  return texte
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      let nom = "";
      let prenom = "";
      let classe = "";
      if (/[\t;]/.test(l)) {
        [nom = "", prenom = "", classe = ""] = l.split(/[\t;]/).map((x) => x.trim());
      } else {
        const mots = l.split(/\s+/);
        const majuscules = mots.filter((m) => m.length > 1 && m === m.toUpperCase());
        if (majuscules.length > 0 && majuscules.length < mots.length) {
          nom = majuscules.join(" ");
          prenom = mots.filter((m) => !majuscules.includes(m)).join(" ");
        } else {
          nom = mots[0];
          prenom = mots.slice(1).join(" ");
        }
      }
      return { id: uid(), nom, prenom, role, classe, chambreId: null, remarque: "" };
    });
}

export function OngletFeuille({ d, maj, calcul, prestataires, allerA }: PropsOnglet) {
  const [apercu, setApercu] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [liste, setListe] = useState("");
  const [roleListe, setRoleListe] = useState<Participant["role"]>("eleve");
  const [lot, setLot] = useState({ nombre: 0, capacite: 4 });

  const f = d.feuilleRoute;
  const points = controlerFeuilleRoute(d, prestataires);
  const feuille = (patch: Partial<FeuilleRoute>) => maj((x) => ({ ...x, feuilleRoute: { ...x.feuilleRoute, ...patch } }));
  const participant = (id: string, patch: Partial<Participant>) =>
    maj((x) => ({ ...x, participants: x.participants.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  const chambre = (id: string, patch: Partial<Chambre>) =>
    maj((x) => ({ ...x, chambres: x.chambres.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const occupants = (id: string) => d.participants.filter((p) => p.chambreId === id).length;

  async function blob() {
    const { feuilleRouteBlob } = await import("@/lib/voyage/pdf/generer");
    return feuilleRouteBlob(d, prestataires);
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

  async function importerEnseignant() {
    const trouves = await lireParticipantsEnseignant(d.reference);
    if (trouves.length === 0) return "Aucun élève saisi dans l'espace enseignant pour ce dossier.";
    const connus = new Set(d.participants.map((p) => `${p.nom} ${p.prenom}`.toLowerCase()));
    const nouveaux = trouves.filter((p) => !connus.has(`${p.nom} ${p.prenom}`.toLowerCase()));
    maj((x) => ({
      ...x,
      participants: [
        ...x.participants,
        ...nouveaux.map((p) => ({ id: uid(), ...p, role: "eleve" as const, chambreId: null, remarque: "" })),
      ],
    }));
    return `${nouveaux.length} élève${nouveaux.length > 1 ? "s" : ""} importé${nouveaux.length > 1 ? "s" : ""} depuis l'espace enseignant.`;
  }

  function ajouterListe() {
    const nouveaux = lireListe(liste, roleListe);
    if (nouveaux.length === 0) return;
    maj((x) => ({ ...x, participants: [...x.participants, ...nouveaux] }));
    setListe("");
  }

  function ajouterChambres() {
    if (lot.nombre <= 0) return;
    maj((x) => ({
      ...x,
      chambres: [
        ...x.chambres,
        ...Array.from({ length: lot.nombre }, (_, i) => ({
          id: uid(),
          nom: `Chambre ${x.chambres.length + i + 1}`,
          capacite: Math.max(lot.capacite, 1),
        })),
      ],
    }));
    setLot({ ...lot, nombre: 0 });
  }

  return (
    <>
      <Bloc titre="Avant de remettre la feuille de route" note="Programme, prestataires et réservations viennent des étapes précédentes. Il ne reste ici que le départ, l'autocar et les chambres.">
        <Controle points={points} allerA={allerA} vide="La feuille de route est complète." />
        <div className="vg-actions vg-actions-bas">
          <button type="button" className="vg-btn vg-btn-plein" disabled={occupe} onClick={() => agir(async () => { setApercu(URL.createObjectURL(await blob())); return ""; })}>
            Aperçu de la feuille de route
          </button>
          <button type="button" className="vg-btn" disabled={occupe} onClick={() => agir(async () => { telecharger(await blob(), `feuille-de-route-${d.reference}.pdf`); return "Feuille de route téléchargée."; })}>
            Télécharger le PDF
          </button>
          <button type="button" className="vg-btn" disabled={occupe} onClick={() => agir(async () => { await publierDansEspaceEnseignant(d, calcul, "feuille", await blob()); return "Feuille de route publiée dans l'espace enseignant."; })}>
            Publier dans l&apos;espace enseignant
          </button>
        </div>
        {message ? <p className="vg-message">{message}</p> : null}
      </Bloc>

      <Bloc titre="Départ et retour">
        <div className="vg-grille">
          <Champ label="Lieu de départ" large>
            <Texte value={f.departLieu} placeholder={d.client.etablissement || "Devant l'établissement"} onChange={(departLieu) => feuille({ departLieu })} />
          </Champ>
          <Champ label="Convocation">
            <Texte type="time" value={f.convocation} onChange={(convocation) => feuille({ convocation })} />
          </Champ>
          <Champ label="Départ de l'autocar">
            <Texte type="time" value={f.departHeure} onChange={(departHeure) => feuille({ departHeure })} />
          </Champ>
          <Champ label="Adresse du départ" large>
            <Texte value={f.departAdresse} onChange={(departAdresse) => feuille({ departAdresse })} />
          </Champ>
          <Champ label="Lieu de retour" aide="Vide : même lieu qu'au départ.">
            <Texte value={f.retourLieu} onChange={(retourLieu) => feuille({ retourLieu })} />
          </Champ>
          <Champ label="Arrivée prévue">
            <Texte value={f.retourHeure} placeholder="vers 12 h 00" onChange={(retourHeure) => feuille({ retourHeure })} />
          </Champ>
        </div>
      </Bloc>

      <Bloc titre="Autocar et permanence">
        <div className="vg-grille">
          <Champ label="Transporteur" large>
            <Texte value={f.transporteur} onChange={(transporteur) => feuille({ transporteur })} />
          </Champ>
          <Champ label="Véhicule">
            <Texte value={f.vehicule} liste="vg-flotte" placeholder="Autocar 63 places" onChange={(vehicule) => feuille({ vehicule })} />
          </Champ>
          <Champ label="Immatriculation">
            <Texte value={f.immatriculation} onChange={(immatriculation) => feuille({ immatriculation })} />
          </Champ>
        </div>
        <datalist id="vg-flotte">
          {FLOTTE_FESTIMOVE.map((places) => (
            <option key={places} value={`Autocar grand tourisme ${places} places`} />
          ))}
        </datalist>
        {f.conducteurs.map((c, i) => (
          <div key={i} className="vg-ligne vg-conducteur">
            <Texte value={c.nom} placeholder={`Conducteur ${i + 1}`} onChange={(nom) => feuille({ conducteurs: f.conducteurs.map((x, k) => (k === i ? { ...x, nom } : x)) })} />
            <Texte type="tel" value={c.telephone} placeholder="Téléphone" onChange={(telephone) => feuille({ conducteurs: f.conducteurs.map((x, k) => (k === i ? { ...x, telephone } : x)) })} />
            <button type="button" className="vg-icone vg-danger" title="Retirer ce conducteur" onClick={() => feuille({ conducteurs: f.conducteurs.filter((_, k) => k !== i) })}>
              ×
            </button>
          </div>
        ))}
        <button type="button" className="vg-btn vg-btn-mini" onClick={() => feuille({ conducteurs: [...f.conducteurs, { nom: "", telephone: "" }] })}>
          + Conducteur
        </button>
        <div className="vg-grille vg-grille-haut">
          <Champ label="Permanence pendant le voyage" large>
            <Texte value={f.urgenceNom} onChange={(urgenceNom) => feuille({ urgenceNom })} />
          </Champ>
          <Champ label="Numéro d'urgence" large aide="Imprimé en première page.">
            <Texte type="tel" value={f.urgenceTelephone} onChange={(urgenceTelephone) => feuille({ urgenceTelephone })} />
          </Champ>
        </div>
      </Bloc>

      <Bloc titre="Lettre, formalités et consignes">
        <div className="vg-grille">
          <Champ label="Lettre d'accompagnement" large>
            <Zone value={f.lettre} lignes={15} onChange={(lettre) => feuille({ lettre })} />
          </Champ>
          <div className="vg-champ vg-champ-large vg-pile">
            <Champ label="Formalités" aide="Une ligne par élément." large>
              <Zone value={f.formalites} lignes={6} onChange={(formalites) => feuille({ formalites })} />
            </Champ>
            <Champ label="Consignes pratiques" aide="Une ligne par élément." large>
              <Zone value={f.consignes} lignes={6} onChange={(consignes) => feuille({ consignes })} />
            </Champ>
          </div>
        </div>
      </Bloc>

      <Bloc
        titre="Participants et chambres"
        note={`${d.participants.length} saisi${d.participants.length > 1 ? "s" : ""} pour un effectif de ${d.eleves + d.accompagnateurs}.`}
        actions={
          <button type="button" className="vg-btn" disabled={occupe} onClick={() => agir(importerEnseignant)}>
            Importer depuis l&apos;espace enseignant
          </button>
        }
      >
        <div className="vg-grille">
          <div className="vg-champ vg-champ-large">
            <span className="vg-label">Coller une liste</span>
            <Zone value={liste} lignes={4} onChange={setListe} placeholder={"DUPONT Léa\nMARTIN Hugo\nou nom ; prénom ; classe"} />
            <span className="vg-ligne">
              <select className="vg-input vg-input-auto" value={roleListe} onChange={(e) => setRoleListe(e.target.value as Participant["role"])} aria-label="Rôle">
                <option value="eleve">Élèves</option>
                <option value="accompagnateur">Accompagnateurs</option>
              </select>
              <button type="button" className="vg-btn" disabled={!liste.trim()} onClick={ajouterListe}>
                Ajouter à la liste
              </button>
            </span>
          </div>
          <div className="vg-champ vg-champ-large">
            <span className="vg-label">Créer des chambres</span>
            <span className="vg-ligne">
              <Nombre value={lot.nombre} onChange={(nombre) => setLot({ ...lot, nombre: Math.round(nombre) })} suffixe="chambres" />
              <Nombre value={lot.capacite} onChange={(capacite) => setLot({ ...lot, capacite: Math.round(capacite) })} suffixe="lits" />
              <button type="button" className="vg-btn" disabled={lot.nombre <= 0} onClick={ajouterChambres}>
                Créer
              </button>
            </span>
            <span className="vg-aide">Renomme ensuite chaque chambre avec le numéro donné par l&apos;hébergement.</span>
          </div>
        </div>

        {d.chambres.length > 0 ? (
          <div className="vg-chambres">
            {d.chambres.map((c) => {
              const n = occupants(c.id);
              return (
                <div key={c.id} className={n > c.capacite ? "vg-chambre vg-chambre-pleine" : "vg-chambre"}>
                  <Texte value={c.nom} titre="Nom de la chambre" onChange={(nom) => chambre(c.id, { nom })} />
                  <span className="vg-chambre-pied">
                    <span>
                      {n} / <input className="vg-capacite" aria-label="Nombre de lits" inputMode="numeric" value={c.capacite} onChange={(e) => chambre(c.id, { capacite: Math.max(Number(e.target.value.replace(/\D/g, "")) || 1, 1) })} /> lits
                    </span>
                    <button
                      type="button"
                      className="vg-icone vg-danger"
                      title="Supprimer la chambre"
                      onClick={() =>
                        maj((x) => ({
                          ...x,
                          chambres: x.chambres.filter((y) => y.id !== c.id),
                          participants: x.participants.map((p) => (p.chambreId === c.id ? { ...p, chambreId: null } : p)),
                        }))
                      }
                    >
                      ×
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}

        {d.participants.length > 0 ? (
          <table className="vg-table vg-participants">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Rôle</th>
                <th>Classe</th>
                <th>Chambre</th>
                <th>Remarque</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {d.participants.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Texte value={p.nom} titre="Nom" onChange={(nom) => participant(p.id, { nom })} />
                  </td>
                  <td>
                    <Texte value={p.prenom} titre="Prénom" onChange={(prenom) => participant(p.id, { prenom })} />
                  </td>
                  <td>
                    <select className="vg-input" value={p.role} aria-label="Rôle" onChange={(e) => participant(p.id, { role: e.target.value as Participant["role"] })}>
                      <option value="eleve">Élève</option>
                      <option value="accompagnateur">Accompagnateur</option>
                    </select>
                  </td>
                  <td>
                    <Texte value={p.classe} titre="Classe" onChange={(classe) => participant(p.id, { classe })} />
                  </td>
                  <td>
                    <select className="vg-input" value={p.chambreId || ""} aria-label="Chambre" onChange={(e) => participant(p.id, { chambreId: e.target.value || null })}>
                      <option value="">Sans chambre</option>
                      {d.chambres.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom} ({occupants(c.id)}/{c.capacite})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <Texte value={p.remarque} titre="Remarque" placeholder="Régime, précision" onChange={(remarque) => participant(p.id, { remarque })} />
                  </td>
                  <td className="vg-droite">
                    <button type="button" className="vg-icone vg-danger" title="Retirer de la liste" onClick={() => maj((x) => ({ ...x, participants: x.participants.filter((y) => y.id !== p.id) }))}>
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Bloc>

      {apercu ? <Apercu url={apercu} titre="Feuille de route" fermer={() => setApercu(null)} /> : null}
    </>
  );
}
