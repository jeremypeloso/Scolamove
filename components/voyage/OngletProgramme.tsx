"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ajouterEtape,
  ajouterJour,
  chiffrerEtape,
  completerJours,
  deplacer,
  majEtape,
  majJour,
  majPrestation,
  supprimerEtape,
  supprimerJour,
} from "@/lib/voyage/actions";
import { duree, euros } from "@/lib/voyage/calcul";
import { nouveauJour, TYPES_ETAPE } from "@/lib/voyage/defaults";
import { dateDuJour, formatJour, joursManquants } from "@/lib/voyage/programme";
import type { TypeEtape } from "@/lib/voyage/types";
import { Bloc, Nombre, Texte, Zone } from "./champs";
import type { PropsOnglet } from "./props";

type SejourCatalogue = {
  id: string;
  title: string;
  country: string;
  program: { day: string; title: string; text: string }[] | null;
};

const AJOUTS_RAPIDES: { type: TypeEtape; label: string; libelle: string }[] = [
  { type: "visite", label: "Visite", libelle: "" },
  { type: "repas", label: "Repas", libelle: "Déjeuner" },
  { type: "trajet", label: "Trajet", libelle: "" },
  { type: "libre", label: "Temps libre", libelle: "Temps libre" },
  { type: "rdv", label: "Rendez-vous", libelle: "" },
];

export function OngletProgramme({ d, maj, calcul }: PropsOnglet) {
  const [catalogue, setCatalogue] = useState<SejourCatalogue[]>([]);
  const [sejourChoisi, setSejourChoisi] = useState("");
  const manquants = joursManquants(d);

  useEffect(() => {
    supabase
      .from("sejours")
      .select("id, title, country, program")
      .order("title", { ascending: true })
      .then(({ data }) => setCatalogue((data || []) as SejourCatalogue[]));
  }, []);

  function importerSejour() {
    const sejour = catalogue.find((s) => s.id === sejourChoisi);
    if (!sejour) return;
    if (d.programme.length > 0 && !window.confirm("Remplacer le programme actuel par celui du catalogue ?")) return;
    maj((x) => ({
      ...x,
      titre: x.titre || sejour.title,
      sejourCatalogueId: sejour.id,
      // Les étapes chiffrées de l'ancien programme disparaissent avec lui.
      prestations: x.prestations.filter((p) => !x.programme.some((j) => j.etapes.some((e) => e.prestationId === p.id))),
      programme: (sejour.program || []).map((p) => nouveauJour({ titre: p.title || "", resume: p.text || "" })),
    }));
  }

  return (
    <>
      <Bloc
        titre="Programme jour par jour"
        note="Le devis reprend les titres, les textes et les étapes. La feuille de route y ajoute les horaires et les lieux."
        actions={
          <>
            <select className="vg-input vg-input-auto" value={sejourChoisi} onChange={(e) => setSejourChoisi(e.target.value)}>
              <option value="">Partir d&apos;un séjour du catalogue</option>
              {catalogue.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.country ? `${s.country} : ` : ""}
                  {s.title}
                </option>
              ))}
            </select>
            <button type="button" className="vg-btn" disabled={!sejourChoisi} onClick={importerSejour}>
              Importer
            </button>
          </>
        }
      >
        {d.programme.length === 0 ? (
          <div className="vg-vide">
            <p>Aucun jour pour l&apos;instant.</p>
            {duree(d).jours > 0 ? (
              <button type="button" className="vg-btn vg-btn-plein" onClick={() => maj(completerJours)}>
                Créer les {duree(d).jours} jours du voyage
              </button>
            ) : (
              <button type="button" className="vg-btn vg-btn-plein" onClick={() => maj(ajouterJour)}>
                Ajouter un jour
              </button>
            )}
          </div>
        ) : null}

        {d.programme.map((jour, index) => (
          <article key={jour.id} className="vg-jour">
            <div className="vg-jour-tete">
              <span className="vg-jour-num">Jour {index + 1}</span>
              <span className="vg-jour-date">{formatJour(dateDuJour(d, index))}</span>
              <Texte
                className="vg-jour-titre"
                value={jour.titre}
                onChange={(titre) => maj((x) => majJour(x, jour.id, { titre }))}
                placeholder="Titre de la journée"
              />
              <span className="vg-outils">
                <button type="button" className="vg-icone" title="Monter" disabled={index === 0} onClick={() => maj((x) => ({ ...x, programme: deplacer(x.programme, index, -1) }))}>
                  ↑
                </button>
                <button type="button" className="vg-icone" title="Descendre" disabled={index === d.programme.length - 1} onClick={() => maj((x) => ({ ...x, programme: deplacer(x.programme, index, 1) }))}>
                  ↓
                </button>
                <button
                  type="button"
                  className="vg-icone vg-danger"
                  title="Supprimer ce jour"
                  onClick={() => {
                    if (window.confirm(`Supprimer le jour ${index + 1} et ses étapes ?`)) maj((x) => supprimerJour(x, jour.id));
                  }}
                >
                  ×
                </button>
              </span>
            </div>

            {jour.etapes.length > 0 ? (
              <div className="vg-etapes">
                {jour.etapes.map((etape, k) => {
                  const prestation = d.prestations.find((p) => p.id === etape.prestationId);
                  return (
                    <div key={etape.id} className="vg-etape">
                      <div className="vg-etape-ligne">
                        <Texte className="vg-heure" type="time" value={etape.heure} titre="Heure" onChange={(heure) => maj((x) => majEtape(x, jour.id, etape.id, { heure }))} />
                        <select
                          className="vg-input vg-type"
                          value={etape.type}
                          aria-label="Type d'étape"
                          onChange={(e) => maj((x) => majEtape(x, jour.id, etape.id, { type: e.target.value as TypeEtape }))}
                        >
                          {TYPES_ETAPE.map((t) => (
                            <option key={t.cle} value={t.cle}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        <Texte className="vg-libelle" value={etape.libelle} placeholder="Étape" onChange={(libelle) => maj((x) => majEtape(x, jour.id, etape.id, { libelle }))} />
                        <Texte className="vg-lieu" value={etape.lieu} placeholder="Lieu, point de rendez-vous" onChange={(lieu) => maj((x) => majEtape(x, jour.id, etape.id, { lieu }))} />
                        <span className="vg-outils">
                          {!prestation ? (
                            <button type="button" className="vg-btn vg-btn-mini" title="Ajouter cette étape à la cotation" onClick={() => maj((x) => chiffrerEtape(x, jour.id, etape.id))}>
                              Chiffrer
                            </button>
                          ) : null}
                          <button type="button" className="vg-icone" title="Monter" disabled={k === 0} onClick={() => maj((x) => majJour(x, jour.id, { etapes: deplacer(jour.etapes, k, -1) }))}>
                            ↑
                          </button>
                          <button type="button" className="vg-icone" title="Descendre" disabled={k === jour.etapes.length - 1} onClick={() => maj((x) => majJour(x, jour.id, { etapes: deplacer(jour.etapes, k, 1) }))}>
                            ↓
                          </button>
                          <button type="button" className="vg-icone vg-danger" title="Supprimer l'étape" onClick={() => maj((x) => supprimerEtape(x, jour.id, etape.id))}>
                            ×
                          </button>
                        </span>
                      </div>
                      <div className="vg-etape-suite">
                        <Texte value={etape.detail} placeholder="Précision pour le groupe (facultatif)" onChange={(detail) => maj((x) => majEtape(x, jour.id, etape.id, { detail }))} />
                        {prestation ? (
                          <span className="vg-etape-prix">
                            {prestation.mode === "groupe" ? (
                              <>
                                <Nombre value={prestation.quantite} titre="Quantité" onChange={(quantite) => maj((x) => majPrestation(x, prestation.id, { quantite }))} suffixe="×" />
                                <Nombre value={prestation.prixGroupe} titre="Prix unitaire" onChange={(prixGroupe) => maj((x) => majPrestation(x, prestation.id, { prixGroupe }))} suffixe="€ forfait" />
                              </>
                            ) : (
                              <>
                                <Nombre value={prestation.prixEleve} titre="Prix par élève" onChange={(prixEleve) => maj((x) => majPrestation(x, prestation.id, { prixEleve }))} suffixe="€ élève" />
                                <Nombre value={prestation.prixAdulte} titre="Prix par adulte" onChange={(prixAdulte) => maj((x) => majPrestation(x, prestation.id, { prixAdulte }))} suffixe="€ adulte" />
                              </>
                            )}
                            <button
                              type="button"
                              className="vg-lien"
                              onClick={() => maj((x) => majPrestation(x, prestation.id, { mode: prestation.mode === "groupe" ? "personne" : "groupe" }))}
                            >
                              {prestation.mode === "groupe" ? "par personne" : "au forfait"}
                            </button>
                            <strong>{euros(calcul.lignes[prestation.id]?.revient || 0)}</strong>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <div className="vg-jour-pied">
              <span className="vg-ajouts">
                {AJOUTS_RAPIDES.map((a) => (
                  <button key={a.type} type="button" className="vg-btn vg-btn-mini" onClick={() => maj((x) => ajouterEtape(x, jour.id, a.type, a.libelle))}>
                    + {a.label}
                  </button>
                ))}
              </span>
              <label className="vg-nuit">
                <span>Nuit</span>
                <Texte value={jour.nuit} placeholder="Hôtel, ville, ou nuit à bord" onChange={(nuit) => maj((x) => majJour(x, jour.id, { nuit }))} />
              </label>
            </div>

            <details className="vg-resume" open={Boolean(jour.resume) && jour.etapes.length === 0}>
              <summary>Texte de présentation pour le devis{jour.resume ? "" : " (facultatif)"}</summary>
              <Zone value={jour.resume} lignes={3} onChange={(resume) => maj((x) => majJour(x, jour.id, { resume }))} placeholder="Quelques lignes pour donner envie : ce que le groupe découvre ce jour-là." />
            </details>
          </article>
        ))}

        {d.programme.length > 0 ? (
          <div className="vg-actions vg-actions-bas">
            <button type="button" className="vg-btn" onClick={() => maj(ajouterJour)}>
              Ajouter un jour
            </button>
            {manquants > 0 ? (
              <button type="button" className="vg-btn" onClick={() => maj(completerJours)}>
                Compléter jusqu&apos;au jour {duree(d).jours}
              </button>
            ) : null}
          </div>
        ) : null}
      </Bloc>
    </>
  );
}
